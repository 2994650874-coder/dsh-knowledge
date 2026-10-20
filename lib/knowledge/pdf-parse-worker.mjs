// src/knowledge/pdf-parse-worker.mjs
import { parentPort } from "node:worker_threads";
process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.warn(`[dsh-knowledge] pdf-parse worker ignored a stray rejection: ${message.slice(0, 200)}`);
});
parentPort?.on("message", (message) => {
  if (message?.type === "shutdown") {
    process.exit(0);
    return;
  }
  const { id, data } = message;
  void (async () => {
    try {
      const mod = await import("pdf-parse");
      const result = await mod.default(Buffer.from(data));
      parentPort?.postMessage({ id, ok: true, text: typeof result?.text === "string" ? result.text : "" });
    } catch (error) {
      parentPort?.postMessage({ id, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  })();
});
//# sourceMappingURL=pdf-parse-worker.mjs.map
