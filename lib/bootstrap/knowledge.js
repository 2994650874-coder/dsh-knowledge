// src/bootstrap/heal.ts
import { createRequire } from "node:module";
import { closeSync, cpSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var MAX_SCAN_FILES = 400;
var STAMP_FILE = ".dsh-knowledge-provisioned.json";
function openAsar(asarPath) {
  let fd;
  try {
    fd = openSync(asarPath, "r");
  } catch {
    return void 0;
  }
  try {
    const head = Buffer.alloc(16);
    readSync(fd, head, 0, 16, 0);
    const headerSize = head.readUInt32LE(4);
    const block = Buffer.alloc(headerSize);
    readSync(fd, block, 0, headerSize, 8);
    const stringLength = block.readUInt32LE(4);
    const header = JSON.parse(block.subarray(8, 8 + stringLength).toString("utf8"));
    const dataOffset = 8 + headerSize;
    const find = (slashPath) => {
      let node = header;
      for (const segment of slashPath.split("/").filter(Boolean)) {
        node = (node?.files ?? {})[segment];
        if (!node) return void 0;
      }
      return node;
    };
    return {
      close() {
        closeSync(fd);
      },
      readFile(asarPathInArchive) {
        const node = find(asarPathInArchive);
        if (!node || node.files) return void 0;
        if (node.offset === void 0 || typeof node.size !== "number") return void 0;
        const buffer = Buffer.alloc(node.size);
        readSync(fd, buffer, 0, node.size, dataOffset + Number(node.offset));
        return buffer.toString("utf8");
      },
      extract(asarPathInArchive, outDir) {
        const root2 = find(asarPathInArchive);
        if (!root2) return -1;
        let files = 0;
        const walk = (node, relative) => {
          if (node.files) {
            for (const [name, child] of Object.entries(node.files)) {
              walk(child, relative + "/" + name);
            }
            return;
          }
          if (node.offset === void 0 || typeof node.size !== "number") return;
          const out = join(outDir, relative);
          mkdirSync(dirname(out), { recursive: true });
          const buffer = Buffer.alloc(node.size);
          readSync(fd, buffer, 0, node.size, dataOffset + Number(node.offset));
          writeFileSync(out, buffer);
          files += 1;
        };
        walk(root2, "");
        return files;
      }
    };
  } catch {
    try {
      closeSync(fd);
    } catch {
    }
    return void 0;
  }
}
function packageNameOf(specifier) {
  if (!specifier) return void 0;
  if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("node:")) return void 0;
  if (specifier.startsWith("file:") || specifier.startsWith("data:")) return void 0;
  if (specifier.includes("\\") || /^[A-Za-z]:/.test(specifier)) return void 0;
  const parts = specifier.split("/");
  if (specifier.startsWith("@")) return parts.length >= 2 ? parts.slice(0, 2).join("/") : void 0;
  return parts[0];
}
function asarCandidates() {
  const out = [];
  const resources = process.resourcesPath;
  if (typeof resources === "string" && resources.length > 0) {
    out.push(join(resources, "app.asar"));
  }
  let exeDir = "";
  try {
    exeDir = dirname(process.execPath);
    out.push(join(exeDir, "resources", "app.asar"));
  } catch {
  }
  if (exeDir.length > 0) {
    let cursor = exeDir;
    for (let depth = 0; depth < 4; depth += 1) {
      out.push(join(cursor, "resources", "app.asar"));
      const parent = dirname(cursor);
      if (parent === cursor) break;
      cursor = parent;
    }
  }
  return [...new Set(out)].filter((candidate) => {
    try {
      return existsSync(candidate);
    } catch {
      return false;
    }
  });
}
function unpackedCandidates() {
  const out = [];
  const roots = [];
  const resources = process.resourcesPath;
  if (typeof resources === "string" && resources.length > 0) roots.push(resources);
  try {
    const exeDir = dirname(process.execPath);
    roots.push(join(exeDir, "resources"));
    let cursor = exeDir;
    for (let depth = 0; depth < 4; depth += 1) {
      roots.push(join(cursor, "resources"));
      const parent = dirname(cursor);
      if (parent === cursor) break;
      cursor = parent;
    }
  } catch {
  }
  for (const resourcesDir of roots) {
    out.push(join(resourcesDir, "app.asar.unpacked", "dsh", "node_modules"));
  }
  return [...new Set(out)].filter((candidate) => {
    try {
      return existsSync(candidate);
    } catch {
      return false;
    }
  });
}
function hostVersionOf(reader) {
  for (const candidate of ["dsh/package.json", "package.json"]) {
    const raw = reader.readFile(candidate);
    if (raw === void 0) continue;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.version === "string" && parsed.version.length > 0) return parsed.version;
    } catch {
    }
  }
  return void 0;
}
function writeStamp(targetModules, hostVersion) {
  try {
    mkdirSync(targetModules, { recursive: true });
    writeFileSync(
      join(targetModules, STAMP_FILE),
      JSON.stringify({ hostVersion: hostVersion ?? null, recordedAt: (/* @__PURE__ */ new Date()).toISOString() }, void 0, 2) + "\n"
    );
  } catch {
  }
}
function readStamp(targetModules) {
  try {
    return JSON.parse(readFileSync(join(targetModules, STAMP_FILE), "utf8"));
  } catch {
    return void 0;
  }
}
function shouldReprovision(targetModules, hostVersion) {
  if (hostVersion === void 0) return false;
  const stamp = readStamp(targetModules);
  if (!stamp) return false;
  const recorded = stamp.hostVersion;
  if (typeof recorded !== "string" || recorded.length === 0) return false;
  return recorded !== hostVersion;
}
function clearProvisioned(targetModules) {
  const removed = [];
  const drop = (name) => {
    const full = join(targetModules, name);
    try {
      rmSync(full, { recursive: true, force: true });
      removed.push(name);
    } catch {
    }
  };
  let entries = [];
  try {
    entries = readdirSync(targetModules);
  } catch {
    return removed;
  }
  for (const entry of entries) {
    if (entry === ".bin" || entry === ".package-lock.json" || entry === "esbuild") continue;
    if (entry.startsWith("@")) {
      let scoped = [];
      try {
        scoped = readdirSync(join(targetModules, entry));
      } catch {
        continue;
      }
      for (const child of scoped) drop(entry + "/" + child);
      continue;
    }
    if (entry === STAMP_FILE) continue;
    drop(entry);
  }
  try {
    rmSync(join(targetModules, STAMP_FILE), { force: true });
  } catch {
  }
  return removed;
}
function ensureRuntimeDependencies(options) {
  const packageRoot = fileURLToPath(options.root);
  const targetModules = join(packageRoot, "node_modules");
  const require2 = createRequire(join(packageRoot, "lib", "bootstrap", "heal.js"));
  const extracted = [];
  const unresolved = /* @__PURE__ */ new Set();
  const attempted = /* @__PURE__ */ new Set();
  let hostVersion;
  for (const asarPath of asarCandidates()) {
    const reader = openAsar(asarPath);
    if (!reader) continue;
    try {
      hostVersion = hostVersionOf(reader);
    } finally {
      reader.close();
    }
    if (hostVersion !== void 0) break;
  }
  let cleared = [];
  if (shouldReprovision(targetModules, hostVersion)) {
    cleared = clearProvisioned(targetModules);
    console.info(
      "[dsh-knowledge] DSH upgraded to " + String(hostVersion) + ": refreshing " + cleared.length + " provisioned package(s) from the new installation"
    );
  }
  const usable = (specifier) => {
    try {
      require2.resolve(specifier);
    } catch {
      return false;
    }
    try {
      require2(specifier);
      return true;
    } catch {
      return false;
    }
  };
  const provisionedLocally = (packageName) => existsSync(join(targetModules, packageName, "package.json"));
  const install = (packageName) => {
    if (attempted.has(packageName)) return false;
    attempted.add(packageName);
    const destination = join(targetModules, packageName);
    if (existsSync(join(destination, "package.json"))) return true;
    for (const base of unpackedCandidates()) {
      const source = join(base, packageName);
      if (existsSync(join(source, "package.json"))) {
        try {
          mkdirSync(dirname(destination), { recursive: true });
          cpSync(source, destination, { recursive: true, force: true });
          extracted.push(packageName);
          return true;
        } catch {
        }
      }
    }
    for (const asarPath of asarCandidates()) {
      const reader = openAsar(asarPath);
      if (!reader) continue;
      try {
        const files = reader.extract("dsh/node_modules/" + packageName, destination);
        if (files > 0) {
          extracted.push(packageName);
          return true;
        }
      } finally {
        reader.close();
      }
    }
    return false;
  };
  const queue = /* @__PURE__ */ new Set();
  for (const specifier of options.specifiers) {
    const name = packageNameOf(specifier);
    if (!name) continue;
    if (provisionedLocally(name)) continue;
    if (!usable(specifier)) queue.add(name);
  }
  while (queue.size > 0) {
    const batch = [...queue];
    queue.clear();
    const freshlyInstalled = [];
    for (const packageName of batch) {
      if (install(packageName)) freshlyInstalled.push(packageName);
      else if (!usable(packageName)) unresolved.add(packageName);
    }
    for (const packageName of freshlyInstalled) {
      for (const specifier of externalSpecifiersOf(packageName, targetModules)) {
        const name = packageNameOf(specifier);
        if (!name || attempted.has(name)) continue;
        if (provisionedLocally(name)) continue;
        if (usable(specifier)) continue;
        queue.add(name);
      }
    }
  }
  if (extracted.length > 0 || cleared.length > 0 || readStamp(targetModules) === void 0) {
    writeStamp(targetModules, hostVersion);
  }
  return { extracted: [...new Set(extracted)], unresolved: [...unresolved] };
}
function externalSpecifiersOf(packageName, modulesDir) {
  const root2 = join(modulesDir, packageName);
  const found = /* @__PURE__ */ new Set();
  let scanned = 0;
  const visit = (dir, depth) => {
    if (depth > 3 || scanned >= MAX_SCAN_FILES) return;
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (scanned >= MAX_SCAN_FILES) return;
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const full = join(dir, entry);
      let info;
      try {
        info = statSync(full);
      } catch {
        continue;
      }
      if (info.isDirectory()) {
        visit(full, depth + 1);
        continue;
      }
      if (!/\.(js|mjs|cjs)$/.test(entry)) continue;
      scanned += 1;
      let source;
      try {
        source = readFileSync(full, "utf8");
      } catch {
        continue;
      }
      for (const match of source.matchAll(/^\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
        found.add(match[1]);
      }
      for (const match of source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        found.add(match[1]);
      }
    }
  };
  visit(root2, 0);
  return [...found];
}
async function loadHealed(options) {
  const result = ensureRuntimeDependencies(options);
  if (result.extracted.length > 0) {
    console.info(
      "[dsh-knowledge] first run: provisioned " + result.extracted.length + " runtime package(s) from the DSH installation: " + result.extracted.join(", ")
    );
  }
  if (result.unresolved.length > 0) {
    console.warn(
      "[dsh-knowledge] could not provision: " + result.unresolved.join(", ") + " \u2014 the knowledge service may fail to start. See the manual \xA78.4."
    );
  }
  return await import(new URL(options.entry, options.root).href);
}
function readManifest() {
  try {
    const raw = readFileSync(new URL("./manifest.json", import.meta.url), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.specifiers) ? parsed.specifiers.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

// src/bootstrap/knowledge.ts
var root = new URL("../../", import.meta.url);
var specifiers = readManifest();
var loaded = await loadHealed({ root, specifiers, entry: "lib/knowledge/index.js" });
var Config = loaded.Config;
var ConflictError = loaded.ConflictError;
var DEFAULT_LOCAL_MODEL = loaded.DEFAULT_LOCAL_MODEL;
var DirectorySourceError = loaded.DirectorySourceError;
var KnowledgeService = loaded.KnowledgeService;
var MAX_RAW_TEXT_LIMIT = loaded.MAX_RAW_TEXT_LIMIT;
var MODEL_SUGGESTIONS = loaded.MODEL_SUGGESTIONS;
var NotFoundError = loaded.NotFoundError;
var StorageUnavailableError = loaded.StorageUnavailableError;
var chunkText = loaded.chunkText;
var clampRawTextLimit = loaded.clampRawTextLimit;
var composeContextWindow = loaded.composeContextWindow;
var cosineSimilarity = loaded.cosineSimilarity;
var embedTexts = loaded.embedTexts;
var estimateContextTokens = loaded.estimateContextTokens;
var extractWithMineruLocal = loaded.extractWithMineruLocal;
var getLocalModelStatus = loaded.getLocalModelStatus;
var knowledgeDomainSpec = loaded.knowledgeDomainSpec;
var localEmbeddingErrorText = loaded.localEmbeddingErrorText;
var openStore = loaded.openStore;
var probeMineruLocal = loaded.probeMineruLocal;
var rank = loaded.rank;
var serializeContextWindow = loaded.serializeContextWindow;
var tokenize = loaded.tokenize;
var knowledge_default = loaded.default;
export {
  Config,
  ConflictError,
  DEFAULT_LOCAL_MODEL,
  DirectorySourceError,
  KnowledgeService,
  MAX_RAW_TEXT_LIMIT,
  MODEL_SUGGESTIONS,
  NotFoundError,
  StorageUnavailableError,
  chunkText,
  clampRawTextLimit,
  composeContextWindow,
  cosineSimilarity,
  knowledge_default as default,
  embedTexts,
  estimateContextTokens,
  extractWithMineruLocal,
  getLocalModelStatus,
  knowledgeDomainSpec,
  localEmbeddingErrorText,
  openStore,
  probeMineruLocal,
  rank,
  serializeContextWindow,
  tokenize
};
//# sourceMappingURL=knowledge.js.map
