var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/knowledge/text-safety.ts
function snapSliceStart(text, index) {
  return index > 0 && index < text.length && isHighSurrogate(text.charCodeAt(index - 1)) && isLowSurrogate(text.charCodeAt(index)) ? index + 1 : index;
}
function snapSliceEnd(text, index) {
  return index > 0 && index < text.length && isHighSurrogate(text.charCodeAt(index - 1)) && isLowSurrogate(text.charCodeAt(index)) ? index - 1 : index;
}
function ensureWellFormed(text) {
  return text.replace(LONE_SURROGATE, "\uFFFD");
}
var LONE_SURROGATE, isHighSurrogate, isLowSurrogate;
var init_text_safety = __esm({
  "src/knowledge/text-safety.ts"() {
    "use strict";
    LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
    isHighSurrogate = (code) => code >= 55296 && code <= 56319;
    isLowSurrogate = (code) => code >= 56320 && code <= 57343;
  }
});

// src/knowledge/net.ts
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
function applyGlobalProxy() {
  if (proxyApplied) return;
  proxyApplied = true;
  const proxy = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
  if (proxy === void 0 || proxy.trim() === "") return;
  try {
    setGlobalDispatcher(new EnvHttpProxyAgent());
  } catch {
  }
}
async function httpFetch(url, options = {}) {
  const { method, headers, body, redirect, signal } = options;
  const timeoutMs = positiveDuration(options.timeoutMs, 3e4);
  const retries = nonNegativeInteger(options.retries, 1);
  const deadlineAt = options.deadlineAt !== void 0 && Number.isFinite(options.deadlineAt) ? options.deadlineAt : void 0;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    throwIfExternallyAborted(signal);
    const remainingMs = deadlineAt !== void 0 ? Math.ceil(deadlineAt - Date.now()) : timeoutMs;
    if (remainingMs <= 0) {
      lastError = new DOMException("The operation timed out", "TimeoutError");
      break;
    }
    const attemptTimeoutMs = Math.max(1, Math.min(timeoutMs, remainingMs));
    try {
      return await fetch(url, {
        method,
        headers,
        body,
        signal: signal !== void 0 ? AbortSignal.any([signal, AbortSignal.timeout(attemptTimeoutMs)]) : AbortSignal.timeout(attemptTimeoutMs),
        ...redirect !== void 0 ? { redirect } : {}
      });
    } catch (error) {
      throwIfExternallyAborted(signal);
      lastError = error;
    }
  }
  throw new Error(`network request failed: ${describeNetworkError(lastError)}`);
}
function positiveDuration(value, fallback) {
  if (value === void 0 || !Number.isFinite(value) || value <= 0) return fallback;
  return Math.max(1, Math.trunc(value));
}
function nonNegativeInteger(value, fallback) {
  if (value === void 0 || !Number.isFinite(value) || value < 0) return fallback;
  return Math.trunc(value);
}
function throwIfExternallyAborted(signal) {
  if (signal?.aborted !== true) return;
  if (signal.reason instanceof Error) throw signal.reason;
  throw new DOMException("The operation was aborted", "AbortError");
}
function describeNetworkError(error) {
  if (!(error instanceof Error)) return String(error);
  const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
  const cause = error.cause;
  if (cause !== void 0) {
    const causeText = cause instanceof Error ? cause.message : String(cause);
    return timedOut ? `timeout (${causeText})` : `${error.message} (${causeText})`;
  }
  return timedOut ? "timeout" : error.message;
}
var proxyApplied;
var init_net = __esm({
  "src/knowledge/net.ts"() {
    "use strict";
    proxyApplied = false;
  }
});

// src/knowledge/local-model-runtime.ts
var LOCAL_MODEL_RUNTIME;
var init_local_model_runtime = __esm({
  "src/knowledge/local-model-runtime.ts"() {
    "use strict";
    LOCAL_MODEL_RUNTIME = Object.freeze({
      transformers: "4.3.1",
      onnxruntime: "1.30.0"
    });
  }
});

// src/knowledge/embed-protocol.ts
function isLocalEmbedResponse(value) {
  if (value === null || typeof value !== "object") return false;
  const response = value;
  return response.protocolVersion === LOCAL_EMBED_PROTOCOL_VERSION && typeof response.id === "number" && Number.isInteger(response.id) && ["download", "load", "embed", "release", "shutdown"].includes(String(response.operation)) && typeof response.ok === "boolean";
}
function isLocalEmbedProgress(value) {
  if (value === null || typeof value !== "object") return false;
  const event = value;
  return event.type === "progress" && typeof event.modelId === "string" && ["idle", "downloading", "ready", "error"].includes(String(event.status)) && typeof event.progress === "number" && typeof event.message === "string";
}
var LOCAL_EMBED_PROTOCOL_VERSION;
var init_embed_protocol = __esm({
  "src/knowledge/embed-protocol.ts"() {
    "use strict";
    LOCAL_EMBED_PROTOCOL_VERSION = 1;
  }
});

// src/knowledge/rerank-protocol.ts
function isProgressEvent(value) {
  if (value === null || typeof value !== "object") return false;
  const event = value;
  return event.protocolVersion === LOCAL_RERANK_PROTOCOL_VERSION && event.event === "progress" && typeof event.modelId === "string" && typeof event.status === "string" && typeof event.progress === "number" && typeof event.message === "string";
}
function isResponseEnvelope(value) {
  if (value === null || typeof value !== "object") return false;
  const response = value;
  return response.protocolVersion === LOCAL_RERANK_PROTOCOL_VERSION && typeof response.id === "number" && typeof response.operation === "string" && typeof response.ok === "boolean";
}
var LOCAL_RERANK_PROTOCOL_VERSION;
var init_rerank_protocol = __esm({
  "src/knowledge/rerank-protocol.ts"() {
    "use strict";
    LOCAL_RERANK_PROTOCOL_VERSION = 1;
  }
});

// src/knowledge/local-rerank.ts
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
function localRerankChildIsWarm() {
  return child !== null && childWarm;
}
function notifyChildGone(modelId) {
  if (modelId === void 0) return;
  childGoneListener?.(modelId);
}
function abortError(signal) {
  return signal.reason instanceof Error ? signal.reason : new DOMException("The operation was aborted", "AbortError");
}
function processPath() {
  return fileURLToPath(new URL("./rerank-process.mjs", import.meta.url));
}
function clearIdleTimer() {
  if (idleTimer !== null) clearTimeout(idleTimer);
  idleTimer = null;
}
function armIdleTimer() {
  clearIdleTimer();
  if (rerankIdleTimeoutMs <= 0 || active !== null || queue.length > 0 || child === null) return;
  idleTimer = setTimeout(() => {
    idleTimer = null;
    terminateChild();
  }, rerankIdleTimeoutMs);
  idleTimer.unref?.();
}
function normalizeChildError(response) {
  const supported = ["invalid_response", "runtime_error"];
  const code = supported.includes(response.error.code) ? response.error.code : "runtime_error";
  return new LocalRerankError(code, response.error.message, response.error.retryable);
}
function validateSuccess(entry, response) {
  if (response.operation !== entry.operation) {
    throw new LocalRerankError("invalid_response", `local rerank response operation mismatch: expected ${entry.operation}, received ${response.operation}`, false);
  }
  if (response.operation === "rerank") {
    if (!Array.isArray(response.scores) || response.scores.some((score) => typeof score !== "number" || !Number.isFinite(score))) {
      throw new LocalRerankError("invalid_response", "local rerank response contained invalid scores", false);
    }
    const expected = entry.request.operation === "rerank" ? entry.request.texts.length : -1;
    if (response.scores.length !== expected) {
      throw new LocalRerankError("invalid_response", `local rerank score count mismatch: expected ${expected}, received ${response.scores.length}`, false);
    }
    return response.scores;
  }
  if (response.operation === "self_test") {
    const health = response.health;
    if (health?.healthy !== true || !Number.isFinite(health.latencyMs) || !Array.isArray(health.scores) || health.scores.length !== 2 || health.scores.some((score) => !Number.isFinite(score))) {
      throw new LocalRerankError("invalid_response", "local rerank self-test returned an invalid health report", false);
    }
    return health;
  }
  return void 0;
}
function finishActive(error, value) {
  const entry = active;
  if (entry === null) return;
  active = null;
  entry.cleanup();
  if (error !== void 0) entry.reject(error);
  else entry.resolve(value);
  queueMicrotask(pump);
}
function onMessage(message, generation) {
  if (generation !== childGeneration) return;
  if (isProgressEvent(message)) {
    progressListener?.(message);
    return;
  }
  const entry = active;
  if (entry === null) return;
  if (!isResponseEnvelope(message)) {
    finishActive(new LocalRerankError("invalid_response", "local rerank process returned an invalid response envelope", false));
    terminateChild();
    return;
  }
  if (message.id !== entry.id) return;
  if (message.ok === false) {
    finishActive(normalizeChildError(message));
    return;
  }
  try {
    const value = validateSuccess(entry, message);
    if (entry.request.operation === "rerank") childWarm = true;
    finishActive(void 0, value);
  } catch (error) {
    finishActive(error instanceof Error ? error : new Error(String(error)));
    terminateChild();
  }
}
function spawnChild() {
  if (child !== null) return child;
  intentionalExit = false;
  childWarm = false;
  const generation = ++childGeneration;
  const spawned = fork(processPath(), [], {
    stdio: ["ignore", "ignore", "ignore", "ipc"],
    // Host-only eval/test/debug flags can make a file-based fork fail or make
    // every rerank child fight for the same inspector port.
    execArgv: process.execArgv.filter((argument) => argument !== "--test" && !argument.startsWith("--input-type") && !argument.startsWith("--inspect"))
  });
  spawned.on("message", (message) => onMessage(message, generation));
  spawned.unref();
  spawned.on("error", (error) => {
    if (child !== spawned || intentionalExit) return;
    child = null;
    childWarm = false;
    notifyChildGone(active?.request.modelId);
    finishActive(new LocalRerankError("process_crash", `local rerank process failed: ${error.message}`, true));
  });
  spawned.on("exit", (code, signal) => {
    if (child !== spawned) return;
    child = null;
    childWarm = false;
    clearIdleTimer();
    notifyChildGone(active?.request.modelId);
    if (!intentionalExit && active !== null) {
      finishActive(new LocalRerankError("process_crash", `local rerank process exited (${signal ?? code ?? "unknown"})`, true));
    }
    intentionalExit = false;
  });
  child = spawned;
  return spawned;
}
function terminateChild() {
  clearIdleTimer();
  const running = child;
  const served = active?.request.modelId;
  child = null;
  childWarm = false;
  childGeneration += 1;
  if (running === null) {
    notifyChildGone(served);
    return;
  }
  intentionalExit = true;
  running.removeAllListeners("message");
  running.kill("SIGKILL");
  notifyChildGone(served);
}
function pump() {
  if (active !== null) return;
  while (queue.length > 0) {
    const next = queue.shift();
    if (Date.now() >= next.deadline) {
      next.cleanup();
      next.reject(new LocalRerankError("timeout", "local rerank request timed out while queued", true));
      continue;
    }
    active = next;
    clearIdleTimer();
    try {
      spawnChild().send(next.request);
    } catch (error) {
      finishActive(new LocalRerankError("process_crash", error instanceof Error ? error.message : String(error), true));
      terminateChild();
    }
    return;
  }
  armIdleTimer();
}
function callProcess(operation, modelId, cacheDir, hfEndpoint, timeoutMs, input, signal) {
  if (signal?.aborted === true) return Promise.reject(abortError(signal));
  if ((active === null ? 0 : 1) + queue.length >= MAX_QUEUE_SIZE) {
    return Promise.reject(new LocalRerankError("busy", "local rerank queue is full", true));
  }
  const id = ++requestSequence;
  const base = { protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION, id, operation, modelId, cacheDir, hfEndpoint };
  const request = operation === "rerank" ? { ...base, operation, query: input?.query ?? "", texts: input?.texts ?? [] } : { ...base, operation };
  return new Promise((resolve7, reject) => {
    const deadline = Date.now() + timeoutMs;
    let settled = false;
    let entry = {};
    const cleanup = () => {
      clearTimeout(entry.timer);
      signal?.removeEventListener("abort", onAbort);
    };
    const settleResolve = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve7(value);
    };
    const settleReject = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => {
      const error = abortError(signal);
      if (active === entry) {
        active = null;
        entry.reject(error);
        terminateChild();
        queueMicrotask(pump);
        return;
      }
      const index = queue.indexOf(entry);
      if (index >= 0) queue.splice(index, 1);
      entry.reject(error);
    };
    const timer = setTimeout(() => {
      if (active === entry) {
        active = null;
        entry.reject(new LocalRerankError("timeout", "local rerank inference timed out", true));
        terminateChild();
        queueMicrotask(pump);
        return;
      }
      const index = queue.indexOf(entry);
      if (index >= 0) queue.splice(index, 1);
      entry.reject(new LocalRerankError("timeout", "local rerank request timed out while queued", true));
    }, timeoutMs);
    timer.unref?.();
    entry = { id, operation, modelId, request, deadline, timer, cleanup, resolve: settleResolve, reject: settleReject };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted === true) {
      onAbort();
      return;
    }
    queue.push(entry);
    pump();
  });
}
function circuitFor(modelId) {
  const existing = circuits.get(modelId);
  if (existing !== void 0) return existing;
  const created = { failures: 0, openUntil: 0, halfOpenProbe: false };
  circuits.set(modelId, created);
  return created;
}
function enterCircuit(modelId) {
  const state = circuitFor(modelId);
  const now = Date.now();
  if (state.openUntil > now) throw new LocalRerankError("circuit_open", "local rerank is temporarily disabled after repeated failures", true);
  if (state.openUntil > 0) {
    if (state.halfOpenProbe) throw new LocalRerankError("circuit_open", "local rerank recovery probe is already running", true);
    state.halfOpenProbe = true;
  }
}
function circuitSuccess(modelId) {
  circuits.set(modelId, { failures: 0, openUntil: 0, halfOpenProbe: false });
}
function circuitFailure(modelId, error) {
  const state = circuitFor(modelId);
  state.halfOpenProbe = false;
  if (!(error instanceof LocalRerankError) || !["timeout", "process_crash", "runtime_error", "invalid_response"].includes(error.code)) return;
  state.failures += 1;
  if (state.failures >= CIRCUIT_FAILURE_LIMIT) state.openUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
}
function setLocalRerankIdleTimeoutMs(ms) {
  rerankIdleTimeoutMs = Number.isFinite(ms) && ms >= 0 ? Math.trunc(ms) : 6e4;
  armIdleTimer();
}
function setLocalRerankProgressListener(listener) {
  progressListener = listener;
}
function setLocalRerankChildGoneListener(listener) {
  childGoneListener = listener;
}
async function rerankInLocalProcess(modelId, cacheDir, hfEndpoint, query, texts, timeoutMs, signal) {
  enterCircuit(modelId);
  try {
    const scores = await callProcess("rerank", modelId, cacheDir, hfEndpoint, timeoutMs, { query, texts: [...texts] }, signal);
    circuitSuccess(modelId);
    return scores;
  } catch (error) {
    circuitFailure(modelId, error);
    throw error;
  }
}
async function loadLocalReranker(modelId, cacheDir, hfEndpoint) {
  await callProcess("load", modelId, cacheDir, hfEndpoint, 30 * 6e4);
}
async function selfTestLocalReranker(modelId, cacheDir, hfEndpoint) {
  const health = await callProcess("self_test", modelId, cacheDir, hfEndpoint, 5 * 6e4);
  circuitSuccess(modelId);
  return health;
}
async function releaseLocalReranker(modelId, cacheDir, hfEndpoint) {
  if (child === null) return;
  await callProcess("dispose", modelId, cacheDir, hfEndpoint, 3e3).catch(() => {
  });
}
async function cancelLocalReranker(modelId) {
  const cancelled = new LocalRerankError("runtime_error", "local rerank operation cancelled", true);
  queue = queue.filter((entry) => {
    if (entry.modelId !== modelId) return true;
    clearTimeout(entry.timer);
    entry.reject(cancelled);
    return false;
  });
  if (active?.modelId === modelId) {
    const entry = active;
    active = null;
    clearTimeout(entry.timer);
    entry.reject(cancelled);
    terminateChild();
    queueMicrotask(pump);
  }
}
async function disposeLocalRerankProcess() {
  clearIdleTimer();
  const error = new LocalRerankError("process_crash", "local rerank process disposed", true);
  if (active !== null) {
    clearTimeout(active.timer);
    active.reject(error);
    active = null;
  }
  for (const entry of queue) {
    clearTimeout(entry.timer);
    entry.reject(error);
  }
  queue = [];
  terminateChild();
}
var LocalRerankError, MAX_QUEUE_SIZE, CIRCUIT_FAILURE_LIMIT, CIRCUIT_COOLDOWN_MS, circuits, rerankIdleTimeoutMs, child, active, queue, requestSequence, idleTimer, intentionalExit, childGeneration, progressListener, childGoneListener, childWarm;
var init_local_rerank = __esm({
  "src/knowledge/local-rerank.ts"() {
    "use strict";
    init_rerank_protocol();
    LocalRerankError = class extends Error {
      constructor(code, message, retryable) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = "LocalRerankError";
      }
    };
    MAX_QUEUE_SIZE = 16;
    CIRCUIT_FAILURE_LIMIT = 3;
    CIRCUIT_COOLDOWN_MS = 5 * 6e4;
    circuits = /* @__PURE__ */ new Map();
    rerankIdleTimeoutMs = 6e4;
    child = null;
    active = null;
    queue = [];
    requestSequence = 0;
    idleTimer = null;
    intentionalExit = false;
    childGeneration = 0;
    childWarm = false;
  }
});

// src/knowledge/embed.ts
import { createHash as createHash2 } from "node:crypto";
import { mkdir as mkdir2, readFile as readFile2, readdir as readdir2, rename as rename2, rm as rm2, stat as stat2, writeFile as writeFile2 } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join as join2, resolve as resolve2 } from "node:path";
import { fork as fork2 } from "node:child_process";
import { fileURLToPath as fileURLToPath2 } from "node:url";
function setLocalModelCacheDir(dir) {
  cacheDirOverride = dir !== void 0 && dir.trim() !== "" ? resolve2(expandHomePath(dir.trim())) : void 0;
}
function setHfEndpoint(url) {
  hfEndpointOverride = url !== void 0 && url.trim() !== "" ? url.trim().replace(/\/+$/, "") : void 0;
}
function getHfEndpoint() {
  return hfEndpointOverride;
}
function expandHomePath(input) {
  if (input === "~") return homedir();
  if (input.startsWith("~/") || input.startsWith("~\\")) return join2(homedir(), input.slice(2));
  return input;
}
function localModelCacheDir() {
  if (cacheDirOverride !== void 0) return cacheDirOverride;
  const envHome = typeof process !== "undefined" ? process.env.DSH_HOME : void 0;
  const home = envHome !== void 0 && envHome.trim() !== "" ? resolve2(expandHomePath(envHome.trim())) : join2(homedir(), ".dsh");
  return join2(home, "cache", "dsh-knowledge", "local-models");
}
async function embedTexts(provider, baseUrl, model, apiKey, texts, signal) {
  throwIfAborted(signal);
  if (texts.length === 0) return [];
  if (provider === "none") throw new Error('embedding provider is "none" \u2014 configure an endpoint or a local model, or keep lexical search');
  const safeTexts = texts.map(ensureWellFormed);
  if (provider === "local") {
    return await withAbortSignal(embedLocal(model.trim() === "" ? DEFAULT_LOCAL_MODEL : model, safeTexts), signal);
  }
  if (model.trim() === "") throw new Error("embedding model is empty");
  if (provider === "openai") {
    if (baseUrl.trim() === "") throw new Error("embedding base URL is empty");
    return embedOpenAI(baseUrl, model, apiKey, safeTexts, signal);
  }
  if (provider === "ollama") return embedOllama(baseUrl, model, apiKey, safeTexts, signal);
  throw new Error(`unknown embedding provider ${String(provider)}`);
}
function throwIfAborted(signal) {
  if (signal?.aborted !== true) return;
  if (signal.reason instanceof Error) throw signal.reason;
  throw new DOMException("The operation was aborted", "AbortError");
}
async function withAbortSignal(promise, signal) {
  if (signal === void 0) return promise;
  throwIfAborted(signal);
  return await new Promise((resolve7, reject) => {
    const onAbort = () => {
      if (signal.reason instanceof Error) reject(signal.reason);
      else reject(new DOMException("The operation was aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve7(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}
function poolingFor(modelId) {
  const id = modelId.toLowerCase();
  if (id.includes("qwen3")) return "last_token";
  if (id.includes("bge") || id.includes("bce")) return "cls";
  if (id.includes("e5")) return "mean";
  if (id.includes("gte")) return "mean";
  return "mean";
}
function getLocalModelStatus(modelId) {
  return localModelStatus.get(modelId) ?? { model: modelId, status: "idle", progress: 0, message: "" };
}
function markLocalModelError(modelId, message) {
  localModelStatus.set(modelId, { model: modelId, status: "error", progress: 0, message });
}
async function isLocalModelDownloaded(modelId) {
  try {
    const modelRoot = join2(localModelCacheDir(), modelId);
    const [config, onnxEntries, tokenizer] = await Promise.all([
      stat2(join2(modelRoot, "config.json")),
      readdir2(join2(modelRoot, "onnx")),
      Promise.any([
        stat2(join2(modelRoot, "tokenizer.json")),
        stat2(join2(modelRoot, "tokenizer_config.json")),
        stat2(join2(modelRoot, "vocab.txt")),
        stat2(join2(modelRoot, "spiece.model"))
      ])
    ]);
    if (config.size <= 0 || tokenizer.size <= 0) return false;
    for (const name of onnxEntries) {
      if (!name.endsWith(".onnx")) continue;
      if ((await stat2(join2(modelRoot, "onnx", name))).size > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}
function embeddingReadinessPath(modelId) {
  return join2(localModelCacheDir(), modelId, EMBEDDING_READY_FILE);
}
async function localModelFingerprint(modelId) {
  const root = join2(localModelCacheDir(), modelId);
  const files = [];
  const walk = async (directory) => {
    for (const entry of await readdir2(directory, { withFileTypes: true })) {
      if (entry.name === EMBEDDING_READY_FILE) continue;
      const path = join2(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) {
        const metadata = await stat2(path);
        files.push({
          path: path.slice(root.length + 1).replaceAll("\\", "/"),
          size: metadata.size,
          mtimeMs: Math.trunc(metadata.mtimeMs)
        });
      }
    }
  };
  try {
    await walk(root);
    files.sort((a, b) => a.path.localeCompare(b.path));
    return createHash2("sha256").update(JSON.stringify(files)).digest("hex");
  } catch {
    return void 0;
  }
}
async function getLocalEmbeddingReadiness(modelId) {
  try {
    const record = JSON.parse(await readFile2(embeddingReadinessPath(modelId), "utf8"));
    const dimensions = record.dimensions;
    if (record.schemaVersion !== 1 || record.modelId !== modelId || !Number.isInteger(dimensions) || dimensions === void 0 || dimensions <= 0 || typeof record.fingerprint !== "string" || typeof record.validatedAt !== "number" || typeof record.runtime?.node !== "string" || record.runtime.transformers !== LOCAL_MODEL_RUNTIME.transformers || record.runtime.onnxruntime !== LOCAL_MODEL_RUNTIME.onnxruntime) return void 0;
    const fingerprint = await localModelFingerprint(modelId);
    return fingerprint !== void 0 && fingerprint === record.fingerprint ? record : void 0;
  } catch {
    return void 0;
  }
}
async function writeLocalEmbeddingReadiness(modelId, dimensions) {
  const fingerprint = await localModelFingerprint(modelId);
  if (fingerprint === void 0 || dimensions <= 0) return;
  const record = {
    schemaVersion: 1,
    modelId,
    fingerprint,
    dimensions,
    validatedAt: Date.now(),
    runtime: { node: process.versions.node, ...LOCAL_MODEL_RUNTIME }
  };
  const destination = embeddingReadinessPath(modelId);
  const temporary = `${destination}.tmp-${process.pid}-${Date.now()}`;
  await writeFile2(temporary, `${JSON.stringify(record)}
`, "utf8");
  await rename2(temporary, destination);
}
function setLocalWorkerIdleTimeoutMs(ms) {
  localWorkerIdleTimeoutMs = Number.isFinite(ms) && ms >= 0 ? Math.trunc(ms) : 6e4;
  clearIdleTimer2();
  if (localWorkerIdleTimeoutMs > 0 && localWorker !== null) armIdleTimer2();
}
function localWorkerPath() {
  return fileURLToPath2(new URL("./embed-process.mjs", import.meta.url));
}
function stagingCacheDir() {
  return join2(localModelCacheDir(), ".staging");
}
function stagingModelPath(modelId) {
  return join2(stagingCacheDir(), modelId);
}
function clearIdleTimer2() {
  if (localWorkerIdleTimer !== null) {
    clearTimeout(localWorkerIdleTimer);
    localWorkerIdleTimer = null;
  }
}
function failAllPending(error) {
  for (const { reject } of localPending.values()) reject(error);
  localPending.clear();
}
function ensureLocalWorker() {
  if (localWorker !== null) return localWorker;
  const worker = fork2(localWorkerPath(), [], {
    stdio: ["ignore", "ignore", "ignore", "ipc"],
    // Test runners and `--input-type` cannot be forwarded to a child that
    // executes an ESM file. The process needs no debugger inheritance either.
    execArgv: process.execArgv.filter((arg) => !arg.startsWith("--input-type") && !arg.startsWith("--inspect"))
  });
  worker.unref();
  worker.on("message", (message) => {
    if (isLocalEmbedProgress(message)) {
      localModelStatus.set(message.modelId, {
        model: message.modelId,
        status: message.status,
        progress: message.progress,
        message: message.message
      });
      armIdleTimer2();
      reArmActiveRequest?.();
      return;
    }
    if (!isLocalEmbedResponse(message)) {
      const id = message !== null && typeof message === "object" ? message.id : void 0;
      if (typeof id !== "number") return;
      const pending2 = localPending.get(id);
      if (pending2 !== void 0) {
        localPending.delete(id);
        pending2.reject(new Error("local embedding process returned an invalid response envelope"));
        void terminateLocalWorker(new Error("local embedding process returned an invalid response envelope"));
      }
      return;
    }
    const pending = localPending.get(message.id);
    if (pending === void 0) return;
    localPending.delete(message.id);
    if (message.operation !== pending.operation) {
      pending.reject(new Error("local embedding process returned an invalid response operation"));
      void terminateLocalWorker(new Error("local embedding process returned an invalid response operation"));
      return;
    }
    if (message.ok === false) {
      const failure = new Error(`${message.error.code}: ${message.error.message}`);
      if (pending.operation === "load" || pending.operation === "embed") {
        void terminateLocalWorker(failure);
      }
      pending.reject(failure);
      return;
    }
    try {
      if (pending.operation === "embed") {
        pending.resolve(validateEmbeddingResponse(message, pending.expectedCount ?? 0));
      } else {
        pending.resolve(void 0);
      }
    } catch (error) {
      const invalid = error instanceof Error ? error : new Error(String(error));
      pending.reject(invalid);
      void terminateLocalWorker(invalid);
    }
  });
  const onWorkerFailure = (error) => {
    if (localWorker !== worker) return;
    failAllPending(error);
    localWorker = null;
    clearIdleTimer2();
  };
  worker.on("error", (error) => onWorkerFailure(error instanceof Error ? error : new Error(String(error))));
  worker.on("exit", (code, signal) => onWorkerFailure(new Error(`local embedding process exited (${code ?? "null"}${signal === null ? "" : `, ${signal}`})`)));
  localWorker = worker;
  return worker;
}
function validateEmbeddingResponse(response, expectedCount) {
  const vectors = response.ok === true ? response.vectors : void 0;
  if (!Array.isArray(vectors) || vectors.length !== expectedCount) {
    throw new Error("local embedding process returned an invalid vector count");
  }
  let dimension;
  for (const vector of vectors) {
    if (!Array.isArray(vector) || vector.length === 0 || vector.some((value) => !Number.isFinite(value))) {
      throw new Error("local embedding process returned an invalid vector");
    }
    if (dimension === void 0) dimension = vector.length;
    else if (vector.length !== dimension) throw new Error("local embedding process returned inconsistent vector dimensions");
  }
  return vectors;
}
function armIdleTimer2() {
  clearIdleTimer2();
  if (localWorkerIdleTimeoutMs <= 0) return;
  localWorkerIdleTimer = setTimeout(() => {
    localWorkerIdleTimer = null;
    if (localPending.size > 0) {
      armIdleTimer2();
      return;
    }
    if (localWorker === null || localActiveModelId === null) return;
    void callWorker("release", { modelId: localActiveModelId }).catch(() => {
    });
  }, localWorkerIdleTimeoutMs);
  localWorkerIdleTimer.unref?.();
}
function postToWorker(message) {
  const worker = ensureLocalWorker();
  armIdleTimer2();
  if (worker.connected !== true || worker.send(message) !== true) {
    throw new Error("local embedding process is not available");
  }
}
function callWorker(operation, payload) {
  return new Promise((resolve7, reject) => {
    if (localPending.size >= LOCAL_PROCESS_MAX_PENDING) {
      reject(new Error("local embedding process is busy"));
      return;
    }
    const id = ++localRequestSeq;
    const progressAware = operation === "download" || operation === "load";
    let requestTimer;
    const armRequestTimer = () => {
      requestTimer = setTimeout(() => {
        localPending.delete(id);
        void terminateLocalWorker(new Error("local embedding process timed out"));
        reject(new Error("local embedding process timed out"));
      }, LOCAL_WORKER_REQUEST_TIMEOUT_MS);
      requestTimer.unref?.();
    };
    const clearRequestTimer = () => {
      clearTimeout(requestTimer);
      if (progressAware && reArmActiveRequest === armRequestTimer) reArmActiveRequest = void 0;
    };
    if (progressAware) reArmActiveRequest = armRequestTimer;
    armRequestTimer();
    localPending.set(id, {
      operation,
      expectedCount: payload.texts?.length,
      resolve: (value) => {
        clearRequestTimer();
        resolve7(value);
      },
      reject: (error) => {
        clearRequestTimer();
        reject(error);
      }
    });
    localActiveModelId = payload.modelId;
    try {
      postToWorker({
        protocolVersion: LOCAL_EMBED_PROTOCOL_VERSION,
        id,
        operation,
        modelId: payload.modelId,
        cacheDir: payload.cacheDir ?? localModelCacheDir(),
        hfEndpoint: hfEndpointOverride ?? (typeof process !== "undefined" && process.env.HF_ENDPOINT !== void 0 ? process.env.HF_ENDPOINT : void 0),
        texts: payload.texts,
        pooling: payload.pooling
      });
    } catch (error) {
      localPending.delete(id);
      clearRequestTimer();
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
async function embedLocal(modelId, texts) {
  try {
    const vectors = await callWorker("embed", { modelId, texts: [...texts], pooling: poolingFor(modelId) });
    void writeLocalEmbeddingReadiness(modelId, vectors[0]?.length ?? 0).catch(() => {
    });
    return vectors;
  } catch (error) {
    if (!isRecoverableLocalProcessError(error)) throw error;
    const vectors = await callWorker("embed", { modelId, texts: [...texts], pooling: poolingFor(modelId) });
    void writeLocalEmbeddingReadiness(modelId, vectors[0]?.length ?? 0).catch(() => {
    });
    return vectors;
  }
}
async function loadLocalModel(modelId, task = "feature-extraction") {
  if (task === "reranking") {
    await loadLocalReranker(modelId, localModelCacheDir(), hfEndpointOverride ?? process.env.HF_ENDPOINT);
    return;
  }
  if (await isLocalModelDownloaded(modelId)) {
    await callWorker("load", { modelId });
    const probe2 = await callWorker("embed", { modelId, texts: ["dsh local embedding readiness probe"], pooling: poolingFor(modelId) });
    await writeLocalEmbeddingReadiness(modelId, probe2[0]?.length ?? 0);
    return;
  }
  const staging = stagingCacheDir();
  localModelStatus.set(modelId, { model: modelId, status: "downloading", progress: 0, message: "" });
  await callWorker("download", { modelId, cacheDir: staging });
  if (!await isDownloadedAt(stagingModelPath(modelId))) {
    throw new Error("local embedding process completed without a valid model cache");
  }
  await callWorker("release", { modelId, cacheDir: staging });
  const finalPath = join2(localModelCacheDir(), modelId);
  await mkdir2(dirname(finalPath), { recursive: true });
  await rm2(finalPath, { recursive: true, force: true });
  await rename2(stagingModelPath(modelId), finalPath);
  await callWorker("load", { modelId });
  const probe = await callWorker("embed", { modelId, texts: ["dsh local embedding readiness probe"], pooling: poolingFor(modelId) });
  await writeLocalEmbeddingReadiness(modelId, probe[0]?.length ?? 0);
}
async function isDownloadedAt(modelRoot) {
  try {
    const [config, onnxEntries, tokenizer] = await Promise.all([
      stat2(join2(modelRoot, "config.json")),
      readdir2(join2(modelRoot, "onnx")),
      Promise.any([
        stat2(join2(modelRoot, "tokenizer.json")),
        stat2(join2(modelRoot, "tokenizer_config.json")),
        stat2(join2(modelRoot, "vocab.txt")),
        stat2(join2(modelRoot, "spiece.model"))
      ])
    ]);
    if (config.size <= 0 || tokenizer.size <= 0) return false;
    for (const name of onnxEntries) {
      if (name.endsWith(".onnx") && (await stat2(join2(modelRoot, "onnx", name))).size > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}
async function cancelLocalModel(modelId) {
  if (localModelStatus.get(modelId)?.status !== "downloading") return;
  await terminateLocalWorker(new Error("local embedding download cancelled"));
  localModelStatus.set(modelId, { model: modelId, status: "idle", progress: 0, message: "" });
  await rm2(join2(localModelCacheDir(), ".staging", modelId), { recursive: true, force: true }).catch(() => {
  });
}
async function removeLocalModel(modelId) {
  if (localModelStatus.get(modelId)?.status === "downloading") {
    throw new Error("\u6A21\u578B\u6B63\u5728\u4E0B\u8F7D\uFF0C\u5B8C\u6210\u540E\u624D\u80FD\u5220\u9664");
  }
  await withTimeout(callWorker("release", { modelId }), LOCAL_RELEASE_ACK_TIMEOUT_MS).catch(() => {
  });
  localModelStatus.delete(modelId);
  await rm2(join2(localModelCacheDir(), modelId), { recursive: true, force: true });
}
async function terminateLocalWorker(error) {
  const worker = localWorker;
  localWorker = null;
  localActiveModelId = null;
  clearIdleTimer2();
  failAllPending(error);
  if (worker === null) return;
  const processToStop = worker;
  await new Promise((resolve7) => {
    const timer = setTimeout(done, LOCAL_RELEASE_ACK_TIMEOUT_MS);
    timer.unref?.();
    function done() {
      clearTimeout(timer);
      processToStop.removeListener("exit", done);
      resolve7();
    }
    processToStop.once("exit", done);
    try {
      processToStop.kill("SIGTERM");
    } catch {
      done();
    }
  });
}
function isRecoverableLocalProcessError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /process (?:exited|timed out|is not available)|process_crash|runtime_error/i.test(message);
}
function withTimeout(promise, timeoutMs) {
  return new Promise((resolve7, reject) => {
    const timer = setTimeout(() => reject(new Error("local embedding operation timed out")), timeoutMs);
    timer.unref?.();
    promise.then((value) => {
      clearTimeout(timer);
      resolve7(value);
    }, (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
async function disposeLocalModelWorker() {
  clearIdleTimer2();
  const worker = localWorker;
  if (worker === null) return;
  await withTimeout(callWorker("shutdown", { modelId: localActiveModelId ?? "" }), LOCAL_RELEASE_ACK_TIMEOUT_MS).catch(() => {
  });
  if (localWorker === worker) await terminateLocalWorker(new Error("local embedding process disposed"));
}
function hasActiveLocalModelDownload() {
  for (const status of localModelStatus.values()) {
    if (status.status === "downloading") return true;
  }
  return false;
}
async function embedOpenAI(baseUrl, model, apiKey, texts, signal) {
  const url = `${trimBase(baseUrl)}/embeddings`;
  const response = await httpFetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...apiKey ? { authorization: `Bearer ${apiKey}` } : {}
    },
    body: JSON.stringify({ model, input: texts }),
    timeoutMs: 6e4,
    ...signal !== void 0 ? { signal } : {}
  });
  if (!response.ok) {
    throw new Error(`embedding request failed: HTTP ${response.status} ${await response.text()}`);
  }
  const json = await response.json();
  const vectors = (json.data ?? []).map((entry) => entry.embedding);
  if (vectors.length !== texts.length || vectors.some((v) => v === void 0 || v.length === 0)) {
    throw new Error("embedding response did not return one vector per input");
  }
  return vectors.map(normalize);
}
async function embedOllama(baseUrl, model, _apiKey, texts, signal) {
  const base = trimBase(baseUrl.trim() === "" ? "http://127.0.0.1:11434" : baseUrl);
  const response = await httpFetch(`${base}/api/embed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, input: texts }),
    timeoutMs: 6e4,
    ...signal !== void 0 ? { signal } : {}
  });
  if (response.ok) {
    const json = await response.json();
    if (json.embeddings?.length === texts.length) return json.embeddings.map(normalize);
  }
  const vectors = [];
  for (const text of texts) {
    const legacy = await httpFetch(`${base}/api/embeddings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, prompt: text }),
      timeoutMs: 6e4,
      ...signal !== void 0 ? { signal } : {}
    });
    if (!legacy.ok) throw new Error(`ollama embedding failed: HTTP ${legacy.status} ${await legacy.text()}`);
    const json = await legacy.json();
    if (json.embedding === void 0 || json.embedding.length === 0) {
      throw new Error("ollama embedding response missing a vector");
    }
    vectors.push(normalize(json.embedding));
  }
  return vectors;
}
function normalize(vector) {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const length = Math.sqrt(sum);
  if (length === 0) return vector;
  return vector.map((value) => value / length);
}
function trimBase(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}
var DEFAULT_LOCAL_MODEL, cacheDirOverride, hfEndpointOverride, localModelStatus, EMBEDDING_READY_FILE, localWorkerIdleTimeoutMs, LOCAL_WORKER_REQUEST_TIMEOUT_MS, LOCAL_RELEASE_ACK_TIMEOUT_MS, LOCAL_PROCESS_MAX_PENDING, localWorker, localWorkerIdleTimer, localRequestSeq, reArmActiveRequest, localActiveModelId, localPending;
var init_embed = __esm({
  "src/knowledge/embed.ts"() {
    "use strict";
    init_local_model_runtime();
    init_net();
    init_embed_protocol();
    init_local_rerank();
    init_text_safety();
    applyGlobalProxy();
    DEFAULT_LOCAL_MODEL = "onnx-community/Qwen3-Embedding-0.6B-ONNX";
    localModelStatus = /* @__PURE__ */ new Map();
    EMBEDDING_READY_FILE = ".dsh-embedding-ready.json";
    localWorkerIdleTimeoutMs = 6e4;
    LOCAL_WORKER_REQUEST_TIMEOUT_MS = 30 * 6e4;
    LOCAL_RELEASE_ACK_TIMEOUT_MS = 3e3;
    LOCAL_PROCESS_MAX_PENDING = 16;
    localWorker = null;
    localWorkerIdleTimer = null;
    localRequestSeq = 0;
    localActiveModelId = null;
    localPending = /* @__PURE__ */ new Map();
  }
});

// src/knowledge/ocr-protocol.ts
function ocrError(code, message) {
  return Object.assign(new Error(message), { code });
}
var OCR_PROTOCOL_VERSION;
var init_ocr_protocol = __esm({
  "src/knowledge/ocr-protocol.ts"() {
    "use strict";
    OCR_PROTOCOL_VERSION = 1;
  }
});

// src/knowledge/ocr-process-client.ts
import { fork as fork3 } from "node:child_process";
import { fileURLToPath as fileURLToPath3 } from "node:url";
var MAX_PENDING, EXIT_TIMEOUT_MS, OcrProcessClient;
var init_ocr_process_client = __esm({
  "src/knowledge/ocr-process-client.ts"() {
    "use strict";
    init_ocr_protocol();
    MAX_PENDING = 16;
    EXIT_TIMEOUT_MS = 1e4;
    OcrProcessClient = class {
      constructor(modulePath = fileURLToPath3(new URL("./ocr-process.mjs", import.meta.url)), timeoutMs = 5 * 6e4) {
        this.modulePath = modulePath;
        this.timeoutMs = timeoutMs;
      }
      child = null;
      children = /* @__PURE__ */ new Set();
      sequence = 0;
      disposing;
      pending = /* @__PURE__ */ new Map();
      failPending(error) {
        for (const entry of this.pending.values()) entry.reject(error);
        this.pending.clear();
      }
      spawn() {
        if (this.child !== null) return this.child;
        const options = {
          stdio: ["ignore", "ignore", "ignore", "ipc"],
          serialization: "advanced",
          execArgv: [],
          windowsHide: true,
          env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" }
        };
        const child2 = fork3(this.modulePath, [], options);
        this.child = child2;
        this.children.add(child2);
        child2.unref();
        child2.on("message", (value) => {
          if (this.child !== child2) return;
          const message = value;
          if (message === null || typeof message !== "object" || typeof message.id !== "number") return;
          const entry = this.pending.get(message.id);
          if (entry === void 0) return;
          this.pending.delete(message.id);
          if (message.protocolVersion !== OCR_PROTOCOL_VERSION || message.operation !== "recognize") {
            entry.reject(ocrError("ocr_failed", "OCR process returned an invalid response"));
          } else if (message.ok === true && typeof message.text === "string") {
            entry.resolve(message.text);
          } else {
            entry.reject(ocrError("ocr_failed", message.ok === false && typeof message.error === "string" ? message.error : "OCR process failed"));
          }
          if (this.pending.size === 0) child2.channel?.unref();
        });
        const fail = (error) => {
          if (this.child !== child2) return;
          this.child = null;
          this.failPending(error);
          child2.kill("SIGKILL");
        };
        child2.on("error", (error) => {
          if (child2.pid === void 0) this.children.delete(child2);
          fail(ocrError("ocr_process_crash", `OCR process failed: ${error.message}`));
        });
        child2.on("disconnect", () => fail(ocrError("ocr_process_crash", "OCR process disconnected")));
        child2.on("exit", (code, signal) => {
          this.children.delete(child2);
          fail(ocrError("ocr_process_crash", `OCR process exited (${signal ?? code ?? "unknown"})`));
        });
        return child2;
      }
      recognize(png, modelDir) {
        if (this.disposing !== void 0) return Promise.reject(ocrError("ocr_failed", "OCR process is shutting down"));
        if (this.pending.size >= MAX_PENDING) return Promise.reject(ocrError("ocr_busy", "OCR queue is full; retry the document later"));
        return new Promise((resolve7, reject) => {
          const id = ++this.sequence;
          const timer = setTimeout(() => {
            const child2 = this.child;
            this.child = null;
            this.failPending(ocrError("ocr_timeout", "OCR request timed out; the isolated process was stopped"));
            child2?.kill("SIGKILL");
          }, this.timeoutMs);
          this.pending.set(id, {
            resolve: (text) => {
              clearTimeout(timer);
              resolve7(text);
            },
            reject: (error) => {
              clearTimeout(timer);
              reject(error);
            }
          });
          try {
            const child2 = this.spawn();
            child2.channel?.ref();
            child2.send({ protocolVersion: OCR_PROTOCOL_VERSION, id, operation: "recognize", png, modelDir }, (error) => {
              if (error === null || this.child !== child2 || !this.pending.has(id)) return;
              this.child = null;
              this.failPending(ocrError("ocr_process_crash", `OCR request could not be sent: ${error.message}`));
              child2.kill("SIGKILL");
            });
          } catch (error) {
            const child2 = this.child;
            this.child = null;
            this.failPending(ocrError("ocr_process_crash", error instanceof Error ? error.message : String(error)));
            child2?.kill("SIGKILL");
          }
        });
      }
      /** Observe every owned child's exit before model files may be removed. */
      dispose() {
        if (this.disposing !== void 0) return this.disposing;
        this.child = null;
        this.failPending(ocrError("ocr_failed", "OCR process disposed"));
        this.disposing = Promise.all([...this.children].map((child2) => new Promise((resolve7, reject) => {
          if (child2.exitCode !== null || child2.signalCode !== null || child2.pid === void 0) {
            resolve7();
            return;
          }
          const timer = setTimeout(() => {
            child2.off("exit", done);
            reject(new Error("OCR process did not exit; model files were not removed"));
          }, EXIT_TIMEOUT_MS);
          const done = () => {
            clearTimeout(timer);
            resolve7();
          };
          child2.once("exit", done);
          child2.kill("SIGKILL");
        }))).then(() => {
        }).finally(() => {
          this.disposing = void 0;
        });
        return this.disposing;
      }
    };
  }
});

// src/knowledge/ocr.ts
var ocr_exports = {};
__export(ocr_exports, {
  DEFAULT_OCR_MIRROR: () => DEFAULT_OCR_MIRROR,
  MAX_PAGE_RASTER_BYTES: () => MAX_PAGE_RASTER_BYTES,
  buildOcrUrl: () => buildOcrUrl,
  disposeOcrWorker: () => disposeOcrWorker,
  downloadOcrModels: () => downloadOcrModels,
  extractPdfImages: () => extractPdfImages,
  getOcrModelStatus: () => getOcrModelStatus,
  isOcrReady: () => isOcrReady,
  listOcrLanguages: () => listOcrLanguages,
  normalizeRgba: () => normalizeRgba,
  ocrPdfText: () => ocrPdfText,
  ocrRenderScale: () => ocrRenderScale,
  parseCharacterDict: () => parseCharacterDict,
  postprocessOcrText: () => postprocessOcrText,
  prepareForOcr: () => prepareForOcr,
  removeOcrModels: () => removeOcrModels,
  renderPdfPages: () => renderPdfPages,
  rgbaToPng: () => rgbaToPng
});
import { deflateSync } from "node:zlib";
import { mkdir as mkdir3, readdir as readdir3, rename as rename3, rm as rm3, writeFile as writeFile3 } from "node:fs/promises";
import { dirname as dirname2, join as join3 } from "node:path";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
function buildOcrUrl(mirror, repoPath) {
  const base = (mirror === void 0 || mirror.trim() === "" ? DEFAULT_OCR_MIRROR : mirror).trim().replace(/\/+$/, "");
  return `${base}${repoPath}`;
}
function ocrCacheDir() {
  return join3(localModelCacheDir(), "ocr");
}
function ppocrPath(fileName) {
  return join3(ocrCacheDir(), fileName);
}
function parseCharacterDict(yml) {
  const lines = yml.split("\n");
  const idx = lines.findIndex((line) => line.trim() === "character_dict:");
  if (idx < 0) return [];
  const chars = [];
  for (let i = idx + 1; i < lines.length; i += 1) {
    const stripped = lines[i].replace(/^\s+/, "");
    if (!stripped.startsWith("- ")) break;
    let value = stripped.slice(2);
    if (value.length >= 2) {
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    }
    chars.push(value);
  }
  return chars;
}
function getOcrModelStatus() {
  return ocrStatus;
}
function isOcrReady() {
  return PPOCR_FILES.every((file) => existsSync(ppocrPath(file.fileName)));
}
function setOcrStatus(status) {
  ocrStatus = status;
}
async function downloadOcrModels(mirror) {
  if (ocrDownloadInFlight !== null) return ocrDownloadInFlight;
  const run2 = (async () => {
    await mkdir3(ocrCacheDir(), { recursive: true });
    const missing2 = PPOCR_FILES.filter((file) => !existsSync(ppocrPath(file.fileName)));
    if (missing2.length === 0) {
      setOcrStatus({ status: "ready", progress: 100, message: "" });
      return getOcrModelStatus();
    }
    setOcrStatus({ status: "downloading", progress: 0, message: "" });
    let done = 0;
    try {
      for (const file of missing2) {
        await downloadModelFile(file, buildOcrUrl(mirror, file.repoPath), (fraction) => {
          setOcrStatus({
            status: "downloading",
            progress: Math.round((done + fraction) / PPOCR_FILES.length * 100),
            message: ""
          });
        });
        done += 1;
      }
      setOcrStatus({ status: "ready", progress: 100, message: "" });
    } catch (error) {
      setOcrStatus({
        status: "error",
        progress: Math.round(done / PPOCR_FILES.length * 100),
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
    return getOcrModelStatus();
  })();
  ocrDownloadInFlight = run2.finally(() => {
    ocrDownloadInFlight = null;
  });
  return ocrDownloadInFlight;
}
async function removeOcrModels() {
  await disposeOcrWorker();
  setOcrStatus({ status: "idle", progress: 0, message: "" });
  await rm3(ocrCacheDir(), { recursive: true, force: true });
}
async function downloadModelFile(file, url, onProgress) {
  const response = await httpFetch(url, { timeoutMs: 24e4 });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < file.minBytes) {
    throw new Error(`${url} too small (${bytes.length} bytes) \u2014 mirror error page?`);
  }
  const dest = ppocrPath(file.fileName);
  if (file.fileName.endsWith(".txt")) {
    const chars = parseCharacterDict(new TextDecoder("utf-8").decode(bytes));
    if (chars.length < 1e3 || !chars.some((ch) => /[\u4e00-\u9fff]/.test(ch))) {
      throw new Error(`character_dict in inference.yml looks incomplete (${chars.length} entries, no CJK)`);
    }
    await writeFile3(`${dest}.tmp`, `
${chars.join("\n")}
`);
  } else {
    await writeFile3(`${dest}.tmp`, Buffer.from(bytes));
  }
  await rename3(`${dest}.tmp`, dest);
  onProgress(1);
}
function ocrRenderScale(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw ocrError("ocr_incomplete", "OCR page dimensions are invalid");
  }
  const area = width * height;
  if (!Number.isFinite(area) || area <= 0) throw ocrError("ocr_incomplete", "OCR page dimensions are out of range");
  const preferred = area * 9 * 4 <= MAX_PAGE_RASTER_BYTES ? 3 : 1;
  return Math.min(
    preferred,
    Math.sqrt(MAX_PAGE_RASTER_BYTES / (4 * area)) * 0.999,
    MAX_RASTER_DIMENSION / width,
    MAX_RASTER_DIMENSION / height
  );
}
async function loadMupdf() {
  if (mupdfModule !== void 0) return mupdfModule;
  try {
    mupdfModule = await import("mupdf");
  } catch {
    mupdfModule = null;
  }
  return mupdfModule;
}
async function renderPdfPages(bytes, maxPages) {
  const mupdf = await loadMupdf();
  if (mupdf === null) return null;
  let document = null;
  try {
    document = mupdf.Document.openDocument(Uint8Array.from(bytes), "application/pdf");
    const out = [];
    const pageCount = document.countPages();
    if (pageCount > maxPages) throw ocrError("ocr_incomplete", `OCR page limit exceeded (${pageCount} pages, limit ${maxPages}); split the PDF or use MinerU`);
    let totalBytes = 0;
    for (let index = 0; index < pageCount; index += 1) {
      let page = null;
      try {
        page = document.loadPage(index);
        const bounds = page.getBounds();
        let scale = ocrRenderScale(bounds[2] - bounds[0], bounds[3] - bounds[1]);
        let png;
        for (let attempt = 0; attempt < 4; attempt += 1) {
          let pixmap;
          try {
            pixmap = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false);
            png = Buffer.from(pixmap.asPNG());
            break;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (attempt === 3 || !/malloc|memory|allocat/i.test(message)) throw error;
            scale /= 2;
            console.warn(`[dsh-knowledge] page ${index + 1} raster allocation failed; retrying at ${scale}x`);
          } finally {
            pixmap?.destroy();
          }
        }
        if (png === void 0 || png.length === 0) throw new Error("empty page raster");
        if (totalBytes + png.length > MAX_TOTAL_RASTER_BYTES) {
          throw new Error(`raster byte budget exceeded after ${out.length}/${pageCount} pages; split the PDF or use MinerU`);
        }
        out.push({ page: index + 1, png });
        totalBytes += png.length;
      } catch (error) {
        throw ocrError("ocr_incomplete", `OCR page ${index + 1}/${pageCount} render failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        page?.destroy();
      }
    }
    return out;
  } catch (error) {
    if (document !== null) throw error;
    console.warn(`[dsh-knowledge] mupdf render failed, falling back to embedded rasters: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  } finally {
    document?.destroy();
  }
}
async function disposeOcrWorker() {
  await ocrProcess.dispose();
}
async function extractPdfImages(bytes) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    // pdfjs 6 rejects Buffer-typed input — always hand it a plain Uint8Array.
    data: Uint8Array.from(bytes),
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
    // Fake-worker mode cannot derive the image-decoder wasm path by itself on
    // some hosts — point it at pdfjs-dist/wasm explicitly (trailing slash).
    ...pdfjsWasmUrl !== void 0 ? { wasmUrl: pdfjsWasmUrl } : {},
    // CID-font cmaps for CJK PDFs (SimSun etc.) — see pdfjsCMapUrl above.
    ...pdfjsCMapUrl !== void 0 ? { cMapUrl: pdfjsCMapUrl, cMapPacked: true } : {}
  });
  try {
    const doc = await loadingTask.promise;
    const out = [];
    if (doc.numPages > MAX_OCR_PAGES) throw ocrError("ocr_incomplete", `OCR page limit exceeded (${doc.numPages} pages); split the PDF or use MinerU`);
    const pageCount = doc.numPages;
    let totalRasterBytes = 0;
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const ops = await page.getOperatorList();
      for (let i = 0; i < ops.fnArray.length; i += 1) {
        if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
        if (out.length >= MAX_OCR_IMAGES) throw ocrError("ocr_incomplete", `OCR image limit exceeded at page ${pageNumber}; split the PDF or use MinerU`);
        const name = ops.argsArray[i][0];
        const image = await waitForImage(page, name, 5e3);
        if (image === null || image.width <= 0 || image.height <= 0 || !image.data) {
          throw ocrError("ocr_incomplete", `OCR image decoding failed at page ${pageNumber}`);
        }
        const pixels = image.width * image.height;
        if (pixels > MAX_IMAGE_PIXELS) throw ocrError("ocr_incomplete", `OCR image at page ${pageNumber} exceeds the pixel budget`);
        const bytes2 = pixels * 4;
        if (totalRasterBytes + bytes2 > MAX_TOTAL_RASTER_BYTES) throw ocrError("ocr_incomplete", `OCR raster budget exceeded at page ${pageNumber}; split the PDF or use MinerU`);
        totalRasterBytes += bytes2;
        out.push({ width: image.width, height: image.height, data: normalizeRgba(image), page: pageNumber });
      }
    }
    return out;
  } finally {
    await loadingTask.destroy().catch(() => {
    });
  }
}
async function waitForImage(page, name, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (page.objs.has(name)) {
      const resolved = page.objs.get(name);
      if (resolved !== null) return resolved;
    }
    await new Promise((resolve7) => setTimeout(resolve7, 20));
  }
  return null;
}
function normalizeRgba(image) {
  const { width, height, data } = image;
  const expected = width * height;
  if (expected <= 0 || expected > MAX_IMAGE_PIXELS || expected * 4 > 4294967295) {
    throw new Error(`image dimensions out of range: ${width}\xD7${height}`);
  }
  if (data.length >= expected * 4) {
    const rgba2 = new Uint8ClampedArray(expected * 4);
    rgba2.set(data.subarray(0, expected * 4));
    for (let i = 3; i < rgba2.length; i += 4) rgba2[i] = 255;
    return rgba2;
  }
  if (data.length >= expected * 3) {
    const rgba2 = new Uint8ClampedArray(expected * 4);
    for (let i = 0; i < expected; i += 1) {
      rgba2[i * 4] = data[i * 3];
      rgba2[i * 4 + 1] = data[i * 3 + 1];
      rgba2[i * 4 + 2] = data[i * 3 + 2];
      rgba2[i * 4 + 3] = 255;
    }
    return rgba2;
  }
  if (data.length >= expected) {
    const rgba2 = new Uint8ClampedArray(expected * 4);
    for (let i = 0; i < expected; i += 1) {
      const v = data[i] ?? 0;
      rgba2[i * 4] = v;
      rgba2[i * 4 + 1] = v;
      rgba2[i * 4 + 2] = v;
      rgba2[i * 4 + 3] = 255;
    }
    return rgba2;
  }
  const rgba = new Uint8ClampedArray(expected * 4);
  for (let i = 0; i < expected; i += 1) {
    const bit = data[i >> 3] >> 7 - (i & 7) & 1;
    const v = bit === 1 ? 255 : 0;
    rgba[i * 4] = v;
    rgba[i * 4 + 1] = v;
    rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}
function rgbaToPng(width, height, rgba) {
  const rowBytes = 1 + width * 4;
  const raw = Buffer.alloc(height * rowBytes);
  for (let y = 0; y < height; y += 1) {
    raw[y * rowBytes] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * rowBytes + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function crc32(buffer) {
  crcTable ??= (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();
  let crc = 4294967295;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 4294967295) >>> 0;
}
async function ocrPdfText(bytes) {
  if (!isOcrReady()) return "";
  const deadline = Date.now() + MAX_OCR_TOTAL_MS;
  const pageTexts = /* @__PURE__ */ new Map();
  try {
    const rendered = await renderPdfPages(bytes, MAX_OCR_PAGES);
    const recognize = async (page, png) => {
      try {
        const text = postprocessOcrText(await ocrProcess.recognize(png, ocrCacheDir()));
        if (text.length > 0) {
          const bucket = pageTexts.get(page) ?? [];
          bucket.push(text);
          pageTexts.set(page, bucket);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw ocrError(error.code ?? "ocr_failed", `OCR failed for page ${page}: ${message}`);
      }
    };
    if (rendered !== null) {
      for (const { page, png } of rendered) {
        if (Date.now() >= deadline) {
          throw ocrError("ocr_incomplete", `OCR time budget reached after ${pageTexts.size}/${rendered.length} pages; split the PDF or use MinerU`);
        }
        await recognize(page, png);
      }
    } else {
      const images = await extractPdfImages(bytes);
      for (const image of images) {
        if (Date.now() >= deadline) {
          throw ocrError("ocr_incomplete", `OCR time budget reached after ${pageTexts.size} pages; split the PDF or use MinerU`);
        }
        const { width, height, data } = prepareForOcr(image.width, image.height, image.data);
        const png = rgbaToPng(width, height, data);
        await recognize(image.page, png);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[dsh-knowledge] OCR failed for scanned PDF: ${message}`);
    throw ocrError(error.code ?? "ocr_incomplete", `OCR could not process this document completely: ${message}`);
  }
  return [...pageTexts.entries()].sort((a, b) => a[0] - b[0]).map(([, texts]) => texts.join("\n")).join("\n\n");
}
function upscale2x(width, height, rgba) {
  const out = new Uint8ClampedArray(width * height * 4 * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = (y * width + x) * 4;
      const r = rgba[src], g = rgba[src + 1], b = rgba[src + 2], a = rgba[src + 3];
      for (let dy = 0; dy < 2; dy += 1) {
        for (let dx = 0; dx < 2; dx += 1) {
          const dst = ((y * 2 + dy) * width * 2 + (x * 2 + dx)) * 4;
          out[dst] = r;
          out[dst + 1] = g;
          out[dst + 2] = b;
          out[dst + 3] = a;
        }
      }
    }
  }
  return { width: width * 2, height: height * 2, data: out };
}
function prepareForOcr(width, height, rgba) {
  let w = width, h = height, data = rgba;
  if (w < 1200 && h < 800) {
    const up = upscale2x(w, h, data);
    w = up.width;
    h = up.height;
    data = up.data;
  }
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i += 1) {
    gray[i] = Math.round(0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]);
  }
  let min = 255, max = 0;
  for (let i = 0; i < gray.length; i += 1) {
    if (gray[i] < min) min = gray[i];
    if (gray[i] > max) max = gray[i];
  }
  const range = max - min;
  const stretched = new Uint8ClampedArray(w * h);
  if (range > 0) {
    for (let i = 0; i < gray.length; i += 1) {
      stretched[i] = Math.round((gray[i] - min) / range * 255);
    }
  } else {
    stretched.set(gray);
  }
  const sharpened = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const py = Math.min(h - 1, Math.max(0, y + ky));
          sum += stretched[py * w + px] * SHARPEN_KERNEL[(ky + 1) * 3 + (kx + 1)];
        }
      }
      sharpened[y * w + x] = Math.min(255, Math.max(0, sum));
    }
  }
  const out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    const v = sharpened[i];
    out[i * 4] = v;
    out[i * 4 + 1] = v;
    out[i * 4 + 2] = v;
    out[i * 4 + 3] = 255;
  }
  return { width: w, height: h, data: out };
}
function postprocessOcrText(text) {
  return text.replace(/([\u4e00-\u9fff\u3400-\u4dbf])[ \t\u3000\u00a0]+(?=[\u4e00-\u9fff\u3400-\u4dbf])/g, "$1");
}
async function listOcrLanguages() {
  let files = [];
  try {
    files = await readdir3(ocrCacheDir());
  } catch {
  }
  const onDisk = new Set(files);
  return PPOCR_FILES.map((file) => ({ lang: file.fileName, ready: onDisk.has(file.fileName) }));
}
var MAX_OCR_PAGES, MAX_OCR_IMAGES, MAX_IMAGE_PIXELS, MAX_TOTAL_RASTER_BYTES, MAX_PAGE_RASTER_BYTES, MAX_RASTER_DIMENSION, MAX_OCR_TOTAL_MS, DEFAULT_OCR_MIRROR, PPOCR_FILES, ocrStatus, ocrDownloadInFlight, ocrProcess, pdfjsWasmUrl, pdfjsCMapUrl, mupdfModule, crcTable, SHARPEN_KERNEL;
var init_ocr = __esm({
  "src/knowledge/ocr.ts"() {
    "use strict";
    init_net();
    init_embed();
    init_ocr_process_client();
    init_ocr_protocol();
    MAX_OCR_PAGES = 100;
    MAX_OCR_IMAGES = 200;
    MAX_IMAGE_PIXELS = 32e6;
    MAX_TOTAL_RASTER_BYTES = 512 * 1024 * 1024;
    MAX_PAGE_RASTER_BYTES = 64 * 1024 * 1024;
    MAX_RASTER_DIMENSION = 8192;
    MAX_OCR_TOTAL_MS = 15 * 6e4;
    DEFAULT_OCR_MIRROR = "https://hf-mirror.com";
    PPOCR_FILES = [
      {
        repoPath: "/PaddlePaddle/PP-OCRv5_mobile_det_onnx/resolve/main/inference.onnx",
        fileName: "ppocrv5_det.onnx",
        minBytes: 1e6
      },
      {
        repoPath: "/PaddlePaddle/PP-OCRv5_mobile_rec_onnx/resolve/main/inference.onnx",
        fileName: "ppocrv5_rec.onnx",
        minBytes: 1e6
      },
      {
        repoPath: "/PaddlePaddle/PP-OCRv5_mobile_rec_onnx/resolve/main/inference.yml",
        fileName: "ppocrv5_dict.txt",
        minBytes: 1e4
      }
    ];
    ocrStatus = { status: "idle", progress: 0, message: "" };
    ocrDownloadInFlight = null;
    ocrProcess = new OcrProcessClient();
    pdfjsWasmUrl = (() => {
      try {
        const require2 = createRequire(import.meta.url);
        const pkg = require2.resolve("pdfjs-dist/package.json");
        return `${dirname2(pkg).replace(/\\/g, "/")}/wasm/`;
      } catch {
        return void 0;
      }
    })();
    pdfjsCMapUrl = (() => {
      try {
        const require2 = createRequire(import.meta.url);
        const pkg = require2.resolve("pdfjs-dist/package.json");
        return `${dirname2(pkg).replace(/\\/g, "/")}/cmaps/`;
      } catch {
        return void 0;
      }
    })();
    crcTable = null;
    SHARPEN_KERNEL = [
      0,
      -0.4,
      0,
      -0.4,
      2.6,
      -0.4,
      0,
      -0.4,
      0
    ];
  }
});

// src/knowledge/caption.ts
var caption_exports = {};
__export(caption_exports, {
  captionPdfImages: () => captionPdfImages
});
async function captionPdfImages(bytes, config) {
  if (config.provider === "off") return "";
  const model = config.model.trim();
  if (model === "") return "";
  let images = [];
  try {
    const extracted = await extractPdfImages(bytes);
    images = extracted.filter((image) => image.width >= MIN_CAPTION_EDGE && image.height >= MIN_CAPTION_EDGE && image.width * image.height <= MAX_CAPTION_PIXELS).slice(0, MAX_CAPTION_IMAGES).map((image) => {
      const { width, height, data } = image;
      const png = rgbaToPng(width, height, data);
      return { page: image.page, png };
    });
  } catch (error) {
    console.warn(`[dsh-knowledge] caption image extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    return "";
  }
  if (images.length === 0) return "";
  const descriptions = [];
  let failures = 0;
  let firstError = "";
  for (const { page, png } of images) {
    try {
      const text = await captionImage(png, config);
      if (text.trim().length > 0) descriptions.push(`\uFF08\u7B2C ${page} \u9875\u56FE\u8868\u63CF\u8FF0\uFF09${text.trim()}`);
    } catch (error) {
      failures += 1;
      if (firstError === "") firstError = error instanceof Error ? error.message : String(error);
    }
  }
  if (failures > 0) {
    console.warn(`[dsh-knowledge] captioning failed for ${failures}/${images.length} image(s): ${firstError}`);
  }
  if (descriptions.length === 0) return "";
  return `

[\u6587\u6863\u56FE\u8868\u63CF\u8FF0]
${descriptions.join("\n")}`;
}
async function captionImage(png, config) {
  if (config.provider === "ollama") return captionViaOllama(png, config);
  return captionViaOpenAI(png, config);
}
async function captionViaOpenAI(png, config) {
  const baseUrl = config.baseUrl.trim() === "" ? config.embeddingBaseUrl : config.baseUrl.trim();
  if (baseUrl === "") throw new Error("captioning base URL is empty (set it or the embedding base URL)");
  const base64 = png.toString("base64");
  const response = await httpFetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...config.apiKey !== "" ? { authorization: `Bearer ${config.apiKey}` } : {}
    },
    body: JSON.stringify({
      model: config.model.trim(),
      messages: [{
        role: "user",
        content: [
          { type: "text", text: CAPTION_PROMPT },
          { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } }
        ]
      }]
    }),
    timeoutMs: 12e4
  });
  if (!response.ok) throw new Error(`caption request failed: HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("caption response missing content");
  return content;
}
async function captionViaOllama(png, config) {
  const baseUrl = config.baseUrl.trim() === "" ? "http://127.0.0.1:11434" : config.baseUrl.trim().replace(/\/+$/, "");
  const base64 = png.toString("base64");
  const response = await httpFetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: config.model.trim(),
      messages: [{ role: "user", content: CAPTION_PROMPT, images: [base64] }],
      stream: false
    }),
    timeoutMs: 18e4
  });
  if (!response.ok) throw new Error(`ollama caption failed: HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  const json = await response.json();
  const content = json.message?.content;
  if (typeof content !== "string") throw new Error("ollama caption response missing content");
  return content;
}
var MAX_CAPTION_IMAGES, MIN_CAPTION_EDGE, MAX_CAPTION_PIXELS, CAPTION_PROMPT;
var init_caption = __esm({
  "src/knowledge/caption.ts"() {
    "use strict";
    init_net();
    init_ocr();
    MAX_CAPTION_IMAGES = 20;
    MIN_CAPTION_EDGE = 160;
    MAX_CAPTION_PIXELS = 4e6;
    CAPTION_PROMPT = "\u8BF7\u7528\u7B80\u6D01\u7684\u4E2D\u6587\u63CF\u8FF0\u8FD9\u5F20\u56FE\u7247/\u56FE\u8868\u7684\u5185\u5BB9\uFF1A\u8BF4\u660E\u5B83\u5C55\u793A\u7684\u4E3B\u9898\u3001\u6570\u636E\u8D8B\u52BF\u6216\u5173\u952E\u7ED3\u8BBA\u3002\u82E5\u4FE1\u606F\u4E0D\u8DB3\u8BF7\u76F4\u63A5\u8BF4\u65E0\u6CD5\u5224\u65AD\u3002";
  }
});

// src/knowledge/index.ts
import { Service } from "@deepseek-ai/cordis";
import { createHash as createHash9 } from "node:crypto";
import { cp, mkdir as mkdir9, readdir as readdir8, readFile as readFile9, realpath as realpath2, rename as rename7, rm as rm6, stat as stat6 } from "node:fs/promises";
import { basename as basename3, dirname as dirname9, extname as extname2, isAbsolute as isAbsolute4, join as join12, relative as relative4, resolve as resolve6 } from "node:path";
import { isIP } from "node:net";

// src/knowledge/source-spans.ts
init_text_safety();
function sliceSourceSpans(spans, start, end) {
  if (spans === void 0 || end <= start) return [];
  const result = [];
  for (const span of spans) {
    if (!validSourceSpan(span)) continue;
    const lo = Math.max(start, span.chunkStart);
    const hi = Math.min(end, span.chunkEnd);
    if (hi <= lo) continue;
    result.push({
      ...span,
      chunkStart: lo - start,
      chunkEnd: hi - start,
      blockStart: span.blockStart + lo - span.chunkStart,
      blockEnd: span.blockStart + hi - span.chunkStart
    });
  }
  return result;
}
function validSourceSpan(value) {
  if (typeof value !== "object" || value === null) return false;
  const span = value;
  return typeof span.revision === "string" && span.revision.length > 0 && typeof span.blockId === "string" && span.blockId.length > 0 && ["text", "heading", "table", "equation", "image", "caption", "code", "list", "unknown"].includes(span.blockType) && [span.chunkStart, span.chunkEnd, span.blockStart, span.blockEnd].every((n) => Number.isSafeInteger(n) && n >= 0) && span.chunkEnd > span.chunkStart && span.blockEnd > span.blockStart && span.chunkEnd - span.chunkStart === span.blockEnd - span.blockStart && (span.pageIndex === void 0 || Number.isSafeInteger(span.pageIndex) && span.pageIndex >= 0);
}
function sourceSpanLabel(spans) {
  const unique = /* @__PURE__ */ new Map();
  for (const span of spans ?? []) {
    if (validSourceSpan(span)) unique.set(`${span.revision}\0${span.blockId}`, span);
  }
  if (unique.size === 0) return "";
  const labels = [...unique.values()].slice(0, 3).map((span) => {
    const normalizedId = span.blockId.replace(/[\r\n\[\]\u0000-\u001f]/g, "_");
    const id = normalizedId.slice(0, snapSliceEnd(normalizedId, 40));
    return `${span.pageIndex === void 0 ? "" : `p.${span.pageIndex + 1} `}${span.blockType}:${id}`;
  });
  return `[source ${labels.join("; ")}${unique.size > 3 ? `; +${unique.size - 3}` : ""}] `;
}

// src/knowledge/chunk.ts
function normalizeText(text) {
  return text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function chunkText(text, size, overlap, options) {
  const normalized = normalizeText(text);
  if (normalized.length === 0) return [];
  const tokenBudget = Number.isFinite(size) ? Math.max(64, Math.trunc(size)) : 64;
  const tokenOverlap = Number.isFinite(overlap) ? Math.min(Math.max(0, Math.trunc(overlap)), tokenBudget - 1) : 0;
  const charsPerToken = normalized.length / Math.max(1, estimateTokens(normalized));
  const safeSize = Math.max(64, Math.round(tokenBudget * charsPerToken));
  const safeOverlap = Math.min(Math.round(tokenOverlap * charsPerToken), safeSize - 1);
  const smartChunk = options?.smartChunk ?? true;
  const blocks = smartChunk ? splitBlocks(normalized) : [{ text: normalized, heading: void 0 }];
  const chunks = [];
  for (const block of blocks) {
    if (!smartChunk) {
      const separator = normalizeSeparator(options?.separator ?? "\n\n");
      const pieces = block.text.split(separator).map((piece) => piece.trim()).filter((piece) => piece.length > 0);
      for (const piece of pieces) {
        chunks.push(...windowOrKeep(piece, safeSize, safeOverlap, block.heading));
      }
      continue;
    }
    chunks.push(...windowOrKeep(block.text, safeSize, safeOverlap, block.heading));
  }
  return chunks.length > 0 ? chunks : [{ text: normalized.slice(0, safeSize) }];
}
function windowOrKeep(blockText, size, overlap, heading) {
  if (blockText.length <= size) return [{ text: blockText, ...heading !== void 0 ? { heading } : {} }];
  return windowBlock(blockText, size, overlap).filter((piece) => piece.length > 0).map((piece) => ({
    text: piece,
    ...heading !== void 0 ? { heading } : {}
  }));
}
function normalizeSeparator(separator) {
  const decoded = separator.replace(/\\n/g, "\n").replace(/\\t/g, "	");
  return decoded.length > 0 ? decoded : "\n\n";
}
function splitSemanticSegments(text, options) {
  const normalized = normalizeText(text);
  if (normalized.length === 0) return [];
  const blocks = splitBlocks(normalized);
  if (options?.separator === void 0 || options.separator === "") return blocks;
  const separator = normalizeSeparator(options.separator);
  const out = [];
  for (const block of blocks) {
    for (const piece of block.text.split(separator).map((piece2) => piece2.trim()).filter((piece2) => piece2.length > 0)) {
      out.push({ text: piece, ...block.heading !== void 0 ? { heading: block.heading } : {} });
    }
  }
  return out;
}
function mergeSemanticSegments(segments, vectors, size, threshold = 0.75) {
  const fullText = segments.map((segment) => segment.text).join("\n");
  const charsPerToken = fullText.length / Math.max(1, estimateTokens(fullText));
  const tokenBudget = Number.isFinite(size) ? Math.max(64, Math.trunc(size)) : 64;
  const safeSize = Math.max(64, Math.round(tokenBudget * charsPerToken));
  const out = [];
  if (segments.length === 0) return out;
  let text = segments[0].text;
  let heading = segments[0].heading;
  let vec = vectors[0];
  let weight = text.length;
  const flush = () => {
    out.push({ text, ...heading !== void 0 ? { heading } : {}, ...vec !== void 0 ? { embedding: vec } : {} });
  };
  for (let i = 1; i < segments.length; i += 1) {
    const segment = segments[i];
    const nextLength = text.length + segment.text.length + 1;
    const vector = vectors[i];
    const similar = vec !== void 0 && vector !== void 0 ? cosineSimilarity(vec, vector) >= threshold : true;
    if (nextLength <= safeSize && similar) {
      text += `
${segment.text}`;
      if (vec !== void 0 && vector !== void 0) {
        const newWeight = weight + segment.text.length;
        vec = normalizeAdd(vec, weight, vector, segment.text.length);
        weight = newWeight;
      }
    } else {
      flush();
      text = segment.text;
      heading = segment.heading;
      vec = vector;
      weight = text.length;
    }
  }
  flush();
  return out;
}
function normalizeAdd(a, aWeight, b, bWeight) {
  const out = new Array(a.length);
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const v = (a[i] * aWeight + b[i] * bWeight) / (aWeight + bWeight);
    out[i] = v;
    sum += v * v;
  }
  const length = Math.sqrt(sum);
  if (!Number.isFinite(length) || length === 0) return out;
  for (let i = 0; i < out.length; i += 1) out[i] /= length;
  return out;
}
function cosineSimilarity(a, b) {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const av = a[i];
    const bv = b[i];
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  const norm = Math.sqrt(normA) * Math.sqrt(normB);
  if (norm === 0) return 0;
  const cosine = dot / norm;
  return Number.isFinite(cosine) ? Math.max(0, Math.min(1, cosine)) : 0;
}
function refineChunksByTokenLimit(chunks, tokenLimit, estimateTokens3) {
  if (tokenLimit <= 0) return [...chunks];
  const out = [];
  const refine = (piece) => {
    if (estimateTokens3(piece.text) <= tokenLimit || piece.text.length < 40) {
      out.push(piece);
      return;
    }
    const split = splitAtPreferredBoundary(piece.text);
    if (split === null) {
      out.push(piece);
      return;
    }
    const heading = piece.heading !== void 0 ? { heading: piece.heading } : {};
    refine({ text: split[0], ...heading, ...piece.sourceSpans !== void 0 ? { sourceSpans: sliceSourceSpans(piece.sourceSpans, split[2], split[2] + split[0].length) } : {} });
    refine({ text: split[1], ...heading, ...piece.sourceSpans !== void 0 ? { sourceSpans: sliceSourceSpans(piece.sourceSpans, split[3], split[3] + split[1].length) } : {} });
  };
  for (const chunk of chunks) refine(chunk);
  return out;
}
function splitAtPreferredBoundary(text) {
  const mid = Math.floor(text.length / 2);
  const radius = Math.max(1, Math.floor(text.length * 0.25));
  const lo = Math.max(0, mid - radius);
  const hi = Math.min(text.length, mid + radius);
  const window = text.slice(lo, hi);
  for (const separator of ["\n\n", "\u3002", "\uFF01", "\uFF1F", "\uFF0C", ", ", " "]) {
    const idx = window.lastIndexOf(separator);
    if (idx < 0) continue;
    const cut = lo + idx + separator.length;
    const left = text.slice(0, cut).trim();
    const right = text.slice(cut).trim();
    if (left.length > 0 && right.length > 0) return [
      left,
      right,
      text.slice(0, cut).length - text.slice(0, cut).trimStart().length,
      cut + text.slice(cut).length - text.slice(cut).trimStart().length
    ];
  }
  return null;
}
function splitBlocks(text) {
  const blocks = [];
  let current = "";
  let fence = "";
  const headings = [];
  const headingPath = () => {
    const present = headings.filter((entry) => entry !== void 0 && entry.trim().length > 0);
    return present.length > 0 ? present.join(" > ") : void 0;
  };
  const flush = () => {
    if (current.trim().length > 0) {
      const path = headingPath();
      blocks.push({ text: current.trim(), ...path !== void 0 ? { heading: path } : {} });
    }
    current = "";
  };
  for (const line of text.split("\n")) {
    if (fence !== "") {
      current += (current.length > 0 ? "\n" : "") + line;
      const closer = new RegExp(`^\\s*${fence[0] === "`" ? "`" : "~"}{${fence.length},}\\s*$`);
      if (closer.test(line)) fence = "";
      continue;
    }
    const fenceStart = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceStart !== null) {
      flush();
      fence = fenceStart[1];
      current = line;
      continue;
    }
    const heading = matchHeading(line);
    if (heading !== void 0) {
      flush();
      const level = heading.level;
      headings.length = level;
      headings[level - 1] = heading.title;
      continue;
    }
    if (line.trim().length === 0) {
      flush();
      continue;
    }
    current += (current.length > 0 ? "\n" : "") + line;
  }
  flush();
  return blocks;
}
function matchHeading(line) {
  const match = /^(#{1,6})\s+(.+)$/.exec(line);
  if (match === null) return void 0;
  return { level: match[1].length, title: match[2].trim() };
}
function windowBlock(block, size, overlap) {
  const chunks = [];
  let start = 0;
  while (start < block.length) {
    const end = start + size;
    if (end >= block.length) {
      chunks.push(block.slice(start).trim());
      break;
    }
    const windowStart = Math.max(start + 1, end - Math.max(1, Math.round(size * WINDOW_RATIO)));
    const cut = Math.max(findCut(block, end, windowStart), start + 1);
    chunks.push(block.slice(start, cut).trim());
    const next = Math.max(cut - overlap, start + 1);
    if (next <= start) break;
    start = next;
  }
  return chunks;
}
var BREAK_PATTERNS = [
  { pattern: /\n#{1}(?!#)/g, score: 100 },
  { pattern: /\n#{2}(?!#)/g, score: 90 },
  { pattern: /\n#{3}(?!#)/g, score: 80 },
  { pattern: /\n#{4}(?!#)/g, score: 70 },
  { pattern: /\n#{5}(?!#)/g, score: 60 },
  { pattern: /\n#{6}(?!#)/g, score: 50 },
  { pattern: /\n```/g, score: 80 },
  { pattern: /\n(?:---|\*\*\*|___)\s*\n/g, score: 60 },
  { pattern: /\n\n+/g, score: 20 },
  { pattern: /[。！？]/g, score: 8, after: true },
  { pattern: /\n[-*]\s/g, score: 5 },
  { pattern: /\n\d+\.\s/g, score: 5 },
  { pattern: /\n/g, score: 1 }
];
var WINDOW_RATIO = 0.22;
var DECAY_FACTOR = 0.7;
function findCut(block, end, min) {
  const windowSize = Math.max(1, end - min);
  let bestPos = -1;
  let bestScore = -1;
  const source = block.slice(min, end);
  for (const { pattern: pattern2, score, after } of BREAK_PATTERNS) {
    pattern2.lastIndex = 0;
    for (const match of source.matchAll(pattern2)) {
      const cut = min + match.index + (after === true ? match[0].length : 0);
      const decayed = score * Math.pow(DECAY_FACTOR, (end - cut) / windowSize);
      if (decayed > bestScore) {
        bestScore = decayed;
        bestPos = cut;
      }
    }
  }
  return bestPos > min ? bestPos : end;
}
function estimateTokens(text) {
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? []).length;
  const latin = text.length - cjk;
  return Math.max(1, Math.ceil(cjk / 1.5 + latin / 4));
}

// src/knowledge/context-protocol.ts
function estimateContextTokens(text) {
  if (text.length === 0) return 0;
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? []).length;
  const latin = text.length - cjk;
  return Math.max(1, Math.ceil(cjk / 1.5 + latin / 4));
}
function serializeContextWindow(window) {
  const parts = [];
  for (const excerpt of window.before) parts.push(serializeExcerpt(excerpt, false));
  parts.push(serializeExcerpt(window.anchor, true));
  for (const excerpt of window.after) parts.push(serializeExcerpt(excerpt, false));
  return parts.join("\n\n");
}
function serializeExcerpt(excerpt, anchor) {
  const heading = excerpt.heading?.trim();
  const prefix = `${anchor ? ">>> " : ""}${heading !== void 0 && heading.length > 0 ? `[${heading}] ` : ""}`;
  return `${prefix}${sourceSpanLabel(excerpt.sourceSpans)}${excerpt.text}`;
}

// src/knowledge/structured-chunk.ts
function chunkParsedDocument(parsed, revision, size, overlap, options) {
  if (parsed.blocks.length === 0) return chunkText(parsed.text, size, overlap, options);
  if (!revision) throw new Error("processing revision is required for source mappings");
  const budget = Math.min(
    Number.isFinite(size) ? Math.max(64, Math.trunc(size)) : 800,
    options?.tokenLimit !== void 0 && options.tokenLimit > 0 ? Math.max(1, Math.trunc(options.tokenLimit)) : Number.MAX_SAFE_INTEGER
  );
  const overlapTokens = Number.isFinite(overlap) ? Math.max(0, Math.min(Math.trunc(overlap), Math.floor(budget / 3))) : 0;
  const result = [];
  let cursor = 0;
  let heading;
  let pendingHeading;
  const add = (piece) => {
    if (piece.text.trim().length === 0) return;
    if (pendingHeading !== void 0) {
      const combined = joinPieces(pendingHeading, piece);
      if (estimateContextTokens(combined.text) <= budget) {
        result.push(combined);
        pendingHeading = void 0;
        return;
      }
      result.push(pendingHeading);
      pendingHeading = void 0;
    }
    result.push(piece);
  };
  for (const block of parsed.blocks) {
    if (!Number.isSafeInteger(block.textStart) || !Number.isSafeInteger(block.textEnd) || block.textStart < cursor || block.textEnd < block.textStart || parsed.text.slice(block.textStart, block.textEnd) !== block.text) {
      throw new Error("parsed block ranges are inconsistent with canonical text");
    }
    if (block.textStart > cursor) {
      const gap = parsed.text.slice(cursor, block.textStart);
      for (const piece2 of windows({ text: gap, heading }, budget, overlapTokens)) add(piece2);
    }
    cursor = block.textEnd;
    heading = block.heading ?? heading;
    const piece = blockPiece(block, revision, heading);
    if (options?.structured !== false && block.type === "heading") {
      if (pendingHeading !== void 0) result.push(pendingHeading);
      const pieces2 = windows(piece, budget, 0);
      for (const earlier of pieces2.slice(0, -1)) result.push(earlier);
      pendingHeading = pieces2.at(-1);
      continue;
    }
    const pieces = options?.structured !== false && block.type === "table" ? tablePieces(piece, budget) : windows(piece, budget, block.type === "equation" || block.type === "image" ? 0 : overlapTokens);
    for (const entry of pieces) add(entry);
  }
  for (const piece of windows({ text: parsed.text.slice(cursor), heading }, budget, overlapTokens)) add(piece);
  if (pendingHeading !== void 0) result.push(pendingHeading);
  return result;
}
function blockPiece(block, revision, heading) {
  return {
    text: block.text,
    ...heading !== void 0 ? { heading } : {},
    sourceSpans: block.text.length === 0 ? [] : [{
      revision,
      blockId: block.id,
      blockType: block.type,
      chunkStart: 0,
      chunkEnd: block.text.length,
      blockStart: 0,
      blockEnd: block.text.length,
      ...block.pageIndex !== void 0 ? { pageIndex: block.pageIndex } : {},
      ...block.bbox !== void 0 ? { bbox: block.bbox } : {},
      ...block.assetIds !== void 0 ? { assetIds: block.assetIds } : {}
    }]
  };
}
function slicePiece(piece, start, end) {
  const raw = piece.text.slice(start, end);
  const lo = start + raw.length - raw.trimStart().length;
  const hi = Math.max(lo, end - (raw.length - raw.trimEnd().length));
  return {
    text: piece.text.slice(lo, hi),
    ...piece.heading !== void 0 ? { heading: piece.heading } : {},
    ...piece.sourceSpans !== void 0 ? { sourceSpans: sliceSourceSpans(piece.sourceSpans, lo, hi) } : {}
  };
}
function joinPieces(left, right, separator = "\n\n") {
  const shift = left.text.length + separator.length;
  return {
    text: `${left.text}${separator}${right.text}`,
    ...right.heading !== void 0 || left.heading !== void 0 ? { heading: right.heading ?? left.heading } : {},
    sourceSpans: [
      ...left.sourceSpans ?? [],
      ...(right.sourceSpans ?? []).map((span) => ({ ...span, chunkStart: span.chunkStart + shift, chunkEnd: span.chunkEnd + shift }))
    ]
  };
}
function windows(piece, budget, overlap) {
  if (piece.text.trim().length === 0) return [];
  if (estimateContextTokens(piece.text) <= budget) return [slicePiece(piece, 0, piece.text.length)];
  const pieces = [];
  let start = 0;
  while (start < piece.text.length) {
    let end = boundedEnd(piece.text, start, budget);
    if (end < piece.text.length) {
      const floor = start + Math.floor((end - start) * 0.7);
      for (let i = end - 1; i >= floor; i -= 1) {
        if (/[\n。！？.!?;]/.test(piece.text[i])) {
          end = i + 1;
          break;
        }
      }
    }
    const part = slicePiece(piece, start, end);
    if (part.text.length > 0) pieces.push(part);
    if (end >= piece.text.length) break;
    let next = end;
    if (overlap > 0) {
      while (next > start + 1 && estimateContextTokens(piece.text.slice(next - 1, end)) <= overlap) next -= 1;
    }
    start = Math.max(start + 1, next);
  }
  return pieces;
}
function boundedEnd(text, start, budget) {
  let low = start + 1;
  let high = Math.min(text.length, start + budget * 4);
  let best = low;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (estimateContextTokens(text.slice(start, mid)) <= budget) {
      best = mid;
      low = mid + 1;
    } else high = mid - 1;
  }
  if (best < text.length && /[\uD800-\uDBFF]/.test(text[best - 1]) && /[\uDC00-\uDFFF]/.test(text[best])) best -= 1;
  return Math.max(start + 1, best);
}
function tablePieces(piece, budget) {
  if (estimateContextTokens(piece.text) <= budget) return [piece];
  if (/<table\b/i.test(piece.text)) return htmlTablePieces(piece, budget);
  const lines = [...piece.text.matchAll(/[^\n]+(?:\n|$)|\n/g)].map((match) => ({ start: match.index, end: match.index + match[0].length, text: match[0] }));
  const separator = lines.findIndex((line) => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line.text.trim()));
  if (separator !== 1 || lines.length < 3) return windows(piece, budget, 0);
  const header = slicePiece(piece, 0, lines[1].end);
  const headerCost = estimateContextTokens(header.text + "\n");
  if (headerCost >= budget / 2) return windows(piece, budget, 0);
  const result = [];
  let current = header;
  let hasRow = false;
  const flush = () => {
    if (hasRow) result.push(current);
    current = header;
    hasRow = false;
  };
  for (const line of lines.slice(2)) {
    if (line.text.trim().length === 0) continue;
    const row = slicePiece(piece, line.start, line.end);
    const combined = joinPieces(current, row, "\n");
    if (estimateContextTokens(combined.text) <= budget) {
      current = combined;
      hasRow = true;
      continue;
    }
    flush();
    for (const segment of windows(row, Math.max(1, budget - headerCost), 0)) {
      const candidate = joinPieces(current, segment, "\n");
      if (hasRow && estimateContextTokens(candidate.text) > budget) flush();
      current = joinPieces(current, segment, "\n");
      hasRow = true;
    }
  }
  flush();
  return result;
}
function htmlTablePieces(piece, budget) {
  const rows = [...piece.text.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr\s*>/gi)];
  if (rows.length < 2) return windows(piece, budget, 0);
  let headerRows = 0;
  while (headerRows < rows.length && /<th\b/i.test(rows[headerRows][0])) headerRows += 1;
  if (headerRows === 0 || headerRows === rows.length) return windows(piece, budget, 0);
  const header = slicePiece(piece, 0, rows[headerRows].index);
  const tailStart = rows.at(-1).index + rows.at(-1)[0].length;
  const tail = slicePiece(piece, tailStart, piece.text.length);
  const envelope = estimateContextTokens(header.text + tail.text + "\n\n");
  if (envelope >= budget / 2) return windows(piece, budget, 0);
  const result = [];
  let body;
  const wrap = (body2) => joinPieces(joinPieces(header, body2, ""), tail, "");
  const flush = () => {
    if (body !== void 0) result.push(wrap(body));
    body = void 0;
  };
  for (let i = headerRows; i < rows.length; i += 1) {
    const row = slicePiece(piece, rows[i].index, i + 1 < rows.length ? rows[i + 1].index : tailStart);
    for (const segment of windows(row, budget - envelope, 0)) {
      const candidate = body === void 0 ? segment : joinPieces(body, segment, "");
      if (body !== void 0 && estimateContextTokens(wrap(candidate).text) > budget) flush();
      body = body === void 0 ? segment : joinPieces(body, segment, "");
    }
  }
  flush();
  return result;
}

// src/knowledge/artifacts.ts
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename, rm, stat, readdir } from "node:fs/promises";
import { resolve, relative, join, isAbsolute } from "node:path";
var MAX_MANIFEST_BYTES = 32 * 1024 * 1024;
var MAX_ASSET_BYTES = 32 * 1024 * 1024;
var MAX_RESULT_BYTES = 128 * 1024 * 1024;
var component = (value) => {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(value)) throw new Error("invalid artifact identity");
  return value;
};
var digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
var ArtifactRepository = class {
  constructor(root) {
    this.root = root;
  }
  memory = /* @__PURE__ */ new Map();
  memoryJobs = /* @__PURE__ */ new Map();
  jobWrites = /* @__PURE__ */ new Map();
  deleted = /* @__PURE__ */ new Set();
  saves = /* @__PURE__ */ new Map();
  key(baseId, documentId, revision) {
    return [component(baseId), component(documentId), ...revision !== void 0 ? [component(revision)] : []].join("/");
  }
  path(key) {
    if (this.root === void 0) throw new Error("artifact storage is in memory");
    const root = resolve(this.root);
    const target = resolve(root, key);
    const rel = relative(root, target);
    if (rel === "" || rel === ".." || rel.startsWith(`..\\`) || rel.startsWith("../") || isAbsolute(rel)) throw new Error("unsafe artifact path");
    return target;
  }
  async save(baseId, documentId, output) {
    const key = this.key(baseId, documentId);
    if (this.deleted.has(key) || this.deleted.has(baseId)) return Promise.reject(new Error("artifact target deleted"));
    const operation = this.saveRevision(baseId, documentId, output);
    const active2 = this.saves.get(key) ?? /* @__PURE__ */ new Set();
    active2.add(operation);
    this.saves.set(key, active2);
    void operation.finally(() => {
      active2.delete(operation);
      if (!active2.size) this.saves.delete(key);
    }).catch(() => {
    });
    return operation;
  }
  async saveRevision(baseId, documentId, output) {
    const revision = randomUUID();
    const key = this.key(baseId, documentId, revision);
    const parsed = JSON.stringify(output.document);
    if (Buffer.byteLength(parsed) > MAX_MANIFEST_BYTES) throw new Error("parsed document exceeds artifact limit");
    const info = {
      revision,
      artifactId: key,
      sourceHash: output.document.sourceHash,
      provider: output.document.provider,
      processorVersion: output.document.processorVersion,
      optionsFingerprint: output.document.optionsFingerprint,
      parsedAt: Date.now(),
      completeness: output.document.completeness,
      pageCount: output.document.pageCount,
      processedPages: output.document.processedPages,
      warnings: output.document.warnings
    };
    const manifest = { version: 1, baseId, documentId, info, documentHash: digest(parsed) };
    const assets = new Map(output.assets.map((asset) => [component(asset.id), asset.bytes]));
    if (assets.size !== output.assets.length || assets.size !== output.document.assets.length) throw new Error("artifact asset count mismatch");
    for (const asset of output.document.assets) {
      const bytes = assets.get(component(asset.id));
      if (bytes === void 0 || bytes.byteLength !== asset.byteLength || bytes.byteLength > MAX_ASSET_BYTES || digest(bytes) !== asset.sha256) throw new Error("artifact asset integrity mismatch");
    }
    if ((output.originalResult?.byteLength ?? 0) > MAX_RESULT_BYTES) throw new Error("processor result exceeds archive limit");
    if (this.root === void 0) {
      this.memory.set(key, { manifest, output: structuredClone(output) });
      return info;
    }
    const candidate = this.path(`${key}.pending`);
    const target = this.path(key);
    await mkdir(candidate, { recursive: true });
    try {
      await writeFile(join(candidate, "document.json"), parsed, { flag: "wx" });
      for (const [id, bytes] of assets) await writeFile(join(candidate, `${id}.blob`), bytes, { flag: "wx" });
      if (output.originalResult !== void 0) await writeFile(join(candidate, "upstream.zip"), output.originalResult, { flag: "wx" });
      await writeFile(join(candidate, "manifest.json"), JSON.stringify(manifest), { flag: "wx" });
      await rename(candidate, target);
      return info;
    } catch (error) {
      await rm(candidate, { recursive: true, force: true }).catch(() => {
      });
      throw error;
    }
  }
  async boundedRead(path, maxBytes) {
    const size = (await stat(path)).size;
    if (size > maxBytes) throw new Error("artifact exceeds read limit");
    const bytes = await readFile(path);
    if (bytes.byteLength > maxBytes) throw new Error("artifact exceeds read limit");
    return bytes;
  }
  async load(baseId, documentId, info) {
    const key = this.key(baseId, documentId, info.revision);
    if (info.artifactId !== key) throw new Error("artifact does not belong to document");
    if (this.root === void 0) {
      const value = this.memory.get(key);
      if (value === void 0) throw new Error("processing artifact is missing; reparse the source");
      return structuredClone(value.output.document);
    }
    const dir = this.path(key);
    const manifest = JSON.parse((await this.boundedRead(join(dir, "manifest.json"), 1024 * 1024)).toString());
    if (manifest.version !== 1 || manifest.baseId !== baseId || manifest.documentId !== documentId || manifest.info.revision !== info.revision) throw new Error("invalid artifact manifest");
    const bytes = await this.boundedRead(join(dir, "document.json"), MAX_MANIFEST_BYTES);
    if (digest(bytes) !== manifest.documentHash) throw new Error("artifact checksum mismatch");
    const parsed = JSON.parse(bytes.toString());
    if (parsed.schemaVersion !== 1 || parsed.sourceHash !== info.sourceHash || !Array.isArray(parsed.blocks) || typeof parsed.text !== "string") throw new Error("invalid parsed document");
    return parsed;
  }
  async readAsset(baseId, documentId, info, assetId) {
    component(assetId);
    const parsed = await this.load(baseId, documentId, info);
    const asset = parsed.assets.find((value) => value.id === assetId);
    if (asset === void 0) return void 0;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(asset.mimeType)) throw new Error("unsupported evidence asset type");
    const key = this.key(baseId, documentId, info.revision);
    const bytes = this.root === void 0 ? this.memory.get(key)?.output.assets.find((value) => value.id === assetId)?.bytes : await this.boundedRead(join(this.path(key), `${assetId}.blob`), MAX_ASSET_BYTES);
    if (bytes === void 0 || bytes.byteLength !== asset.byteLength || digest(bytes) !== asset.sha256) throw new Error("artifact asset checksum mismatch");
    return { bytes, mimeType: asset.mimeType };
  }
  async getJob(baseId, documentId) {
    const key = this.key(baseId, documentId);
    await this.jobWrites.get(key);
    if (this.root === void 0) return this.memoryJobs.get(key);
    try {
      const job2 = JSON.parse((await this.boundedRead(this.path(`${key}/job.json`), 1024 * 1024)).toString());
      if (job2.version !== 1 || job2.baseId !== baseId || job2.documentId !== documentId) throw new Error("invalid processing job");
      return job2;
    } catch (error) {
      if (error.code === "ENOENT") return void 0;
      throw error;
    }
  }
  saveJob(job2) {
    const key = this.key(job2.baseId, job2.documentId);
    if (this.deleted.has(key) || this.deleted.has(job2.baseId)) return Promise.reject(new Error("artifact target deleted"));
    const write2 = (this.jobWrites.get(key) ?? Promise.resolve()).catch(() => {
    }).then(async () => {
      if (this.root === void 0) {
        this.memoryJobs.set(key, job2);
        return;
      }
      await mkdir(this.path(key), { recursive: true });
      const candidate = this.path(`${key}/job-${randomUUID()}.tmp`);
      await writeFile(candidate, JSON.stringify(job2), { flag: "wx" });
      await rename(candidate, this.path(`${key}/job.json`));
    });
    this.jobWrites.set(key, write2);
    void write2.finally(() => {
      if (this.jobWrites.get(key) === write2) this.jobWrites.delete(key);
    }).catch(() => {
    });
    return write2;
  }
  async deleteDocument(baseId, documentId) {
    const key = this.key(baseId, documentId);
    this.deleted.add(key);
    await Promise.allSettled([...this.saves.get(key) ?? []]);
    await this.jobWrites.get(key)?.catch(() => {
    });
    this.memoryJobs.delete(key);
    for (const entry of this.memory.keys()) if (entry.startsWith(`${key}/`)) this.memory.delete(entry);
    if (this.root !== void 0) await rm(this.path(key), { recursive: true, force: true });
  }
  /** Startup-only GC. Live, staged and recoverable job revisions are pinned;
   * recent candidates are retained for seven days. Never follow symlinks. */
  async collectDocument(baseId, documentId, pinned, now = Date.now()) {
    if (this.root === void 0) return 0;
    const key = this.key(baseId, documentId);
    const protectedRevisions = new Set(pinned);
    const job2 = await this.getJob(baseId, documentId);
    if (job2?.artifact !== void 0) protectedRevisions.add(job2.artifact.revision);
    let entries;
    try {
      entries = await readdir(this.path(key), { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return 0;
      throw error;
    }
    let removed = 0;
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink() || !/^[a-zA-Z0-9_-]+(?:\.pending)?$/.test(entry.name) || protectedRevisions.has(entry.name)) continue;
      const path = this.path(`${key}/${entry.name}`);
      if ((await stat(path)).mtimeMs > now - 7 * 24 * 36e5) continue;
      await rm(path, { recursive: true, force: true });
      removed++;
    }
    return removed;
  }
  async deleteBase(baseId) {
    const prefix = `${component(baseId)}/`;
    this.deleted.add(baseId);
    await Promise.allSettled([...this.saves].filter(([key]) => key.startsWith(prefix)).flatMap(([, pending]) => [...pending]));
    for (const [key, pending] of this.jobWrites) if (key.startsWith(prefix)) await pending.catch(() => {
    });
    for (const key of this.memory.keys()) if (key.startsWith(prefix)) this.memory.delete(key);
    for (const key of this.memoryJobs.keys()) if (key.startsWith(prefix)) this.memoryJobs.delete(key);
    if (this.root !== void 0) await rm(this.path(component(baseId)), { recursive: true, force: true });
  }
};

// src/knowledge/document-processing.ts
import { createHash as createHash4 } from "node:crypto";

// src/knowledge/parse.ts
import { existsSync as existsSync2 } from "node:fs";
import { Worker } from "node:worker_threads";
import { fileURLToPath as fileURLToPath4 } from "node:url";
var SUPPORTED_DOCUMENT_EXTENSIONS = [
  "txt",
  "md",
  "markdown",
  "mdx",
  "csv",
  "html",
  "htm",
  "json",
  "log",
  "pdf",
  "docx",
  "doc",
  "pptx",
  "ppt",
  "xlsx",
  "xls",
  "epub"
];
function extensionOf(fileName) {
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx + 1).toLowerCase() : "";
}
async function parseDocumentBuffer(buffer, fileName, mimeType2) {
  const ext = extensionOf(fileName);
  if (mimeType2 === "application/pdf" || ext === "pdf") return parsePdf(buffer);
  if (mimeType2 === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === "docx") {
    return parseDocx(buffer);
  }
  if (ext === "html" || ext === "htm") return extractHtmlToMarkdown(decodeText(buffer));
  if (ext === "pptx") return parsePptx(buffer);
  if (ext === "xlsx") return parseXlsx(buffer);
  if (ext === "epub") return parseEpub(buffer);
  if (ext === "doc") return parseDoc(buffer);
  if (ext === "ppt") return parseLegacyOffice(buffer, "ppt");
  if (ext === "xls") return parseLegacyOffice(buffer, "xlsx");
  return decodeText(buffer);
}
function decodeText(buffer) {
  if (buffer.length >= 3 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) {
    return new TextDecoder("utf-8").decode(buffer.subarray(3));
  }
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  let replacements = 0;
  for (let i = 0; i < utf8.length; i += 1) {
    if (utf8.charCodeAt(i) === 65533) {
      replacements += 1;
      if (replacements > 8) break;
    }
  }
  if (replacements <= 8) return utf8;
  try {
    return new TextDecoder("gb18030").decode(buffer);
  } catch {
    return utf8;
  }
}
function extractFromHtml(html) {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleMatch !== null ? decodeEntities(titleMatch[1].trim()) : "";
  const withoutBlocks = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<head[\s\S]*?<\/head>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const withBreaks = withoutBlocks.replace(/<\/(p|div|h[1-6]|li|tr|section|article|blockquote)>/gi, "\n").replace(/<(br|hr)\s*\/?>/gi, "\n");
  const withoutTags = withBreaks.replace(/<[^>]+>/g, " ");
  const text = decodeEntities(withoutTags).split("\n").map((line) => line.replace(/\s+/g, " ").trim()).filter((line) => line.length > 0).join("\n");
  return { title, text };
}
var turndownCtor = null;
async function loadTurndown() {
  if (turndownCtor === null) {
    const mod = await import("turndown");
    turndownCtor = mod.default ?? mod;
  }
  return turndownCtor;
}
async function extractHtmlToMarkdown(html) {
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<head[\s\S]*?<\/head>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<(nav|footer|aside|form|iframe|svg|canvas|template)[\s\S]*?<\/\1>/gi, " ");
  try {
    const Turndown = await loadTurndown();
    const converter = new Turndown({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      emDelimiter: "*"
    });
    const markdown = converter.turndown(cleaned);
    if (markdown.trim().length === 0) return extractFromHtml(html).text;
    return markdown.replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return extractFromHtml(html).text;
  }
}
async function extractHtmlDocument(html) {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleMatch !== null ? decodeEntities(titleMatch[1].trim()) : "";
  const text = await extractHtmlToMarkdown(html);
  return { title, text };
}
var NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  copy: "\xA9",
  reg: "\xAE",
  trade: "\u2122",
  middot: "\xB7",
  bull: "\u2022",
  times: "\xD7",
  divide: "\xF7",
  deg: "\xB0",
  plusmn: "\xB1"
};
function decodeEntities(text) {
  return text.replace(/&#x([0-9a-f]+);/gi, (_match, hex) => codePointFrom(parseInt(hex, 16))).replace(/&#(\d+);/g, (_match, dec) => codePointFrom(Number(dec))).replace(/&([a-z][a-z0-9]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}
function codePointFrom(value) {
  if (!Number.isInteger(value) || value < 0 || value > 1114111 || value >= 55296 && value <= 57343) return "\uFFFD";
  return String.fromCodePoint(value);
}
function averageLineLength(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length === 0) return 0;
  return lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
}
async function extractTextWithLayout(bytes) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  let cMapUrl;
  try {
    const { createRequire: createRequire2 } = await import("node:module");
    const { dirname: dirname10 } = await import("node:path");
    const require2 = createRequire2(import.meta.url);
    const pkg = require2.resolve("pdfjs-dist/package.json");
    cMapUrl = `${dirname10(pkg).replace(/\\/g, "/")}/cmaps/`;
  } catch {
  }
  const loadingTask = pdfjs.getDocument({
    data: Uint8Array.from(bytes),
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
    ...cMapUrl !== void 0 ? { cMapUrl, cMapPacked: true } : {}
  });
  try {
    const doc = await loadingTask.promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = (content.items ?? []).map((item) => ({
        str: item.str ?? "",
        x: item.transform?.[4] ?? 0,
        y: item.transform?.[5] ?? 0,
        height: Math.abs(item.transform?.[3] ?? 0) || 10
      })).filter((item) => item.str.length > 0);
      if (items.length === 0) continue;
      const heights = items.map((item) => item.height).sort((a, b) => a - b);
      const tolerance = (heights[Math.floor(heights.length / 2)] ?? 10) * 0.6;
      const bands = /* @__PURE__ */ new Map();
      for (const item of items) {
        const band = Math.round(item.y / tolerance);
        const list = bands.get(band) ?? [];
        list.push({ x: item.x, str: item.str });
        bands.set(band, list);
      }
      const lines = [...bands.entries()].sort((a, b) => a[0] - b[0]).map(([, list]) => list.sort((a, b) => a.x - b.x).map((entry) => entry.str).join("")).filter((line) => line.trim().length > 0);
      if (lines.length > 0) pages.push(lines.join("\n"));
    }
    return pages.join("\n\n");
  } finally {
    await loadingTask.destroy().catch(() => {
    });
  }
}
async function ocrFallback(bytes) {
  const { isOcrReady: isOcrReady2, ocrPdfText: ocrPdfText2 } = await Promise.resolve().then(() => (init_ocr(), ocr_exports));
  if (!isOcrReady2()) return "";
  return await ocrPdfText2(bytes);
}
async function parsePdf(buffer) {
  let primaryError = null;
  let text = "";
  try {
    text = await parsePdfInWorker(buffer);
  } catch (error) {
    primaryError = error instanceof Error ? error : new Error(String(error));
  }
  if (text.trim().length > 0) {
    const avgLine = averageLineLength(text);
    if (avgLine >= 5) return text;
    let reassembled = "";
    try {
      reassembled = await extractTextWithLayout(buffer);
    } catch {
    }
    if (averageLineLength(reassembled) >= 12 && reassembled.trim().length > 0) return reassembled;
    const recognized = await ocrFallback(buffer);
    if (recognized.trim().length > 0) return recognized;
    try {
      const anydoc = await loadAnydoc();
      const markdown = (await anydoc.toMarkdownBytes(Buffer.from(buffer))).trim();
      if (markdown.length > 0) return markdown;
    } catch {
    }
    return text;
  }
  try {
    const anydoc = await loadAnydoc();
    const markdown = (await anydoc.toMarkdownBytes(Buffer.from(buffer))).trim();
    if (markdown.length > 0) return markdown;
  } catch {
  }
  let ocrReady = false;
  let ocrFailure;
  try {
    const { isOcrReady: isOcrReady2, ocrPdfText: ocrPdfText2 } = await Promise.resolve().then(() => (init_ocr(), ocr_exports));
    ocrReady = isOcrReady2();
    if (ocrReady) {
      const recognized = await ocrPdfText2(buffer);
      if (recognized.trim().length > 0) return recognized;
    }
  } catch (error) {
    ocrFailure = error instanceof Error ? error : new Error(String(error));
    console.warn(`[dsh-knowledge] OCR failed for a scanned PDF: ${ocrFailure.message}`);
  }
  if (ocrFailure !== void 0) {
    throw Object.assign(
      new Error(`PDF contains no extractable text and OCR failed: ${ocrFailure.message}`),
      { code: ocrFailure.code ?? "ocr_failed" }
    );
  }
  if (primaryError !== null) {
    throw new Error(`PDF parsing failed: ${primaryError.message}`);
  }
  throw new Error(
    ocrReady ? "PDF contains no extractable text (it may be scanned)" : "PDF contains no extractable text (it may be scanned) \u2014 download the local OCR models in Settings \u2192 Local Models to auto-recognize scans"
  );
}
async function parseDocx(buffer) {
  try {
    const mammoth = await loadMammoth();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    const text = result?.value ?? "";
    if (text.trim().length === 0) throw new Error("DOCX contains no extractable text");
    return text;
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function parseDoc(buffer) {
  try {
    const WordExtractor = await loadWordExtractor();
    const extractor = new WordExtractor();
    const doc = await extractor.extract(Buffer.from(buffer));
    const text = doc.getBody() ?? "";
    if (text.trim().length === 0) throw new Error("DOC contains no extractable text");
    return text;
  } catch (error) {
    throw new Error(`DOC parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function parseLegacyOffice(buffer, format) {
  try {
    const anydoc = await loadAnydoc();
    const markdown = await anydoc.toMarkdownBytes(buffer, format);
    const text = markdown.trim();
    if (text.length === 0) throw new Error("document contains no extractable content");
    return text;
  } catch (error) {
    throw new Error(`document parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function parsePptx(buffer) {
  const zip = await loadZip(buffer);
  const slides = [];
  for (const name of Object.keys(zip.files).sort()) {
    if (!/^ppt\/slides\/slide\d+\.xml$/.test(name)) continue;
    const xml = await zip.files[name].async("string");
    slides.push(stripXmlText(xml, "a:t"));
  }
  if (slides.length === 0) throw new Error("PPTX contains no extractable slides");
  return slides.join("\n\n");
}
async function parseXlsx(buffer) {
  const zip = await loadZip(buffer);
  const shared = zip.files["xl/sharedStrings.xml"];
  const sharedStrings = [];
  if (shared !== void 0) {
    const xml = await shared.async("string");
    for (const si of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      const inner = si[1] ?? "";
      const text = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeEntities(m[1] ?? "")).join("");
      sharedStrings.push(text);
    }
  }
  const lines = [];
  for (const name of Object.keys(zip.files).sort()) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue;
    const xml = await zip.files[name].async("string");
    const rows = xml.split(/<row\b/);
    for (const row of rows) {
      const cells = [];
      for (const cell of row.matchAll(/<c\b[^>]*>([\s\S]*?)<\/c>/g)) {
        const tag = cell[0] ?? "";
        const type = /<c\b[^>]*\bt="([^"]*)"/.exec(tag)?.[1];
        const content = cell[1] ?? "";
        const inline = /<is>([\s\S]*?)<\/is>/.exec(content);
        if (inline !== null) {
          const text = [...(inline[1] ?? "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeEntities(m[1] ?? "")).join("");
          cells.push(text);
          continue;
        }
        const ref = /<v>([\s\S]*?)<\/v>/.exec(content);
        const raw = ref?.[1] ?? "";
        if (type === "s") {
          const sharedIdx = Number(raw);
          if (Number.isInteger(sharedIdx) && sharedIdx >= 0 && sharedIdx < sharedStrings.length) {
            cells.push(sharedStrings[sharedIdx]);
          }
        } else if (type === "b") {
          cells.push(raw === "1" ? "1" : "0");
        } else if (raw.trim().length > 0) {
          cells.push(decodeEntities(raw));
        }
      }
      if (cells.some((cell) => cell.trim().length > 0)) lines.push(cells.join("	"));
    }
  }
  if (lines.length === 0) throw new Error("XLSX contains no extractable cells");
  return lines.join("\n");
}
async function parseEpub(buffer) {
  const zip = await loadZip(buffer);
  const pages = [];
  for (const name of Object.keys(zip.files).sort()) {
    if (!/\.(xhtml|html|htm)$/.test(name)) continue;
    if (/nav|toc|cover/i.test(name)) continue;
    const html = await zip.files[name].async("string");
    const text = await extractHtmlToMarkdown(html);
    if (text.trim().length > 0) pages.push(text);
  }
  if (pages.length === 0) throw new Error("EPUB contains no extractable pages");
  return pages.join("\n\n");
}
function stripXmlText(xml, tag) {
  const parts = [];
  const pattern2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  for (const match of xml.matchAll(pattern2)) {
    if (match[1] !== void 0) parts.push(decodeEntities(match[1]));
  }
  return parts.join("");
}
var PDF_PARSE_WORKER_TIMEOUT_MS = 12e4;
var pdfParseWorker = null;
var pdfParseRequestSeq = 0;
var pdfParseWorkerMissing = false;
var pdfParsePending = /* @__PURE__ */ new Map();
function failAllPdfParsePending(error) {
  for (const { reject } of pdfParsePending.values()) reject(error);
  pdfParsePending.clear();
}
function ensurePdfParseWorker() {
  if (pdfParseWorker !== null) return pdfParseWorker;
  const worker = new Worker(fileURLToPath4(new URL("./pdf-parse-worker.mjs", import.meta.url)));
  worker.unref();
  worker.on("message", (message) => {
    if (message.id === void 0) return;
    const pending = pdfParsePending.get(message.id);
    if (pending === void 0) return;
    pdfParsePending.delete(message.id);
    if (message.ok === true) pending.resolve(message.text ?? "");
    else pending.reject(new Error(message.error ?? "pdf-parse worker failed"));
  });
  const onFailure = (error) => {
    if (pdfParseWorker !== worker) return;
    failAllPdfParsePending(error);
    pdfParseWorker = null;
  };
  worker.on("error", (error) => onFailure(error instanceof Error ? error : new Error(String(error))));
  worker.on("exit", () => onFailure(new Error("pdf-parse worker exited")));
  pdfParseWorker = worker;
  return worker;
}
function postPdfParseRequest(bytes) {
  return new Promise((resolve7, reject) => {
    const id = ++pdfParseRequestSeq;
    const timer = setTimeout(() => {
      pdfParsePending.delete(id);
      const worker = pdfParseWorker;
      pdfParseWorker = null;
      failAllPdfParsePending(new Error("pdf-parse worker timed out"));
      void worker?.terminate();
      reject(new Error("PDF parsing failed: pdf-parse timed out"));
    }, PDF_PARSE_WORKER_TIMEOUT_MS);
    timer.unref?.();
    pdfParsePending.set(id, {
      resolve: (text) => {
        clearTimeout(timer);
        resolve7(text);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      }
    });
    try {
      ensurePdfParseWorker().postMessage({ id, data: Uint8Array.from(bytes) });
    } catch (error) {
      pdfParsePending.delete(id);
      clearTimeout(timer);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
async function parsePdfInProcess(bytes) {
  const mod = await import("pdf-parse");
  const result = await mod.default(Buffer.from(bytes));
  return typeof result?.text === "string" ? result.text : "";
}
async function parsePdfInWorker(bytes) {
  if (!pdfParseWorkerMissing && !existsSync2(fileURLToPath4(new URL("./pdf-parse-worker.mjs", import.meta.url)))) {
    pdfParseWorkerMissing = true;
    console.warn("[dsh-knowledge] pdf-parse worker bundle is missing; parsing PDFs in-process");
  }
  return pdfParseWorkerMissing ? parsePdfInProcess(bytes) : postPdfParseRequest(bytes);
}
async function loadMammoth() {
  const mod = await import("mammoth");
  return mod.default ?? mod;
}
async function loadWordExtractor() {
  const mod = await import("word-extractor");
  return mod.default ?? mod;
}
async function loadAnydoc() {
  const mod = await import("@firecrawl/anydoc");
  return mod;
}
var MAX_ARCHIVE_UNCOMPRESSED_BYTES = 256 * 1024 * 1024;
async function loadZip(buffer) {
  const mod = await import("jszip");
  const JSZip3 = mod.default ?? mod;
  let zip;
  try {
    zip = await new JSZip3().loadAsync(buffer);
  } catch (error) {
    throw new Error(`archive parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  const total = Object.values(zip.files).reduce((sum, entry) => {
    const size = entry._data?.uncompressedSize;
    return sum + (typeof size === "number" && Number.isFinite(size) ? size : 0);
  }, 0);
  if (total > MAX_ARCHIVE_UNCOMPRESSED_BYTES) {
    throw new Error(`archive too large to unpack (${Math.round(total / 1024 / 1024)} MB uncompressed)`);
  }
  return zip;
}

// src/knowledge/mineru.ts
init_net();
import JSZip from "jszip";
var POLL_INTERVAL_MS = 5e3;
var EXTRACT_TIMEOUT_MS = 30 * 6e4;
async function apiJson(url, settings, init) {
  const response = await httpFetch(url, {
    method: init?.method ?? "GET",
    headers: {
      authorization: `Bearer ${settings.apiKey}`,
      accept: "*/*",
      ...init?.body !== void 0 ? { "content-type": "application/json" } : {}
    },
    body: init?.body,
    timeoutMs: 6e4,
    ...init?.signal !== void 0 ? { signal: init.signal } : {}
  });
  if (!response.ok) {
    throw new Error(`mineru request failed: HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
  return await response.json();
}
async function extractPdfWithMineru(bytes, fileName, settings, signal) {
  const host = settings.apiHost.trim() === "" ? "https://mineru.net" : settings.apiHost.trim().replace(/\/+$/, "");
  const batch = await apiJson(`${host}/api/v4/file-urls/batch`, settings, {
    method: "POST",
    body: JSON.stringify({
      files: [{ name: fileName, data_id: "dsh-knowledge" }]
    }),
    ...signal !== void 0 ? { signal } : {}
  });
  if (batch.code !== 0 || batch.data.batch_id === "") {
    throw new Error(`mineru batch create failed: ${batch.msg ?? "empty batch_id"}`);
  }
  const uploadUrl = batch.data.file_urls[0];
  if (!uploadUrl) throw new Error("mineru batch create returned no upload URL");
  const upload = await httpFetch(uploadUrl, {
    method: "PUT",
    headers: batch.data.headers?.[0],
    body: bytes,
    timeoutMs: 12e4,
    ...signal !== void 0 ? { signal } : {}
  });
  if (!upload.ok) throw new Error(`mineru upload failed: HTTP ${upload.status}`);
  const deadline = Date.now() + EXTRACT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (signal?.aborted === true) throw new Error("mineru extraction aborted (document was deleted)");
    await new Promise((resolve7) => setTimeout(resolve7, POLL_INTERVAL_MS));
    const result = await apiJson(
      `${host}/api/v4/extract-results/batch/${batch.data.batch_id}`,
      settings,
      signal !== void 0 ? { signal } : void 0
    );
    if (result.code !== 0) throw new Error(`mineru poll failed: ${result.msg ?? "non-zero code"}`);
    const fileResult = result.data.extract_result?.[0];
    if (fileResult === void 0) continue;
    if (fileResult.state === "failed") {
      throw new Error(`mineru extract failed: ${fileResult.err_msg ?? "unknown error"}`);
    }
    if (fileResult.state === "done") {
      if (!fileResult.full_zip_url) throw new Error("mineru extract done without a result zip");
      const zipResponse = await httpFetch(fileResult.full_zip_url, {
        timeoutMs: 12e4,
        ...signal !== void 0 ? { signal } : {}
      });
      if (!zipResponse.ok) throw new Error(`mineru result download failed: HTTP ${zipResponse.status}`);
      const zip = await JSZip.loadAsync(new Uint8Array(await zipResponse.arrayBuffer()));
      const markdownEntry = Object.values(zip.files).find(
        (entry) => !entry.dir && /\.md$/i.test(entry.name) && !entry.name.includes("__assets__")
      );
      if (markdownEntry === void 0) throw new Error("mineru result zip contains no markdown");
      const markdown = await markdownEntry.async("string");
      if (markdown.trim().length === 0) throw new Error("mineru returned empty markdown");
      return markdown;
    }
  }
  throw new Error("mineru extract timed out");
}

// src/knowledge/parsed-document.ts
import { createHash as createHash3 } from "node:crypto";
import { setImmediate as yieldTurn } from "node:timers/promises";
import JSZip2 from "jszip";

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
  await new Promise((resolve7, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve7();
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
  return createHash3("sha256").update(bytes).digest("hex");
}
function parsedTextDocument(text, bytes, provider, optionsFingerprint, warnings = []) {
  return { document: {
    schemaVersion: 1,
    text,
    sourceHash: processingHash(bytes),
    provider,
    optionsFingerprint,
    completeness: "unknown",
    blocks: text ? [{ id: "text:0", index: 0, type: "text", text, textStart: 0, textEnd: text.length }] : [],
    assets: [],
    warnings
  }, assets: [] };
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
  return await new Promise((resolve7, reject) => {
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
      resolve7(result);
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
function decodeEntities2(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", minus: "\u2212", times: "\xD7", divide: "\xF7", le: "\u2264", ge: "\u2265" };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, name) => {
    if (!name.startsWith("#")) return named[name.toLowerCase()] ?? all;
    const value = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return Number.isInteger(value) && value > 0 && value <= 1114111 && !(value >= 55296 && value <= 57343) ? String.fromCodePoint(value) : "\uFFFD";
  });
}
function inertHtmlText(html) {
  return decodeEntities2(html.replace(/<!--[^]*?-->/g, "").replace(/<(script|style|iframe)\b[^>]*>[^]*?<\/\1\s*>/gi, "").replace(/<eq\b[^>]*>([^]*?)<\/eq\s*>/gi, (_all, equation) => `$${equation.replace(/<[^>]*>/g, "")}$`).replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/p\s*>/gi, "\n").replace(/<[^>]*>/g, "")).trim();
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
    zip = await JSZip2.loadAsync(archive);
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
    const relative5 = entry.name.startsWith(root) ? entry.name.slice(root.length) : "";
    const mimeTypes = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
    const extension = relative5.split(".").at(-1)?.toLowerCase() ?? "";
    if (relative5.startsWith("images/") && mimeTypes[extension]) {
      const asset = { id: `asset-${processingHash(relative5).slice(0, 24)}`, path: relative5, mimeType: mimeTypes[extension], byteLength: bytes.length, sha256: processingHash(bytes) };
      assetInfo.push(asset);
      assetBytes.push({ id: asset.id, bytes });
      assetsByPath.set(relative5, asset);
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
      block.content.forEach((child2, index) => visit(child2, pageIndex, `${path}.${index}`, id, depth + 1));
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

// src/knowledge/document-processing.ts
function processorFingerprint(config) {
  return hash(JSON.stringify({
    version: 1,
    provider: config.documentProcessorProvider,
    host: config.documentProcessorProvider === "mineru-local" ? config.mineruLocalUrl : config.mineruApiHost,
    tier: config.mineruTier ?? "basic",
    caption: { provider: config.imageCaptionProvider, model: config.imageCaptionModel, host: config.imageCaptionBaseUrl }
  }));
}
function hash(bytes) {
  return createHash4("sha256").update(bytes).digest("hex");
}
function processorErrorCode(error) {
  if (error instanceof Error && error.name === "AbortError") return "canceled";
  const code = error?.code;
  return typeof code === "string" && /^[a-zA-Z0-9_]{1,64}$/.test(code) ? code : "processing_failed";
}
function processorErrorMessage(error) {
  const code = processorErrorCode(error);
  if (code === "ocr_incomplete") return "OCR did not process every required page; no partial text was indexed. Split the PDF or switch to MinerU, then rebuild.";
  if (["ocr_process_crash", "ocr_timeout", "ocr_failed"].includes(code)) return `Local OCR failed (${code}); the DSH host remains running. Check the OCR model installation or switch to MinerU, then rebuild.`;
  if (code === "ocr_busy") return "Local OCR queue is full; retry the document later.";
  if (code === "recovery_limit_reached") return "Automatic document recovery stopped after 3 attempts; check the source and processor settings, then rebuild manually.";
  if (code === "parse_failed") return "MinerU extraction failed (provider unavailable); local parsing failed (parse_failed); check the document processor settings";
  return `document processor failed (${code}); check processor configuration and service health`;
}
async function processDocumentFile(input) {
  input.signal?.throwIfAborted();
  const { config, bytes, artifacts, baseId, documentId } = input;
  const sourceHash = hash(bytes);
  const fingerprint = processorFingerprint(config);
  const previous = input.resume ? await artifacts.getJob(baseId, documentId) : void 0;
  const matching = previous?.sourceHash === sourceHash && previous.fingerprint === fingerprint ? previous : void 0;
  if (matching?.state === "completed" && matching.artifact !== void 0) {
    const parsed = await artifacts.load(baseId, documentId, matching.artifact);
    return { text: parsed.text, parsed, processing: { ...matching.artifact, reused: true } };
  }
  if (matching?.errorCode === "submission_unknown") throw Object.assign(new Error("previous submission outcome is unknown; explicitly reparse to retry"), { code: "submission_unknown" });
  if (matching !== void 0 && (matching.startupAttempts ?? 0) >= 3) {
    await artifacts.saveJob({ ...matching, state: "failed", errorCode: "recovery_limit_reached", progress: { stage: "failed" }, updatedAt: Date.now() });
    throw Object.assign(new Error("automatic document recovery limit reached; rebuild manually"), { code: "recovery_limit_reached" });
  }
  let job2 = {
    version: 1,
    baseId,
    documentId,
    sourceHash,
    fingerprint,
    state: "running",
    progress: { stage: "checking" },
    updatedAt: Date.now(),
    startupAttempts: input.resume ? (matching?.startupAttempts ?? 0) + 1 : 0
  };
  await artifacts.saveJob(job2);
  let progressWrite = Promise.resolve();
  const progress = (value) => {
    const retainedId = value.jobId ?? job2.progress.jobId ?? matching?.progress.jobId;
    job2 = { ...job2, progress: { ...value, ...retainedId !== void 0 ? { jobId: retainedId } : {} }, updatedAt: Date.now() };
    const snapshot2 = job2;
    progressWrite = progressWrite.then(() => artifacts.saveJob(snapshot2));
    void progressWrite.catch(() => {
    });
    input.onProgress?.(value);
  };
  const warnings = [];
  try {
    let output;
    let remoteFailure;
    const pdf = extensionOf(input.fileName) === "pdf";
    if (pdf && config.documentProcessorProvider === "mineru-local") {
      try {
        output = await extractWithMineruLocal(bytes, input.fileName, {
          apiUrl: config.mineruLocalUrl ?? "http://127.0.0.1:8000",
          apiKey: config.mineruLocalApiKey,
          tier: config.mineruTier ?? "basic",
          timeoutMs: config.documentProcessingTimeoutMs ?? 18e5
        }, {
          signal: input.signal,
          onProgress: progress,
          ...matching?.state === "running" && matching.progress.jobId !== void 0 ? { resumeJobId: matching.progress.jobId } : {}
        });
      } catch (error) {
        input.signal?.throwIfAborted();
        if (["job_lost", "submission_unknown"].includes(processorErrorCode(error))) throw error;
        remoteFailure = error;
      }
    } else if (pdf && config.documentProcessorProvider === "mineru") {
      if (config.mineruApiKey.trim() === "") {
        remoteFailure = Object.assign(new Error("MinerU cloud requires a key"), { code: "configuration_missing" });
      } else {
        try {
          progress({ stage: "parsing" });
          const text = await extractPdfWithMineru(bytes, input.fileName, { apiHost: config.mineruApiHost, apiKey: config.mineruApiKey }, input.signal);
          output = parsedTextDocument(text, bytes, "mineru", fingerprint);
        } catch (error) {
          input.signal?.throwIfAborted();
          remoteFailure = error;
        }
      }
    }
    if (output === void 0) {
      if (remoteFailure !== void 0) warnings.push({ code: "processor_fallback", message: `${processorErrorMessage(remoteFailure)}; used built-in local parsing` });
      progress({ stage: "parsing" });
      try {
        const text = await parseDocumentBuffer(bytes, input.fileName, input.mimeType);
        input.signal?.throwIfAborted();
        output = parsedTextDocument(text, bytes, "builtin", fingerprint, warnings);
      } catch (error) {
        input.signal?.throwIfAborted();
        if (remoteFailure !== void 0) throw Object.assign(new Error(`MinerU extraction failed (${processorErrorCode(remoteFailure)}); local parsing failed (${processorErrorCode(error)})`), { code: "parse_failed" });
        throw error;
      }
    }
    if (!output.document.text.trim()) throw Object.assign(new Error("parsed document is empty"), { code: "empty_result" });
    if (pdf && config.imageCaptionProvider !== "off") {
      try {
        const { captionPdfImages: captionPdfImages2 } = await Promise.resolve().then(() => (init_caption(), caption_exports));
        input.signal?.throwIfAborted();
        const caption = await captionPdfImages2(bytes, {
          provider: config.imageCaptionProvider,
          model: config.imageCaptionModel,
          baseUrl: config.imageCaptionBaseUrl,
          apiKey: config.imageCaptionApiKey,
          embeddingBaseUrl: config.embeddingBaseUrl
        });
        input.signal?.throwIfAborted();
        if (caption.trim()) {
          const start = output.document.text.length + 2;
          output = { ...output, document: {
            ...output.document,
            text: `${output.document.text}

${caption}`,
            blocks: [...output.document.blocks, { id: "generated-caption", index: output.document.blocks.length, type: "caption", text: caption, textStart: start, textEnd: start + caption.length }],
            warnings: [...output.document.warnings, { code: "generated_caption", message: "Image descriptions are model-generated, not verbatim source text." }]
          } };
        }
      } catch (error) {
        input.signal?.throwIfAborted();
        output = { ...output, document: { ...output.document, warnings: [...output.document.warnings, { code: "caption_failed", message: processorErrorMessage(error) }] } };
      }
    }
    input.signal?.throwIfAborted();
    output = { ...output, document: { ...output.document, optionsFingerprint: fingerprint } };
    progress({ stage: "normalizing" });
    await progressWrite;
    const processing = await artifacts.save(baseId, documentId, output);
    input.signal?.throwIfAborted();
    await artifacts.saveJob({ ...job2, state: "completed", artifact: processing, progress: { stage: "completed" }, updatedAt: Date.now() });
    return { text: output.document.text, parsed: output.document, processing };
  } catch (error) {
    await progressWrite.catch(() => {
    });
    const canceled = input.signal?.aborted === true;
    await artifacts.saveJob({ ...job2, state: canceled ? "canceled" : "failed", errorCode: processorErrorCode(error), progress: { ...job2.progress, stage: canceled ? "canceled" : "failed" }, updatedAt: Date.now() }).catch(() => {
    });
    throw error;
  }
}

// src/knowledge/mineru-deployment.ts
import { mkdir as mkdir6, open as open2, readFile as readFile5, rename as rename5, unlink } from "node:fs/promises";
import { dirname as dirname5, join as join8 } from "node:path";
import { randomUUID as randomUUID3 } from "node:crypto";

// src/knowledge/mineru-deployment-plan.ts
import { createHash as createHash5, randomUUID as randomUUID2 } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readdir as readdir4, readFile as readFile3, statfs } from "node:fs/promises";
import { dirname as dirname3, isAbsolute as isAbsolute2, join as join4, parse, resolve as resolve3 } from "node:path";
import { homedir as homedir2 } from "node:os";

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
  const a = resolve3(left);
  const b = resolve3(right);
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
  if (!value || value.includes("\0") || !isAbsolute2(value) || value.startsWith("\\\\") || value.startsWith("//")) {
    throw new DeploymentError("invalid_path", "Choose an absolute local directory, not a network path.");
  }
  const target = resolve3(value);
  const same = (a, b) => process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
  if (same(target, parse(target).root) || same(target, homedir2()) || same(target, resolve3(process.cwd()))) {
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
    const parent = dirname3(current);
    if (parent === current) break;
    current = parent;
  }
  return target;
}
async function checkOwnedRoot(root) {
  await checkDeploymentPath(root);
  let names;
  try {
    names = await readdir4(root);
  } catch (e) {
    if (missing(e)) return;
    throw e;
  }
  if (names.length === 0) return;
  try {
    await checkDeploymentPath(join4(root, OWNERSHIP_MARKER));
    const marker = JSON.parse(await readFile3(join4(root, OWNERSHIP_MARKER), "utf8"));
    if (marker.owner === "dsh-knowledge/mineru" && marker.schemaVersion === 1 && typeof marker.root === "string" && sameDeploymentPath(marker.root, root)) return;
  } catch {
  }
  throw new DeploymentError("unowned_directory", "This nonempty directory is not managed by the plugin. Choose a new subdirectory; use existing models through the read-only model path.");
}
async function verifyModelFile(root, file, signal) {
  signal?.throwIfAborted();
  if (file.path.includes(":") || file.path.includes("\0") || file.path.split(/[\\/]/).some((p) => !p || p === ".." || p === ".") || isAbsolute2(file.path)) throw new DeploymentError("invalid_manifest", "Unsafe model manifest path.");
  const path = await checkDeploymentPath(join4(root, file.path));
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.size !== file.bytes) return false;
  } catch (e) {
    if (missing(e)) return false;
    throw e;
  }
  const hash2 = createHash5(file.algorithm === "git-sha1" ? "sha1" : "sha256");
  if (file.algorithm === "git-sha1") hash2.update(`blob ${file.bytes}\0`);
  for await (const piece of createReadStream(path, { signal })) {
    signal?.throwIfAborted();
    hash2.update(piece);
  }
  return hash2.digest("hex") === file.digest;
}
async function availableBytes(root) {
  let path = root;
  while (true) {
    try {
      const stat7 = await statfs(path, { bigint: true });
      const bytes = stat7.bavail * stat7.bsize;
      return bytes <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(bytes) : null;
    } catch (e) {
      if (!missing(e) || dirname3(path) === path) return null;
      path = dirname3(path);
    }
  }
}
async function createDeploymentPlan(input, options = {}) {
  const root = await checkDeploymentPath(input.root.trim());
  await checkOwnedRoot(root);
  const externalModels = Boolean(input.existingModels?.trim());
  const modelRoot = await checkDeploymentPath(externalModels ? input.existingModels.trim() : join4(root, "models", MINERU_MODEL_DIRECTORY));
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
    id: randomUUID2(),
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
import { copyFile, mkdir as mkdir4, open, rename as rename4, stat as stat3, truncate } from "node:fs/promises";
import { dirname as dirname4, join as join5 } from "node:path";
async function downloadMineruModels(plan, signal, progress, fetcher = fetch) {
  const targetRoot = join5(plan.root, "models", MINERU_MODEL_DIRECTORY);
  const totalBytes = plan.files.reduce((sum, file) => sum + file.bytes, 0);
  let verified = 0;
  for (const file of plan.files) {
    signal.throwIfAborted();
    if (await verifyModelFile(targetRoot, file, signal)) {
      verified += file.bytes;
      progress({ completedBytes: verified, totalBytes, file: file.path });
      continue;
    }
    const destination = await checkDeploymentPath(join5(targetRoot, file.path));
    const partRoot = join5(plan.root, "staging", plan.modelRevision);
    const partFile = { ...file, path: `${file.path}.part` };
    const partial = await checkDeploymentPath(join5(partRoot, partFile.path));
    await mkdir4(dirname4(partial), { recursive: true });
    await mkdir4(dirname4(destination), { recursive: true });
    const free = await availableBytes(plan.root);
    if (free !== null && free < file.bytes) throw new DeploymentError("insufficient_space", "Not enough space to stage this model file.");
    if (plan.externalModels) {
      if (!await verifyModelFile(plan.modelRoot, file, signal)) throw new DeploymentError("external_models_changed", "An external model changed after preflight. Run preflight again.");
      await copyFile(join5(plan.modelRoot, file.path), partial);
    } else {
      let offset = await stat3(partial).then((value) => value.size).catch((error) => {
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
      const size = await stat3(partial).then((value) => value.size);
      if (size >= file.bytes) await truncate(partial, 0);
      throw new DeploymentError("checksum_mismatch", "Model download is incomplete or corrupt. No readiness was granted; retry is safe.");
    }
    await rename4(partial, destination);
    verified += file.bytes;
    progress({ completedBytes: verified, totalBytes, file: file.path });
  }
}

// src/knowledge/mineru-runtime.ts
import { spawn } from "node:child_process";
import { access, mkdir as mkdir5, writeFile as writeFile4 } from "node:fs/promises";
import { createServer } from "node:net";
import { join as join7 } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// src/knowledge/mineru-python.ts
import { execFile } from "node:child_process";
import { createHash as createHash6 } from "node:crypto";
import { readFile as readFile4, readdir as readdir5, realpath, stat as stat4 } from "node:fs/promises";
import { homedir as homedir3 } from "node:os";
import { basename, delimiter, isAbsolute as isAbsolute3, join as join6, resolve as resolve4 } from "node:path";
var PROBE = 'import sys,struct,platform,sysconfig,importlib.util,json; print(json.dumps(dict(version=list(sys.version_info[:3]),release=sys.version_info.releaselevel,implementation=platform.python_implementation(),architecture=platform.machine(),bits=struct.calcsize("P")*8,venv=importlib.util.find_spec("venv") is not None,ensurepip=importlib.util.find_spec("ensurepip") is not None,free_threaded=bool(sysconfig.get_config_var("Py_GIL_DISABLED")))))';
var run = (file, args, signal) => new Promise((resolveResult, reject) => {
  const env = {};
  for (const key of ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "WINDIR", "HOME", "USERPROFILE", "LOCALAPPDATA"]) if (process.env[key]) env[key] = process.env[key];
  execFile(file, args, { env, cwd: homedir3(), windowsHide: true, shell: false, timeout: 5e3, killSignal: "SIGKILL", maxBuffer: 64 * 1024, signal }, (error, stdout) => error ? reject(error) : resolveResult(stdout));
});
function validatePythonExecutable(value) {
  if (typeof value !== "string" || value.length > 4096 || !isAbsolute3(value) || /[\0\r\n]/.test(value) || value.startsWith("\\\\") || value.startsWith("//") || !/^python(?:\d+(?:\.\d+)*)?(?:\.exe)?$/i.test(basename(value))) {
    throw new DeploymentError("invalid_python_path", "Select an absolute local Python executable path, not a shell command or directory.");
  }
  if (process.platform === "win32" && value.slice(2).includes(":")) throw new DeploymentError("invalid_python_path", "Alternate data stream paths are not supported.");
  return resolve4(value);
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
  result.fingerprint = createHash6("sha256").update(JSON.stringify([executable, result.version, data.implementation, data.architecture, data.bits, data.release, data.free_threaded, data.venv, data.ensurepip])).digest("hex");
  return result;
}
async function probePythonExecutable(value, signal, runner = run, source = "manual") {
  const executable = validatePythonExecutable(value);
  signal?.throwIfAborted();
  try {
    const info = await stat4(executable);
    if (!info.isFile()) throw new Error("Not a file");
    const result = parsePythonProbe(executable, source, await runner(executable, ["-I", "-S", "-c", PROBE], signal));
    result.fingerprint = createHash6("sha256").update(JSON.stringify([result.fingerprint, await realpath(executable), info.size, info.mtimeMs])).digest("hex");
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
    if (!path || !isAbsolute3(path) || /[\\/]WindowsApps(?:[\\/]|$)/i.test(path)) continue;
    for (const name of names) add(join6(path, name), "PATH");
  }
  if (process.platform === "win32") {
    try {
      for (const path of parsePythonLauncherPaths(await run("py.exe", ["-0p"], budget))) add(path, "Python launcher");
    } catch {
      signal?.throwIfAborted();
    }
  }
  const home = homedir3();
  try {
    const registry = join6(home, ".conda", "environments.txt");
    if ((await stat4(registry)).size <= 64 * 1024) for (const prefix of (await readFile4(registry, "utf8")).split(/\r?\n/).slice(0, 128)) {
      if (isAbsolute3(prefix.trim())) add(join6(prefix.trim(), process.platform === "win32" ? "python.exe" : "bin/python"), "Conda registry");
    }
  } catch {
  }
  if (process.env.CONDA_PREFIX) add(join6(process.env.CONDA_PREFIX, process.platform === "win32" ? "python.exe" : "bin/python"), "Active Conda");
  const roots = process.platform === "win32" ? [process.env.LOCALAPPDATA && join6(process.env.LOCALAPPDATA, "Programs", "Python"), join6(home, ".conda", "envs"), join6(home, "miniconda3", "envs"), join6(home, "anaconda3", "envs"), join6(home, ".pyenv", "pyenv-win", "versions")] : [join6(home, ".pyenv", "versions"), join6(home, ".local", "share", "uv", "python"), join6(home, "miniconda3", "envs"), join6(home, "anaconda3", "envs"), "/Library/Frameworks/Python.framework/Versions"];
  for (const root of roots) if (root) {
    try {
      const children = await readdir5(root, { withFileTypes: true });
      if (children.length > 64) truncated = true;
      for (const child2 of children.slice(0, 64)) if (child2.isDirectory()) {
        add(join6(root, child2.name, process.platform === "win32" ? "python.exe" : "bin/python3"), "Common location");
        if (process.platform !== "win32") add(join6(root, child2.name, "bin/python"), "Common location");
      }
    } catch {
    }
  }
  const existing = [];
  const seen = /* @__PURE__ */ new Set();
  for (const [path, source] of candidates) {
    budget.throwIfAborted();
    try {
      if (!(await stat4(path)).isFile()) continue;
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
function runtimeEnvironment(root, configPath = join7(root, "config.yaml")) {
  const result = {};
  for (const name of ["PATH", "Path", "SYSTEMROOT", "SystemRoot", "WINDIR", "COMSPEC", "PATHEXT", "LANG", "LC_ALL"]) if (process.env[name]) result[name] = process.env[name];
  return {
    ...result,
    HOME: join7(root, "home"),
    USERPROFILE: join7(root, "home"),
    TMP: join7(root, "tmp"),
    TEMP: join7(root, "tmp"),
    TMPDIR: join7(root, "tmp"),
    PYTHONNOUSERSITE: "1",
    PYTHONUTF8: "1",
    MINERU_HOME: join7(root, "home"),
    MINERU_CONFIG: configPath,
    MINERU_MODEL_SOURCE: "local",
    MINERU_MODEL_SMALL_BACKEND: "onnx",
    HF_HUB_OFFLINE: "1",
    HF_HUB_DISABLE_TELEMETRY: "1",
    DO_NOT_TRACK: "1"
  };
}
async function stopOwnedChild(child2) {
  if (!child2.pid || child2.exitCode !== null || child2.signalCode !== null) return;
  const closed = new Promise((resolve7) => child2.once("close", () => resolve7()));
  if (process.platform === "win32") {
    const killer = spawn("taskkill.exe", ["/PID", String(child2.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore", shell: false });
    await Promise.race([new Promise((resolve7) => {
      killer.once("error", () => resolve7());
      killer.once("close", () => resolve7());
    }), delay(5e3)]);
  } else {
    try {
      process.kill(-child2.pid, "SIGTERM");
    } catch {
      child2.kill("SIGTERM");
    }
  }
  await Promise.race([closed, delay(3e3)]);
  if (child2.exitCode === null && child2.signalCode === null) {
    if (process.platform !== "win32") {
      try {
        process.kill(-child2.pid, "SIGKILL");
      } catch {
        child2.kill("SIGKILL");
      }
    } else child2.kill("SIGKILL");
    await Promise.race([closed, delay(3e3)]);
  }
  if (child2.exitCode === null && child2.signalCode === null) throw new DeploymentError("shutdown_failed", "The owned MinerU process did not exit; its installation remains locked.");
}
async function runManagedCommand(executable, args, root, signal, timeoutMs) {
  signal.throwIfAborted();
  const child2 = spawn(executable, args, { cwd: root, env: runtimeEnvironment(root), shell: false, windowsHide: true, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  let diagnostic = "";
  child2.stdout?.on("data", (chunk) => {
    if (output.length < 4096) output += String(chunk).slice(0, 4096 - output.length);
  });
  child2.stderr?.on("data", (chunk) => {
    if (diagnostic.length < 4096) diagnostic += String(chunk).slice(0, 4096 - diagnostic.length);
  });
  const budget = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
  let terminate = () => {
  };
  const interrupted = new Promise((_resolve, reject) => {
    terminate = () => {
      void stopOwnedChild(child2).then(() => reject(budget.reason), reject);
    };
    budget.addEventListener("abort", terminate, { once: true });
    if (budget.aborted) terminate();
  });
  try {
    const code = await Promise.race([new Promise((resolve7, reject) => {
      child2.once("error", reject);
      child2.once("close", resolve7);
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
  for (const name of ["home", "tmp", "uploads", "envs"]) await mkdir5(await checkDeploymentPath(join7(root, name)), { recursive: true });
  if (!/^[a-f0-9-]{36}$/.test(environmentId)) throw new DeploymentError("invalid_environment", "Invalid environment identifier.");
  const envRoot = await checkDeploymentPath(join7(root, "envs", environmentId));
  await runManagedCommand(selected.executable, ["-I", "-m", "venv", "--copies", envRoot], root, signal, 12e4);
  const python = join7(envRoot, process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  await writeFile4(await checkDeploymentPath(join7(envRoot, "config.yaml")), JSON.stringify({ model: { source: "local", base_dir: join7(root, "models"), small_backend: "onnx", vlm: { server_url: "" } }, llm_aided: { api_key: "" } }), { mode: 384 });
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
  await new Promise((resolve7, reject) => {
    socket.once("error", () => reject(new DeploymentError("port_in_use", "MinerU port 18879 is occupied. No existing process was stopped.")));
    socket.listen(port, "127.0.0.1", () => socket.close((error) => error ? reject(error) : resolve7()));
  });
  const apiKey = "";
  const executable = await checkDeploymentPath(join7(envRoot, process.platform === "win32" ? "Scripts/mineru-kit.exe" : "bin/mineru-kit"));
  const environmentConfig = await checkDeploymentPath(join7(envRoot, "config.yaml"));
  const configPath = await access(environmentConfig).then(() => environmentConfig, async () => {
    const legacyConfig = await checkDeploymentPath(join7(root, "config.yaml"));
    await access(legacyConfig);
    return legacyConfig;
  });
  const child2 = spawn(
    executable,
    ["api-server", "--host", "127.0.0.1", "--port", String(port), "--tier", "basic"],
    { cwd: root, env: runtimeEnvironment(root, configPath), shell: false, windowsHide: true, detached: process.platform !== "win32", stdio: "ignore" }
  );
  let spawnError = false;
  child2.on("error", () => {
    spawnError = true;
  });
  const service = { child: child2, url: `http://127.0.0.1:${port}`, apiKey, stop: () => stopOwnedChild(child2) };
  const budget = AbortSignal.any([signal, AbortSignal.timeout(12e4)]);
  try {
    while (true) {
      budget.throwIfAborted();
      if (spawnError || child2.exitCode !== null || child2.signalCode !== null) throw new DeploymentError("service_exited", "The managed service failed to start. Check runtime compatibility or port conflicts.");
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
    for (const file of MINERU_BASIC_FILES) if (!await verifyModelFile(join8(root, "models", MINERU_MODEL_DIRECTORY), file, signal)) throw new DeploymentError("model_changed", "A verified model file changed; prepare again.");
  }
};
async function atomicJson(path, value) {
  await checkDeploymentPath(path);
  await mkdir6(dirname5(path), { recursive: true });
  const temp = `${path}.${randomUUID3()}.tmp`;
  const handle = await open2(temp, "wx", 384);
  try {
    await handle.writeFile(JSON.stringify(value));
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename5(temp, path);
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
        const { root } = JSON.parse(await readFile5(pointer, "utf8"));
        if (typeof root === "string") await this.restore(root);
      }
    } catch (error) {
      if (error.code !== "ENOENT") this.state.error = { code: "state_unavailable", message: "Saved deployment could not be verified. Select its directory and run preflight." };
    }
  }
  async restore(root) {
    await checkOwnedRoot(root);
    const path = await checkDeploymentPath(join8(root, "deployment.json"));
    const saved = JSON.parse(await readFile5(path, "utf8"));
    if (saved.schemaVersion !== 1 || saved.runtimeVersion !== MINERU_RUNTIME_VERSION || saved.revision !== MINERU_MODEL_REVISION || typeof saved.status.root !== "string" || !sameDeploymentPath(saved.status.root, root) || saved.environmentId !== void 0 && !/^[a-f0-9-]{36}$/.test(saved.environmentId)) throw new DeploymentError("invalid_state", "Incompatible deployment state.");
    this.environmentId = saved.environmentId;
    const lockPath = await checkDeploymentPath(join8(root, ".operation.lock"));
    const lockExists = await readFile5(lockPath).then(() => true, (error) => {
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
    await atomicJson(join8(this.state.root, "deployment.json"), { schemaVersion: 1, runtimeVersion: MINERU_RUNTIME_VERSION, revision: MINERU_MODEL_REVISION, environmentId: this.environmentId, status: { ...this.state, active: inactive ? false : this.state.active, endpoint: void 0 } });
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
    await mkdir6(root, { recursive: true });
    const markerPath = await checkDeploymentPath(join8(root, OWNERSHIP_MARKER));
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
    const lockPath = await checkDeploymentPath(join8(root, ".operation.lock"));
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
      operationId: randomUUID3(),
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
      const environmentId = randomUUID3();
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
        const environment = await checkDeploymentPath(join8(root, "envs", this.environmentId));
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

// src/knowledge/context.ts
init_text_safety();
var DEFAULT_CONTEXT_TOKENS = 768;
var DEFAULT_NEIGHBOURS = 1;
var MIN_OVERLAP_CHARS = 24;
var SENTENCE_BOUNDARY = /[\n\r。！？；.!?;]/;
function composeContextWindow(chunks, anchor, options = {}) {
  const beforeLimit = clampInt(options.before, 0, 10, DEFAULT_NEIGHBOURS);
  const afterLimit = clampInt(options.after, 0, 10, DEFAULT_NEIGHBOURS);
  const maxTokens = clampInt(options.maxTokens, 1, 1e6, DEFAULT_CONTEXT_TOKENS);
  const crossHeading = options.crossHeading === true;
  const byIndex = /* @__PURE__ */ new Map();
  for (const chunk of chunks) {
    if (chunk.docId === anchor.docId && chunk.baseId === anchor.baseId && chunk.processingRevision === anchor.processingRevision) byIndex.set(chunk.index, chunk);
  }
  byIndex.set(anchor.index, anchor);
  const ordered = [...byIndex.values()].sort((a, b) => a.index - b.index || a.id.localeCompare(b.id));
  const earlierLoaded = ordered.filter((chunk) => chunk.index < anchor.index);
  const laterLoaded = ordered.filter((chunk) => chunk.index > anchor.index);
  const sameHeading = (chunk) => crossHeading || normalizeHeading(chunk.heading) === normalizeHeading(anchor.heading);
  const eligibleBefore = takeWhile(contiguousTowardAnchor(earlierLoaded, anchor.index, -1), sameHeading);
  const eligibleAfter = takeWhile(contiguousTowardAnchor(laterLoaded, anchor.index, 1), sameHeading);
  const beforeChunks = eligibleBefore.slice(0, beforeLimit).reverse();
  const afterChunks = eligibleAfter.slice(0, afterLimit);
  let anchorExcerpt = excerptOf(anchor);
  anchorExcerpt = fitAnchorToBudget(anchorExcerpt, maxTokens, options.focus);
  const deduplicated = removeAdjacentOverlap(beforeChunks.map(excerptOf), anchorExcerpt, afterChunks.map(excerptOf));
  const beforeExcerpts = deduplicated.before;
  const afterExcerpts = deduplicated.after;
  const hasMoreBefore = options.hasMoreBefore ?? false;
  const hasMoreAfter = options.hasMoreAfter ?? false;
  const anchorOnly = makeWindow(anchor, [], anchorExcerpt, [], hasMoreBefore, hasMoreAfter);
  const remaining = Math.max(0, maxTokens - anchorOnly.estimatedTokens);
  const beforeAllowance = afterExcerpts.length === 0 ? remaining : Math.floor(remaining / 2);
  const afterAllowance = beforeExcerpts.length === 0 ? remaining : remaining - beforeAllowance;
  let fittedBefore = fitSide(beforeExcerpts, beforeAllowance, "before");
  let fittedAfter = fitSide(afterExcerpts, afterAllowance, "after");
  const usedBefore = estimateSideTokens(fittedBefore);
  const usedAfter = estimateSideTokens(fittedAfter);
  if (usedBefore < beforeAllowance && afterExcerpts.length > 0) {
    fittedAfter = fitSide(afterExcerpts, afterAllowance + beforeAllowance - usedBefore, "after");
  }
  if (usedAfter < afterAllowance && beforeExcerpts.length > 0) {
    fittedBefore = fitSide(beforeExcerpts, beforeAllowance + afterAllowance - usedAfter, "before");
  }
  let window = makeWindow(anchor, fittedBefore, anchorExcerpt, fittedAfter, hasMoreBefore, hasMoreAfter);
  window = enforceSerializedBudget(window, maxTokens, options.focus);
  const first = window.before[0] ?? window.anchor;
  const last = window.after[window.after.length - 1] ?? window.anchor;
  const finalHasMoreBefore = options.hasMoreBefore ?? (first.truncatedStart || first.index > 0 || earlierLoaded.some((chunk) => chunk.index < first.index));
  const finalHasMoreAfter = options.hasMoreAfter ?? (last.truncatedEnd || (options.documentChunkCount !== void 0 ? last.index < Math.max(0, Math.trunc(options.documentChunkCount) - 1) : laterLoaded.some((chunk) => chunk.index > last.index)));
  return makeWindow(anchor, window.before, window.anchor, window.after, finalHasMoreBefore, finalHasMoreAfter);
}
function excerptOf(chunk) {
  return {
    chunkId: chunk.id,
    index: chunk.index,
    ...chunk.heading !== void 0 ? { heading: chunk.heading } : {},
    text: chunk.text,
    textStart: 0,
    textEnd: chunk.text.length,
    truncatedStart: false,
    truncatedEnd: false,
    ...chunk.sourceSpans !== void 0 ? { sourceSpans: sliceSourceSpans(chunk.sourceSpans, 0, chunk.text.length) } : {}
  };
}
function normalizeHeading(heading) {
  return heading?.trim() ?? "";
}
function contiguousTowardAnchor(chunks, anchorIndex, direction) {
  const byIndex = new Map(chunks.map((chunk) => [chunk.index, chunk]));
  const result = [];
  for (let index = anchorIndex + direction; ; index += direction) {
    const chunk = byIndex.get(index);
    if (chunk === void 0) break;
    result.push(chunk);
  }
  return result;
}
function takeWhile(values, predicate) {
  const result = [];
  for (const value of values) {
    if (!predicate(value)) break;
    result.push(value);
  }
  return result;
}
function fitAnchorToBudget(excerpt, maxTokens, focus) {
  if (estimateContextTokens(serializeExcerpt(excerpt, true)) <= maxTokens) return excerpt;
  return fitExcerptBySerializedBudget(excerpt, maxTokens, "focus", true, focus);
}
function fitSide(candidatesInReadingOrder, allowance, side) {
  if (allowance <= 0 || candidatesInReadingOrder.length === 0) return [];
  const nearFirst = side === "before" ? [...candidatesInReadingOrder].reverse() : [...candidatesInReadingOrder];
  const selectedNearFirst = [];
  let used = 0;
  for (const candidate of nearFirst) {
    const available = allowance - used;
    if (available <= 0) break;
    const fullCost = estimateContextTokens(serializeExcerpt(candidate, false));
    if (fullCost <= available) {
      selectedNearFirst.push(candidate);
      used += fullCost;
      continue;
    }
    const fitted = fitExcerptBySerializedBudget(candidate, available, side === "before" ? "tail" : "head", false);
    if (fitted.text.length > 0) selectedNearFirst.push(fitted);
    break;
  }
  return side === "before" ? selectedNearFirst.reverse() : selectedNearFirst;
}
function estimateSideTokens(excerpts) {
  if (excerpts.length === 0) return 0;
  return estimateContextTokens(excerpts.map((excerpt) => serializeExcerpt(excerpt, false)).join("\n\n"));
}
function fitExcerptBySerializedBudget(excerpt, tokenBudget, mode, anchor, focus) {
  if (tokenBudget <= 0) return sliceExcerpt(excerpt, 0, 0);
  if (estimateContextTokens(serializeExcerpt(excerpt, anchor)) <= tokenBudget) return excerpt;
  let source = excerpt;
  const emptyWithMetadata = sliceExcerpt(excerpt, 0, 0);
  if (excerpt.heading !== void 0 && estimateContextTokens(serializeExcerpt(emptyWithMetadata, anchor)) >= tokenBudget) {
    const { heading: _heading, ...withoutHeading } = excerpt;
    source = withoutHeading;
  }
  let low = 0;
  let high = source.text.length;
  let best = sliceExcerpt(source, 0, 0);
  while (low <= high) {
    const length = Math.floor((low + high) / 2);
    const candidate = cropExcerpt(source, length, mode, focus);
    if (estimateContextTokens(serializeExcerpt(candidate, anchor)) <= tokenBudget) {
      best = candidate;
      low = length + 1;
    } else {
      high = length - 1;
    }
  }
  return best;
}
function cropExcerpt(excerpt, length, mode, focus) {
  if (length <= 0) return sliceExcerpt(excerpt, 0, 0);
  if (length >= excerpt.text.length) return excerpt;
  if (mode === "head") return sliceExcerpt(excerpt, 0, sentenceEnd(excerpt.text, length));
  if (mode === "tail") return sliceExcerpt(excerpt, sentenceStart(excerpt.text, excerpt.text.length - length), excerpt.text.length);
  const range = focusRange(excerpt.text, focus);
  if (range === void 0) return sliceExcerpt(excerpt, 0, sentenceEnd(excerpt.text, length));
  const centre = Math.floor((range.start + range.end) / 2);
  let start = Math.max(0, Math.min(excerpt.text.length - length, centre - Math.floor(length / 2)));
  let end = Math.min(excerpt.text.length, start + length);
  start = sentenceStart(excerpt.text, start);
  if (end - start > length) start = end - length;
  end = sentenceEnd(excerpt.text, Math.min(excerpt.text.length, start + length));
  if (end - start > length) end = start + length;
  if (range !== void 0) {
    if (range.start < start) start = Math.max(0, Math.min(range.start, end - length));
    if (range.end > end) end = Math.min(excerpt.text.length, Math.max(range.end, start + length));
    if (end - start > length) {
      if (range.end - range.start >= length) {
        start = range.start;
        end = Math.min(excerpt.text.length, start + length);
      } else {
        const excess = end - start - length;
        const trimLeft = Math.min(excess, Math.max(0, range.start - start));
        start += trimLeft;
        end -= excess - trimLeft;
      }
    }
  }
  return sliceExcerpt(excerpt, start, end);
}
function focusRange(text, focus) {
  const needle = focus?.trim();
  if (needle === void 0 || needle.length === 0) return void 0;
  const haystack = text.toLowerCase();
  const exact = haystack.indexOf(needle.toLowerCase());
  if (exact >= 0) return { start: exact, end: exact + needle.length };
  const ignored = /* @__PURE__ */ new Set(["\u8BF7\u95EE", "\u4EC0\u4E48", "\u5982\u4F55", "\u600E\u4E48", "\u8FD9\u4E2A", "\u90A3\u4E2A", "please", "what", "how", "this", "that"]);
  const components = needle.match(/[\p{L}\p{N}_./:-]+/gu) ?? [];
  const cjkBigrams = components.flatMap((component2) => {
    if (!/^[\u3400-\u4dbf\u4e00-\u9fff]+$/.test(component2) || component2.length < 2) return [];
    return Array.from({ length: component2.length - 1 }, (_, index) => component2.slice(index, index + 2));
  });
  const candidates = [...components, ...cjkBigrams].filter((component2) => component2.length >= 2 && !ignored.has(component2.toLowerCase())).sort((a, b) => b.length - a.length);
  for (const candidate of candidates) {
    const index = haystack.indexOf(candidate.toLowerCase());
    if (index >= 0) return { start: index, end: index + candidate.length };
  }
  return void 0;
}
function sentenceStart(text, target) {
  const floor = Math.max(0, target - 96);
  for (let index = Math.min(target - 1, text.length - 1); index >= floor; index -= 1) {
    if (SENTENCE_BOUNDARY.test(text[index])) return index + 1;
  }
  return target;
}
function sentenceEnd(text, target) {
  const ceiling = Math.min(text.length, target + 96);
  for (let index = Math.max(0, target); index < ceiling; index += 1) {
    if (SENTENCE_BOUNDARY.test(text[index])) return index + 1;
  }
  return target;
}
function sliceExcerpt(excerpt, start, end) {
  const clampedStart = Math.max(0, Math.min(excerpt.text.length, Math.trunc(start)));
  const safeStart = snapSliceStart(excerpt.text, clampedStart);
  const clampedEnd = Math.max(safeStart, Math.min(excerpt.text.length, Math.trunc(end)));
  const safeEnd = Math.max(safeStart, snapSliceEnd(excerpt.text, clampedEnd));
  return {
    ...excerpt,
    text: excerpt.text.slice(safeStart, safeEnd),
    textStart: excerpt.textStart + safeStart,
    textEnd: excerpt.textStart + safeEnd,
    truncatedStart: excerpt.truncatedStart || safeStart > 0,
    truncatedEnd: excerpt.truncatedEnd || safeEnd < excerpt.text.length,
    ...excerpt.sourceSpans !== void 0 ? { sourceSpans: sliceSourceSpans(excerpt.sourceSpans, safeStart, safeEnd) } : {}
  };
}
function removeAdjacentOverlap(before, anchor, after) {
  const nextBefore = [...before];
  const nextAfter = [...after];
  for (let index = 0; index < nextBefore.length - 1; index += 1) {
    const overlap = longestSuffixPrefix(nextBefore[index].text, nextBefore[index + 1].text);
    if (overlap >= MIN_OVERLAP_CHARS) nextBefore[index] = sliceExcerpt(nextBefore[index], 0, nextBefore[index].text.length - overlap);
  }
  if (nextBefore.length > 0) {
    const last = nextBefore.length - 1;
    const overlap = longestSuffixPrefix(nextBefore[last].text, anchor.text);
    if (overlap >= MIN_OVERLAP_CHARS) nextBefore[last] = sliceExcerpt(nextBefore[last], 0, nextBefore[last].text.length - overlap);
  }
  let previous = anchor;
  for (let index = 0; index < nextAfter.length; index += 1) {
    const overlap = longestSuffixPrefix(previous.text, nextAfter[index].text);
    if (overlap >= MIN_OVERLAP_CHARS) nextAfter[index] = sliceExcerpt(nextAfter[index], overlap, nextAfter[index].text.length);
    previous = nextAfter[index];
  }
  return {
    before: nextBefore.filter((excerpt) => excerpt.text.length > 0),
    after: nextAfter.filter((excerpt) => excerpt.text.length > 0)
  };
}
function longestSuffixPrefix(left, right) {
  const max = Math.min(left.length, right.length);
  for (let length = max; length >= MIN_OVERLAP_CHARS; length -= 1) {
    if (left.slice(left.length - length) === right.slice(0, length)) return length;
  }
  return 0;
}
function makeWindow(anchorChunk, before, anchor, after, hasMoreBefore, hasMoreAfter) {
  const draft = {
    anchorChunkId: anchorChunk.id,
    anchorIndex: anchorChunk.index,
    before,
    anchor,
    after,
    estimatedTokens: 0,
    hasMoreBefore,
    hasMoreAfter
  };
  return { ...draft, estimatedTokens: estimateContextTokens(serializeContextWindow(draft)) };
}
function enforceSerializedBudget(window, maxTokens, focus) {
  let before = [...window.before];
  let after = [...window.after];
  let anchor = window.anchor;
  let next = window;
  while (next.estimatedTokens > maxTokens && (before.length > 0 || after.length > 0)) {
    const beforeDistance = before.length > 0 ? next.anchorIndex - before[0].index : -1;
    const afterDistance = after.length > 0 ? after[after.length - 1].index - next.anchorIndex : -1;
    const excess = next.estimatedTokens - maxTokens;
    if (afterDistance >= beforeDistance) {
      const index = after.length - 1;
      const excerpt = after[index];
      const cost = estimateContextTokens(serializeExcerpt(excerpt, false));
      const fitted = fitExcerptBySerializedBudget(excerpt, Math.max(0, cost - excess - 1), "head", false);
      if (fitted.text.length === 0 || fitted.text.length >= excerpt.text.length) after.pop();
      else after[index] = fitted;
    } else {
      const excerpt = before[0];
      const cost = estimateContextTokens(serializeExcerpt(excerpt, false));
      const fitted = fitExcerptBySerializedBudget(excerpt, Math.max(0, cost - excess - 1), "tail", false);
      if (fitted.text.length === 0 || fitted.text.length >= excerpt.text.length) before.shift();
      else before[0] = fitted;
    }
    next = makeWindow(
      { id: next.anchorChunkId, index: next.anchorIndex },
      before,
      anchor,
      after,
      next.hasMoreBefore,
      next.hasMoreAfter
    );
  }
  if (next.estimatedTokens > maxTokens) {
    anchor = fitExcerptBySerializedBudget(anchor, maxTokens, "focus", true, focus);
    next = makeWindow(
      { id: next.anchorChunkId, index: next.anchorIndex },
      [],
      anchor,
      [],
      next.hasMoreBefore,
      next.hasMoreAfter
    );
  }
  return next;
}
function clampInt(value, min, max, fallback) {
  if (value === void 0 || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

// src/knowledge/evidence.ts
init_text_safety();
var EvidenceRequestError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "EvidenceRequestError";
  }
};
function composeDocumentEvidence(doc, parsed, options = {}) {
  const budget = Math.max(128, Math.min(4096, Math.trunc(options.maxTokens ?? 1600)));
  if (!Number.isFinite(budget)) throw new EvidenceRequestError("invalid_request", "invalid evidence token budget");
  if (options.pageIndex !== void 0 && (!Number.isInteger(options.pageIndex) || options.pageIndex < 0)) throw new EvidenceRequestError("invalid_request", "invalid evidence page");
  const all = parsed.blocks.filter((block) => options.pageIndex === void 0 || block.pageIndex === options.pageIndex);
  const start = options.blockId === void 0 ? 0 : all.findIndex((block) => block.id === options.blockId);
  if (start < 0) throw new EvidenceRequestError("not_found", "evidence block not found in this document/page");
  const offset = options.blockOffset ?? 0;
  if (!Number.isInteger(offset) || offset < 0 || options.blockId === void 0 && offset !== 0) throw new EvidenceRequestError("invalid_request", "invalid evidence continuation");
  if (offset > (all[start]?.text.length ?? 0)) throw new EvidenceRequestError("invalid_request", "evidence continuation is outside block");
  const blocks = [];
  let used = 0;
  let next;
  for (let i = start; i < all.length; i++) {
    const block = all[i];
    const from2 = snapSliceStart(block.text, i === start ? offset : 0);
    const available = budget - used;
    const crop = (length) => ({ ...block, text: block.text.slice(from2, from2 + length), textStart: block.textStart + from2, textEnd: block.textStart + from2 + length });
    let low = 0, high = block.text.length - from2;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (estimateContextTokens(JSON.stringify(crop(middle))) <= available) low = middle;
      else high = middle - 1;
    }
    if (low > 0 && from2 + low < block.text.length && /[\uD800-\uDBFF]/.test(block.text[from2 + low - 1]) && /[\uDC00-\uDFFF]/.test(block.text[from2 + low])) low--;
    if (low === 0 && block.text.length > from2) {
      if (blocks.length === 0) throw new EvidenceRequestError("invalid_request", "evidence metadata exceeds this budget; increase maxTokens");
      next = { blockId: block.id, blockOffset: from2 };
      break;
    }
    const excerpt = crop(low);
    const cost = estimateContextTokens(JSON.stringify(excerpt));
    if (cost > available) {
      next = { blockId: block.id, blockOffset: from2 };
      break;
    }
    blocks.push(excerpt);
    used += cost;
    if (from2 + low < block.text.length) {
      next = { blockId: block.id, blockOffset: from2 + low };
      break;
    }
  }
  const assetIds = new Set(blocks.flatMap((block) => block.assetIds ?? []));
  return {
    documentId: doc.id,
    title: doc.title,
    processing: doc.processing,
    blocks,
    assets: parsed.assets.filter((asset) => assetIds.has(asset.id)),
    estimatedTokens: used,
    truncated: next !== void 0,
    ...next !== void 0 ? { next } : {}
  };
}

// src/knowledge/processing-queue.ts
var ProcessingQueue = class {
  constructor(concurrency = 2, limit = 16) {
    this.concurrency = concurrency;
    this.limit = limit;
  }
  running = 0;
  waiting = [];
  async run(task, signal) {
    signal.throwIfAborted();
    if (this.running >= this.concurrency) {
      if (this.waiting.length >= this.limit) throw Object.assign(new Error("document processor queue is full"), { code: "busy" });
      await new Promise((resolve7, reject) => {
        const cancel = () => {
          const index = this.waiting.indexOf(start);
          if (index >= 0) this.waiting.splice(index, 1);
          signal.removeEventListener("abort", cancel);
          reject(signal.reason);
        };
        const start = () => {
          signal.removeEventListener("abort", cancel);
          this.running++;
          resolve7();
        };
        this.waiting.push(start);
        signal.addEventListener("abort", cancel, { once: true });
      });
    } else this.running++;
    try {
      signal.throwIfAborted();
      return await task();
    } finally {
      this.running--;
      this.waiting.shift()?.();
    }
  }
};

// src/knowledge/index.ts
init_text_safety();

// ../../profiles/desktop/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object2, filter) {
  return Object.fromEntries(Object.entries(object2).filter(([key, value]) => filter(key, value)));
}
function mapValues(object2, transform) {
  return Object.fromEntries(Object.entries(object2).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
  return result;
}
var write = Symbol.for("cosmokit.volatile.write");
function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
  if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
  if (value === null || typeof value !== "object") return value;
  if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
  ancestors.add(value);
  try {
    if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("volatile config objects must be plain objects or arrays");
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
  } finally {
    ancestors.delete(value);
  }
}
function createVolatile(value) {
  let current = snapshot(value);
  return Object.freeze({
    get: () => current,
    [write]: (value2) => {
      current = value2;
    }
  });
}
function isVolatile(value) {
  return typeof value === "object" && value !== null && write in value;
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  const ancestors = /* @__PURE__ */ new Set();
  function compare(a2, b2) {
    if (a2 === b2) return true;
    if (isVolatile(a2) || isVolatile(b2)) return isVolatile(a2) && isVolatile(b2);
    if (!strict && isNullable(a2) && isNullable(b2)) return true;
    if (typeof a2 !== typeof b2 || typeof a2 !== "object" || !a2 || !b2) return false;
    if (ancestors.has(a2)) return false;
    function check(test, then) {
      return test(a2) ? test(b2) ? then(a2, b2) : false : test(b2) ? false : void 0;
    }
    ancestors.add(a2);
    try {
      return check(Array.isArray, (a3, b3) => {
        if (a3.length !== b3.length) return false;
        for (let index = 0; index < a3.length; index++) if (!compare(a3[index], b3[index])) return false;
        return true;
      }) ?? check(is("Date"), (a3, b3) => a3.valueOf() === b3.valueOf()) ?? check(is("URL"), (a3, b3) => a3.href === b3.href) ?? check(is("RegExp"), (a3, b3) => a3.source === b3.source && a3.flags === b3.flags) ?? check(isArrayBufferLike, (a3, b3) => {
        if (a3.byteLength !== b3.byteLength) return false;
        const viewA = new Uint8Array(a3);
        const viewB = new Uint8Array(b3);
        for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
        return true;
      }) ?? ((!strict || [a2, b2].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({
        ...a2,
        ...b2
      }).every((key) => compare(a2[key], b2[key])));
    } finally {
      ancestors.delete(a2);
    }
  }
  return compare(a, b);
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) date2 = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// ../../profiles/desktop/node_modules/@deepseek-ai/schemastery/lib/index.mjs
var kSchema = Symbol.for("schemastery");
var kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  options;
  name = "ValidationError";
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
    else if (typeof segment === "number") prefix += "[" + segment + "]";
    else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") try {
    schema.callback = new Function("return " + schema.callback)();
  } catch {
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
  return {
    version: 1,
    vendor: "schemastery",
    validate: (value) => {
      try {
        return { value: Schema.resolve(value, this, {})[0] };
      } catch (error) {
        if (ValidationError.is(error)) return { issues: [{
          message: error.message,
          path: error.options.path
        }] };
        throw error;
      }
    }
  };
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = {
    uid: this.uid,
    refs: globalThis.__schemastery_refs__
  };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
    else if (typeof value === "string") result[locale] = value;
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
    return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
  });
  if (schema.list) schema.list = schema.list.map((inner, index) => {
    return inner.i18n(mapValues(messages, (data = {}) => {
      if (Array.isArray(getInner(data))) return getInner(data)[index];
      if (Array.isArray(data)) return data[index];
      return extractKeys(data);
    }));
  });
  if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
    if (getInner(data)) return getInner(data);
    return extractKeys(data);
  }));
  if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
};
for (const key of [
  "required",
  "disabled",
  "collapse",
  "hidden",
  "loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "deprecated",
    type: "danger"
  });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "experimental",
    type: "warning"
  });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = {
    ...schema.meta,
    pattern: pattern2
  };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (isVolatile(value)) value = value.get();
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) Object.assign(result, item.simplify(value));
    return result;
  } else if (this.type === "union") for (const schema of this.list) try {
    Schema.resolve(value, schema, {});
    return schema.simplify(value);
  } catch {
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    role,
    extra: extra2
  };
  return schema;
};
for (const key of [
  "default",
  "link",
  "comment",
  "description",
  "max",
  "min",
  "step"
]) Object.assign(Schema.prototype, { [key](value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema.prototype.volatile = function volatile() {
  if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
  return this.extra("volatile", true);
};
var resolvers = {};
var checkedVolatile = Symbol("checked-volatile-schema");
function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
  const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
  if (states.has(blocked)) return;
  states.add(blocked);
  seen.set(schema, states);
  if (schema.meta?.volatile && blocked) throw new ValidationError("volatile fields require a fixed object path without an enclosing volatile field", { path });
  const nested = blocked || !!schema.meta?.volatile;
  if (schema.dict) for (const [key, child2] of Object.entries(schema.dict)) validateVolatileSchema(child2, [...path, key], nested, seen);
  if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
  if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
  if (schema.list) for (let index = 0; index < schema.list.length; index++) validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
}
Schema.extend = function extend(type, resolve7) {
  resolvers[type] = resolve7;
};
Schema.resolve = function resolve5(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (!options[checkedVolatile]) {
    validateVolatileSchema(schema, options.path);
    options = {
      ...options,
      [checkedVolatile]: true
    };
  }
  if (schema.meta?.volatile) {
    const inner = Schema(schema);
    inner.meta = {
      ...schema.meta,
      volatile: false
    };
    const [value, adapted] = Schema.resolve(data, inner, options, strict);
    try {
      return [createVolatile(value), adapted];
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : String(error), options);
    }
  }
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) return Schema.any();
  else if ([
    "string",
    "number",
    "boolean"
  ].includes(typeof source)) return Schema.const(source).required();
  else if (source[kSchema]) return source;
  else if (typeof source === "function") switch (source) {
    case String:
      return Schema.string().required();
    case Number:
      return Schema.number().required();
    case Boolean:
      return Schema.boolean().required();
    case Function:
      return Schema.function().required();
    default:
      return Schema.is(source).required();
  }
  else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = {
        ...schema.meta,
        ...schema.inner.meta
      };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({
    type: "lazy",
    builder,
    inner: { toJSON: toJSON2 }
  });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
    const date2 = new Date(value);
    if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
    return date2;
  }, true)]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
    try {
      return new RegExp(value, flag);
    } catch (e) {
      throw new ValidationError(e.message, options);
    }
  }, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = {
      ...schema.meta,
      ...schema.inner.meta
    };
    validateVolatileSchema(schema.inner, options.path, true);
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) if (data & bits[key]) keys.push(key);
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else throw new ValidationError(`expected number or array but got ${data}`, options);
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) result[key] = value;
  }
  if (!strict) merge(result, data);
  return [result];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages = [];
  for (const inner of list) try {
    return Schema.resolve(data, inner, options, strict);
  } catch (error) {
    messages.push(error);
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) result = value;
    else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    else if (typeof value === "object") merge(result ??= {}, value);
    else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
  }
  if (!strict && isPlainObject(data)) merge(result, data);
  return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) return [callback(result)];
  else return [callback(result), callback(adapted)];
});
var formatters = {};
function defineMethod(name, keys, format) {
  formatters[name] = format;
  Object.assign(Schema, { [name](...args) {
    const schema = new Schema({ type: name });
    keys.forEach((key, index) => {
      switch (key) {
        case "sKey":
          schema.sKey = args[index] ?? Schema.string();
          break;
        case "inner":
          schema.inner = Schema.from(args[index]);
          break;
        case "list":
          schema.list = args[index].map(Schema.from);
          break;
        case "dict":
          schema.dict = mapValues(args[index], Schema.from);
          break;
        case "bits":
          schema.bits = {};
          for (const key2 in args[index]) {
            if (typeof args[index][key2] !== "number") continue;
            schema.bits[key2] = args[index][key2];
          }
          break;
        case "callback": {
          const callback = schema.callback = args[index];
          callback["toJSON"] ||= () => callback.toString();
          break;
        }
        case "constructor": {
          const constructor = schema.constructor = args[index];
          if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
          break;
        }
        default:
          schema[key] = args[index];
      }
    });
    if (name === "object" || name === "dict") schema.meta.default = {};
    else if (name === "array" || name === "tuple") schema.meta.default = [];
    else if (name === "bitset") schema.meta.default = 0;
    return schema;
  } });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") return constructor.name;
  else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
  "inner",
  "callback",
  "preserve"
], ({ inner }, isInner) => inner.toString(isInner));

// src/knowledge/config.ts
var Config = Schema.object({
  embeddingProvider: Schema.union(["openai", "ollama", "local", "none"]).default("none"),
  embeddingBaseUrl: Schema.string().default(""),
  embeddingModel: Schema.string().default(""),
  embeddingApiKey: Schema.string().default(""),
  rerankModel: Schema.string().default(""),
  rerankBaseUrl: Schema.string().default(""),
  rerankApiKey: Schema.string().default(""),
  localRerankTimeoutMs: Schema.number().default(6e4),
  smartChunk: Schema.boolean().default(true),
  chunkSeparator: Schema.string().default("\n\n"),
  chunkSize: Schema.number().default(1024),
  chunkOverlap: Schema.number().default(200),
  topK: Schema.number().default(6),
  searchMode: Schema.union(["auto", "hybrid", "vector", "lexical"]).default("auto"),
  similarityThreshold: Schema.number().default(0),
  mmrDiversity: Schema.number().default(0),
  rrfVectorWeight: Schema.number().default(1),
  embeddingBatchSize: Schema.number().default(32),
  siblingChunks: Schema.number().default(1),
  localModelCacheDir: Schema.string().default(""),
  hfEndpoint: Schema.string().default(""),
  mineruPythonIndexUrl: Schema.string().default("https://pypi.org/simple"),
  chunkStorePath: Schema.string().default(""),
  documentProcessorProvider: Schema.union(["builtin", "mineru", "mineru-local"]).default("builtin"),
  mineruApiKey: Schema.string().default(""),
  mineruApiHost: Schema.string().default(""),
  mineruLocalUrl: Schema.string().default("http://127.0.0.1:8000"),
  mineruLocalApiKey: Schema.string().default(""),
  mineruTier: Schema.union(["flash", "basic", "standard", "advanced"]).default("basic"),
  documentProcessingTimeoutMs: Schema.number().default(18e5),
  structuredChunking: Schema.boolean().default(true),
  semanticChunk: Schema.boolean().default(false),
  semanticChunkThreshold: Schema.number().default(0.75),
  chunkTokenLimit: Schema.number().default(0),
  conflictStrategy: Schema.union(["keep", "replace", "rename"]).default("rename"),
  urlRefreshHours: Schema.number().default(0),
  imageCaptionProvider: Schema.union(["off", "openai", "ollama"]).default("off"),
  imageCaptionModel: Schema.string().default(""),
  imageCaptionBaseUrl: Schema.string().default(""),
  imageCaptionApiKey: Schema.string().default(""),
  resumeInterruptedOnStartup: Schema.boolean().default(true),
  autoRetrieve: Schema.boolean().default(true),
  injectUsagePrompt: Schema.boolean().default(true),
  autoRetrieveWeight: Schema.number().default(3),
  localWorkerIdleTimeoutMs: Schema.number().default(6e4)
});
function resolveConfig(config, overrides) {
  const apiKey = overrides.embeddingApiKey ?? process.env.KNOWLEDGE_API_KEY ?? config.embeddingApiKey;
  const rerankApiKey = overrides.rerankApiKey ?? process.env.KNOWLEDGE_RERANK_API_KEY ?? config.rerankApiKey;
  const chunkSize = clampInt2(overrides.chunkSize ?? config.chunkSize, 64, 1e5, 1024);
  const chunkOverlap = clampInt2(overrides.chunkOverlap ?? config.chunkOverlap, 0, chunkSize - 1, 0);
  const topK = clampInt2(overrides.topK ?? config.topK, 1, 50, 6);
  const embeddingBatchSize = clampInt2(overrides.embeddingBatchSize ?? config.embeddingBatchSize, 1, 512, 32);
  const rrfVectorWeight = clampNumber(overrides.rrfVectorWeight ?? config.rrfVectorWeight, 0.1, 5, 1);
  const siblingChunks = clampInt2(overrides.siblingChunks ?? config.siblingChunks, 0, 3, 1);
  return {
    embeddingProvider: overrides.embeddingProvider ?? config.embeddingProvider,
    embeddingBaseUrl: overrides.embeddingBaseUrl ?? config.embeddingBaseUrl,
    embeddingModel: overrides.embeddingModel ?? config.embeddingModel,
    embeddingApiKey: apiKey,
    rerankModel: overrides.rerankModel ?? config.rerankModel,
    rerankBaseUrl: overrides.rerankBaseUrl ?? config.rerankBaseUrl,
    rerankApiKey,
    localRerankTimeoutMs: clampInt2(overrides.localRerankTimeoutMs ?? config.localRerankTimeoutMs, 1e4, 3e5, 6e4),
    smartChunk: overrides.smartChunk ?? config.smartChunk,
    chunkSeparator: overrides.chunkSeparator ?? config.chunkSeparator,
    chunkSize,
    chunkOverlap,
    topK,
    searchMode: overrides.searchMode ?? config.searchMode,
    similarityThreshold: clampNumber(overrides.similarityThreshold ?? config.similarityThreshold, 0, 1, 0),
    mmrDiversity: clampNumber(overrides.mmrDiversity ?? config.mmrDiversity, 0, 1, 0),
    rrfVectorWeight,
    embeddingBatchSize,
    siblingChunks,
    hfEndpoint: overrides.hfEndpoint ?? config.hfEndpoint,
    mineruPythonIndexUrl: overrides.mineruPythonIndexUrl ?? config.mineruPythonIndexUrl ?? "https://pypi.org/simple",
    documentProcessorProvider: overrides.documentProcessorProvider ?? config.documentProcessorProvider,
    mineruApiKey: overrides.mineruApiKey ?? config.mineruApiKey,
    mineruApiHost: overrides.mineruApiHost ?? config.mineruApiHost,
    mineruLocalUrl: overrides.mineruLocalUrl ?? config.mineruLocalUrl ?? "http://127.0.0.1:8000",
    mineruLocalApiKey: overrides.mineruLocalApiKey ?? config.mineruLocalApiKey ?? "",
    mineruTier: overrides.mineruTier ?? config.mineruTier ?? "basic",
    documentProcessingTimeoutMs: clampInt2(overrides.documentProcessingTimeoutMs ?? config.documentProcessingTimeoutMs ?? 18e5, 1e4, 72e5, 18e5),
    structuredChunking: overrides.structuredChunking ?? config.structuredChunking ?? true,
    semanticChunk: overrides.semanticChunk ?? config.semanticChunk,
    semanticChunkThreshold: clampNumber(overrides.semanticChunkThreshold ?? config.semanticChunkThreshold, 0, 1, 0.75),
    chunkTokenLimit: clampInt2(overrides.chunkTokenLimit ?? config.chunkTokenLimit, 0, 1e6, 0),
    conflictStrategy: overrides.conflictStrategy ?? config.conflictStrategy,
    urlRefreshHours: clampInt2(overrides.urlRefreshHours ?? config.urlRefreshHours, 0, 24 * 365, 0),
    imageCaptionProvider: overrides.imageCaptionProvider ?? config.imageCaptionProvider,
    imageCaptionModel: overrides.imageCaptionModel ?? config.imageCaptionModel,
    imageCaptionBaseUrl: overrides.imageCaptionBaseUrl ?? config.imageCaptionBaseUrl,
    imageCaptionApiKey: overrides.imageCaptionApiKey ?? config.imageCaptionApiKey,
    resumeInterruptedOnStartup: overrides.resumeInterruptedOnStartup ?? config.resumeInterruptedOnStartup,
    autoRetrieve: overrides.autoRetrieve ?? config.autoRetrieve,
    injectUsagePrompt: overrides.injectUsagePrompt ?? config.injectUsagePrompt ?? true,
    autoRetrieveWeight: clampInt2(overrides.autoRetrieveWeight ?? config.autoRetrieveWeight, 0, 5, 3),
    localWorkerIdleTimeoutMs: clampInt2(overrides.localWorkerIdleTimeoutMs ?? config.localWorkerIdleTimeoutMs, 0, 24 * 3600 * 1e3, 6e4),
    localModelCacheDir: overrides.localModelCacheDir ?? config.localModelCacheDir
  };
}
function resolveConfigFor(config, overrides, baseConfig) {
  const resolved = resolveConfig(config, overrides);
  if (baseConfig === void 0) return resolved;
  const chunkSize = clampInt2(baseConfig.chunkSize ?? resolved.chunkSize, 64, 1e5, 800);
  const chunkOverlap = clampInt2(baseConfig.chunkOverlap ?? resolved.chunkOverlap, 0, chunkSize - 1, 0);
  const topK = clampInt2(baseConfig.topK ?? resolved.topK, 1, 50, 6);
  return {
    ...resolved,
    embeddingProvider: baseConfig.embeddingProvider ?? resolved.embeddingProvider,
    embeddingBaseUrl: baseConfig.embeddingBaseUrl ?? resolved.embeddingBaseUrl,
    embeddingModel: baseConfig.embeddingModel ?? resolved.embeddingModel,
    embeddingApiKey: baseConfig.embeddingApiKey ?? resolved.embeddingApiKey,
    rerankModel: baseConfig.rerankModel ?? resolved.rerankModel,
    rerankBaseUrl: baseConfig.rerankBaseUrl ?? resolved.rerankBaseUrl,
    rerankApiKey: baseConfig.rerankApiKey ?? resolved.rerankApiKey,
    localRerankTimeoutMs: clampInt2(baseConfig.localRerankTimeoutMs ?? resolved.localRerankTimeoutMs, 1e4, 3e5, 6e4),
    smartChunk: baseConfig.smartChunk ?? resolved.smartChunk,
    chunkSeparator: baseConfig.chunkSeparator ?? resolved.chunkSeparator,
    chunkSize,
    chunkOverlap,
    topK,
    searchMode: baseConfig.searchMode ?? resolved.searchMode,
    similarityThreshold: clampNumber(baseConfig.similarityThreshold ?? resolved.similarityThreshold, 0, 1, 0),
    mmrDiversity: clampNumber(baseConfig.mmrDiversity ?? resolved.mmrDiversity, 0, 1, 0),
    rrfVectorWeight: clampNumber(baseConfig.rrfVectorWeight ?? resolved.rrfVectorWeight, 0.1, 5, 1),
    embeddingBatchSize: clampInt2(baseConfig.embeddingBatchSize ?? resolved.embeddingBatchSize, 1, 512, 32),
    siblingChunks: clampInt2(baseConfig.siblingChunks ?? resolved.siblingChunks, 0, 3, 1),
    documentProcessorProvider: baseConfig.documentProcessorProvider ?? resolved.documentProcessorProvider,
    mineruApiKey: baseConfig.mineruApiKey ?? resolved.mineruApiKey,
    mineruApiHost: baseConfig.mineruApiHost ?? resolved.mineruApiHost,
    mineruLocalUrl: baseConfig.mineruLocalUrl ?? resolved.mineruLocalUrl,
    mineruLocalApiKey: baseConfig.mineruLocalApiKey ?? resolved.mineruLocalApiKey,
    mineruTier: baseConfig.mineruTier ?? resolved.mineruTier,
    documentProcessingTimeoutMs: clampInt2(baseConfig.documentProcessingTimeoutMs ?? resolved.documentProcessingTimeoutMs ?? 18e5, 1e4, 72e5, 18e5),
    structuredChunking: baseConfig.structuredChunking ?? resolved.structuredChunking,
    semanticChunk: baseConfig.semanticChunk ?? resolved.semanticChunk,
    semanticChunkThreshold: clampNumber(baseConfig.semanticChunkThreshold ?? resolved.semanticChunkThreshold, 0, 1, 0.75),
    chunkTokenLimit: clampInt2(baseConfig.chunkTokenLimit ?? resolved.chunkTokenLimit, 0, 1e6, 0),
    conflictStrategy: baseConfig.conflictStrategy ?? resolved.conflictStrategy,
    urlRefreshHours: clampInt2(baseConfig.urlRefreshHours ?? resolved.urlRefreshHours, 0, 24 * 365, 0),
    imageCaptionProvider: baseConfig.imageCaptionProvider ?? resolved.imageCaptionProvider,
    imageCaptionModel: baseConfig.imageCaptionModel ?? resolved.imageCaptionModel,
    imageCaptionBaseUrl: baseConfig.imageCaptionBaseUrl ?? resolved.imageCaptionBaseUrl,
    imageCaptionApiKey: baseConfig.imageCaptionApiKey ?? resolved.imageCaptionApiKey,
    resumeInterruptedOnStartup: baseConfig.resumeInterruptedOnStartup ?? resolved.resumeInterruptedOnStartup,
    autoRetrieve: baseConfig.autoRetrieve ?? resolved.autoRetrieve,
    injectUsagePrompt: baseConfig.injectUsagePrompt ?? resolved.injectUsagePrompt,
    autoRetrieveWeight: clampInt2(baseConfig.autoRetrieveWeight ?? resolved.autoRetrieveWeight, 0, 5, 3)
  };
}
function clampInt2(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

// src/knowledge/index.ts
init_embed();

// src/knowledge/localModels.ts
init_local_model_runtime();
init_embed();
init_local_rerank();
import { createHash as createHash7 } from "node:crypto";
import { mkdir as mkdir7, readdir as readdir6, readFile as readFile6, rename as rename6, rm as rm4, stat as stat5, writeFile as writeFile5 } from "node:fs/promises";
import { basename as basename2, dirname as dirname6, join as join9, relative as relative2 } from "node:path";
var REGISTRY_FILE = ".dsh-rerank-models.json";
var READY_FILE = ".dsh-rerank-ready.json";
var RERANK_STATUS_STALE_MS = 2 * 6e4;
var liveRerankStatus = /* @__PURE__ */ new Map();
var cancelledRerankers = /* @__PURE__ */ new Set();
var readinessCache = /* @__PURE__ */ new Map();
var registryWriteChain = Promise.resolve();
var LOCAL_MODELS = [
  { id: "onnx-community/Qwen3-Embedding-0.6B-ONNX", name: "Qwen3 Embedding 0.6B", kind: "embedding", subtitle: "1024 \u7EF4 \xB7 \u4E2D\u6587\u5F3A \xB7 last-token \u6C60\u5316", dimensions: 1024, maxTokens: 32768 },
  { id: "Xenova/bge-small-zh-v1.5", name: "BGE Small zh v1.5", kind: "embedding", subtitle: "512 \u7EF4 \xB7 \u4E2D\u6587\u68C0\u7D22 \xB7 CLS \u6C60\u5316", dimensions: 512, maxTokens: 512 },
  { id: "Xenova/bge-small-en-v1.5", name: "BGE Small en v1.5", kind: "embedding", subtitle: "384 \u7EF4 \xB7 \u82F1\u6587\u68C0\u7D22 \xB7 CLS \u6C60\u5316", dimensions: 384, maxTokens: 512 },
  { id: "Xenova/gte-small", name: "GTE Small", kind: "embedding", subtitle: "384 \u7EF4 \xB7 \u591A\u8BED\u8A00 \xB7 mean \u6C60\u5316", dimensions: 384, maxTokens: 512 },
  { id: "Xenova/multilingual-e5-small", name: "Multilingual E5 Small", kind: "embedding", subtitle: "384 \u7EF4 \xB7 \u591A\u8BED\u8A00 \xB7 CLS \u6C60\u5316", dimensions: 384, maxTokens: 512 },
  {
    id: "Xenova/bge-reranker-base",
    name: "BGE Reranker Base",
    kind: "reranking",
    support: "official",
    subtitle: "\u672C\u5730\u91CD\u6392 \xB7 \u5355 logit \u8DE8\u7F16\u7801\u5668 \xB7 sigmoid \xB7 \u53CC\u8BED\uFF08\u7EA6 280MB\uFF09",
    maxTokens: 512,
    recommendedBatchSize: 16
  }
];
setLocalRerankProgressListener((event) => {
  liveRerankStatus.set(event.modelId, {
    status: event.status === "ready" ? "ready" : event.status,
    health: event.status === "ready" ? "healthy" : event.status === "validating" ? "checking" : event.status === "error" ? "unhealthy" : "unchecked",
    progress: event.progress,
    message: event.message,
    statusChangedAt: Date.now()
  });
});
setLocalRerankChildGoneListener((modelId) => {
  liveRerankStatus.delete(modelId);
});
function validateHuggingFaceRepoId(id) {
  const normalized = id.trim();
  if (normalized.length < 3 || normalized.length > 200 || normalized.includes("..") || normalized.includes("\\") || normalized.startsWith("/") || normalized.endsWith("/") || !/^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/.test(normalized)) {
    throw new Error('invalid Hugging Face repository id; expected "owner/model" without paths or ".."');
  }
  return normalized;
}
function customRegistryPath() {
  return join9(localModelCacheDir(), REGISTRY_FILE);
}
function readinessPath(modelId) {
  return join9(localModelCacheDir(), modelId, READY_FILE);
}
async function readRegistry() {
  try {
    const parsed = JSON.parse(await readFile6(customRegistryPath(), "utf8"));
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.rerankers)) return { schemaVersion: 1, rerankers: [] };
    return {
      schemaVersion: 1,
      rerankers: parsed.rerankers.filter((entry) => entry !== null && typeof entry === "object" && typeof entry.id === "string" && typeof entry.addedAt === "number")
    };
  } catch {
    return { schemaVersion: 1, rerankers: [] };
  }
}
async function writeJsonAtomic(path, value) {
  await mkdir7(dirname6(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile5(temporary, `${JSON.stringify(value, null, 2)}
`, "utf8");
  await rename6(temporary, path);
}
function writeRegistry(update) {
  const run2 = registryWriteChain.then(async () => {
    const registry = await readRegistry();
    update(registry);
    await writeJsonAtomic(customRegistryPath(), registry);
  });
  registryWriteChain = run2.catch(() => {
  });
  return run2;
}
async function descriptors() {
  const registry = await readRegistry();
  const custom = registry.rerankers.filter((entry) => !LOCAL_MODELS.some((model) => model.id === entry.id)).map((entry) => ({
    id: entry.id,
    name: basename2(entry.id),
    kind: "reranking",
    support: "experimental",
    subtitle: "\u81EA\u5B9A\u4E49\u672C\u5730\u91CD\u6392 \xB7 \u5B9E\u9A8C\u6027 \xB7 \u9700\u8981\u517C\u5BB9\u6027\u9A8C\u8BC1",
    maxTokens: 512,
    recommendedBatchSize: 16
  }));
  return [...LOCAL_MODELS, ...custom];
}
async function findModel(id) {
  const descriptor = (await descriptors()).find((model) => model.id === id);
  if (descriptor === void 0) throw new Error(`unknown local model: ${id}`);
  return descriptor;
}
async function modelFingerprint(modelId) {
  const root = join9(localModelCacheDir(), modelId);
  const entries = [];
  let hasConfig = false;
  let hasTokenizer = false;
  let hasWeights = false;
  async function walk(dir) {
    const children = await readdir6(dir, { withFileTypes: true });
    for (const child2 of children) {
      if (child2.name === READY_FILE) continue;
      const path = join9(dir, child2.name);
      if (child2.isDirectory()) await walk(path);
      else if (child2.isFile()) {
        const info = await stat5(path);
        const rel = relative2(root, path).replaceAll("\\", "/");
        entries.push({ path: rel, size: info.size, mtimeMs: Math.trunc(info.mtimeMs) });
        if (rel === "config.json") hasConfig = info.size > 0;
        if (/tokenizer|vocab|sentencepiece|spiece/i.test(rel)) hasTokenizer ||= info.size > 0;
        if (rel.endsWith(".onnx")) hasWeights ||= info.size > 0;
      }
    }
  }
  try {
    await walk(root);
  } catch {
    return { fingerprint: "", complete: false };
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return { fingerprint: createHash7("sha256").update(JSON.stringify(entries)).digest("hex"), complete: hasConfig && hasTokenizer && hasWeights };
}
async function readReadiness(modelId) {
  const cacheDir = localModelCacheDir();
  const cached = readinessCache.get(modelId);
  if (cached?.cacheDir === cacheDir) return cached.record;
  try {
    const record = JSON.parse(await readFile6(readinessPath(modelId), "utf8"));
    if (record.schemaVersion !== 1 || record.modelId !== modelId || record.kind !== "reranking" || record.runtime?.transformers !== LOCAL_MODEL_RUNTIME.transformers || record.runtime?.onnxruntime !== LOCAL_MODEL_RUNTIME.onnxruntime) return void 0;
    const current = await modelFingerprint(modelId);
    if (!current.complete || current.fingerprint !== record.fingerprint) return void 0;
    readinessCache.set(modelId, { cacheDir, record });
    return record;
  } catch {
    return void 0;
  }
}
async function writeReadiness(descriptor, latencyMs) {
  const files = await modelFingerprint(descriptor.id);
  if (!files.complete) throw new Error("local rerank model cache is incomplete");
  const record = {
    schemaVersion: 1,
    modelId: descriptor.id,
    kind: "reranking",
    support: descriptor.support ?? "experimental",
    fingerprint: files.fingerprint,
    validatedAt: Date.now(),
    latencyMs,
    runtime: LOCAL_MODEL_RUNTIME
  };
  await writeJsonAtomic(readinessPath(descriptor.id), record);
  readinessCache.set(descriptor.id, { cacheDir: localModelCacheDir(), record });
  return record;
}
async function summarize(descriptor) {
  if (descriptor.kind === "embedding") {
    const live2 = getLocalModelStatus(descriptor.id);
    if (live2.status === "downloading" || live2.status === "error") {
      return { ...descriptor, status: live2.status, health: live2.status === "error" ? "unhealthy" : "unchecked", progress: live2.progress, message: live2.message };
    }
    const downloaded = live2.status === "ready" || await isLocalModelDownloaded(descriptor.id);
    if (!downloaded) return { ...descriptor, status: "not_downloaded", health: "unchecked", progress: 0, message: "" };
    const ready2 = await getLocalEmbeddingReadiness(descriptor.id);
    if (ready2 === void 0) {
      return {
        ...descriptor,
        status: live2.status === "ready" ? "validating" : "unhealthy",
        health: live2.status === "ready" ? "checking" : "unchecked",
        progress: 100,
        message: "\u6A21\u578B\u5DF2\u4E0B\u8F7D\uFF0C\u6B63\u5728\u6216\u7B49\u5F85\u9694\u79BB\u8FD0\u884C\u65F6\u517C\u5BB9\u6027\u9A8C\u8BC1"
      };
    }
    return { ...descriptor, status: "ready", health: "healthy", progress: 100, message: "", lastCheckedAt: ready2.validatedAt };
  }
  const live = liveRerankStatus.get(descriptor.id);
  if (live !== void 0 && live.status !== "ready") return { ...descriptor, ...live };
  const files = await modelFingerprint(descriptor.id);
  if (!files.complete) return { ...descriptor, status: "not_downloaded", health: "unchecked", progress: 0, message: "" };
  const ready = await readReadiness(descriptor.id);
  if (ready === void 0) return { ...descriptor, status: "unhealthy", health: "unchecked", progress: 100, message: "\u6A21\u578B\u5DF2\u4E0B\u8F7D\uFF0C\u4F7F\u7528\u524D\u9700\u8981\u5B8C\u6210\u517C\u5BB9\u6027\u9A8C\u8BC1" };
  return { ...descriptor, status: "ready", health: "healthy", progress: 100, message: "", lastCheckedAt: ready.validatedAt, latencyMs: ready.latencyMs };
}
async function listLocalModels() {
  return Promise.all((await descriptors()).map(summarize));
}
function hasActiveLocalRerankDownload() {
  for (const status of liveRerankStatus.values()) if (status.status === "downloading" || status.status === "validating") return true;
  return false;
}
async function validateReranker(descriptor) {
  liveRerankStatus.set(descriptor.id, { status: "validating", health: "checking", progress: 100, message: "", statusChangedAt: Date.now() });
  try {
    const report = await selfTestLocalReranker(descriptor.id, localModelCacheDir(), getHfEndpoint());
    const record = await writeReadiness(descriptor, report.latencyMs);
    liveRerankStatus.set(descriptor.id, { status: "ready", health: "healthy", progress: 100, message: "", lastCheckedAt: record.validatedAt, latencyMs: record.latencyMs, statusChangedAt: Date.now() });
  } catch (error) {
    liveRerankStatus.set(descriptor.id, { status: "unhealthy", health: "unhealthy", progress: 100, message: error instanceof Error ? error.message : String(error), statusChangedAt: Date.now() });
  }
  return summarize(descriptor);
}
async function selfTestLocalModel(id) {
  const descriptor = await findModel(id);
  if (descriptor.kind !== "reranking") throw new Error("self-test is available only for local rerankers");
  return validateReranker(descriptor);
}
async function downloadLocalModel(id) {
  const descriptor = await findModel(id);
  if (descriptor.kind === "embedding") {
    void loadLocalModel(id, "feature-extraction").catch((error) => markLocalModelError(descriptor.id, error instanceof Error ? error.message : String(error)));
    return summarize(descriptor);
  }
  const cached = await modelFingerprint(id);
  liveRerankStatus.set(id, {
    status: cached.complete ? "validating" : "downloading",
    health: cached.complete ? "checking" : "unchecked",
    progress: cached.complete ? 100 : 0,
    message: "",
    statusChangedAt: Date.now()
  });
  cancelledRerankers.delete(id);
  void loadLocalReranker(id, localModelCacheDir(), getHfEndpoint()).then(() => validateReranker(descriptor)).catch((error) => {
    if (cancelledRerankers.delete(id)) return;
    liveRerankStatus.set(id, { status: "error", health: "unhealthy", progress: 0, message: error instanceof Error ? error.message : String(error), statusChangedAt: Date.now() });
  });
  return summarize(descriptor);
}
async function registerCustomLocalReranker(id) {
  const normalized = validateHuggingFaceRepoId(id);
  await writeRegistry((registry) => {
    if (!registry.rerankers.some((entry) => entry.id === normalized)) registry.rerankers.push({ id: normalized, addedAt: Date.now() });
  });
  return downloadLocalModel(normalized);
}
async function cancelLocalModelDownload(id) {
  const descriptor = await findModel(id);
  if (descriptor.kind === "embedding") await cancelLocalModel(id);
  else {
    const live = liveRerankStatus.get(id);
    if (live?.status !== "downloading") {
      return { ...descriptor, status: "ready", health: live?.health ?? "unchecked", progress: 100, message: "" };
    }
    cancelledRerankers.add(id);
    await cancelLocalReranker(id);
    liveRerankStatus.delete(id);
    readinessCache.delete(id);
    await rm4(join9(localModelCacheDir(), id), { recursive: true, force: true }).catch(() => {
    });
  }
  return { ...descriptor, status: "not_downloaded", health: "unchecked", progress: 0, message: "" };
}
async function deleteLocalModel(id) {
  const descriptor = await findModel(id);
  if (descriptor.kind === "embedding") await removeLocalModel(id);
  else {
    await releaseLocalReranker(id, localModelCacheDir(), getHfEndpoint());
    await rm4(join9(localModelCacheDir(), id), { recursive: true, force: true });
    liveRerankStatus.delete(id);
    cancelledRerankers.delete(id);
    readinessCache.delete(id);
    if (descriptor.support === "experimental") await writeRegistry((registry) => {
      registry.rerankers = registry.rerankers.filter((entry) => entry.id !== id);
    });
  }
  return { ...descriptor, status: "not_downloaded", health: "unchecked", progress: 0, message: "" };
}
async function assertLocalRerankerReady(modelId) {
  let descriptor;
  try {
    descriptor = await findModel(modelId);
  } catch {
    throw new LocalRerankError("unsupported_model", "\u672C\u5730\u91CD\u6392\u6A21\u578B\u5C1A\u672A\u767B\u8BB0\uFF0C\u8BF7\u5728\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\u4E2D\u6DFB\u52A0\u5E76\u9A8C\u8BC1", false);
  }
  if (descriptor.kind !== "reranking") throw new LocalRerankError("unsupported_model", "\u6240\u9009\u672C\u5730\u6A21\u578B\u4E0D\u662F\u91CD\u6392\u6A21\u578B", false);
  const live = liveRerankStatus.get(modelId);
  const liveIsFresh = live?.statusChangedAt === void 0 || Date.now() - live.statusChangedAt < RERANK_STATUS_STALE_MS;
  if (liveIsFresh && (live?.status === "downloading" || live?.status === "validating")) {
    throw new LocalRerankError("model_checking", "\u672C\u5730\u91CD\u6392\u6A21\u578B\u6B63\u5728\u4E0B\u8F7D\u6216\u9A8C\u8BC1\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5", true);
  }
  if (live?.status === "unhealthy" || live?.status === "error") throw new LocalRerankError("model_unhealthy", "\u672C\u5730\u91CD\u6392\u6A21\u578B\u9A8C\u8BC1\u5931\u8D25\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u91CD\u65B0\u9A8C\u8BC1", false);
  const files = await modelFingerprint(modelId);
  if (!files.complete) throw new LocalRerankError("model_not_downloaded", "\u672C\u5730\u91CD\u6392\u6A21\u578B\u5C1A\u672A\u4E0B\u8F7D\uFF0C\u8BF7\u5728\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\u4E2D\u4E0B\u8F7D", false);
  if (await readReadiness(modelId) === void 0) throw new LocalRerankError("model_unhealthy", "\u672C\u5730\u91CD\u6392\u6A21\u578B\u5C1A\u672A\u901A\u8FC7\u517C\u5BB9\u6027\u9A8C\u8BC1\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u8FD0\u884C\u81EA\u68C0", false);
}
function localRerankActionFor(code) {
  if (code === "model_not_downloaded") return "download_model";
  if (code === "model_checking" || code === "model_unhealthy") return "run_self_test";
  if (code === "unsupported_model") return "check_config";
  return "retry_later";
}

// src/knowledge/index.ts
init_local_rerank();
init_ocr();
init_net();

// src/knowledge/mineru-management-security.ts
function requireLocalManagement(req, bindHost) {
  const peer = req.socket?.remoteAddress;
  if (bindHost !== "127.0.0.1" || !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(peer ?? "")) {
    throw new DeploymentError("local_management_only", "MinerU deployment management requires a loopback-bound DSH host and a local connection.", 403);
  }
  const host = req.headers.host;
  if (!host || !/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) throw new DeploymentError("invalid_host", "A loopback Host header is required.", 403);
  if (req.headers["x-dsh-mineru-management"] !== "1" || req.headers["sec-fetch-site"] === "cross-site") {
    throw new DeploymentError("management_header_required", "Use the local DSH management panel.", 403);
  }
  const origin = req.headers.origin;
  if (origin !== void 0 && origin !== `http://${host}` && origin !== `https://${host}`) throw new DeploymentError("cross_origin_request", "Cross-origin deployment management is not allowed.", 403);
  if (req.method !== "GET" && !/^application\/json(?:;|$)/i.test(req.headers["content-type"] ?? "")) throw new DeploymentError("invalid_content_type", "JSON management requests are required.", 415);
}

// src/knowledge/http.ts
var MAX_BODY_BYTES = 32 * 1024 * 1024;
function knowledgeRoute(service) {
  return {
    kind: "prefix",
    path: "/knowledge",
    handler: (req, res) => {
      void handleRequest(service, req, res);
    }
  };
}
async function handleRequest(service, req, res) {
  try {
    await service.whenReady();
    const url = new URL(req.url ?? "/", "http://dsh.internal");
    const pathname = url.pathname;
    const rel = pathname.slice("/knowledge".length);
    const segments = rel.split("/").filter(Boolean).map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
    const method = (req.method ?? "GET").toUpperCase();
    if (segments[0] === "processors" && segments[1] === "managed") requireLocalManagement(req, service.managementBindHost);
    const body = method === "GET" ? void 0 : await readJson(req);
    const value = await route(service, method, segments, body ?? {}, url.searchParams);
    if (value === void 0) {
      writeJson(res, 404, { ok: false, error: { code: "not-found", message: `no route for ${method} ${pathname}` } });
      return;
    }
    if (isRawDownload(value)) {
      const { bytes, fileName, mimeType: mimeType2, inline } = value;
      res.writeHead(200, {
        "content-type": mimeType2 ?? "application/octet-stream",
        "content-disposition": inline === true ? `inline; filename*=UTF-8''${encodeURIComponent(fileName)}` : `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "content-length": String(bytes.byteLength),
        "x-content-type-options": "nosniff",
        "cache-control": "private, no-store",
        "content-security-policy": "sandbox; default-src 'none'"
      });
      res.end(Buffer.from(bytes));
      return;
    }
    writeJson(res, 200, { ok: true, value });
  } catch (error) {
    if (error instanceof DeploymentError) {
      writeJson(res, error.status, { ok: false, error: { code: error.code, message: error.message } });
      return;
    }
    if (error instanceof EvidenceRequestError) {
      writeJson(res, error.code === "not_found" ? 404 : 400, { ok: false, error: { code: error.code, message: error.message } });
      return;
    }
    if (error instanceof ConflictError) {
      writeJson(res, 409, { ok: false, error: { code: "conflict", message: error.message } });
      return;
    }
    if (error instanceof NotFoundError) {
      writeJson(res, 404, { ok: false, error: { code: "not_found", message: error.message } });
      return;
    }
    if (error instanceof DirectorySourceError) {
      writeJson(res, 409, {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          ...error.details !== void 0 ? { details: error.details } : {}
        }
      });
      return;
    }
    if (error instanceof StorageUnavailableError) {
      writeJson(res, 503, { ok: false, error: { code: "storage_unavailable", message: error.message } });
      return;
    }
    if (error instanceof InvalidRequestError) {
      writeJson(res, 400, { ok: false, error: { code: "invalid_request", message: error.message } });
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    writeJson(res, 500, { ok: false, error: { code: "error", message } });
  }
}
function isRawDownload(value) {
  return typeof value === "object" && value !== null && value.rawDownload === true;
}
async function route(service, method, segments, body, query) {
  if (segments[0] === "processors" && segments[1] === "managed" && segments.length === 3) {
    const action = segments[2];
    if (action === "status" && method === "GET") return service.mineruDeployment.status();
    if (method === "POST") {
      if (action === "python") {
        if (body.executable !== void 0 && typeof body.executable !== "string") throw new InvalidRequestError("executable must be a Python path");
        return service.mineruDeployment.pythonEnvironments(body.executable);
      }
      if (action === "prepare") {
        if (typeof body.planId !== "string" || body.confirm !== true) throw new InvalidRequestError("planId and explicit confirm:true are required");
        return service.mineruDeployment.prepare(body.planId);
      }
      if (action === "cancel") return service.mineruDeployment.cancel();
      if (action === "start") return service.mineruDeployment.start();
      if (action === "stop") return service.mineruDeployment.stop();
      if (action === "use") {
        await service.setConfig({ ...service.mineruDeployment.connection(), documentProcessorProvider: "mineru-local", mineruTier: "basic" });
        return { applied: true };
      }
    }
  }
  if (segments.join("/") === "processors/managed/plan" && method === "POST") {
    if (typeof body.root !== "string" || body.existingModels !== void 0 && typeof body.existingModels !== "string") throw new InvalidRequestError("root and existingModels must be directory paths");
    if (body.pythonExecutable !== void 0 && typeof body.pythonExecutable !== "string") throw new InvalidRequestError("pythonExecutable must be a Python path");
    const config = service.getConfig();
    return service.mineruDeployment.preflight({ root: body.root, existingModels: body.existingModels, pythonExecutable: body.pythonExecutable, hfEndpoint: config.hfEndpoint, pythonIndexUrl: config.mineruPythonIndexUrl });
  }
  if (segments[0] === "config") {
    if (method === "GET") return service.getConfig();
    if (method === "PUT") return service.setConfig(body);
    return void 0;
  }
  if (segments[0] === "processors" && segments[1] === "check" && segments.length === 2 && method === "POST") {
    if (body.baseId !== void 0 && typeof body.baseId !== "string") throw new InvalidRequestError("baseId must be a string");
    return service.checkProcessor(body.baseId);
  }
  if (segments[0] === "knowledge-toggle") {
    if (method === "GET") {
      return { enabled: service.isEnabled(), enabledBaseIds: service.getEnabledBaseIds(), workspacePaths: service.getWorkspacePaths() };
    }
    if (method === "PUT") {
      if (typeof body.enabled === "boolean") await service.setEnabled(body.enabled);
      if (Array.isArray(body.enabledBaseIds)) {
        await service.setEnabledBaseIds(body.enabledBaseIds.filter((id) => typeof id === "string"));
      }
      if (Array.isArray(body.workspacePaths)) {
        await service.setWorkspacePaths(body.workspacePaths.filter((p) => typeof p === "string"));
      }
      return { enabled: service.isEnabled(), enabledBaseIds: service.getEnabledBaseIds(), workspacePaths: service.getWorkspacePaths() };
    }
    return void 0;
  }
  if (segments[0] === "groups") {
    if (method === "GET") return service.listGroups();
    if (method === "POST") return service.createGroup(typeof body.name === "string" ? body.name : "");
    if (method === "PATCH") {
      return service.renameGroup(
        typeof body.from === "string" ? body.from : "",
        typeof body.to === "string" ? body.to : ""
      );
    }
    if (method === "DELETE") {
      return service.deleteGroup(typeof body.name === "string" ? body.name : "").then(() => ({ deleted: true }));
    }
    return void 0;
  }
  if (segments[0] === "stats" && method === "GET") return service.stats();
  if (segments[0] === "local-model-status" && method === "GET") {
    return service.getLocalModelStatus(query.get("model") ?? void 0);
  }
  if (segments[0] === "probe-embedding-dimensions" && method === "POST") {
    return service.probeEmbeddingDimensions({
      ...typeof body.provider === "string" ? { provider: body.provider } : {},
      ...typeof body.baseUrl === "string" ? { baseUrl: body.baseUrl } : {},
      ...typeof body.model === "string" ? { model: body.model } : {},
      ...typeof body.apiKey === "string" ? { apiKey: body.apiKey } : {}
    });
  }
  if (segments[0] === "local-models") {
    if (segments[1] === "cache-directory" && segments.length === 2 && method === "POST") {
      if (body.path !== void 0 && typeof body.path !== "string") throw new InvalidRequestError("path must be a directory path string");
      return service.prepareLocalModelCacheDirectory(body.path);
    }
    if (method === "GET") return service.listLocalModels();
    if (segments[1] === "custom" && method === "POST") {
      return service.registerCustomLocalReranker(typeof body.id === "string" ? body.id : "");
    }
    if (segments[1] === "self-test" && method === "POST") {
      return service.selfTestLocalModel(typeof body.id === "string" ? body.id : "");
    }
    if (segments[1] === "download" && method === "POST") {
      return service.downloadLocalModel(query.get("model") ?? "");
    }
    if (segments[1] === "cancel" && method === "POST") {
      return service.cancelLocalModel(query.get("model") ?? "");
    }
    if (segments[1] === "remove" && method === "DELETE") {
      return service.deleteLocalModel(query.get("model") ?? "");
    }
    if (segments[1] === "migrate" && method === "POST") {
      return service.migrateLocalModels(typeof body.to === "string" ? body.to : "");
    }
    return void 0;
  }
  if (segments[0] === "local-ocr") {
    if (method === "GET" && segments.length === 1) return service.getOcrStatus();
    if (segments[1] === "download" && method === "POST") return service.downloadOcr();
    if (segments[1] === "remove" && method === "DELETE") return service.deleteOcr();
    return void 0;
  }
  if (segments[0] === "local-ollama") {
    if (segments[1] === "tags" && method === "GET") {
      return { models: await service.listOllamaModels(typeof query.get("baseUrl") === "string" ? query.get("baseUrl") : "") };
    }
    if (segments[1] === "pull" && method === "POST") {
      const model = typeof body.model === "string" ? body.model.trim() : "";
      if (model === "") throw new Error("ollama model name is empty");
      const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl : "";
      void service.pullOllamaModel(model, baseUrl).catch(() => {
      });
      return { started: true };
    }
    if (segments[1] === "pull" && method === "DELETE") {
      const model = query.get("model") ?? "";
      if (model === "") throw new Error("ollama model name is empty");
      service.cancelOllamaPull(model);
      return { cancelled: true };
    }
    if (segments[1] === "delete" && method === "DELETE") {
      const model = typeof body.model === "string" ? body.model.trim() : "";
      if (model === "") throw new Error("ollama model name is empty");
      const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl : "";
      await service.deleteOllamaModel(model, baseUrl);
      return { deleted: true };
    }
    if (segments[1] === "status" && method === "GET") {
      return service.getOllamaPullStatus(query.get("model") ?? "");
    }
    if (segments[1] === "pulls" && method === "GET") {
      return { pulls: service.activeOllamaPulls() };
    }
    return void 0;
  }
  if (segments[0] === "model-suggestions" && method === "GET") {
    return service.modelSuggestions();
  }
  if (segments[0] === "indexing-status" && method === "GET") {
    return service.indexingStatus();
  }
  if (segments[0] === "import-directory" && segments.length >= 2) {
    const jobId = segments[1];
    if (method === "GET") return service.directoryImportStatus(jobId);
    if (segments[2] === "cancel" && method === "POST") {
      service.cancelDirectoryImport(jobId);
      return { cancelled: true };
    }
    return void 0;
  }
  if (segments[0] === "reindex" && segments.length >= 2) {
    const jobId = segments[1];
    if (method === "GET") return service.reindexJobStatus(jobId);
    if (segments[2] === "cancel" && method === "POST") {
      service.cancelReindexJob(jobId);
      return { cancelled: true };
    }
    return void 0;
  }
  if (segments[0] === "bases") {
    if (segments.length === 1) {
      if (method === "GET") return service.listBases();
      if (method === "POST") {
        if (typeof body.name !== "string" || body.name.trim() === "") {
          throw new InvalidRequestError('createBase requires a non-empty "name"');
        }
        return service.createBase(body);
      }
      return void 0;
    }
    const baseId = segments[1];
    if (segments.length === 2) {
      if (method === "PATCH") return service.renameBase(baseId, body);
      if (method === "DELETE") return service.deleteBase(baseId).then(() => ({ deleted: true }));
      return void 0;
    }
    if (segments.length === 3) {
      if (segments[2] === "stats" && method === "GET") return service.stats(baseId);
      if (segments[2] === "reindex" && method === "POST") return service.startReindexBase(baseId);
      if (segments[2] === "files-batch" && method === "POST") {
        const bodyRequest = body;
        if (!Array.isArray(bodyRequest.files)) {
          throw new InvalidRequestError('files-batch requires a "files" array');
        }
        return service.addFiles({
          baseId,
          files: bodyRequest.files.filter((file) => typeof file === "object" && file !== null && typeof file.fileName === "string").map((file) => ({
            fileName: file.fileName,
            ...typeof file.mimeType === "string" ? { mimeType: file.mimeType } : {},
            ...typeof file.contentBase64 === "string" ? { contentBase64: file.contentBase64 } : {}
          })),
          ...bodyRequest.conflict === "rename" || bodyRequest.conflict === "replace" || bodyRequest.conflict === "detect" ? { conflict: bodyRequest.conflict } : {},
          ...typeof bodyRequest.parentDirectoryId === "string" ? { parentDirectoryId: bodyRequest.parentDirectoryId } : {}
        });
      }
      if (segments[2] === "restore" && method === "POST") {
        const config = typeof body.config === "object" && body.config !== null ? body.config : void 0;
        return service.restoreBase(baseId, typeof body.name === "string" ? body.name : "", config);
      }
      if (segments[2] === "import-directory" && method === "POST") {
        return service.importDirectory({ baseId, path: typeof body.path === "string" ? body.path : "" });
      }
      if (segments[2] === "import-directory-tree" && method === "POST") {
        return service.importDirectoryTree(baseId, typeof body.path === "string" ? body.path : "");
      }
      if (segments[2] === "import-path" && method === "POST") {
        return service.importFromPath(baseId, typeof body.path === "string" ? body.path : "");
      }
      if (segments[2] === "source-path" && method === "POST") {
        return service.setBaseSourcePath(
          baseId,
          typeof body.sourceId === "string" ? body.sourceId : "",
          typeof body.path === "string" ? body.path : ""
        );
      }
      if (segments[2] === "directories" && method === "POST") {
        return service.createDirectory(
          baseId,
          typeof body.title === "string" ? body.title : "directory",
          typeof body.parentDirectoryId === "string" ? body.parentDirectoryId : void 0
        );
      }
      if (segments[2] === "documents") {
        if (method === "GET") return service.listDocuments(baseId);
        if (method === "POST") {
          if (typeof body.url === "string") {
            return service.addUrlDocument({
              baseId,
              url: body.url,
              ...typeof body.title === "string" ? { title: body.title } : {},
              ...typeof body.parentDirectoryId === "string" ? { parentDirectoryId: body.parentDirectoryId } : {}
            });
          }
          const request = body;
          if (typeof request.contentBase64 === "string") {
            const conflict = body.conflict;
            return service.addFileDocument({
              baseId,
              fileName: typeof body.fileName === "string" ? body.fileName : "document",
              ...typeof body.mimeType === "string" ? { mimeType: body.mimeType } : {},
              ...typeof body.title === "string" ? { title: body.title } : {},
              ...conflict === "keep" || conflict === "replace" || conflict === "rename" || conflict === "detect" ? { conflict } : {},
              ...typeof body.parentDirectoryId === "string" ? { parentDirectoryId: body.parentDirectoryId } : {},
              contentBase64: request.contentBase64
            });
          }
          return service.addTextDocument({
            baseId,
            title: typeof body.title === "string" ? body.title : "untitled",
            content: typeof body.content === "string" ? body.content : "",
            ...typeof body.parentDirectoryId === "string" ? { parentDirectoryId: body.parentDirectoryId } : {}
          });
        }
      }
    }
    return void 0;
  }
  if (segments[0] === "documents") {
    if (segments.length === 1) {
      if (method === "DELETE") return service.deleteDocuments(readIds(body), { recursive: body.recursive === true });
      return void 0;
    }
    if (segments.length === 2 && segments[1] === "reindex" && method === "POST") {
      return service.reindexDocuments(readIds(body));
    }
    const documentId = segments[1];
    if (segments.length === 4 && segments[2] === "artifacts" && method === "GET") {
      const revision = query.get("revision");
      if (revision === null || revision === "") throw new InvalidRequestError("evidence revision is required");
      return { rawDownload: true, inline: true, ...await service.getEvidenceAsset(documentId, segments[3], revision) };
    }
    if (segments.length === 2) {
      if (method === "GET") {
        const rawTextLimit = readIntQuery(query, "rawTextLimit");
        const includeChunks = query.get("includeChunks") !== "false";
        return service.getDocument(documentId, {
          includeChunks,
          ...rawTextLimit !== void 0 ? { rawTextLimit } : {}
        });
      }
      if (method === "PATCH") return service.renameDocument(documentId, typeof body.title === "string" ? body.title : "");
      if (method === "DELETE") {
        return service.deleteDocument(documentId, { recursive: query.get("recursive") === "true" || body.recursive === true }).then(() => ({ deleted: true }));
      }
      return void 0;
    }
    if (segments.length === 3) {
      if (segments[2] === "cancel" && method === "POST") return service.cancelProcessing(documentId);
      if (segments[2] === "evidence" && method === "GET") {
        const pageIndex = strictIntQuery(query, "pageIndex", 0, 1e5);
        const blockOffset = strictIntQuery(query, "blockOffset", 0, 32 * 1024 * 1024);
        const maxTokens = strictIntQuery(query, "maxTokens", 128, 4096);
        const blockId = query.get("blockId") ?? void 0;
        if (blockOffset !== void 0 && blockId === void 0) throw new InvalidRequestError("blockOffset requires blockId");
        return service.readDocumentEvidence(documentId, { revision: query.get("revision") ?? void 0, pageIndex, blockId, blockOffset, maxTokens });
      }
      if (segments[2] === "chunks" && method === "GET") {
        const withEmbeddings = query.get("includeEmbeddings") !== "false";
        return service.listChunks(documentId, readIntQuery(query, "limit"), readIntQuery(query, "offset")).map((chunk) => withEmbeddings ? chunk : (({ embedding: _embedding, ...rest }) => rest)(chunk));
      }
      if (segments[2] === "reindex" && method === "POST") {
        if (body.mode !== void 0 && body.mode !== "reparse" && body.mode !== "rechunk") throw new InvalidRequestError("mode must be reparse or rechunk");
        return service.reindexDocument(documentId, { mode: body.mode });
      }
      if (segments[2] === "delete-impact" && method === "GET") return service.getDeleteImpact(documentId);
      if (segments[2] === "refresh" && method === "POST") return service.refreshUrlDocument(documentId);
      if (segments[2] === "raw" && method === "GET") {
        const raw = await service.getRawFile(documentId);
        if (raw === void 0) return void 0;
        return { rawDownload: true, inline: query.get("inline") === "1", ...raw };
      }
    }
    return void 0;
  }
  if (segments[0] === "search" && method === "POST") {
    if (typeof body.query !== "string" || body.query.trim() === "") {
      throw new InvalidRequestError('search requires a non-empty "query"');
    }
    if (body.filter !== void 0) {
      if (typeof body.filter !== "object" || body.filter === null || Array.isArray(body.filter)) {
        throw new InvalidRequestError("filter must be an object");
      }
      const filter = body.filter;
      for (const key of ["excludeDocIds", "titleExcludes"]) {
        const value = filter[key];
        if (value !== void 0 && (!Array.isArray(value) || !value.every((item) => typeof item === "string"))) {
          throw new InvalidRequestError(`filter.${key} must be an array of strings`);
        }
      }
    }
    return service.search(body);
  }
  return void 0;
}
var InvalidRequestError = class extends Error {
  code = "invalid_request";
  constructor(message) {
    super(message);
    this.name = "InvalidRequestError";
  }
};
async function readJson(req) {
  const mediaType = (req.headers["content-type"] ?? "").split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType === "") return {};
  if (mediaType !== "application/json") throw new InvalidRequestError("content type must be application/json");
  const text = await readBody(req);
  if (text.trim().length === 0) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new InvalidRequestError("body is not valid JSON");
  }
}
async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    const buffer = chunk;
    size += buffer.byteLength;
    if (size > MAX_BODY_BYTES) throw new InvalidRequestError("request body too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
function writeJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}
function readIds(body) {
  return Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string") : [];
}
function readIntQuery(query, key) {
  const raw = query.get(key);
  if (raw === null || raw === "") return void 0;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : void 0;
}
function strictIntQuery(query, key, min, max) {
  const raw = query.get(key);
  if (raw === null) return void 0;
  const value = Number(raw);
  if (raw.trim() === "" || !Number.isInteger(value) || value < min || value > max) throw new InvalidRequestError(`invalid ${key}`);
  return value;
}

// src/knowledge/retrieval.ts
function cosineSimilarity2(a, b) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) dot += a[i] * b[i];
  return clamp01(dot);
}
var LATIN_WORD = /[a-z0-9_]+/g;
var CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]+/g;
function tokenize(text) {
  const tokens = [];
  const lowered = text.toLowerCase();
  for (const match of lowered.match(LATIN_WORD) ?? []) {
    if (match.length > 1) tokens.push(match);
  }
  for (const run2 of lowered.match(CJK) ?? []) {
    if (run2.length === 1) {
      tokens.push(run2);
      continue;
    }
    for (let i = 0; i < run2.length - 1; i += 1) tokens.push(run2.slice(i, i + 2));
  }
  return tokens;
}
function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
var BM25_K1 = 1.5;
var BM25_B = 0.75;
function buildBm25(documents) {
  const docTokens = /* @__PURE__ */ new Map();
  const df = /* @__PURE__ */ new Map();
  let totalLength = 0;
  for (const doc of documents) {
    const tokens = tokenize(doc.text);
    docTokens.set(doc.id, tokens);
    totalLength += tokens.length;
    const seen = /* @__PURE__ */ new Set();
    for (const token of tokens) {
      if (!seen.has(token)) {
        df.set(token, (df.get(token) ?? 0) + 1);
        seen.add(token);
      }
    }
  }
  const n = documents.length;
  const avgdl = n > 0 ? totalLength / n : 0;
  return {
    score(id, queryTokens) {
      const tokens = docTokens.get(id);
      if (tokens === void 0 || tokens.length === 0) return 0;
      const tf = /* @__PURE__ */ new Map();
      for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);
      let sum = 0;
      for (const token of queryTokens) {
        const documentFrequency = df.get(token);
        if (documentFrequency === void 0) continue;
        const idf = Math.log((n - documentFrequency + 0.5) / (documentFrequency + 0.5) + 1);
        const termFrequency = tf.get(token) ?? 0;
        if (termFrequency === 0) continue;
        const norm = termFrequency / (termFrequency + BM25_K1 * (1 - BM25_B + BM25_B * (tokens.length / avgdl)));
        sum += idf * norm;
      }
      return sum;
    }
  };
}
function normalizeBm25(raw) {
  return raw / (raw + 1);
}
var RRF_K = 60;
function reciprocalRankFusion(rankedLists, weights) {
  const fused = /* @__PURE__ */ new Map();
  for (let i = 0; i < rankedLists.length; i += 1) {
    const weight = weights?.[i] ?? 1;
    rankedLists[i].forEach((id, index) => {
      fused.set(id, (fused.get(id) ?? 0) + weight / (RRF_K + index + 1));
    });
  }
  return fused;
}
function maximalMarginalRelevance(hits, byId, queryVector, lambda, topK) {
  const withEmbedding = hits.filter((hit) => {
    const embedding = byId.get(hit.id)?.embedding;
    return embedding !== void 0 && embedding.length === queryVector.length;
  });
  const withoutEmbedding = hits.filter((hit) => !withEmbedding.includes(hit));
  if (withEmbedding.length < 2) return [...hits];
  const selected = [];
  const remaining = [...withEmbedding];
  const target = Math.min(withEmbedding.length, topK);
  while (selected.length < target && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < remaining.length; i += 1) {
      const hit = remaining[i];
      const embedding = byId.get(hit.id).embedding;
      let maxSimilarity = 0;
      for (const picked of selected) {
        const pickedEmbedding = byId.get(picked.id).embedding;
        maxSimilarity = Math.max(maxSimilarity, cosineSimilarity2(embedding, pickedEmbedding));
      }
      const score = lambda * hit.score - (1 - lambda) * maxSimilarity;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    selected.push(remaining.splice(bestIndex, 1)[0]);
  }
  return [...selected, ...remaining, ...withoutEmbedding];
}
function rank(query, candidates, options) {
  const queryTokens = tokenize(query);
  const vectorAvailable = options.queryVector !== void 0 && candidates.some((candidate) => candidate.embedding !== void 0 && candidate.embedding.length === options.queryVector.length);
  let mode;
  if (options.mode === "vector" || options.mode === "hybrid") mode = options.mode;
  else if (options.mode === "lexical") mode = "lexical";
  else mode = vectorAvailable ? "hybrid" : "lexical";
  if (mode !== "lexical" && !vectorAvailable) mode = "lexical";
  const scorer = buildBm25(candidates);
  const lexical = /* @__PURE__ */ new Map();
  for (const candidate of candidates) lexical.set(candidate.id, normalizeBm25(scorer.score(candidate.id, queryTokens)));
  const vector = /* @__PURE__ */ new Map();
  if (options.queryVector !== void 0) {
    for (const candidate of candidates) {
      if (candidate.embedding !== void 0 && candidate.embedding.length === options.queryVector.length) {
        vector.set(candidate.id, cosineSimilarity2(options.queryVector, candidate.embedding));
      }
    }
  }
  let ranked;
  if (mode === "vector") {
    ranked = [...vector.entries()].map(([id, score]) => ({ id, score, vectorScore: score }));
  } else if (mode === "lexical") {
    ranked = [...lexical.entries()].map(([id, score]) => ({ id, score, lexicalScore: score }));
  } else {
    const vectorOrder = [...vector.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const lexicalOrder = [...lexical.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const fused = reciprocalRankFusion([vectorOrder, lexicalOrder]);
    const maxFused = 2 / (RRF_K + 1);
    ranked = candidates.map((candidate) => ({
      id: candidate.id,
      score: (fused.get(candidate.id) ?? 0) / maxFused,
      vectorScore: vector.get(candidate.id),
      lexicalScore: lexical.get(candidate.id)
    }));
  }
  ranked.sort((a, b) => b.score - a.score);
  if (options.mmr && options.mmrLambda > 0 && options.queryVector !== void 0) {
    const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
    ranked = maximalMarginalRelevance(ranked, byId, options.queryVector, options.mmrLambda, Math.max(options.topK * 3, 12));
  }
  return ranked.filter((hit) => hit.score >= options.threshold).slice(0, options.topK);
}

// src/knowledge/rerank.ts
init_net();
init_local_rerank();
init_embed();
init_text_safety();
var RerankExecutionError = class extends Error {
  constructor(detail, status, technicalMessage = detail.message) {
    super(technicalMessage);
    this.detail = detail;
    this.status = status;
    this.name = "RerankExecutionError";
  }
};
function rerankErrorDetail(error) {
  if (error instanceof RerankExecutionError) return error.detail;
  if (error instanceof LocalRerankError) {
    const messages = {
      model_not_downloaded: "\u672C\u5730\u91CD\u6392\u6A21\u578B\u5C1A\u672A\u4E0B\u8F7D\uFF0C\u8BF7\u5148\u5728\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\u4E2D\u4E0B\u8F7D\u3002",
      model_checking: "\u672C\u5730\u91CD\u6392\u6A21\u578B\u6B63\u5728\u4E0B\u8F7D\u6216\u9A8C\u8BC1\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002",
      model_unhealthy: "\u672C\u5730\u91CD\u6392\u6A21\u578B\u672A\u901A\u8FC7\u5065\u5EB7\u68C0\u67E5\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u91CD\u65B0\u9A8C\u8BC1\u3002",
      unsupported_model: "\u672C\u5730\u91CD\u6392\u6A21\u578B\u672A\u767B\u8BB0\u6216\u67B6\u6784\u4E0D\u53D7\u652F\u6301\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E\u3002",
      timeout: "\u672C\u5730\u91CD\u6392\u8D85\u8FC7\u65F6\u95F4\u9884\u7B97\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002",
      invalid_response: "\u672C\u5730\u91CD\u6392\u8FD4\u56DE\u4E86\u65E0\u6548\u5206\u6570\uFF0C\u8BF7\u91CD\u65B0\u9A8C\u8BC1\u6A21\u578B\u3002",
      runtime_error: "\u672C\u5730\u91CD\u6392\u8FD0\u884C\u5931\u8D25\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002",
      process_crash: "\u672C\u5730\u91CD\u6392\u8FDB\u7A0B\u5F02\u5E38\u9000\u51FA\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002",
      circuit_open: "\u672C\u5730\u91CD\u6392\u8FDE\u7EED\u5931\u8D25\u540E\u5DF2\u4E34\u65F6\u6682\u505C\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",
      busy: "\u672C\u5730\u91CD\u6392\u961F\u5217\u7E41\u5FD9\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002"
    };
    return { code: error.code, message: messages[error.code], retryable: error.retryable, action: localRerankActionFor(error.code) };
  }
  return { code: "provider_error", message: "\u91CD\u6392\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002", retryable: true, action: "retry_later" };
}
function rerankTechnicalMessage(error) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 1e3);
}
async function rerankCandidates(baseUrl, model, apiKey, query, candidates, optionsOrTopN, legacyTimeoutMs) {
  const options = normalizeExecutionOptions(optionsOrTopN, legacyTimeoutMs);
  throwIfAborted2(options.signal);
  if (candidates.length === 0) return /* @__PURE__ */ new Map();
  const safeQuery = ensureWellFormed(query);
  const safeTexts = candidates.map((candidate) => ensureWellFormed(candidate.text));
  const keep = options.topN !== void 0 ? Math.max(1, Math.min(Math.trunc(options.topN), candidates.length)) : candidates.length;
  if (model.startsWith("local:")) {
    const modelId = model.slice("local:".length).trim();
    if (modelId === "") throw new RerankExecutionError({ code: "unsupported_model", message: "local rerank model id is empty", retryable: false, action: "check_config" });
    await withAbortSignal2(assertLocalRerankerReady(modelId), options.signal);
    throwIfAborted2(options.signal);
    const timeoutMs = remainingTimeoutMs(options);
    if (timeoutMs <= 0) throw new LocalRerankError("timeout", "local rerank deadline expired before inference", true);
    const scores2 = await withAbortSignal2(rerankInLocalProcess(
      modelId,
      localModelCacheDir(),
      getHfEndpoint(),
      safeQuery,
      safeTexts,
      timeoutMs,
      options.signal
    ), options.signal);
    if (scores2.length !== candidates.length || scores2.some((score) => !Number.isFinite(score) || score < 0 || score > 1)) {
      throw new RerankExecutionError({ code: "invalid_response", message: "local rerank did not return one score in [0, 1] per candidate", retryable: false, action: "run_self_test" });
    }
    const out = /* @__PURE__ */ new Map();
    const ranked = candidates.map((candidate, i) => ({ id: candidate.id, score: scores2[i], index: i })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, keep);
    for (const entry of ranked) out.set(entry.id, entry.score);
    return out;
  }
  if (baseUrl.trim() === "") throw new RerankExecutionError({ code: "provider_error", message: "rerank base URL is empty", retryable: false, action: "check_config" });
  const url = `${baseUrl.replace(/\/+$/, "")}/rerank`;
  let response;
  try {
    response = await httpFetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...apiKey ? { authorization: `Bearer ${apiKey}` } : {}
      },
      body: JSON.stringify({
        model,
        query: safeQuery,
        documents: safeTexts,
        top_n: keep
      }),
      timeoutMs: options.timeoutMs,
      ...options.deadlineAt !== void 0 ? { deadlineAt: options.deadlineAt } : {},
      retries: options.retries,
      ...options.signal !== void 0 ? { signal: options.signal } : {}
    });
  } catch (error) {
    throwIfAborted2(options.signal);
    const message = error instanceof Error ? error.message : String(error);
    if (Date.now() >= options.deadlineAt || /\b(?:timeout|timed out)\b/i.test(message)) {
      throw new RerankExecutionError({
        code: "timeout",
        message: "\u91CD\u6392\u670D\u52A1\u8D85\u8FC7\u65F6\u95F4\u9884\u7B97\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002",
        retryable: true,
        action: "retry_later"
      }, void 0, message);
    }
    throw error;
  }
  if (!response.ok) {
    void response.body?.cancel().catch(() => {
    });
    throw new RerankExecutionError({
      code: "provider_error",
      message: `\u91CD\u6392\u670D\u52A1\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${response.status}\uFF09\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002`,
      retryable: ![400, 401, 403, 404].includes(response.status),
      action: [400, 401, 403, 404].includes(response.status) ? "check_config" : "retry_later"
    }, response.status, `rerank request failed: HTTP ${response.status}`);
  }
  let json;
  const bodyBudgetMs = remainingTimeoutMs(options);
  if (bodyBudgetMs <= 0) {
    throw remoteTimeoutError("rerank response body deadline expired before reading");
  }
  const bodyBudgetSignal = AbortSignal.timeout(bodyBudgetMs);
  const bodySignal = options.signal !== void 0 ? AbortSignal.any([options.signal, bodyBudgetSignal]) : bodyBudgetSignal;
  try {
    json = await withAbortSignal2(response.json(), bodySignal);
  } catch (error) {
    void response.body?.cancel().catch(() => {
    });
    throwIfAborted2(options.signal);
    if (bodyBudgetSignal.aborted || Date.now() >= options.deadlineAt) {
      throw remoteTimeoutError(error instanceof Error ? error.message : String(error));
    }
    throw new RerankExecutionError(
      { code: "invalid_response", message: "rerank provider returned invalid JSON", retryable: false, action: "check_config" },
      response.status,
      error instanceof Error ? error.message : String(error)
    );
  }
  if (!isRecord(json) || !Array.isArray(json.results)) {
    throw new RerankExecutionError({ code: "invalid_response", message: "rerank provider response must contain a results array", retryable: false, action: "check_config" });
  }
  if (json.results.length !== keep) {
    throw new RerankExecutionError({
      code: "invalid_response",
      message: `rerank provider returned ${json.results.length} results, expected ${keep}`,
      retryable: false,
      action: "check_config"
    });
  }
  const scores = /* @__PURE__ */ new Map();
  for (const result of json.results) {
    if (!isRecord(result)) {
      throw new RerankExecutionError({ code: "invalid_response", message: "rerank provider returned a malformed result entry", retryable: false, action: "check_config" });
    }
    const index = result.index;
    const score = result.relevance_score;
    if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= candidates.length || typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 1) {
      throw new RerankExecutionError({ code: "invalid_response", message: "rerank provider returned an invalid index or score", retryable: false, action: "check_config" });
    }
    const candidate = candidates[index];
    if (scores.has(candidate.id)) throw new RerankExecutionError({ code: "invalid_response", message: "rerank provider returned duplicate candidate indexes", retryable: false, action: "check_config" });
    scores.set(candidate.id, score);
  }
  return scores;
}
function remoteTimeoutError(technicalMessage) {
  return new RerankExecutionError({
    code: "timeout",
    message: "\u91CD\u6392\u670D\u52A1\u8D85\u8FC7\u65F6\u95F4\u9884\u7B97\uFF0C\u672C\u6B21\u4F7F\u7528\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\u3002",
    retryable: true,
    action: "retry_later"
  }, void 0, technicalMessage);
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function normalizeExecutionOptions(optionsOrTopN, legacyTimeoutMs) {
  const raw = typeof optionsOrTopN === "number" ? { topN: optionsOrTopN, ...legacyTimeoutMs !== void 0 ? { timeoutMs: legacyTimeoutMs } : {} } : optionsOrTopN ?? (legacyTimeoutMs !== void 0 ? { timeoutMs: legacyTimeoutMs } : {});
  const timeoutMs = finitePositiveInt(raw.timeoutMs, 6e4);
  const deadlineAt = raw.deadlineAt !== void 0 && Number.isFinite(raw.deadlineAt) ? raw.deadlineAt : Date.now() + timeoutMs;
  return {
    ...raw,
    ...raw.topN !== void 0 && Number.isFinite(raw.topN) ? { topN: Math.max(1, Math.trunc(raw.topN)) } : { topN: void 0 },
    timeoutMs,
    deadlineAt,
    retries: finiteNonNegativeInt(raw.retries, 1)
  };
}
function remainingTimeoutMs(options) {
  if (options.deadlineAt === void 0) return options.timeoutMs;
  return Math.min(options.timeoutMs, Math.ceil(options.deadlineAt - Date.now()));
}
function finitePositiveInt(value, fallback) {
  if (value === void 0 || !Number.isFinite(value) || value <= 0) return fallback;
  return Math.max(1, Math.trunc(value));
}
function finiteNonNegativeInt(value, fallback) {
  if (value === void 0 || !Number.isFinite(value) || value < 0) return fallback;
  return Math.trunc(value);
}
function throwIfAborted2(signal) {
  if (signal?.aborted !== true) return;
  if (signal.reason instanceof Error) throw signal.reason;
  throw new DOMException("The operation was aborted", "AbortError");
}
async function withAbortSignal2(promise, signal) {
  if (signal === void 0) return promise;
  throwIfAborted2(signal);
  return await new Promise((resolve7, reject) => {
    const onAbort = () => {
      if (signal.reason instanceof Error) reject(signal.reason);
      else reject(new DOMException("The operation was aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve7(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

// src/knowledge/chunkdb.ts
import { createHash as createHash8 } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { readFile as readFile7 } from "node:fs/promises";
import { homedir as homedir4 } from "node:os";
import { dirname as dirname7, join as join10 } from "node:path";
function resolveChunkStorePath(explicit) {
  if (explicit !== void 0 && explicit.trim() !== "") return explicit;
  return join10(dshHome(), "storages", "knowledge-chunks.sqlite");
}
function legacyChunkFilePath() {
  return join10(dshHome(), "storages", "knowledge.json");
}
function dshHome() {
  const fromEnv = process.env.DSH_HOME;
  return fromEnv !== void 0 && fromEnv.trim() !== "" ? fromEnv : join10(homedir4(), ".dsh");
}
var EMBEDDING_HASH_QUERY_BATCH = 500;
var DELETE_BATCH_SIZE = 2e3;
var DELETE_YIELD_BUDGET_MS = 50;
var VACUUM_MIN_FREELIST_RATIO = 0.2;
var VACUUM_MIN_FREED_BYTES = 8 * 1024 * 1024;
function throwIfDeadlineExpired(deadlineAt) {
  if (deadlineAt !== void 0 && Date.now() >= deadlineAt) {
    throw new DOMException("knowledge search deadline exceeded", "TimeoutError");
  }
}
var MAX_MATCH_TERMS = 64;
function extractFtsTokens(query) {
  return query.match(/[\p{L}\p{N}_]+/gu) ?? [];
}
function extractMatchTerms(query) {
  const trigrams = [];
  const words = [];
  for (const token of extractFtsTokens(query)) {
    const chars = [...token];
    let cursor = 0;
    while (cursor < chars.length) {
      const unsegmented = UNSEGMENTED_SCRIPT.test(chars[cursor]);
      let end = cursor + 1;
      while (end < chars.length && UNSEGMENTED_SCRIPT.test(chars[end]) === unsegmented) end += 1;
      const run2 = chars.slice(cursor, end);
      if (!unsegmented || run2.length <= 3) {
        words.push(run2.join(""));
      } else {
        for (let start = 0; start + 3 <= run2.length; start += 1) trigrams.push(run2.slice(start, start + 3).join(""));
      }
      cursor = end;
    }
  }
  const distinct = [.../* @__PURE__ */ new Set([...words.filter((word) => [...word].length >= 3), ...trigrams])];
  if (distinct.length > MAX_MATCH_TERMS) {
    console.warn(`[dsh-knowledge] BM25 query exceeds the MATCH term cap; shedding the tail (${distinct.length} terms)`);
  }
  return distinct.slice(0, MAX_MATCH_TERMS);
}
function extractShortTerms(query) {
  return [...new Set(extractFtsTokens(query).filter((token) => [...token].length < 3))];
}
function docFilterSql(filter, column) {
  if (filter === void 0) return null;
  if (filter.docIds !== void 0 && filter.docIds.length === 0) return { sql: " AND 0 = 1", params: [] };
  const conditions = [];
  const params = [];
  if (filter.docIds !== void 0) {
    conditions.push(` AND ${column} IN (SELECT value FROM json_each(?))`);
    params.push(JSON.stringify(filter.docIds));
  }
  if (filter.excludeDocIds !== void 0 && filter.excludeDocIds.length > 0) {
    conditions.push(` AND ${column} NOT IN (SELECT value FROM json_each(?))`);
    params.push(JSON.stringify(filter.excludeDocIds));
  }
  return conditions.length > 0 ? { sql: conditions.join(""), params } : null;
}
var UNSEGMENTED_SCRIPT = /[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]/u;
function toLikePattern(token) {
  return `%${token.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}
function needsLikeFallback(query) {
  return extractMatchTerms(query).length === 0;
}
function encodeEmbedding(values) {
  return Buffer.from(new Float32Array(values).buffer);
}
function decodeEmbedding(blob) {
  if (blob === void 0 || blob === null || blob.byteLength === 0) return void 0;
  return Array.from(new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4));
}
function decodeEmbeddingFloat32(blob) {
  if (blob === void 0 || blob === null || blob.byteLength === 0) return void 0;
  return new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4);
}
function cosineFloat32(a, b) {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const av = a[i];
    const bv = b[i];
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  const norm = Math.sqrt(normA) * Math.sqrt(normB);
  if (norm === 0) return 0;
  const cosine = dot / norm;
  return Number.isFinite(cosine) ? Math.max(0, Math.min(1, cosine)) : 0;
}
function toChunkRow(chunk) {
  return {
    chunk_id: chunk.id,
    doc_id: chunk.docId,
    base_id: chunk.baseId,
    idx: chunk.index,
    text: chunk.text,
    heading: chunk.heading ?? null,
    context: chunk.context ?? null,
    embedding: chunk.embedding !== void 0 ? encodeEmbedding(chunk.embedding) : null,
    embedding_model: chunk.embeddingModel ?? null,
    source_spans: chunk.sourceSpans !== void 0 ? JSON.stringify(chunk.sourceSpans) : null,
    processing_revision: chunk.processingRevision ?? null
  };
}
function hashEmbeddingText(text) {
  return createHash8("sha256").update(text, "utf8").digest("hex");
}
function validateDocumentGeneration(doc, chunks) {
  const ids = /* @__PURE__ */ new Set();
  const indices = /* @__PURE__ */ new Set();
  for (const chunk of chunks) {
    if (chunk.docId !== doc.id || chunk.baseId !== doc.baseId || ids.has(chunk.id) || indices.has(chunk.index) || !Number.isSafeInteger(chunk.index) || chunk.index < 0 || chunk.processingRevision !== doc.processing?.revision || !(chunk.sourceSpans ?? []).every((span) => validSourceSpan(span) && span.chunkEnd <= chunk.text.length && span.revision === chunk.processingRevision)) throw new Error("invalid document generation");
    ids.add(chunk.id);
    indices.add(chunk.index);
  }
}
var ChunkDatabase = class _ChunkDatabase {
  db;
  /**
   * Per-base vector cache for the brute-force lane: vectors load lazily on
   * the first vector query for a base and stay in sync with every write
   * path, so repeated searches never re-fetch/re-decode the BLOBs. Float32
   * storage keeps the cosine loop on typed arrays. Invalidation stays
   * exact (per doc / per base), never a whole-store flush.
   */
  vectorCache = /* @__PURE__ */ new Map();
  /** `PRAGMA data_version` observed when each base's cache was loaded, so a
   *  write from another connection invalidates it instead of being invisible. */
  vectorCacheDataVersion = /* @__PURE__ */ new Map();
  static SELECT_COLUMNS = "chunk_id, doc_id, base_id, idx, text, heading, context, embedding, embedding_model, source_spans, processing_revision";
  constructor(path) {
    mkdirSync(dirname7(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode = WAL");
    this.db.exec("PRAGMA synchronous = NORMAL");
    this.db.exec("PRAGMA foreign_keys = OFF");
    this.db.function("knowledge_before_deadline", (deadline, _rowKey) => {
      if (typeof deadline === "number" && Date.now() >= deadline) {
        throw new Error("knowledge search deadline exceeded");
      }
      return 1;
    });
    this.db.exec("PRAGMA busy_timeout = 5000");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chunk (
        chunk_id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        base_id TEXT NOT NULL,
        idx INTEGER NOT NULL,
        text TEXT NOT NULL,
        search_text TEXT NOT NULL,
        heading TEXT,
        context TEXT,
        embedding BLOB,
        embedding_model TEXT,
        embedding_text_hash TEXT,
        fts_rowid INTEGER
      );
      CREATE INDEX IF NOT EXISTS chunk_doc_idx ON chunk(doc_id);
      CREATE INDEX IF NOT EXISTS chunk_base_idx ON chunk(base_id);
      CREATE VIRTUAL TABLE IF NOT EXISTS chunk_fts USING fts5(
        search_text, content='chunk', content_rowid='fts_rowid', tokenize='trigram'
      );
      -- fts_rowid is a STABLE surrogate key assigned by the insert trigger (never
      -- app code): the implicit rowid is renumbered by VACUUM, which would silently
      -- desync this external-content FTS from its rows (Cherry's #16132-class fix).
      CREATE TRIGGER IF NOT EXISTS chunk_ai AFTER INSERT ON chunk BEGIN
        UPDATE chunk SET fts_rowid = (SELECT COALESCE(MAX(fts_rowid), 0) + 1 FROM chunk)
          WHERE chunk_id = NEW.chunk_id;
        INSERT INTO chunk_fts(rowid, search_text)
        SELECT fts_rowid, search_text FROM chunk WHERE chunk_id = NEW.chunk_id;
      END;
      CREATE TRIGGER IF NOT EXISTS chunk_ad AFTER DELETE ON chunk BEGIN
        INSERT INTO chunk_fts(chunk_fts, rowid, search_text) VALUES ('delete', OLD.fts_rowid, OLD.search_text);
      END;
      -- fts_rowid is stable across a text edit, so it is not reassigned \u2014 only the
      -- FTS row is re-keyed.
      CREATE TRIGGER IF NOT EXISTS chunk_au AFTER UPDATE OF search_text ON chunk BEGIN
        INSERT INTO chunk_fts(chunk_fts, rowid, search_text) VALUES ('delete', OLD.fts_rowid, OLD.search_text);
        INSERT INTO chunk_fts(rowid, search_text) VALUES (NEW.fts_rowid, NEW.search_text);
      END;
    `);
    this.migrateEmbeddingHashColumn();
    this.migrateFtsRowidColumn();
    this.migrateEvidenceColumns();
    this.migrateFromBundleLayout();
  }
  migrateEvidenceColumns() {
    const columns = this.db.prepare("PRAGMA table_info(chunk)").all();
    if (!columns.some((column) => column.name === "source_spans")) this.db.exec("ALTER TABLE chunk ADD COLUMN source_spans TEXT");
    if (!columns.some((column) => column.name === "processing_revision")) this.db.exec("ALTER TABLE chunk ADD COLUMN processing_revision TEXT");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS document_generation_stage (
        doc_id TEXT PRIMARY KEY, base_id TEXT NOT NULL, revision TEXT NOT NULL, next_document TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS document_generation_chunk (
        doc_id TEXT NOT NULL, chunk_id TEXT NOT NULL, chunk_json TEXT NOT NULL,
        embedding_text_hash TEXT, embedding_model TEXT, embedding BLOB,
        PRIMARY KEY (doc_id, chunk_id)
      );
      CREATE INDEX IF NOT EXISTS generation_embedding_hash ON document_generation_chunk(embedding_text_hash, embedding_model);
      CREATE TABLE IF NOT EXISTS document_generation_commit (
        doc_id TEXT PRIMARY KEY, base_id TEXT NOT NULL, previous_created_at INTEGER NOT NULL, next_document TEXT NOT NULL
      );
    `);
  }
  /**
   * Schema evolution for the stable FTS surrogate key: older stores keyed the
   * external-content FTS on the implicit `rowid`, which VACUUM renumbers — the
   * FTS then silently points at the wrong rows (Cherry's #16132 class). Adds
   * the `fts_rowid` column, backfills it from the current rowid, and rebuilds
   * `chunk_fts` (virtual tables cannot change their content_rowid in place).
   * Idempotent: a fresh store already has both, so only the unique index is
   * ensured. `fts_rowid` must be unique so the MAX+1 assignment in the insert
   * trigger stays a correct key — the UNIQUE index makes a violation loud.
   */
  migrateFtsRowidColumn() {
    this.db.exec("CREATE TABLE IF NOT EXISTS chunk_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    if (this.readMeta("fts_rowid_migrated") === "1") return;
    const columns = this.db.prepare("PRAGMA table_info(chunk)").all();
    const hasFtsRowid = columns.some((column) => column.name === "fts_rowid");
    const fts = this.db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'chunk_fts'").get();
    const keyedOnFtsRowid = fts !== void 0 && fts.sql.includes("fts_rowid");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      if (!hasFtsRowid) this.db.exec("ALTER TABLE chunk ADD COLUMN fts_rowid INTEGER");
      this.db.exec("UPDATE chunk SET fts_rowid = rowid WHERE fts_rowid IS NULL");
      this.db.exec("CREATE UNIQUE INDEX IF NOT EXISTS chunk_fts_rowid_uniq ON chunk(fts_rowid)");
      if (!keyedOnFtsRowid) {
        this.db.exec("DROP TRIGGER IF EXISTS chunk_ai");
        this.db.exec("DROP TRIGGER IF EXISTS chunk_ad");
        this.db.exec("DROP TRIGGER IF EXISTS chunk_au");
        this.db.exec("DROP TABLE IF EXISTS chunk_fts");
        this.db.exec(`CREATE VIRTUAL TABLE chunk_fts USING fts5(
          search_text, content='chunk', content_rowid='fts_rowid', tokenize='trigram'
        )`);
        this.db.exec(`CREATE TRIGGER chunk_ai AFTER INSERT ON chunk BEGIN
          UPDATE chunk SET fts_rowid = (SELECT COALESCE(MAX(fts_rowid), 0) + 1 FROM chunk)
            WHERE chunk_id = NEW.chunk_id;
          INSERT INTO chunk_fts(rowid, search_text)
          SELECT fts_rowid, search_text FROM chunk WHERE chunk_id = NEW.chunk_id;
        END`);
        this.db.exec(`CREATE TRIGGER chunk_ad AFTER DELETE ON chunk BEGIN
          INSERT INTO chunk_fts(chunk_fts, rowid, search_text) VALUES ('delete', OLD.fts_rowid, OLD.search_text);
        END`);
        this.db.exec(`CREATE TRIGGER chunk_au AFTER UPDATE OF search_text ON chunk BEGIN
          INSERT INTO chunk_fts(chunk_fts, rowid, search_text) VALUES ('delete', OLD.fts_rowid, OLD.search_text);
          INSERT INTO chunk_fts(rowid, search_text) VALUES (NEW.fts_rowid, NEW.search_text);
        END`);
      }
      this.db.exec(`INSERT INTO chunk_fts(chunk_fts) VALUES('rebuild')`);
      this.writeMeta("fts_rowid_migrated", "1");
      this.db.exec("COMMIT");
    } catch (error) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
      }
      throw error;
    }
  }
  readMeta(key) {
    const row = this.db.prepare("SELECT value FROM chunk_meta WHERE key = ?").get(key);
    return row?.value;
  }
  writeMeta(key, value) {
    this.db.prepare("INSERT INTO chunk_meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
  }
  /**
   * Schema evolution for the `embedding_text_hash` dedup column: add it to a
   * store created by an older version, then backfill the hash of every stored
   * vector from its `search_text` (the exact text the embedding model saw, so
   * the hash is authoritative for reuse). Idempotent — a fresh store already
   * has the column and nothing to backfill. The index is created here, AFTER
   * the column exists: on an old store the column does not exist when the
   * constructor's CREATE TABLE runs, and a CREATE INDEX on a missing column
   * would fail the whole open.
   */
  migrateEmbeddingHashColumn() {
    const columns = this.db.prepare("PRAGMA table_info(chunk)").all();
    if (!columns.some((column) => column.name === "embedding_text_hash")) {
      this.db.exec("ALTER TABLE chunk ADD COLUMN embedding_text_hash TEXT");
    }
    this.db.exec("CREATE INDEX IF NOT EXISTS chunk_emb_hash_idx ON chunk(embedding_text_hash, embedding_model)");
    const missing2 = this.db.prepare(
      "SELECT chunk_id, search_text FROM chunk WHERE embedding IS NOT NULL AND embedding_text_hash IS NULL"
    ).all();
    if (missing2.length === 0) return;
    const update = this.db.prepare("UPDATE chunk SET embedding_text_hash = ? WHERE chunk_id = ?");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      for (const row of missing2) update.run(hashEmbeddingText(row.search_text), row.chunk_id);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  /** One-time migration from the previous per-document bundle layout. */
  migrateFromBundleLayout() {
    const table = this.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'chunk_bundles'").get();
    if (table === void 0) return;
    const count = this.db.prepare("SELECT COUNT(*) AS c FROM chunk").get().c;
    if (count === 0) {
      const bundles = this.db.prepare("SELECT doc_id, chunks_json FROM chunk_bundles").all();
      const insert = this.db.prepare(
        "INSERT INTO chunk (chunk_id, doc_id, base_id, idx, text, search_text, heading, context, embedding, embedding_model, embedding_text_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      this.db.exec("BEGIN IMMEDIATE");
      try {
        for (const row of bundles) {
          const chunks = JSON.parse(row.chunks_json);
          for (const chunk of chunks) {
            const searchText = searchTextOf(chunk);
            insert.run(
              chunk.id,
              chunk.docId,
              chunk.baseId,
              chunk.index,
              chunk.text,
              searchText,
              chunk.heading ?? null,
              chunk.context ?? null,
              chunk.embedding !== void 0 ? encodeEmbedding(chunk.embedding) : null,
              chunk.embeddingModel ?? null,
              chunk.embedding !== void 0 ? hashEmbeddingText(searchText) : null
            );
          }
        }
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    this.db.exec("DROP TABLE IF EXISTS chunk_bundles");
  }
  get size() {
    return this.db.prepare("SELECT COUNT(*) AS c FROM chunk").get().c;
  }
  listChunks(baseId) {
    const rows = this.db.prepare(`SELECT ${_ChunkDatabase.SELECT_COLUMNS} FROM chunk WHERE base_id = ? ORDER BY doc_id, idx`).all(baseId);
    return rows.map(rowToChunk);
  }
  getChunk(id) {
    const row = this.db.prepare(
      `SELECT ${_ChunkDatabase.SELECT_COLUMNS} FROM chunk WHERE chunk_id = ?`
    ).get(id);
    return row === void 0 ? void 0 : rowToChunk(row);
  }
  listChunksByDoc(docId, limit, offset) {
    const sql = `SELECT ${_ChunkDatabase.SELECT_COLUMNS} FROM chunk WHERE doc_id = ? ORDER BY idx`;
    const rows = limit !== void 0 ? this.db.prepare(`${sql} LIMIT ? OFFSET ?`).all(docId, limit, offset ?? 0) : this.db.prepare(sql).all(docId);
    return rows.map(rowToChunk);
  }
  /** Chunks of one document whose index falls in `[fromIdx, toIdx]` — the
   *  sibling context around a search hit, fetched with one bounded SQL query. */
  listChunksByIndexRange(docId, fromIdx, toIdx) {
    const rows = this.db.prepare(
      `SELECT ${_ChunkDatabase.SELECT_COLUMNS} FROM chunk WHERE doc_id = ? AND idx >= ? AND idx <= ? ORDER BY idx`
    ).all(docId, fromIdx, toIdx);
    return rows.map(rowToChunk);
  }
  /** Fetch several already-merged document ranges in one SQL statement. */
  listChunksByIndexRanges(ranges) {
    if (ranges.length === 0) return [];
    const clauses = ranges.map(() => "(doc_id = ? AND idx >= ? AND idx <= ?)").join(" OR ");
    const params = ranges.flatMap((range) => [range.docId, Math.trunc(range.fromIdx), Math.trunc(range.toIdx)]);
    const rows = this.db.prepare(
      `SELECT ${_ChunkDatabase.SELECT_COLUMNS} FROM chunk WHERE ${clauses} ORDER BY doc_id, idx`
    ).all(...params);
    return rows.map(rowToChunk);
  }
  /** Actual chunk count per document, for reconciling stale document metadata. */
  chunkCountsByDoc(baseIds) {
    const scope = [...baseIds];
    if (scope.length === 0) return /* @__PURE__ */ new Map();
    const placeholders = scope.map(() => "?").join(",");
    const rows = this.db.prepare(`SELECT doc_id, COUNT(*) AS c FROM chunk WHERE base_id IN (${placeholders}) GROUP BY doc_id`).all(...scope);
    return new Map(rows.map((row) => [row.doc_id, row.c]));
  }
  putChunks(chunks) {
    if (chunks.length === 0) return;
    const docId = chunks[0].docId;
    const baseId = chunks[0].baseId;
    const deleteOld = this.db.prepare("DELETE FROM chunk WHERE doc_id = ? AND base_id = ?");
    const insert = this.db.prepare(
      "INSERT INTO chunk (chunk_id, doc_id, base_id, idx, text, search_text, heading, context, embedding, embedding_model, embedding_text_hash, source_spans, processing_revision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    this.db.exec("BEGIN IMMEDIATE");
    try {
      deleteOld.run(docId, baseId);
      for (const chunk of chunks) {
        const searchText = searchTextOf(chunk);
        insert.run(
          chunk.id,
          chunk.docId,
          chunk.baseId,
          chunk.index,
          chunk.text,
          searchText,
          chunk.heading ?? null,
          chunk.context ?? null,
          chunk.embedding !== void 0 ? encodeEmbedding(chunk.embedding) : null,
          chunk.embeddingModel ?? null,
          chunk.embedding !== void 0 ? hashEmbeddingText(searchText) : null,
          chunk.sourceSpans !== void 0 ? JSON.stringify(chunk.sourceSpans) : null,
          chunk.processingRevision ?? null
        );
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    this.dropVectorCacheByDoc(docId);
    for (const chunk of chunks) this.upsertVectorCache(chunk);
  }
  /**
   * Incrementally persist a batch of chunks WITHOUT clearing the document's
   * other rows (unlike {@link putChunks}, which replaces the whole bundle).
   * This is the crash-recovery write path: `ingestDocument` embeds in batches
   * and lands each batch here, so a crash mid-embedding leaves every completed
   * batch in the store. On restart the recovery pass re-runs the embed with
   * hash reuse (decision A4) and only the missing batches hit the API.
   *
   * `ON CONFLICT(chunk_id) DO UPDATE` (not REPLACE) keeps the rowid stable, so
   * the external-content FTS trigger chain stays consistent.
   */
  putChunkBatch(chunks) {
    if (chunks.length === 0) return;
    const upsert = this.db.prepare(
      `INSERT INTO chunk (chunk_id, doc_id, base_id, idx, text, search_text, heading, context, embedding, embedding_model, embedding_text_hash, source_spans, processing_revision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(chunk_id) DO UPDATE SET
         doc_id = excluded.doc_id, base_id = excluded.base_id, idx = excluded.idx,
         text = excluded.text, search_text = excluded.search_text, heading = excluded.heading,
         context = excluded.context, embedding = excluded.embedding,
         embedding_model = excluded.embedding_model, embedding_text_hash = excluded.embedding_text_hash,
         source_spans = excluded.source_spans, processing_revision = excluded.processing_revision`
    );
    this.db.exec("BEGIN IMMEDIATE");
    try {
      for (const chunk of chunks) {
        const searchText = searchTextOf(chunk);
        upsert.run(
          chunk.id,
          chunk.docId,
          chunk.baseId,
          chunk.index,
          chunk.text,
          searchText,
          chunk.heading ?? null,
          chunk.context ?? null,
          chunk.embedding !== void 0 ? encodeEmbedding(chunk.embedding) : null,
          chunk.embeddingModel ?? null,
          chunk.embedding !== void 0 ? hashEmbeddingText(searchText) : null,
          chunk.sourceSpans !== void 0 ? JSON.stringify(chunk.sourceSpans) : null,
          chunk.processingRevision ?? null
        );
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    for (const chunk of chunks) this.upsertVectorCache(chunk);
  }
  /** Durable candidate batches remain invisible to both retrieval lanes. */
  stageDocumentGeneration(doc, chunks) {
    validateDocumentGeneration(doc, chunks);
    const revision = doc.processing?.revision ?? `legacy:${doc.updatedAt}`;
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const previous = this.db.prepare("SELECT revision FROM document_generation_stage WHERE doc_id = ?").get(doc.id);
      if (previous !== void 0 && previous.revision !== revision) {
        this.db.prepare("DELETE FROM document_generation_chunk WHERE doc_id = ?").run(doc.id);
      }
      this.db.prepare(`INSERT INTO document_generation_stage(doc_id, base_id, revision, next_document) VALUES (?, ?, ?, ?)
        ON CONFLICT(doc_id) DO UPDATE SET base_id = excluded.base_id, revision = excluded.revision, next_document = excluded.next_document`).run(doc.id, doc.baseId, revision, JSON.stringify(doc));
      const insert = this.db.prepare(`INSERT INTO document_generation_chunk(doc_id, chunk_id, chunk_json, embedding_text_hash, embedding_model, embedding)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(doc_id, chunk_id) DO UPDATE SET chunk_json = excluded.chunk_json,
        embedding_text_hash = excluded.embedding_text_hash, embedding_model = excluded.embedding_model, embedding = excluded.embedding`);
      for (const chunk of chunks) insert.run(
        doc.id,
        chunk.id,
        JSON.stringify(chunk),
        chunk.embedding !== void 0 ? hashEmbeddingText(searchTextOf(chunk)) : null,
        chunk.embeddingModel ?? null,
        chunk.embedding !== void 0 ? encodeEmbedding(chunk.embedding) : null
      );
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  getStagedDocumentGeneration(docId) {
    const row = this.db.prepare("SELECT next_document FROM document_generation_stage WHERE doc_id = ?").get(docId);
    if (row === void 0) return void 0;
    const rows = this.db.prepare("SELECT chunk_json FROM document_generation_chunk WHERE doc_id = ?").all(docId);
    return {
      document: JSON.parse(row.next_document),
      chunks: rows.map((row2) => JSON.parse(row2.chunk_json)).sort((a, b) => a.index - b.index)
    };
  }
  /** Replace the live generation and its recovery record in ONE transaction. */
  publishDocumentGeneration(doc, chunks, previousCreatedAt) {
    validateDocumentGeneration(doc, chunks);
    if (doc.chunkCount !== chunks.length) throw new Error("document generation chunk count mismatch");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("DELETE FROM chunk WHERE doc_id = ? AND base_id = ?").run(doc.id, doc.baseId);
      const insert = this.db.prepare(`INSERT INTO chunk
        (chunk_id, doc_id, base_id, idx, text, search_text, heading, context, embedding, embedding_model, embedding_text_hash, source_spans, processing_revision)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const chunk of chunks) insert.run(
        chunk.id,
        chunk.docId,
        chunk.baseId,
        chunk.index,
        chunk.text,
        searchTextOf(chunk),
        chunk.heading ?? null,
        chunk.context ?? null,
        chunk.embedding !== void 0 ? encodeEmbedding(chunk.embedding) : null,
        chunk.embeddingModel ?? null,
        chunk.embedding !== void 0 ? hashEmbeddingText(searchTextOf(chunk)) : null,
        chunk.sourceSpans !== void 0 ? JSON.stringify(chunk.sourceSpans) : null,
        chunk.processingRevision ?? null
      );
      this.db.prepare(`INSERT INTO document_generation_commit(doc_id, base_id, previous_created_at, next_document) VALUES (?, ?, ?, ?)
        ON CONFLICT(doc_id) DO UPDATE SET base_id = excluded.base_id, previous_created_at = excluded.previous_created_at, next_document = excluded.next_document`).run(doc.id, doc.baseId, previousCreatedAt, JSON.stringify(doc));
      this.db.prepare("DELETE FROM document_generation_stage WHERE doc_id = ?").run(doc.id);
      this.db.prepare("DELETE FROM document_generation_chunk WHERE doc_id = ?").run(doc.id);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    this.dropVectorCacheByDoc(doc.id);
    for (const chunk of chunks) this.upsertVectorCache(chunk);
  }
  pendingDocumentGenerations() {
    const rows = this.db.prepare("SELECT next_document, previous_created_at FROM document_generation_commit").all();
    return rows.map((row) => ({ document: JSON.parse(row.next_document), previousCreatedAt: row.previous_created_at }));
  }
  stagedDocumentHeaders() {
    const rows = this.db.prepare("SELECT next_document FROM document_generation_stage").all();
    return rows.map((row) => JSON.parse(row.next_document));
  }
  discardPublishedGeneration(doc) {
    if (doc.processing?.revision !== void 0) {
      this.db.prepare("DELETE FROM chunk WHERE doc_id = ? AND base_id = ? AND processing_revision = ?").run(doc.id, doc.baseId, doc.processing.revision);
      this.dropVectorCacheByDoc(doc.id);
      this.vectorCache.delete(doc.baseId);
    }
    this.discardDocumentGenerations(doc.id);
  }
  pendingDocumentGeneration(docId) {
    const row = this.db.prepare("SELECT next_document, previous_created_at FROM document_generation_commit WHERE doc_id = ?").get(docId);
    return row === void 0 ? void 0 : { document: JSON.parse(row.next_document), previousCreatedAt: row.previous_created_at };
  }
  acknowledgeDocumentGeneration(docId) {
    this.db.prepare("DELETE FROM document_generation_commit WHERE doc_id = ?").run(docId);
  }
  discardDocumentGenerations(docId) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("DELETE FROM document_generation_commit WHERE doc_id = ?").run(docId);
      this.db.prepare("DELETE FROM document_generation_stage WHERE doc_id = ?").run(docId);
      this.db.prepare("DELETE FROM document_generation_chunk WHERE doc_id = ?").run(docId);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  discardStagedDocumentGeneration(docId) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("DELETE FROM document_generation_stage WHERE doc_id = ?").run(docId);
      this.db.prepare("DELETE FROM document_generation_chunk WHERE doc_id = ?").run(docId);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  async deleteChunks(docId, baseId) {
    const where = baseId !== void 0 ? "doc_id = ? AND base_id = ?" : "doc_id = ?";
    const keyParams = baseId !== void 0 ? [docId, baseId] : [docId];
    const stmt = this.db.prepare(
      `DELETE FROM chunk WHERE rowid IN (SELECT rowid FROM chunk WHERE ${where} ORDER BY rowid LIMIT ?)`
    );
    let started = Date.now();
    for (; ; ) {
      const changed = stmt.run(...keyParams, DELETE_BATCH_SIZE).changes;
      if (changed === 0) break;
      if (Date.now() - started >= DELETE_YIELD_BUDGET_MS) {
        await new Promise((resolve7) => setImmediate(resolve7));
        started = Date.now();
      }
    }
    this.dropVectorCacheByDoc(docId);
  }
  async deleteChunksByBase(baseId) {
    const stmt = this.db.prepare(
      "DELETE FROM chunk WHERE rowid IN (SELECT rowid FROM chunk WHERE base_id = ? ORDER BY rowid LIMIT ?)"
    );
    let started = Date.now();
    for (; ; ) {
      const changed = stmt.run(baseId, DELETE_BATCH_SIZE).changes;
      if (changed === 0) break;
      if (Date.now() - started >= DELETE_YIELD_BUDGET_MS) {
        await new Promise((resolve7) => setImmediate(resolve7));
        started = Date.now();
      }
    }
    this.vectorCache.delete(baseId);
  }
  /**
   * Return space a large delete freed back to the OS (Cherry's
   * `KnowledgeIndexStore.reclaimSpace` + driver thresholds). Best-effort:
   * - Checkpoint first — cheap, and folds the delete's committed frees into
   *   the main file so `freelist_count` reflects them.
   * - VACUUM only when the freelist is a large share of the file AND a
   *   meaningful byte count; below either bound it just truncates the WAL.
   * - The external-content FTS only TOMBSTONES its trigram rows on delete (via
   *   the chunk delete trigger); the dead segment blobs linger in the shadow
   *   table, which VACUUM cannot reclaim on its own. 'optimize' merges and
   *   drops them, gated behind the same threshold so a small delete never pays
   *   the whole-index segment merge.
   * - VACUUM rewrites into the WAL, so checkpoint again to release it.
   */
  reclaimSpace() {
    try {
      return this.reclaimSpaceUnchecked();
    } catch (error) {
      console.warn(`dsh-knowledge: space reclamation failed after a delete: ${error instanceof Error ? error.message : String(error)}`);
      return { vacuumed: false, reclaimedBytes: 0 };
    }
  }
  reclaimSpaceUnchecked() {
    this.db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    const pageSize = this.readPragmaInt("page_size");
    const pageCount = this.readPragmaInt("page_count");
    const freelist = this.readPragmaInt("freelist_count");
    const ratio = pageCount > 0 ? freelist / pageCount : 0;
    if (ratio < VACUUM_MIN_FREELIST_RATIO || freelist * pageSize < VACUUM_MIN_FREED_BYTES) {
      return { vacuumed: false, reclaimedBytes: 0 };
    }
    this.db.exec(`INSERT INTO chunk_fts(chunk_fts) VALUES('optimize')`);
    this.db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    this.db.exec("VACUUM");
    this.db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    const pageCountAfter = this.readPragmaInt("page_count");
    return { vacuumed: true, reclaimedBytes: Math.max(0, pageCount - pageCountAfter) * pageSize };
  }
  readPragmaInt(pragma) {
    const row = this.db.prepare(`PRAGMA ${pragma}`).get();
    if (row === void 0) return 0;
    const value = Object.values(row)[0];
    return typeof value === "number" ? value : Number(value ?? 0);
  }
  /**
   * Library-wide vector reuse (Cherry's `listExistingEmbeddingHashes`, decision
   * A4): for each embedding-text hash already stored under `embeddingModel`,
   * return its vector. The caller embeds only the hashes missing from this
   * map, so a re-embed of unchanged chunk text reuses the stored vector instead
   * of re-spending the embedding API. Matching is (hash, embedding_model) —
   * two bases in one store may use different models, so a hash alone is not a
   * valid reuse key (vectors from another model are not comparable). Rows
   * without a vector (a failed/lexical-only import) never match.
   *
   * Batch size stays well under SQLite's bound-parameter limit (Cherry uses
   * 500 for the same reason).
   */
  listEmbeddingVectorsByHashes(hashes, embeddingModel) {
    const vectors = /* @__PURE__ */ new Map();
    for (let i = 0; i < hashes.length; i += EMBEDDING_HASH_QUERY_BATCH) {
      const batch = hashes.slice(i, i + EMBEDDING_HASH_QUERY_BATCH);
      if (batch.length === 0) continue;
      const placeholders = batch.map(() => "?").join(",");
      const rows = this.db.prepare(
        `SELECT embedding_text_hash, embedding FROM chunk
         WHERE embedding_text_hash IN (${placeholders}) AND embedding_model = ? AND embedding IS NOT NULL`
      ).all(...batch, embeddingModel);
      for (const row of rows) {
        const vector = decodeEmbedding(row.embedding);
        if (vector !== void 0) vectors.set(row.embedding_text_hash, vector);
      }
      const candidates = this.db.prepare(`SELECT embedding_text_hash, embedding FROM document_generation_chunk
        WHERE embedding_text_hash IN (${placeholders}) AND embedding_model = ? AND embedding IS NOT NULL`).all(...batch, embeddingModel);
      for (const row of candidates) {
        const vector = decodeEmbedding(row.embedding);
        if (vector !== void 0 && !vectors.has(row.embedding_text_hash)) vectors.set(row.embedding_text_hash, vector);
      }
    }
    return vectors;
  }
  /** Per-doc chunk presence + embedding coverage in one grouped pass (listDocuments). */
  docChunkStatus(baseId) {
    const rows = this.db.prepare(
      "SELECT doc_id, SUM(CASE WHEN embedding IS NULL THEN 1 ELSE 0 END) AS missing FROM chunk WHERE base_id = ? GROUP BY doc_id"
    ).all(baseId);
    const withChunks = /* @__PURE__ */ new Set();
    const missingEmbedding = /* @__PURE__ */ new Set();
    for (const row of rows) {
      withChunks.add(row.doc_id);
      if (row.missing > 0) missingEmbedding.add(row.doc_id);
    }
    return { withChunks, missingEmbedding };
  }
  /** Every document id that still has chunk rows, for orphan reconciliation:
   *  a delete that landed mid-embedding can leave batches behind whose document
   *  row is already gone, and those rows would keep matching the retrieval
   *  lanes (they scope by base, not by document existence) forever. */
  docIdsWithChunks() {
    const rows = this.db.prepare("SELECT DISTINCT doc_id FROM chunk").all();
    return new Set(rows.map((row) => row.doc_id));
  }
  /** Aggregate chunk stats for `stats()`: counts, embedding presence/dimensions, model tags. */
  chunkStats(baseIds) {
    const scope = [...baseIds];
    const placeholders = scope.map(() => "?").join(",");
    const count = scope.length > 0 ? this.db.prepare(`SELECT COUNT(*) AS c FROM chunk WHERE base_id IN (${placeholders})`).get(...scope).c : 0;
    if (count === 0) return { count, embedded: false, embeddingModelCounts: [] };
    const embedded = scope.length > 0 && this.db.prepare(`SELECT 1 AS one FROM chunk WHERE base_id IN (${placeholders}) AND embedding IS NOT NULL LIMIT 1`).get(...scope) !== void 0;
    let dimensions;
    if (embedded && scope.length > 0) {
      const row = this.db.prepare(`SELECT embedding FROM chunk WHERE base_id IN (${placeholders}) AND embedding IS NOT NULL LIMIT 1`).get(...scope);
      dimensions = row !== void 0 ? decodeEmbedding(row.embedding)?.length : void 0;
    }
    const modelRows = this.db.prepare(
      `SELECT base_id, embedding_model, COUNT(*) AS c FROM chunk WHERE embedding IS NOT NULL AND embedding_model IS NOT NULL AND base_id IN (${placeholders}) GROUP BY base_id, embedding_model`
    ).all(...scope);
    return {
      count,
      embedded,
      ...dimensions !== void 0 ? { dimensions } : {},
      embeddingModelCounts: modelRows.map((row) => ({ baseId: row.base_id, model: row.embedding_model, count: row.c }))
    };
  }
  // ── retrieval lanes ────────────────────────────────────────────────────────
  async lexical(query, baseIds, limit, filter, deadlineAt) {
    try {
      return await this.lexicalUnchecked(query, baseIds, limit, filter, deadlineAt);
    } catch (error) {
      if (deadlineAt !== void 0 && Date.now() >= deadlineAt) {
        throw new DOMException("knowledge search deadline exceeded", "TimeoutError");
      }
      throw error;
    }
  }
  async lexicalUnchecked(query, baseIds, limit, filter, deadlineAt) {
    throwIfDeadlineExpired(deadlineAt);
    const scope = [...baseIds];
    if (scope.length === 0) return { total: 0, hits: [] };
    if (filter?.docIds !== void 0 && filter.docIds.length === 0) return { total: 0, hits: [] };
    if (query.trim().length === 0) return { total: 0, hits: [] };
    const docFilter = docFilterSql(filter, "c.doc_id");
    const placeholders = scope.map(() => "?").join(",");
    const deadlineSql = deadlineAt !== void 0 ? " AND knowledge_before_deadline(?, c.chunk_id)" : "";
    const scopeSql = `c.base_id IN (${placeholders})${docFilter?.sql ?? ""}${deadlineSql}`;
    const params = [...scope, ...docFilter?.params ?? [], ...deadlineAt !== void 0 ? [deadlineAt] : []];
    const total = this.db.prepare(`SELECT COUNT(*) AS c FROM chunk c WHERE ${scopeSql}`).get(...params).c;
    if (total === 0) return { total: 0, hits: [] };
    const shortTerms = extractShortTerms(query);
    const likeFilters = shortTerms.map(() => `(c.search_text LIKE ? ESCAPE '\\')`).join(" AND ");
    if (needsLikeFallback(query)) {
      const tokens = extractFtsTokens(query);
      if (tokens.length === 0) return { total, hits: [] };
      const filters = tokens.map(() => `(c.search_text LIKE ? ESCAPE '\\' OR c.context LIKE ? ESCAPE '\\')`).join(" AND ");
      const sql = `
        SELECT ${_ChunkDatabase.SELECT_COLUMNS}, search_text FROM chunk c
        WHERE ${scopeSql} AND ${filters}
        ORDER BY length(c.search_text) ASC, c.chunk_id ASC
        LIMIT ?
      `;
      for (const token of tokens) {
        const pattern2 = toLikePattern(token);
        params.push(pattern2, pattern2);
      }
      params.push(limit);
      const rows2 = this.db.prepare(sql).all(...params);
      return {
        total,
        hits: rows2.map((row) => ({
          ...rowToChunk(row),
          score: 1024 / (1024 + Math.max(1, row.search_text.length))
        }))
      };
    }
    const matchTerms = extractMatchTerms(query);
    const matchQuery = matchTerms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR ");
    const baseSql = `
      SELECT ${_ChunkDatabase.SELECT_COLUMNS}, bm25(chunk_fts) AS fts_score
      FROM chunk_fts JOIN chunk c ON c.fts_rowid = chunk_fts.rowid
      WHERE ${scopeSql} AND chunk_fts MATCH ?
    `;
    const matchSql = likeFilters !== "" ? `${baseSql} AND ${likeFilters} ORDER BY fts_score ASC LIMIT ?` : `${baseSql} ORDER BY fts_score ASC LIMIT ?`;
    const relaxedSql = `${baseSql} ORDER BY fts_score ASC LIMIT ?`;
    params.push(matchQuery);
    const filteredParams = [...params];
    for (const term of shortTerms) filteredParams.push(toLikePattern(term));
    filteredParams.push(limit);
    let rows = this.db.prepare(matchSql).all(...filteredParams);
    if (rows.length === 0 && shortTerms.length > 0) {
      params.push(limit);
      rows = this.db.prepare(relaxedSql).all(...params);
    }
    const hits = rows.map((row) => ({ ...rowToChunk(row), score: normalizeBm252(-row.fts_score) }));
    return { total, hits };
  }
  async vector(embedding, baseIds, limit, filter, deadlineAt) {
    throwIfDeadlineExpired(deadlineAt);
    const scope = [...baseIds];
    if (scope.length === 0) return { total: 0, hits: [] };
    if (filter?.docIds !== void 0 && filter.docIds.length === 0) return { total: 0, hits: [] };
    const query = embedding.length > 0 ? Float32Array.from(embedding) : null;
    const allowed = filter?.docIds !== void 0 ? new Set(filter.docIds) : void 0;
    const excluded = new Set(filter?.excludeDocIds);
    const scored = [];
    let total = 0;
    let scanned = 0;
    for (const baseId of scope) {
      for (const entry of this.ensureVectorCache(baseId)) {
        if ((scanned++ & 255) === 0) throwIfDeadlineExpired(deadlineAt);
        if (allowed !== void 0 && !allowed.has(entry.docId) || excluded.has(entry.docId)) continue;
        total += 1;
        if (query === null || entry.vector.length !== query.length) continue;
        scored.push({ ...rowToChunk(entry.row), score: cosineFloat32(query, entry.vector) });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return { total, hits: scored.slice(0, limit) };
  }
  /** Lazy-load a base's vectors into the cache (SQL once, then in-memory).
   *  `PRAGMA data_version` changes when ANOTHER connection commits to this
   *  file, so a second DSH process (or a second store instance) that deletes or
   *  re-embeds chunks cannot leave this lane serving vectors for rows that are
   *  gone — the "resurrect a deleted document" failure. Own writes do not bump
   *  it, which is why the local write paths still update the cache in place. */
  ensureVectorCache(baseId) {
    const dataVersion = this.readPragmaInt("data_version");
    const cached = this.vectorCache.get(baseId);
    if (cached !== void 0 && this.vectorCacheDataVersion.get(baseId) === dataVersion) return cached;
    const rows = this.db.prepare(
      `SELECT ${_ChunkDatabase.SELECT_COLUMNS} FROM chunk WHERE base_id = ? AND embedding IS NOT NULL`
    ).all(baseId);
    const entries = rows.map((row) => {
      const vector = decodeEmbeddingFloat32(row.embedding);
      return vector !== void 0 ? { id: row.chunk_id, docId: row.doc_id, vector, row } : void 0;
    }).filter((entry) => entry !== void 0);
    this.vectorCache.set(baseId, entries);
    this.vectorCacheDataVersion.set(baseId, dataVersion);
    return entries;
  }
  /** Rebuild one base's cache entry for a chunk after a write. */
  upsertVectorCache(chunk) {
    const list = this.vectorCache.get(chunk.baseId);
    if (list === void 0) return;
    const index = list.findIndex((entry2) => entry2.id === chunk.id);
    if (chunk.embedding === void 0) {
      if (index >= 0) list.splice(index, 1);
      return;
    }
    const entry = { id: chunk.id, docId: chunk.docId, vector: Float32Array.from(chunk.embedding), row: toChunkRow(chunk) };
    if (index >= 0) list[index] = entry;
    else list.push(entry);
  }
  /** Drop a document's cached vectors (delete path). */
  dropVectorCacheByDoc(docId) {
    for (const list of this.vectorCache.values()) {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (list[i].docId === docId) list.splice(i, 1);
      }
    }
  }
  close() {
    this.db.close();
  }
};
function rowToChunk(row) {
  const sourceSpans = decodeSourceSpans(row.source_spans, row.text.length, row.processing_revision);
  const chunk = {
    id: row.chunk_id,
    docId: row.doc_id,
    baseId: row.base_id,
    index: row.idx,
    text: row.text,
    ...row.heading !== null ? { heading: row.heading } : {},
    ...row.context !== null ? { context: row.context } : {},
    ...sourceSpans !== void 0 ? { sourceSpans } : {},
    ...row.processing_revision != null ? { processingRevision: row.processing_revision } : {}
  };
  const embedding = decodeEmbedding(row.embedding);
  return {
    ...chunk,
    ...embedding !== void 0 ? { embedding } : {},
    ...row.embedding_model !== null ? { embeddingModel: row.embedding_model } : {}
  };
}
function decodeSourceSpans(json, length, revision) {
  if (json == null) return void 0;
  const value = JSON.parse(json);
  if (!Array.isArray(value) || !value.every((span) => validSourceSpan(span) && span.chunkEnd <= length && (revision == null || span.revision === revision))) throw new Error("invalid persisted source spans");
  return value;
}
function searchTextOf(chunk) {
  return chunk.context !== void 0 && chunk.context.length > 0 ? `${chunk.context}
${chunk.text}` : chunk.text;
}
function normalizeBm252(raw) {
  return raw / (raw + 1);
}
async function migrateLegacyChunkFile(jsonPath, db, log) {
  let raw;
  try {
    raw = await readFile7(jsonPath, "utf8");
  } catch {
    return 0;
  }
  let document;
  try {
    document = JSON.parse(raw);
  } catch (error) {
    log(`dsh-knowledge: legacy chunk file is not valid JSON, skipping migration: ${error instanceof Error ? error.message : String(error)}`);
    return 0;
  }
  const chunks = document.tables?.chunks;
  if (typeof chunks !== "object" || chunks === null || Array.isArray(chunks)) return 0;
  const byDoc = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(chunks)) {
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      byDoc.set(key, [...byDoc.get(key) ?? [], ...value]);
    } else if (typeof value === "object" && value !== null) {
      const chunk = value;
      const list = byDoc.get(chunk.docId) ?? [];
      list.push(chunk);
      byDoc.set(chunk.docId, list);
    }
  }
  const alreadyStored = db.docIdsWithChunks();
  let migrated = 0;
  for (const [docId, list] of byDoc) {
    if (alreadyStored.has(docId)) continue;
    const byId = /* @__PURE__ */ new Map();
    for (const chunk of list) byId.set(chunk.id, chunk);
    db.putChunks([...byId.values()].sort((a, b) => a.index - b.index));
    migrated += 1;
  }
  if (migrated > 0) log(`dsh-knowledge: migrated ${migrated} documents' chunks to the SQLite store`);
  return migrated;
}

// src/knowledge/store.ts
import { mkdir as mkdir8, readFile as readFile8, readdir as readdir7, rm as rm5, writeFile as writeFile6 } from "node:fs/promises";
import { dirname as dirname8, join as join11, relative as relative3 } from "node:path";

// src/knowledge/domain.ts
import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
var baseConfigSchema = z.object({
  embeddingProvider: z.enum(["openai", "ollama", "local", "none"]).optional(),
  embeddingBaseUrl: z.string().optional(),
  embeddingModel: z.string().optional(),
  embeddingApiKey: z.string().optional(),
  rerankModel: z.string().optional(),
  rerankBaseUrl: z.string().optional(),
  rerankApiKey: z.string().optional(),
  localRerankTimeoutMs: z.number().int().gte(1e4).lte(3e5).optional(),
  smartChunk: z.boolean().optional(),
  chunkSeparator: z.string().optional(),
  chunkSize: z.number().int().gt(0).optional(),
  chunkOverlap: z.number().int().gte(0).optional(),
  topK: z.number().int().gt(0).optional(),
  searchMode: z.enum(["auto", "hybrid", "vector", "lexical"]).optional(),
  similarityThreshold: z.number().gte(0).lte(1).optional(),
  mmrDiversity: z.number().gte(0).lte(1).optional(),
  rrfVectorWeight: z.number().gte(0.1).lte(5).optional(),
  embeddingBatchSize: z.number().int().gt(0).optional(),
  siblingChunks: z.number().int().gte(0).lte(3).optional(),
  // Mirrors BaseConfig: every base-settable field must survive the durable
  // boundary — a missing key here makes zod strip the override on save.
  documentProcessorProvider: z.enum(["builtin", "mineru", "mineru-local"]).optional(),
  mineruApiKey: z.string().optional(),
  mineruApiHost: z.string().optional(),
  mineruLocalUrl: z.string().optional(),
  mineruLocalApiKey: z.string().optional(),
  mineruTier: z.enum(["flash", "basic", "standard", "advanced"]).optional(),
  documentProcessingTimeoutMs: z.number().int().gte(1e4).lte(72e5).optional(),
  structuredChunking: z.boolean().optional(),
  semanticChunk: z.boolean().optional(),
  semanticChunkThreshold: z.number().gte(0).lte(1).optional(),
  chunkTokenLimit: z.number().int().gte(0).optional(),
  conflictStrategy: z.enum(["keep", "replace", "rename"]).optional(),
  urlRefreshHours: z.number().int().gte(0).optional(),
  imageCaptionProvider: z.enum(["off", "openai", "ollama"]).optional(),
  imageCaptionModel: z.string().optional(),
  imageCaptionBaseUrl: z.string().optional(),
  imageCaptionApiKey: z.string().optional(),
  /** Auto-retrieve seat cap per base (0–5, 0 = excluded). */
  autoRetrieveWeight: z.number().int().gte(0).lte(5).optional(),
  /** Re-run interrupted imports (re-embedding the missing batches) on startup; off = mark them failed instead (Cherry's posture). */
  resumeInterruptedOnStartup: z.boolean().optional(),
  /** Proactive auto-retrieval on every user message. */
  autoRetrieve: z.boolean().optional(),
  injectUsagePrompt: z.boolean().optional()
});
var baseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  group: z.string().optional(),
  config: baseConfigSchema.optional(),
  createdAt: z.number(),
  updatedAt: z.number()
});
var documentProcessingInfoSchema = z.object({
  revision: z.string().min(1),
  artifactId: z.string().min(1),
  sourceHash: z.string(),
  provider: z.enum(["builtin", "mineru", "mineru-local"]),
  processorVersion: z.string().optional(),
  optionsFingerprint: z.string(),
  parsedAt: z.number(),
  completeness: z.enum(["complete", "partial", "unknown"]),
  pageCount: z.number().int().gte(0).optional(),
  processedPages: z.array(z.number().int().gte(0)).optional(),
  warnings: z.array(z.object({ code: z.string(), message: z.string() })),
  reused: z.boolean().optional()
});
var documentSchema = z.object({
  id: z.string(),
  baseId: z.string(),
  title: z.string(),
  sourceType: z.enum(["text", "file", "url", "directory"]),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  url: z.string().optional(),
  parentDirectoryId: z.string().optional(),
  /** Absolute path of the source directory this container was imported from
   *  (Cherry's pathStorage): reindexing the container rescans the path and
   *  picks up new/removed files. Absent on legacy/created containers. */
  sourcePath: z.string().optional(),
  contentHash: z.string().optional(),
  rawFilePath: z.string().optional(),
  rawText: z.string().optional(),
  processing: documentProcessingInfoSchema.optional(),
  charCount: z.number().int().gte(0),
  tokenCount: z.number().int().gte(0).optional(),
  chunkCount: z.number().int().gte(0),
  incomplete: z.boolean().optional(),
  embeddingError: z.string().optional(),
  errorCode: z.enum(["interrupted", "dimension_mismatch", "parse_failed", "embedding_provider"]).optional(),
  createdAt: z.number(),
  updatedAt: z.number().optional()
});
var configOverridesSchema = z.object({
  embeddingProvider: z.enum(["openai", "ollama", "local", "none"]).optional(),
  embeddingBaseUrl: z.string().optional(),
  embeddingModel: z.string().optional(),
  embeddingApiKey: z.string().optional(),
  rerankModel: z.string().optional(),
  rerankBaseUrl: z.string().optional(),
  rerankApiKey: z.string().optional(),
  localRerankTimeoutMs: z.number().int().gte(1e4).lte(3e5).optional(),
  smartChunk: z.boolean().optional(),
  chunkSeparator: z.string().optional(),
  chunkSize: z.number().int().gt(0).optional(),
  chunkOverlap: z.number().int().gte(0).optional(),
  topK: z.number().int().gt(0).optional(),
  searchMode: z.enum(["auto", "hybrid", "vector", "lexical"]).optional(),
  similarityThreshold: z.number().gte(0).lte(1).optional(),
  mmrDiversity: z.number().gte(0).lte(1).optional(),
  rrfVectorWeight: z.number().gte(0.1).lte(5).optional(),
  embeddingBatchSize: z.number().int().gt(0).optional(),
  siblingChunks: z.number().int().gte(0).lte(3).optional(),
  hfEndpoint: z.string().optional(),
  mineruPythonIndexUrl: z.string().optional(),
  documentProcessorProvider: z.enum(["builtin", "mineru", "mineru-local"]).optional(),
  mineruApiKey: z.string().optional(),
  mineruApiHost: z.string().optional(),
  mineruLocalUrl: z.string().optional(),
  mineruLocalApiKey: z.string().optional(),
  mineruTier: z.enum(["flash", "basic", "standard", "advanced"]).optional(),
  documentProcessingTimeoutMs: z.number().int().gte(1e4).lte(72e5).optional(),
  structuredChunking: z.boolean().optional(),
  semanticChunk: z.boolean().optional(),
  semanticChunkThreshold: z.number().gte(0).lte(1).optional(),
  chunkTokenLimit: z.number().int().gte(0).optional(),
  conflictStrategy: z.enum(["keep", "replace", "rename"]).optional(),
  urlRefreshHours: z.number().int().gte(0).optional(),
  imageCaptionProvider: z.enum(["off", "openai", "ollama"]).optional(),
  imageCaptionModel: z.string().optional(),
  imageCaptionBaseUrl: z.string().optional(),
  imageCaptionApiKey: z.string().optional(),
  resumeInterruptedOnStartup: z.boolean().optional(),
  autoRetrieve: z.boolean().optional(),
  injectUsagePrompt: z.boolean().optional(),
  autoRetrieveWeight: z.number().int().gte(0).lte(5).optional(),
  localModelCacheDir: z.string().optional(),
  localWorkerIdleTimeoutMs: z.number().int().gte(0).optional()
});
var knowledgeDomainSpec = defineDomain({
  name: "knowledge",
  version: 0,
  global: {
    schema: z.object({
      overrides: configOverridesSchema,
      groups: z.array(z.string()).optional(),
      enabled: z.boolean().optional(),
      enabledBaseIds: z.array(z.string()).optional(),
      /** Workspace directory paths allowed to invoke the knowledge base.
       *  Empty array = no workspace is allowed (fail closed). A single `"*"`
       *  entry means every workspace. Unlike `enabledBaseIds` (empty = all
       *  bases), emptiness here is the closed state, so "turn it off
       *  everywhere" stays expressible. */
      workspacePaths: z.array(z.string()).optional()
    }),
    initial: { overrides: {}, enabled: true, enabledBaseIds: [], workspacePaths: [] }
  },
  tables: {
    bases: domainTable(baseSchema),
    documents: domainTable(documentSchema)
  }
});
var TABLES = {
  bases: "bases",
  documents: "documents",
  chunks: "chunks"
};

// src/knowledge/metadata-write.ts
var RETRY_DELAYS_MS = [20, 50, 100, 200, 400];
var TRANSIENT_CODES = /* @__PURE__ */ new Set(["EPERM", "EBUSY", "EACCES"]);
var IO_CODES = /* @__PURE__ */ new Set([...TRANSIENT_CODES, "EIO", "ENOSPC", "EROFS", "EDQUOT", "EMFILE", "ENFILE"]);
var MetadataWriteError = class extends Error {
  constructor(cause) {
    super(`knowledge metadata write failed; previous metadata retained: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    this.name = "MetadataWriteError";
  }
};
function isMetadataWriteFailure(error) {
  return causes(error).some((value) => value instanceof MetadataWriteError);
}
function causes(error) {
  const seen = /* @__PURE__ */ new Set();
  while (typeof error === "object" && error !== null && !seen.has(error)) {
    seen.add(error);
    error = error.cause;
  }
  return [...seen];
}
var MetadataWriter = class {
  chain = Promise.resolve();
  run(operation) {
    const next = this.chain.then(async () => {
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await operation();
        } catch (error) {
          const code = causes(error).map((value) => value.code).find((value) => value !== void 0 && IO_CODES.has(value));
          if (code === void 0) throw error;
          if (!TRANSIENT_CODES.has(code) || attempt >= RETRY_DELAYS_MS.length) throw new MetadataWriteError(error);
          await new Promise((resolve7) => setTimeout(resolve7, RETRY_DELAYS_MS[attempt]));
        }
      }
    });
    this.chain = next.then(() => {
    }, () => {
    });
    return next;
  }
  drain() {
    return this.chain;
  }
};

// src/knowledge/store.ts
var RawFileStorage = class {
  constructor(root) {
    this.root = root;
  }
  pathOf(relativePath) {
    const resolved = join11(this.root, relativePath);
    const rel = relativePath.replace(/\\/g, "/");
    if (rel === ".." || rel.startsWith("../") || rel.includes("/../") || resolved.startsWith(this.root) === false) {
      throw new Error(`unsafe raw file path: ${relativePath}`);
    }
    return resolved;
  }
  async write(baseId, docId, ext, bytes) {
    const relativePath = `${baseId}/${docId}${ext}`;
    const full = this.pathOf(relativePath);
    await mkdir8(dirname8(full), { recursive: true });
    await writeFile6(full, bytes);
    return relativePath;
  }
  async writeRel(baseId, relativePath, bytes) {
    const full = this.pathOf(`${baseId}/${relativePath.replace(/\\/g, "/")}`);
    await mkdir8(dirname8(full), { recursive: true });
    await writeFile6(full, bytes);
    return `${baseId}/${relativePath.replace(/\\/g, "/")}`;
  }
  async read(relativePath) {
    try {
      return await readFile8(this.pathOf(relativePath));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  async listAll() {
    const out = [];
    const walk = async (dir) => {
      let entries;
      try {
        entries = await readdir7(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = join11(dir, entry.name);
        if (entry.isDirectory()) await walk(full);
        else out.push(relative3(this.root, full).replace(/\\/g, "/"));
      }
    };
    await walk(this.root);
    return out;
  }
  async delete(relativePath) {
    await rm5(this.pathOf(relativePath), { force: true });
  }
  async deleteBase(baseId) {
    await rm5(this.pathOf(baseId), { recursive: true, force: true });
  }
};
var StorageUnavailableError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "StorageUnavailableError";
  }
};
var DocumentGenerationCommitError = class extends Error {
  published = true;
  constructor(options) {
    super("document generation published; metadata recovery is pending", options);
    this.name = "DocumentGenerationCommitError";
  }
};
async function openStore(facility, options) {
  if (facility === void 0) return new MemoryStore();
  const domain = await facility.open(knowledgeDomainSpec);
  let chunkDb;
  try {
    const chunkStorePath = resolveChunkStorePath(options?.chunkStorePath);
    chunkDb = new ChunkDatabase(chunkStorePath);
    await migrateLegacyChunkFile(options?.legacyJsonPath ?? legacyChunkFilePath(), chunkDb, (message) => console.warn(message));
    const raw = new RawFileStorage(join11(dirname8(chunkStorePath), "knowledge-raw"));
    const store = new DomainStore(domain, chunkDb, raw);
    try {
      await store.recoverDocumentGenerations();
      const recovery = await store.recoverInterruptedImports(Date.now());
      if (recovery.removed > 0) console.warn(`dsh-knowledge: removed ${recovery.removed} incomplete import(s) left by an interrupted run`);
      await store.reconcileChunkCounts();
      const orphaned = await store.reconcileOrphanRaws();
      if (orphaned > 0) console.warn(`dsh-knowledge: removed ${orphaned} orphaned raw source file(s) no document referenced`);
      const orphanChunks = await store.reconcileOrphanChunks();
      if (orphanChunks > 0) console.warn(`dsh-knowledge: removed chunks left by ${orphanChunks} deleted document(s)`);
    } catch (error) {
      if (!isMetadataWriteFailure(error)) throw error;
      console.warn(`dsh-knowledge: startup metadata repair deferred: ${error instanceof Error ? error.message : String(error)}`);
    }
    return store;
  } catch (error) {
    try {
      chunkDb?.close();
    } catch {
    }
    await domain.close().catch(() => {
    });
    throw new StorageUnavailableError(
      `knowledge storage could not be opened: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}
var DomainStore = class {
  constructor(domain, chunkDb, rawStore) {
    this.domain = domain;
    this.chunkDb = chunkDb;
    this.rawStore = rawStore;
  }
  metadata = new MetadataWriter();
  documentWriteChain = Promise.resolve();
  get bases() {
    return this.domain.table(TABLES.bases);
  }
  get documents() {
    return this.domain.table(TABLES.documents);
  }
  listBases() {
    return [...this.bases.entries()].map(([, value]) => value);
  }
  getBase(id) {
    return this.bases.get(id);
  }
  putBase(base) {
    return this.metadata.run(() => this.bases.put(base.id, base));
  }
  deleteBase(id) {
    return this.writeDocuments(async () => {
      await this.metadata.run(() => this.bases.delete(id));
      for (const [, doc] of this.documents.entries()) {
        if (doc.baseId === id) this.chunkDb.discardDocumentGenerations(doc.id);
      }
    });
  }
  listDocuments(baseId) {
    const pending = new Map(this.chunkDb.pendingDocumentGenerations().map((item) => [item.document.id, item]));
    return [...this.documents.entries()].map(([, value]) => {
      const next = pending.get(value.id);
      return next !== void 0 && next.previousCreatedAt === value.createdAt && next.document.baseId === value.baseId ? next.document : value;
    }).filter((doc) => doc.baseId === baseId);
  }
  getDocument(id) {
    const current = this.documents.get(id);
    if (current === void 0) return void 0;
    const pending = this.chunkDb.pendingDocumentGeneration(id);
    return pending !== void 0 && pending.previousCreatedAt === current.createdAt && pending.document.baseId === current.baseId ? pending.document : current;
  }
  putDocument(doc) {
    return this.writeDocuments(async () => {
      const pending = this.chunkDb.pendingDocumentGeneration(doc.id);
      if (pending !== void 0 && doc.processing?.revision !== pending.document.processing?.revision) {
        throw new Error("stale_document_generation");
      }
      await this.metadata.run(() => this.documents.put(doc.id, doc));
      if (pending !== void 0) this.chunkDb.acknowledgeDocumentGeneration(doc.id);
    });
  }
  deleteDocument(id) {
    return this.writeDocuments(async () => {
      await this.metadata.run(() => this.documents.delete(id));
      this.chunkDb.discardDocumentGenerations(id);
    });
  }
  writeDocuments(operation) {
    const next = this.documentWriteChain.then(operation);
    this.documentWriteChain = next.then(() => {
    }, () => {
    });
    return next;
  }
  stageDocumentGeneration(doc, chunks) {
    return this.writeDocuments(async () => {
      const current = this.documents.get(doc.id);
      if (current === void 0 || current.baseId !== doc.baseId || current.createdAt !== doc.createdAt || this.getBase(doc.baseId) === void 0) {
        throw new Error("document_generation_target_missing");
      }
      this.chunkDb.stageDocumentGeneration(doc, chunks);
    });
  }
  getStagedDocumentGeneration(docId) {
    const current = this.getDocument(docId);
    if (current === void 0 || this.getBase(current.baseId) === void 0) return void 0;
    const staged = this.chunkDb.getStagedDocumentGeneration(docId);
    return staged?.document.createdAt === current.createdAt && staged.document.baseId === current.baseId ? staged : void 0;
  }
  discardStagedDocumentGeneration(docId) {
    return this.writeDocuments(async () => {
      this.chunkDb.discardStagedDocumentGeneration(docId);
    });
  }
  commitDocumentGeneration(doc, chunks) {
    return this.writeDocuments(async () => {
      const current = this.documents.get(doc.id);
      if (current === void 0 || current.baseId !== doc.baseId || current.createdAt !== doc.createdAt || this.getBase(doc.baseId) === void 0) {
        throw new Error("document_generation_target_missing");
      }
      this.chunkDb.stageDocumentGeneration(doc, chunks);
      this.chunkDb.publishDocumentGeneration(doc, chunks, current.createdAt);
      try {
        await this.metadata.run(() => this.documents.put(doc.id, doc));
        this.chunkDb.acknowledgeDocumentGeneration(doc.id);
      } catch (error) {
        throw new DocumentGenerationCommitError({ cause: error });
      }
    });
  }
  recoverDocumentGenerations() {
    return this.writeDocuments(async () => {
      let recovered = 0;
      for (const pending of this.chunkDb.pendingDocumentGenerations()) {
        const doc = pending.document;
        const current = this.documents.get(doc.id);
        if (current === void 0 || this.getBase(doc.baseId) === void 0) {
          await this.chunkDb.deleteChunks(doc.id, doc.baseId);
          this.chunkDb.discardDocumentGenerations(doc.id);
          continue;
        }
        if (current.baseId !== doc.baseId || current.createdAt !== pending.previousCreatedAt) {
          this.chunkDb.discardPublishedGeneration(doc);
          continue;
        }
        await this.metadata.run(() => this.documents.put(doc.id, doc));
        this.chunkDb.acknowledgeDocumentGeneration(doc.id);
        recovered += 1;
      }
      for (const staged of this.chunkDb.stagedDocumentHeaders()) {
        const current = this.documents.get(staged.id);
        if (current === void 0 || this.getBase(staged.baseId) === void 0 || current.baseId !== staged.baseId || current.createdAt !== staged.createdAt) this.chunkDb.discardDocumentGenerations(staged.id);
      }
      return recovered;
    });
  }
  listChunks(baseId) {
    return this.chunkDb.listChunks(baseId);
  }
  getChunk(id) {
    return this.chunkDb.getChunk(id);
  }
  listChunksByDoc(docId, limit, offset) {
    return this.chunkDb.listChunksByDoc(docId, limit, offset);
  }
  listChunksByIndexRange(docId, fromIdx, toIdx) {
    return this.chunkDb.listChunksByIndexRange(docId, fromIdx, toIdx);
  }
  listChunksByIndexRanges(ranges) {
    return this.chunkDb.listChunksByIndexRanges(ranges);
  }
  async putChunks(chunks) {
    this.chunkDb.putChunks(chunks);
  }
  async putChunkBatch(chunks) {
    this.chunkDb.putChunkBatch(chunks);
  }
  async deleteChunks(docId, baseId) {
    await this.chunkDb.deleteChunks(docId, baseId);
  }
  async deleteChunksByBase(baseId) {
    await this.chunkDb.deleteChunksByBase(baseId);
  }
  listEmbeddingVectorsByHashes(hashes, embeddingModel) {
    return this.chunkDb.listEmbeddingVectorsByHashes(hashes, embeddingModel);
  }
  chunkCountsByDoc(baseIds) {
    return this.chunkDb.chunkCountsByDoc(baseIds);
  }
  async recoverInterruptedImports(startedAt) {
    const withChunks = /* @__PURE__ */ new Set();
    for (const base of this.listBases()) {
      for (const docId of this.chunkDb.docChunkStatus(base.id).withChunks) withChunks.add(docId);
    }
    let removed = 0;
    const resume = [];
    for (const [id, doc] of [...this.documents.entries()]) {
      const pending = this.chunkDb.pendingDocumentGeneration(id);
      if (pending !== void 0 && pending.previousCreatedAt === doc.createdAt && pending.document.baseId === doc.baseId) continue;
      if (doc.sourceType === "directory") continue;
      if (doc.errorCode === "parse_failed") continue;
      if (doc.incomplete === true) {
        if (doc.rawText !== void 0 || doc.rawFilePath !== void 0) resume.push(id);
        continue;
      }
      if (withChunks.has(id)) {
        continue;
      }
      if (doc.rawText !== void 0 || doc.rawFilePath !== void 0) {
        if ((doc.updatedAt ?? doc.createdAt) < startedAt) resume.push(id);
        continue;
      }
      if ((doc.updatedAt ?? doc.createdAt) >= startedAt) continue;
      await this.chunkDb.deleteChunks(id);
      await this.metadata.run(() => this.documents.delete(id));
      removed += 1;
    }
    return { removed, resume };
  }
  /**
   * Write back the actual chunk count onto document records whose `chunkCount`
   * drifted from the chunk store (historical stale metadata). Also the first
   * domain write after a legacy-format upgrade, which trims the JSON unit file.
   */
  async reconcileChunkCounts() {
    const actual = this.chunkCountsByDoc(this.listBases().map((base) => base.id));
    for (const [id, doc] of [...this.documents.entries()]) {
      if ((doc.chunkCount ?? 0) !== (actual.get(id) ?? 0)) {
        await this.metadata.run(() => this.documents.put(id, { ...doc, chunkCount: actual.get(id) ?? 0 }));
      }
    }
  }
  docChunkStatus(baseId) {
    return this.chunkDb.docChunkStatus(baseId);
  }
  async reconcileOrphanRaws() {
    const referenced = /* @__PURE__ */ new Set();
    for (const base of this.listBases()) {
      for (const doc of this.listDocuments(base.id)) {
        if (doc.rawFilePath !== void 0) referenced.add(doc.rawFilePath);
        const staged = this.getStagedDocumentGeneration(doc.id);
        if (staged?.document.rawFilePath !== void 0) referenced.add(staged.document.rawFilePath);
      }
    }
    let removed = 0;
    for (const rel of await this.rawStore.listAll()) {
      if (!referenced.has(rel)) {
        await this.rawStore.delete(rel);
        removed += 1;
      }
    }
    return removed;
  }
  chunkStats(baseIds) {
    return this.chunkDb.chunkStats(baseIds);
  }
  async reconcileOrphanChunks() {
    const known = /* @__PURE__ */ new Set();
    for (const base of this.listBases()) {
      for (const doc of this.listDocuments(base.id)) known.add(doc.id);
    }
    let removed = 0;
    for (const docId of this.chunkDb.docIdsWithChunks()) {
      if (known.has(docId)) continue;
      await this.chunkDb.deleteChunks(docId);
      removed += 1;
    }
    return removed;
  }
  get retrievalLane() {
    return this.chunkDb;
  }
  get raw() {
    return this.rawStore;
  }
  reclaimSpace() {
    return this.chunkDb.reclaimSpace();
  }
  getConfigOverrides() {
    return this.readGlobal().overrides;
  }
  async setConfigOverrides(overrides) {
    await this.writeGlobal({ overrides });
  }
  getGroups() {
    return this.readGlobal().groups;
  }
  async setGroups(groups2) {
    await this.writeGlobal({ groups: groups2 });
  }
  getEnabled() {
    return this.readGlobal().enabled;
  }
  async setEnabled(enabled) {
    await this.writeGlobal({ enabled });
  }
  getEnabledBaseIds() {
    return this.readGlobal().enabledBaseIds;
  }
  async setEnabledBaseIds(ids) {
    await this.writeGlobal({ enabledBaseIds: ids });
  }
  getWorkspacePaths() {
    return [...this.readGlobal().workspacePaths];
  }
  async setWorkspacePaths(paths) {
    await this.writeGlobal({ workspacePaths: [...paths] });
  }
  readGlobal() {
    const global = this.domain.global.get();
    return {
      overrides: global.overrides ?? {},
      groups: global.groups ?? [],
      enabled: global.enabled ?? true,
      enabledBaseIds: global.enabledBaseIds ?? [],
      workspacePaths: global.workspacePaths ?? []
    };
  }
  /** Serialize read-modify-write over the single global slot. `global.set`
   *  overwrites the record, so two concurrent settings writes both read
   *  revision n and the later one drops the earlier field (a freshly selected
   *  base list disappearing because another request wrote the previous list back
   *  with its own patch). */
  globalWriteChain = Promise.resolve();
  writeGlobal(patch) {
    const next = this.globalWriteChain.then(async () => {
      const current = this.readGlobal();
      const next2 = { ...current, ...patch, overrides: { ...current.overrides, ...patch.overrides } };
      await this.metadata.run(() => this.domain.global.set(next2));
    });
    this.globalWriteChain = next.catch(() => {
    });
    return next;
  }
  async close() {
    await this.documentWriteChain;
    await this.globalWriteChain;
    await this.metadata.drain();
    this.chunkDb.close();
    await this.domain.close();
  }
};
var MemoryStore = class {
  bases = /* @__PURE__ */ new Map();
  documents = /* @__PURE__ */ new Map();
  chunks = /* @__PURE__ */ new Map();
  staged = /* @__PURE__ */ new Map();
  overrides = {};
  groups = [];
  enabled = true;
  enabledBaseIds = [];
  workspacePaths = [];
  listBases() {
    return [...this.bases.values()];
  }
  getBase(id) {
    return this.bases.get(id);
  }
  async putBase(base) {
    this.bases.set(base.id, base);
  }
  async deleteBase(id) {
    this.bases.delete(id);
    for (const [docId, generation] of this.staged) if (generation.document.baseId === id) this.staged.delete(docId);
  }
  listDocuments(baseId) {
    return [...this.documents.values()].filter((doc) => doc.baseId === baseId);
  }
  getDocument(id) {
    return this.documents.get(id);
  }
  async putDocument(doc) {
    this.documents.set(doc.id, doc);
  }
  async deleteDocument(id) {
    this.documents.delete(id);
    this.staged.delete(id);
  }
  async stageDocumentGeneration(doc, chunks) {
    this.assertGenerationTarget(doc);
    validateDocumentGeneration(doc, chunks);
    const previous = this.staged.get(doc.id);
    const same = previous?.document.processing?.revision === doc.processing?.revision && (doc.processing !== void 0 || previous?.document.updatedAt === doc.updatedAt);
    const byId = new Map((same ? previous?.chunks ?? [] : []).map((chunk) => [chunk.id, chunk]));
    for (const chunk of chunks) byId.set(chunk.id, chunk);
    this.staged.set(doc.id, { document: doc, chunks: [...byId.values()].sort((a, b) => a.index - b.index) });
  }
  getStagedDocumentGeneration(docId) {
    const doc = this.documents.get(docId);
    return doc !== void 0 && this.bases.has(doc.baseId) ? this.staged.get(docId) : void 0;
  }
  async commitDocumentGeneration(doc, chunks) {
    this.assertGenerationTarget(doc);
    validateDocumentGeneration(doc, chunks);
    if (doc.chunkCount !== chunks.length) throw new Error("document generation chunk count mismatch");
    for (const [id, chunk] of this.chunks) if (chunk.docId === doc.id && chunk.baseId === doc.baseId) this.chunks.delete(id);
    for (const chunk of chunks) this.chunks.set(chunk.id, chunk);
    this.documents.set(doc.id, doc);
    this.staged.delete(doc.id);
  }
  assertGenerationTarget(doc) {
    const current = this.documents.get(doc.id);
    if (current === void 0 || current.baseId !== doc.baseId || current.createdAt !== doc.createdAt || !this.bases.has(doc.baseId)) {
      throw new Error("document_generation_target_missing");
    }
  }
  async recoverDocumentGenerations() {
    return 0;
  }
  async discardStagedDocumentGeneration(docId) {
    this.staged.delete(docId);
  }
  listChunks(baseId) {
    return [...this.chunks.values()].filter((chunk) => chunk.baseId === baseId);
  }
  getChunk(id) {
    return this.chunks.get(id);
  }
  listChunksByDoc(docId, limit, offset) {
    const chunks = [...this.chunks.values()].filter((chunk) => chunk.docId === docId).sort((a, b) => a.index - b.index);
    const start = offset ?? 0;
    const count = limit ?? chunks.length;
    return chunks.slice(start, start + count);
  }
  listChunksByIndexRange(docId, fromIdx, toIdx) {
    return [...this.chunks.values()].filter((chunk) => chunk.docId === docId && chunk.index >= fromIdx && chunk.index <= toIdx).sort((a, b) => a.index - b.index);
  }
  listChunksByIndexRanges(ranges) {
    const seen = /* @__PURE__ */ new Set();
    const chunks = [];
    for (const range of ranges) {
      for (const chunk of this.listChunksByIndexRange(range.docId, range.fromIdx, range.toIdx)) {
        if (seen.has(chunk.id)) continue;
        seen.add(chunk.id);
        chunks.push(chunk);
      }
    }
    return chunks.sort((a, b) => a.docId.localeCompare(b.docId) || a.index - b.index);
  }
  async putChunks(chunks) {
    const docId = chunks.length > 0 ? chunks[0].docId : void 0;
    if (docId !== void 0) await this.deleteChunks(docId);
    for (const chunk of chunks) this.chunks.set(chunk.id, chunk);
  }
  async putChunkBatch(chunks) {
    for (const chunk of chunks) this.chunks.set(chunk.id, chunk);
  }
  async deleteChunks(docId, baseId) {
    for (const [id, chunk] of this.chunks) {
      if (chunk.docId === docId && (baseId === void 0 || chunk.baseId === baseId)) this.chunks.delete(id);
    }
  }
  async deleteChunksByBase(baseId) {
    for (const [id, chunk] of this.chunks) {
      if (chunk.baseId === baseId) this.chunks.delete(id);
    }
  }
  listEmbeddingVectorsByHashes(hashes, embeddingModel) {
    const wanted = new Set(hashes);
    const vectors = /* @__PURE__ */ new Map();
    for (const chunk of [...this.chunks.values(), ...[...this.staged.values()].flatMap((item) => item.chunks)]) {
      if (chunk.embedding === void 0 || chunk.embeddingModel !== embeddingModel) continue;
      const hash2 = hashEmbeddingText(searchTextOf(chunk));
      if (wanted.has(hash2)) vectors.set(hash2, chunk.embedding);
    }
    return vectors;
  }
  chunkCountsByDoc(baseIds) {
    const scope = new Set(baseIds);
    const counts = /* @__PURE__ */ new Map();
    for (const chunk of this.chunks.values()) {
      if (!scope.has(chunk.baseId)) continue;
      counts.set(chunk.docId, (counts.get(chunk.docId) ?? 0) + 1);
    }
    return counts;
  }
  async recoverInterruptedImports(startedAt) {
    const withChunks = /* @__PURE__ */ new Set();
    for (const chunk of this.chunks.values()) withChunks.add(chunk.docId);
    let removed = 0;
    const resume = [];
    for (const [id, doc] of [...this.documents.entries()]) {
      if (doc.sourceType === "directory") continue;
      if (doc.errorCode === "parse_failed") continue;
      if (doc.incomplete === true) {
        if (doc.rawText !== void 0 || doc.rawFilePath !== void 0) resume.push(id);
        continue;
      }
      if (withChunks.has(id)) continue;
      if (doc.rawText !== void 0 || doc.rawFilePath !== void 0) {
        if ((doc.updatedAt ?? doc.createdAt) < startedAt) resume.push(id);
        continue;
      }
      if ((doc.updatedAt ?? doc.createdAt) >= startedAt) continue;
      this.documents.delete(id);
      removed += 1;
    }
    return { removed, resume };
  }
  async reconcileOrphanRaws() {
    return 0;
  }
  async reconcileOrphanChunks() {
    return 0;
  }
  docChunkStatus(baseId) {
    const withChunks = /* @__PURE__ */ new Set();
    const missingEmbedding = /* @__PURE__ */ new Set();
    for (const chunk of this.chunks.values()) {
      if (chunk.baseId !== baseId) continue;
      withChunks.add(chunk.docId);
      if (chunk.embedding === void 0) missingEmbedding.add(chunk.docId);
    }
    return { withChunks, missingEmbedding };
  }
  chunkStats(baseIds) {
    const scope = new Set(baseIds);
    const modelCounts = /* @__PURE__ */ new Map();
    let count = 0;
    let embedded = false;
    let dimensions;
    for (const chunk of this.chunks.values()) {
      if (!scope.has(chunk.baseId)) continue;
      count += 1;
      if (chunk.embedding === void 0) continue;
      embedded = true;
      if (dimensions === void 0) dimensions = chunk.embedding.length;
      if (chunk.embeddingModel !== void 0) {
        const key = `${chunk.baseId}\0${chunk.embeddingModel}`;
        modelCounts.set(key, (modelCounts.get(key) ?? 0) + 1);
      }
    }
    return {
      count,
      embedded,
      ...dimensions !== void 0 ? { dimensions } : {},
      embeddingModelCounts: [...modelCounts.entries()].map(([key, countValue]) => {
        const [baseId, model] = key.split("\0");
        return { baseId, model, count: countValue };
      })
    };
  }
  getConfigOverrides() {
    return { ...this.overrides };
  }
  async setConfigOverrides(overrides) {
    this.overrides = { ...this.overrides, ...overrides };
  }
  getGroups() {
    return [...this.groups];
  }
  async setGroups(groups2) {
    this.groups = [...groups2];
  }
  getEnabled() {
    return this.enabled;
  }
  async setEnabled(enabled) {
    this.enabled = enabled;
  }
  getEnabledBaseIds() {
    return [...this.enabledBaseIds];
  }
  async setEnabledBaseIds(ids) {
    this.enabledBaseIds = [...ids];
  }
  getWorkspacePaths() {
    return [...this.workspacePaths];
  }
  async setWorkspacePaths(paths) {
    this.workspacePaths = [...paths];
  }
  async close() {
  }
};

// src/knowledge/ollama.ts
init_net();
var ollamaPullStatus = /* @__PURE__ */ new Map();
var ollamaPullInFlight = /* @__PURE__ */ new Map();
var ollamaPullAborts = /* @__PURE__ */ new Map();
var PULL_TIMEOUT_MS = 6 * 60 * 6e4;
function getOllamaPullStatus(model) {
  return ollamaPullStatus.get(model) ?? { status: "idle", progress: 0, message: "" };
}
function ollamaBase(baseUrl) {
  return (baseUrl.trim() === "" ? "http://127.0.0.1:11434" : baseUrl.trim()).replace(/\/+$/, "");
}
async function listOllamaModels(baseUrl) {
  const response = await httpFetch(`${ollamaBase(baseUrl)}/api/tags`, { timeoutMs: 3e4 });
  if (!response.ok) throw new Error(`ollama tags failed: HTTP ${response.status}`);
  const json = await response.json();
  return (json.models ?? []).map((model) => ({
    name: model.name ?? "",
    ...typeof model.size === "number" && model.size > 0 ? { size: model.size } : {}
  })).filter((model) => model.name !== "");
}
async function deleteOllamaModel(model, baseUrl) {
  const response = await httpFetch(`${ollamaBase(baseUrl)}/api/delete`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model }),
    timeoutMs: 12e4
  });
  if (!response.ok) {
    throw new Error(`ollama delete failed: HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
}
async function pullOllamaModel(model, baseUrl) {
  const existing = ollamaPullInFlight.get(model);
  if (existing !== void 0) return existing;
  const run2 = (async () => {
    ollamaPullStatus.set(model, { status: "pulling", progress: 0, message: "" });
    const controller = new AbortController();
    ollamaPullAborts.set(model, controller);
    let timedOut = false;
    const watchdog = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, PULL_TIMEOUT_MS);
    try {
      const response = await fetch(`${ollamaBase(baseUrl)}/api/pull`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, stream: true }),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`ollama pull failed: HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
      }
      const decoder = new TextDecoder();
      let buffer = "";
      for await (const chunk of response.body) {
        buffer += decoder.decode(chunk, { stream: true });
        if (buffer.length > 1e6) buffer = buffer.slice(-65536);
        let newline = buffer.indexOf("\n");
        while (newline >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (line === "") {
            newline = buffer.indexOf("\n");
            continue;
          }
          try {
            const event = JSON.parse(line);
            if (event.status === "success" || event.status === "ready") {
              ollamaPullStatus.set(model, { status: "ready", progress: 100, message: "" });
            } else if (typeof event.total === "number" && event.total > 0) {
              const progress = Math.min(100, Math.round((event.completed ?? 0) / event.total * 100));
              ollamaPullStatus.set(model, { status: "pulling", progress, message: event.status ?? "" });
            } else if (event.status !== void 0) {
              ollamaPullStatus.set(model, { status: "pulling", progress: 0, message: event.status });
            }
          } catch {
          }
          newline = buffer.indexOf("\n");
        }
      }
      const current = ollamaPullStatus.get(model);
      if (current?.status !== "ready") {
        ollamaPullStatus.set(model, { status: "ready", progress: 100, message: "" });
      }
    } catch (error) {
      const aborted = controller.signal.aborted;
      ollamaPullStatus.set(model, {
        status: timedOut ? "error" : aborted ? "idle" : "error",
        progress: 0,
        message: timedOut ? "pull timed out" : aborted ? "" : error instanceof Error ? error.message : String(error)
      });
      if (aborted || timedOut) return;
      throw error;
    } finally {
      clearTimeout(watchdog);
      ollamaPullAborts.delete(model);
    }
  })();
  ollamaPullInFlight.set(model, run2);
  void run2.finally(() => {
    ollamaPullInFlight.delete(model);
  }).catch(() => {
  });
  return run2;
}
function cancelOllamaPull(model) {
  const controller = ollamaPullAborts.get(model);
  ollamaPullStatus.set(model, { status: "idle", progress: 0, message: "" });
  controller?.abort();
}
function activeOllamaPulls() {
  const pulls = [];
  for (const [model, status] of ollamaPullStatus) {
    if (status.status === "pulling") pulls.push({ model, ...status });
  }
  return pulls;
}

// src/knowledge/index.ts
init_embed();
function localEmbeddingErrorText(onDisk, detail) {
  if (onDisk) {
    return `local embedding model failed to load (${detail}); the model files are present but the runtime could not start \u2014 restart the service or retry later. If it persists, check the local model runtime install.`;
  }
  return `local embedding model is unavailable (${detail}); download it in Settings \u2192 Local Models, or switch the embedding provider`;
}
async function localEmbeddingError(config, error) {
  const detail = error instanceof Error ? error.message : String(error);
  const modelId = config.embeddingModel.trim() || DEFAULT_LOCAL_MODEL;
  const onDisk = await isLocalModelDownloaded(modelId).catch(() => false);
  return new Error(localEmbeddingErrorText(onDisk, detail));
}
var MODEL_SUGGESTIONS = {
  embedding: [
    "text-embedding-3-small",
    "text-embedding-3-large",
    "text-embedding-ada-002",
    "bge-m3",
    "bge-large-zh-v1.5",
    "bge-small-zh-v1.5",
    "nomic-embed-text",
    "mxbai-embed-large",
    "snowflake-arctic-embed2"
  ],
  // Local models mirror the shipped registry (localModels.ts) — every entry is
  // a real, downloadable transformers.js ONNX repo with a known pooling rule.
  local: LOCAL_MODELS.filter((model) => model.kind === "embedding").map((model) => model.id),
  rerank: [
    "jina-reranker-v2-base-multilingual",
    "BAAI/bge-reranker-v2-m3",
    "bge-reranker-base",
    "bce-reranker-base_v1",
    // Local cross-encoder: download it in Settings → Local Models, then use
    // the `local:` prefix (e.g. `local:Xenova/bge-reranker-base`).
    "local:Xenova/bge-reranker-base"
  ],
  // Ollama registry recommendations (embedding + vision), mirroring the local
  // model registry posture: real, downloadable model names for the Ollama API.
  ollamaEmbedding: [
    "nomic-embed-text",
    "bge-m3",
    "qwen3-embedding:0.6b",
    "mxbai-embed-large",
    "snowflake-arctic-embed"
  ],
  ollamaVision: [
    "llava",
    "qwen2.5vl:7b",
    "llama3.2-vision:11b",
    "minicpm-v:8b"
  ]
};
var LANE_CANDIDATE_CAP = 200;
var CONCEPT_READ_MAX_CHARS = 2e4;
var CONCEPT_GREP_SNIPPET_PAD = 60;
var CONCEPT_GREP_MAX_LINE_CHARS = 2e3;
var MAX_RAW_TEXT_LIMIT = 5e6;
var PROGRESS_LINGER_TTL_MS = 6e4;
var FAILURE_LINGER_TTL_MS = 10 * 6e4;
var LOCAL_RERANK_LOAD_ALLOWANCE_MS = 12e4;
var EMBED_MAX_ATTEMPTS = 3;
var EMBED_RETRY_BASE_DELAY_MS = 1e3;
var EMBED_RETRY_MAX_DELAY_MS = 3e4;
var ConflictError = class extends Error {
  code = "conflict";
};
var NotFoundError = class extends Error {
  code = "not_found";
};
var DirectorySourceError = class extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
};
var KnowledgeService = class _KnowledgeService extends Service {
  static inject = ["webServer"];
  static Config = Config;
  baseConfig;
  store;
  /** Set when the durable backend exists but could not be opened, so every
   *  store-backed call can report the real reason instead of an empty library. */
  storageError;
  storeReady;
  resolveStore = () => {
  };
  jobs = /* @__PURE__ */ new Map();
  indexing = /* @__PURE__ */ new Map();
  /**
   * Progress values that linger after a job exits (Cherry's 60s TTL), so the
   * list keeps showing the final percentage until the poll observes the
   * terminal status instead of blanking mid-frame. Purely a display aid —
   * every guard still consults {@link indexing}, never this map.
   */
  progressLinger = /* @__PURE__ */ new Map();
  indexingFailures = /* @__PURE__ */ new Map();
  // Cherry Studio parity: per-base worker pool (Cherry's knowledge jobs run at
  // defaultConcurrency 5 on a per-base queue). Rows are created up front and
  // flip status as the queued parse+ingest tasks run in the background.
  ingestQueues = /* @__PURE__ */ new Map();
  // Per-base write chain guarding dedup-check + first persist (read-then-write),
  // so two concurrent imports of identical content cannot both pass the check.
  baseWriteChains = /* @__PURE__ */ new Map();
  /** Last rerank failure code per model; only state transitions are logged. */
  rerankLogState = /* @__PURE__ */ new Map();
  artifacts = new ArtifactRepository();
  processingQueue = new ProcessingQueue();
  processingProgress = /* @__PURE__ */ new Map();
  processingControllers = /* @__PURE__ */ new Map();
  constructor(ctx, config) {
    super(ctx, "knowledge");
    this.baseConfig = config;
    this.storeReady = new Promise((resolve7) => {
      this.resolveStore = resolve7;
    });
    ctx.effect(() => ctx.webServer.register(knowledgeRoute(this)), "knowledge: /knowledge route");
  }
  async [Service.init]() {
    setLocalModelCacheDir(this.baseConfig.localModelCacheDir);
    setHfEndpoint(this.baseConfig.hfEndpoint);
    const facility = this.ctx.get("storageDomain");
    try {
      this.store = await openStore(facility, { chunkStorePath: this.baseConfig.chunkStorePath });
    } catch (error) {
      this.storageError = error instanceof Error ? error : new Error(String(error));
      this.ctx.logger.error(`knowledge: ${this.storageError.message}`);
    }
    const store = this.store;
    this.ctx.effect(() => async () => {
      await store?.close();
    }, "knowledge: close store");
    this.ctx.effect(() => () => {
      void disposeLocalModelWorker();
    }, "knowledge: dispose local model worker");
    this.ctx.effect(() => () => {
      void disposeLocalRerankProcess();
    }, "knowledge: dispose local rerank process");
    this.ctx.effect(() => () => {
      void disposeOcrWorker();
    }, "knowledge: dispose OCR worker");
    this.ctx.effect(() => () => this.mineruDeployment.dispose(), "knowledge: dispose MinerU deployment");
    if (store === void 0) {
      this.resolveStore();
      return;
    }
    this.artifacts = new ArtifactRepository(store.raw !== void 0 ? join12(dirname9(resolveChunkStorePath(this.baseConfig.chunkStorePath)), "knowledge-artifacts") : void 0);
    for (const base of store.listBases()) {
      for (const doc of store.listDocuments(base.id)) {
        const staged = store.getStagedDocumentGeneration(doc.id);
        const pinned = [doc.processing?.revision, staged?.document.processing?.revision].filter((value) => value !== void 0);
        await this.artifacts.collectDocument(base.id, doc.id, pinned).catch(() => {
          this.ctx.logger.warn("knowledge: artifact cleanup deferred (artifact_io)");
        });
      }
    }
    this.resolveStore();
    this.ctx.effect(() => () => {
      for (const controller of this.processingControllers.values()) controller.abort();
      for (const active2 of this.indexing.values()) active2.controller?.abort();
    }, "knowledge: cancel document processors");
    const resolved = this.getConfig();
    setHfEndpoint(resolved.hfEndpoint);
    setLocalModelCacheDir(resolved.localModelCacheDir);
    setLocalWorkerIdleTimeoutMs(resolved.localWorkerIdleTimeoutMs);
    setLocalRerankIdleTimeoutMs(resolved.localWorkerIdleTimeoutMs);
    const configuredLocalRerankers = /* @__PURE__ */ new Set();
    for (const effective of [resolved, ...store.listBases().map((base) => resolveConfigFor(this.baseConfig, store.getConfigOverrides(), base.config))]) {
      if (effective.rerankModel.startsWith("local:")) {
        const modelId = effective.rerankModel.slice("local:".length).trim();
        if (modelId !== "") configuredLocalRerankers.add(modelId);
      }
    }
    void listLocalModels().then((models) => {
      for (const modelId of configuredLocalRerankers) {
        const model = models.find((entry) => entry.id === modelId);
        if (model?.status === "unhealthy" && model.health === "unchecked") void selfTestLocalModel(modelId);
      }
    }).catch(() => {
    });
    const resume = store.recoverInterruptedImports(Date.now()).then(async ({ resume: resumeIds }) => {
      if (resumeIds.length === 0) return;
      if (!this.getConfig().resumeInterruptedOnStartup) {
        const reason = "import was interrupted by a shutdown; reindex to resume";
        let marked = 0;
        for (const id of resumeIds) {
          try {
            const doc = store.getDocument(id);
            if (doc !== void 0) {
              const { incomplete: _resumableMarker, ...rest } = doc;
              await store.putDocument({ ...rest, embeddingError: reason, errorCode: "interrupted", updatedAt: Date.now() });
              marked += 1;
            }
          } catch (error) {
            this.ctx.logger.warn(`knowledge: could not mark interrupted import ${id} failed; previous metadata retained: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        this.ctx.logger.info(`knowledge: marked ${marked} interrupted import(s) failed (auto-resume disabled)`);
        return;
      }
      this.ctx.logger.info(`knowledge: resuming ${resumeIds.length} interrupted import(s)`);
      this.runBackground("interrupted-import recovery", this.resumeInterruptedDocuments(resumeIds));
    });
    void resume.catch((error) => this.ctx.logger.warn(`knowledge: interrupted-import recovery failed: ${error instanceof Error ? error.message : String(error)}`));
    this.armUrlRefreshTimer();
  }
  // ── scheduled URL refresh (Cherry's snapshot + manual refresh, automated) ──
  urlRefreshTimer = null;
  urlRefreshing = false;
  /** Arm the hourly sweep that refreshes URL documents older than `urlRefreshHours`. */
  armUrlRefreshTimer() {
    const hours = this.getConfigFor(void 0).urlRefreshHours;
    if (hours <= 0) return;
    const run2 = () => {
      if (this.urlRefreshing) return;
      this.urlRefreshing = true;
      void this.refreshStaleUrls(hours).catch((error) => {
        this.ctx.logger.warn(`knowledge: URL refresh sweep failed: ${error instanceof Error ? error.message : String(error)}`);
      }).finally(() => {
        this.urlRefreshing = false;
      });
    };
    const first = setTimeout(run2, 5 * 6e4);
    first.unref?.();
    this.urlRefreshTimer = setInterval(run2, 60 * 6e4);
    this.urlRefreshTimer.unref?.();
    this.ctx.effect(() => () => {
      clearTimeout(first);
      if (this.urlRefreshTimer !== null) clearInterval(this.urlRefreshTimer);
    }, "knowledge: URL refresh timer");
  }
  /** Re-fetch every URL document whose last update predates `hours`; failures are logged, never thrown. */
  async refreshStaleUrls(hours) {
    const store = this.requireStore();
    const cutoff = Date.now() - hours * 36e5;
    const stale = [];
    for (const base of store.listBases()) {
      for (const doc of store.listDocuments(base.id)) {
        if (doc.sourceType === "url" && doc.url !== void 0 && (doc.updatedAt ?? 0) < cutoff) stale.push(doc.id);
      }
    }
    for (const id of stale) {
      try {
        const result = await this.refreshUrlDocument(id);
        if (result.changed) this.ctx.logger.info(`knowledge: URL auto-refreshed: ${result.title}`);
      } catch (error) {
        this.ctx.logger.warn(`knowledge: URL auto-refresh failed for ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  /**
   * Re-index documents a crash left mid-import. Each document holds rawText
   * and/or a persisted raw source file; hash reuse (decision A4) makes the
   * re-embed re-embed only missing batches. A placeholder that only has the
   * raw file (crash before/during parse) is re-parsed from source. Runs in
   * the background so startup is not blocked.
   */
  async resumeInterruptedDocuments(ids) {
    for (const id of ids) {
      try {
        const store = this.requireStore();
        const doc = store.getDocument(id);
        if (doc === void 0 || doc.sourceType === "directory") continue;
        if (doc.rawFilePath !== void 0 && doc.rawText === void 0) {
          const bytes = await store.raw?.read(doc.rawFilePath);
          if (bytes === null || bytes === void 0 || bytes.byteLength === 0) {
            this.ctx.logger.warn(`knowledge: raw source missing for interrupted import "${doc.title}", dropping it`);
            await store.deleteDocument(id);
            continue;
          }
          const processed = await this.extractDocumentText({
            baseId: doc.baseId,
            documentId: doc.id,
            fileName: doc.fileName ?? doc.title,
            ...doc.mimeType !== void 0 ? { mimeType: doc.mimeType } : {},
            bytes,
            resume: true
          });
          const { text } = processed;
          if (text.trim().length === 0) throw new Error("parsed document is empty");
          await this.ingestDocument({
            baseId: doc.baseId,
            title: doc.title,
            sourceType: "file",
            ...doc.fileName !== void 0 ? { fileName: doc.fileName } : {},
            ...doc.mimeType !== void 0 ? { mimeType: doc.mimeType } : {},
            ...doc.parentDirectoryId !== void 0 ? { parentDirectoryId: doc.parentDirectoryId } : {},
            placeholderId: doc.id,
            ...doc.sourcePath !== void 0 ? { sourcePath: doc.sourcePath } : {},
            rawFilePath: doc.rawFilePath,
            text,
            processed
          });
        } else {
          const staged = store.getStagedDocumentGeneration(id);
          if (staged?.document.processing !== void 0) {
            const parsed = await this.artifacts.load(doc.baseId, id, staged.document.processing);
            await this.finishRecoveredGeneration(doc, staged.document, { text: parsed.text, parsed, processing: staged.document.processing });
          } else {
            await this.reindexDocument(id, { mode: doc.processing === void 0 ? void 0 : "rechunk" });
          }
        }
      } catch (error) {
        if (isMetadataWriteFailure(error) || error?.published === true) {
          this.ctx.logger.warn(`knowledge: interrupted import recovery deferred for ${id}; previous metadata retained: ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }
        this.ctx.logger.warn(`knowledge: interrupted import recovery failed (${processorErrorCode(error)})`);
        try {
          const store = this.requireStore();
          const current = store.getDocument(id);
          if (current !== void 0) {
            await store.putDocument({
              ...current,
              incomplete: false,
              embeddingError: processorErrorMessage(error),
              errorCode: current.rawText === void 0 ? "parse_failed" : "embedding_provider",
              updatedAt: Date.now()
            });
          }
        } catch (writeError) {
          this.ctx.logger.warn(`knowledge: could not record failed recovery for ${id}; previous metadata retained: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
        }
      }
    }
  }
  /** Resume the persisted candidate without paying for a second parse. */
  async finishRecoveredGeneration(previous, candidate, processed) {
    const store = this.requireStore();
    const controller = new AbortController();
    this.indexing.set(previous.id, { baseId: previous.baseId, title: previous.title, phase: "embedding", total: 0, progress: 0, controller });
    try {
      const config = this.getConfigFor(previous.baseId);
      const result = await this.buildChunks(
        previous.baseId,
        previous.id,
        candidate.title,
        processed.text,
        config,
        this.processingChunks(processed, config),
        (batch) => store.stageDocumentGeneration(candidate, batch),
        controller.signal,
        processed.processing.revision
      );
      controller.signal.throwIfAborted();
      if (result.embeddingError !== void 0 && previous.chunkCount > 0) throw new Error("embedding recovery failed; previous generation preserved");
      const { incomplete: _incomplete, embeddingError: _error, errorCode: _code, ...rest } = candidate;
      await store.commitDocumentGeneration({
        ...rest,
        processing: processed.processing,
        rawText: processed.text,
        contentHash: sha256(processed.text),
        charCount: processed.text.length,
        tokenCount: estimateTokens2(processed.text),
        chunkCount: result.chunks.length,
        updatedAt: Date.now(),
        ...result.embeddingError !== void 0 ? { embeddingError: result.embeddingError, errorCode: result.embeddingErrorCode } : {}
      }, result.chunks);
    } finally {
      this.indexing.delete(previous.id);
      this.processingProgress.delete(previous.id);
    }
  }
  /** Wait until the durable store is ready; the HTTP route awaits this. */
  async whenReady() {
    await this.storeReady;
  }
  // ── configuration ─────────────────────────────────────────────────────────
  getConfig() {
    return resolveConfig(this.baseConfig, this.requireStore().getConfigOverrides());
  }
  /** Static model-id suggestions for the settings comboboxes. */
  modelSuggestions() {
    return MODEL_SUGGESTIONS;
  }
  /** Resolve one base's effective config (global + that base's overrides). */
  getConfigFor(baseId) {
    const store = this.requireStore();
    if (baseId !== void 0) {
      const base = store.getBase(baseId);
      if (base !== void 0) {
        return resolveConfigFor(this.baseConfig, store.getConfigOverrides(), base.config);
      }
    }
    return this.getConfig();
  }
  /** Emit a structured warning on behalf of model-facing retrieval helpers. */
  warn(message) {
    this.ctx.logger.warn(`knowledge: ${message}`);
  }
  /**
   * Detach a background task so its rejection can never surface as an
   * unhandledRejection — the host treats one as a fatal load failure and the
   * desktop app exits with it. Metadata persistence goes through an atomic
   * `tmp + rename` unit, which can fail transiently on Windows (`EPERM` while
   * another handle holds the file); such a failure must degrade to a warning.
   */
  runBackground(label, task) {
    void task.catch((error) => {
      this.ctx.logger.warn(`knowledge: ${label} failed: ${error instanceof Error ? error.message : String(error)}`);
    });
  }
  /**
   * Rerank settings for proactive (cross-base) retrieval, which has no single
   * base config: the global rerank model wins; otherwise the first enabled
   * base that configured one. Returns undefined when none is set.
   */
  rerankSettings() {
    const global = this.getConfig();
    if (global.rerankModel.trim() !== "") {
      return { model: global.rerankModel, baseUrl: global.rerankBaseUrl, apiKey: global.rerankApiKey };
    }
    for (const base of this.enabledBases()) {
      const config = this.getConfigFor(base.id);
      if (!config.autoRetrieve || config.autoRetrieveWeight === 0) continue;
      if (config.rerankModel.trim() !== "") {
        return { model: config.rerankModel, baseUrl: config.rerankBaseUrl, apiKey: config.rerankApiKey };
      }
    }
    return void 0;
  }
  async setConfig(overrides) {
    await this.requireStore().setConfigOverrides(overrides);
    const resolved = this.getConfig();
    setHfEndpoint(resolved.hfEndpoint);
    setLocalModelCacheDir(resolved.localModelCacheDir);
    setLocalWorkerIdleTimeoutMs(resolved.localWorkerIdleTimeoutMs);
    setLocalRerankIdleTimeoutMs(resolved.localWorkerIdleTimeoutMs);
    return resolved;
  }
  // ── invocation toggle ─────────────────────────────────────────────────────
  isEnabled() {
    return this.requireStore().getEnabled();
  }
  async setEnabled(enabled) {
    await this.requireStore().setEnabled(enabled);
  }
  getEnabledBaseIds() {
    return this.requireStore().getEnabledBaseIds();
  }
  async setEnabledBaseIds(ids) {
    await this.requireStore().setEnabledBaseIds([...new Set(ids)]);
  }
  /** Raw saved workspace allow-list; `[]` means nothing is allowed. */
  getWorkspacePaths() {
    return this.requireStore().getWorkspacePaths();
  }
  async setWorkspacePaths(paths) {
    await this.requireStore().setWorkspacePaths([...new Set(paths)]);
  }
  /**
   * Decide whether the knowledge base may be invoked in `cwd`.
   *
   * Fail-closed on every unknown: no cwd, an empty list, a list that names
   *  no workspace, or a store that is not ready. The single `"*"` entry
   *  opts a deployment into the old allow-everything behavior.
   */
  workspaceAllowed(cwd) {
    if (typeof cwd !== "string" || cwd.length === 0) return false;
    let paths;
    try {
      paths = this.requireStore().getWorkspacePaths();
    } catch {
      return false;
    }
    if (paths.length === 0) return false;
    if (paths.some((p) => p === "*")) return true;
    return paths.some((p) => p === cwd);
  }
  /**
   * Resolve the effective search scope for a model call. `undefined` means no
   * ids were configured (every base); an empty array means a non-empty saved
   * selection has gone entirely stale and must fail closed.
   */
  enabledScope() {
    const store = this.requireStore();
    const ids = store.getEnabledBaseIds();
    if (ids.length === 0) return void 0;
    const existing = new Set(store.listBases().map((base) => base.id));
    const valid = ids.filter((id) => existing.has(id));
    return valid;
  }
  /** Existing bases inside the strict model-invocation scope. */
  enabledBases() {
    const bases = this.listBases();
    const scope = this.enabledScope();
    if (scope === void 0) return bases;
    const allowed = new Set(scope);
    return bases.filter((base) => allowed.has(base.id));
  }
  // ── bases ─────────────────────────────────────────────────────────────────
  async createBase(request) {
    const name = request.name.trim();
    if (name.length === 0) throw new Error("base name is required");
    const now = Date.now();
    const store = this.requireStore();
    const group = request.group?.trim();
    if (group !== void 0 && group.length > 0 && !store.getGroups().includes(group)) {
      await store.setGroups([...store.getGroups(), group]);
    }
    const base = {
      id: crypto.randomUUID(),
      name,
      description: request.description?.trim() ?? "",
      ...group !== void 0 && group.length > 0 ? { group } : {},
      ...request.config !== void 0 ? { config: compactBaseConfig(request.config) } : {},
      createdAt: now,
      updatedAt: now
    };
    await store.putBase(base);
    return base;
  }
  /** Cherry-style restore: re-embed every source document into a fresh base
   *  (with the source's current config), returning the new base. Raw source
   *  files are copied across so the restored base keeps the rebuild source. */
  async restoreBase(sourceBaseId, name, config) {
    const store = this.requireStore();
    const source = store.getBase(sourceBaseId);
    if (source === void 0) throw new Error(`knowledge base not found: ${sourceBaseId}`);
    const base = await this.createBase({
      name: name.trim() || `${source.name} (\u6062\u590D)`,
      description: source.description,
      group: source.group,
      config: config ?? source.config
    });
    for (const doc of store.listDocuments(sourceBaseId)) {
      if (doc.sourceType === "directory") continue;
      const text = doc.rawText ?? reconstructFromChunks(store.listChunksByDoc(doc.id));
      if (text.trim().length === 0) continue;
      let rawFilePath;
      if (store.raw !== void 0 && doc.rawFilePath !== void 0) {
        const raw = await store.raw.read(doc.rawFilePath);
        if (raw !== null) {
          const ext = rawExtensionOf(doc.rawFilePath);
          rawFilePath = await store.raw.write(base.id, crypto.randomUUID(), ext, raw);
        }
      }
      await this.ingestDocument({
        baseId: base.id,
        title: doc.title,
        sourceType: doc.sourceType,
        ...doc.fileName !== void 0 ? { fileName: doc.fileName } : {},
        ...doc.mimeType !== void 0 ? { mimeType: doc.mimeType } : {},
        ...doc.url !== void 0 ? { url: doc.url } : {},
        ...rawFilePath !== void 0 ? { rawFilePath } : {},
        text
      });
    }
    return base;
  }
  async deleteBase(id) {
    const store = this.requireStore();
    if (store.getBase(id) === void 0) throw new Error(`knowledge base not found: ${id}`);
    for (const doc of store.listDocuments(id)) {
      this.processingControllers.get(doc.id)?.abort();
      this.processingProgress.delete(doc.id);
    }
    for (const [docId, active2] of [...this.indexing]) {
      if (active2.baseId === id) {
        active2.controller?.abort();
        this.indexing.delete(docId);
      }
    }
    await store.deleteChunksByBase(id);
    await store.raw?.deleteBase(id);
    await store.deleteBase(id);
    await this.artifacts.deleteBase(id);
    await this.reconcileAfterDelete();
  }
  async renameBase(id, request) {
    const store = this.requireStore();
    const existing = store.getBase(id);
    if (existing === void 0) throw new Error(`knowledge base not found: ${id}`);
    const next = {
      ...existing,
      name: request.name?.trim() || existing.name,
      description: request.description?.trim() ?? existing.description,
      ...request.group !== void 0 && request.group !== null ? { group: request.group.trim().length > 0 ? request.group.trim() : void 0 } : {},
      ...request.config !== void 0 ? { config: mergeBaseConfig(existing.config, request.config) } : {},
      updatedAt: Date.now()
    };
    const nextGroup = next.group;
    if (nextGroup !== void 0 && !store.getGroups().includes(nextGroup)) {
      await store.setGroups([...store.getGroups(), nextGroup]);
    }
    const patch = request.config;
    if (patch !== void 0) {
      const oldConfig = this.getConfigFor(id);
      const newConfig = resolveConfigFor(this.baseConfig, store.getConfigOverrides(), next.config);
      const modelChanged = newConfig.embeddingProvider !== oldConfig.embeddingProvider || newConfig.embeddingModel !== oldConfig.embeddingModel;
      if (modelChanged && store.listDocuments(id).length > 0) {
        const hadModel = oldConfig.embeddingProvider !== "none" && oldConfig.embeddingModel.trim() !== "";
        if (hadModel) {
          throw new Error("\u5207\u6362\u5D4C\u5165\u6A21\u578B\u4F1A\u4F7F\u5DF2\u6709\u5411\u91CF\u5168\u90E8\u5931\u6548\u2014\u2014\u8BF7\u4F7F\u7528\u300C\u91CD\u5EFA\u77E5\u8BC6\u5E93\u300D\u4EE5\u65B0\u6A21\u578B\u91CD\u5EFA\uFF08Cherry Studio \u8BED\u4E49\uFF09");
        }
        if (this.indexing.size > 0) {
          throw new Error("\u6709\u6587\u6863\u6B63\u5728\u5904\u7406\u4E2D\u2014\u2014\u8BF7\u7B49\u5F85\u5BFC\u5165/\u91CD\u5EFA\u5B8C\u6210\u540E\u518D\u542F\u7528\u5D4C\u5165\u6A21\u578B\uFF08Cherry Studio \u8BED\u4E49\uFF09");
        }
        const documents = store.listDocuments(id);
        const sourceLess = documents.some((doc) => doc.sourceType !== "directory" && doc.rawText === void 0 && doc.rawFilePath === void 0);
        if (sourceLess) {
          throw new Error("\u5B58\u5728\u65E0\u6E90\u6587\u672C\u7684\u6587\u6863\uFF0C\u65E0\u6CD5\u56DE\u586B\u5411\u91CF\u2014\u2014\u8BF7\u5220\u9664\u540E\u91CD\u65B0\u6DFB\u52A0\uFF08Cherry Studio \u8BED\u4E49\uFF09");
        }
        await store.putBase(next);
        const baseId = id;
        void this.reindexBase(baseId).catch((error) => {
          this.ctx.logger.warn(`knowledge: in-place embedding backfill failed: ${error instanceof Error ? error.message : String(error)}`);
        });
        return next;
      }
    }
    await store.putBase(next);
    return next;
  }
  listBases() {
    const store = this.requireStore();
    return store.listBases().map((base) => {
      const documents = store.listDocuments(base.id);
      const chunkCount = documents.reduce((sum, doc) => sum + doc.chunkCount, 0);
      const charCount = documents.reduce((sum, doc) => sum + doc.charCount, 0);
      const tokenCount = documents.reduce((sum, doc) => sum + (doc.tokenCount ?? 0), 0);
      const storedDocCount = documents.reduce((sum, doc) => sum + (doc.rawFilePath !== void 0 ? 1 : 0), 0);
      const sourceInfo = baseSourceLines(documents);
      return {
        id: base.id,
        name: base.name,
        description: base.description,
        ...base.group !== void 0 ? { group: base.group } : {},
        documentCount: documents.length,
        storedDocCount,
        chunkCount,
        charCount,
        tokenCount,
        ...base.config !== void 0 ? { config: base.config } : {},
        ...sourceInfo.length > 0 ? { sourceInfo } : {},
        createdAt: base.createdAt,
        updatedAt: base.updatedAt
      };
    });
  }
  // ── groups ────────────────────────────────────────────────────────────────
  listGroups() {
    return [...this.requireStore().getGroups()].sort((a, b) => a.localeCompare(b));
  }
  async createGroup(name) {
    const store = this.requireStore();
    const trimmed = name.trim();
    if (trimmed.length === 0) throw new Error("group name is required");
    const groups2 = new Set(store.getGroups());
    if (groups2.has(trimmed)) throw new Error(`group "${trimmed}" already exists`);
    groups2.add(trimmed);
    await store.setGroups([...groups2]);
    return [...groups2].sort((a, b) => a.localeCompare(b));
  }
  async renameGroup(from2, to) {
    const store = this.requireStore();
    const trimmed = to.trim();
    if (trimmed.length === 0) throw new Error("group name is required");
    const groups2 = new Set(store.getGroups());
    if (!groups2.has(from2)) throw new Error(`group "${from2}" does not exist`);
    if (groups2.has(trimmed) && from2 !== trimmed) throw new Error(`group "${trimmed}" already exists`);
    groups2.delete(from2);
    groups2.add(trimmed);
    for (const base of store.listBases()) {
      if (base.group === from2) await store.putBase({ ...base, group: trimmed, updatedAt: Date.now() });
    }
    await store.setGroups([...groups2]);
    return [...groups2].sort((a, b) => a.localeCompare(b));
  }
  async deleteGroup(name) {
    const store = this.requireStore();
    const groups2 = store.getGroups().filter((group) => group !== name);
    await store.setGroups(groups2);
    for (const base of store.listBases()) {
      if (base.group === name) await store.putBase({ ...base, group: void 0, updatedAt: Date.now() });
    }
  }
  // ── documents ─────────────────────────────────────────────────────────────
  async addTextDocument(request) {
    const store = this.requireStore();
    if (store.getBase(request.baseId) === void 0) throw new Error(`knowledge base not found: ${request.baseId}`);
    if (request.content.trim().length === 0) throw new Error("document content is empty");
    return this.ingestDocument({
      baseId: request.baseId,
      title: request.title.trim(),
      sourceType: "text",
      ...request.parentDirectoryId !== void 0 ? { parentDirectoryId: request.parentDirectoryId } : {},
      text: request.content
    });
  }
  async addFileDocument(request) {
    const store = this.requireStore();
    if (store.getBase(request.baseId) === void 0) throw new Error(`knowledge base not found: ${request.baseId}`);
    if (!SUPPORTED_DOCUMENT_EXTENSION_SET.has(extensionOf(request.fileName))) {
      throw new Error(`Unsupported knowledge file type: ${request.fileName}`);
    }
    let fileName = request.fileName;
    let title = request.title?.trim() || request.fileName;
    const lockResult = await this.withBaseWriteLock(request.baseId, async () => {
      const conflictStrategyNow = request.conflict ?? this.getConfigFor(request.baseId).conflictStrategy;
      if (conflictStrategyNow === "keep") {
        const existing = store.listDocuments(request.baseId).find((doc) => doc.fileName === request.fileName);
        if (existing !== void 0) {
          return { skippedDoc: existing };
        }
      } else {
        const existing = store.listDocuments(request.baseId).find((doc) => doc.fileName === request.fileName);
        if (existing !== void 0) {
          if (conflictStrategyNow === "replace") {
            await store.deleteChunks(existing.id, request.baseId);
            if (existing.rawFilePath !== void 0) await store.raw?.delete(existing.rawFilePath);
            await store.deleteDocument(existing.id);
          } else if (conflictStrategyNow === "detect") {
            throw new ConflictError(`same-name document exists: ${request.fileName} (id ${existing.id}) \u2014 re-upload with conflict=replace or conflict=rename`);
          }
        }
      }
      let resolvedFileName2 = request.fileName;
      let resolvedTitle2 = request.title?.trim() || request.fileName;
      if (conflictStrategyNow === "rename") {
        const taken = new Set(store.listDocuments(request.baseId).map((doc) => doc.fileName));
        let candidate = resolvedFileName2;
        let counter = 1;
        while (taken.has(candidate)) {
          const dot = resolvedFileName2.lastIndexOf(".");
          const base = dot > 0 ? resolvedFileName2.slice(0, dot) : resolvedFileName2;
          const ext = dot > 0 ? resolvedFileName2.slice(dot) : "";
          candidate = `${base}_${counter}${ext}`;
          counter += 1;
        }
        if (candidate !== resolvedFileName2) {
          resolvedFileName2 = candidate;
          resolvedTitle2 = request.title !== void 0 ? `${request.title.trim()}_${counter - 1}` : candidate;
        }
      }
      const newDocId = crypto.randomUUID();
      const placeholder = {
        id: newDocId,
        baseId: request.baseId,
        title: resolvedTitle2,
        sourceType: "file",
        fileName: resolvedFileName2,
        ...request.mimeType !== void 0 ? { mimeType: request.mimeType } : {},
        ...request.parentDirectoryId !== void 0 ? { parentDirectoryId: request.parentDirectoryId } : {},
        charCount: 0,
        chunkCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const newRawFilePath = store.raw !== void 0 ? await store.raw.write(request.baseId, newDocId, safeRawExtension(resolvedFileName2), decodeBase64(request.contentBase64)) : void 0;
      const storedDoc = { ...placeholder, ...newRawFilePath !== void 0 ? { rawFilePath: newRawFilePath } : {} };
      await store.putDocument(storedDoc);
      return { fileName: resolvedFileName2, title: resolvedTitle2, docId: newDocId, rawFilePath: newRawFilePath, stored: storedDoc };
    });
    if ("skippedDoc" in lockResult) {
      const skipped = lockResult.skippedDoc;
      return { ...skipped, skipped: true };
    }
    const { fileName: resolvedFileName, title: resolvedTitle, docId, rawFilePath, stored } = lockResult;
    fileName = resolvedFileName;
    title = resolvedTitle;
    const taskController = new AbortController();
    this.indexingFailures.delete(docId);
    this.indexing.set(docId, { baseId: request.baseId, title, phase: "parsing", total: 0, progress: 0, controller: taskController });
    const fallbackPayload = rawFilePath !== void 0 ? void 0 : request.contentBase64;
    this.enqueueIngest(request.baseId, async () => {
      try {
        let bytes = rawFilePath !== void 0 ? await store.raw?.read(rawFilePath) ?? null : null;
        if (bytes === null && fallbackPayload !== void 0) bytes = decodeBase64(fallbackPayload);
        if (bytes === null) throw new Error("raw copy is missing \u2014 cannot parse the file");
        const extracted = await this.extractDocumentText({
          baseId: request.baseId,
          documentId: docId,
          fileName,
          ...request.mimeType !== void 0 ? { mimeType: request.mimeType } : {},
          bytes,
          signal: taskController.signal
        });
        const text = extracted.text;
        if (text.trim().length === 0) {
          throw new Error("parsed document is empty");
        }
        await this.ingestDocument({
          baseId: request.baseId,
          title,
          sourceType: "file",
          fileName,
          ...request.mimeType !== void 0 ? { mimeType: request.mimeType } : {},
          ...request.parentDirectoryId !== void 0 ? { parentDirectoryId: request.parentDirectoryId } : {},
          placeholderId: docId,
          rawFilePath,
          text,
          processed: extracted
        }, taskController.signal);
      } catch (error) {
        this.indexing.delete(docId);
        taskController.abort();
        if (isMetadataWriteFailure(error)) {
          this.ctx.logger.warn(`knowledge: import metadata write deferred for ${docId}; saved sources retained: ${error instanceof Error ? error.message : String(error)}`);
          return;
        }
        if (error.published === true) return;
        const message = processorErrorMessage(error);
        const current = store.getDocument(docId);
        if (current === void 0 || store.getBase(request.baseId) === void 0) return;
        this.indexingFailures.set(docId, {
          baseId: request.baseId,
          title,
          phase: "parsing",
          code: "parse_failed",
          message: safeIndexingErrorMessage(message),
          expireAt: Date.now() + FAILURE_LINGER_TTL_MS
        });
        try {
          await store.putDocument({ ...current, embeddingError: message, errorCode: "parse_failed", updatedAt: Date.now() });
        } catch {
        }
      } finally {
        this.processingProgress.delete(docId);
        this.indexing.delete(docId);
      }
    });
    return stored;
  }
  /**
   * Batch file add with Cherry's server-authoritative conflict detection:
   * `conflict: 'detect'` reports every same-name collision (against existing
   * documents AND within the batch) without adding anything; `rename`/`replace`
   * add the whole batch under that strategy. The detect round may omit file
   * contents (names alone suffice); a clean detect returns `clean` so the
   * caller re-submits with contents under the rename strategy.
   */
  async addFiles(request) {
    const store = this.requireStore();
    if (store.getBase(request.baseId) === void 0) throw new Error(`knowledge base not found: ${request.baseId}`);
    for (const file of request.files) {
      if (!SUPPORTED_DOCUMENT_EXTENSION_SET.has(extensionOf(file.fileName))) {
        throw new Error(`Unsupported knowledge file type: ${file.fileName}`);
      }
    }
    const existingNames = new Set(
      store.listDocuments(request.baseId).filter((doc) => doc.sourceType === "file").map((doc) => doc.fileName)
    );
    const seen = /* @__PURE__ */ new Set();
    const conflicts = [];
    for (const file of request.files) {
      const name = file.fileName;
      if (existingNames.has(name) || seen.has(name)) conflicts.push(name);
      seen.add(name);
    }
    const uniqueConflicts = [...new Set(conflicts)];
    if (request.conflict === "detect") {
      if (uniqueConflicts.length > 0) return { status: "conflicts", conflicts: uniqueConflicts };
      if (request.files.some((file) => file.contentBase64 === void 0)) return { status: "clean" };
    }
    const strategy = request.conflict === "detect" ? "rename" : request.conflict;
    const accepted = [];
    for (const file of request.files) {
      const doc = await this.addFileDocument({
        baseId: request.baseId,
        fileName: file.fileName,
        ...file.mimeType !== void 0 ? { mimeType: file.mimeType } : {},
        ...request.parentDirectoryId !== void 0 ? { parentDirectoryId: request.parentDirectoryId } : {},
        contentBase64: file.contentBase64 ?? "",
        ...strategy !== void 0 ? { conflict: strategy } : {}
      });
      accepted.push({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName ?? doc.title,
        ...doc.skipped === true ? { skipped: true } : {}
      });
    }
    return { status: "added", accepted };
  }
  /** Start importing a local directory as a cancellable background job. */
  async importDirectory(request) {
    const store = this.requireStore();
    if (store.getBase(request.baseId) === void 0) throw new Error(`knowledge base not found: ${request.baseId}`);
    const files = await scanDirectory(request.path);
    const jobId = crypto.randomUUID();
    this.pruneJobs();
    this.jobs.set(jobId, {
      baseId: request.baseId,
      kind: "directory",
      cancelled: false,
      imported: 0,
      skipped: 0,
      total: files.length,
      current: "",
      errors: [],
      done: false
    });
    this.runBackground("directory import job", this.runDirectoryImport(jobId, files));
    return { jobId, total: files.length };
  }
  /** Progress snapshot of an active (or just-finished) directory import. */
  directoryImportStatus(jobId) {
    return this.jobs.get(jobId);
  }
  cancelDirectoryImport(jobId) {
    const job2 = this.jobs.get(jobId);
    if (job2 !== void 0 && !job2.done) job2.cancelled = true;
  }
  async runDirectoryImport(jobId, files) {
    const job2 = this.jobs.get(jobId);
    if (job2 === void 0) return;
    for (const file of files) {
      if (job2.cancelled) break;
      job2.current = file;
      try {
        await this.ingestPathFile(job2.baseId, file, basename3(file));
        job2.imported += 1;
      } catch (error) {
        job2.errors.push({ file, error: error instanceof Error ? error.message : String(error) });
      }
    }
    job2.done = true;
    job2.current = "";
  }
  pruneJobs() {
    if (this.jobs.size < 50) return;
    for (const [id, job2] of this.jobs) {
      if (job2.done) this.jobs.delete(id);
    }
  }
  /** Create a directory container item (no chunks) under an optional parent. */
  async createDirectory(baseId, title, parentDirectoryId) {
    const store = this.requireStore();
    const document = {
      id: crypto.randomUUID(),
      baseId,
      title: title.trim() || "directory",
      sourceType: "directory",
      ...parentDirectoryId !== void 0 ? { parentDirectoryId } : {},
      charCount: 0,
      chunkCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await store.putDocument(document);
    await this.touchBase(baseId);
    return document;
  }
  /** Import a local directory as a nested tree of directory containers + file items. */
  async importDirectoryTree(baseId, path, parentDirectoryId) {
    const prepared = await this.prepareDirectoryImport(baseId, path, parentDirectoryId);
    const sync = await this.syncDirectorySource(prepared.root, prepared.sourcePath, prepared.mode);
    const errors = sync.items.filter((item) => item.action === "failed" && item.error !== void 0).map((item) => ({ file: item.relativePath, error: item.error.message }));
    return {
      // `imported`/`directories` keep their pre-4.0 meaning of "items this call
      // wrote", i.e. created PLUS updated. Counting only `created` made a
      // re-sync that re-parsed and re-embedded every changed file report
      // `imported: 0` — success-shaped zeros for real work. The split lives in
      // `sync` for callers that need it.
      imported: sync.items.filter((item) => item.kind === "file" && (item.action === "created" || item.action === "updated")).length,
      directories: sync.items.filter((item) => item.kind === "directory" && (item.action === "created" || item.action === "updated")).length,
      errors,
      sourceId: prepared.root.id,
      mode: prepared.mode,
      sync
    };
  }
  /** Resolve a directory to its real filesystem identity. The stored display
   * path remains usable for reads, while comparisons use {@link sourcePathKey}
   * so Windows casing and separators cannot create a second source root. */
  async canonicalDirectoryPath(path) {
    const trimmed = path.trim();
    if (trimmed.length === 0) throw new Error("path is required");
    if (!isAbsolute4(trimmed)) throw new Error(`path must be absolute: ${trimmed}`);
    let canonical;
    try {
      canonical = await realpath2(resolve6(trimmed));
    } catch {
      throw new Error(`path not found: ${trimmed}`);
    }
    let sourceStat;
    try {
      sourceStat = await stat6(canonical);
    } catch {
      throw new Error(`path not found: ${trimmed}`);
    }
    if (!sourceStat.isDirectory()) throw new Error(`not a directory: ${trimmed}`);
    return canonical;
  }
  /** Canonical identity for any one local source path. Two spellings of the
   * same real file — macOS `/var` versus `/private/var`, a symlink, or a
   * Windows junction — must never become two sources, so every stored local
   * path is written in its resolved form rather than the spelling the caller
   * happened to use. A path that cannot be resolved falls back to its
   * normalized form (validation has already proven it exists). */
  async canonicalSourcePath(path) {
    try {
      return await realpath2(path);
    } catch {
      return resolve6(path);
    }
  }
  /** Stable comparison key for paths that are already validated as local
   * sources. `resolve` normalizes separators; Windows uses case-insensitive
   * identity even when the physical volume preserves the original case. */
  sourcePathKey(path) {
    const normalized = resolve6(path).replace(/\\/g, "/");
    return process.platform === "win32" ? normalized.toLocaleLowerCase("en-US") : normalized;
  }
  sameSourcePath(left, right) {
    return this.sourcePathKey(left) === this.sourcePathKey(right);
  }
  relativeSourcePath(root, target) {
    const value = relative4(root, target).replace(/\\/g, "/");
    return value === "" ? "." : value;
  }
  /** Create or reuse exactly one source-root container. A duplicate path never
   * silently creates a second tree, and a legacy ambiguous tree is never
   * guessed or merged. */
  async prepareDirectoryImport(baseId, path, parentDirectoryId) {
    const store = this.requireStore();
    if (store.getBase(baseId) === void 0) throw new Error(`knowledge base not found: ${baseId}`);
    const sourcePath = await this.canonicalDirectoryPath(path);
    if (parentDirectoryId !== void 0) {
      const parent = store.getDocument(parentDirectoryId);
      if (parent === void 0 || parent.baseId !== baseId || parent.sourceType !== "directory") {
        throw new Error("parentDirectoryId must identify a directory in the target knowledge base");
      }
    }
    const candidates = store.listDocuments(baseId).filter(
      (document) => document.sourceType === "directory" && document.sourcePath !== void 0 && this.sameSourcePath(document.sourcePath, sourcePath)
    );
    if (candidates.length > 1) {
      throw new DirectorySourceError(
        "ambiguous_source",
        "more than one directory tree is already bound to this source path; inspect and delete the redundant tree manually",
        { sourcePath, candidateIds: candidates.map((candidate) => candidate.id) }
      );
    }
    const existing = candidates[0];
    if (existing !== void 0) {
      if (existing.parentDirectoryId !== parentDirectoryId) {
        throw new DirectorySourceError(
          "source_path_conflict",
          "this directory source is already imported under a different parent and cannot be copied or moved automatically",
          { sourcePath, sourceId: existing.id, parentDirectoryId: existing.parentDirectoryId }
        );
      }
      return { root: existing, sourcePath, mode: "synced" };
    }
    const root = await this.createDirectory(baseId, basename3(sourcePath), parentDirectoryId);
    return { root, sourcePath, mode: "created" };
  }
  /** Import a single local file by its absolute path (server-side). */
  async importFileFromPath(baseId, filePath) {
    const store = this.requireStore();
    if (store.getBase(baseId) === void 0) throw new Error(`knowledge base not found: ${baseId}`);
    const name = basename3(filePath);
    const sourcePath = await this.canonicalSourcePath(filePath);
    if (!SUPPORTED_DOCUMENT_EXTENSION_SET.has(extensionOf(name))) {
      throw new Error(`Unsupported knowledge file type: ${name}`);
    }
    await this.ingestPathFile(baseId, sourcePath, name);
    return { imported: true, title: name };
  }
  /**
   * Import a local path (directory tree or single file) by its absolute path,
   * validating that it exists first. Directories reuse the tree import, which
   * records `sourcePath` on every container so reindex rescans the disk.
   */
  async importFromPath(baseId, path) {
    const store = this.requireStore();
    if (store.getBase(baseId) === void 0) throw new Error(`knowledge base not found: ${baseId}`);
    const trimmed = path.trim();
    if (trimmed.length === 0) throw new Error("path is required");
    if (!isAbsolute4(trimmed)) throw new Error(`path must be absolute: ${trimmed}`);
    let st;
    try {
      st = await stat6(trimmed);
    } catch {
      throw new Error(`path not found: ${trimmed}`);
    }
    if (st.isDirectory()) {
      const result = await this.importDirectoryTree(baseId, trimmed);
      return {
        kind: "directory",
        imported: result.imported,
        errors: result.errors,
        directories: result.directories,
        sourceId: result.sourceId,
        mode: result.mode,
        sync: result.sync
      };
    }
    if (st.isFile()) {
      await this.importFileFromPath(baseId, trimmed);
      return { kind: "file", imported: 1, errors: [] };
    }
    throw new Error(`not a file or directory: ${trimmed}`);
  }
  /**
   * Repoint exactly one top-level file or directory source. Source identity is
   * explicit: a base may contain several independent roots of the same kind,
   * and editing one must never redirect its siblings.
   */
  async setBaseSourcePath(baseId, sourceId, path) {
    const store = this.requireStore();
    if (store.getBase(baseId) === void 0) throw new Error(`knowledge base not found: ${baseId}`);
    const source = store.getDocument(sourceId);
    if (source === void 0) throw new Error(`source document not found: ${sourceId}`);
    if (source.baseId !== baseId) throw new Error(`source ${sourceId} does not belong to knowledge base ${baseId}`);
    if (source.parentDirectoryId !== void 0) throw new Error("source path can only be changed for a top-level source");
    if (source.sourceType !== "file" && source.sourceType !== "directory") {
      throw new Error("source path can only be changed for a file or directory source");
    }
    const trimmed = path.trim();
    if (trimmed.length === 0) throw new Error("path is required");
    if (!isAbsolute4(trimmed)) throw new Error(`path must be absolute: ${trimmed}`);
    let st;
    try {
      st = await stat6(trimmed);
    } catch {
      throw new Error(`path not found: ${trimmed}`);
    }
    if (source.sourceType === "directory") {
      if (!st.isDirectory()) throw new Error("a directory source must be repointed to a directory");
      const canonical = await this.canonicalSourcePath(trimmed);
      const conflict = store.listDocuments(baseId).find(
        (document) => document.id !== source.id && document.sourceType === "directory" && document.sourcePath !== void 0 && this.sameSourcePath(document.sourcePath, canonical)
      );
      if (conflict !== void 0) {
        throw new DirectorySourceError(
          "source_path_conflict",
          "another directory source in this knowledge base is already bound to that path",
          { sourcePath: canonical, sourceId: conflict.id }
        );
      }
      await store.putDocument({ ...source, sourcePath: canonical, updatedAt: Date.now() });
    } else {
      if (!st.isFile()) throw new Error("a file source must be repointed to a file");
      const nextFileName = basename3(trimmed);
      if (!SUPPORTED_DOCUMENT_EXTENSION_SET.has(extensionOf(nextFileName))) {
        throw new Error(`Unsupported knowledge file type: ${nextFileName}`);
      }
      const { mimeType: _staleMimeType, ...withoutMimeType } = source;
      await store.putDocument({
        ...withoutMimeType,
        sourcePath: await this.canonicalSourcePath(trimmed),
        fileName: nextFileName,
        updatedAt: Date.now()
      });
    }
    await this.touchBase(baseId);
    return { set: 1 };
  }
  async addUrlDocument(request) {
    const store = this.requireStore();
    if (store.getBase(request.baseId) === void 0) throw new Error(`knowledge base not found: ${request.baseId}`);
    const html = await fetchHtml(request.url);
    const extracted = await extractHtmlDocument(html);
    if (extracted.text.trim().length === 0) throw new Error("URL returned no extractable text");
    const docId = crypto.randomUUID();
    const title = request.title?.trim() || extracted.title || request.url;
    let rawFilePath;
    if (store.raw !== void 0) {
      rawFilePath = await store.raw.write(request.baseId, docId, ".md", encodeUtf8(extracted.text));
    }
    return this.ingestDocument({
      baseId: request.baseId,
      title,
      sourceType: "url",
      url: request.url,
      ...request.parentDirectoryId !== void 0 ? { parentDirectoryId: request.parentDirectoryId } : {},
      rawFilePath,
      text: extracted.text
    });
  }
  /**
   * Cherry-style URL refresh: re-fetch the page, and when its text changed,
   * overwrite the snapshot and re-index the document (hash reuse re-embeds
   * only the chunks that changed). A failed fetch or an unchanged page leaves
   * the current snapshot and index untouched — refresh never degrades.
   */
  async refreshUrlDocument(id) {
    const store = this.requireStore();
    const document = store.getDocument(id);
    if (document === void 0) throw new Error(`document not found: ${id}`);
    if (document.sourceType !== "url" || document.url === void 0) {
      throw new Error(`document "${document.title}" is not a URL document`);
    }
    const html = await fetchHtml(document.url);
    const extracted = await extractHtmlDocument(html);
    if (extracted.text.trim().length === 0) throw new Error("URL returned no extractable text");
    const title = extracted.title.trim().length > 0 ? extracted.title.trim() : document.title;
    if (extracted.text === document.rawText && title === document.title) {
      return { changed: false, title: document.title, chunkCount: document.chunkCount };
    }
    let rawFilePath = document.rawFilePath;
    if (store.raw !== void 0) {
      const ext = rawFilePath !== void 0 ? rawExtensionOf(rawFilePath) : ".md";
      rawFilePath = await store.raw.write(document.baseId, document.id, ext, encodeUtf8(extracted.text));
    }
    const refreshed = await this.ingestDocument({
      baseId: document.baseId,
      title,
      sourceType: "url",
      url: document.url,
      rawFilePath,
      text: extracted.text,
      placeholderId: document.id
    });
    return { changed: true, title: refreshed.title, chunkCount: refreshed.chunkCount };
  }
  /** Preview the exact tree and durable raw snapshots affected by a delete.
   * This is read-only and is safe to call before showing a destructive UI. */
  getDeleteImpact(id) {
    const store = this.requireStore();
    const root = store.getDocument(id);
    if (root === void 0) throw new Error(`document not found: ${id}`);
    const childrenByParent = /* @__PURE__ */ new Map();
    for (const document of store.listDocuments(root.baseId)) {
      if (document.parentDirectoryId === void 0) continue;
      const children = childrenByParent.get(document.parentDirectoryId) ?? [];
      children.push(document);
      childrenByParent.set(document.parentDirectoryId, children);
    }
    const nodes = [];
    const visit = (document) => {
      nodes.push(document);
      for (const child2 of childrenByParent.get(document.id) ?? []) visit(child2);
    };
    visit(root);
    const descendants = nodes.length - 1;
    return {
      documentId: root.id,
      baseId: root.baseId,
      directories: nodes.filter((document) => document.sourceType === "directory").length,
      files: nodes.filter((document) => document.sourceType !== "directory").length,
      chunks: nodes.reduce((sum, document) => sum + document.chunkCount, 0),
      rawSnapshots: new Set(nodes.flatMap((document) => document.rawFilePath === void 0 ? [] : [document.rawFilePath])).size,
      requiresRecursive: root.sourceType === "directory" && descendants > 0
    };
  }
  assertDeleteImpacts(ids, recursive) {
    const store = this.requireStore();
    const roots = this.outermostSelectedIds(ids).filter((id) => store.getDocument(id) !== void 0);
    const impacts = roots.map((id) => this.getDeleteImpact(id));
    const recursiveImpacts = impacts.filter((impact) => impact.requiresRecursive);
    if (recursiveImpacts.length > 0 && !recursive) {
      throw new DirectorySourceError(
        "recursive_confirmation_required",
        "deleting a non-empty directory requires explicit recursive confirmation",
        { impacts: recursiveImpacts }
      );
    }
    return roots;
  }
  async deleteDocument(id, options) {
    const store = this.requireStore();
    const existing = store.getDocument(id);
    if (existing === void 0) throw new Error(`document not found: ${id}`);
    this.assertDeleteImpacts([id], options?.recursive === true);
    await this.deleteDocumentRecursive(id);
    await this.touchBase(existing.baseId);
    await this.reconcileAfterDelete();
  }
  /** Post-delete cleanup: drop chunk rows whose document is already gone (a
   *  batch that landed after the row was deleted keeps matching the retrieval
   *  lanes, which scope by base rather than by document existence), then
   *  reclaim space. */
  async reconcileAfterDelete() {
    const store = this.requireStore();
    try {
      const removed = await store.reconcileOrphanChunks();
      if (removed > 0) this.ctx.logger.warn(`knowledge: removed chunks left by ${removed} deleted document(s)`);
    } catch (error) {
      this.ctx.logger.warn(`knowledge: orphan chunk reconciliation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    this.reclaimAfterDelete();
  }
  /** Threshold-gated space reclamation after a delete (Cherry's reclaimSpace). */
  reclaimAfterDelete() {
    const store = this.requireStore();
    const outcome = store.reclaimSpace?.();
    if (outcome !== void 0 && outcome.vacuumed) {
      this.ctx.logger.info(`knowledge: reclaimed ${outcome.reclaimedBytes} bytes after delete`);
    }
  }
  /** Delete one document (recursing into directory containers), one write per item. */
  async deleteDocumentRecursive(id) {
    const store = this.requireStore();
    const existing = store.getDocument(id);
    if (existing === void 0) return;
    const active2 = this.indexing.get(id);
    this.processingControllers.get(id)?.abort();
    this.processingProgress.delete(id);
    active2?.controller?.abort();
    this.indexing.delete(id);
    if (existing.sourceType === "directory") {
      for (const child2 of store.listDocuments(existing.baseId)) {
        if (child2.parentDirectoryId === id) await this.deleteDocumentRecursive(child2.id);
      }
    }
    if (existing.rawFilePath !== void 0) await store.raw?.delete(existing.rawFilePath);
    await store.deleteChunks(id, existing.baseId);
    await store.deleteDocument(id);
    await this.artifacts.deleteDocument(existing.baseId, id);
  }
  /**
   * Throw when the document (or its base) vanished while indexing was in
   * flight — Cherry's deleting-guard: a delete that lands mid-import or
   * mid-reindex must never be resurrected by the finishing writes, and chunks
   * must never land under a deleted base.
   */
  assertIndexTargetAlive(docId, baseId) {
    const store = this.requireStore();
    if (store.getDocument(docId) === void 0 || store.getBase(baseId) === void 0) {
      throw new Error("indexing target no longer exists (deleted while indexing)");
    }
  }
  async renameDocument(id, title) {
    const store = this.requireStore();
    const existing = store.getDocument(id);
    if (existing === void 0) throw new Error(`document not found: ${id}`);
    const next = { ...existing, title: title.trim() || existing.title, updatedAt: Date.now() };
    await store.putDocument(next);
    return next;
  }
  async reindexDocument(id, options = {}) {
    const store = this.requireStore();
    const document = store.getDocument(id);
    if (document === void 0) throw new Error(`document not found: ${id}`);
    if (document.sourceType === "directory") {
      if (document.sourcePath !== void 0 && options.mode === void 0) {
        return await this.rescanDirectory(document);
      }
      let failed = 0;
      let firstError = "";
      for (const child2 of store.listDocuments(document.baseId)) {
        if (child2.parentDirectoryId !== document.id) continue;
        if (this.indexing.has(child2.id)) continue;
        try {
          await this.reindexDocument(child2.id, options);
        } catch (error) {
          failed += 1;
          if (firstError === "") firstError = error instanceof Error ? error.message : String(error);
        }
      }
      if (failed > 0) {
        throw new Error(`directory reindex finished with ${failed} failed item(s): ${firstError}`);
      }
      await store.putDocument({ ...document, updatedAt: Date.now() });
      return document;
    }
    if (this.indexing.has(id)) {
      throw new Error(`"${document.title}" is still being indexed \u2014 try again when it finishes`);
    }
    const controller = new AbortController();
    this.indexing.set(id, { baseId: document.baseId, title: document.title, phase: "parsing", total: 0, progress: 0, controller });
    let rebuilt;
    try {
      if (options.mode === "rechunk") {
        const parsed = document.processing !== void 0 ? await this.artifacts.load(document.baseId, document.id, document.processing) : void 0;
        rebuilt = {
          text: parsed?.text ?? document.rawText ?? reconstructFromChunks(store.listChunksByDoc(id)),
          ...parsed !== void 0 && document.processing !== void 0 ? { processed: { text: parsed.text, parsed, processing: { ...document.processing, reused: true } } } : {}
        };
      } else {
        rebuilt = await this.sourceTextOf(document, controller.signal, options.strictSource);
      }
      controller.signal.throwIfAborted();
      if (!rebuilt.text.trim()) throw new Error("parsed document is empty");
    } catch (error) {
      this.indexing.delete(id);
      throw error;
    }
    const discardCandidate = async () => {
      if (rebuilt.candidateRawFilePath === void 0) return;
      try {
        await store.raw?.delete(rebuilt.candidateRawFilePath);
      } catch (error) {
        this.ctx.logger.warn(`knowledge: failed to discard uncommitted raw source ${rebuilt.candidateRawFilePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    let candidateCommitted = false;
    try {
      const config = this.getConfigFor(document.baseId);
      await store.putDocument({ ...document, incomplete: true, updatedAt: Date.now() });
      const candidate = {
        ...document,
        rawText: rebuilt.text,
        ...rebuilt.rawFilePath !== void 0 ? { rawFilePath: rebuilt.rawFilePath } : {},
        processing: rebuilt.processed?.processing
      };
      const pieces = this.processingChunks(rebuilt.processed, config);
      await store.stageDocumentGeneration(candidate, []);
      const { chunks, embeddingError, embeddingErrorCode } = await this.buildChunks(document.baseId, document.id, document.title, rebuilt.text, config, pieces, (batch) => store.stageDocumentGeneration(candidate, batch), controller.signal, candidate.processing?.revision);
      controller.signal.throwIfAborted();
      if (embeddingError !== void 0 && document.chunkCount > 0) throw Object.assign(new Error("embedding failed; the previous document generation was preserved"), { code: embeddingErrorCode });
      const { embeddingError: _staleError, errorCode: _staleCode, incomplete: _staleIncomplete, contentHash: _staleHash, ...rest } = candidate;
      const next = {
        ...rest,
        ...rebuilt.rawFilePath !== void 0 ? { rawFilePath: rebuilt.rawFilePath } : {},
        rawText: rebuilt.text,
        contentHash: sha256(rebuilt.text),
        charCount: rebuilt.text.length,
        tokenCount: estimateTokens2(rebuilt.text),
        chunkCount: chunks.length,
        ...embeddingError !== void 0 ? { embeddingError, ...embeddingErrorCode !== void 0 ? { errorCode: embeddingErrorCode } : {} } : {},
        updatedAt: Date.now()
      };
      if (store.getDocument(document.id) === void 0 || store.getBase(document.baseId) === void 0) {
        await discardCandidate();
        return document;
      }
      await store.commitDocumentGeneration(next, chunks);
      candidateCommitted = true;
      if (rebuilt.previousRawFilePath !== void 0 && rebuilt.previousRawFilePath !== rebuilt.rawFilePath) {
        try {
          await store.raw?.delete(rebuilt.previousRawFilePath);
        } catch (error) {
          this.ctx.logger.warn(`knowledge: failed to remove superseded raw source ${rebuilt.previousRawFilePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      await this.touchBase(document.baseId);
      return next;
    } catch (error) {
      if (isMetadataWriteFailure(error)) throw error;
      if (!candidateCommitted && error.published !== true) {
        await store.discardStagedDocumentGeneration(id);
        await discardCandidate();
        if (store.getDocument(id) !== void 0) await store.putDocument(document);
      }
      throw error;
    } finally {
      this.indexing.delete(id);
      this.processingProgress.delete(id);
    }
  }
  /**
   * Extract a file's text through the base's configured processor chain: the
   * remote MinerU API first when this base selects it for a PDF, then the local
   * parsers. Returns the text plus the remote failure reason when one occurred.
   *
   * Import and every later rebuild (reindex, startup resume) go through here,
   * so a document imported with MinerU is rebuilt with MinerU too — a scanned
   * PDF whose remote extraction failed is recoverable by reindexing instead of
   * being stuck on a local parser that cannot read it. Throws only when the
   * remote processor was tried AND the local parsers also failed, with both
   * reasons in the message (the import row then shows why the remote failed,
   * which used to be log-only). An aborted extraction (the document was
   * deleted) is rethrown as-is: it must not fall back to a local parse that can
   * hold the worker for minutes.
   */
  async extractDocumentText(input) {
    const controller = new AbortController();
    this.processingControllers.set(input.documentId, controller);
    const signal = input.signal === void 0 ? controller.signal : AbortSignal.any([controller.signal, input.signal]);
    const config = this.getConfigFor(input.baseId);
    const budget = processingBudget(config.documentProcessingTimeoutMs ?? 18e5, signal);
    this.processingProgress.set(input.documentId, { stage: "queued" });
    try {
      return await this.processingQueue.run(() => processDocumentFile({
        ...input,
        config,
        artifacts: this.artifacts,
        signal: budget.signal,
        onProgress: (progress) => {
          this.processingProgress.set(input.documentId, progress);
        }
      }), budget.signal);
    } catch (error) {
      this.ctx.logger.warn(`knowledge: document processor ${processorErrorCode(error)}`);
      throw error;
    } finally {
      budget.dispose();
      if (this.processingControllers.get(input.documentId) === controller) this.processingControllers.delete(input.documentId);
    }
  }
  /** Rebuild source text of a document. A path-imported single file (sourcePath)
   *  is re-read from disk first so EDITS and a repointed source (setBaseSourcePath)
   *  are picked up, refreshing the persisted raw copy; otherwise the raw copy
   *  (parsed through the base's configured processor: MinerU first when set),
   *  then persisted text, then reconstructed chunks are used. Returns the rebuilt
   *  text and, when the raw copy was refreshed, its new base-relative path. */
  async sourceTextOf(document, signal, strictSource = false) {
    const store = this.requireStore();
    const sourceFailures = [];
    let failedLiveSourceBytes;
    let failedLiveSourceWasPdf = false;
    if (document.sourceType === "file" && document.sourcePath !== void 0) {
      try {
        const buffer = await readFile9(document.sourcePath);
        if (buffer.byteLength > 0) {
          const fileName = basename3(document.sourcePath);
          let text2;
          let processed;
          try {
            const extracted = await this.extractDocumentText({
              baseId: document.baseId,
              documentId: document.id,
              fileName,
              bytes: buffer,
              signal
            });
            processed = extracted;
            text2 = extracted.text;
            if (text2.trim().length === 0) throw new Error("parsed document is empty");
          } catch (error) {
            failedLiveSourceBytes = buffer;
            failedLiveSourceWasPdf = extensionOf(fileName) === "pdf";
            throw error;
          }
          if (store.raw !== void 0) {
            const nextRaw = await store.raw.write(document.baseId, crypto.randomUUID(), safeRawExtension(fileName), buffer);
            return {
              text: text2,
              processed,
              rawFilePath: nextRaw,
              candidateRawFilePath: nextRaw,
              ...document.rawFilePath !== void 0 ? { previousRawFilePath: document.rawFilePath } : {}
            };
          }
          return { text: text2, processed };
        }
      } catch (error) {
        signal?.throwIfAborted();
        if (strictSource) throw error;
        const reason = error instanceof Error ? error.message : String(error);
        sourceFailures.push(`source path: ${reason}`);
        this.ctx.logger.warn(`knowledge: re-reading source path failed, falling back to stored copy: ${reason}`);
      }
    }
    if (document.rawFilePath !== void 0) {
      const raw = await store.raw?.read(document.rawFilePath);
      if (raw !== null && raw !== void 0 && raw.byteLength > 0) {
        if (failedLiveSourceWasPdf && extensionOf(document.fileName ?? document.title) === "pdf" && failedLiveSourceBytes !== void 0 && Buffer.compare(raw, failedLiveSourceBytes) === 0) {
          this.ctx.logger.warn("knowledge: stored raw source matches the failed live source; skipping duplicate parse");
        } else {
          try {
            const processed = await this.extractDocumentText({
              baseId: document.baseId,
              documentId: document.id,
              fileName: document.fileName ?? document.title,
              ...document.mimeType !== void 0 ? { mimeType: document.mimeType } : {},
              bytes: raw,
              signal
            });
            const { text: text2 } = processed;
            if (text2.trim().length > 0) return { text: text2, processed };
            throw new Error("parsed document is empty");
          } catch (error) {
            signal?.throwIfAborted();
            const reason = error instanceof Error ? error.message : String(error);
            sourceFailures.push(`stored raw source: ${reason}`);
            this.ctx.logger.warn(`knowledge: re-parsing raw source failed, falling back to stored text: ${reason}`);
          }
        }
      } else {
        this.ctx.logger.warn(`knowledge: raw source file missing for "${document.title}", falling back to stored text`);
      }
    }
    const text = document.rawText?.trim() ? document.rawText : reconstructFromChunks(this.requireStore().listChunksByDoc(document.id));
    if (text.trim().length === 0) {
      const detail = sourceFailures.length > 0 ? sourceFailures.join("; ") : "its source could not be parsed \u2014 check the document processor settings, or re-import the file";
      throw new Error(`document "${document.title}" has no source text to reindex (${detail})`);
    }
    if (document.processing !== void 0) {
      try {
        const parsed = await this.artifacts.load(document.baseId, document.id, document.processing);
        if (parsed.text === text) return { text, processed: { text, parsed, processing: {
          ...document.processing,
          reused: true,
          warnings: [
            ...document.processing.warnings.filter((warning) => warning.code !== "source_unavailable"),
            { code: "source_unavailable", message: "Could not reparse the source; previous evidence was retained." }
          ]
        } } };
      } catch {
      }
    }
    return { text };
  }
  /** Reindexing a tracked directory is the same operation as re-importing its
   * source: one source identity, one diff engine, and one truthful result. */
  async rescanDirectory(document) {
    const sync = await this.syncDirectorySource(document, document.sourcePath, "synced");
    const current = this.requireStore().getDocument(document.id) ?? document;
    return { ...current, sync };
  }
  /** Synchronize a single source-root against disk. Root validation happens
   * before any write; child failures are preserved as itemized `partial`
   * outcomes instead of being rethrown after useful work succeeds. */
  async syncDirectorySource(root, sourcePath, mode) {
    const store = this.requireStore();
    if (root.sourceType !== "directory") throw new Error("directory sync requires a directory source");
    const canonicalSource = await this.canonicalDirectoryPath(sourcePath);
    try {
      await readdir8(canonicalSource, { withFileTypes: true });
    } catch (error) {
      throw new Error(`source directory is unreadable: ${error instanceof Error ? error.message : String(error)}`);
    }
    const allDocuments = store.listDocuments(root.baseId);
    const childrenByParent = /* @__PURE__ */ new Map();
    for (const document of allDocuments) {
      if (document.parentDirectoryId === void 0) continue;
      const children = childrenByParent.get(document.parentDirectoryId) ?? [];
      children.push(document);
      childrenByParent.set(document.parentDirectoryId, children);
    }
    const items = [];
    this.indexing.set(root.id, { baseId: root.baseId, title: root.title, phase: "parsing", total: 0, progress: 0 });
    try {
      const boundRoot = await this.bindDocumentSourcePath(root, canonicalSource);
      items.push({
        relativePath: ".",
        kind: "directory",
        documentId: boundRoot.id,
        action: mode === "created" ? "created" : boundRoot === root ? "unchanged" : "updated"
      });
      await this.syncDirectoryNode({
        rootPath: canonicalSource,
        diskPath: canonicalSource,
        directory: boundRoot,
        depth: 0,
        childrenByParent,
        items
      });
      const current = store.getDocument(root.id);
      if (current !== void 0) await store.putDocument({ ...current, updatedAt: Date.now() });
      await this.touchBase(root.baseId);
    } finally {
      this.indexing.delete(root.id);
    }
    const count = (action) => items.filter((item) => item.action === action).length;
    const failed = count("failed");
    const changed = count("created") + count("updated") + count("deleted");
    return {
      sourceId: root.id,
      status: failed > 0 ? "partial" : changed === 0 ? "unchanged" : "synced",
      created: count("created"),
      updated: count("updated"),
      unchanged: count("unchanged"),
      deleted: count("deleted"),
      failed,
      items
    };
  }
  async bindDocumentSourcePath(document, sourcePath) {
    if (document.sourcePath === sourcePath) return document;
    const next = { ...document, sourcePath, updatedAt: Date.now() };
    await this.requireStore().putDocument(next);
    return next;
  }
  directoryItemError(error) {
    if (error instanceof DirectorySourceError) return { code: error.code, message: error.message };
    return {
      code: "sync_failed",
      message: error instanceof Error ? error.message : String(error)
    };
  }
  /** Resolve a direct child by its physical source path. A legacy child can be
   * adopted only when its name and kind are unique; two candidates are an
   * explicit ambiguity, never a first-match guess. */
  resolveDirectoryChild(children, kind, diskPath, name) {
    const expectedType = kind === "directory" ? "directory" : "file";
    const fullPath = join12(diskPath, name);
    const exact = children.filter(
      (child2) => child2.sourceType === expectedType && child2.sourcePath !== void 0 && this.sameSourcePath(child2.sourcePath, fullPath)
    );
    if (exact.length > 1) return { ambiguous: exact };
    if (exact.length === 1) return { document: exact[0] };
    const legacy = children.filter(
      (child2) => child2.sourceType === expectedType && child2.sourcePath === void 0 && (kind === "directory" ? child2.title : child2.fileName ?? child2.title) === name
    );
    if (legacy.length > 1) return { ambiguous: legacy };
    return legacy.length === 1 ? { document: legacy[0] } : {};
  }
  async syncDirectoryNode(args) {
    const { rootPath, diskPath, directory, depth, childrenByParent, items } = args;
    if (depth > DIRECTORY_MAX_DEPTH) {
      items.push({
        relativePath: this.relativeSourcePath(rootPath, diskPath),
        kind: "directory",
        documentId: directory.id,
        action: "failed",
        error: { code: "max_depth", message: `directory depth exceeds the ${DIRECTORY_MAX_DEPTH} level limit` }
      });
      return;
    }
    let entries;
    try {
      entries = await readdir8(diskPath, { withFileTypes: true });
    } catch (error) {
      items.push({
        relativePath: this.relativeSourcePath(rootPath, diskPath),
        kind: "directory",
        documentId: directory.id,
        action: "failed",
        error: this.directoryItemError(error)
      });
      return;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    const entriesByName = new Map(entries.map((entry) => [entry.name, entry]));
    let children = [...childrenByParent.get(directory.id) ?? []];
    for (const child2 of [...children]) {
      if (child2.sourcePath === void 0 || this.sourcePathKey(dirname9(child2.sourcePath)) !== this.sourcePathKey(diskPath)) continue;
      const entry = entriesByName.get(basename3(child2.sourcePath));
      const actualKind = entry?.isDirectory() === true ? "directory" : entry?.isFile() === true ? "file" : void 0;
      const expectedKind = child2.sourceType === "directory" ? "directory" : child2.sourceType === "file" ? "file" : void 0;
      if (expectedKind === void 0 || actualKind === expectedKind || actualKind === void 0 && entry !== void 0) continue;
      try {
        await this.deleteTrackedSyncSubtree(child2, rootPath, items);
        children = children.filter((candidate) => candidate.id !== child2.id);
        childrenByParent.set(directory.id, children);
      } catch (error) {
        items.push({
          relativePath: this.relativeSourcePath(rootPath, child2.sourcePath),
          kind: expectedKind,
          documentId: child2.id,
          action: "failed",
          error: this.directoryItemError(error)
        });
      }
    }
    for (const entry of entries) {
      const fullPath = join12(diskPath, entry.name);
      const relativePath = this.relativeSourcePath(rootPath, fullPath);
      if (entry.isDirectory()) {
        const resolved2 = this.resolveDirectoryChild(children, "directory", diskPath, entry.name);
        if (resolved2.ambiguous !== void 0) {
          items.push({
            relativePath,
            kind: "directory",
            action: "failed",
            error: {
              code: "ambiguous_source",
              message: `multiple stored directory items match ${relativePath}`
            }
          });
          continue;
        }
        try {
          let child2 = resolved2.document;
          let action = "unchanged";
          if (child2 === void 0) {
            child2 = await this.createDirectory(directory.baseId, entry.name, directory.id);
            action = "created";
            children.push(child2);
            childrenByParent.set(directory.id, children);
          }
          const bound = await this.bindDocumentSourcePath(child2, fullPath);
          if (bound !== child2 && action === "unchanged") action = "updated";
          const childIndex = children.findIndex((candidate) => candidate.id === child2.id);
          if (childIndex >= 0) children[childIndex] = bound;
          items.push({ relativePath, kind: "directory", documentId: bound.id, action });
          await this.syncDirectoryNode({ rootPath, diskPath: fullPath, directory: bound, depth: depth + 1, childrenByParent, items });
        } catch (error) {
          items.push({ relativePath, kind: "directory", action: "failed", error: this.directoryItemError(error) });
        }
        continue;
      }
      if (!entry.isFile() || !DIRECTORY_EXTENSIONS.has(extname2(entry.name).toLowerCase())) continue;
      const resolved = this.resolveDirectoryChild(children, "file", diskPath, entry.name);
      if (resolved.ambiguous !== void 0) {
        items.push({
          relativePath,
          kind: "file",
          action: "failed",
          error: { code: "ambiguous_source", message: `multiple stored file items match ${relativePath}` }
        });
        continue;
      }
      try {
        let document = resolved.document;
        let action;
        if (document === void 0) {
          document = await this.ingestDirectoryFile(directory.baseId, directory.id, fullPath, entry.name);
          action = "created";
          children.push(document);
          childrenByParent.set(directory.id, children);
        } else {
          action = await this.syncDirectoryFile(document, fullPath, entry.name);
          const refreshed = this.requireStore().getDocument(document.id);
          if (refreshed !== void 0) {
            const documentIndex = children.findIndex((candidate) => candidate.id === document.id);
            if (documentIndex >= 0) children[documentIndex] = refreshed;
            document = refreshed;
          }
        }
        items.push({ relativePath, kind: "file", documentId: document.id, action });
      } catch (error) {
        items.push({ relativePath, kind: "file", documentId: resolved.document?.id, action: "failed", error: this.directoryItemError(error) });
      }
    }
  }
  async ingestDirectoryFile(baseId, parentDirectoryId, sourcePath, fileName) {
    return this.ingestPathFile(baseId, sourcePath, fileName, parentDirectoryId);
  }
  /** Persist source/placeholder before parsing, so path imports recover just
   * like uploads if the host stops during a long-running processor call. */
  async ingestPathFile(baseId, sourcePath, fileName, parentDirectoryId) {
    const store = this.requireStore();
    const buffer = await readFile9(sourcePath);
    const documentId = crypto.randomUUID();
    const rawFilePath = await store.raw?.write(baseId, documentId, safeRawExtension(fileName), buffer);
    const controller = new AbortController();
    try {
      if (store.getBase(baseId) === void 0) throw new NotFoundError("knowledge base no longer exists");
      await store.putDocument({
        id: documentId,
        baseId,
        title: fileName,
        fileName,
        sourceType: "file",
        sourcePath,
        rawFilePath,
        parentDirectoryId,
        charCount: 0,
        chunkCount: 0,
        createdAt: Date.now(),
        incomplete: true
      });
      this.indexing.set(documentId, { baseId, title: fileName, phase: "parsing", total: 0, progress: 0, controller });
      const processed = await this.extractDocumentText({ baseId, documentId, bytes: buffer, fileName, signal: controller.signal });
      return await this.ingestDocument({
        baseId,
        title: fileName,
        sourceType: "file",
        fileName,
        parentDirectoryId,
        placeholderId: documentId,
        processed,
        rawFilePath,
        sourcePath,
        text: processed.text
      }, controller.signal);
    } catch (error) {
      if (!isMetadataWriteFailure(error) && error.published !== true) {
        if (store.getDocument(documentId) !== void 0) await this.deleteDocumentRecursive(documentId);
        else if (rawFilePath !== void 0) await store.raw?.delete(rawFilePath);
      }
      throw error;
    } finally {
      this.indexing.delete(documentId);
      this.processingProgress.delete(documentId);
    }
  }
  /** Returns unchanged only when the live bytes exactly match the stored raw
   * snapshot. A changed source is parsed once up front so an invalid on-disk
   * replacement cannot be silently treated as a successful old-snapshot
   * rebuild. */
  async syncDirectoryFile(document, sourcePath, fileName) {
    if (this.indexing.has(document.id)) throw new Error(`"${document.title}" is still being indexed \u2014 try again when it finishes`);
    const store = this.requireStore();
    const buffer = await readFile9(sourcePath);
    const bound = await this.bindDocumentSourcePath(document, sourcePath);
    const stored = bound.rawFilePath !== void 0 ? await store.raw?.read(bound.rawFilePath) : void 0;
    const unchanged = stored !== void 0 && stored !== null && stored.byteLength > 0 && Buffer.from(stored).equals(buffer);
    if (unchanged) return bound === document ? "unchanged" : "updated";
    await this.reindexDocument(bound.id, { mode: "reparse", strictSource: true });
    return "updated";
  }
  async deleteTrackedSyncSubtree(document, rootPath, items) {
    const store = this.requireStore();
    const byParent = /* @__PURE__ */ new Map();
    for (const candidate of store.listDocuments(document.baseId)) {
      if (candidate.parentDirectoryId === void 0) continue;
      const children = byParent.get(candidate.parentDirectoryId) ?? [];
      children.push(candidate);
      byParent.set(candidate.parentDirectoryId, children);
    }
    const nodes = [];
    const collect = (node) => {
      nodes.push(node);
      for (const child2 of byParent.get(node.id) ?? []) collect(child2);
    };
    collect(document);
    await this.deleteDocumentRecursive(document.id);
    for (const node of nodes) {
      items.push({
        relativePath: node.sourcePath !== void 0 ? this.relativeSourcePath(rootPath, node.sourcePath) : node.title,
        kind: node.sourceType === "directory" ? "directory" : "file",
        documentId: node.id,
        action: "deleted"
      });
    }
  }
  /** Reindex a whole base synchronously. Collects per-root failures instead of
   *  aborting the sweep: one unreadable source (a moved folder, an unmounted
   *  drive) must not stop the remaining documents, exactly as the background job
   *  and the bulk endpoint already behave. */
  async reindexBase(baseId) {
    const store = this.requireStore();
    if (store.getBase(baseId) === void 0) throw new Error(`knowledge base not found: ${baseId}`);
    const ids = store.listDocuments(baseId).map((doc) => doc.id);
    let reindexed = 0;
    let skipped = 0;
    let failed = 0;
    const items = [];
    for (const id of this.outermostSelectedIds(ids)) {
      if (this.indexing.has(id)) {
        skipped += 1;
        continue;
      }
      try {
        const result = await this.reindexDocument(id);
        reindexed += 1;
        if (result.sync !== void 0) {
          items.push(...result.sync.items);
          failed += result.sync.failed;
        }
      } catch (error) {
        failed += 1;
        const document = store.getDocument(id);
        items.push({
          relativePath: document?.title ?? id,
          kind: document?.sourceType === "directory" ? "directory" : "file",
          documentId: id,
          action: "failed",
          error: this.directoryItemError(error)
        });
      }
    }
    return { reindexed, skipped, failed, items };
  }
  /** Start re-embedding a whole base as a cancellable background job.
   *
   *  `total` counts the folded SOURCE ROOTS the job walks, which is the same unit
   *  as `imported`, so `imported / total` stays meaningful. `documentTotal` is the
   *  size of the base in documents, because a client that compares the job's
   *  total with its document count would otherwise read one directory holding 200
   *  files as a single unit of work. */
  async startReindexBase(baseId) {
    const store = this.requireStore();
    if (store.getBase(baseId) === void 0) throw new Error(`knowledge base not found: ${baseId}`);
    const documents = store.listDocuments(baseId);
    const roots = this.outermostSelectedIds(documents.map((document) => document.id));
    const jobId = crypto.randomUUID();
    this.pruneJobs();
    this.jobs.set(jobId, {
      baseId,
      kind: "reindex",
      cancelled: false,
      imported: 0,
      skipped: 0,
      total: roots.length,
      current: "",
      errors: [],
      done: false
    });
    this.runBackground("reindex job", this.runReindexJob(jobId, baseId));
    return { jobId, total: roots.length, documentTotal: documents.length };
  }
  /** Progress snapshot of an active (or just-finished) reindex job. */
  reindexJobStatus(jobId) {
    return this.jobs.get(jobId);
  }
  cancelReindexJob(jobId) {
    const job2 = this.jobs.get(jobId);
    if (job2 !== void 0 && !job2.done) job2.cancelled = true;
  }
  async runReindexJob(jobId, baseId) {
    const job2 = this.jobs.get(jobId);
    if (job2 === void 0) return;
    const store = this.requireStore();
    const roots = this.outermostSelectedIds(store.listDocuments(baseId).map((document) => document.id));
    for (const id of roots) {
      if (job2.cancelled) break;
      const doc = store.getDocument(id);
      if (doc === void 0) continue;
      job2.current = doc.title;
      if (doc.sourceType === "directory" && doc.sourcePath === void 0) {
        job2.skipped += 1;
        continue;
      }
      if (this.indexing.has(doc.id)) {
        job2.skipped += 1;
        continue;
      }
      try {
        await this.reindexDocument(doc.id);
        job2.imported += 1;
      } catch (error) {
        job2.errors.push({ file: doc.title, error: error instanceof Error ? error.message : String(error) });
      }
    }
    job2.done = true;
    job2.current = "";
  }
  async reindexDocuments(ids) {
    const store = this.requireStore();
    let reindexed = 0;
    let skipped = 0;
    let failed = 0;
    const items = [];
    for (const id of this.outermostSelectedIds(ids)) {
      const document = store.getDocument(id);
      if (document === void 0) continue;
      if (this.indexing.has(id)) {
        skipped += 1;
        continue;
      }
      try {
        const result = await this.reindexDocument(id);
        reindexed += 1;
        if (result.sync !== void 0) {
          items.push(...result.sync.items);
          failed += result.sync.failed;
        }
      } catch (error) {
        failed += 1;
        items.push({
          relativePath: document.title,
          kind: document.sourceType === "directory" ? "directory" : "file",
          documentId: document.id,
          action: "failed",
          error: this.directoryItemError(error)
        });
      }
    }
    return { reindexed, skipped, failed, items };
  }
  /** Delete a selection (folded to its outermost roots).
   *
   *  `deleted` is the number of DOCUMENTS removed, including the descendants of
   *  a selected directory — the meaning it had before 4.0 folded the selection.
   *  Counting folded roots instead made the confirmation ("delete these N rows")
   *  and the result ("deleted: 1" for a directory holding 200 files) describe the
   *  same action with different numbers. `roots` carries the folded count. */
  async deleteDocuments(ids, options) {
    const store = this.requireStore();
    if (ids.length === 0) throw new Error("no documents selected");
    const roots = this.assertDeleteImpacts(ids, options?.recursive === true);
    const touched = /* @__PURE__ */ new Set();
    let deleted = 0;
    let removedRoots = 0;
    for (const id of roots) {
      const document = store.getDocument(id);
      if (document === void 0) continue;
      const impact = this.getDeleteImpact(id);
      deleted += impact.directories + impact.files;
      await this.deleteDocumentRecursive(id);
      touched.add(document.baseId);
      removedRoots += 1;
    }
    for (const baseId of touched) await this.touchBase(baseId);
    await this.reconcileAfterDelete();
    return { deleted, roots: removedRoots };
  }
  /**
   * Resolve inclusion metadata and title exclusions within the requested base
   * scope. Exclusion-only requests leave docIds absent rather than enumerating
   * every remaining document. An empty docIds array matches no documents.
   */
  resolveSearchFilter(request) {
    const filter = request.filter;
    if (filter === void 0) return void 0;
    const { docIds, excludeDocIds, titleIncludes, titleExcludes, sourceTypes, updatedAfter, updatedBefore } = filter;
    if (docIds !== void 0 && docIds.length === 0) return { docIds: [] };
    if (sourceTypes !== void 0 && sourceTypes.length === 0) return { docIds: [] };
    const hasDocIds = docIds !== void 0;
    const title = titleIncludes?.trim().toLowerCase();
    const hasTitle = title !== void 0 && title.length > 0;
    const hasTypes = sourceTypes !== void 0;
    const hasTime = updatedAfter !== void 0 || updatedBefore !== void 0;
    const hasInclusion = hasDocIds || hasTitle || hasTypes || hasTime;
    const excludedTitles = [...new Set((titleExcludes ?? []).map((term) => term.trim().toLowerCase()).filter((term) => term.length > 0))];
    const excluded = new Set(excludeDocIds);
    if (!hasInclusion && excluded.size === 0 && excludedTitles.length === 0) return void 0;
    if (!hasInclusion && excludedTitles.length === 0) return { excludeDocIds: [...excluded] };
    const store = this.requireStore();
    const scope = request.baseId !== void 0 ? [request.baseId] : request.baseIds !== void 0 && request.baseIds.length > 0 ? [...request.baseIds] : store.listBases().map((base) => base.id);
    const included = hasDocIds ? new Set(docIds) : void 0;
    const allowed = hasInclusion ? /* @__PURE__ */ new Set() : void 0;
    for (const baseId of scope) {
      for (const doc of store.listDocuments(baseId)) {
        const normalizedTitle = doc.title.toLowerCase();
        if (excludedTitles.some((term) => normalizedTitle.includes(term))) excluded.add(doc.id);
        if (allowed === void 0 || excluded.has(doc.id)) continue;
        if (included !== void 0 && !included.has(doc.id)) continue;
        if (hasTitle && !normalizedTitle.includes(title)) continue;
        if (hasTypes && !sourceTypes.includes(doc.sourceType)) continue;
        if (updatedAfter !== void 0 && (doc.updatedAt ?? doc.createdAt) < updatedAfter) continue;
        if (updatedBefore !== void 0 && (doc.updatedAt ?? doc.createdAt) > updatedBefore) continue;
        allowed.add(doc.id);
      }
    }
    return {
      ...allowed !== void 0 ? { docIds: [...allowed] } : {},
      ...excluded.size > 0 ? { excludeDocIds: [...excluded] } : {}
    };
  }
  /**
   * Fold a set of selected document ids to its outermost roots (Cherry's
   * `getOutermostSelectedItemIds`): ids that are descendants of another
   * selected id are dropped, so a directory plus one of its children in the
   * same batch resolves to just the directory — the subtree is then handled
   * once by the recursive operations.
   */
  outermostSelectedIds(ids) {
    const store = this.requireStore();
    const selected = new Set(ids.filter((id) => store.getDocument(id) !== void 0));
    if (selected.size === 0) return [];
    const childrenOf = /* @__PURE__ */ new Map();
    for (const base of store.listBases()) {
      for (const doc of store.listDocuments(base.id)) {
        const parent = doc.parentDirectoryId;
        if (parent === void 0) continue;
        const list = childrenOf.get(parent) ?? [];
        list.push(doc.id);
        childrenOf.set(parent, list);
      }
    }
    const inner = /* @__PURE__ */ new Set();
    const walk = (docId, depth) => {
      if (depth > 0 && selected.has(docId)) inner.add(docId);
      for (const child2 of childrenOf.get(docId) ?? []) walk(child2, depth + 1);
    };
    for (const id of selected) walk(id, 0);
    return [...selected].filter((id) => !inner.has(id));
  }
  listDocuments(baseId) {
    const store = this.requireStore();
    const { withChunks, missingEmbedding } = store.docChunkStatus(baseId);
    const allDocs = store.listDocuments(baseId);
    const childCount = /* @__PURE__ */ new Map();
    for (const doc of allDocs) {
      if (doc.parentDirectoryId !== void 0) {
        childCount.set(doc.parentDirectoryId, (childCount.get(doc.parentDirectoryId) ?? 0) + 1);
      }
    }
    return allDocs.map((doc) => {
      const embedded = withChunks.has(doc.id) && !missingEmbedding.has(doc.id);
      const active2 = this.indexing.get(doc.id);
      let status = "pending";
      if (doc.sourceType !== "directory") {
        if (doc.embeddingError !== void 0) status = "failed";
        else if (active2 !== void 0) status = "processing";
        else if (embedded) status = "completed";
      }
      return {
        id: doc.id,
        baseId: doc.baseId,
        title: doc.title,
        sourceType: doc.sourceType,
        fileName: doc.fileName,
        url: doc.url,
        ...doc.parentDirectoryId !== void 0 ? { parentDirectoryId: doc.parentDirectoryId } : {},
        ...doc.sourcePath !== void 0 ? { sourcePath: doc.sourcePath } : {},
        ...doc.processing !== void 0 ? { processing: doc.processing } : {},
        charCount: doc.charCount,
        tokenCount: doc.tokenCount,
        chunkCount: doc.chunkCount,
        ...doc.sourceType === "directory" ? { childCount: childCount.get(doc.id) ?? 0 } : {},
        embedded,
        ...doc.embeddingError !== void 0 ? { embeddingError: doc.embeddingError } : {},
        ...doc.errorCode !== void 0 ? { errorCode: doc.errorCode } : {},
        ...doc.sourceType !== "directory" ? { status } : {},
        ...active2 !== void 0 ? { indexingProgress: active2.progress, indexingPhase: active2.phase } : {},
        createdAt: doc.createdAt,
        ...doc.updatedAt !== void 0 ? { updatedAt: doc.updatedAt } : {}
      };
    });
  }
  /** Pre-order DFS outline of one base's directory tree (kb_list outline mode). */
  listBaseOutline(baseId) {
    const summaries = this.listDocuments(baseId);
    const children = /* @__PURE__ */ new Map();
    const roots = [];
    for (const doc of summaries) {
      if (doc.parentDirectoryId === void 0) roots.push(doc);
      else {
        const list = children.get(doc.parentDirectoryId) ?? [];
        list.push(doc);
        children.set(doc.parentDirectoryId, list);
      }
    }
    const byTitle = (a, b) => a.title.localeCompare(b.title);
    roots.sort(byTitle);
    for (const list of children.values()) list.sort(byTitle);
    const nodes = [];
    const walk = (doc, depth) => {
      nodes.push({
        depth,
        docId: doc.id,
        title: doc.title,
        type: doc.sourceType,
        status: doc.status ?? "completed"
      });
      for (const child2 of children.get(doc.id) ?? []) walk(child2, depth + 1);
    };
    for (const root of roots) walk(root, 0);
    return { baseId, totalItems: summaries.length, nodes };
  }
  /** Live progress plus recent terminal failures for client-side recovery. */
  indexingStatus() {
    const now = Date.now();
    const out = [];
    for (const [docId, entry] of this.indexing) {
      out.push({
        docId,
        baseId: entry.baseId,
        title: entry.title,
        phase: entry.phase,
        progress: entry.progress,
        ...this.processingProgress.has(docId) ? { processingProgress: this.processingProgress.get(docId) } : {}
      });
    }
    for (const [docId, entry] of [...this.progressLinger]) {
      if (entry.expireAt <= now) {
        this.progressLinger.delete(docId);
        continue;
      }
      out.push({ docId, baseId: entry.baseId, title: entry.title, phase: entry.phase, progress: entry.progress });
    }
    for (const [docId, failure] of [...this.indexingFailures]) {
      if (failure.expireAt <= now) {
        this.indexingFailures.delete(docId);
        continue;
      }
      out.push({
        docId,
        baseId: failure.baseId,
        title: failure.title,
        phase: failure.phase,
        progress: 0,
        status: "failed",
        error: { code: failure.code, message: failure.message }
      });
    }
    return out;
  }
  /** Probe only the saved endpoint: never accept an arbitrary caller URL. */
  mineruDeployment = new MineruDeployment(
    () => join12(dirname9(resolveChunkStorePath(this.baseConfig.chunkStorePath)), "mineru-management.json"),
    {},
    () => {
      const config = this.getConfig();
      return { hfEndpoint: config.hfEndpoint, pythonIndexUrl: config.mineruPythonIndexUrl };
    }
  );
  get managementBindHost() {
    return this.ctx.webServer.host;
  }
  async checkProcessor(baseId) {
    if (baseId !== void 0 && this.requireStore().getBase(baseId) === void 0) throw new NotFoundError("knowledge base not found");
    const config = baseId === void 0 ? this.getConfig() : this.getConfigFor(baseId);
    return probeMineruLocal({ apiUrl: config.mineruLocalUrl ?? "http://127.0.0.1:8000", apiKey: config.mineruLocalApiKey, tier: config.mineruTier, timeoutMs: 1e4 });
  }
  cancelProcessing(id) {
    if (this.requireStore().getDocument(id) === void 0) throw new NotFoundError("document not found");
    const parsing = this.processingControllers.get(id);
    const indexing = this.indexing.get(id)?.controller;
    parsing?.abort();
    indexing?.abort();
    return { cancelled: parsing !== void 0 || indexing !== void 0 };
  }
  async readDocumentEvidence(id, options = {}) {
    const doc = this.requireStore().getDocument(id);
    if (doc === void 0) throw new NotFoundError("document not found");
    if (options.revision !== void 0 && doc.processing?.revision !== options.revision) throw new NotFoundError("evidence revision is no longer current; search again");
    if (doc.processing === void 0) return { documentId: id, title: doc.title, blocks: [], assets: [], estimatedTokens: 0, truncated: false };
    const parsed = await this.artifacts.load(doc.baseId, id, doc.processing);
    return composeDocumentEvidence(doc, parsed, options);
  }
  async getEvidenceAsset(id, assetId, revision) {
    const doc = this.requireStore().getDocument(id);
    if (doc?.processing === void 0 || doc.processing.revision !== revision) throw new NotFoundError("evidence revision is no longer current; refresh the document");
    const asset = await this.artifacts.readAsset(doc.baseId, id, doc.processing, assetId);
    if (asset === void 0) throw new NotFoundError("evidence asset not found");
    return { ...asset, fileName: assetId };
  }
  /** Current download/load state of an in-process embedding model. */
  async getLocalModelStatus(modelId) {
    const id = modelId?.trim() || DEFAULT_LOCAL_MODEL;
    const live = getLocalModelStatus(id);
    if (live.status !== "idle") return live;
    if (await isLocalModelDownloaded(id)) {
      return { model: id, status: "ready", progress: 100, message: "" };
    }
    return live;
  }
  /**
   * Embed one probe text through the given (or current) embedding config and
   * return the vector width — Cherry's `useEmbeddingDimensions` probe, run
   * before a config save so a wrong-dimension model is caught up front.
   * Local models answer from the catalog without loading the ~600MB pipeline.
   */
  async probeEmbeddingDimensions(options = {}) {
    const config = this.getConfig();
    const provider = options.provider ?? config.embeddingProvider;
    if (provider === "none") throw new Error("no embedding provider configured");
    const model = options.model ?? config.embeddingModel;
    if (provider === "local") {
      const descriptor = LOCAL_MODELS.find((entry) => entry.kind === "embedding" && entry.id === model);
      if (descriptor?.dimensions !== void 0) return descriptor.dimensions;
    }
    const [vector] = await embedTexts(
      provider,
      options.baseUrl ?? config.embeddingBaseUrl,
      model,
      options.apiKey ?? config.embeddingApiKey,
      ["test"]
    );
    if (vector === void 0 || vector.length === 0) throw new Error("embedding returned an empty vector");
    return vector.length;
  }
  // ── local model manager (settings "本地模型") ──────────────────────────────
  listLocalModels() {
    return listLocalModels();
  }
  downloadLocalModel(id) {
    return downloadLocalModel(id);
  }
  registerCustomLocalReranker(id) {
    return registerCustomLocalReranker(id);
  }
  selfTestLocalModel(id) {
    return selfTestLocalModel(id);
  }
  cancelLocalModel(id) {
    return cancelLocalModelDownload(id);
  }
  deleteLocalModel(id) {
    return deleteLocalModel(id);
  }
  // ── local OCR (scanned-PDF recognition, Cherry's local-document posture) ──
  getOcrStatus() {
    return getOcrModelStatus();
  }
  downloadOcr() {
    return downloadOcrModels(this.baseConfig.hfEndpoint);
  }
  deleteOcr() {
    return removeOcrModels().then(() => ({ deleted: true }));
  }
  // ── Ollama model management (pull + installed list for the settings page) ──
  listOllamaModels(baseUrl) {
    return listOllamaModels(baseUrl);
  }
  deleteOllamaModel(model, baseUrl) {
    return deleteOllamaModel(model, baseUrl);
  }
  pullOllamaModel(model, baseUrl) {
    return pullOllamaModel(model, baseUrl);
  }
  cancelOllamaPull(model) {
    cancelOllamaPull(model);
  }
  getOllamaPullStatus(model) {
    return getOllamaPullStatus(model);
  }
  /** In-flight pulls (the panel restores its progress cards from this on open). */
  activeOllamaPulls() {
    return activeOllamaPulls();
  }
  /** Resolve and create the directory only when the settings page opens it. */
  async prepareLocalModelCacheDirectory(path) {
    const requested = path?.trim();
    const target = requested ? resolve6(expandHomePath(requested)) : localModelCacheDir();
    await mkdir9(target, { recursive: true });
    return { path: target };
  }
  /**
   * Migrate downloaded local models (and OCR files) from the current cache
   * directory to `to`, then point the config there. Loaded models are
   * released first so file locks (Windows) cannot block the move; moves fall
   * back to copy+delete across drives. The directory may be empty — the
   * config still switches, so future downloads land in the new location.
   */
  async migrateLocalModels(to) {
    const store = this.requireStore();
    const target = resolve6(expandHomePath(to.trim() === "" ? "~/.dsh/cache/dsh-knowledge/local-models" : to.trim()));
    const from2 = localModelCacheDir();
    const samePath = process.platform === "win32" ? from2.toLowerCase() === target.toLowerCase() : from2 === target;
    if (samePath) return { moved: 0, from: from2, to: target };
    const managedRoot = (await this.mineruDeployment.status()).root;
    if (managedRoot) {
      const inside = (parent, child2) => {
        const rel = relative4(parent, child2);
        return rel === "" || !rel.startsWith("..") && !isAbsolute4(rel);
      };
      if (inside(from2, managedRoot) || inside(target, managedRoot) || inside(managedRoot, from2) || inside(managedRoot, target)) {
        throw new Error("MinerU \u6258\u7BA1\u76EE\u5F55\u4E0E\u7F13\u5B58\u8FC1\u79FB\u8DEF\u5F84\u91CD\u53E0\uFF1B\u8BF7\u4FDD\u6301 MinerU \u72EC\u7ACB\u76EE\u5F55\uFF0C\u4E0D\u968F\u5D4C\u5165\u6A21\u578B\u7F13\u5B58\u8FC1\u79FB\u3002");
      }
    }
    if (hasActiveLocalModelDownload() || hasActiveLocalRerankDownload()) {
      throw new Error("\u6A21\u578B\u6B63\u5728\u4E0B\u8F7D\uFF0C\u8BF7\u5148\u7B49\u5F85\u4E0B\u8F7D\u5B8C\u6210\u6216\u53D6\u6D88\u540E\u518D\u8FC1\u79FB");
    }
    await disposeLocalModelWorker();
    await disposeLocalRerankProcess();
    await disposeOcrWorker();
    const entries = await readdir8(from2).catch(() => []);
    let moved = 0;
    await mkdir9(target, { recursive: true });
    await cp(join12(from2, ".dsh-rerank-models.json"), join12(target, ".dsh-rerank-models.json"), { force: true }).catch(() => {
    });
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const source = join12(from2, entry);
      const dest = join12(target, entry);
      const info = await stat6(source).catch(() => null);
      if (info === null || !info.isDirectory()) continue;
      const src = process.platform === "win32" ? source.toLowerCase() : source;
      const dst = process.platform === "win32" ? dest.toLowerCase() : dest;
      const rel = relative4(src, dst);
      if (rel === "" || !rel.startsWith("..") && !isAbsolute4(rel)) continue;
      if (await stat6(dest).then(() => true).catch(() => false)) continue;
      try {
        await rename7(source, dest);
      } catch {
        await cp(source, dest, { recursive: true });
        await rm6(source, { recursive: true, force: true });
      }
      moved += 1;
    }
    await store.setConfigOverrides({ localModelCacheDir: target });
    setLocalModelCacheDir(target);
    return { moved, from: from2, to: target };
  }
  listChunks(documentId, limit, offset) {
    const start = clampInt3(offset ?? 0, 0, Number.MAX_SAFE_INTEGER, 0);
    const count = limit === void 0 ? void 0 : clampInt3(limit, 0, Number.MAX_SAFE_INTEGER, 0);
    return this.requireStore().listChunksByDoc(documentId, count, start);
  }
  /** Read a bounded ordered context window around one current chunk anchor. */
  getDocumentContext(documentId, options) {
    const hasChunkId = options.anchorChunkId !== void 0;
    const hasIndex = options.anchorIndex !== void 0;
    if (hasChunkId === hasIndex) throw new Error("provide exactly one of anchorChunkId or anchorIndex");
    if (options.focus !== void 0 && options.focus.length > 500) throw new Error("focus must not exceed 500 characters");
    const store = this.requireStore();
    const doc = store.getDocument(documentId);
    if (doc === void 0) throw new Error(`document not found: ${documentId}`);
    let anchor;
    if (options.anchorChunkId !== void 0) {
      anchor = store.getChunk(options.anchorChunkId);
      if (anchor === void 0) throw new Error("anchor chunk is stale or no longer exists; run knowledge_search again");
    } else {
      const requestedIndex = options.anchorIndex;
      if (!Number.isInteger(requestedIndex) || requestedIndex < 0 || requestedIndex >= doc.chunkCount) {
        throw new Error("anchorIndex is outside this document");
      }
      const index = requestedIndex;
      anchor = store.listChunksByIndexRange(documentId, index, index)[0];
      if (anchor === void 0) throw new Error("anchorIndex is outside this document");
    }
    if (anchor.docId !== documentId || anchor.baseId !== doc.baseId) {
      throw new Error("anchor chunk does not belong to the requested document");
    }
    const before = clampInt3(options.before ?? 2, 0, 10, 2);
    const after = clampInt3(options.after ?? 2, 0, 10, 2);
    const maxTokens = clampInt3(options.maxTokens ?? 1600, 128, 4096, 1600);
    const chunks = store.listChunksByIndexRange(documentId, anchor.index - before, anchor.index + after);
    const contextWindow = composeContextWindow(chunks, anchor, {
      before,
      after,
      maxTokens,
      focus: options.focus,
      crossHeading: options.crossHeading === true,
      documentChunkCount: doc.chunkCount
    });
    return {
      id: doc.id,
      baseId: doc.baseId,
      title: doc.title,
      sourceType: doc.sourceType,
      charCount: doc.charCount,
      chunkCount: doc.chunkCount,
      contextWindow
    };
  }
  getDocument(id, opts) {
    const store = this.requireStore();
    const doc = store.getDocument(id);
    if (doc === void 0) throw new Error(`document not found: ${id}`);
    const rawText = doc.rawText;
    const rawTextLimit = clampRawTextLimit(opts?.rawTextLimit);
    const truncated = rawText !== void 0 && rawTextLimit !== void 0 && rawText.length > rawTextLimit;
    return {
      id: doc.id,
      baseId: doc.baseId,
      title: doc.title,
      sourceType: doc.sourceType,
      ...doc.fileName !== void 0 ? { fileName: doc.fileName } : {},
      ...doc.url !== void 0 ? { url: doc.url } : {},
      ...doc.sourcePath !== void 0 ? { sourcePath: doc.sourcePath } : {},
      ...doc.rawFilePath !== void 0 ? { rawFilePath: doc.rawFilePath } : {},
      ...doc.processing !== void 0 ? { processing: doc.processing } : {},
      rawText: truncated ? rawText.slice(0, snapSliceEnd(rawText, rawTextLimit)) : rawText,
      ...truncated ? { rawTextTruncated: true } : {},
      charCount: doc.charCount,
      ...doc.tokenCount !== void 0 ? { tokenCount: doc.tokenCount } : {},
      chunkCount: doc.chunkCount,
      createdAt: doc.createdAt,
      ...opts?.includeChunks === false ? {} : { chunks: store.listChunksByDoc(id) }
    };
  }
  /** Original source bytes of a file document (for the download route). */
  async getRawFile(id) {
    const store = this.requireStore();
    const doc = store.getDocument(id);
    if (doc === void 0 || doc.rawFilePath === void 0) return void 0;
    const bytes = await store.raw?.read(doc.rawFilePath);
    if (bytes === null || bytes === void 0) return void 0;
    return { bytes, fileName: doc.fileName ?? doc.title, mimeType: doc.mimeType };
  }
  /** Read one document's source text as a `[charStart, charEnd)` slice (kb_read read mode). */
  readDocumentText(id, charStart, charEnd) {
    const store = this.requireStore();
    const doc = store.getDocument(id);
    if (doc === void 0) throw new Error(`document not found: ${id}`);
    const text = doc.rawText ?? reconstructFromChunks(store.listChunksByDoc(id));
    const total = text.length;
    const rawStart = clampInt3(charStart ?? 0, 0, total, 0);
    const start = snapSliceStart(text, rawStart);
    const naturalEnd = clampInt3(charEnd ?? total, start, total, total);
    const rawEnd = Math.max(start, Math.min(naturalEnd, start + CONCEPT_READ_MAX_CHARS));
    const end = Math.max(start, snapSliceEnd(text, rawEnd));
    return {
      id: doc.id,
      baseId: doc.baseId,
      title: doc.title,
      sourceType: doc.sourceType,
      totalChars: total,
      charStart: start,
      charEnd: end,
      content: text.slice(start, end),
      // "There is more to read" — true both when the 20k cap cut the slice
      // short and when the caller stopped before the document end.
      truncated: end < total
    };
  }
  /** Grep one document's source text for a regular expression (kb_read grep mode). */
  grepDocument(id, pattern2, maxMatches, ignoreCase = true) {
    const store = this.requireStore();
    const doc = store.getDocument(id);
    if (doc === void 0) throw new Error(`document not found: ${id}`);
    const text = doc.rawText ?? reconstructFromChunks(store.listChunksByDoc(id));
    let regex;
    try {
      regex = new RegExp(pattern2, `g${ignoreCase ? "i" : ""}`);
    } catch (error) {
      throw new Error(`invalid regex: ${error instanceof Error ? error.message : String(error)}`);
    }
    const cap = clampInt3(maxMatches ?? 50, 1, 200, 50);
    const matches = [];
    let totalMatches = 0;
    let lineNumber = 0;
    let lineStart = 0;
    while (lineStart <= text.length) {
      lineNumber += 1;
      const newlineIndex = text.indexOf("\n", lineStart);
      const lineEnd = newlineIndex === -1 ? text.length : newlineIndex;
      const line = text.slice(lineStart, snapSliceEnd(text, Math.min(lineEnd, lineStart + CONCEPT_GREP_MAX_LINE_CHARS)));
      regex.lastIndex = 0;
      for (let match = regex.exec(line); match !== null; match = regex.exec(line)) {
        totalMatches += 1;
        const matchLength = match[0].length;
        const matchStart = lineStart + match.index;
        const matchEnd = matchStart + matchLength;
        if (matches.length < cap) {
          const snippetStart = snapSliceStart(text, Math.max(0, matchStart - CONCEPT_GREP_SNIPPET_PAD));
          const snippetEnd = snapSliceEnd(text, Math.min(text.length, matchEnd + CONCEPT_GREP_SNIPPET_PAD));
          matches.push({
            line: lineNumber,
            charStart: matchStart,
            charEnd: matchEnd,
            snippet: `${snippetStart > 0 ? "\u2026" : ""}${text.slice(snippetStart, snippetEnd)}${snippetEnd < text.length ? "\u2026" : ""}`
          });
        }
        if (matchLength === 0) regex.lastIndex = match.index + 1;
      }
      lineStart = lineEnd + 1;
    }
    return { id: doc.id, baseId: doc.baseId, title: doc.title, totalMatches, matches };
  }
  // ── statistics ────────────────────────────────────────────────────────────
  stats(baseId) {
    const store = this.requireStore();
    if (baseId !== void 0 && store.getBase(baseId) === void 0) {
      throw new NotFoundError(`knowledge base not found: ${baseId}`);
    }
    const bases = baseId !== void 0 ? store.listBases().filter((base) => base.id === baseId) : store.listBases();
    const documents = bases.flatMap((base) => store.listDocuments(base.id));
    const charCount = documents.reduce((sum, doc) => sum + doc.charCount, 0);
    const tokenCount = documents.reduce((sum, doc) => sum + (doc.tokenCount ?? 0), 0);
    const chunkStats = store.chunkStats(bases.map((base) => base.id));
    let staleChunkCount = 0;
    let hasCurrentKey = false;
    for (const base of bases) {
      const key = embeddingKey(this.getConfigFor(base.id));
      if (key === void 0) continue;
      hasCurrentKey = true;
      for (const entry of chunkStats.embeddingModelCounts) {
        if (entry.baseId === base.id && entry.model !== key) staleChunkCount += entry.count;
      }
    }
    return {
      ...baseId !== void 0 ? { baseId } : {},
      documentCount: documents.length,
      storedDocCount: documents.reduce((sum, doc) => sum + (doc.rawFilePath !== void 0 ? 1 : 0), 0),
      chunkCount: chunkStats.count,
      charCount,
      tokenCount,
      embedded: chunkStats.embedded,
      ...chunkStats.dimensions !== void 0 ? { embeddingDimensions: chunkStats.dimensions } : {},
      ...hasCurrentKey && staleChunkCount > 0 ? { staleEmbeddings: true, staleChunkCount } : {}
    };
  }
  // ── retrieval ─────────────────────────────────────────────────────────────
  async search(request, execution = {}) {
    const startedAt = Date.now();
    throwIfAborted3(execution.signal);
    throwIfDeadline(execution.deadlineAt);
    const query = request.query.trim();
    if (query.length === 0) return emptySearchResult(query, request.mode ?? "lexical", 0);
    if (query.length > 2e3) throw new Error("search query must not exceed 2000 characters");
    const variants = normalizeQueryVariants(query, request.queries);
    const allowRerank = execution.rerank !== "skip";
    if (variants.length === 1) {
      return this.searchSingle({ ...request, query, queries: void 0 }, allowRerank, startedAt, execution.signal, execution.deadlineAt);
    }
    const config = this.getConfigFor(request.baseId);
    const requestedMode = request.mode ?? config.searchMode;
    const topK = clampInt3(request.topK ?? config.topK, 1, 50, 6);
    const subTopK = Math.min(50, Math.max(topK * 2, 12));
    const results = await Promise.all(variants.map((variant) => this.searchSingle({
      ...request,
      query: variant,
      queries: void 0,
      topK: subTopK
    }, false, startedAt, execution.signal, execution.deadlineAt)));
    throwIfAborted3(execution.signal);
    return this.finishMultiQuerySearch(config, query, requestedMode, results, topK, request.threshold, startedAt, allowRerank, execution.signal);
  }
  /** One retrieval pass. Multi-query orchestration lives in search() so each
   * variant cannot independently invoke an expensive reranker. */
  async searchSingle(request, allowRerank, startedAt, signal, deadlineAt) {
    throwIfAborted3(signal);
    throwIfDeadline(deadlineAt);
    const store = this.requireStore();
    const config = this.getConfigFor(request.baseId);
    const query = request.query.trim();
    if (query.length === 0) return emptySearchResult(query, request.mode ?? config.searchMode, 0);
    const requestedMode = request.mode ?? config.searchMode;
    const topK = clampInt3(request.topK ?? config.topK, 1, 50, 6);
    if (request.baseId === void 0 && request.baseIds !== void 0 && request.baseIds.length === 0) {
      return emptySearchResult(query, requestedMode, Date.now() - startedAt);
    }
    if (request.baseId !== void 0 && store.getBase(request.baseId) === void 0) {
      return emptySearchResult(query, requestedMode, 0);
    }
    const threshold = request.threshold ?? config.similarityThreshold;
    const documentFilter = this.resolveSearchFilter(request);
    if (documentFilter?.docIds !== void 0 && documentFilter.docIds.length === 0) {
      return emptySearchResult(query, requestedMode, Date.now() - startedAt);
    }
    const lane = store.retrievalLane;
    if (lane !== void 0) {
      const scope = request.baseId !== void 0 ? [request.baseId] : request.baseIds !== void 0 && request.baseIds.length > 0 ? [...request.baseIds] : store.listBases().map((base) => base.id);
      const poolSize2 = Math.min(Math.max(topK * 4, 20), LANE_CANDIDATE_CAP);
      let queryVector2;
      if ((requestedMode === "vector" || requestedMode === "hybrid" || requestedMode === "auto") && config.embeddingProvider !== "none") {
        try {
          const [vector] = await embedTexts(
            config.embeddingProvider,
            config.embeddingBaseUrl,
            config.embeddingModel,
            config.embeddingApiKey,
            [query],
            signal
          );
          throwIfAborted3(signal);
          queryVector2 = vector;
        } catch (error) {
          throwIfAborted3(signal);
          if (config.embeddingProvider === "local") {
            throw await localEmbeddingError(config, error);
          }
          this.ctx.logger.warn(`knowledge: embedding failed, using lexical retrieval: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      const useVector = queryVector2 !== void 0 && requestedMode !== "lexical";
      let ranked2 = [];
      const byId2 = /* @__PURE__ */ new Map();
      let total = 0;
      let vectorAttempted = false;
      let vectorSucceeded = false;
      let vectorReturned = 0;
      let vectorError;
      let lexicalAttempted = false;
      let lexicalSucceeded = false;
      let lexicalReturned = 0;
      let lexicalError;
      let vec;
      if (useVector) {
        vectorAttempted = true;
        try {
          vec = await lane.vector(queryVector2, scope, poolSize2, documentFilter, deadlineAt);
          vectorSucceeded = true;
          vectorReturned = vec.hits.length;
          total = Math.max(total, vec.total);
          for (const hit of vec.hits) byId2.set(hit.id, hit);
        } catch (error) {
          vectorError = retrievalErrorCode(error);
          this.ctx.logger.warn(`knowledge: vector retrieval failed, using lexical retrieval: ${safeErrorMessage(error)}`);
        }
      } else if (requestedMode !== "lexical" && config.embeddingProvider !== "none" && queryVector2 === void 0) {
        vectorError = "embedding_unavailable";
      }
      let lex;
      if (requestedMode !== "vector" || vec === void 0) {
        lexicalAttempted = true;
        try {
          lex = await lane.lexical(query, scope, poolSize2, documentFilter, deadlineAt);
          lexicalSucceeded = true;
          lexicalReturned = lex.hits.length;
          total = Math.max(total, lex.total);
          for (const hit of lex.hits) if (!byId2.has(hit.id)) byId2.set(hit.id, hit);
        } catch (error) {
          lexicalError = retrievalErrorCode(error);
          this.ctx.logger.warn(`knowledge: lexical retrieval failed: ${safeErrorMessage(error)}`);
        }
      }
      if (vec !== void 0 && lex !== void 0) {
        const vectorOrder = vec.hits.map((hit) => hit.id);
        const lexicalOrder = lex.hits.map((hit) => hit.id);
        const vectorWeight = config.rrfVectorWeight;
        const fused = reciprocalRankFusion([vectorOrder, lexicalOrder], [vectorWeight, 1]);
        const maxFused = (vectorWeight + 1) / (RRF_K + 1);
        const vectorScores = new Map(vec.hits.map((hit) => [hit.id, hit.score]));
        const lexicalScores = new Map(lex.hits.map((hit) => [hit.id, hit.score]));
        ranked2 = [.../* @__PURE__ */ new Set([...vectorOrder, ...lexicalOrder])].map((id) => ({
          id,
          score: (fused.get(id) ?? 0) / maxFused,
          vectorScore: vectorScores.get(id),
          lexicalScore: lexicalScores.get(id)
        }));
      } else if (vec !== void 0) {
        ranked2 = vec.hits.map((hit) => ({ id: hit.id, score: hit.score, vectorScore: hit.score }));
      } else if (lex !== void 0) {
        ranked2 = lex.hits.map((hit) => ({ id: hit.id, score: hit.score, lexicalScore: hit.score }));
      }
      const laneStatus = retrievalStatus(requestedMode, {
        attempted: lexicalAttempted,
        succeeded: lexicalSucceeded,
        returnedCount: lexicalReturned,
        ...lexicalError !== void 0 ? { errorCode: lexicalError } : {}
      }, {
        attempted: vectorAttempted,
        succeeded: vectorSucceeded,
        returnedCount: vectorReturned,
        ...vectorError !== void 0 ? { errorCode: vectorError } : {}
      });
      ranked2.sort((a, b) => b.score - a.score);
      if (request.mmr ?? config.mmrDiversity > 0) {
        if (config.mmrDiversity > 0 && queryVector2 !== void 0) {
          ranked2 = maximalMarginalRelevance(ranked2, byId2, queryVector2, config.mmrDiversity, Math.max(topK * 3, 12));
        }
      }
      throwIfAborted3(signal);
      return this.finishSearch(store, config, query, requestedMode, ranked2, byId2, topK, threshold, total, startedAt, laneStatus, allowRerank, signal);
    }
    const allowed = documentFilter?.docIds !== void 0 ? new Set(documentFilter.docIds) : void 0;
    const excluded = new Set(documentFilter?.excludeDocIds);
    const chunks = (request.baseId !== void 0 ? store.listChunks(request.baseId) : request.baseIds !== void 0 && request.baseIds.length > 0 ? request.baseIds.flatMap((id) => store.listChunks(id)) : store.listBases().flatMap((base) => store.listChunks(base.id))).filter((chunk) => (allowed === void 0 || allowed.has(chunk.docId)) && !excluded.has(chunk.docId));
    if (chunks.length === 0) return emptySearchResult(query, requestedMode, 0);
    const byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));
    const candidates = chunks.map((chunk) => ({
      id: chunk.id,
      text: chunkSearchText(chunk),
      embedding: chunk.embedding
    }));
    let queryVector;
    if (requestedMode !== "lexical" && config.embeddingProvider !== "none") {
      try {
        const [vector] = await embedTexts(
          config.embeddingProvider,
          config.embeddingBaseUrl,
          config.embeddingModel,
          config.embeddingApiKey,
          [query],
          signal
        );
        throwIfAborted3(signal);
        queryVector = vector;
      } catch (error) {
        throwIfAborted3(signal);
        if (config.embeddingProvider === "local") {
          throw await localEmbeddingError(config, error);
        }
        this.ctx.logger.warn(`knowledge: embedding failed, using lexical retrieval: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    const poolSize = Math.min(chunks.length, Math.max(topK * 4, 20));
    const ranked = rank(query, candidates, {
      mode: requestedMode,
      topK: poolSize,
      threshold: 0,
      mmr: request.mmr ?? config.mmrDiversity > 0,
      mmrLambda: config.mmrDiversity,
      queryVector
    });
    throwIfAborted3(signal);
    const retrieval = retrievalStatus(
      requestedMode,
      { attempted: true, succeeded: true, returnedCount: ranked.filter((hit) => hit.lexicalScore !== void 0).length },
      {
        attempted: requestedMode !== "lexical" && config.embeddingProvider !== "none",
        succeeded: queryVector !== void 0,
        returnedCount: ranked.filter((hit) => hit.vectorScore !== void 0).length
      }
    );
    return this.finishSearch(store, config, query, requestedMode, ranked, byId, topK, threshold, chunks.length, startedAt, retrieval, allowRerank, signal);
  }
  /** Merge independent query rankings with RRF, then optionally rerank once. */
  async finishMultiQuerySearch(config, query, requestedMode, results, topK, requestedThreshold, startedAt, allowRerank, signal) {
    const store = this.requireStore();
    throwIfAborted3(signal);
    const orders = results.map((result) => result.hits.map((hit) => hit.chunkId));
    const fused = reciprocalRankFusion(orders);
    const maxFused = results.length / (RRF_K + 1);
    const byId = /* @__PURE__ */ new Map();
    for (const result of results) {
      for (const hit of result.hits) if (!byId.has(hit.chunkId)) byId.set(hit.chunkId, hit);
    }
    let hits = [...byId.values()].map((hit) => ({ ...hit, score: (fused.get(hit.chunkId) ?? 0) / maxFused })).sort((a, b) => b.score - a.score).slice(0, Math.min(50, Math.max(topK * 4, 20)));
    const applied = await this.applyRerank(store, config, query, hits, topK, allowRerank, signal);
    hits = applied.hits;
    const retrieval = combineRetrievalStatus(requestedMode, results);
    const mode = retrieval.effectiveMode;
    const threshold = requestedThreshold ?? config.similarityThreshold;
    if (applied.reranked || mode === "vector") hits = hits.filter((hit) => hit.score >= threshold);
    const finalHits = attachContextWindows(store, hits.slice(0, topK), query, config.siblingChunks, SEARCH_EVIDENCE_TOKENS);
    return {
      query,
      mode,
      scoreKind: applied.reranked ? "rerank" : "rrf",
      retrieval,
      total: results.reduce((max, result) => Math.max(max, result.total), 0),
      reranked: applied.reranked,
      ...applied.rerank !== void 0 ? { rerank: applied.rerank } : {},
      elapsedMs: Date.now() - startedAt,
      hits: finalHits
    };
  }
  /** Shared tail: rerank (optional), threshold + top-K cut, and hit mapping. */
  async finishSearch(store, config, query, requestedMode, initial, byId, topK, threshold, total, startedAt, retrieval, allowRerank = true, signal) {
    throwIfAborted3(signal);
    const ranked = initial;
    const candidates = ranked.map((hit) => searchHitOf(store, byId.get(hit.id), hit)).filter((hit) => hit !== void 0);
    const applied = await this.applyRerank(store, config, query, candidates, topK, allowRerank, signal);
    const relevanceScores = applied.reranked || requestedMode === "vector";
    const hits = attachContextWindows(
      store,
      applied.hits.filter((hit) => relevanceScores ? hit.score >= threshold : true).slice(0, topK),
      query,
      config.siblingChunks,
      SEARCH_EVIDENCE_TOKENS
    );
    return {
      query,
      mode: retrieval.effectiveMode,
      scoreKind: applied.reranked ? "rerank" : scoreKindForMode(retrieval.effectiveMode),
      retrieval,
      total,
      reranked: applied.reranked,
      ...applied.rerank !== void 0 ? { rerank: applied.rerank } : {},
      elapsedMs: Date.now() - startedAt,
      hits
    };
  }
  /** One canonical rerank stage for both single-query retrieval and RRF-fused
   * multi-query retrieval. It owns contextual input, deadline/retry policy,
   * stable tie handling, structured degradation, and original-order fallback. */
  async applyRerank(store, config, query, input, topK, allowRerank, signal) {
    throwIfAborted3(signal);
    const original = [...input];
    const rerankModel = allowRerank ? config.rerankModel.trim() : "";
    if (rerankModel === "") return { hits: original, reranked: false };
    if (original.length <= 1) {
      return {
        hits: original,
        reranked: false,
        rerank: this.notNeededRerankStatus(rerankModel, original.length)
      };
    }
    const rerankQuery = fitRerankQuery(query);
    const contextual = attachContextWindows(
      store,
      original,
      query,
      config.siblingChunks,
      RERANK_EVIDENCE_TOKENS,
      (hit) => rerankTitleReserve(hit.documentTitle)
    );
    const candidateCount = contextual.length;
    const rerankStartedAt = Date.now();
    const rerankTimeoutMs = rerankModel.startsWith("local:") ? config.localRerankTimeoutMs + (localRerankChildIsWarm() ? 0 : LOCAL_RERANK_LOAD_ALLOWANCE_MS) : 6e4;
    try {
      const scores = await rerankCandidates(
        config.rerankBaseUrl,
        config.rerankModel,
        config.rerankApiKey,
        rerankQuery,
        contextual.map((hit) => ({
          id: hit.chunkId,
          text: rerankEvidenceText(hit)
        })),
        {
          topN: topK,
          timeoutMs: rerankTimeoutMs,
          deadlineAt: rerankStartedAt + rerankTimeoutMs,
          retries: rerankModel.startsWith("local:") ? 0 : 1,
          ...signal !== void 0 ? { signal } : {}
        }
      );
      throwIfAborted3(signal);
      const order = new Map(contextual.map((hit, index) => [hit.chunkId, index]));
      const rescored = contextual.filter((hit) => scores.has(hit.chunkId)).map((hit) => ({ ...hit, score: scores.get(hit.chunkId) })).sort((left, right) => right.score - left.score || (order.get(left.chunkId) ?? 0) - (order.get(right.chunkId) ?? 0));
      if (rescored.length === 0) {
        const detail = {
          code: "invalid_response",
          message: "rerank provider returned no scored candidates",
          retryable: false,
          action: "check_config"
        };
        const rerank = this.degradedRerankStatus(rerankModel, candidateCount, Date.now() - rerankStartedAt, detail);
        this.logRerankFailure(rerankModel, detail.code, candidateCount, rerank.elapsedMs ?? 0, detail.message);
        return { hits: original, reranked: false, rerank };
      }
      this.rerankLogState.delete(rerankModel);
      return {
        hits: rescored,
        reranked: true,
        rerank: this.appliedRerankStatus(rerankModel, candidateCount, Date.now() - rerankStartedAt)
      };
    } catch (error) {
      throwIfAborted3(signal);
      const detail = rerankErrorDetail(error);
      const rerank = this.degradedRerankStatus(rerankModel, candidateCount, Date.now() - rerankStartedAt, detail);
      this.logRerankFailure(rerankModel, detail.code, candidateCount, rerank.elapsedMs ?? 0, rerankTechnicalMessage(error));
      return { hits: original, reranked: false, rerank };
    }
  }
  rerankProvider(model) {
    return model.startsWith("local:") ? "local" : "remote";
  }
  notNeededRerankStatus(model, candidateCount) {
    return {
      configured: true,
      provider: this.rerankProvider(model),
      model,
      status: "not_needed",
      attempted: false,
      applied: false,
      candidateCount
    };
  }
  appliedRerankStatus(model, candidateCount, elapsedMs) {
    return {
      configured: true,
      provider: this.rerankProvider(model),
      model,
      status: "applied",
      attempted: true,
      applied: true,
      candidateCount,
      elapsedMs
    };
  }
  degradedRerankStatus(model, candidateCount, elapsedMs, error) {
    const skipped = ["model_not_downloaded", "model_checking", "model_unhealthy", "unsupported_model", "circuit_open", "busy"].includes(error.code);
    return {
      configured: true,
      provider: this.rerankProvider(model),
      model,
      // A gate refusal is not a degradation: nothing was attempted, so say so
      // and omit the elapsed time rather than reporting a failure at 0ms.
      status: skipped ? "skipped" : "degraded",
      attempted: !skipped,
      applied: false,
      candidateCount,
      ...skipped ? {} : { elapsedMs },
      error
    };
  }
  logRerankFailure(model, code, candidateCount, elapsedMs, technicalMessage) {
    if (this.rerankLogState.get(model) === code) return;
    this.rerankLogState.set(model, code);
    this.ctx.logger.warn(`knowledge: rerank degraded model=${JSON.stringify(model)} code=${code} candidates=${candidateCount} elapsedMs=${elapsedMs} detail=${JSON.stringify(technicalMessage)}`);
  }
  // ── internal ──────────────────────────────────────────────────────────────
  /**
   * How many parse+ingest tasks may run concurrently per base (Cherry Studio:
   * 5, on a per-base queue). Local-model inference no longer constrains this:
   * it runs in a dedicated worker thread (see embed.ts), exactly like Cherry's
   * own-worker embedding service.
   */
  static INGEST_CONCURRENCY = 5;
  ingestConcurrency() {
    return _KnowledgeService.INGEST_CONCURRENCY;
  }
  /** Queue one parse+ingest task behind a per-base worker pool (Cherry's job queue). */
  enqueueIngest(baseId, task) {
    let entry = this.ingestQueues.get(baseId);
    if (entry === void 0) {
      entry = { pending: [], running: 0 };
      this.ingestQueues.set(baseId, entry);
    }
    entry.pending.push(task);
    this.pumpIngestQueue(baseId);
  }
  pumpIngestQueue(baseId) {
    const entry = this.ingestQueues.get(baseId);
    if (entry === void 0) return;
    const concurrency = this.ingestConcurrency();
    while (entry.running < concurrency && entry.pending.length > 0) {
      const task = entry.pending.shift();
      if (task === void 0) break;
      entry.running += 1;
      void task().finally(() => {
        entry.running -= 1;
        this.pumpIngestQueue(baseId);
      }).catch((error) => {
        this.ctx.logger.warn(`knowledge: ingest task failed: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
    if (entry.running === 0 && entry.pending.length === 0) this.ingestQueues.delete(baseId);
  }
  /** Serialize a read-then-write section per base (dedup check + first persist). */
  withBaseWriteLock(baseId, fn) {
    const prev = this.baseWriteChains.get(baseId) ?? Promise.resolve();
    const run2 = prev.then(fn, fn);
    this.baseWriteChains.set(baseId, run2.then(() => void 0, () => void 0));
    return run2;
  }
  /**
   * Resolve once every queued/active ingest task has settled (all bases).
   * Pipeline/test helper — the HTTP surface never needs it because the client
   * polls /indexing-status. Throws when the tasks do not drain in time.
   * The initial 25ms tick lets a fire-and-forget task (e.g. the in-place
   * backfill after a model change) reach its first indexing entry before the
   * first busy() probe, avoiding a false "idle".
   */
  async waitForIdle(timeoutMs = 15e3) {
    const deadline = Date.now() + timeoutMs;
    await new Promise((resolve7) => setTimeout(resolve7, 25));
    const busy = () => this.indexing.size > 0 || [...this.ingestQueues.values()].some((entry) => entry.running > 0 || entry.pending.length > 0);
    while (busy()) {
      if (Date.now() > deadline) throw new Error("knowledge: ingest tasks did not settle in time");
      await new Promise((resolve7) => setTimeout(resolve7, 25));
    }
  }
  async ingestDocument(input, signal) {
    const store = this.requireStore();
    const config = this.getConfigFor(input.baseId);
    const contentHash = sha256(input.text);
    const half = await this.withBaseWriteLock(input.baseId, async () => {
      if (store.getBase(input.baseId) === void 0) {
        throw new Error("knowledge base no longer exists (deleted while indexing)");
      }
      if (input.placeholderId !== void 0 && store.getDocument(input.placeholderId) === void 0) {
        throw new Error("document no longer exists (deleted while indexing)");
      }
      for (const doc of store.listDocuments(input.baseId)) {
        if (doc.id === input.placeholderId) continue;
        if (doc.contentHash === contentHash) {
          throw new Error(`duplicate document: "${doc.title}" already contains identical content`);
        }
      }
      const docId = input.placeholderId ?? input.documentId ?? crypto.randomUUID();
      const prior = input.placeholderId !== void 0 ? store.getDocument(docId) : void 0;
      const createdAt = prior?.createdAt ?? Date.now();
      const halfDoc = {
        id: docId,
        baseId: input.baseId,
        title: input.title,
        sourceType: input.sourceType,
        ...input.processed !== void 0 ? { processing: input.processed.processing } : {},
        ...input.fileName !== void 0 ? { fileName: input.fileName } : {},
        ...input.mimeType !== void 0 ? { mimeType: input.mimeType } : {},
        ...input.url !== void 0 ? { url: input.url } : {},
        ...input.parentDirectoryId !== void 0 ? { parentDirectoryId: input.parentDirectoryId } : {},
        ...input.rawFilePath !== void 0 ? { rawFilePath: input.rawFilePath } : {},
        ...input.sourcePath !== void 0 ? { sourcePath: input.sourcePath } : {},
        contentHash,
        rawText: input.text,
        charCount: input.text.length,
        tokenCount: estimateTokens2(input.text),
        chunkCount: 0,
        incomplete: true,
        createdAt,
        updatedAt: Date.now()
      };
      await store.putDocument(halfDoc);
      return halfDoc;
    });
    this.indexingFailures.delete(half.id);
    const pieces = this.processingChunks(input.processed, config);
    const { chunks, embeddingError, embeddingErrorCode } = await this.buildChunks(input.baseId, half.id, input.title, input.text, config, pieces, (batch) => store.stageDocumentGeneration(half, batch), signal, half.processing?.revision);
    signal?.throwIfAborted();
    if (store.getDocument(half.id) === void 0 || store.getBase(input.baseId) === void 0) {
      await store.deleteChunks(half.id).catch(() => {
      });
      this.indexing.delete(half.id);
      return half;
    }
    const { incomplete: _resumableMarker, ...completed } = half;
    const document = {
      ...completed,
      chunkCount: chunks.length,
      ...embeddingError !== void 0 ? { embeddingError, ...embeddingErrorCode !== void 0 ? { errorCode: embeddingErrorCode } : {} } : {},
      updatedAt: Date.now()
    };
    await store.commitDocumentGeneration(document, chunks);
    this.indexing.delete(half.id);
    await this.touchBase(input.baseId);
    return document;
  }
  processingChunks(processed, config) {
    if (processed === void 0 || processed.parsed.provider !== "mineru-local" || processed.parsed.blocks.length === 0) return void 0;
    return chunkParsedDocument(processed.parsed, processed.processing.revision, config.chunkSize, config.chunkOverlap, {
      structured: config.structuredChunking !== false,
      smartChunk: config.smartChunk,
      separator: config.chunkSeparator,
      tokenLimit: config.chunkTokenLimit
    });
  }
  async buildChunks(baseId, docId, title, text, config, pieces, onBatch, signal, processingRevision) {
    let slices;
    if (pieces !== void 0) {
      slices = pieces;
    } else if (config.semanticChunk) {
      const segments = splitSemanticSegments(text, { separator: config.chunkSeparator });
      let merged = null;
      if (segments.length > 0 && config.embeddingProvider !== "none") {
        try {
          const vectors = [];
          const batchSize = Math.max(1, config.embeddingBatchSize);
          for (let i = 0; i < segments.length; i += batchSize) {
            const batch = segments.slice(i, i + batchSize);
            const embedded = await this.embedTextsOnce(config, batch.map((segment) => segment.text));
            for (const vector of embedded) vectors.push(vector);
          }
          merged = mergeSemanticSegments(segments, vectors, config.chunkSize, config.semanticChunkThreshold);
        } catch (error) {
          this.ctx.logger.warn(`knowledge: semantic chunking embedding failed, using regular chunker: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      slices = merged !== null && merged.length > 0 ? merged : chunkText(text, config.chunkSize, config.chunkOverlap, {
        smartChunk: config.smartChunk,
        separator: config.chunkSeparator
      });
    } else {
      slices = chunkText(text, config.chunkSize, config.chunkOverlap, {
        smartChunk: config.smartChunk,
        separator: config.chunkSeparator
      });
    }
    if (config.chunkTokenLimit > 0) {
      slices = refineChunksByTokenLimit(slices, config.chunkTokenLimit, estimateTokens2);
    }
    const guardedOnBatch = onBatch !== void 0 ? (batch) => {
      this.assertIndexTargetAlive(docId, baseId);
      return onBatch(batch);
    } : void 0;
    const chunks = slices.map((piece, index) => ({
      id: crypto.randomUUID(),
      docId,
      baseId,
      index,
      text: piece.text,
      ...piece.sourceSpans !== void 0 ? { sourceSpans: piece.sourceSpans } : {},
      ...processingRevision !== void 0 ? { processingRevision } : {},
      ...piece.heading !== void 0 ? { heading: piece.heading } : {},
      ...piece.embedding !== void 0 ? { embedding: piece.embedding } : {},
      context: piece.heading !== void 0 ? `${title} > ${piece.heading}` : title
    }));
    let embeddingError;
    let embeddingErrorCode;
    if (config.embeddingProvider !== "none" && chunks.length > 0) {
      const key = embeddingKey(config);
      const taskController = this.indexing.get(docId)?.controller;
      this.indexing.set(docId, { baseId, title, phase: "embedding", total: chunks.length, progress: 0, controller: taskController });
      try {
        const hashes = chunks.map((chunk) => hashEmbeddingText(chunkSearchText(chunk)));
        const stored = key !== void 0 ? this.requireStore().listEmbeddingVectorsByHashes(hashes, key) : /* @__PURE__ */ new Map();
        const storedDimension = [...stored.values()][0]?.length;
        const need = [];
        const needTexts = [];
        for (let i = 0; i < chunks.length; i += 1) {
          if (chunks[i].embedding !== void 0 && key !== void 0) {
            chunks[i] = { ...chunks[i], embeddingModel: key };
            continue;
          }
          const cached = stored.get(hashes[i]);
          if (cached !== void 0) {
            chunks[i] = { ...chunks[i], embedding: cached, ...key !== void 0 ? { embeddingModel: key } : {} };
          } else {
            need.push(i);
            needTexts.push(chunkSearchText(chunks[i]));
          }
        }
        const batchSize = config.embeddingProvider === "local" ? Math.min(config.embeddingBatchSize, 8) : config.embeddingBatchSize;
        for (let i = 0; i < need.length; i += batchSize) {
          const batch = need.slice(i, i + batchSize);
          const batchTexts = needTexts.slice(i, i + batchSize);
          const vectors = await this.embedWithRetry(config, batchTexts, signal);
          const widths = new Set(vectors.map((vector) => vector.length));
          if (widths.size > 1) {
            throw new Error(`embedding returned mixed vector dimensions: ${[...widths].join(", ")}`);
          }
          const width = vectors[0]?.length ?? 0;
          if (width === 0) throw new Error("embedding returned empty vectors");
          if (storedDimension !== void 0 && storedDimension !== width) {
            embeddingErrorCode = "dimension_mismatch";
            throw new Error(`embedding vector dimension ${width} does not match the ${storedDimension} already stored for model "${key}" \u2014 switch back or reindex the base`);
          }
          const done = [];
          for (let j = 0; j < batch.length; j += 1) {
            const index = batch[j];
            chunks[index] = { ...chunks[index], embedding: vectors[j], ...key !== void 0 ? { embeddingModel: key } : {} };
            done.push(chunks[index]);
          }
          if (guardedOnBatch !== void 0) await guardedOnBatch(done);
          this.indexing.set(docId, { baseId, title, phase: "embedding", total: need.length, progress: Math.round(Math.min(i + batch.length, need.length) / need.length * 100), controller: taskController });
        }
      } catch (error) {
        if (isMetadataWriteFailure(error)) throw error;
        embeddingError = error instanceof Error ? error.message : String(error);
        embeddingErrorCode ??= "embedding_provider";
        this.indexingFailures.set(docId, {
          baseId,
          title,
          phase: "embedding",
          code: embeddingErrorCode,
          message: safeIndexingErrorMessage(embeddingError),
          expireAt: Date.now() + FAILURE_LINGER_TTL_MS
        });
        this.ctx.logger.warn(`knowledge: embedding during import failed, storing lexical-only chunks: ${embeddingError}`);
        if (config.embeddingProvider === "local" && config.embeddingModel.trim() !== "") {
          markLocalModelError(config.embeddingModel, embeddingError);
        }
      } finally {
        const active2 = this.indexing.get(docId);
        if (active2 !== void 0) {
          this.progressLinger.set(docId, {
            baseId,
            title,
            phase: active2.phase,
            progress: active2.progress,
            expireAt: Date.now() + PROGRESS_LINGER_TTL_MS
          });
        }
      }
    }
    return { chunks, embeddingError, embeddingErrorCode };
  }
  /** Embed one batch through the configured provider (empty input → empty output). */
  async embedTextsOnce(config, texts, signal) {
    if (texts.length === 0) return [];
    return embedTexts(
      config.embeddingProvider,
      config.embeddingBaseUrl,
      config.embeddingModel,
      config.embeddingApiKey,
      texts,
      signal
    );
  }
  /**
   * Embed with Cherry's job retry policy: 3 attempts, exponential backoff
   * (1s → 30s), so a transient provider/network failure self-heals instead of
   * degrading a whole import to lexical-only. An external abort (delete)
   * interrupts the request chain immediately.
   */
  async embedWithRetry(config, texts, signal) {
    let attempt = 1;
    for (; ; ) {
      if (signal?.aborted === true) throw new Error("embedding aborted (document was deleted)");
      try {
        return await this.embedTextsOnce(config, texts, signal);
      } catch (error) {
        if (attempt >= EMBED_MAX_ATTEMPTS) throw error;
        const delay2 = Math.min(EMBED_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), EMBED_RETRY_MAX_DELAY_MS);
        attempt += 1;
        this.ctx.logger.warn(`knowledge: embedding attempt ${attempt - 1}/${EMBED_MAX_ATTEMPTS} failed, retrying in ${delay2}ms: ${error instanceof Error ? error.message : String(error)}`);
        await new Promise((resolve7) => setTimeout(resolve7, delay2));
      }
    }
  }
  /** Bump the base's updatedAt so the data view's "更新于" stays meaningful. */
  async touchBase(baseId) {
    const store = this.requireStore();
    const base = store.getBase(baseId);
    if (base !== void 0) await store.putBase({ ...base, updatedAt: Date.now() });
  }
  requireStore() {
    if (this.store === void 0) {
      if (this.storageError !== void 0) {
        throw new StorageUnavailableError(`knowledge storage is unavailable: ${this.storageError.message}`);
      }
      throw new Error("knowledge store is not ready");
    }
    return this.store;
  }
};
function chunkSearchText(chunk) {
  return chunk.context !== void 0 && chunk.context.length > 0 ? `${chunk.context}
${chunk.text}` : chunk.text;
}
function embeddingKey(config) {
  if (config.embeddingProvider === "none") return void 0;
  const model = config.embeddingModel.trim() === "" && config.embeddingProvider === "local" ? DEFAULT_LOCAL_MODEL : config.embeddingModel.trim();
  if (model === "") return void 0;
  return `${config.embeddingProvider}:${model}`;
}
function retrievalStatus(requestedMode, lexical, vector) {
  const effectiveMode = lexical.succeeded && vector.succeeded ? "hybrid" : vector.succeeded ? "vector" : "lexical";
  return { requestedMode, effectiveMode, lexical, vector };
}
function emptyRetrievalStatus(requestedMode) {
  return retrievalStatus(
    requestedMode,
    { attempted: false, succeeded: false, returnedCount: 0 },
    { attempted: false, succeeded: false, returnedCount: 0 }
  );
}
function emptySearchResult(query, requestedMode, elapsedMs) {
  const retrieval = emptyRetrievalStatus(requestedMode);
  return {
    query,
    mode: retrieval.effectiveMode,
    scoreKind: scoreKindForMode(retrieval.effectiveMode),
    retrieval,
    total: 0,
    reranked: false,
    elapsedMs,
    hits: []
  };
}
function combineRetrievalStatus(requestedMode, results) {
  const lexical = results.reduce((total, result) => total + (result.retrieval?.lexical.returnedCount ?? 0), 0);
  const vector = results.reduce((total, result) => total + (result.retrieval?.vector.returnedCount ?? 0), 0);
  const lexicalAttempted = results.some((result) => result.retrieval?.lexical.attempted === true);
  const vectorAttempted = results.some((result) => result.retrieval?.vector.attempted === true);
  const lexicalSucceeded = results.some((result) => result.retrieval?.lexical.succeeded === true);
  const vectorSucceeded = results.some((result) => result.retrieval?.vector.succeeded === true);
  const lexicalError = results.find((result) => result.retrieval?.lexical.errorCode !== void 0)?.retrieval?.lexical.errorCode;
  const vectorError = results.find((result) => result.retrieval?.vector.errorCode !== void 0)?.retrieval?.vector.errorCode;
  return retrievalStatus(requestedMode, {
    attempted: lexicalAttempted,
    succeeded: lexicalSucceeded,
    returnedCount: lexical,
    ...lexicalError !== void 0 ? { errorCode: lexicalError } : {}
  }, {
    attempted: vectorAttempted,
    succeeded: vectorSucceeded,
    returnedCount: vector,
    ...vectorError !== void 0 ? { errorCode: vectorError } : {}
  });
}
function scoreKindForMode(mode) {
  if (mode === "hybrid") return "rrf";
  if (mode === "vector") return "vector_similarity";
  return "lexical_relevance";
}
function safeErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function retrievalErrorCode(error) {
  if (error !== null && typeof error === "object" && typeof error.code === "string") {
    return error.code;
  }
  return "lane_error";
}
function safeIndexingErrorMessage(message) {
  const normalized = message.replace(/[\r\n]+/g, " ");
  return normalized.slice(0, snapSliceEnd(normalized, 300));
}
function baseSourceLines(documents) {
  const MAX = 4;
  const lines = [];
  for (const doc of documents) {
    if (doc.parentDirectoryId !== void 0) continue;
    let kind;
    let text;
    if (doc.sourceType === "directory") {
      kind = "directory";
      text = doc.sourcePath ?? doc.title;
    } else if (doc.sourceType === "url") {
      kind = "url";
      text = doc.url ?? doc.title;
    } else if (doc.sourceType === "file") {
      kind = "file";
      text = doc.sourcePath ?? doc.fileName ?? doc.title;
    } else {
      kind = "text";
      text = "node";
    }
    lines.push({
      sourceId: doc.id,
      kind,
      text,
      ...doc.sourcePath !== void 0 ? { sourcePath: doc.sourcePath } : {}
    });
    if (lines.length >= MAX) break;
  }
  return lines;
}
function sha256(text) {
  return createHash9("sha256").update(text, "utf8").digest("hex");
}
function estimateTokens2(text) {
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? []).length;
  const latin = text.length - cjk;
  return Math.max(1, Math.ceil(cjk / 1.5 + latin / 4));
}
function reconstructFromChunks(chunks) {
  return chunks.slice().sort((a, b) => a.index - b.index).map((chunk) => chunk.text).join("\n\n");
}
var RERANK_EVIDENCE_TOKENS = 352;
var RERANK_QUERY_TOKENS = 128;
var RERANK_TITLE_TOKENS = 64;
var SEARCH_EVIDENCE_TOKENS = 768;
function fitRerankQuery(query) {
  if (estimateContextTokens(query) <= RERANK_QUERY_TOKENS) return query;
  let low = 0;
  let high = query.length;
  let best = "";
  while (low <= high) {
    const retained = Math.floor((low + high) / 2);
    const head = Math.ceil(retained * 0.6);
    const tail = retained - head;
    const headEnd = snapSliceEnd(query, head);
    const tailStart = snapSliceStart(query, query.length - tail);
    const candidate = `${query.slice(0, headEnd).trimEnd()} \u2026 ${query.slice(tailStart).trimStart()}`;
    if (estimateContextTokens(candidate) <= RERANK_QUERY_TOKENS) {
      best = candidate;
      low = retained + 1;
    } else {
      high = retained - 1;
    }
  }
  return best || query.slice(0, snapSliceEnd(query, 1));
}
function fitRerankTitle(title) {
  const trimmed = title.trim();
  if (estimateContextTokens(trimmed) <= RERANK_TITLE_TOKENS) return trimmed;
  let low = 0;
  let high = trimmed.length;
  let best = "";
  while (low <= high) {
    const length = Math.floor((low + high) / 2);
    const candidate = `${trimmed.slice(0, snapSliceEnd(trimmed, length)).trimEnd()}\u2026`;
    if (estimateContextTokens(candidate) <= RERANK_TITLE_TOKENS) {
      best = candidate;
      low = length + 1;
    } else {
      high = length - 1;
    }
  }
  return best;
}
function rerankTitleReserve(title) {
  const fitted = fitRerankTitle(title);
  return fitted.length === 0 ? 0 : estimateContextTokens(`${fitted}
`);
}
function rerankEvidenceText(hit) {
  const title = fitRerankTitle(hit.documentTitle);
  const evidence = hit.contextWindow !== void 0 ? serializeContextWindow(hit.contextWindow) : hit.text;
  const combined = title.length === 0 ? evidence : `${title}
${evidence}`;
  if (estimateContextTokens(combined) > RERANK_EVIDENCE_TOKENS) {
    throw new Error("rerank evidence exceeded the 352-token budget");
  }
  return combined;
}
function searchHitOf(store, chunk, hit) {
  if (chunk === void 0) return void 0;
  return {
    chunkId: chunk.id,
    docId: chunk.docId,
    baseId: chunk.baseId,
    documentTitle: store.getDocument(chunk.docId)?.title ?? chunk.docId,
    ...chunk.heading !== void 0 ? { heading: chunk.heading } : {},
    index: chunk.index,
    text: chunk.text,
    ...chunk.sourceSpans !== void 0 ? { sourceSpans: chunk.sourceSpans } : {},
    ...chunk.processingRevision !== void 0 ? { processingRevision: chunk.processingRevision } : {},
    score: hit.score,
    ...hit.vectorScore !== void 0 ? { vectorScore: hit.vectorScore } : {},
    ...hit.lexicalScore !== void 0 ? { lexicalScore: hit.lexicalScore } : {}
  };
}
function attachContextWindows(store, hits, focus, radius, maxTokens, reserveTokens) {
  if (hits.length === 0) return [];
  const safeRadius = clampInt3(radius, 0, 10, 0);
  const ranges = mergeChunkRanges(hits.map((hit) => ({
    docId: hit.docId,
    fromIdx: Math.max(0, hit.index - safeRadius),
    toIdx: hit.index + safeRadius
  })));
  const loaded = store.listChunksByIndexRanges(ranges);
  const byDoc = /* @__PURE__ */ new Map();
  for (const chunk of loaded) {
    const list = byDoc.get(chunk.docId) ?? [];
    list.push(chunk);
    byDoc.set(chunk.docId, list);
  }
  return hits.map((hit) => {
    const anchor = {
      id: hit.chunkId,
      docId: hit.docId,
      baseId: hit.baseId,
      index: hit.index,
      text: hit.text,
      ...hit.sourceSpans !== void 0 ? { sourceSpans: hit.sourceSpans } : {},
      ...hit.processingRevision !== void 0 ? { processingRevision: hit.processingRevision } : {},
      ...hit.heading !== void 0 ? { heading: hit.heading } : {}
    };
    const neighbours = byDoc.get(hit.docId) ?? [anchor];
    const document = store.getDocument(hit.docId);
    const contextWindow = composeContextWindow(neighbours, anchor, {
      before: safeRadius,
      after: safeRadius,
      maxTokens: Math.max(1, maxTokens - (reserveTokens?.(hit) ?? 0)),
      focus,
      documentChunkCount: document?.chunkCount
    });
    const legacy = safeRadius > 0 ? neighbours.filter((chunk) => chunk.id !== anchor.id && chunk.index >= anchor.index - safeRadius && chunk.index <= anchor.index + safeRadius).sort((a, b) => a.index - b.index).map((chunk) => `${chunk.heading !== void 0 ? `[${chunk.heading}] ` : ""}${chunk.text}`).join("\n\n") : "";
    const { siblingContext: _oldSibling, contextWindow: _oldWindow, ...base } = hit;
    return {
      ...base,
      contextWindow,
      ...legacy.length > 0 ? { siblingContext: legacy } : {}
    };
  });
}
function mergeChunkRanges(ranges) {
  const ordered = [...ranges].sort((a, b) => a.docId.localeCompare(b.docId) || a.fromIdx - b.fromIdx || a.toIdx - b.toIdx);
  const merged = [];
  for (const range of ordered) {
    const previous = merged[merged.length - 1];
    if (previous !== void 0 && previous.docId === range.docId && range.fromIdx <= previous.toIdx + 1) {
      previous.toIdx = Math.max(previous.toIdx, range.toIdx);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}
function clampInt3(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
function clampRawTextLimit(limit) {
  if (limit === void 0 || !Number.isFinite(limit)) return void 0;
  return Math.min(MAX_RAW_TEXT_LIMIT, Math.max(0, Math.trunc(limit)));
}
function throwIfAborted3(signal) {
  if (signal?.aborted !== true) return;
  if (signal.reason instanceof Error) throw signal.reason;
  throw new DOMException("The operation was aborted", "AbortError");
}
function throwIfDeadline(deadlineAt) {
  if (deadlineAt !== void 0 && Date.now() >= deadlineAt) {
    throw new DOMException("knowledge search deadline exceeded", "TimeoutError");
  }
}
function normalizeQueryVariants(primary, queries) {
  const variants = [primary];
  const seen = /* @__PURE__ */ new Set([primary.toLowerCase()]);
  for (const raw of queries ?? []) {
    if (typeof raw !== "string") continue;
    const query = raw.trim();
    if (query.length === 0) continue;
    if (query.length > 2e3) throw new Error("extra search query must not exceed 2000 characters");
    const key = query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    variants.push(query);
    if (variants.length >= 4) break;
  }
  return variants;
}
function compactBaseConfig(config) {
  const next = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string") {
      if (value.trim().length > 0) next[key] = value;
    } else if (typeof value === "boolean") {
      next[key] = value;
    } else if (value !== void 0 && Number.isFinite(value)) {
      next[key] = value;
    }
  }
  return next;
}
function mergeBaseConfig(existing, patch) {
  const merged = { ...existing ?? {} };
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === "string" && value.trim() === "") {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }
  return merged;
}
function decodeBase64(value) {
  if (typeof Buffer !== "undefined") return Buffer.from(value, "base64");
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function encodeUtf8(text) {
  return new TextEncoder().encode(text);
}
function safeRawExtension(fileName) {
  const ext = extname2(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : ".bin";
}
function rawExtensionOf(relativePath) {
  const ext = extname2(relativePath).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : ".bin";
}
var BLOCKED_URL_HOSTS = /* @__PURE__ */ new Set([
  "localhost",
  "0.0.0.0",
  "metadata.google.internal"
]);
function isBlockedIpv4(host) {
  const parts = host.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const a = parts[0];
  const b = parts[1];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}
function isBlockedIpv6(host) {
  if (host === "::" || host === "::1") return true;
  const mappedDotted = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(host);
  if (mappedDotted !== null) return isBlockedIpv4(mappedDotted[1]);
  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(host);
  if (mappedHex !== null) {
    const high = Number.parseInt(mappedHex[1], 16);
    const low = Number.parseInt(mappedHex[2], 16);
    return isBlockedIpv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
  }
  const firstGroup = host.split(":").find((part) => part.length > 0);
  const first = firstGroup === void 0 ? 0 : Number.parseInt(firstGroup, 16);
  if (Number.isNaN(first)) return true;
  if ((first & 65024) === 64512) return true;
  if ((first & 65472) === 65152) return true;
  if ((first & 65280) === 65280) return true;
  return false;
}
function isBlockedUrlHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_URL_HOSTS.has(host)) return true;
  const family = isIP(host);
  if (family === 4) return isBlockedIpv4(host);
  if (family === 6) return isBlockedIpv6(host);
  return false;
}
async function fetchHtml(url) {
  let current = url;
  for (let hop = 0; hop <= 5; hop += 1) {
    let parsed;
    try {
      parsed = new URL(current);
    } catch {
      throw new Error(`invalid URL: ${current}`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`URL protocol not allowed: ${parsed.protocol}`);
    }
    if (isBlockedUrlHost(parsed.hostname)) {
      throw new Error(`URL host not allowed: ${parsed.hostname}`);
    }
    const response = await httpFetch(parsed.toString(), {
      method: "GET",
      headers: { "user-agent": "dsh-knowledge/0.1 (+knowledge-base-import)" },
      timeoutMs: 3e4,
      redirect: "manual"
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location === null) throw new Error(`URL redirect without Location (HTTP ${response.status})`);
      current = new URL(location, parsed).toString();
      continue;
    }
    if (!response.ok) throw new Error(`URL fetch failed: HTTP ${response.status}`);
    const contentType = (response.headers.get("content-type") ?? "").split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "" && contentType !== "text/html" && contentType !== "application/xhtml+xml") {
      throw new Error(`URL did not return HTML (content-type: ${contentType || "unknown"})`);
    }
    return response.text();
  }
  throw new Error("URL redirect limit exceeded");
}
var SUPPORTED_DOCUMENT_EXTENSION_SET = new Set(SUPPORTED_DOCUMENT_EXTENSIONS);
var DIRECTORY_EXTENSIONS = new Set(SUPPORTED_DOCUMENT_EXTENSIONS.map((ext) => `.${ext}`));
var DIRECTORY_MAX_FILES = 500;
var DIRECTORY_MAX_DEPTH = 8;
async function scanDirectory(root) {
  const found = [];
  async function walk(dir, depth) {
    if (depth > DIRECTORY_MAX_DEPTH || found.length >= DIRECTORY_MAX_FILES) return;
    let entries;
    try {
      entries = await readdir8(dir, { withFileTypes: true });
    } catch (error) {
      throw new Error(`cannot read directory ${root}: ${error instanceof Error ? error.message : String(error)}`);
    }
    for (const entry of entries) {
      if (found.length >= DIRECTORY_MAX_FILES) return;
      const full = join12(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, depth + 1);
      } else if (entry.isFile() && DIRECTORY_EXTENSIONS.has(extname2(entry.name).toLowerCase())) {
        found.push(full);
      }
    }
  }
  await walk(root, 0);
  return found;
}
var index_default = KnowledgeService;
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
  cosineSimilarity2 as cosineSimilarity,
  index_default as default,
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
//# sourceMappingURL=index.js.map
