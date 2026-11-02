/**
 * Build provenance shown in the panel header.
 *
 * The panel is a local fork of an upstream plugin, so the version alone does not
 * say whether the running build contains the local changes. This marker pairs the
 * version with the date of the newest local change, which makes an upstream
 * update (or a reinstall) visible at a glance: the version may match while the
 * date has gone stale, and a stale date means `lib/` no longer carries the local
 * patches.
 *
 * **Every local change to this plugin must update `LOCAL_MODIFIED`** to the date
 * of that change. This file is plain source, so an update that overwrites `lib/`
 * restores the last committed date rather than losing the marker entirely.
 *
 * @module dsh-knowledge/client/build-info
 */

/**
 * Version baked in by `build.mjs` from `package.json`.
 *
 * Injected through esbuild `define`, so the value always belongs to the build it
 * was compiled into — a stale `lib/` cannot claim a version it was not built from.
 * The declaration below is the only place the identifier exists in source.
 */
declare const __KB_LOCAL_VERSION__: string

/** Local fork modification date, `YYYY-MM-DD`. Update on every local change. */
export const LOCAL_MODIFIED = '2026-11-02'

/** Marker prefix rendered before the date. */
export const LOCAL_MARK_PREFIX = '本地改'

/** Resolved version, with a defensive fallback for a define-less build. */
export const KB_LOCAL_VERSION: string =
  typeof __KB_LOCAL_VERSION__ === 'string' ? __KB_LOCAL_VERSION__ : '?'

/** Compose the date half of the pill: `本地改 2026-11-02`. */
export function localMarkLabel(modified: string = LOCAL_MODIFIED): string {
  return `${LOCAL_MARK_PREFIX} ${modified}`
}
