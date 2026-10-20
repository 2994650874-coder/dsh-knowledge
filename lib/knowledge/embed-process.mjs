// src/knowledge/embed-worker.ts
import { parentPort } from "node:worker_threads";
import { join } from "node:path";
import { readdir, stat } from "node:fs/promises";

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

// src/knowledge/embed-protocol.ts
var LOCAL_EMBED_PROTOCOL_VERSION = 1;
function isLocalEmbedRequest(value) {
  if (value === null || typeof value !== "object") return false;
  const request = value;
  return request.protocolVersion === LOCAL_EMBED_PROTOCOL_VERSION && typeof request.id === "number" && Number.isInteger(request.id) && typeof request.modelId === "string" && typeof request.cacheDir === "string" && ["download", "load", "embed", "release", "shutdown"].includes(String(request.operation));
}

// src/knowledge/embed-worker.ts
applyGlobalProxy();
function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}
var transformers = null;
var runners = /* @__PURE__ */ new Map();
var cancelledModels = /* @__PURE__ */ new Set();
var operationChain = Promise.resolve();
function enqueueOperation(operation) {
  const run = operationChain.then(operation);
  operationChain = run.then(() => void 0, () => void 0);
  return run;
}
function post(message) {
  if (parentPort !== null) parentPort.postMessage(message);
  else process.send?.(message);
}
async function loadTransformers() {
  if (transformers !== null) return transformers;
  transformers = await import("@huggingface/transformers");
  return transformers;
}
function applyEndpoint(tf, hfEndpoint) {
  if (hfEndpoint !== void 0 && hfEndpoint.trim() !== "") {
    tf.env.remoteHost = hfEndpoint.trim().replace(/\/+$/, "");
  }
}
async function isDownloaded(modelId, cacheDir) {
  try {
    const root = join(cacheDir, modelId);
    const [config, entries, tokenizer] = await Promise.all([
      stat(join(root, "config.json")),
      readdir(join(root, "onnx")),
      Promise.any([
        stat(join(root, "tokenizer.json")),
        stat(join(root, "tokenizer_config.json")),
        stat(join(root, "vocab.txt")),
        stat(join(root, "spiece.model"))
      ])
    ]);
    if (config.size <= 0 || tokenizer.size <= 0) return false;
    for (const name of entries) {
      if (name.endsWith(".onnx") && (await stat(join(root, "onnx", name))).size > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}
async function createRunner(task, modelId, cacheDir, hfEndpoint, forceDownload = false) {
  const tf = await loadTransformers();
  applyEndpoint(tf, hfEndpoint);
  tf.env.cacheDir = cacheDir;
  let lastProgressAt = 0;
  if (forceDownload || !await isDownloaded(modelId, cacheDir)) {
    post({ type: "progress", modelId, status: "downloading", progress: 0, message: "" });
    const progressCallback = (info) => {
      if (cancelledModels.has(modelId)) throw new Error("download cancelled");
      if (info.status === "progress" && typeof info.progress === "number") {
        const now = Date.now();
        if (now - lastProgressAt >= 250) {
          lastProgressAt = now;
          post({ type: "progress", modelId, status: "downloading", progress: info.progress, message: "" });
        }
      }
    };
    try {
      if (task === "reranking") {
        await tf.AutoModel.from_pretrained(modelId, { dtype: "q8", progress_callback: progressCallback });
        await tf.AutoTokenizer.from_pretrained(modelId, { progress_callback: progressCallback });
      } else {
        await tf.pipeline(task, modelId, {
          dtype: "q8",
          progress_callback: progressCallback
        });
      }
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      const cancelled = cancelledModels.has(modelId);
      post({
        type: "progress",
        modelId,
        status: cancelled ? "idle" : "error",
        progress: 0,
        message: cancelled ? "" : `${raw} \xB7 ${NETWORK_HINT}`
      });
      if (cancelled) post({ type: "cancelled", modelId });
      throw error;
    }
  }
  if (task === "reranking") {
    const model = await tf.AutoModel.from_pretrained(join(cacheDir, modelId), { dtype: "q8" });
    const tokenizer = await tf.AutoTokenizer.from_pretrained(join(cacheDir, modelId));
    post({ type: "progress", modelId, status: "ready", progress: 100, message: "" });
    return {
      // Cross-encoder relevance scoring, hand-rolled for transformers.js
      // versions without the `reranking` pipeline: tokenize [query, doc]
      // pairs, run the model, sigmoid the logits (the reference pipeline's
      // exact math). Batched so a large pool never allocates one giant tensor.
      rerank: async (query, texts) => {
        if (texts.length === 0) return [];
        const scores = [];
        const BATCH = 16;
        for (let i = 0; i < texts.length; i += BATCH) {
          const batch = texts.slice(i, i + BATCH);
          const inputs = await tokenizer(batch.map(() => query), {
            text_pair: batch,
            padding: true,
            truncation: true
          });
          const outputs = await model(inputs);
          const logits = outputs.logits;
          if (logits === void 0 || logits.data === void 0) {
            throw new Error("rerank model returned no logits");
          }
          if (logits.data.length !== batch.length || logits.dims !== void 0 && logits.dims.at(-1) !== 1) {
            throw new Error(`rerank model must return one logit per pair (expected ${batch.length}, received ${logits.data.length})`);
          }
          for (let j = 0; j < batch.length; j += 1) {
            const logit = Number(logits.data[j]);
            if (!Number.isFinite(logit)) throw new Error("rerank model returned a non-finite logit");
            scores.push(sigmoid(logit));
          }
        }
        return scores;
      },
      // Free the cross-encoder's ONNX sessions (onnxruntime native memory);
      // the worker itself stays alive, so the binding is never reloaded.
      dispose: async () => {
        await model.dispose?.();
      }
    };
  }
  const pipeline = await tf.pipeline(task, join(cacheDir, modelId), { dtype: "q8" });
  const embed = pipeline;
  post({ type: "progress", modelId, status: "ready", progress: 100, message: "" });
  return {
    embed: async (texts, pooling) => {
      const output = await embed(texts, { pooling, normalize: true });
      return output.tolist();
    },
    // Free the pipeline's ONNX sessions (~600MB native memory) immediately;
    // the worker stays alive, so a later request just reloads from disk.
    dispose: async () => {
      await pipeline.dispose?.();
    }
  };
}
function getRunner(task, modelId, cacheDir, hfEndpoint, forceDownload = false) {
  const key = `${task}:${modelId}`;
  const cached = runners.get(key);
  if (cached !== void 0) return cached;
  const pending = createRunner(task, modelId, cacheDir, hfEndpoint, forceDownload);
  runners.set(key, pending);
  pending.catch(() => {
    if (runners.get(key) === pending) runners.delete(key);
  });
  return pending;
}
async function disposeAllRunners() {
  const pending = [...runners.values()];
  runners.clear();
  cancelledModels.clear();
  for (const runner of pending) {
    try {
      await runner.then((r) => r.dispose?.());
    } catch {
    }
  }
}
async function disposeRunnersFor(modelId) {
  const keys = [`feature-extraction:${modelId}`, `reranking:${modelId}`];
  const pending = keys.map((key) => runners.get(key)).filter((p) => p !== void 0);
  for (const key of keys) runners.delete(key);
  cancelledModels.delete(modelId);
  for (const runner of pending) {
    try {
      await runner.then((r) => r.dispose?.());
    } catch {
    }
  }
}
function handleMessage(message) {
  if (!isLocalEmbedRequest(message)) return;
  const { id, operation, modelId, cacheDir, hfEndpoint } = message;
  void enqueueOperation(async () => {
    if (operation === "shutdown") {
      await disposeAllRunners();
      return { protocolVersion: LOCAL_EMBED_PROTOCOL_VERSION, id, operation, ok: true };
    }
    if (operation === "release") {
      await disposeRunnersFor(modelId);
      return { protocolVersion: LOCAL_EMBED_PROTOCOL_VERSION, id, operation, ok: true };
    }
    const runner = await getRunner("feature-extraction", modelId, cacheDir, hfEndpoint, operation === "download");
    if (operation === "download" || operation === "load") {
      return { protocolVersion: LOCAL_EMBED_PROTOCOL_VERSION, id, operation, ok: true };
    }
    const vectors = await runner.embed(message.texts ?? [], message.pooling ?? "mean");
    return { protocolVersion: LOCAL_EMBED_PROTOCOL_VERSION, id, operation, ok: true, vectors };
  }).then((response) => {
    post(response);
    if (operation === "shutdown") setImmediate(() => process.exit(0));
  }).catch((error) => {
    post({
      protocolVersion: LOCAL_EMBED_PROTOCOL_VERSION,
      id,
      operation,
      ok: false,
      error: {
        code: "runtime_error",
        message: error instanceof Error ? error.message : String(error),
        retryable: true
      }
    });
  });
}
if (parentPort !== null) parentPort.on("message", handleMessage);
else process.on("message", handleMessage);
//# sourceMappingURL=embed-process.mjs.map
