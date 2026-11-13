/**
 * Runtime dependency self-healing for 'dsh-knowledge'.
 *
 * Why this exists: under a 'link:' install (the supported form, see the manual's
 * §8.4) the plugin lives in '~/.dsh/plugin-src/dsh-knowledge' and resolves bare
 * specifiers by walking *up* from that directory. The DSH host packages
 * ('@deepseek-ai/cordis', 'dsh-tools', 'dsh-storage-domain', …) physically live
 * inside 'resources/app.asar', which only Electron's patched 'require' can read —
 * so a plain Node resolution from 'plugin-src' finds nothing. On top of that,
 * 'zod' and 'undici' are real npm packages the installer does not fetch for a
 * 'link:' dependency.
 *
 * Rather than ask the user to run a setup script, the very first load repairs
 * itself: missing packages are extracted out of 'app.asar' (or copied from
 * 'app.asar.unpacked') into this package's own 'node_modules', where Node's
 * upward search will then find them. Extraction is idempotent and gated on
 * existence, so every later start is a handful of 'stat' calls.
 *
 * The specifier list is not hard-coded: 'build.mjs' writes
 * 'lib/bootstrap/manifest.json' from the emitted bundles' actual external
 * imports, so a future source change cannot silently fall out of sync.
 *
 * @module dsh-knowledge/bootstrap/heal
 */

import { createRequire } from 'node:module'
import { closeSync, cpSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Upper bound on files read per provisioned package while hunting transitive
 * imports. Startup must stay fast; every host package here is well under this.
 */
const MAX_SCAN_FILES = 400

/** Package names that live inside 'app.asar' and must be extracted on demand. */
interface AsarReader {
  close(): void
  /** Extract 'asarPath' (a directory node) into 'outDir'. Returns file count. */
  extract(asarPath: string, outDir: string): number
}

/**
 * Minimal 'app.asar' reader.
 *
 * Electron puts a JSON header at the head of the archive describing every entry
 * as either a directory ('files') or a leaf ('offset' + 'size' into the data
 * section). That is enough to copy bytes out without depending on the 'asar'
 * package — which is exactly what we cannot assume is installed.
 */
function openAsar(asarPath: string): AsarReader | undefined {
  let fd: number
  try {
    fd = openSync(asarPath, 'r')
  } catch {
    return undefined
  }
  try {
    const head = Buffer.alloc(16)
    readSync(fd, head, 0, 16, 0)
    // Layout: uint32 size-pickle, uint32 header-size-pickle, then the header.
    const headerSize = head.readUInt32LE(4)
    const block = Buffer.alloc(headerSize)
    readSync(fd, block, 0, headerSize, 8)
    const stringLength = block.readUInt32LE(4)
    const header = JSON.parse(block.subarray(8, 8 + stringLength).toString('utf8'))
    const dataOffset = 8 + headerSize

    const find = (slashPath: string): any => {
      let node: any = header
      for (const segment of slashPath.split('/').filter(Boolean)) {
        node = (node?.files ?? {})[segment]
        if (!node) return undefined
      }
      return node
    }

    return {
      close() {
        closeSync(fd)
      },
      extract(asarPathInArchive: string, outDir: string): number {
        const root = find(asarPathInArchive)
        if (!root) return -1
        let files = 0
        const walk = (node: any, relative: string): void => {
          if (node.files) {
            for (const [name, child] of Object.entries<any>(node.files)) {
              walk(child, relative + '/' + name)
            }
            return
          }
          if (node.offset === undefined || typeof node.size !== 'number') return
          const out = join(outDir, relative)
          mkdirSync(dirname(out), { recursive: true })
          const buffer = Buffer.alloc(node.size)
          readSync(fd, buffer, 0, node.size, dataOffset + Number(node.offset))
          writeFileSync(out, buffer)
          files += 1
        }
        walk(root, '')
        return files
      },
    }
  } catch {
    try {
      closeSync(fd)
    } catch {
      /* already closed */
    }
    return undefined
  }
}

/** '@scope/name' for a scoped specifier, 'name' otherwise; undefined for paths. */
export function packageNameOf(specifier: string): string | undefined {
  if (!specifier) return undefined
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) return undefined
  if (specifier.startsWith('file:') || specifier.startsWith('data:')) return undefined
  if (specifier.includes('\\') || /^[A-Za-z]:/.test(specifier)) return undefined
  const parts = specifier.split('/')
  if (specifier.startsWith('@')) return parts.length >= 2 ? parts.slice(0, 2).join('/') : undefined
  return parts[0]
}

/**
 * Candidate 'app.asar' locations, most specific first.
 *
 * Inside Electron 'process.resourcesPath' is authoritative. A plain Node process
 * has no such property, which is how the offline verification harness runs, so
 * two fallbacks follow: the conventional '<exe dir>/resources/app.asar', and a
 * walk up from the executable looking for a sibling resources/app.asar. The walk
 * covers a DSH tree whose layout is not the standard one, and is bounded so it
 * can never scan a whole drive.
 */
function asarCandidates(): string[] {
  const out: string[] = []
  const resources = (process as unknown as { resourcesPath?: string }).resourcesPath
  if (typeof resources === 'string' && resources.length > 0) {
    out.push(join(resources, 'app.asar'))
  }

  let exeDir = ''
  try {
    exeDir = dirname(process.execPath)
    out.push(join(exeDir, 'resources', 'app.asar'))
  } catch {
    /* execPath can be odd in embedded runtimes */
  }

  // Walk up a few levels from the executable, checking each sibling resources dir.
  if (exeDir.length > 0) {
    let cursor = exeDir
    for (let depth = 0; depth < 4; depth += 1) {
      out.push(join(cursor, 'resources', 'app.asar'))
      const parent = dirname(cursor)
      if (parent === cursor) break
      cursor = parent
    }
  }

  return [...new Set(out)].filter(candidate => {
    try {
      return existsSync(candidate)
    } catch {
      return false
    }
  })
}

/**
 * Where a package can be copied from verbatim, when Electron unpacked it out of
 * the archive because it contains native binaries. Same discovery order as
 * asarCandidates, plus the sibling .unpacked directory convention.
 */
function unpackedCandidates(): string[] {
  const out: string[] = []
  const roots: string[] = []

  const resources = (process as unknown as { resourcesPath?: string }).resourcesPath
  if (typeof resources === 'string' && resources.length > 0) roots.push(resources)

  try {
    const exeDir = dirname(process.execPath)
    roots.push(join(exeDir, 'resources'))
    let cursor = exeDir
    for (let depth = 0; depth < 4; depth += 1) {
      roots.push(join(cursor, 'resources'))
      const parent = dirname(cursor)
      if (parent === cursor) break
      cursor = parent
    }
  } catch {
    /* ignore */
  }

  for (const resourcesDir of roots) {
    out.push(join(resourcesDir, 'app.asar.unpacked', 'dsh', 'node_modules'))
  }
  return [...new Set(out)].filter(candidate => {
    try {
      return existsSync(candidate)
    } catch {
      return false
    }
  })
}

export interface HealResult {
  /** Package names copied out of the archive. */
  extracted: string[]
  /** Specifiers that could not be satisfied (left for the caller to report). */
  unresolved: string[]
}

export interface HealOptions {
  /** Package root URL, e.g. 'new URL('../../', import.meta.url)'. */
  root: URL
  /** Specifiers to guarantee, usually read from the generated manifest. */
  specifiers: readonly string[]
}

/**
 * Make every specifier resolvable from this package.
 *
 * Fast path: 'require.resolve' succeeds AND loading it works, so nothing is
 * touched. Slow path: the package is copied from 'app.asar.unpacked' (plain
 * files) or extracted from 'app.asar' into the package root node_modules, which
 * sits on the upward search path of every file in the bundle.
 *
 * Resolution alone is not enough to call a package usable. A sibling
 * 'plugin-src/node_modules/@deepseek-ai/*' shim resolves fine but loads through
 * 'createRequire' against a path inside app.asar, which only Electron's patched
 * require can read; from a plain Node context it throws "Cannot find module
 * F:/.../app.asar/...". Those shims also shadow anything we provision, because
 * the upward search reaches plugin-src before the package root. So a candidate
 * counts as satisfied only when it both resolves and imports, and an extracted
 * copy under this package wins over a broken shim.
 *
 * Provisioning is recursive: an extracted host package keeps importing its own
 * neighbours (cordis needs cosmokit, dsh-tools needs schemastery and
 * util-values), so after installing one package we inspect what it imports and
 * queue the misses. Attempts are recorded, so an unfindable package is not
 * retried and a dependency cycle terminates.
 */
export function ensureRuntimeDependencies(options: HealOptions): HealResult {
  const packageRoot = fileURLToPath(options.root)
  const targetModules = join(packageRoot, 'node_modules')
  // Anchor resolution at the real bundle (lib/bootstrap), not the package root:
  // that is where Node resolves from at runtime, so the probe matches reality.
  const require = createRequire(join(packageRoot, 'lib', 'bootstrap', 'heal.js'))

  const extracted: string[] = []
  const unresolved = new Set<string>()
  const attempted = new Set<string>()

  /** True when the specifier resolves and the resolved module can be loaded. */
  const usable = (specifier: string): boolean => {
    try {
      require.resolve(specifier)
    } catch {
      return false
    }
    try {
      require(specifier)
      return true
    } catch {
      // Resolvable but not loadable — e.g. a shim pointing into app.asar from
      // outside Electron. Treat as missing so the real copy gets provisioned.
      return false
    }
  }

  /** True when a copy of packageName exists under this package already. */
  const provisionedLocally = (packageName: string): boolean =>
    existsSync(join(targetModules, packageName, 'package.json'))

  const install = (packageName: string): boolean => {
    if (attempted.has(packageName)) return false
    attempted.add(packageName)

    const destination = join(targetModules, packageName)
    if (existsSync(join(destination, 'package.json'))) return true

    // 1. Prefer the unpacked copy: real files on disk, no header parsing.
    for (const base of unpackedCandidates()) {
      const source = join(base, packageName)
      if (existsSync(join(source, 'package.json'))) {
        try {
          mkdirSync(dirname(destination), { recursive: true })
          cpSync(source, destination, { recursive: true, force: true })
          extracted.push(packageName)
          return true
        } catch {
          /* fall through to asar extraction */
        }
      }
    }

    // 2. Extract from the archive itself.
    for (const asarPath of asarCandidates()) {
      const reader = openAsar(asarPath)
      if (!reader) continue
      try {
        const files = reader.extract('dsh/node_modules/' + packageName, destination)
        if (files > 0) {
          extracted.push(packageName)
          return true
        }
      } finally {
        reader.close()
      }
    }
    return false
  }

  // Seed with whatever the manifest names and cannot already be loaded.
  const queue = new Set<string>()
  for (const specifier of options.specifiers) {
    const name = packageNameOf(specifier)
    if (!name) continue
    // A locally provisioned copy is always preferred: it is reachable from every
    // context, whereas a sibling shim may only work inside Electron.
    if (provisionedLocally(name)) continue
    if (!usable(specifier)) queue.add(name)
  }

  while (queue.size > 0) {
    const batch = [...queue]
    queue.clear()

    const freshlyInstalled: string[] = []
    for (const packageName of batch) {
      if (install(packageName)) freshlyInstalled.push(packageName)
      else if (!usable(packageName)) unresolved.add(packageName)
    }

    // Every imported specifier of a newly installed package that still does not
    // load becomes the next provisioning target.
    for (const packageName of freshlyInstalled) {
      for (const specifier of externalSpecifiersOf(packageName, targetModules)) {
        const name = packageNameOf(specifier)
        if (!name || attempted.has(name)) continue
        if (provisionedLocally(name)) continue
        if (usable(specifier)) continue
        queue.add(name)
      }
    }
  }

  return { extracted: [...new Set(extracted)], unresolved: [...unresolved] }
}

/**
 * Bare specifiers a provisioned package imports, read from its own JS on disk.
 *
 * Scanning beats parsing 'dependencies'/'peerDependencies': those fields list
 * peers the package never imports at module scope, and DSH ships everything under
 * one flat node_modules, so one pass over the files is both simpler and closer to
 * what Node actually demands at load time.
 *
 * Bounded to the package's own source, first MAX_SCAN_FILES files, depth 3, so a
 * large package cannot stall startup.
 */
function externalSpecifiersOf(packageName: string, modulesDir: string): string[] {
  const root = join(modulesDir, packageName)
  const found = new Set<string>()
  let scanned = 0

  const visit = (dir: string, depth: number): void => {
    if (depth > 3 || scanned >= MAX_SCAN_FILES) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (scanned >= MAX_SCAN_FILES) return
      if (entry === 'node_modules' || entry.startsWith('.')) continue
      const full = join(dir, entry)
      let info
      try {
        info = statSync(full)
      } catch {
        continue
      }
      if (info.isDirectory()) {
        visit(full, depth + 1)
        continue
      }
      if (!/\.(js|mjs|cjs)$/.test(entry)) continue
      scanned += 1
      let source: string
      try {
        source = readFileSync(full, 'utf8')
      } catch {
        continue
      }
      for (const match of source.matchAll(/^\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
        found.add(match[1])
      }
      for (const match of source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        found.add(match[1])
      }
    }
  }

  visit(root, 0)
  return [...found]
}

/**
 * Guarantee the manifest's dependencies, then import the real entry point.
 *
 * The import must happen *after* healing: the targeted module has top-level
 * 'import … from 'zod'' statements, and ESM resolves those before evaluating a
 * single line of it, so pulling it in any earlier would fail.
 */
export async function loadHealed(options: HealOptions & { entry: string }): Promise<Record<string, unknown>> {
  const result = ensureRuntimeDependencies(options)
  if (result.extracted.length > 0) {
    // Surface the one-off cost instead of letting the first start look slow.
    console.info(
      '[dsh-knowledge] first run: provisioned ' + result.extracted.length +
      ' runtime package(s) from the DSH installation: ' + result.extracted.join(', '),
    )
  }
  if (result.unresolved.length > 0) {
    console.warn(
      '[dsh-knowledge] could not provision: ' + result.unresolved.join(', ') +
      ' — the knowledge service may fail to start. See the manual §8.4.',
    )
  }
  return (await import(new URL(options.entry, options.root).href)) as Record<string, unknown>
}

/**
 * Read the build-generated specifier manifest.
 *
 * Lives next to this module ('lib/bootstrap/manifest.json'), not at the package
 * root, so it is resolved relative to this file rather than to 'root'.
 *
 * A missing manifest is not fatal — it only means no proactive healing — so a
 * package assembled by hand still loads.
 */
export function readManifest(): readonly string[] {
  try {
    const raw = readFileSync(new URL('./manifest.json', import.meta.url), 'utf8')
    const parsed = JSON.parse(raw) as { specifiers?: unknown }
    return Array.isArray(parsed.specifiers)
      ? parsed.specifiers.filter((value): value is string => typeof value === 'string')
      : []
  } catch {
    return []
  }
}
