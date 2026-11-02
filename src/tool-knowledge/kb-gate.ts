/**
 * Local patch: workspace invocation gate for the knowledge tools.
 *
 * The decision comes from the durable allow-list (`knowledge.getWorkspacePaths()`),
 * not from hard-coded paths:
 *   `[]`  - no workspace is allowed (fail closed)
 *   `["*"]` - every workspace is allowed
 *   explicit paths - exact match against the current session cwd
 *
 * Every decision is appended to `<DSH_HOME>/kb-scope-whitelist.probe.log` as one
 * JSON line so a wrong gate can be diagnosed after the fact. The probe is
 * best-effort: a failed append never breaks the gate itself. The file rotates to
 * `.1` at 100 MB (see {@link KB_PROBE_MAX_BYTES}), so it cannot grow without bound.
 */

import { appendFileSync, renameSync, rmSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { KnowledgeService } from '../knowledge/index.js'

const KB_SEP = String.fromCharCode(92)

const KB_PROBE_LOG = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'kb-scope-whitelist.probe.log')

/**
 * Rotate the probe log once it grows past this size.
 *
 * The probe appends on every gate decision — several thousand lines a day at this
 * machine's usage — and nothing else trims it. 100 MB is roughly three months of
 * history: far more than any diagnosis needs, while still bounding the file. On
 * rotation the current file becomes `<log>.1` and the previous `.1` is dropped, so
 * exactly two generations exist.
 */
const KB_PROBE_MAX_BYTES = 100 * 1024 * 1024

/** Rotation is checked once per this many appends, so it costs no stat per call. */
const KB_PROBE_CHECK_EVERY = 200

let kbProbeAppends = 0

/** Normalize a directory path to `\\`-separated, no trailing separator, lowercase. */
function kbNormPath(value: unknown): string {
  let v = String(value == null ? '' : value)
  const segs: string[] = []
  for (const seg of v.split('/')) for (const sub of seg.split(KB_SEP)) segs.push(sub)
  v = segs.join(KB_SEP)
  while (v.length > 0 && v.charAt(v.length - 1) === KB_SEP) v = v.slice(0, v.length - 1)
  return v.toLowerCase()
}

/** Read the session cwd defensively; any shape mismatch reads as "unknown". */
function kbSafeCwd(agent: unknown): string | null {
  try {
    const cwd = (agent as { session?: { header?: { cwd?: unknown } } })?.session?.header?.cwd
    return typeof cwd === 'string' && cwd.length > 0 ? cwd : null
  } catch {
    return null
  }
}

/**
 * Rotate `path` to `path.1` once it exceeds {@link KB_PROBE_MAX_BYTES}.
 *
 * Best-effort like the rest of the probe: any failure leaves the current file in
 * place and never touches the gate's decision.
 */
function kbRotateProbeIfNeeded(path: string): void {
  try {
    kbProbeAppends += 1
    if (kbProbeAppends % KB_PROBE_CHECK_EVERY !== 0) return
    let size: number
    try {
      size = statSync(path).size
    } catch {
      return // no file yet
    }
    if (size < KB_PROBE_MAX_BYTES) return
    try {
      rmSync(path + '.1', { force: true })
    } catch {
      // A locked previous generation must not block this rotation.
    }
    try {
      renameSync(path, path + '.1')
    } catch {
      // Keep the oversized file rather than lose the newest tail.
    }
  } catch {
    // Observability must never affect the gate.
  }
}

function kbProbe(site: string, agent: unknown, result: boolean, detail: string): void {
  try {
    const cwd = kbSafeCwd(agent)
    const row = JSON.stringify({
      ts: new Date().toISOString(),
      site,
      cwd,
      norm: cwd === null ? null : kbNormPath(cwd),
      result,
      detail,
    })
    kbRotateProbeIfNeeded(KB_PROBE_LOG)
    try {
      appendFileSync(KB_PROBE_LOG, row + String.fromCharCode(10))
    } catch {
      // the probe never decides the gate
    }
    const ring = globalThis as typeof globalThis & { __kbScopeProbe?: string[] }
    ring.__kbScopeProbe ??= []
    ring.__kbScopeProbe.push(row)
    if (ring.__kbScopeProbe.length > 500) ring.__kbScopeProbe.shift()
  } catch {
    // swallow everything: an observability helper must not change behavior
  }
}

/**
 * May the knowledge base be invoked in the session's workspace?
 *
 * Fails closed on every unknown: no cwd, an empty allow-list, a store that is not
 * ready, or a path that is not listed. Only that last case is a user decision; the
 * first three are safety defaults.
 */
export function kbAllowedHere(knowledge: KnowledgeService, agent: unknown, site: string): boolean {
  const cwd = kbSafeCwd(agent)
  if (cwd === null) {
    kbProbe(site, agent, false, 'no-cwd')
    return false
  }
  try {
    const ok = knowledge.workspaceAllowed(cwd)
    kbProbe(site, agent, ok, ok ? 'allowed' : 'not-in-list')
    return ok
  } catch (error) {
    kbProbe(site, agent, false, 'store-error:' + ((error as Error)?.message ?? String(error)))
    return false
  }
}