// src/knowledge/mineru-deployment.ts
import { mkdir as mkdir3, open as open2, readFile as readFile3, rename as rename2, unlink } from "node:fs/promises";
import { dirname as dirname3, join as join5 } from "node:path";
import { randomUUID as randomUUID2 } from "node:crypto";

// src/knowledge/mineru-deployment-plan.ts
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readdir, readFile, statfs } from "node:fs/promises";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";
import { homedir } from "node:os";

// src/knowledge/mineru-manifest.ts
var MINERU_RUNTIME_VERSION = "4.0.6";
var MINERU_MODEL_REPO = "opendatalab/MinerU-4_models_onnx";
var MINERU_MODEL_REVISION = "358310b4f64b95f9fefc372ad899356e4111f376";
var MINERU_MODEL_DIRECTORY = "MinerU-4_models_onnx";
var MINERU_MODEL_METADATA_DATE = "2026-09-27";
var MINERU_BASIC_FILES = [
  { path: "Layout/PP-DocLayoutV2/inference.onnx", bytes: 213963712, algorithm: "sha256", digest: "cd540dc296ff3115fe78efa65b68501e6a8dc74b198acc9834a725ffaa095aac" },
  { path: "Layout/PP-DocLayoutV2/inference.yml", bytes: 1482, algorithm: "git-sha1", digest: "5cc9ec8970c00fc1b0ca7a37824d9e09acbb451e" },
  { path: "MFR/pp_formulanet_plus_m/PP-FormulaNet_plus-M.onnx", bytes: 591263297, algorithm: "sha256", digest: "20a32595c2b30282dcd069e6295e9fad96115697beb66acb9b681b814006d193" },
  { path: "MFR/pp_formulanet_plus_m/PP-FormulaNet_plus-M_inference.yml", bytes: 2244564, algorithm: "git-sha1", digest: "88ab97b97b97567d5b71d418115f49e449c7c07c" },
  { path: "OCR/paddleocr/ch_PP-OCRv6_small_rec_infer.onnx", bytes: 21159378, algorithm: "sha256", digest: "5435fd747c9e0efe15a96d0b378d5bd157e9492ed8fd80edf08f30d02fa24634" },
  { path: "OCR/paddleocr/ch_PP-OCRv6_small_rec_inference.yml", bytes: 150752, algorithm: "git-sha1", digest: "6eece2c57a185b5a1bfef8b53d2d4d6cb4c526fa" },
  { path: "OCR/paddleocr/ch_PP-OCRv6_tiny_det_infer.onnx", bytes: 1780590, algorithm: "sha256", digest: "193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8" },
  { path: "OCR/paddleocr/ch_PP-OCRv6_tiny_det_inference.yml", bytes: 1068, algorithm: "git-sha1", digest: "0bd33a4c87de36ba27c7de81ab7c2928647010b4" },
  { path: "OCR/paddleocr/seal_PP-OCRv4_det_infer.onnx", bytes: 4769171, algorithm: "sha256", digest: "3e190df84542c2756975febe8f73603b587a23c7f7badfdd3fc8a986540d5bc0" },
  { path: "OCR/paddleocr/seal_PP-OCRv4_det_inference.yml", bytes: 711, algorithm: "git-sha1", digest: "ad9d0da9027cbf818c67e7f8535cf2abcd6cbc85" },
  { path: "Table/PP-LCNet_x1_0_table_cls.onnx", bytes: 6776877, algorithm: "sha256", digest: "c84bf1d79c1c74d534b5b12adb14dd12151c42f7ae3e4be4f1042b830f80b949" },
  { path: "Table/slanet-plus.onnx", bytes: 7758305, algorithm: "sha256", digest: "d57a942af6a2f57d6a4a0372573c696a2379bf5857c45e2ac69993f3b334514b" },
  { path: "Table/unet.onnx", bytes: 8335007, algorithm: "sha256", digest: "0ea48d3a17e35ef5c2e498a5e799566073234d39b1079ca21d9f4fafe73c6d20" }
];

// src/knowledge/mineru-deployment-plan.ts
var DeploymentError = class extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "DeploymentError";
  }
};
var missing = (e) => e.code === "ENOENT";
var OWNERSHIP_MARKER = ".dsh-mineru-managed.json";
function sameDeploymentPath(left, right) {
  const a = resolve(left);
  const b = resolve(right);
  return process.platform === "win32" ? a.toLocaleLowerCase("en-US") === b.toLocaleLowerCase("en-US") : a === b;
}
function resolveHuggingFaceEndpoint(configured) {
  const value = configured?.trim() || process.env.HF_ENDPOINT?.trim() || "https://huggingface.co";
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new DeploymentError("invalid_download_source", "The Hugging Face download source must be a valid HTTPS URL.");
  }
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!localHttp && url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new DeploymentError("invalid_download_source", "The Hugging Face download source must use HTTPS and cannot contain credentials, query parameters or fragments.");
  }
  return url.toString().replace(/\/+$/, "");
}
function resolvePythonIndexUrl(configured) {
  const value = configured?.trim() || "https://pypi.org/simple";
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new DeploymentError("invalid_python_index", "The Python package source must be a valid HTTPS URL.");
  }
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!localHttp && url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new DeploymentError("invalid_python_index", "The Python package source must use HTTPS and cannot contain credentials, query parameters or fragments.");
  }
  return url.toString().replace(/\/+$/, "");
}
async function checkDeploymentPath(value) {
  if (!value || value.includes("\0") || !isAbsolute(value) || value.startsWith("\\\\") || value.startsWith("//")) {
    throw new DeploymentError("invalid_path", "Choose an absolute local directory, not a network path.");
  }
  const target = resolve(value);
  const same = (a, b) => process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
  if (same(target, parse(target).root) || same(target, homedir()) || same(target, resolve(process.cwd()))) {
    throw new DeploymentError("unsafe_path", "Choose a dedicated MinerU subdirectory, not a drive, home or workspace root.");
  }
  let current = target;
  while (true) {
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw new DeploymentError("unsafe_path", "Symbolic links and junctions are not supported for managed paths.");
    } catch (e) {
      if (!missing(e)) throw e;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return target;
}
async function checkOwnedRoot(root) {
  await checkDeploymentPath(root);
  let names;
  try {
    names = await readdir(root);
  } catch (e) {
    if (missing(e)) return;
    throw e;
  }
  if (names.length === 0) return;
  try {
    await checkDeploymentPath(join(root, OWNERSHIP_MARKER));
    const marker = JSON.parse(await readFile(join(root, OWNERSHIP_MARKER), "utf8"));
    if (marker.owner === "dsh-knowledge/mineru" && marker.schemaVersion === 1 && typeof marker.root === "string" && sameDeploymentPath(marker.root, root)) return;
  } catch {
  }
  throw new DeploymentError("unowned_directory", "This nonempty directory is not managed by the plugin. Choose a new subdirectory; use existing models through the read-only model path.");
}
async function verifyModelFile(root, file, signal) {
  signal?.throwIfAborted();
  if (file.path.includes(":") || file.path.includes("\0") || file.path.split(/[\\/]/).some((p) => !p || p === ".." || p === ".") || isAbsolute(file.path)) throw new DeploymentError("invalid_manifest", "Unsafe model manifest path.");
  const path = await checkDeploymentPath(join(root, file.path));
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.size !== file.bytes) return false;
  } catch (e) {
    if (missing(e)) return false;
    throw e;
  }
  const hash = createHash(file.algorithm === "git-sha1" ? "sha1" : "sha256");
  if (file.algorithm === "git-sha1") hash.update(`blob ${file.bytes}\0`);
  for await (const piece of createReadStream(path, { signal })) {
    signal?.throwIfAborted();
    hash.update(piece);
  }
  return hash.digest("hex") === file.digest;
}
async function availableBytes(root) {
  let path = root;
  while (true) {
    try {
      const stat3 = await statfs(path, { bigint: true });
      const bytes = stat3.bavail * stat3.bsize;
      return bytes <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(bytes) : null;
    } catch (e) {
      if (!missing(e) || dirname(path) === path) return null;
      path = dirname(path);
    }
  }
}
async function createDeploymentPlan(input, options = {}) {
  const root = await checkDeploymentPath(input.root.trim());
  await checkOwnedRoot(root);
  const externalModels = Boolean(input.existingModels?.trim());
  const modelRoot = await checkDeploymentPath(externalModels ? input.existingModels.trim() : join(root, "models", MINERU_MODEL_DIRECTORY));
  const files = [];
  for (const file of options.files ?? MINERU_BASIC_FILES) files.push({ ...file, reusable: await verifyModelFile(modelRoot, file, options.signal) });
  const totalBytes = files.reduce((n, f) => n + f.bytes, 0);
  const verifiedReusableBytes = files.reduce((n, f) => n + (f.reusable ? f.bytes : 0), 0);
  const downloadBytes = totalBytes - verifiedReusableBytes;
  const freeBytes = await availableBytes(root);
  const blockers = [];
  const modelPeakAdditionalBytes = externalModels ? totalBytes * 2 : downloadBytes * 2;
  if (externalModels && downloadBytes > 0) blockers.push("external_models_incomplete");
  if (freeBytes !== null && freeBytes < modelPeakAdditionalBytes) blockers.push("insufficient_model_space");
  return {
    id: randomUUID(),
    expiresAt: Date.now() + 10 * 6e4,
    root,
    modelRoot,
    externalModels,
    tier: "basic",
    backend: "onnx",
    runtimeVersion: MINERU_RUNTIME_VERSION,
    modelRepo: MINERU_MODEL_REPO,
    modelEndpoint: resolveHuggingFaceEndpoint(input.hfEndpoint),
    pythonIndexUrl: resolvePythonIndexUrl(input.pythonIndexUrl),
    modelRevision: MINERU_MODEL_REVISION,
    metadataDate: MINERU_MODEL_METADATA_DATE,
    capacity: {
      totalBytes,
      verifiedReusableBytes,
      downloadBytes,
      modelPeakAdditionalBytes,
      runtimeDownloadBytes: null,
      runtimeInstalledBytes: null,
      freeBytes
    },
    files,
    blockers,
    warnings: ["runtime_size_unknown", "real_inference_not_qualified", ...freeBytes === null ? ["free_space_unknown"] : []]
  };
}

// src/knowledge/mineru-download.ts
import { copyFile, mkdir, open, rename, stat, truncate } from "node:fs/promises";
import { dirname as dirname2, join as join2 } from "node:path";
async function downloadMineruModels(plan, signal, progress, fetcher = fetch) {
  const targetRoot = join2(plan.root, "models", MINERU_MODEL_DIRECTORY);
  const totalBytes = plan.files.reduce((sum, file) => sum + file.bytes, 0);
  let verified = 0;
  for (const file of plan.files) {
    signal.throwIfAborted();
    if (await verifyModelFile(targetRoot, file, signal)) {
      verified += file.bytes;
      progress({ completedBytes: verified, totalBytes, file: file.path });
      continue;
    }
    const destination = await checkDeploymentPath(join2(targetRoot, file.path));
    const partRoot = join2(plan.root, "staging", plan.modelRevision);
    const partFile = { ...file, path: `${file.path}.part` };
    const partial = await checkDeploymentPath(join2(partRoot, partFile.path));
    await mkdir(dirname2(partial), { recursive: true });
    await mkdir(dirname2(destination), { recursive: true });
    const free = await availableBytes(plan.root);
    if (free !== null && free < file.bytes) throw new DeploymentError("insufficient_space", "Not enough space to stage this model file.");
    if (plan.externalModels) {
      if (!await verifyModelFile(plan.modelRoot, file, signal)) throw new DeploymentError("external_models_changed", "An external model changed after preflight. Run preflight again.");
      await copyFile(join2(plan.modelRoot, file.path), partial);
    } else {
      let offset = await stat(partial).then((value) => value.size).catch((error) => {
        if (error.code === "ENOENT") return 0;
        throw error;
      });
      if (offset > file.bytes) {
        await truncate(partial, 0);
        offset = 0;
      }
      if (offset < file.bytes) {
        const url = `${plan.modelEndpoint}/${plan.modelRepo.split("/").map(encodeURIComponent).join("/")}/resolve/${plan.modelRevision}/${file.path.split("/").map(encodeURIComponent).join("/")}`;
        const budget = AbortSignal.any([signal, AbortSignal.timeout(30 * 6e4)]);
        const response = await fetcher(url, { signal: budget, headers: offset ? { Range: `bytes=${offset}-` } : {} });
        try {
          if (!response.ok || !response.body) throw new DeploymentError("download_failed", `Model download returned HTTP ${response.status}. Retry preserves partial files.`);
          if (response.status === 206) {
            const range = response.headers.get("content-range");
            if (range !== `bytes ${offset}-${file.bytes - 1}/${file.bytes}`) throw new DeploymentError("invalid_download", "Invalid resume range; retry after checking the download source.");
          } else if (response.status === 200) offset = 0;
          else throw new DeploymentError("invalid_download", "Unexpected model download response.");
          const handle = await open(partial, offset ? "a" : "w", 384);
          const reader = response.body.getReader();
          try {
            while (true) {
              const { done, value: chunk } = await reader.read();
              if (done) break;
              budget.throwIfAborted();
              if (offset + chunk.length > file.bytes) throw new DeploymentError("invalid_download", "Model data exceeds its pinned size.");
              await handle.writeFile(chunk);
              offset += chunk.length;
              progress({ completedBytes: verified + offset, totalBytes, file: file.path });
            }
            await handle.sync();
          } finally {
            reader.releaseLock();
            await handle.close();
          }
        } finally {
          if (response.body && !response.body.locked) await response.body.cancel().catch(() => {
          });
        }
      }
    }
    signal.throwIfAborted();
    if (!await verifyModelFile(partRoot, partFile, signal)) {
      const size = await stat(partial).then((value) => value.size);
      if (size >= file.bytes) await truncate(partial, 0);
      throw new DeploymentError("checksum_mismatch", "Model download is incomplete or corrupt. No readiness was granted; retry is safe.");
    }
    await rename(partial, destination);
    verified += file.bytes;
    progress({ completedBytes: verified, totalBytes, file: file.path });
  }
}

// src/knowledge/parsed-document.ts
import { createHash as createHash2 } from "node:crypto";
import { setImmediate as yieldTurn } from "node:timers/promises";
import JSZip from "jszip";

// src/knowledge/processor-transport.ts
var ProcessorError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "ProcessorError";
  }
};
function processorUrl(value, base) {
  let url;
  try {
    url = new URL(value, base);
  } catch {
    throw new ProcessorError("invalid_config", "Invalid MinerU HTTP service URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash) {
    throw new ProcessorError("invalid_config", "MinerU requires an HTTP(S) URL without embedded credentials or a fragment.");
  }
  return url;
}
function checkProcessingAbort(signal) {
  if (signal.aborted) throw signal.reason instanceof Error ? signal.reason : new DOMException("Processing canceled.", "AbortError");
}
function processingBudget(timeoutMs, external) {
  const controller = new AbortController();
  const cancel = () => controller.abort(new DOMException("Processing canceled.", "AbortError"));
  const timer = setTimeout(() => controller.abort(new ProcessorError("timeout", "MinerU processing exceeded its total time budget.")), timeoutMs);
  timer.unref?.();
  external?.addEventListener("abort", cancel, { once: true });
  if (external?.aborted) cancel();
  return { signal: controller.signal, dispose: () => {
    clearTimeout(timer);
    external?.removeEventListener("abort", cancel);
  } };
}
async function processingDelay(ms, signal) {
  checkProcessingAbort(signal);
  await new Promise((resolve3, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve3();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
async function readProcessorBytes(response, maximum, signal) {
  checkProcessingAbort(signal);
  const declared = response.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > maximum)) {
    await response.body?.cancel();
    throw new ProcessorError("output_too_large", "MinerU response exceeds the configured safety limit.");
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const pieces = [];
  let size = 0;
  const cancel = () => {
    void reader.cancel().catch(() => void 0);
  };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    while (true) {
      checkProcessingAbort(signal);
      const { done, value } = await reader.read();
      checkProcessingAbort(signal);
      if (done) break;
      size += value.byteLength;
      if (size > maximum) throw new ProcessorError("output_too_large", "MinerU response exceeds the configured safety limit.");
      pieces.push(value);
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => void 0);
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const piece of pieces) {
    bytes.set(piece, offset);
    offset += piece.byteLength;
  }
  return bytes;
}
var ProcessorTransport = class {
  constructor(apiUrl, apiKey, signal) {
    this.apiKey = apiKey;
    this.signal = signal;
    this.base = processorUrl(apiUrl.replace(/\/+$/, "") + "/");
    if (this.base.search) throw new ProcessorError("invalid_config", "The MinerU service URL must not include a query.");
    if (apiKey && /[\r\n]/.test(apiKey)) throw new ProcessorError("invalid_config", "Invalid MinerU authentication configuration.");
  }
  base;
  endpoint(path) {
    return processorUrl(path.replace(/^\//, ""), this.base);
  }
  async bytes(target, options = {}) {
    let url = target;
    const originalOrigin = target.origin;
    for (let redirect = 0; redirect <= 4; redirect++) {
      checkProcessingAbort(this.signal);
      const headers = new Headers(url.origin === originalOrigin ? options.headers : void 0);
      if (url.origin === this.base.origin && this.apiKey) headers.set("authorization", `Bearer ${this.apiKey}`);
      let response;
      try {
        response = await fetch(url, {
          method: options.method ?? "GET",
          headers,
          body: options.body,
          redirect: "manual",
          signal: this.signal
        });
      } catch {
        checkProcessingAbort(this.signal);
        throw new ProcessorError(
          options.ambiguousSubmission ? "submission_unknown" : "network_error",
          options.ambiguousSubmission ? "MinerU submission outcome is unknown; it was not retried automatically." : "The MinerU service could not be reached."
        );
      }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!options.allowRedirects || options.method && options.method !== "GET" || !location || redirect === 4) {
          throw new ProcessorError("invalid_response", "Unexpected MinerU redirect.");
        }
        const next = processorUrl(location, url);
        if (url.protocol === "https:" && next.protocol !== "https:") throw new ProcessorError("invalid_response", "Refused an insecure artifact redirect.");
        url = next;
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        const code = response.status === 404 && options.missingJob ? "job_lost" : response.status === 401 || response.status === 403 ? "authentication_error" : "provider_error";
        throw new ProcessorError(code, code === "job_lost" ? "MinerU no longer knows this job. The service may have restarted; explicitly reparse to submit a replacement." : `MinerU returned HTTP ${response.status}.`);
      }
      try {
        return await readProcessorBytes(response, options.maxBytes ?? 2 * 1024 * 1024, this.signal);
      } catch (error) {
        checkProcessingAbort(this.signal);
        if (error instanceof ProcessorError) throw error;
        throw new ProcessorError(options.ambiguousSubmission ? "submission_unknown" : "network_error", "The MinerU response body could not be read completely.");
      }
    }
    throw new ProcessorError("invalid_response", "Too many artifact redirects.");
  }
  async json(path, options = {}) {
    const bytes = await this.bytes(this.endpoint(path), options);
    let result;
    try {
      result = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch {
      throw new ProcessorError(options.ambiguousSubmission ? "submission_unknown" : "invalid_response", "MinerU returned invalid JSON.");
    }
    return object(result);
  }
};
function object(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new ProcessorError("invalid_response", "MinerU returned an invalid object.");
  return value;
}
function identifier(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(value)) throw new ProcessorError("invalid_response", "MinerU returned an invalid resource identifier.");
  return value;
}
function stringList(value) {
  if (!Array.isArray(value) || value.length > 128 || !value.every((v) => typeof v === "string" && v.length > 0 && v.length <= 100)) {
    throw new ProcessorError("invalid_response", "MinerU returned an invalid capability list.");
  }
  return [...new Set(value)];
}

// src/knowledge/parsed-document.ts
var MINERU_ARCHIVE_LIMITS = Object.freeze({
  compressedBytes: 128 * 1024 * 1024,
  expandedBytes: 256 * 1024 * 1024,
  memberBytes: 32 * 1024 * 1024,
  members: 4096,
  blocks: 1e5,
  textChars: 16 * 1024 * 1024,
  fieldChars: 1024 * 1024
});
function processingHash(bytes) {
  return createHash2("sha256").update(bytes).digest("hex");
}
function validateArtifactPath(path) {
  if (!path || path.length > 512 || /[\\\x00-\x1f\x7f:%?#]/.test(path) || path.startsWith("/") || path.normalize("NFC") !== path) {
    throw new ProcessorError("unsafe_archive", "MinerU returned an unsafe artifact path.");
  }
  const components = path.endsWith("/") ? path.slice(0, -1).split("/") : path.split("/");
  if (components.some((part) => !part || part === "." || part === ".." || /[. ]$/.test(part) || /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(part))) {
    throw new ProcessorError("unsafe_archive", "MinerU returned an unsafe artifact path.");
  }
  return path;
}
function inspectArchive(bytes) {
  const limits = MINERU_ARCHIVE_LIMITS;
  if (bytes.byteLength < 22 || bytes.byteLength > limits.compressedBytes) throw new ProcessorError("invalid_archive", "MinerU returned an invalid or oversized ZIP.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.byteLength - 22; i >= Math.max(0, bytes.byteLength - 65557); i--) {
    if (view.getUint32(i, true) === 101010256 && i + 22 + view.getUint16(i + 20, true) === bytes.byteLength) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new ProcessorError("invalid_archive", "MinerU returned a truncated ZIP.");
  const count = view.getUint16(end + 10, true);
  let position = view.getUint32(end + 16, true);
  const centralEnd = position + view.getUint32(end + 12, true);
  if (count === 65535 || count > limits.members || count < 1 || view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0 || view.getUint16(end + 8, true) !== count || centralEnd > end) {
    throw new ProcessorError("invalid_archive", "Unsupported ZIP layout or too many MinerU artifacts.");
  }
  let expanded = 0;
  const names = /* @__PURE__ */ new Set();
  for (let i = 0; i < count; i++) {
    if (position + 46 > centralEnd || view.getUint32(position, true) !== 33639248) throw new ProcessorError("invalid_archive", "Invalid ZIP directory.");
    const nameLength = view.getUint16(position + 28, true);
    const extraLength = view.getUint16(position + 30, true);
    const commentLength = view.getUint16(position + 32, true);
    const next = position + 46 + nameLength + extraLength + commentLength;
    if (next > centralEnd) throw new ProcessorError("invalid_archive", "Invalid ZIP member.");
    const flags = view.getUint16(position + 8, true);
    const compression = view.getUint16(position + 10, true);
    const size = view.getUint32(position + 24, true);
    const unixType = view.getUint32(position + 38, true) >>> 16 & 61440;
    if ((flags & 1) !== 0 || ![0, 8].includes(compression) || unixType === 40960 || size > limits.memberBytes) {
      throw new ProcessorError("unsafe_archive", "Encrypted, linked, oversized, or unsupported ZIP member.");
    }
    let name;
    try {
      name = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(position + 46, position + 46 + nameLength));
    } catch {
      throw new ProcessorError("unsafe_archive", "Artifact paths must be UTF-8.");
    }
    validateArtifactPath(name);
    if (names.has(name.toLowerCase())) throw new ProcessorError("unsafe_archive", "Duplicate artifact paths are not allowed.");
    names.add(name.toLowerCase());
    expanded += size;
    if (expanded > limits.expandedBytes) throw new ProcessorError("output_too_large", "MinerU expanded artifacts exceed the safety limit.");
    position = next;
  }
  if (position !== centralEnd) throw new ProcessorError("invalid_archive", "Invalid ZIP directory length.");
}
async function boundedMember(entry, signal) {
  if (signal) checkProcessingAbort(signal);
  return await new Promise((resolve3, reject) => {
    const chunks = [];
    let count = 0;
    let finished = false;
    const stream = entry.nodeStream("nodebuffer");
    const finish = (error) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener("abort", abort);
      if (error) {
        stream.destroy();
        reject(error);
        return;
      }
      const result = new Uint8Array(count);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      resolve3(result);
    };
    const abort = () => finish(signal?.reason ?? new DOMException("Processing canceled.", "AbortError"));
    signal?.addEventListener("abort", abort, { once: true });
    stream.on("data", (chunk) => {
      if (finished) return;
      count += chunk.length;
      if (count > MINERU_ARCHIVE_LIMITS.memberBytes) finish(new ProcessorError("output_too_large", "Expanded artifact exceeds the safety limit."));
      else chunks.push(chunk);
    }).on("error", () => finish(new ProcessorError("invalid_archive", "MinerU artifact decompression failed."))).on("end", () => finish()).resume();
  });
}
function field(value) {
  if (typeof value !== "string" || value.length > MINERU_ARCHIVE_LIMITS.fieldChars) throw new ProcessorError("invalid_response", "Invalid or oversized structured text field.");
  return value;
}
function decodeEntities(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", minus: "\u2212", times: "\xD7", divide: "\xF7", le: "\u2264", ge: "\u2265" };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, name) => {
    if (!name.startsWith("#")) return named[name.toLowerCase()] ?? all;
    const value = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return Number.isInteger(value) && value > 0 && value <= 1114111 && !(value >= 55296 && value <= 57343) ? String.fromCodePoint(value) : "\uFFFD";
  });
}
function inertHtmlText(html) {
  return decodeEntities(html.replace(/<!--[^]*?-->/g, "").replace(/<(script|style|iframe)\b[^>]*>[^]*?<\/\1\s*>/gi, "").replace(/<eq\b[^>]*>([^]*?)<\/eq\s*>/gi, (_all, equation) => `$${equation.replace(/<[^>]*>/g, "")}$`).replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/p\s*>/gi, "\n").replace(/<[^>]*>/g, "")).trim();
}
function tableText(html) {
  const rows = [];
  const pending = /* @__PURE__ */ new Map();
  const rowPattern = /<tr\b[^>]*>([^]*?)<\/tr\s*>/gi;
  for (const row of html.matchAll(rowPattern)) {
    if (rows.length >= 4096) throw new ProcessorError("output_too_large", "Too many table rows.");
    const cells = [];
    for (const [column2, span] of pending) {
      cells[column2] = span.text;
      span.remaining--;
      if (span.remaining <= 0) pending.delete(column2);
    }
    let column = 0;
    for (const cell of row[1].matchAll(/<(td|th)\b([^>]*)>([^]*?)<\/\1\s*>/gi)) {
      while (cells[column] !== void 0) column++;
      const content = inertHtmlText(cell[3]).replace(/\|/g, "\\|").replace(/\r?\n/g, " / ");
      const spanValue = (name) => Math.min(64, Math.max(1, Number(cell[2].match(new RegExp(`\\b${name}\\s*=\\s*["']?(\\d+)`, "i"))?.[1] ?? 1)));
      const columns = spanValue("colspan");
      const rowSpan = spanValue("rowspan");
      for (let offset = 0; offset < columns; offset++) {
        if (column >= 256) throw new ProcessorError("output_too_large", "Too many table columns.");
        cells[column] = content;
        if (rowSpan > 1) pending.set(column, { text: content, remaining: rowSpan - 1 });
        column++;
      }
    }
    if (cells.length) rows.push(cells);
  }
  if (!rows.length) return inertHtmlText(html);
  const width = Math.max(...rows.map((row) => row.length));
  const line = (row) => `| ${Array.from({ length: width }, (_, i) => row[i] ?? "").join(" | ")} |`;
  return [line(rows[0]), line(Array(width).fill("---")), ...rows.slice(1).map(line)].join("\n");
}
function inlineText(value, depth = 0) {
  if (depth > 16 || !Array.isArray(value) || value.length > 1e5) throw new ProcessorError("invalid_response", "Invalid inline content.");
  const text = value.map((item) => {
    const span = object(item);
    if (span.type === "hyperlink") return inlineText(span.content, depth + 1);
    const content = field(span.content);
    if (span.type === "equation_inline") return `$${content}$`;
    if (span.type === "code_inline") return "`" + content + "`";
    if (span.type !== "text") throw new ProcessorError("unsupported_schema", "Unsupported MinerU inline content type.");
    return content;
  }).join("");
  return field(text);
}
function sourceBox(value, warn) {
  if (value === void 0 || value === null) return void 0;
  if (!Array.isArray(value) || value.length !== 4 || !value.every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1) || value[0] >= value[2] || value[1] >= value[3]) {
    warn("geometry_unavailable", "Invalid upstream block geometry was omitted.");
    return void 0;
  }
  return { coordinateSpace: "normalized", x0: value[0], y0: value[1], x1: value[2], y1: value[3] };
}
var leafTypes = {
  text: "text",
  ref_text: "text",
  doc_title: "heading",
  paragraph_title: "heading",
  header: "text",
  footer: "text",
  number: "text",
  aside_text: "text",
  page_footnote: "text",
  equation: "equation",
  image_body: "image",
  table_body: "table",
  chart_body: "table",
  code_body: "code",
  algorithm_body: "code",
  image_caption: "caption",
  image_footnote: "caption",
  table_caption: "caption",
  table_footnote: "caption",
  chart_caption: "caption",
  chart_footnote: "caption",
  code_caption: "caption",
  code_footnote: "caption",
  list_item: "list",
  index_item: "list"
};
var groups = /* @__PURE__ */ new Set(["image", "table", "chart", "code", "list", "index"]);
async function normalizeMineruArchive(archive, sourceBytes, options) {
  if (options.signal) checkProcessingAbort(options.signal);
  inspectArchive(archive);
  let zip;
  try {
    zip = await JSZip.loadAsync(archive);
  } catch {
    throw new ProcessorError("invalid_archive", "MinerU returned an unreadable ZIP.");
  }
  const entries = Object.values(zip.files);
  const manifests = entries.filter((entry) => !entry.dir && /(^|\/)middle_json\.json$/.test(entry.name));
  if (manifests.length !== 1) throw new ProcessorError("unsupported_schema", "MinerU ZIP must contain exactly one middle_json.json.");
  const root = manifests[0].name.slice(0, -"middle_json.json".length);
  const assetInfo = [];
  const assetBytes = [];
  const assetsByPath = /* @__PURE__ */ new Map();
  let expandedBytes = 0;
  let middle;
  for (const entry of entries) {
    if (options.signal) checkProcessingAbort(options.signal);
    validateArtifactPath(entry.name);
    if (entry.unsafeOriginalName && entry.unsafeOriginalName !== entry.name) throw new ProcessorError("unsafe_archive", "ZIP member path was rewritten.");
    if (entry.dir) continue;
    const bytes = await boundedMember(entry, options.signal);
    expandedBytes += bytes.byteLength;
    if (expandedBytes > MINERU_ARCHIVE_LIMITS.expandedBytes) throw new ProcessorError("output_too_large", "Expanded ZIP exceeds the safety limit.");
    if (entry.name === manifests[0].name) {
      try {
        middle = object(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
      } catch {
        throw new ProcessorError("invalid_response", "Invalid MinerU MiddleJson artifact.");
      }
    }
    const relative = entry.name.startsWith(root) ? entry.name.slice(root.length) : "";
    const mimeTypes = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
    const extension = relative.split(".").at(-1)?.toLowerCase() ?? "";
    if (relative.startsWith("images/") && mimeTypes[extension]) {
      const asset = { id: `asset-${processingHash(relative).slice(0, 24)}`, path: relative, mimeType: mimeTypes[extension], byteLength: bytes.length, sha256: processingHash(bytes) };
      assetInfo.push(asset);
      assetBytes.push({ id: asset.id, bytes });
      assetsByPath.set(relative, asset);
    }
    await yieldTurn();
  }
  if (!middle || middle.schema !== "docvortex.middle" || middle.schema_version !== "2.0") throw new ProcessorError("unsupported_schema", "Only docvortex.middle schema 2.0 is supported. Reconfigure or update the MinerU service.");
  if (!Array.isArray(middle.pages) || middle.pages.length > 1e4 || typeof middle.is_full_document !== "boolean") throw new ProcessorError("invalid_response", "Invalid MiddleJson pages or completeness.");
  const warnings = [];
  const warn = (code, message) => {
    if (!warnings.some((w) => w.code === code)) warnings.push({ code, message });
  };
  const blocks = [];
  const parts = [];
  const processedPages = [];
  let length = 0;
  let heading = "";
  let traversed = 0;
  const append = (block) => {
    if (!block.text && !block.assetIds?.length) return;
    if (blocks.length >= MINERU_ARCHIVE_LIMITS.blocks) throw new ProcessorError("output_too_large", "Too many parsed blocks.");
    if (parts.length) length += 2;
    const textStart = length;
    length += block.text.length;
    if (length > MINERU_ARCHIVE_LIMITS.textChars) throw new ProcessorError("output_too_large", "Parsed text exceeds the safety limit.");
    blocks.push({ ...block, index: blocks.length, textStart, textEnd: length });
    parts.push(block.text);
  };
  const visit = (raw, pageIndex, path, parentId, depth = 0) => {
    if (++traversed > MINERU_ARCHIVE_LIMITS.blocks || depth > 16) throw new ProcessorError("output_too_large", "Structured document is too deep or large.");
    const block = object(raw);
    const type = typeof block.type === "string" ? block.type : "";
    const id = `p${pageIndex}:${path}`;
    if (groups.has(type)) {
      if (!Array.isArray(block.content)) throw new ProcessorError("invalid_response", "Invalid structured block children.");
      block.content.forEach((child, index) => visit(child, pageIndex, `${path}.${index}`, id, depth + 1));
      return;
    }
    const mapped = leafTypes[type] ?? "unknown";
    if (mapped === "unknown") warn("unknown_block_type", "Some upstream block types were retained as plain text.");
    let text = typeof block.content === "string" ? field(block.content) : inlineText(block.content);
    if (mapped === "table" || mapped === "image") text = tableText(text);
    else if (mapped === "equation" && text.trim()) text = `$$
${text.trim()}
$$`;
    if (mapped === "heading") heading = text.trim();
    const references = [];
    if (typeof block.image_path === "string" && block.image_path) references.push(block.image_path);
    if (typeof block.image_url === "string" && block.image_url) warn("remote_asset_omitted", "External image resources were not fetched.");
    if (typeof block.content === "string") {
      for (const match of block.content.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) references.push(match[1]);
    }
    const assetIds = [];
    for (const reference of references) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) {
        warn("remote_asset_omitted", "External image resources were not fetched.");
        continue;
      }
      validateArtifactPath(reference);
      const asset = assetsByPath.get(reference);
      if (asset) {
        if (!assetIds.includes(asset.id)) assetIds.push(asset.id);
      } else warn("asset_unavailable", "An upstream image reference has no supported local asset.");
    }
    if (!text.trim() && assetIds.length) text = mapped === "equation" ? "[Equation image; text unavailable]" : "[Image; text unavailable]";
    if (!text.trim() && mapped === "equation") warn("equation_text_unavailable", "Some equations contain no searchable text.");
    append({
      id,
      type: mapped,
      text,
      pageIndex,
      ...heading ? { heading } : {},
      ...parentId ? { parentId } : {},
      ...assetIds.length ? { assetIds } : {},
      bbox: sourceBox(block.bbox, warn)
    });
  };
  for (const rawPage of middle.pages) {
    if (options.signal) checkProcessingAbort(options.signal);
    const page = object(rawPage);
    if (!Number.isInteger(page.page_idx) || page.page_idx < 0 || page.page_idx > 1e5 || !Array.isArray(page.blocks)) throw new ProcessorError("invalid_response", "Invalid structured page.");
    const pageIndex = page.page_idx;
    if (processedPages.length && pageIndex <= processedPages[processedPages.length - 1]) throw new ProcessorError("invalid_response", "Structured pages are not in strict source order.");
    processedPages.push(pageIndex);
    for (let i = 0; i < page.blocks.length; i++) {
      visit(page.blocks[i], pageIndex, `b${i}`);
      if (i % 128 === 0) {
        await yieldTurn();
        if (options.signal) checkProcessingAbort(options.signal);
      }
    }
  }
  const contiguous = processedPages.every((page, index) => page === index);
  const partial = options.partial === true || middle.is_full_document !== true || !contiguous;
  if (partial) warn("partial_document", "The parser did not confirm complete contiguous source coverage.");
  const metadata = middle.metadata == null ? void 0 : object(middle.metadata);
  const producer = metadata?.producer == null ? void 0 : object(metadata.producer);
  const version = producer && typeof producer.version === "string" && producer.version.length <= 100 ? producer.version : options.processorVersion;
  const result = {
    document: {
      schemaVersion: 1,
      text: parts.join("\n\n"),
      sourceHash: processingHash(sourceBytes),
      provider: "mineru-local",
      processorVersion: version,
      optionsFingerprint: processingHash(JSON.stringify({ schema: 1, tier: options.tier, pageRange: "all", output: "zip" })),
      completeness: partial ? "partial" : "complete",
      ...contiguous && !partial ? { pageCount: processedPages.length } : {},
      processedPages,
      blocks,
      assets: assetInfo,
      warnings
    },
    assets: assetBytes,
    originalResult: archive
  };
  if (options.signal) checkProcessingAbort(options.signal);
  return result;
}

// src/knowledge/mineru-local.ts
var statuses = /* @__PURE__ */ new Set(["queued", "running", "completed", "partial", "failed", "canceled"]);
var tiers = /* @__PURE__ */ new Set(["flash", "basic", "standard", "advanced"]);
var timeout = (settings, fallback) => settings.timeoutMs !== void 0 && Number.isFinite(settings.timeoutMs) && settings.timeoutMs > 0 ? Math.min(Math.max(1, Math.floor(settings.timeoutMs)), 2 * 60 * 60 * 1e3) : fallback;
async function capabilities(transport) {
  const health = await transport.json("/v1/health");
  if (health.status !== "ok" || typeof health.version !== "string" || !/^4\.\d+\.\d+(?:[.-][\w.-]+)?$/.test(health.version)) {
    throw new ProcessorError("unsupported_version", "This adapter requires a healthy MinerU 4.x V1 service (validated against 4.0.6).");
  }
  const features = object(health.features);
  const outputFormats = stringList(features.output_formats);
  const sources = stringList(features.sources);
  if (!outputFormats.includes("zip") || !sources.includes("file_id")) throw new ProcessorError("unsupported_capability", "The MinerU service must support file_id sources and ZIP output.");
  const response = await transport.json("/v1/tiers");
  if (response.object !== "list" || !Array.isArray(response.data) || response.data.length > 16) throw new ProcessorError("invalid_response", "Invalid MinerU tier response.");
  const available = response.data.map((value) => {
    const id = object(value).id;
    if (typeof id !== "string" || !tiers.has(id)) throw new ProcessorError("invalid_response", "Invalid MinerU tier identifier.");
    return id;
  });
  if (!available.length || new Set(available).size !== available.length) throw new ProcessorError("invalid_response", "Empty or duplicated MinerU tiers.");
  return { provider: "mineru-local", version: health.version, tiers: available, outputFormats, sources };
}
async function probeMineruLocal(settings, signal) {
  const budget = processingBudget(Math.min(timeout(settings, 15e3), 15e3), signal);
  try {
    return await capabilities(new ProcessorTransport(settings.apiUrl, settings.apiKey, budget.signal));
  } finally {
    budget.dispose();
  }
}
function job(value, expectedId) {
  const id = identifier(value.job_id);
  if (expectedId && expectedId !== id) throw new ProcessorError("invalid_response", "MinerU returned a different job identifier.");
  if (typeof value.status !== "string" || !statuses.has(value.status)) throw new ProcessorError("invalid_response", "MinerU returned an unsupported job state.");
  return { id, status: value.status };
}
function fileId(upload, expectedBytes) {
  const file = object(upload.file);
  if (file.purpose !== void 0 && file.purpose !== "parse") throw new ProcessorError("invalid_response", "MinerU returned a non-source upload file.");
  if (file.bytes !== void 0 && file.bytes !== expectedBytes) throw new ProcessorError("invalid_response", "MinerU upload size does not match the source.");
  return identifier(file.id);
}
function uploadHeaders(value) {
  if (value === null || value === void 0) return {};
  const raw = object(value);
  const result = /* @__PURE__ */ Object.create(null);
  if (Object.keys(raw).length > 64) throw new ProcessorError("invalid_response", "Too many upload headers.");
  for (const [key, val] of Object.entries(raw)) {
    if (!/^[!#$%&'*+.^_`|~\w-]+$/.test(key) || typeof val !== "string" || val.length > 8192 || /[\r\n]/.test(val) || ["host", "cookie", "connection", "transfer-encoding", "content-length"].includes(key.toLowerCase())) {
      throw new ProcessorError("invalid_response", "MinerU returned an unsafe upload header.");
    }
    result[key] = val;
  }
  return result;
}
function mimeType(name) {
  const extension = name.split(".").at(-1)?.toLowerCase();
  return {
    pdf: "application/pdf",
    html: "text/html",
    htm: "text/html",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    epub: "application/epub+zip"
  }[extension ?? ""] ?? "application/octet-stream";
}
async function extractWithMineruLocal(bytes, fileName, settings, options = {}) {
  if (!bytes.byteLength || bytes.byteLength > 200 * 1024 * 1024) throw new ProcessorError("invalid_input", "MinerU input must be nonempty and at most 200 MiB.");
  const name = fileName.split(/[\\/]/).at(-1) ?? "";
  if (!name || name.length > 512 || /[\x00-\x1f\x7f]/.test(name)) throw new ProcessorError("invalid_input", "Invalid document filename.");
  const tier = settings.tier ?? "standard";
  if (!tiers.has(tier)) throw new ProcessorError("invalid_config", "Unsupported MinerU tier.");
  const budget = processingBudget(timeout(settings, 30 * 60 * 1e3), options.signal);
  const transport = new ProcessorTransport(settings.apiUrl, settings.apiKey, budget.signal);
  let jobId;
  const progress = (stage) => options.onProgress?.({ stage, ...jobId ? { jobId } : {} });
  try {
    checkProcessingAbort(budget.signal);
    progress("checking");
    const supported = await capabilities(transport);
    if (!supported.tiers.includes(tier)) throw new ProcessorError("unsupported_capability", "The selected MinerU tier is not advertised by this service.");
    let result;
    if (options.resumeJobId) {
      jobId = identifier(options.resumeJobId);
      progress("parsing");
      result = await transport.json(`/v1/parse/jobs/${jobId}`, { missingJob: true });
    } else {
      progress("uploading");
      const sourceHash = processingHash(bytes);
      let upload = await transport.json("/v1/uploads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: name, bytes: bytes.byteLength, mime_type: mimeType(name), purpose: "parse", sha256sum: sourceHash }),
        ambiguousSubmission: true
      });
      const uploadId = identifier(upload.id);
      if (upload.status === "pending") {
        if (typeof upload.upload_url !== "string" || upload.upload_url.length > 8192 || upload.upload_method !== void 0 && upload.upload_method !== null && upload.upload_method !== "PUT") {
          throw new ProcessorError("invalid_response", "MinerU returned an invalid upload destination.");
        }
        const uploadUrl = processorUrl(upload.upload_url, transport.base);
        if (transport.base.protocol === "https:" && uploadUrl.protocol !== "https:") throw new ProcessorError("invalid_response", "Refused an insecure document upload.");
        await transport.bytes(uploadUrl, { method: "PUT", headers: uploadHeaders(upload.upload_headers), body: bytes });
        upload = await transport.json(`/v1/uploads/${uploadId}/complete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sha256sum: sourceHash }), ambiguousSubmission: true });
        if (identifier(upload.id) !== uploadId) throw new ProcessorError("invalid_response", "MinerU completed a different upload.");
      }
      if (upload.status !== "completed") throw new ProcessorError("invalid_response", "MinerU upload did not complete.");
      if (upload.sha256sum !== void 0 && upload.sha256sum !== null && upload.sha256sum !== sourceHash) throw new ProcessorError("invalid_response", "MinerU upload hash does not match the source.");
      const sourceId = fileId(upload, bytes.byteLength);
      result = await transport.json("/v1/parse/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files: [{ source: { type: "file_id", file_id: sourceId }, page_range: "all" }], tier, output_formats: ["zip"] }),
        ambiguousSubmission: true
      });
      try {
        jobId = job(result).id;
      } catch {
        throw new ProcessorError("submission_unknown", "MinerU job submission returned an invalid envelope; it was not resubmitted automatically.");
      }
      progress("parsing");
    }
    let state = job(result, jobId).status;
    while (state === "queued" || state === "running") {
      progress(state === "queued" ? "queued" : "parsing");
      await processingDelay(1e3, budget.signal);
      result = await transport.json(`/v1/parse/jobs/${jobId}`, { missingJob: true });
      state = job(result, jobId).status;
    }
    if (state === "canceled") throw new ProcessorError("canceled", "MinerU canceled this processing job.");
    if (state === "failed") throw new ProcessorError("processing_failed", "MinerU could not parse this document. Check the service logs and parser configuration.");
    if (!Array.isArray(result.files) || result.files.length !== 1) throw new ProcessorError("invalid_response", "MinerU returned an unexpected number of file results.");
    const parsed = object(result.files[0]);
    if (parsed.status !== "completed") throw new ProcessorError("processing_failed", "MinerU did not produce a usable result for this document.");
    const output = object(object(parsed.output_files).zip);
    const outputId = identifier(output.file_id);
    if (typeof output.bytes !== "number" || !Number.isInteger(output.bytes) || output.bytes <= 0 || output.bytes > MINERU_ARCHIVE_LIMITS.compressedBytes) {
      throw new ProcessorError("invalid_response", "MinerU ZIP size is invalid or exceeds the safety limit.");
    }
    progress("downloading");
    const archive = await transport.bytes(transport.endpoint(`/v1/files/${outputId}/content`), { allowRedirects: true, maxBytes: MINERU_ARCHIVE_LIMITS.compressedBytes });
    if (archive.byteLength !== output.bytes) throw new ProcessorError("invalid_response", "MinerU ZIP download size does not match the output manifest.");
    progress("normalizing");
    const normalized = await normalizeMineruArchive(archive, bytes, { tier, processorVersion: supported.version, partial: state === "partial", signal: budget.signal });
    checkProcessingAbort(budget.signal);
    progress("completed");
    return normalized;
  } catch (error) {
    const canceled = options.signal?.aborted === true;
    if (canceled && jobId) {
      const cleanup = processingBudget(1500);
      try {
        await new ProcessorTransport(settings.apiUrl, settings.apiKey, cleanup.signal).bytes(transport.endpoint(`/v1/parse/jobs/${jobId}`), { method: "DELETE" });
      } catch {
      } finally {
        cleanup.dispose();
      }
    }
    progress(canceled ? "canceled" : "failed");
    if (canceled) throw new DOMException("Processing canceled.", "AbortError");
    if (budget.signal.aborted) throw budget.signal.reason;
    throw error;
  } finally {
    budget.dispose();
  }
}

// src/knowledge/mineru-runtime.ts
import { spawn } from "node:child_process";
import { access, mkdir as mkdir2, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join as join4 } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// src/knowledge/mineru-python.ts
import { execFile } from "node:child_process";
import { createHash as createHash3 } from "node:crypto";
import { readFile as readFile2, readdir as readdir2, realpath, stat as stat2 } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import { basename, delimiter, isAbsolute as isAbsolute2, join as join3, resolve as resolve2 } from "node:path";
var PROBE = 'import sys,struct,platform,sysconfig,importlib.util,json; print(json.dumps(dict(version=list(sys.version_info[:3]),release=sys.version_info.releaselevel,implementation=platform.python_implementation(),architecture=platform.machine(),bits=struct.calcsize("P")*8,venv=importlib.util.find_spec("venv") is not None,ensurepip=importlib.util.find_spec("ensurepip") is not None,free_threaded=bool(sysconfig.get_config_var("Py_GIL_DISABLED")))))';
var run = (file, args, signal) => new Promise((resolveResult, reject) => {
  const env = {};
  for (const key of ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "WINDIR", "HOME", "USERPROFILE", "LOCALAPPDATA"]) if (process.env[key]) env[key] = process.env[key];
  execFile(file, args, { env, cwd: homedir2(), windowsHide: true, shell: false, timeout: 5e3, killSignal: "SIGKILL", maxBuffer: 64 * 1024, signal }, (error, stdout) => error ? reject(error) : resolveResult(stdout));
});
function validatePythonExecutable(value) {
  if (typeof value !== "string" || value.length > 4096 || !isAbsolute2(value) || /[\0\r\n]/.test(value) || value.startsWith("\\\\") || value.startsWith("//") || !/^python(?:\d+(?:\.\d+)*)?(?:\.exe)?$/i.test(basename(value))) {
    throw new DeploymentError("invalid_python_path", "Select an absolute local Python executable path, not a shell command or directory.");
  }
  if (process.platform === "win32" && value.slice(2).includes(":")) throw new DeploymentError("invalid_python_path", "Alternate data stream paths are not supported.");
  return resolve2(value);
}
function parsePythonProbe(executable, source, output) {
  const data = JSON.parse(output);
  if (!data || !Array.isArray(data.version) || data.version.length !== 3 || !data.version.every((v) => Number.isSafeInteger(v) && Number(v) >= 0) || typeof data.release !== "string" || typeof data.implementation !== "string" || typeof data.architecture !== "string" || ![32, 64].includes(data.bits) || typeof data.venv !== "boolean" || typeof data.ensurepip !== "boolean" || typeof data.free_threaded !== "boolean") throw new Error("Invalid Python probe");
  const result = { executable, source, version: data.version.join("."), implementation: data.implementation, architecture: data.architecture, bits: data.bits, venv: data.venv, ensurepip: data.ensurepip, eligible: false };
  if (data.implementation !== "CPython") result.reason = "implementation_unsupported";
  else if (data.version[0] !== 3 || data.version[1] < 10 || data.version[1] >= 15) result.reason = "version_unsupported";
  else if (data.bits !== 64) result.reason = "architecture_unsupported";
  else if (data.release !== "final") result.reason = "prerelease";
  else if (data.free_threaded) result.reason = "free_threaded";
  else if (!data.venv) result.reason = "venv_missing";
  else if (!data.ensurepip) result.reason = "ensurepip_missing";
  else result.eligible = true;
  result.fingerprint = createHash3("sha256").update(JSON.stringify([executable, result.version, data.implementation, data.architecture, data.bits, data.release, data.free_threaded, data.venv, data.ensurepip])).digest("hex");
  return result;
}
async function probePythonExecutable(value, signal, runner = run, source = "manual") {
  const executable = validatePythonExecutable(value);
  signal?.throwIfAborted();
  try {
    const info = await stat2(executable);
    if (!info.isFile()) throw new Error("Not a file");
    const result = parsePythonProbe(executable, source, await runner(executable, ["-I", "-S", "-c", PROBE], signal));
    result.fingerprint = createHash3("sha256").update(JSON.stringify([result.fingerprint, await realpath(executable), info.size, info.mtimeMs])).digest("hex");
    return result;
  } catch {
    signal?.throwIfAborted();
    return { executable, source, eligible: false, reason: "probe_failed" };
  }
}
function parsePythonLauncherPaths(output) {
  return output.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/([a-zA-Z]:\\.*\\python(?:\d+(?:\.\d+)*)?\.exe)\s*$/i);
    return match ? [match[1]] : [];
  });
}
async function discoverPythonEnvironments(signal) {
  const budget = AbortSignal.any([...signal ? [signal] : [], AbortSignal.timeout(6e4)]);
  const candidates = /* @__PURE__ */ new Map();
  let truncated = false;
  const add = (path, source) => {
    try {
      const normalized = validatePythonExecutable(path);
      if (!candidates.has(normalized)) candidates.set(normalized, source);
    } catch {
    }
  };
  const names = process.platform === "win32" ? ["python.exe", "python3.exe", ...[10, 11, 12, 13, 14].map((v) => `python3.${v}.exe`)] : ["python3", "python", ...[10, 11, 12, 13, 14].map((v) => `python3.${v}`)];
  for (const path of (process.env.PATH ?? process.env.Path ?? "").split(delimiter).slice(0, 128)) {
    if (!path || !isAbsolute2(path) || /[\\/]WindowsApps(?:[\\/]|$)/i.test(path)) continue;
    for (const name of names) add(join3(path, name), "PATH");
  }
  if (process.platform === "win32") {
    try {
      for (const path of parsePythonLauncherPaths(await run("py.exe", ["-0p"], budget))) add(path, "Python launcher");
    } catch {
      signal?.throwIfAborted();
    }
  }
  const home = homedir2();
  try {
    const registry = join3(home, ".conda", "environments.txt");
    if ((await stat2(registry)).size <= 64 * 1024) for (const prefix of (await readFile2(registry, "utf8")).split(/\r?\n/).slice(0, 128)) {
      if (isAbsolute2(prefix.trim())) add(join3(prefix.trim(), process.platform === "win32" ? "python.exe" : "bin/python"), "Conda registry");
    }
  } catch {
  }
  if (process.env.CONDA_PREFIX) add(join3(process.env.CONDA_PREFIX, process.platform === "win32" ? "python.exe" : "bin/python"), "Active Conda");
  const roots = process.platform === "win32" ? [process.env.LOCALAPPDATA && join3(process.env.LOCALAPPDATA, "Programs", "Python"), join3(home, ".conda", "envs"), join3(home, "miniconda3", "envs"), join3(home, "anaconda3", "envs"), join3(home, ".pyenv", "pyenv-win", "versions")] : [join3(home, ".pyenv", "versions"), join3(home, ".local", "share", "uv", "python"), join3(home, "miniconda3", "envs"), join3(home, "anaconda3", "envs"), "/Library/Frameworks/Python.framework/Versions"];
  for (const root of roots) if (root) {
    try {
      const children = await readdir2(root, { withFileTypes: true });
      if (children.length > 64) truncated = true;
      for (const child of children.slice(0, 64)) if (child.isDirectory()) {
        add(join3(root, child.name, process.platform === "win32" ? "python.exe" : "bin/python3"), "Common location");
        if (process.platform !== "win32") add(join3(root, child.name, "bin/python"), "Common location");
      }
    } catch {
    }
  }
  const existing = [];
  const seen = /* @__PURE__ */ new Set();
  for (const [path, source] of candidates) {
    budget.throwIfAborted();
    try {
      if (!(await stat2(path)).isFile()) continue;
      const canonical = await realpath(path);
      const key = process.platform === "win32" ? canonical.toLowerCase() : canonical;
      if (seen.has(key)) continue;
      seen.add(key);
      existing.push([path, source]);
      if (existing.length === 32) {
        truncated = true;
        break;
      }
    } catch {
    }
  }
  const environments = [];
  for (let index = 0; index < existing.length; index += 4) {
    budget.throwIfAborted();
    environments.push(...await Promise.all(existing.slice(index, index + 4).map(([path, source]) => probePythonExecutable(path, budget, run, source))));
  }
  environments.sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.executable.localeCompare(b.executable));
  return { environments, truncated };
}

// src/knowledge/mineru-runtime.ts
function runtimeEnvironment(root, configPath = join4(root, "config.yaml")) {
  const result = {};
  for (const name of ["PATH", "Path", "SYSTEMROOT", "SystemRoot", "WINDIR", "COMSPEC", "PATHEXT", "LANG", "LC_ALL"]) if (process.env[name]) result[name] = process.env[name];
  return {
    ...result,
    HOME: join4(root, "home"),
    USERPROFILE: join4(root, "home"),
    TMP: join4(root, "tmp"),
    TEMP: join4(root, "tmp"),
    TMPDIR: join4(root, "tmp"),
    PYTHONNOUSERSITE: "1",
    PYTHONUTF8: "1",
    MINERU_HOME: join4(root, "home"),
    MINERU_CONFIG: configPath,
    MINERU_MODEL_SOURCE: "local",
    MINERU_MODEL_SMALL_BACKEND: "onnx",
    HF_HUB_OFFLINE: "1",
    HF_HUB_DISABLE_TELEMETRY: "1",
    DO_NOT_TRACK: "1"
  };
}
async function stopOwnedChild(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
  const closed = new Promise((resolve3) => child.once("close", () => resolve3()));
  if (process.platform === "win32") {
    const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore", shell: false });
    await Promise.race([new Promise((resolve3) => {
      killer.once("error", () => resolve3());
      killer.once("close", () => resolve3());
    }), delay(5e3)]);
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
  await Promise.race([closed, delay(3e3)]);
  if (child.exitCode === null && child.signalCode === null) {
    if (process.platform !== "win32") {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    } else child.kill("SIGKILL");
    await Promise.race([closed, delay(3e3)]);
  }
  if (child.exitCode === null && child.signalCode === null) throw new DeploymentError("shutdown_failed", "The owned MinerU process did not exit; its installation remains locked.");
}
async function runManagedCommand(executable, args, root, signal, timeoutMs) {
  signal.throwIfAborted();
  const child = spawn(executable, args, { cwd: root, env: runtimeEnvironment(root), shell: false, windowsHide: true, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  let diagnostic = "";
  child.stdout?.on("data", (chunk) => {
    if (output.length < 4096) output += String(chunk).slice(0, 4096 - output.length);
  });
  child.stderr?.on("data", (chunk) => {
    if (diagnostic.length < 4096) diagnostic += String(chunk).slice(0, 4096 - diagnostic.length);
  });
  const budget = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
  let terminate = () => {
  };
  const interrupted = new Promise((_resolve, reject) => {
    terminate = () => {
      void stopOwnedChild(child).then(() => reject(budget.reason), reject);
    };
    budget.addEventListener("abort", terminate, { once: true });
    if (budget.aborted) terminate();
  });
  try {
    const code = await Promise.race([new Promise((resolve3, reject) => {
      child.once("error", reject);
      child.once("close", resolve3);
    }), interrupted]);
    budget.throwIfAborted();
    if (code !== 0) {
      const detail = diagnostic.trim().split(/\r?\n/).slice(-3).join(" ").replaceAll(root, "<install>").replace(/\b[A-Z]:\\[^\s"'<>]*/g, "<path>").replace(/\/(?:home|Users|tmp|var|opt)\/[^\s"'<>]*/g, "<path>").replace(/(token|password|secret|api[_-]?key)(\s*[:=]\s*)\S+/gi, "$1$2[redacted]").replace(/https?:\/\/[^/\s@]+:[^@\s/]+@/gi, "https://[redacted]@").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ").slice(0, 400);
      throw new DeploymentError("runtime_command_failed", `MinerU environment preparation failed${code === null ? "" : ` (exit ${code})`}.${detail ? ` ${detail}` : ""} Completed model files are preserved.`);
    }
    return output.trim();
  } catch (error) {
    if (signal.aborted) throw error;
    if (budget.aborted) throw new DeploymentError("runtime_timeout", "MinerU environment preparation exceeded its time limit. Verified files and resumable downloads were retained.");
    if (error instanceof DeploymentError) throw error;
    throw new DeploymentError("runtime_launch_failed", "MinerU could not launch the selected Python command. Recheck the interpreter and its permissions.");
  } finally {
    budget.removeEventListener("abort", terminate);
  }
}
async function prepareRuntime(root, environmentId, signal, selected, onValidated, pythonIndexUrl = "https://pypi.org/simple") {
  if (!selected?.eligible || !selected.fingerprint) throw new DeploymentError("python_required", "Select and verify a compatible Python interpreter first.");
  const current = await probePythonExecutable(selected.executable, signal);
  if (!current.eligible || current.fingerprint !== selected.fingerprint) throw new DeploymentError("python_changed", "The selected Python changed or became unavailable. Run preflight again.");
  onValidated?.("interpreter");
  for (const name of ["home", "tmp", "uploads", "envs"]) await mkdir2(await checkDeploymentPath(join4(root, name)), { recursive: true });
  if (!/^[a-f0-9-]{36}$/.test(environmentId)) throw new DeploymentError("invalid_environment", "Invalid environment identifier.");
  const envRoot = await checkDeploymentPath(join4(root, "envs", environmentId));
  await runManagedCommand(selected.executable, ["-I", "-m", "venv", "--copies", envRoot], root, signal, 12e4);
  const python = join4(envRoot, process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  await writeFile(await checkDeploymentPath(join4(envRoot, "config.yaml")), JSON.stringify({ model: { source: "local", base_dir: join4(root, "models"), small_backend: "onnx", vlm: { server_url: "" } }, llm_aided: { api_key: "" } }), { mode: 384 });
  await runManagedCommand(python, ["-I", "-c", "import sys; assert sys.prefix != sys.base_prefix"], root, signal, 15e3);
  onValidated?.("environment");
  await runManagedCommand(python, ["-I", "-m", "pip", "--isolated", "install", "--disable-pip-version-check", "--no-input", "--index-url", pythonIndexUrl, `mineru==${MINERU_RUNTIME_VERSION}`], root, signal, 30 * 6e4);
  await runManagedCommand(python, ["-I", "-m", "pip", "--isolated", "check"], root, signal, 6e4);
  await runManagedCommand(python, ["-I", "-c", `import importlib.metadata as m; assert m.version('mineru') == '${MINERU_RUNTIME_VERSION}'`], root, signal, 3e4);
  onValidated?.("dependencies");
  return envRoot;
}
async function startManagedService(root, envRoot, port, signal) {
  signal.throwIfAborted();
  const socket = createServer();
  await new Promise((resolve3, reject) => {
    socket.once("error", () => reject(new DeploymentError("port_in_use", "MinerU port 18879 is occupied. No existing process was stopped.")));
    socket.listen(port, "127.0.0.1", () => socket.close((error) => error ? reject(error) : resolve3()));
  });
  const apiKey = "";
  const executable = await checkDeploymentPath(join4(envRoot, process.platform === "win32" ? "Scripts/mineru-kit.exe" : "bin/mineru-kit"));
  const environmentConfig = await checkDeploymentPath(join4(envRoot, "config.yaml"));
  const configPath = await access(environmentConfig).then(() => environmentConfig, async () => {
    const legacyConfig = await checkDeploymentPath(join4(root, "config.yaml"));
    await access(legacyConfig);
    return legacyConfig;
  });
  const child = spawn(
    executable,
    ["api-server", "--host", "127.0.0.1", "--port", String(port), "--tier", "basic"],
    { cwd: root, env: runtimeEnvironment(root, configPath), shell: false, windowsHide: true, detached: process.platform !== "win32", stdio: "ignore" }
  );
  let spawnError = false;
  child.on("error", () => {
    spawnError = true;
  });
  const service = { child, url: `http://127.0.0.1:${port}`, apiKey, stop: () => stopOwnedChild(child) };
  const budget = AbortSignal.any([signal, AbortSignal.timeout(12e4)]);
  try {
    while (true) {
      budget.throwIfAborted();
      if (spawnError || child.exitCode !== null || child.signalCode !== null) throw new DeploymentError("service_exited", "The managed service failed to start. Check runtime compatibility or port conflicts.");
      try {
        const capability = await probeMineruLocal({ apiUrl: service.url, apiKey, timeoutMs: 2e3 }, budget);
        if (capability.version !== MINERU_RUNTIME_VERSION || !capability.tiers.includes("basic")) throw new DeploymentError("unsupported_service", "Unexpected MinerU service version or tier.");
        return service;
      } catch (error) {
        if (error instanceof DeploymentError) throw error;
      }
      await delay(500, void 0, { signal: budget });
    }
  } catch (error) {
    await service.stop();
    throw error;
  }
}
function syntheticMineruPdf() {
  const content = "BT /F1 18 Tf 50 730 Td (Synthetic public evidence fixture) Tj 0 -36 Td /F1 12 Tf (Sample A has mass 42 kg.) Tj ET";
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${Buffer.byteLength(content)} >>
stream
${content}
endstream`];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((object2, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj
${object2}
endobj
`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
${offsets.map((value) => `${String(value).padStart(10, "0")} 00000 n 
`).join("")}trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xref}
%%EOF
`;
  return Buffer.from(pdf);
}
async function probeManagedService(service, signal) {
  const output = await extractWithMineruLocal(syntheticMineruPdf(), "synthetic-public-evidence.pdf", { apiUrl: service.url, apiKey: service.apiKey, tier: "basic", timeoutMs: 10 * 6e4 }, { signal });
  if (!output.document.blocks.some((block) => block.pageIndex === 0 && /42\s*kg/.test(block.text))) throw new DeploymentError("probe_failed", "The synthetic PDF did not preserve its expected text and page evidence.");
}

// src/knowledge/mineru-deployment.ts
var defaults = {
  plan: createDeploymentPlan,
  download: downloadMineruModels,
  prepare: prepareRuntime,
  start: startManagedService,
  probe: probeManagedService,
  inspectPython: probePythonExecutable,
  validate: async (root, signal) => {
    for (const file of MINERU_BASIC_FILES) if (!await verifyModelFile(join5(root, "models", MINERU_MODEL_DIRECTORY), file, signal)) throw new DeploymentError("model_changed", "A verified model file changed; prepare again.");
  }
};
async function atomicJson(path, value) {
  await checkDeploymentPath(path);
  await mkdir3(dirname3(path), { recursive: true });
  const temp = `${path}.${randomUUID2()}.tmp`;
  const handle = await open2(temp, "wx", 384);
  try {
    await handle.writeFile(JSON.stringify(value));
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename2(temp, path);
}
var MineruDeployment = class {
  constructor(pointerPath, dependencies = {}, sourceSettings = () => ({})) {
    this.pointerPath = pointerPath;
    this.sourceSettings = sourceSettings;
    this.deps = { ...defaults, ...dependencies };
  }
  checking = false;
  controller;
  plans = /* @__PURE__ */ new Map();
  state = { phase: "absent", service: "stopped", active: false };
  task;
  service;
  environmentId;
  releaseLock;
  initialization;
  disposed = false;
  deps;
  async status() {
    if (!this.initialization) this.initialization = this.initialize();
    await this.initialization;
    return structuredClone(this.state);
  }
  async initialize() {
    try {
      const pointer = this.pointerPath?.();
      if (pointer) {
        await checkDeploymentPath(pointer);
        const { root } = JSON.parse(await readFile3(pointer, "utf8"));
        if (typeof root === "string") await this.restore(root);
      }
    } catch (error) {
      if (error.code !== "ENOENT") this.state.error = { code: "state_unavailable", message: "Saved deployment could not be verified. Select its directory and run preflight." };
    }
  }
  async restore(root) {
    await checkOwnedRoot(root);
    const path = await checkDeploymentPath(join5(root, "deployment.json"));
    const saved = JSON.parse(await readFile3(path, "utf8"));
    if (saved.schemaVersion !== 1 || saved.runtimeVersion !== MINERU_RUNTIME_VERSION || saved.revision !== MINERU_MODEL_REVISION || typeof saved.status.root !== "string" || !sameDeploymentPath(saved.status.root, root) || saved.environmentId !== void 0 && !/^[a-f0-9-]{36}$/.test(saved.environmentId)) throw new DeploymentError("invalid_state", "Incompatible deployment state.");
    this.environmentId = saved.environmentId;
    const lockPath = await checkDeploymentPath(join5(root, ".operation.lock"));
    const lockExists = await readFile3(lockPath).then(() => true, (error) => {
      if (error.code === "ENOENT") return false;
      throw error;
    });
    this.state = { root, phase: lockExists ? "interrupted" : saved.status.phase === "ready" ? "ready" : "interrupted", verifiedAt: saved.status.verifiedAt, active: false, service: "stopped" };
    const validation = saved.status.validation;
    if (validation && ["interpreter", "environment", "dependencies", "inference"].every((key) => typeof validation[key] === "boolean")) {
      this.state.validation = { interpreter: validation.interpreter, environment: validation.environment, dependencies: validation.dependencies, inference: validation.inference };
    }
    if (lockExists || saved.status.active || saved.status.service !== "stopped") this.state.error = { code: "reconciliation_required", message: "Previous operation may have been interrupted. Its process lock must be reconciled before another operation; no process was killed automatically." };
  }
  async persist(inactive = false) {
    if (!this.state.root) return;
    await atomicJson(join5(this.state.root, "deployment.json"), { schemaVersion: 1, runtimeVersion: MINERU_RUNTIME_VERSION, revision: MINERU_MODEL_REVISION, environmentId: this.environmentId, status: { ...this.state, active: inactive ? false : this.state.active, endpoint: void 0 } });
  }
  async pythonEnvironments(executable) {
    this.assertIdle();
    this.checking = true;
    const controller = this.controller = new AbortController();
    try {
      return executable ? { environments: [await this.deps.inspectPython(executable, controller.signal)], truncated: false } : await discoverPythonEnvironments(controller.signal);
    } finally {
      this.checking = false;
      this.controller = void 0;
    }
  }
  async preflight(input) {
    await this.status();
    this.assertIdle();
    if (this.service || this.releaseLock) throw new DeploymentError("service_running", "Stop the managed service before changing deployment paths.", 409);
    this.checking = true;
    const controller = this.controller = new AbortController();
    const timeout2 = setTimeout(() => controller.abort(), 5 * 6e4);
    timeout2.unref();
    try {
      const plan = await this.deps.plan(input, { signal: controller.signal });
      if (input.pythonExecutable) plan.python = await this.deps.inspectPython(input.pythonExecutable, controller.signal);
      if (!plan.python?.eligible) plan.blockers.push(plan.python ? `python_${plan.python.reason}` : "python_required");
      this.plans.clear();
      this.plans.set(plan.id, plan);
      return structuredClone(plan);
    } finally {
      clearTimeout(timeout2);
      this.controller = void 0;
      this.checking = false;
    }
  }
  assertIdle() {
    if (this.disposed) throw new DeploymentError("disposed", "Deployment management is closing.", 409);
    if (this.checking || this.state.active) throw new DeploymentError("busy", "A MinerU operation is already running.", 409);
  }
  async unlock() {
    await this.releaseLock?.();
  }
  async lock(root) {
    if (this.releaseLock) throw new DeploymentError("installation_locked", "The owned process lock has not been released.", 409);
    await checkOwnedRoot(root);
    await mkdir3(root, { recursive: true });
    const markerPath = await checkDeploymentPath(join5(root, OWNERSHIP_MARKER));
    try {
      const handle2 = await open2(markerPath, "wx", 384);
      try {
        await handle2.writeFile(JSON.stringify({ owner: "dsh-knowledge/mineru", schemaVersion: 1, root }));
      } finally {
        await handle2.close();
      }
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    const lockPath = await checkDeploymentPath(join5(root, ".operation.lock"));
    let handle;
    try {
      handle = await open2(lockPath, "wx", 384);
    } catch (error) {
      if (error.code === "EEXIST") throw new DeploymentError("installation_locked", "Another process or interrupted operation owns this installation. Do not delete its lock until its processes have been checked.", 409);
      throw error;
    }
    this.releaseLock = async () => {
      await handle.close();
      await unlink(lockPath);
      this.releaseLock = void 0;
    };
    await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: Date.now() }));
  }
  async prepare(planId) {
    this.assertIdle();
    if (this.releaseLock) throw new DeploymentError("installation_locked", "The previous process requires reconciliation.", 409);
    if (this.service) throw new DeploymentError("service_running", "Stop MinerU before preparation.", 409);
    const plan = this.plans.get(planId);
    if (!plan || plan.expiresAt < Date.now()) throw new DeploymentError("plan_expired", "Run preflight again before preparing.", 409);
    if (plan.blockers.length) throw new DeploymentError("plan_blocked", "Resolve the preflight blockers first.", 409);
    const sources = this.sourceSettings();
    if (resolveHuggingFaceEndpoint(sources.hfEndpoint) !== plan.modelEndpoint || resolvePythonIndexUrl(sources.pythonIndexUrl) !== plan.pythonIndexUrl) {
      this.plans.delete(planId);
      throw new DeploymentError("plan_stale", "A download source changed after preflight. Run preflight again to review the active sources.", 409);
    }
    const previousState = structuredClone(this.state);
    const previousEnvironmentId = this.environmentId;
    this.state = {
      root: plan.root,
      phase: "preparing_environment",
      service: "stopped",
      active: true,
      operationId: randomUUID2(),
      python: plan.python,
      validation: { interpreter: false, environment: false, dependencies: false, inference: false }
    };
    this.controller = new AbortController();
    const signal = this.controller.signal;
    try {
      await this.lock(plan.root);
      signal.throwIfAborted();
    } catch (error) {
      this.failure(error, signal);
      if (this.releaseLock) {
        try {
          if (previousState.phase === "ready" && previousState.root && previousEnvironmentId) {
            const operationError = this.state.error;
            this.state = { ...previousState, active: true, service: "stopped", error: operationError };
            this.environmentId = previousEnvironmentId;
            if (sameDeploymentPath(previousState.root, plan.root)) await this.persist(true);
          } else await this.persist(true);
          await this.unlock();
        } catch {
          this.state.phase = "failed";
          this.state.error = { code: "state_write_failed", message: "Deployment setup could not be saved or safely unlocked. Its installation remains locked for reconciliation." };
        }
      } else if (error instanceof DeploymentError && error.code === "installation_locked") {
        if (previousState.phase === "ready" && previousState.root && previousEnvironmentId) {
          this.state = { ...previousState, active: true, service: "stopped", error: this.state.error };
          this.environmentId = previousEnvironmentId;
        } else this.state.phase = "interrupted";
      }
      this.state.active = false;
      this.controller = void 0;
      throw error;
    }
    this.plans.delete(planId);
    this.task = this.performPrepare(plan, this.controller.signal, previousState, previousEnvironmentId);
    return structuredClone(this.state);
  }
  async performPrepare(plan, signal, previousState, previousEnvironmentId) {
    let probeService;
    let committed = false;
    try {
      const environmentId = randomUUID2();
      if (!plan.python?.eligible) throw new DeploymentError("python_required", "Select a compatible Python interpreter.");
      const current = await this.deps.inspectPython(plan.python.executable, signal);
      if (!current.eligible || current.fingerprint !== plan.python.fingerprint) throw new DeploymentError("python_changed", "Selected interpreter changed. Run preflight again; no alternate Python was selected.");
      this.state.validation.interpreter = true;
      const environment = await this.deps.prepare(plan.root, environmentId, signal, plan.python, (step) => {
        this.state.validation[step] = true;
      }, plan.pythonIndexUrl);
      signal.throwIfAborted();
      this.state.phase = "downloading";
      await this.deps.download(plan, signal, (progress) => {
        Object.assign(this.state, progress);
      });
      this.state.phase = "probing";
      probeService = await this.deps.start(plan.root, environment, 18879, signal);
      await this.deps.probe(probeService, signal);
      this.state.validation.inference = true;
      await probeService.stop();
      probeService = void 0;
      signal.throwIfAborted();
      this.environmentId = environmentId;
      this.state.phase = "ready";
      this.state.verifiedAt = Date.now();
      this.state.error = void 0;
      await this.persist(true);
      if (this.pointerPath) await atomicJson(this.pointerPath(), { root: plan.root });
      committed = true;
    } catch (error) {
      this.failure(error, signal);
    } finally {
      let stopped = this.state.error?.code !== "shutdown_failed";
      try {
        await probeService?.stop();
      } catch {
        stopped = false;
        this.state.error = { code: "shutdown_failed", message: "Owned process may still be running; installation remains locked." };
      }
      if (!committed && previousState.phase === "ready" && previousState.root && previousEnvironmentId) {
        const operationError = this.state.error ?? { code: "preparation_failed", message: "Preparation failed; the previously verified installation remains available." };
        this.state = { ...previousState, phase: stopped ? "ready" : "interrupted", active: true, service: "stopped", endpoint: void 0, error: operationError };
        this.environmentId = previousEnvironmentId;
        if (sameDeploymentPath(previousState.root, plan.root)) {
          try {
            await this.persist(true);
          } catch {
            this.state.error = { code: "state_write_failed", message: "The prior verified installation remains in memory, but its saved state could not be refreshed." };
          }
        }
      } else if (!committed) {
        try {
          await this.persist(true);
        } catch {
          this.state.phase = "failed";
          this.state.error = { code: "state_write_failed", message: "Deployment state could not be saved. Run preflight before retrying." };
        }
      }
      if (stopped) await this.releaseLock?.().catch(() => {
      });
      this.state.active = false;
      this.controller = void 0;
    }
  }
  failure(error, signal) {
    this.state.phase = signal.aborted ? "canceled" : "failed";
    this.state.error = error instanceof DeploymentError ? { code: error.code, message: error.message } : { code: signal.aborted ? "canceled" : "preparation_failed", message: signal.aborted ? "Canceled. Verified models and partial downloads were retained." : "Preparation failed. Verified models and partial downloads were retained; run preflight before retrying." };
  }
  cancel() {
    this.controller?.abort();
    return structuredClone(this.state);
  }
  async start() {
    await this.status();
    this.assertIdle();
    if (this.service) return structuredClone(this.state);
    if (this.releaseLock) throw new DeploymentError("installation_locked", "The previous process requires reconciliation.", 409);
    if (this.state.phase !== "ready" || !this.state.root || !this.environmentId) throw new DeploymentError("not_ready", "Prepare and validate this installation first.", 409);
    const root = this.state.root;
    this.state.active = true;
    this.state.service = "starting";
    this.controller = new AbortController();
    const signal = this.controller.signal;
    try {
      await this.lock(root);
      await this.persist();
    } catch (error) {
      this.state.active = false;
      this.state.service = "error";
      this.failure(error, signal);
      if (this.releaseLock) await this.unlock().catch(() => {
      });
      else if (error instanceof DeploymentError && error.code === "installation_locked") this.state.phase = "interrupted";
      this.controller = void 0;
      throw error;
    }
    this.task = (async () => {
      try {
        await this.deps.validate(root, signal);
        const environment = await checkDeploymentPath(join5(root, "envs", this.environmentId));
        const service = await this.deps.start(root, environment, 18879, signal);
        this.service = service;
        this.state.service = "running";
        this.state.endpoint = service.url;
        this.state.error = void 0;
        service.child.once("exit", () => {
          if (this.service !== service || this.state.service === "stopping") return;
          this.service = void 0;
          this.state.service = "error";
          this.state.endpoint = void 0;
          this.state.error = { code: "service_exited", message: "The managed service exited unexpectedly; its process lock is retained for reconciliation." };
          void this.persist().catch(() => {
          });
        });
      } catch (error) {
        this.failure(error, signal);
        if (this.state.error?.code !== "model_changed") this.state.phase = "ready";
        this.state.service = "error";
        if (this.state.error?.code !== "shutdown_failed") await this.releaseLock?.().catch(() => {
        });
      } finally {
        this.state.active = false;
        this.controller = void 0;
        await this.persist().catch(() => {
        });
      }
    })();
    return structuredClone(this.state);
  }
  async stop() {
    this.controller?.abort();
    await this.task;
    const service = this.service;
    if (service) {
      this.state.service = "stopping";
      this.state.active = true;
      try {
        await service.stop();
        this.service = void 0;
        this.state.service = "stopped";
        this.state.endpoint = void 0;
        await this.releaseLock?.();
      } finally {
        this.state.active = false;
        await this.persist();
      }
    }
    return structuredClone(this.state);
  }
  connection() {
    if (!this.service || this.state.service !== "running") throw new DeploymentError("service_not_running", "Start the managed service first.", 409);
    return { mineruLocalUrl: this.service.url, mineruLocalApiKey: this.service.apiKey };
  }
  async dispose() {
    this.disposed = true;
    this.controller?.abort();
    await this.stop();
    this.plans.clear();
  }
};
async function probeManagedMineruParse(connection, signal) {
  const output = await extractWithMineruLocal(
    syntheticMineruPdf(),
    "managed-smoke-fixture.pdf",
    { apiUrl: connection.mineruLocalUrl, apiKey: connection.mineruLocalApiKey, tier: "basic", timeoutMs: 10 * 6e4 },
    { signal }
  );
  if (!output.document.blocks.some((block) => block.pageIndex === 0 && /42\s*kg/.test(block.text))) throw new DeploymentError("probe_failed", "MinerU did not preserve the expected text and page evidence in the managed smoke fixture.");
}
export {
  MINERU_MODEL_REVISION,
  MINERU_RUNTIME_VERSION,
  MineruDeployment,
  probeManagedMineruParse
};
//# sourceMappingURL=mineru-deployment.mjs.map
