/**
 * Workspace-scoped tool visibility gate for the knowledge tools.
 *
 * The knowledge tool surface is registered globally, so every agent inherits all
 * eight schemas whether or not its workspace may use them. This module hides the
 * schemas from agents whose workspace is closed: `restrict({ deny })` on the
 * agent's own scoped context removes them from the assembled request, so a closed
 * workspace stops paying for them.
 *
 * Three properties matter and are each load-bearing:
 *
 * 1. Nothing here may throw. `agent/created` is dispatched through cordis
 *    `serial`, whose upstream call is awaited by the agent factory, so a throwing
 *    listener fails agent creation outright and the user cannot open a session.
 *    That applies to the failure path too: the handler for a thrown value must
 *    survive whatever was thrown, including revoked proxies, throwing getters,
 *    null prototypes, and non-Error values.
 * 2. A normal closed workspace is silent. Only a *failure* of the gate itself is
 *    reported; hiding on purpose must not cost a single token or nag the model.
 * 3. The reported text cannot break prompt assembly — enforced by
 *    {@link module:dsh-knowledge/tool-knowledge/workspace-tools-text}.
 *
 * Text safety lives in `workspace-tools-text.ts` and the Cordis glue in
 * `workspace-tools-wiring.ts`; this module is only the decision.
 *
 * @module dsh-knowledge/tool-knowledge/workspace-tools-gate
 */

import {
  KB_GATE_ERROR_MAX_CHARS,
  KB_GATE_FALLBACK_CAUSE,
  kbDrainThenable,
  kbSafeErrorMessage,
  kbSanitizePromptText,
  kbTruncatePromptText,
} from './workspace-tools-text.js'

/**
 * Every tool this plugin registers, in registration order.
 *
 * `restrict()` rejects unknown names by throwing, so this list must stay exactly
 * in step with the registrations in `./index.js`. A stale entry does NOT degrade
 * to "nothing hidden": it makes every closed-workspace agent report a failure
 * instead of hiding anything.
 */
export const KB_TOOL_NAMES: readonly string[] = [
  'knowledge_search',
  'knowledge_list_bases',
  'knowledge_list_documents',
  'knowledge_stats',
  'knowledge_get_document',
  'knowledge_read_evidence',
  'knowledge_read_document',
  'knowledge_reindex_document',
]

/** Coordinates the per-agent tool hiding and the resulting failure report. */
export interface WorkspaceToolGate {
  /**
   * Apply the visibility decision for one freshly created agent.
   *
   * Called from an `agent/created` listener and therefore must never throw, for
   * any thrown value the workspace decision or the restriction can produce.
   */
  handleAgentCreated(agent: unknown): void
  /**
   * Prompt-safe diagnostic text; `''` while healthy.
   *
   * The returned string has already been sanitized, so it is the ONLY text this
   * module produces that may be handed to a prompt section verbatim.
   *
   * @param agent - the agent whose assembly is being rendered. Pass the same
   *   agent the section callback received so one session never reports another
   *   session's failure. Omit only for diagnostics, where the most recent
   *   failure is returned.
   */
  errorSectionText(agent?: unknown): string
  /**
   * Latest failure cause, or `undefined` while healthy. For logging only.
   *
   * Sanitized and bounded like {@link errorSectionText}, minus the wrapper
   * sentence, and therefore safe to log but not to hand to a prompt section —
   * use {@link errorSectionText} for that.
   *
   * @param agent - the agent to read; omit for the most recent failure.
   */
  currentFailure(agent?: unknown): string | undefined
  /** Clear recorded state; test seam and recovery path. */
  reset(): void
}

/** Injected collaborators, kept explicit so the gate is testable in isolation. */
export interface WorkspaceToolGateOptions {
  /**
   * Workspace decision for one agent, mirroring `kbAllowedHere`.
   *
   * Only an exact `true` permits the tools. Anything else — including a truthy
   * promise from an async implementation — is treated as closed, because a
   * silently allowed workspace exposes the tools with no report at all.
   */
  allowedHere: (agent: unknown, site: string) => boolean
  /** Tool names to hide; defaults to {@link KB_TOOL_NAMES}. Invalid entries are dropped. */
  toolNames?: readonly string[]
  /** Failure-text ceiling; defaults to {@link KB_GATE_ERROR_MAX_CHARS}. */
  maxErrorChars?: number
  /** Failure sink for host logging; never used to decide behavior. */
  onFailure?: (message: string, error: unknown) => void
}

/** Narrow view of the agent surface this module touches. */
interface ScopedAgent {
  ctx?: { tools?: { restrict?: (filter: { deny: string[] }) => unknown } }
}

/**
 * Normalize the deny list.
 *
 * Empty is not a harmless no-op: `restrict({ deny: [] })` is rejected by the
 * tools runtime, so an empty list would turn every closed workspace into a
 * reported failure. Falling back to the full list keeps the intended behavior.
 *
 * Reading a hostile array (throwing iterator, throwing length getter) must not
 * fail plugin construction, so the whole scan is defensive.
 */
function normalizeToolNames(value: readonly string[] | undefined): string[] {
  try {
    if (!Array.isArray(value)) return [...KB_TOOL_NAMES]
    const seen = new Set<string>()
    try {
      for (const name of value) if (typeof name === 'string' && name.length > 0) seen.add(name)
    } catch {
      // A throwing iterator: keep whatever was collected.
    }
    return seen.size > 0 ? [...seen] : [...KB_TOOL_NAMES]
  } catch {
    return [...KB_TOOL_NAMES]
  }
}

/** Read a numeric option without letting a throwing getter escape construction. */
function readNumericOption(value: unknown): number | undefined {
  try {
    return typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.floor(value) : undefined
  } catch {
    return undefined
  }
}

/** The `errorSectionText` wrapper, split out so `record` and the reader agree. */
function composeErrorSection(cause: string): string {
  return kbSanitizePromptText(
    'KNOWLEDGE PLUGIN ERROR \u2014 the workspace gate failed: ' + cause
      + '. Knowledge tools may be hidden or unusable in this session. '
      + 'Tell the user that the knowledge base reported an error and quote this message.',
  )
}

/**
 * Build the workspace tool gate.
 *
 * @param options - workspace decision, tool list, and failure sink.
 * @returns the gate handle used by the listener and the prompt section.
 */
export function createWorkspaceToolGate(options: WorkspaceToolGateOptions): WorkspaceToolGate {
  // Options are read once, defensively: plugin construction failure is a heavier
  // outage than one agent failing to restrict, so a hostile option value must
  // degrade to the default rather than throw here.
  let toolNames: string[]
  try {
    toolNames = normalizeToolNames(options?.toolNames)
  } catch {
    toolNames = [...KB_TOOL_NAMES]
  }
  let maxErrorChars = KB_GATE_ERROR_MAX_CHARS
  try {
    maxErrorChars = readNumericOption(options?.maxErrorChars) ?? KB_GATE_ERROR_MAX_CHARS
  } catch {
    maxErrorChars = KB_GATE_ERROR_MAX_CHARS
  }

  // Failure text is stored per agent: the prompt section renders inside one
  // agent's assembly, so a shared cell would report another session's failure to
  // a healthy one, and a later healthy agent would erase a still-broken
  // session's notice. Values that cannot key a WeakMap fall back to one cell.
  const failuresByAgent = new WeakMap<object, string>()
  let detachedFailure: string | undefined
  let recentFailure: string | undefined

  const isKeyable = (value: unknown): value is object =>
    (typeof value === 'object' && value !== null) || typeof value === 'function'

  const setFailure = (agent: unknown, text: string | undefined): void => {
    // `recentFailure` mirrors the outcome of the most recent call so the no-arg
    // accessor used by logging reflects the latest decision rather than a stale
    // one.
    recentFailure = text
    if (isKeyable(agent)) {
      if (text === undefined) failuresByAgent.delete(agent)
      else failuresByAgent.set(agent, text)
      return
    }
    detachedFailure = text
  }

  const failureFor = (agent: unknown): string | undefined =>
    isKeyable(agent) ? failuresByAgent.get(agent) : detachedFailure

  /**
   * Record one failure. Never throws: this runs inside the catch that is already
   * handling somebody else's exception, so a second failure here would escape the
   * listener and abort agent creation.
   *
   * `site` names the step that failed and is used only for the log line; the
   * stored cause stays bare so a diagnostic read of `currentFailure()` returns
   * the underlying message rather than a composed sentence.
   */
  const record = (agent: unknown, site: string, cause: string, error: unknown): void => {
    let text: string
    try {
      text = kbTruncatePromptText(kbSanitizePromptText(cause), maxErrorChars)
      if (text.length === 0) text = KB_GATE_FALLBACK_CAUSE
    } catch {
      text = KB_GATE_FALLBACK_CAUSE
    }
    try {
      setFailure(agent, text)
    } catch {
      // Recording must not decide control flow.
    }
    try {
      options?.onFailure?.('[' + site + '] ' + text, error)
    } catch {
      // A logging sink must not change control flow.
    }
  }

  /**
   * Hide the tools from one agent's scope.
   *
   * Returns the failure cause on failure, or `undefined` on success, so the
   * caller owns all the reporting and this stays a single concern.
   */
  const applyRestriction = (agent: unknown): { site: string; cause: string; error: unknown } | undefined => {
    let scoped: unknown
    try {
      scoped = (agent as ScopedAgent | undefined)?.ctx?.tools
    } catch (error) {
      return { site: 'agent.ctx.tools', cause: kbSafeErrorMessage(error), error }
    }
    let restrict: unknown
    try {
      restrict = (scoped as { restrict?: unknown } | undefined)?.restrict
    } catch (error) {
      return { site: 'agent.ctx.tools.restrict', cause: kbSafeErrorMessage(error), error }
    }
    if (typeof restrict !== 'function') {
      return { site: 'restrict-missing', cause: 'agent.ctx.tools.restrict is unavailable', error: undefined }
    }
    try {
      // Hand out a copy: a host that mutates the array must not poison the list
      // used by every later agent.
      const result = (restrict as (filter: { deny: string[] }) => unknown).call(scoped, { deny: [...toolNames] })
      kbDrainThenable(result)
      return undefined
    } catch (error) {
      return { site: 'restrict', cause: kbSafeErrorMessage(error), error }
    }
  }

  return {
    handleAgentCreated(agent: unknown): void {
      try {
        let allowed: unknown
        try {
          allowed = options?.allowedHere?.(agent, 'agent-created')
        } catch (error) {
          record(agent, 'allowedHere', kbSafeErrorMessage(error), error)
          return
        }
        kbDrainThenable(allowed)
        // Exact true only: a truthy promise would otherwise allow silently.
        if (allowed === true) {
          setFailure(agent, undefined)
          return
        }
        if (allowed !== false) {
          record(
            agent,
            'allowedHere-return',
            'workspace decision returned a non-boolean value: ' + kbSafeErrorMessage(allowed),
            allowed,
          )
          return
        }
        const failed = applyRestriction(agent)
        if (failed !== undefined) {
          record(agent, failed.site, failed.cause, failed.error)
          return
        }
        setFailure(agent, undefined)
      } catch (error) {
        // Last line of defense: nothing above may decide whether a session opens.
        try {
          record(agent, 'gate', kbSafeErrorMessage(error), error)
        } catch {
          // Give up silently rather than fail agent creation.
        }
      }
    },

    errorSectionText(agent?: unknown): string {
      try {
        const cause = agent === undefined ? recentFailure : failureFor(agent)
        return cause === undefined ? '' : composeErrorSection(cause)
      } catch {
        // Losing the notice is far cheaper than failing prompt assembly.
        return ''
      }
    },

    currentFailure(agent?: unknown): string | undefined {
      try {
        return agent === undefined ? recentFailure : failureFor(agent)
      } catch {
        return undefined
      }
    },

    reset(): void {
      detachedFailure = undefined
      recentFailure = undefined
    },
  }
}
