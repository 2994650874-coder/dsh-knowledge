/**
 * Wiring between the workspace tool gate and the plugin's host surface.
 *
 * Kept separate from `workspace-tools-gate.ts` so the decision logic stays
 * testable without a Cordis context, and the glue that touches real plugin
 * services can be tested on its own.
 *
 * Only two things happen here:
 *
 * 1. Every created agent is asked for its tool visibility decision.
 * 2. A prompt section publishes a gate failure, if one is current.
 *
 * @module dsh-knowledge/workspace-tools-wiring
 */

import { kbDrainThenable } from './workspace-tools-text.js'
import type { WorkspaceToolGate } from './workspace-tools-gate.js'

/** Prompt section order: directly after `knowledge:usage` (110). */
export const KB_GATE_ERROR_SECTION_ORDER = 112

/** Prompt section name. */
export const KB_GATE_ERROR_SECTION_NAME = 'knowledge:gate-error'

/**
 * Minimal surface of the Cordis context this wiring needs.
 *
 * Structural rather than imported so tests can pass a plain object: the point of
 * this module is to verify the shape of the calls, not to re-test Cordis.
 */
export interface WiringContext {
  on: (event: string, listener: (...args: never[]) => unknown) => unknown
  systemPrompt: {
    section: (entry: {
      name: string
      order: number
      text: (context?: { agent?: unknown }) => string
    }) => unknown
  }
}

/** The `agent/created` payload fields this wiring reads. */
export interface AgentCreatedPayload {
  agent?: unknown
}

/**
 * Read `payload.agent` without trusting the payload.
 *
 * The same payload object is handed to every `agent/created` listener, so an
 * earlier listener can replace `agent` with a throwing accessor or a proxy. A
 * `?.` chain does not help there: optional chaining guards absence, not a read
 * that throws or a value that is not a function.
 */
function readAgent(payload: unknown): unknown {
  try {
    if (typeof payload !== 'object' || payload === null) return undefined
    return (payload as AgentCreatedPayload).agent
  } catch {
    return undefined
  }
}

/**
 * Normalize a section payload to a string.
 *
 * The assembler concatenates and interpolates whatever this returns; a non-string
 * makes its own `.indexOf` throw and takes down prompt assembly for the step.
 */
function readSectionText(gate: WorkspaceToolGate, context: unknown): string {
  try {
    let agent: unknown
    try {
      agent = (typeof context === 'object' && context !== null)
        ? (context as { agent?: unknown }).agent
        : undefined
    } catch {
      agent = undefined
    }
    const text = gate?.errorSectionText(agent)
    return typeof text === 'string' ? text : ''
  } catch {
    // A throwing section callback aborts prompt assembly for the whole step.
    return ''
  }
}

/**
 * Attach the gate to a plugin context.
 *
 * Both callbacks are entirely wrapped. That is not belt-and-braces: the listener
 * runs under `serial` with its result awaited, so a throw aborts agent creation,
 * and the section callback runs inside prompt assembly, so a throw loses the
 * whole step's prompt.
 *
 * Registration order matters: the section goes in FIRST. A duplicate section name
 * throws before any listener exists, so a repeated call fails cleanly instead of
 * leaving an orphaned listener that would restrict every agent twice. Registering
 * the section first is also what makes hot reload work — the previous fiber's
 * registrations are gone by then, so the name is free again.
 */
export function wireWorkspaceToolGate(ctx: WiringContext, gate: WorkspaceToolGate): void {
  if (typeof ctx !== 'object' || ctx === null) return

  ctx.systemPrompt.section({
    name: KB_GATE_ERROR_SECTION_NAME,
    order: KB_GATE_ERROR_SECTION_ORDER,
    text: (context?: unknown) => readSectionText(gate, context),
  })

  ctx.on('agent/created', (payload: AgentCreatedPayload) => {
    try {
      const agent = readAgent(payload)
      kbDrainThenable(gate?.handleAgentCreated(agent))
    } catch {
      // Never let a listener throw: agent creation is awaiting this dispatch.
    }
  })
}
