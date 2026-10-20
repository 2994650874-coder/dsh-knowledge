// src/knowledge/ocr-process.ts
import { join } from "node:path";

// src/knowledge/ocr-protocol.ts
var OCR_PROTOCOL_VERSION = 1;

// src/knowledge/ocr-process.ts
var paddlePromise = null;
var paddleModelDir = null;
var tesseractPromise = null;
var tesseractWorkerPromise = null;
async function getPaddle(modelDir) {
  if (paddlePromise === null || paddleModelDir !== modelDir) {
    paddleModelDir = modelDir;
    paddlePromise = (async () => {
      try {
        const { env } = await import("onnxruntime-node");
        if (env !== void 0) env.logLevel = "error";
      } catch {
      }
      const mod = await import("ppu-paddle-ocr");
      const service = new mod.PaddleOcrService({
        model: {
          detection: join(modelDir, "ppocrv5_det.onnx"),
          recognition: join(modelDir, "ppocrv5_rec.onnx"),
          charactersDictionary: join(modelDir, "ppocrv5_dict.txt")
        }
      });
      await service.initialize();
      return service;
    })();
    paddlePromise.catch(() => {
      paddlePromise = null;
    });
  }
  return paddlePromise;
}
async function recognizeWithPaddle(service, png) {
  const buffer = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength);
  const result = await service.recognize(buffer, { flatten: true });
  return result.text ?? "";
}
async function recognizeWithTesseract(png, langPath) {
  const tesseract = tesseractPromise ??= import("tesseract.js");
  const mod = await tesseract;
  tesseractWorkerPromise ??= mod.createWorker("chi_sim+eng", 1, { langPath }).catch((error) => {
    tesseractWorkerPromise = null;
    throw error;
  });
  const worker = await tesseractWorkerPromise;
  const bytes = new Uint8Array(png.buffer, png.byteOffset, png.byteLength);
  const { data } = await worker.recognize(bytes);
  return data.text;
}
var queue = Promise.resolve();
process.on("disconnect", () => process.exit(0));
process.on("message", (message) => {
  if (message.protocolVersion !== OCR_PROTOCOL_VERSION) return;
  if (message.operation === "shutdown") {
    process.exit(0);
    return;
  }
  const respond = (response) => {
    if (process.connected) process.send?.(response);
  };
  if (message.operation === "status") {
    respond({ protocolVersion: OCR_PROTOCOL_VERSION, id: message.id, operation: "status", ok: true });
    return;
  }
  const { id, modelDir } = message;
  const png = Buffer.from(message.png);
  queue = queue.then(async () => {
    try {
      let text = "";
      try {
        const service = await getPaddle(modelDir);
        text = (await recognizeWithPaddle(service, png)).trim();
      } catch {
        text = (await recognizeWithTesseract(png, modelDir)).trim();
      }
      respond({ protocolVersion: OCR_PROTOCOL_VERSION, id, operation: "recognize", ok: true, text });
    } catch (error) {
      respond({ protocolVersion: OCR_PROTOCOL_VERSION, id, operation: "recognize", ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });
});
//# sourceMappingURL=ocr-process.mjs.map
