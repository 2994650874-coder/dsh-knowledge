/**
 * Text safety for the workspace gate's failure report.
 *
 * The gate's only model-facing output is one prompt paragraph, and two
 * properties of that paragraph are load-bearing: it must not contain `{{`
 * (the assembler reads that as a variable reference and fails the whole
 * assembly) and it must not exceed its character ceiling or split a surrogate
 * pair. Both rules are enforced here so the gate itself stays about decisions.
 *
 * Every function is total: no input reaches a throw, because the callers run
 * inside failure handling where a second throw would escape `agent/created` and
 * abort session creation.
 *
 * @module dsh-knowledge/tool-knowledge/workspace-tools-text
 */

/** Maximum characters of failure text surfaced to the model. */
export const KB_GATE_ERROR_MAX_CHARS = 300

/** Fallback cause when a thrown value carries no printable message. */
export const KB_GATE_FALLBACK_CAUSE = 'workspace gate threw a value with no message'

/**
 * Neutralize prompt variable interpolation.
 *
 * Rewriting runs to a fixed point: a single pass leaves an overlapping pair in
 * place (`"{{{"` becomes `"{ {{"`), and any text still containing `{{` is a live
 * hazard for whoever picks it up next.
 */
export function kbSanitizePromptText(text: string): string {
  if (typeof text !== 'string' || text.length === 0) return ''
  let current = text
  // Each pass retires at least one pair, so the input length bounds the passes.
  for (let pass = 0; pass <= current.length; pass += 1) {
    const next = current.replace(/\{\{/g, '{ {')
    if (next === current) return current
    current = next
  }
  return current
}

/**
 * Bound text without splitting a surrogate pair.
 *
 * Truncation runs after sanitization, so any `{ {` pair is already safe. The
 * walk back over high surrogates matters for adjacent astral characters, not
 * just one.
 */
export function kbTruncatePromptText(text: string, max: number = KB_GATE_ERROR_MAX_CHARS): string {
  if (typeof text !== 'string' || text.length === 0) return ''
  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0) return ''
  const room = Math.floor(max)
  if (room < 1) return ''
  if (text.length <= room) return text
  // Reserve one character for the ellipsis so the result never exceeds `room`.
  let end = room - 1
  while (end > 0) {
    const code = text.charCodeAt(end - 1)
    if (code < 0xd800 || code > 0xdbff) break
    end -= 1
  }
  if (end < 1) return '\u2026'
  return text.slice(0, end) + '\u2026'
}

/**
 * Read a printable message from an arbitrary thrown value.
 *
 * Deliberately avoids `instanceof Error`: that operator runs `Symbol.hasInstance`,
 * which a proxy can make throw, and the value in hand is untrusted precisely
 * because it was thrown. `.message` and `String()` are each read defensively for
 * the same reason — either can be a throwing getter.
 */
export function kbSafeErrorMessage(error: unknown): string {
  try {
    if ((typeof error === 'object' && error !== null) || typeof error === 'function') {
      let raw: unknown
      try {
        raw = (error as { message?: unknown }).message
      } catch {
        raw = undefined
      }
      if (typeof raw === 'string' && raw.length > 0) return raw
    }
  } catch {
    // Fall through to String() below.
  }
  try {
    const text = String(error)
    if (typeof text !== 'string' || text.length === 0) return KB_GATE_FALLBACK_CAUSE
    // `String(new Error())` yields "Error" and friends: no information at all.
    if (/^(?:Error|TypeError|RangeError|SyntaxError|ReferenceError|EvalError|URIError)$/.test(text)) {
      return KB_GATE_FALLBACK_CAUSE
    }
    return text
  } catch {
    return KB_GATE_FALLBACK_CAUSE
  }
}

/**
 * Drain a thenable so a rejection cannot escape as an unhandled one.
 *
 * Nothing awaits the value this is called on, so a rejected promise would reach
 * the process boundary and, under Node's default policy, terminate it. Used for
 * the results of `allowedHere` and `restrict`, which are synchronous today but
 * are not contractually so.
 */
export function kbDrainThenable(value: unknown): void {
  try {
    if ((typeof value !== 'object' && typeof value !== 'function') || value === null) return
    if (typeof (value as { then?: unknown }).then !== 'function') return
    void Promise.resolve(value as PromiseLike<unknown>).then(undefined, () => {})
  } catch {
    // A thenable that throws on .then is already handled by the caller's catch.
  }
}
