// src/knowledge/rerank-process.ts
import { readdir, rm, stat } from "node:fs/promises";
import { basename, join } from "node:path";

// src/knowledge/net.ts
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
var proxyApplied = false;
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
var NETWORK_HINT = "\u82E5\u65E0\u6CD5\u8BBF\u95EE huggingface.co\uFF1A\u5728\u300C\u672C\u5730\u6A21\u578B\u300D\u9875\u9762\u8BBE\u7F6E\u955C\u50CF\u7AD9\uFF08\u5982 https://hf-mirror.com\uFF09\uFF0C\u6216\u914D\u7F6E HTTP(S)_PROXY \u4EE3\u7406\u540E\u91CD\u542F\u670D\u52A1\u3002";

// src/knowledge/rerank-adapter.ts
var CrossEncoderResponseError = class extends Error {
  code = "invalid_response";
};
function stableSigmoid(value) {
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const exp = Math.exp(value);
  return exp / (1 + exp);
}
function isOutOfMemory(error) {
  const text = error instanceof Error ? error.message : String(error);
  return /out[ -]?of[ -]?memory|allocation failed|failed to allocate|bad_alloc/i.test(text);
}
function nextBatchSize(current) {
  if (current > 8) return 8;
  if (current > 4) return 4;
  return 1;
}
async function scoreCrossEncoder(tokenizer, model, query, texts, initialBatchSize = 16) {
  if (texts.length === 0) return { scores: [], batchSize: Math.max(1, initialBatchSize) };
  let batchSize = Math.max(1, Math.trunc(initialBatchSize));
  const scores = [];
  let offset = 0;
  while (offset < texts.length) {
    const batch = texts.slice(offset, offset + batchSize);
    try {
      const inputs = await tokenizer(batch.map(() => query), {
        text_pair: [...batch],
        padding: true,
        truncation: true
      });
      const outputs = await model(inputs);
      const logits = outputs.logits;
      if (logits?.data === void 0) throw new CrossEncoderResponseError("rerank model returned no logits");
      const dims = logits.dims;
      if (dims !== void 0 && (dims.length === 0 || dims.at(-1) !== 1)) {
        throw new CrossEncoderResponseError(`rerank model must return one logit per pair (dims=${dims.join("x")})`);
      }
      if (logits.data.length !== batch.length) {
        throw new CrossEncoderResponseError(`rerank score count mismatch: expected ${batch.length}, received ${logits.data.length}`);
      }
      for (let index = 0; index < batch.length; index += 1) {
        const logit = Number(logits.data[index]);
        if (!Number.isFinite(logit)) throw new CrossEncoderResponseError("rerank model returned a non-finite logit");
        const score = stableSigmoid(logit);
        if (!Number.isFinite(score)) throw new CrossEncoderResponseError("rerank model returned a non-finite score");
        scores.push(score);
      }
      offset += batch.length;
    } catch (error) {
      if (batchSize > 1 && isOutOfMemory(error)) {
        batchSize = nextBatchSize(batchSize);
        continue;
      }
      throw error;
    }
  }
  if (scores.length !== texts.length) {
    throw new CrossEncoderResponseError(`rerank score count mismatch: expected ${texts.length}, received ${scores.length}`);
  }
  return { scores, batchSize };
}

// src/knowledge/rerank-protocol.ts
var LOCAL_RERANK_PROTOCOL_VERSION = 1;

// src/knowledge/rerank-process.ts
applyGlobalProxy();
var transformers = null;
var activeRunner = null;
var operationChain = Promise.resolve();
function post(message) {
  if (typeof process.send === "function") process.send(message);
}
function progress(modelId, status, value, message = "") {
  post({
    protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION,
    event: "progress",
    modelId,
    status,
    progress: value,
    message
  });
}
async function loadTransformers() {
  if (transformers !== null) return transformers;
  transformers = await import("@huggingface/transformers");
  return transformers;
}
async function weightsAreComplete(modelId, cacheDir, expected) {
  try {
    const names = await readdir(join(cacheDir, modelId, "onnx"));
    for (const name of names) {
      if (!name.endsWith(".onnx")) continue;
      const info = await stat(join(cacheDir, modelId, "onnx", name));
      if (!info.isFile() || info.size <= 0) continue;
      const total = expected.get(name);
      if (total === void 0 || total <= 0 || info.size === total) return true;
    }
  } catch {
    return false;
  }
  return false;
}
async function quarantineModel(modelId, cacheDir) {
  await rm(join(cacheDir, modelId), { recursive: true, force: true }).catch(() => {
  });
}
function applyEndpoint(tf, endpoint) {
  if (endpoint !== void 0 && endpoint.trim() !== "") {
    tf.env.remoteHost = endpoint.trim().replace(/\/+$/, "");
  }
}
async function disposeRunner() {
  const runner = activeRunner;
  activeRunner = null;
  await runner?.dispose().catch(() => {
  });
}
async function createRunner(request) {
  const tf = await loadTransformers();
  applyEndpoint(tf, request.hfEndpoint);
  tf.env.cacheDir = request.cacheDir;
  tf.env.allowLocalModels = true;
  const expectedSizes = /* @__PURE__ */ new Map();
  if (!await weightsAreComplete(request.modelId, request.cacheDir, expectedSizes)) {
    tf.env.allowRemoteModels = true;
    progress(request.modelId, "downloading", 0);
    let lastProgressAt = 0;
    const progressCallback = (info) => {
      if (typeof info.file === "string" && typeof info.total === "number" && info.total > 0) {
        expectedSizes.set(basename(info.file), info.total);
      }
      if (info.status !== "progress" || typeof info.progress !== "number") return;
      const now = Date.now();
      if (now - lastProgressAt < 250) return;
      lastProgressAt = now;
      progress(request.modelId, "downloading", info.progress);
    };
    let downloadedModel;
    try {
      downloadedModel = await tf.AutoModel.from_pretrained(request.modelId, {
        dtype: "q8",
        progress_callback: progressCallback,
        trust_remote_code: false
      });
      await tf.AutoTokenizer.from_pretrained(request.modelId, {
        progress_callback: progressCallback,
        trust_remote_code: false
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress(request.modelId, "error", 0, `${message} \xB7 ${NETWORK_HINT}`);
      await quarantineModel(request.modelId, request.cacheDir);
      throw error;
    } finally {
      await downloadedModel?.dispose?.().catch(() => {
      });
    }
    if (!await weightsAreComplete(request.modelId, request.cacheDir, expectedSizes)) {
      await quarantineModel(request.modelId, request.cacheDir);
      const message = "local rerank weights are incomplete after download (the transfer was truncated); the partial cache was removed, retry the download";
      progress(request.modelId, "error", 0, `${message} \xB7 ${NETWORK_HINT}`);
      throw new Error(message);
    }
  }
  tf.env.allowRemoteModels = false;
  const localPath = join(request.cacheDir, request.modelId);
  let model;
  let tokenizer;
  try {
    model = await tf.AutoModel.from_pretrained(localPath, { dtype: "q8", local_files_only: true, trust_remote_code: false });
    tokenizer = await tf.AutoTokenizer.from_pretrained(localPath, { local_files_only: true, trust_remote_code: false });
  } catch (error) {
    await quarantineModel(request.modelId, request.cacheDir);
    const detail = error instanceof Error ? error.message : String(error);
    const message = `local rerank model could not be loaded from the cache (${detail}); the cache was removed, retry to download it again`;
    progress(request.modelId, "error", 0, message);
    throw new Error(message);
  }
  let safeBatchSize = 16;
  return {
    modelId: request.modelId,
    async rerank(query, texts) {
      const result = await scoreCrossEncoder(tokenizer, model, query, texts, safeBatchSize);
      safeBatchSize = result.batchSize;
      return result.scores;
    },
    async dispose() {
      await model.dispose?.();
    },
    batchSize: () => safeBatchSize
  };
}
async function ensureRunner(request) {
  if (activeRunner?.modelId === request.modelId) return activeRunner;
  await disposeRunner();
  activeRunner = await createRunner(request);
  return activeRunner;
}
async function selfTest(request) {
  const runner = await ensureRunner(request);
  const startedAt = Date.now();
  const scores = await runner.rerank("\u5982\u4F55\u7533\u8BF7\u8D39\u7528\u62A5\u9500\uFF1F", [
    "\u8D39\u7528\u62A5\u9500\u9700\u8981\u63D0\u4EA4\u53D1\u7968\u5E76\u7ECF\u8FC7\u8D1F\u8D23\u4EBA\u5BA1\u6279\u3002",
    "\u4ECA\u5929\u7684\u5929\u6C14\u6674\u6717\uFF0C\u9002\u5408\u6237\u5916\u6563\u6B65\u3002"
  ]);
  if (scores.length !== 2 || scores.some((score) => !Number.isFinite(score))) {
    throw new CrossEncoderResponseError("rerank self-test returned invalid scores");
  }
  if (!(scores[0] > scores[1]) || Math.abs(scores[0] - scores[1]) < 1e-6) {
    throw new CrossEncoderResponseError("rerank self-test did not distinguish relevant and irrelevant text");
  }
  const health = { healthy: true, latencyMs: Date.now() - startedAt, scores, batchSize: runner.batchSize() };
  progress(request.modelId, "ready", 100);
  return health;
}
async function handle(request) {
  if (request.protocolVersion !== LOCAL_RERANK_PROTOCOL_VERSION) throw new CrossEncoderResponseError("unsupported local rerank protocol version");
  if (request.operation === "shutdown") {
    await disposeRunner();
    return { protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION, id: request.id, operation: "shutdown", ok: true };
  }
  if (request.operation === "dispose") {
    await disposeRunner();
    return { protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION, id: request.id, operation: "dispose", ok: true };
  }
  if (request.operation === "load") {
    await ensureRunner(request);
    progress(request.modelId, "ready", 100);
    return { protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION, id: request.id, operation: "load", ok: true };
  }
  if (request.operation === "self_test") {
    return { protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION, id: request.id, operation: "self_test", ok: true, health: await selfTest(request) };
  }
  const runner = await ensureRunner(request);
  const scores = await runner.rerank(request.query, request.texts);
  progress(request.modelId, "ready", 100);
  return { protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION, id: request.id, operation: "rerank", ok: true, scores };
}
function failure(request, error) {
  const code = error instanceof CrossEncoderResponseError ? "invalid_response" : "runtime_error";
  return {
    protocolVersion: LOCAL_RERANK_PROTOCOL_VERSION,
    id: request.id,
    operation: request.operation,
    ok: false,
    error: { code, message: error instanceof Error ? error.message : String(error), retryable: code !== "invalid_response" }
  };
}
process.on("message", (message) => {
  operationChain = operationChain.then(async () => {
    try {
      const response = await handle(message);
      post(response);
      if (message.operation === "shutdown") process.exit(0);
    } catch (error) {
      post(failure(message, error));
    }
  }).catch(() => {
  });
});
process.on("disconnect", () => {
  void disposeRunner().finally(() => process.exit(0));
});
//# sourceMappingURL=rerank-process.mjs.map
