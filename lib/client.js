window.__ModuleLoader__.load({ id: "dsh-knowledge", factory: (require) => {
var module = { exports: {} };

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/ui/client/api.ts
var KnowledgeApi = class {
  async call(method2, path, body, timeoutMs = 6e4) {
    const response = await fetch(`/knowledge${path}`, {
      method: method2,
      headers: { ...body !== void 0 ? { "content-type": "application/json" } : {}, ...path.startsWith("/processors/managed/") ? { "x-dsh-mineru-management": "1" } : {} },
      body: body !== void 0 ? JSON.stringify(body) : void 0,
      // A hung host must not pin the panel's busy state forever: fail the
      // call with a clear error instead of an indefinite spinner. Long-running
      // jobs (reindex of a whole base) pass a larger budget so a slow sweep is
      // not cut short while the server is still working.
      signal: AbortSignal.timeout(timeoutMs)
    });
    let envelope;
    try {
      envelope = await response.json();
    } catch {
      throw new Error(`knowledge request failed (HTTP ${response.status})`);
    }
    if (!response.ok || envelope.ok !== true || envelope.value === void 0) {
      throw new Error(envelope.error?.message ?? `knowledge request failed (HTTP ${response.status})`);
    }
    return envelope.value;
  }
  getConfig() {
    return this.call("GET", "/config");
  }
  planMineruDeployment(root, existingModels, pythonExecutable) {
    return this.call("POST", "/processors/managed/plan", { root, existingModels, pythonExecutable }, 31e4);
  }
  detectMineruPython(executable) {
    return this.call("POST", "/processors/managed/python", { executable }, 7e4);
  }
  mineruDeploymentStatus() {
    return this.call("GET", "/processors/managed/status");
  }
  prepareMineruDeployment(planId) {
    return this.call("POST", "/processors/managed/prepare", { planId, confirm: true });
  }
  mineruDeploymentAction(action) {
    return this.call("POST", `/processors/managed/${action}`, {});
  }
  useManagedMineru() {
    return this.call("POST", "/processors/managed/use", {});
  }
  checkProcessor(baseId) {
    return this.call("POST", "/processors/check", baseId === void 0 ? {} : { baseId });
  }
  getLocalModelStatus(model) {
    const query = model !== void 0 ? `?model=${encodeURIComponent(model)}` : "";
    return this.call("GET", `/local-model-status${query}`);
  }
  getModelSuggestions() {
    return this.call("GET", "/model-suggestions");
  }
  listLocalModels() {
    return this.call("GET", "/local-models");
  }
  downloadLocalModel(id) {
    return this.call("POST", `/local-models/download?model=${encodeURIComponent(id)}`);
  }
  registerCustomLocalReranker(id) {
    return this.call("POST", "/local-models/custom", { id });
  }
  selfTestLocalModel(id) {
    return this.call("POST", "/local-models/self-test", { id });
  }
  cancelLocalModel(id) {
    return this.call("POST", `/local-models/cancel?model=${encodeURIComponent(id)}`);
  }
  removeLocalModel(id) {
    return this.call("DELETE", `/local-models/remove?model=${encodeURIComponent(id)}`);
  }
  getOcrStatus() {
    return this.call("GET", "/local-ocr");
  }
  downloadOcr() {
    return this.call("POST", "/local-ocr/download", {});
  }
  removeOcr() {
    return this.call("DELETE", "/local-ocr/remove");
  }
  migrateLocalModels(to) {
    return this.call("POST", "/local-models/migrate", { to });
  }
  /** Prepare the selected/default cache directory without saving or moving models. */
  prepareLocalModelCacheDirectory(path = "") {
    return this.call("POST", "/local-models/cache-directory", { path });
  }
  listOllamaModels(baseUrl) {
    return this.call("GET", `/local-ollama/tags?baseUrl=${encodeURIComponent(baseUrl)}`);
  }
  pullOllamaModel(model, baseUrl) {
    return this.call("POST", "/local-ollama/pull", { model, baseUrl });
  }
  cancelOllamaPull(model) {
    return this.call("DELETE", `/local-ollama/pull?model=${encodeURIComponent(model)}`);
  }
  deleteOllamaModel(model, baseUrl) {
    return this.call("DELETE", "/local-ollama/delete", { model, baseUrl });
  }
  getOllamaPullStatus(model) {
    return this.call("GET", `/local-ollama/status?model=${encodeURIComponent(model)}`);
  }
  /** In-flight pulls, so the settings panel restores its cards after close/reopen. */
  listActiveOllamaPulls() {
    return this.call("GET", "/local-ollama/pulls");
  }
  setConfig(overrides) {
    return this.call("PUT", "/config", overrides);
  }
  /**
   * Embed one probe text through the given (or current) embedding config and
   * return the vector width (Cherry's dimension probe, run before a save).
   */
  probeEmbeddingDimensions(options = {}) {
    return this.call("POST", "/probe-embedding-dimensions", options);
  }
  listBases() {
    return this.call("GET", "/bases");
  }
  createBase(name, description, group, config) {
    return this.call("POST", "/bases", { name, description, group, config });
  }
  updateBase(id, patch) {
    return this.call("PATCH", `/bases/${encodeURIComponent(id)}`, patch);
  }
  /**
   * Batch file add with server-authoritative conflict detection: 'detect'
   * returns {status:'conflicts'} listing every collision (or 'clean'), and
   * 'rename'/'replace' add the whole batch under that strategy.
   */
  addFiles(baseId, files, conflict, parentDirectoryId) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/files-batch`, { files, conflict, parentDirectoryId });
  }
  deleteBase(id) {
    return this.call("DELETE", `/bases/${encodeURIComponent(id)}`);
  }
  listGroups() {
    return this.call("GET", "/groups");
  }
  createGroup(name) {
    return this.call("POST", "/groups", { name });
  }
  renameGroup(from, to) {
    return this.call("PATCH", "/groups", { from, to });
  }
  deleteGroup(name) {
    return this.call("DELETE", "/groups", { name });
  }
  getKnowledgeToggle() {
    return this.call("GET", "/knowledge-toggle");
  }
  setKnowledgeToggle(patch) {
    return this.call("PUT", "/knowledge-toggle", patch);
  }
  stats(baseId) {
    return this.call("GET", baseId !== void 0 ? `/bases/${encodeURIComponent(baseId)}/stats` : "/stats");
  }
  startReindexBase(baseId) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/reindex`);
  }
  restoreBase(baseId, name, config) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/restore`, { name, config });
  }
  getReindexJob(jobId) {
    return this.call("GET", `/reindex/${encodeURIComponent(jobId)}`);
  }
  cancelReindexJob(jobId) {
    return this.call("POST", `/reindex/${encodeURIComponent(jobId)}/cancel`);
  }
  listDocuments(baseId) {
    return this.call("GET", `/bases/${encodeURIComponent(baseId)}/documents`);
  }
  addTextDocument(baseId, title, content, parentDirectoryId) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/documents`, {
      baseId,
      title,
      content,
      ...parentDirectoryId !== void 0 ? { parentDirectoryId } : {}
    });
  }
  addFileDocument(baseId, fileName, mimeType, contentBase64, conflict, parentDirectoryId) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/documents`, {
      baseId,
      fileName,
      mimeType,
      contentBase64,
      conflict,
      ...parentDirectoryId !== void 0 ? { parentDirectoryId } : {}
    });
  }
  createDirectory(baseId, title, parentDirectoryId) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/directories`, {
      baseId,
      title,
      ...parentDirectoryId !== void 0 ? { parentDirectoryId } : {}
    });
  }
  addUrlDocument(baseId, url, parentDirectoryId) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/documents`, {
      baseId,
      url,
      ...parentDirectoryId !== void 0 ? { parentDirectoryId } : {}
    });
  }
  startDirectoryImport(baseId, path) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/import-directory`, { baseId, path });
  }
  importDirectoryTree(baseId, path) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/import-directory-tree`, { baseId, path });
  }
  /** Import a local directory or single file by its absolute path (validated server-side). */
  importFromPath(baseId, path) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/import-path`, { baseId, path }, 30 * 6e4);
  }
  /** Repoint the base's source path (validated server-side). */
  setBaseSourcePath(baseId, sourceId, path) {
    return this.call("POST", `/bases/${encodeURIComponent(baseId)}/source-path`, { baseId, sourceId, path });
  }
  getDirectoryImport(jobId) {
    return this.call("GET", `/import-directory/${encodeURIComponent(jobId)}`);
  }
  cancelDirectoryImport(jobId) {
    return this.call("POST", `/import-directory/${encodeURIComponent(jobId)}/cancel`);
  }
  getIndexingStatus() {
    return this.call("GET", "/indexing-status");
  }
  getDocument(documentId, opts) {
    const query = opts?.rawTextLimit !== void 0 ? `?rawTextLimit=${encodeURIComponent(String(opts.rawTextLimit))}&includeChunks=false` : "";
    return this.call("GET", `/documents/${encodeURIComponent(documentId)}${query}`);
  }
  renameDocument(documentId, title) {
    return this.call("PATCH", `/documents/${encodeURIComponent(documentId)}`, { title });
  }
  reindexDocument(documentId, mode) {
    return this.call("POST", `/documents/${encodeURIComponent(documentId)}/reindex`, mode === void 0 ? void 0 : { mode }, 2 * 60 * 6e4 + 3e4);
  }
  cancelProcessing(documentId) {
    return this.call("POST", `/documents/${encodeURIComponent(documentId)}/cancel`);
  }
  readDocumentEvidence(documentId, options = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) if (value !== void 0) params.set(key, String(value));
    return this.call("GET", `/documents/${encodeURIComponent(documentId)}/evidence?${params}`);
  }
  refreshUrlDocument(documentId) {
    return this.call("POST", `/documents/${encodeURIComponent(documentId)}/refresh`);
  }
  reindexDocuments(ids) {
    return this.call("POST", "/documents/reindex", { ids }, 30 * 6e4);
  }
  /** Preview the subtree and durable snapshots a delete would remove. */
  getDeleteImpact(documentId) {
    return this.call("GET", `/documents/${encodeURIComponent(documentId)}/delete-impact`);
  }
  deleteDocument(id, recursive = false) {
    const query = recursive ? "?recursive=true" : "";
    return this.call("DELETE", `/documents/${encodeURIComponent(id)}${query}`);
  }
  /** Delete a selection. `deleted` is the number of documents removed (including
   *  the descendants of a selected directory); `roots` is the folded count. */
  deleteDocuments(ids, recursive = false) {
    return this.call("DELETE", "/documents", { ids, recursive });
  }
  listChunks(documentId, limit) {
    const params = new URLSearchParams();
    if (limit !== void 0) params.set("limit", String(limit));
    params.set("includeEmbeddings", "false");
    return this.call("GET", `/documents/${encodeURIComponent(documentId)}/chunks?${params.toString()}`);
  }
  search(request) {
    return this.call("POST", "/search", request);
  }
};

// src/ui/client/KnowledgeSection.tsx
var import_react5 = require("react");

// src/knowledge/text-safety.ts
var isHighSurrogate = (code) => code >= 55296 && code <= 56319;
var isLowSurrogate = (code) => code >= 56320 && code <= 57343;
function snapSliceEnd(text, index) {
  return index > 0 && index < text.length && isHighSurrogate(text.charCodeAt(index - 1)) && isLowSurrogate(text.charCodeAt(index)) ? index - 1 : index;
}

// src/knowledge/source-spans.ts
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

// src/knowledge/context-protocol.ts
function serializeContextWindow(window2) {
  const parts = [];
  for (const excerpt of window2.before) parts.push(serializeExcerpt(excerpt, false));
  parts.push(serializeExcerpt(window2.anchor, true));
  for (const excerpt of window2.after) parts.push(serializeExcerpt(excerpt, false));
  return parts.join("\n\n");
}
function serializeExcerpt(excerpt, anchor) {
  const heading = excerpt.heading?.trim();
  const prefix = `${anchor ? ">>> " : ""}${heading !== void 0 && heading.length > 0 ? `[${heading}] ` : ""}`;
  return `${prefix}${sourceSpanLabel(excerpt.sourceSpans)}${excerpt.text}`;
}

// src/ui/client/titlebar-safe-area.ts
function overlay() {
  return globalThis.navigator?.windowControlsOverlay;
}
function getTitlebarInset() {
  try {
    const controls = overlay();
    if (controls === void 0 || controls.visible === false) return 0;
    const { y, height } = controls.getTitlebarAreaRect();
    if (!Number.isFinite(y) || !Number.isFinite(height) || height <= 0) return 0;
    const viewport = globalThis.window?.innerHeight ?? Number.MAX_SAFE_INTEGER;
    return Math.min(Math.max(0, viewport), Math.max(0, y + height));
  } catch {
    return 0;
  }
}
function subscribeTitlebarInset(listener) {
  const controls = overlay();
  controls?.addEventListener("geometrychange", listener);
  globalThis.window?.addEventListener("resize", listener);
  return () => {
    controls?.removeEventListener("geometrychange", listener);
    globalThis.window?.removeEventListener("resize", listener);
  };
}

// src/ui/client/processing-evidence.tsx
var import_react = require("react");

// src/ui/client/theme.ts
var C = {
  bg: "var(--dsw-alias-bg-base, #f6f7f9)",
  surface: "var(--dsw-alias-bg-layer-1, #ffffff)",
  surface2: "var(--dsw-alias-bg-layer-2, #f1f2f5)",
  overlay: "var(--dsw-alias-bg-overlay, #ffffff)",
  text: "var(--dsw-alias-label-primary, #1f2329)",
  // DSH's label-secondary is extremely faint in the light theme (#cfd3d6 on
  // white ≈ 1.4:1), which makes hint/secondary text visually merge with the
  // surface. Derive a readable "muted" from the primary label color instead
  // (≈72% of near-black in light, ≈72% of near-white in dark), so it stays
  // legible in both DSH themes while still reading as secondary.
  muted: "color-mix(in srgb, var(--dsw-alias-label-primary, #1f2329) 72%, transparent)",
  // DSH's border-l1 is ~6% black / 9% white — too faint to separate panels.
  // Use the stronger border-l2 / border-l3 tiers for card and control edges.
  border: "var(--dsw-alias-border-l2, #c7ccd4)",
  borderStrong: "var(--dsw-alias-border-l3, #9aa1ab)",
  accent: "var(--dsw-alias-brand-primary, #3b6ef6)",
  danger: "var(--dsw-alias-state-error-primary, #e5484d)",
  success: "var(--dsw-alias-state-success-primary, #30a46c)",
  warn: "var(--dsw-alias-state-warn-primary, #f5a623)"
};
var accentSoft = "color-mix(in srgb, var(--dsw-alias-brand-primary, #3b6ef6) 10%, transparent)";
var PANEL_CSS = `
@keyframes kb-spin { to { transform: rotate(360deg) } }
@keyframes kb-fade-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
.kb-spinner { animation: kb-spin 0.9s linear infinite }
.kb-panel-in { animation: kb-fade-in 0.18s ease-out }
/* Theme-adaptive interaction fills. DSH's own layer tokens are pure white in
   the light theme and its interactive-bg-hover is only ~6% alpha, so hovers
   built on them are nearly invisible. Derive hover/active fills from the
   inverted label-primary token instead: ~9% black-on-white in light, ~9%
   white-on-dark in dark \u2014 clearly visible in both base themes. Declared on
   body (portal menus and the sidebar action render outside the panel) and
   re-scoped to the panel root. */
body, .kb-panel-in {
  --kb-hover: color-mix(in srgb, var(--dsw-alias-label-primary, #1f2329) 9%, transparent);
  --kb-active: color-mix(in srgb, var(--dsw-alias-label-primary, #1f2329) 16%, transparent);
}
.kb-row { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease }
.kb-row:hover { background: var(--kb-hover) }
/* Menu items fill on hover/active; the fill rides a CSS variable referenced from
   the inline background so the class can override the inline style. */
.kb-menuitem { transition: background 0.15s ease }
.kb-menuitem:hover { --kb-mibg: var(--kb-hover) }
.kb-menuitem:active { --kb-mibg: var(--kb-active) }
.kb-card { transition: border-color 0.15s ease, background 0.15s ease }
.kb-card:hover { border-color: var(--dsw-alias-border-l2, #c7ccd4) }
.kb-iconbtn { transition: color 0.15s ease, background 0.15s ease }
.kb-iconbtn:hover { color: var(--dsw-alias-brand-primary, #3b6ef6); background: ${accentSoft} }
/* Buttons styled with style.button get a hover tint like the shell's own
   buttons. The tint rides a CSS variable referenced from the inline
   background, because inline styles outrank plain class rules: on hover the
   variable flips and the inline background follows it. The .kb-panel-in rule
   covers every panel button even without the kb-btn class (the class is only
   required for the settings section, which lives outside the panel). */
.kb-btn { transition: background 0.15s ease, border-color 0.15s ease }
.kb-btn:hover { --kb-btn-bg: var(--kb-hover) }
.kb-btn:disabled:hover { --kb-btn-bg: var(--dsw-alias-bg-layer-1, #ffffff) }
.kb-panel-in button:hover { --kb-btn-bg: var(--kb-hover) }
.kb-panel-in button:disabled:hover { --kb-btn-bg: var(--dsw-alias-bg-layer-1, #ffffff) }
/* Backgrounds live in classes (not inline) so :hover can override them, the
   same way the shell's Settings trigger styles itself. */
.kb-sidebar-action { background: transparent }
.kb-sidebar-action:hover { background: var(--kb-hover) }
.kb-sidebar-action:active { background: var(--kb-active) }
.kb-dangerbtn:hover { color: var(--dsw-alias-state-error-primary, #e5484d); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 10%, transparent) }
/* Primary (accent-filled) buttons: DSH's brand-primary inverts between themes
   (near-black in light, near-white in dark) and ships a dedicated hover token,
   so the hover fill follows that token and stays visible in both. */
.kb-primary { transition: background 0.15s ease, filter 0.15s ease }
.kb-primary:hover:not(:disabled) { --kb-primary-bg: var(--dsw-alias-button-primary-hover, #43454a) }
.kb-primary:active:not(:disabled) { filter: brightness(0.94) }
.kb-primary:disabled { opacity: 0.5; cursor: not-allowed }
.kb-danger-primary { transition: background 0.15s ease, filter 0.15s ease }
.kb-danger-primary:hover:not(:disabled) { --kb-danger-bg: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 78%, #000) }
.kb-danger-primary:active:not(:disabled) { filter: brightness(0.94) }
.kb-danger-primary:disabled { opacity: 0.5; cursor: not-allowed }
/* Disabled feedback for every panel button. */
.kb-panel-in button:disabled { opacity: 0.5; cursor: not-allowed }
/* Visible focus indicators (DSH's business-primary is a blue that reads in
   both themes, unlike the inverted brand-primary). */
.kb-panel-in button:focus-visible, .kb-menuitem:focus-visible, .kb-sidebar-action:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4176e6); outline-offset: 2px }
.kb-panel-in input:focus, .kb-panel-in select:focus, .kb-panel-in textarea:focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 35%, transparent) }
/* Resize sash: an 8px grab strip whose 2px grip lights up on hover so the
   draggable edge is discoverable (a 5px transparent sliver was impossible to
   find/click). z-index keeps it above adjacent scrollbars. */
.kb-sash { position: relative; z-index: 6 }
.kb-sash::before { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; transform: translateX(-50%); width: 2px; background: transparent; transition: background 0.15s ease }
.kb-sash:hover::before { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #3b6ef6) 45%, transparent) }
.kb-scroll::-webkit-scrollbar { width: 8px; height: 8px }
.kb-scroll::-webkit-scrollbar-thumb { background: var(--dsw-alias-border-l2, #c7ccd4); border-radius: 999px }
.kb-scroll::-webkit-scrollbar-track { background: transparent }
.kb-rag-config { container-type: inline-size }
.kb-rag-config-field { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, 42%); align-items: center; gap: 12px 20px; margin-bottom: 18px }
.kb-rag-config-control { min-width: 0 }
@container (max-width: 640px) {
  .kb-rag-config-field { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 8px; margin-bottom: 20px }
  .kb-rag-config-control { width: 100% }
  .kb-rag-config-control:has([role="switch"]) { width: auto; justify-self: start }
}
`;
var style = {
  panel: {
    position: "fixed",
    inset: 0,
    zIndex: 300,
    display: "flex",
    flexDirection: "column",
    top: "max(var(--kb-titlebar-inset, 0px), calc(env(titlebar-area-y, 0px) + env(titlebar-area-height, 0px)))",
    background: C.bg,
    color: C.text,
    pointerEvents: "auto"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    padding: "0 16px",
    borderBottom: `1px solid ${C.border}`,
    background: C.surface,
    flexShrink: 0
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 15, fontWeight: 600 },
  headerActions: { display: "flex", alignItems: "center", gap: 6 },
  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "6px 12px",
    background: C.surface,
    color: C.text,
    cursor: "pointer",
    fontSize: 13
  },
  closeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: C.muted,
    cursor: "pointer",
    fontSize: 16
  },
  body: { flex: 1, display: "flex", minHeight: 0 },
  sidebar: {
    width: 272,
    flexShrink: 0,
    borderRight: `1px solid ${C.border}`,
    background: C.surface,
    padding: 14,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  newBaseButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: 10,
    padding: "10px 12px",
    background: "transparent",
    color: C.accent,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0
  },
  baseCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid transparent",
    background: "transparent"
  },
  baseCardActive: { background: accentSoft, border: `1px solid ${C.accent}33` },
  baseAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 9,
    color: "#fff",
    flexShrink: 0,
    fontSize: 15,
    fontWeight: 700
  },
  baseName: { fontSize: 13, fontWeight: 600 },
  baseMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  baseSourceRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "4px 14px",
    marginTop: 6,
    padding: "5px 10px",
    borderRadius: 8,
    background: "color-mix(in srgb, var(--dsw-alias-label-primary, #1f2329) 6%, transparent)",
    fontSize: 11,
    color: C.muted
  },
  baseSourceItem: { display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0 },
  baseSourceGlyph: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    color: C.accent
  },
  baseSourceText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Consolas, monospace"
  },
  baseSourceEdit: { flexShrink: 0 },
  main: { flex: 1, minWidth: 0, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 },
  card: { border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface, padding: 14, position: "relative" },
  cardTitle: { fontSize: 13, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between" },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "6px 12px",
    background: `var(--kb-btn-bg, ${C.surface})`,
    color: C.text,
    cursor: "pointer",
    fontSize: 13
  },
  primary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: "1px solid transparent",
    borderRadius: 8,
    padding: "6px 14px",
    background: `var(--kb-primary-bg, ${C.accent})`,
    // DSH's brand-primary is near-BLACK in light but near-WHITE in dark; the
    // foreground token inverts with the theme so the label stays readable on
    // the accent fill in both modes (white text on white would vanish in dark).
    color: "var(--dsw-alias-label-primary-foreground, #fff)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  },
  primaryDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: "1px solid transparent",
    borderRadius: 8,
    padding: "6px 14px",
    background: `var(--kb-danger-bg, ${C.danger})`,
    color: "var(--dsw-alias-label-primary-foreground, #fff)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  },
  danger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 6,
    padding: "3px 8px",
    background: "transparent",
    color: C.muted,
    cursor: "pointer",
    fontSize: 12
  },
  input: {
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 13,
    background: C.surface,
    color: C.text,
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  },
  textarea: {
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 9,
    fontSize: 13,
    background: C.surface,
    color: C.text,
    width: "100%",
    minHeight: 84,
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit"
  },
  dropzone: {
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    textAlign: "center",
    color: C.muted,
    fontSize: 12
  },
  dropzoneActive: { border: `1px dashed ${C.accent}`, background: accentSoft, color: C.accent },
  actionsRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  statsRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },
  statChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    background: C.surface2,
    borderRadius: 10,
    padding: "7px 14px",
    minWidth: 62
  },
  statValue: { fontSize: 15, fontWeight: 700, color: C.text },
  statLabel: { fontSize: 11, color: C.muted },
  docRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid transparent",
    marginBottom: 2
  },
  docIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    background: C.surface2,
    flexShrink: 0
  },
  docTitle: { fontSize: 13, fontWeight: 600 },
  docMeta: { fontSize: 11, color: C.muted, marginTop: 1 },
  docActions: { display: "flex", marginLeft: "auto" },
  chunk: {
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    fontSize: 12,
    background: C.surface2
  },
  hit: { border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, marginBottom: 8, fontSize: 12, background: C.surface },
  scorePill: {
    display: "inline-block",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    marginRight: 8
  },
  mark: { background: "color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f5a623) 35%, transparent)", borderRadius: 2, padding: "0 1px" },
  label: { fontSize: 12, fontWeight: 600, marginBottom: 5, display: "block" },
  field: { marginBottom: 12 },
  hint: { fontSize: 11, color: C.muted, marginTop: 4 },
  empty: { color: C.muted, fontSize: 13, padding: 24, textAlign: "center" },
  error: { color: C.danger, fontSize: 12, background: "color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 8%, transparent)", borderRadius: 8, padding: "8px 12px" },
  modalBackdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 20,
    // Less transparent so dialog content stays clearly behind the modal.
    background: "rgba(0,0,0,0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    width: 520,
    maxWidth: "92vw",
    maxHeight: "86vh",
    overflowY: "auto",
    background: C.overlay,
    borderRadius: 14,
    padding: 18,
    border: `1px solid ${C.border}`,
    boxShadow: "0 18px 50px rgba(0,0,0,0.2)"
  },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sidebarAction: {
    // Geometry mirrors the shell's Settings trigger (ui-settings-general
    // SettingsRoot.module.css) so the two footer rows read as one. Background
    // is set by the .kb-sidebar-action class (hover must be able to override).
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "calc(100% + 8px)",
    height: 34,
    margin: "4px -4px 4px",
    padding: "6px 2px 6px 10px",
    boxSizing: "border-box",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    overflow: "hidden",
    color: "var(--dsw-alias-label-primary)",
    fontFamily: "inherit",
    fontSize: 14,
    lineHeight: 22
  },
  sidebarActionRail: {
    width: 36,
    height: 36,
    margin: "8px 0 10px",
    justifyContent: "center",
    gap: 0,
    padding: 0,
    borderRadius: "50%"
  },
  sidebarActionActive: { color: C.accent, background: accentSoft },
  tabs: { display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 14 },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    background: "transparent",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: C.muted,
    borderBottom: "2px solid transparent",
    marginBottom: -1,
    fontWeight: 600
  },
  tabActive: { color: C.accent, borderBottom: `2px solid ${C.accent}` },
  toastStack: {
    position: "absolute",
    top: 62,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 40,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center"
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    background: C.overlay,
    border: `1px solid ${C.border}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
    color: C.text,
    maxWidth: "min(90vw, 560px)"
  },
  toastClose: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 20,
    height: 20,
    border: "none",
    borderRadius: 999,
    background: "transparent",
    color: C.muted,
    cursor: "pointer",
    padding: 0,
    marginLeft: 2
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "7px 10px",
    marginBottom: 6,
    fontSize: 12
  },
  spinner: { display: "inline-block", width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent" },
  menu: {
    position: "absolute",
    zIndex: 30,
    minWidth: 180,
    borderRadius: 10,
    padding: 4,
    // Opaque overlay surface (never translucent) with the stronger border tier
    // so the popover separates from the panel in both themes.
    background: C.overlay,
    border: `1px solid ${C.borderStrong}`,
    boxShadow: "0 10px 32px rgba(0,0,0,0.22)",
    color: C.text
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    border: "none",
    background: "var(--kb-mibg, transparent)",
    borderRadius: 7,
    padding: "7px 10px",
    fontSize: 13,
    color: C.text,
    cursor: "pointer",
    textAlign: "left"
  },
  menuItemDanger: { color: C.danger },
  menuSeparator: { height: 1, background: C.border, margin: "4px 8px" },
  sectionTitle: { fontSize: 13, fontWeight: 600, margin: "0 0 2px" },
  sectionHint: { fontSize: 11, color: C.muted, margin: "0 0 10px", lineHeight: 1.5 },
  sliderRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 },
  sliderValue: { fontSize: 12, color: C.muted, fontVariantNumeric: "tabular-nums" },
  sliderBounds: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 2 },
  switch: {
    width: 36,
    height: 20,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    position: "relative",
    background: C.borderStrong,
    transition: "background 0.15s",
    flexShrink: 0
  },
  switchOn: { background: C.accent },
  switchKnob: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    // Contrasts with the accent track in both themes (near-black knob on the
    // near-white accent in dark mode, near-white knob on dark accent in light).
    background: "var(--dsw-alias-label-primary-foreground, #fff)",
    transition: "transform 0.15s"
  },
  accordionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    border: "none",
    background: "transparent",
    padding: "8px 0",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: C.text
  },
  warningHint: {
    fontSize: 11,
    color: C.warn,
    background: "color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f5a623) 10%, transparent)",
    borderRadius: 8,
    padding: "8px 10px",
    lineHeight: 1.5
  },
  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: "none",
    borderRadius: 8,
    padding: "5px 10px",
    background: "transparent",
    color: C.muted,
    cursor: "pointer",
    fontSize: 13
  },
  iconOnlyButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    border: "none",
    borderRadius: 7,
    background: "transparent",
    color: C.muted,
    cursor: "pointer",
    fontSize: 14
  },
  tableHeadRow: {
    display: "grid",
    gridTemplateColumns: "32px minmax(0,1fr) 92px 120px 96px 32px",
    alignItems: "center",
    gap: 8,
    padding: "0 10px 8px",
    borderBottom: `1px solid ${C.border}`,
    fontSize: 11,
    color: C.muted,
    fontWeight: 600
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "32px minmax(0,1fr) 92px 120px 96px 32px",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 8,
    cursor: "pointer"
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: `1px solid ${C.borderStrong}`,
    background: C.surface,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: 0,
    flexShrink: 0,
    fontSize: 11,
    lineHeight: 1
  },
  checkboxOn: {
    background: C.accent,
    borderColor: C.accent,
    color: "var(--dsw-alias-label-primary-foreground, #fff)"
  },
  sidePanelScrim: {
    // Less transparent scrim so the drawer clearly separates from the
    // panel behind it (nothing reads through).
    position: "absolute",
    inset: 0,
    zIndex: 30,
    background: "rgba(0,0,0,0.58)",
    display: "flex",
    justifyContent: "flex-end"
  },
  sidePanel: {
    width: 460,
    maxWidth: "92vw",
    height: "100%",
    background: C.surface,
    borderLeft: `1px solid ${C.border}`,
    boxShadow: "-16px 0 40px rgba(0,0,0,0.16)",
    display: "flex",
    flexDirection: "column",
    animation: "kb-fade-in 0.18s ease-out"
  },
  sidePanelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    padding: "12px 16px",
    borderBottom: `1px solid ${C.border}`
  },
  sidePanelBody: { flex: 1, minHeight: 0, padding: 16, overflowY: "auto" }
};
var AVATAR_COLORS = [
  "#3b6ef6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#6366f1"
];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = hash * 31 + name.charCodeAt(i) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function formatSize(charCount) {
  if (charCount < 1024) return `${charCount} B`;
  if (charCount < 1024 * 1024) return `${(charCount / 1024).toFixed(1)} KB`;
  return `${(charCount / (1024 * 1024)).toFixed(2)} MB`;
}
function formatRelativeTime(timestamp, t, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 6e4);
  if (minutes < 1) return t !== void 0 ? t("timeJustNow") : "\u521A\u521A";
  if (minutes < 60) return t !== void 0 ? t("timeMinutes").replace("{n}", String(minutes)) : `${minutes} \u5206\u949F\u524D`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t !== void 0 ? t("timeHours").replace("{n}", String(hours)) : `${hours} \u5C0F\u65F6\u524D`;
  const days = Math.floor(hours / 24);
  if (days < 30) return t !== void 0 ? t("timeDays").replace("{n}", String(days)) : `${days} \u5929\u524D`;
  return new Date(timestamp).toLocaleDateString();
}

// src/ui/client/processing-evidence.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var stageKeys = {
  queued: "stageQueued",
  checking: "stageChecking",
  uploading: "stageUploading",
  parsing: "stageParsing",
  downloading: "stageDownloading",
  normalizing: "stageNormalizing",
  indexing: "stageIndexing",
  completed: "stageCompleted",
  failed: "stageFailed",
  canceled: "stageCanceled"
};
function processingStageLabel(progress, t) {
  return t(stageKeys[progress.stage]);
}
function sourcePageUrl(documentId, pageIndex) {
  if (!Number.isSafeInteger(pageIndex) || pageIndex < 0) return void 0;
  return `/knowledge/documents/${encodeURIComponent(documentId)}/raw?inline=1#page=${pageIndex + 1}`;
}
function artifactUrl(documentId, revision, assetId) {
  return `/knowledge/documents/${encodeURIComponent(documentId)}/artifacts/${encodeURIComponent(assetId)}?revision=${encodeURIComponent(revision)}`;
}
function ProcessingSummary({ processing, t }) {
  if (processing === void 0) return null;
  const completeness = processing.completeness === "complete" ? "processingComplete" : processing.completeness === "partial" ? "processingPartial" : "processingUnknown";
  const provider = processing.provider === "mineru-local" ? t("mineruLocalOption") : processing.provider === "mineru" ? t("mineruOption") : t("processorBuiltin");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 10 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      t("processingInfo"),
      ": ",
      provider,
      processing.processorVersion ? ` ${processing.processorVersion}` : "",
      " \xB7 ",
      t(completeness),
      processing.reused ? ` \xB7 ${t("processingReused")}` : ""
    ] }),
    processing.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { style: { margin: "4px 0", paddingLeft: 18, color: C.warn }, children: processing.warnings.map((warning, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: warning.message }, `${warning.code}-${index}`)) }) : null
  ] });
}
function SourceReferences(props) {
  const { documentId, spans, t } = props;
  if (!spans?.length) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: C.muted, marginTop: 6 }, children: spans.slice(0, 32).map((span, index) => {
    const current = props.revision === void 0 || props.revision === span.revision;
    const pageUrl = current && span.pageIndex !== void 0 ? sourcePageUrl(documentId, span.pageIndex) : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      pageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: pageUrl, target: "_blank", rel: "noreferrer", onClick: props.onPage ? (event) => {
        event.preventDefault();
        props.onPage?.(span.pageIndex);
      } : void 0, style: { color: C.accent }, children: t("sourcePage").replace("{page}", String(span.pageIndex + 1)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("sourceUnavailable") }),
      " \xB7 ",
      t("sourceBlock"),
      " ",
      span.blockId,
      " \xB7 ",
      span.blockType,
      span.bbox ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        " \xB7 ",
        t("sourceRegion"),
        ": [",
        [span.bbox.x0, span.bbox.y0, span.bbox.x1, span.bbox.y1].map((value) => value.toFixed(3)).join(", "),
        "]"
      ] }) : null,
      current ? span.assetIds?.map((assetId) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", { href: artifactUrl(documentId, span.revision, assetId), target: "_blank", rel: "noreferrer", style: { color: C.accent, marginLeft: 8 }, children: [
        t("sourceAsset"),
        " ",
        assetId
      ] }, assetId)) : null
    ] }, `${span.revision}-${span.blockId}-${index}`);
  }) });
}
function EvidenceInspector(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceInspectorSession, { ...props }, JSON.stringify([props.documentId, props.revision]));
}
function EvidenceInspectorSession(props) {
  const { api, documentId, revision, t, onPage } = props;
  const [history, setHistory] = (0, import_react.useState)([void 0]);
  const cursor = history[history.length - 1];
  const [attempt, setAttempt] = (0, import_react.useState)(0);
  const [result, setResult] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    let canceled = false;
    setResult(null);
    setError(null);
    void api.readDocumentEvidence(documentId, { ...cursor, revision, maxTokens: 1600 }).then((value) => {
      if (!canceled) setResult(value);
    }).catch((reason) => {
      if (!canceled) setError(reason instanceof Error ? reason.message : String(reason));
    });
    return () => {
      canceled = true;
    };
  }, [api, documentId, revision, cursor?.blockId, cursor?.blockOffset, attempt]);
  function back() {
    setResult(null);
    setError(null);
    setHistory((previous) => previous.slice(0, -1));
  }
  if (error !== null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "alert", style: style.warningHint, children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
      history.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: style.button, onClick: back, children: t("evidenceBack") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: style.button, onClick: () => {
        setError(null);
        setResult(null);
        setAttempt((value) => value + 1);
      }, children: t("evidenceRetry") })
    ] })
  ] });
  if (result === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "status", style: style.empty, children: t("processing") });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    result.blocks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: style.empty, children: t("evidenceEmpty") }) : result.blocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, padding: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 11, color: C.muted }, children: [
        block.type,
        " \xB7 ",
        block.id
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12, fontFamily: "inherit", lineHeight: 1.6 }, children: block.text }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceReferences, { documentId, t, onPage, revision, spans: result.processing ? [{
        revision: result.processing.revision,
        blockId: block.id,
        blockType: block.type,
        chunkStart: 0,
        chunkEnd: block.text.length,
        blockStart: 0,
        blockEnd: block.text.length,
        pageIndex: block.pageIndex,
        bbox: block.bbox,
        assetIds: block.assetIds
      }] : void 0 })
    ] }, block.id)),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { "aria-label": t("evidence"), style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
      history.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: style.button, onClick: back, children: t("evidenceBack") }) : null,
      result.truncated && result.next ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: style.button, onClick: () => {
        const next = result.next;
        setResult(null);
        setHistory((previous) => [...previous, next]);
      }, children: t("evidenceNext") }) : null
    ] })
  ] });
}

// src/ui/client/chunk-expansion.ts
function collapsedChunkExpansion() {
  return { allExpanded: false, expandedChunkIds: /* @__PURE__ */ new Set() };
}
function expandAllChunks() {
  return { allExpanded: true, expandedChunkIds: /* @__PURE__ */ new Set() };
}
function collapseAllChunks() {
  return collapsedChunkExpansion();
}
function isChunkExpanded(state, chunkId) {
  return state.allExpanded || state.expandedChunkIds.has(chunkId);
}
function toggleChunkExpansion(state, loadedChunkIds, chunkId) {
  if (state.allExpanded) {
    const expandedChunkIds2 = new Set(loadedChunkIds);
    expandedChunkIds2.delete(chunkId);
    return { allExpanded: false, expandedChunkIds: expandedChunkIds2 };
  }
  const expandedChunkIds = new Set(state.expandedChunkIds);
  if (expandedChunkIds.has(chunkId)) expandedChunkIds.delete(chunkId);
  else expandedChunkIds.add(chunkId);
  return { allExpanded: false, expandedChunkIds };
}
function chunkPreviewBodyId(documentId, chunkId) {
  const bytes = new TextEncoder().encode(JSON.stringify([documentId, chunkId]));
  const encoded = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `kb-chunk-body-${encoded}`;
}

// src/ui/client/icons.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function svgProps(size, color) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color ?? "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };
}
function IconBook(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 18, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })
  ] });
}
function IconDoc(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "8", y1: "13", x2: "16", y2: "13" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "8", y1: "17", x2: "13", y2: "17" })
  ] });
}
function IconPdf(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M8 13h1.5a1.5 1.5 0 0 1 0 3H8m0-3v3m3.5-3h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-2" })
  ] });
}
function IconWord(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7.5 12 10 17l2.5-5M12 17l1.5-5h3" })
  ] });
}
function IconMarkdown(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M8 17v-6l2.5 3 2.5-3v6M15 13h3" })
  ] });
}
function IconText(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "8", y1: "13", x2: "16", y2: "13" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "8", y1: "17", x2: "16", y2: "17" })
  ] });
}
function IconGlobe(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" })
  ] });
}
function IconPlus(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), strokeWidth: 2.2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
  ] });
}
function IconLink(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
  ] });
}
function IconSearch(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "11", cy: "11", r: "8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
  ] });
}
function IconPencil(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { ...svgProps(props.size ?? 12, props.color), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" }) });
}
function IconTrash(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 12, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "3 6 5 6 21 6" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
  ] });
}
function IconCheck(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { ...svgProps(props.size ?? 14, props.color), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "20 6 9 17 4 12" }) });
}
function IconX(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 12, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
  ] });
}
function IconRefresh(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "23 4 23 10 17 10" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
  ] });
}
function IconFlask(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "8.5", y1: "2", x2: "15.5", y2: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7 16h10" })
  ] });
}
function IconSliders(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "4", y1: "21", x2: "4", y2: "14" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "4", y1: "10", x2: "4", y2: "3" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "21", x2: "12", y2: "12" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "8", x2: "12", y2: "3" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "20", y1: "21", x2: "20", y2: "16" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "20", y1: "12", x2: "20", y2: "3" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "1", y1: "14", x2: "7", y2: "14" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "9", y1: "8", x2: "15", y2: "8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "17", y1: "16", x2: "23", y2: "16" })
  ] });
}
function IconMore(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 16, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "5", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "19", r: "1", fill: "currentColor", stroke: "none" })
  ] });
}
function IconEye(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "3" })
  ] });
}
function IconDownload(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 14, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "7 10 12 15 17 10" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
  ] });
}
function IconBox(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 18, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "22.08", x2: "12", y2: "12" })
  ] });
}
function fileVisual(name) {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  if (ext === "pdf") return { color: "#e5484d", icon: IconPdf };
  if (ext === "docx" || ext === "doc") return { color: "#3b6ef6", icon: IconWord };
  if (ext === "md" || ext === "markdown") return { color: "#8b5cf6", icon: IconMarkdown };
  if (ext === "txt" || ext === "text" || ext === "log" || ext === "json" || ext === "csv") {
    return { color: "#8a919c", icon: IconText };
  }
  return { color: "#10b981", icon: IconGlobe };
}
function docIconStyle(color) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    flexShrink: 0,
    color,
    background: `color-mix(in srgb, ${color} 12%, transparent)`
  };
}
function IconFolder(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { ...svgProps(props.size ?? 18, props.color), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" }) });
}
function IconFolderInput(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 18, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M2 13h10" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m9 16 3-3-3-3" })
  ] });
}
function IconFolderOpen(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { ...svgProps(props.size ?? 18, props.color), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" }) });
}
function IconFolderSearch(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 18, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m21 21-1.9-1.9" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "17", cy: "17", r: "3" })
  ] });
}
function IconScanText(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 18, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7 8h8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7 12h10" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7 16h6" })
  ] });
}
function IconBot(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { ...svgProps(props.size ?? 18, props.color), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 8V4H8" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M2 14h2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M20 14h2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M15 13v2" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M9 13v2" })
  ] });
}

// src/ui/client/dialogs.tsx
var import_react2 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function Toasts(props) {
  if (props.toasts.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: style.toastStack, children: props.toasts.map((toast) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.toast, children: [
    toast.kind === "success" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconCheck, { size: 14, color: C.success }) : toast.kind === "error" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconX, { size: 14, color: C.danger }) : toast.kind === "warning" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconX, { size: 14, color: "#f5a524" }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { userSelect: "text", whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: toast.text }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.toastClose, onClick: () => props.onDismiss?.(toast.id), "aria-label": "close", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconX, { size: 12, color: C.muted }) })
  ] }, toast.id)) });
}
function Modal(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: style.modalBackdrop, onClick: props.onClose, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      style: { ...style.modal, ...props.width !== void 0 ? { width: props.width } : {} },
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.modalHeader, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { style: { fontSize: 14 }, children: props.title }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.closeButton, onClick: props.onClose, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconX, { size: 14 }) })
        ] }),
        props.children
      ]
    }
  ) });
}
function ConfirmDialog(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Modal, { title: props.title, onClose: props.onClose, width: 400, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }, children: props.message }),
    props.details !== void 0 && props.details.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { style: { margin: "0 0 16px", padding: "8px 12px 8px 28px", fontSize: 12, lineHeight: 1.8, background: C.surface2, borderRadius: 6 }, children: props.details.map((detail) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: detail }, detail)) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { ...style.actionsRow, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.button, onClick: props.onClose, children: "\u2715" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "kb-danger-primary", style: style.primaryDanger, onClick: props.onConfirm, disabled: props.busy === true, children: props.confirmLabel })
    ] })
  ] });
}
function PromptDialog(props) {
  const [value, setValue] = (0, import_react2.useState)(props.initial);
  const [submitting, setSubmitting] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    if (props.busy !== true) setSubmitting(false);
  }, [props.busy]);
  const submit = () => {
    if (submitting || value.trim().length === 0) return;
    setSubmitting(true);
    props.onOk(value.trim());
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Modal, { title: props.title, onClose: props.onClose, width: 400, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.label }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          autoFocus: true,
          style: style.input,
          value,
          onChange: (e) => setValue(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") submit();
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { ...style.actionsRow, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.button, onClick: props.onClose, children: "\u2715" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "kb-primary", style: style.primary, disabled: submitting || value.trim().length === 0, onClick: submit, children: "OK" })
    ] })
  ] });
}
function TextDocumentDialog(props) {
  const [title, setTitle] = (0, import_react2.useState)("");
  const [content, setContent] = (0, import_react2.useState)("");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Modal, { title: props.t("tabText"), onClose: props.onClose, width: 460, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("baseName") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          autoFocus: true,
          style: style.input,
          value: title,
          placeholder: props.t("textTitlePlaceholder"),
          onChange: (e) => setTitle(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("textContentLabel") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "textarea",
        {
          style: { ...style.textarea, minHeight: 180 },
          value: content,
          placeholder: props.t("textContentPlaceholder"),
          onChange: (e) => setContent(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { ...style.actionsRow, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.button, onClick: props.onClose, children: props.t("cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          className: "kb-primary",
          style: style.primary,
          disabled: props.busy === true || title.trim().length === 0 || content.trim().length === 0,
          onClick: () => props.onCreate(title.trim(), content),
          children: props.t("tabText")
        }
      )
    ] })
  ] });
}
function RestoreBaseDialog(props) {
  const [name, setName] = (0, import_react2.useState)(props.defaultName);
  const [provider, setProvider] = (0, import_react2.useState)("none");
  const [model, setModel] = (0, import_react2.useState)("");
  const [baseUrl, setBaseUrl] = (0, import_react2.useState)("");
  const [apiKey, setApiKey] = (0, import_react2.useState)("");
  const modelChanged = provider !== "none";
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Modal, { title: props.t("rebuildBase"), onClose: props.onClose, width: 460, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }, children: props.t("restoreHint") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("baseName") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { autoFocus: true, style: style.input, value: name, onChange: (e) => setName(e.target.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("embeddingModel") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("select", { style: style.input, value: provider, onChange: (e) => {
        const next = e.target.value;
        if (next === "ollama" && baseUrl.trim() === "") setBaseUrl("http://127.0.0.1:11434");
        setProvider(next);
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "none", children: props.t("restoreKeepModel") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "openai", children: props.t("providerOpenAI") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "ollama", children: "Ollama" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "local", children: props.t("providerLocal") })
      ] })
    ] }),
    modelChanged && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("modelId") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            style: style.input,
            list: "kb-restore-model-list",
            value: model,
            placeholder: provider === "local" ? "onnx-community/Qwen3-Embedding-0.6B-ONNX" : "text-embedding-3-small",
            onChange: (e) => setModel(e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("datalist", { id: "kb-restore-model-list", children: [
          provider === "local" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "onnx-community/Qwen3-Embedding-0.6B-ONNX" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "Xenova/bge-small-zh-v1.5" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "Xenova/bge-small-en-v1.5" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "Xenova/gte-small" })
          ] }),
          provider !== "local" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "text-embedding-3-small" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "text-embedding-3-large" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "bge-m3" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "bge-large-zh-v1.5" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("baseUrlLabel") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            style: style.input,
            value: baseUrl,
            placeholder: provider === "ollama" ? "http://127.0.0.1:11434" : "https://api.openai.com/v1",
            onChange: (e) => setBaseUrl(e.target.value)
          }
        )
      ] }),
      provider === "openai" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("apiKeyLabel") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { style: style.input, type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { ...style.actionsRow, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.button, onClick: props.onClose, children: props.t("cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          className: "kb-primary",
          style: style.primary,
          disabled: props.busy === true || name.trim().length === 0 || modelChanged && model.trim().length === 0,
          onClick: () => props.onRestore(
            name.trim(),
            modelChanged ? { provider, baseUrl: baseUrl.trim(), model: model.trim(), apiKey: apiKey.trim() } : void 0
          ),
          children: props.t("rebuildBase")
        }
      )
    ] })
  ] });
}
function CreateBaseDialog(props) {
  const [name, setName] = (0, import_react2.useState)("");
  const [description, setDescription] = (0, import_react2.useState)("");
  const [group, setGroup] = (0, import_react2.useState)(
    props.initialGroup !== void 0 && props.groups.includes(props.initialGroup) ? props.initialGroup : ""
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Modal, { title: props.t("newBase"), onClose: props.onClose, width: 440, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("baseName") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { autoFocus: true, style: style.input, value: name, onChange: (e) => setName(e.target.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("baseDescription") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("textarea", { style: { ...style.textarea, minHeight: 60 }, value: description, onChange: (e) => setDescription(e.target.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: style.field, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: style.label, children: props.t("groupName") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("select", { style: style.input, value: group, onChange: (e) => setGroup(e.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "", children: props.t("ungrouped") }),
        props.groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: g, children: g }, g))
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { ...style.actionsRow, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: style.button, onClick: props.onClose, children: props.t("cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          className: "kb-primary",
          style: style.primary,
          disabled: props.busy === true || name.trim().length === 0,
          onClick: () => props.onCreate(name.trim(), description.trim(), group.trim() === "" ? void 0 : group.trim()),
          children: props.t("create")
        }
      )
    ] })
  ] });
}
var FILE_ACCEPT = ".txt,.md,.markdown,.mdx,.csv,.html,.htm,.json,.log,.pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.epub";
var MAX_FILES = 20;
var MAX_UPLOAD_BYTES = 22 * 1024 * 1024;
var SUPPORTED_IMPORT_EXTENSIONS = new Set(FILE_ACCEPT.split(",").map((ext) => ext.slice(1)));
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("failed to read file"));
    reader.readAsDataURL(file);
  });
}

// src/ui/client/popover.tsx
var import_react3 = require("react");
var import_react_dom = require("react-dom");

// src/ui/client/popover-placement.ts
var VIEWPORT_MARGIN = 8;
var MENU_GAP = 4;
function placePopover(trigger, menu, viewport, align = "start") {
  const maxLeft = Math.max(VIEWPORT_MARGIN, viewport.width - menu.width - VIEWPORT_MARGIN);
  const preferredLeft = align === "end" ? trigger.right - menu.width : trigger.left;
  const left = clamp(preferredLeft, VIEWPORT_MARGIN, maxLeft);
  const below = trigger.bottom + MENU_GAP;
  const above = trigger.top - menu.height - MENU_GAP;
  const fitsBelow = below + menu.height <= viewport.height - VIEWPORT_MARGIN;
  const fitsAbove = above >= VIEWPORT_MARGIN;
  const preferredTop = fitsBelow || !fitsAbove ? below : above;
  const maxTop = Math.max(VIEWPORT_MARGIN, viewport.height - menu.height - VIEWPORT_MARGIN);
  return { top: clamp(preferredTop, VIEWPORT_MARGIN, maxTop), left };
}
function placeSubmenu(parent, menu, viewport) {
  const maxLeft = Math.max(VIEWPORT_MARGIN, viewport.width - menu.width - VIEWPORT_MARGIN);
  const right = parent.right + MENU_GAP;
  const left = parent.left - menu.width - MENU_GAP;
  const preferredLeft = right + menu.width <= viewport.width - VIEWPORT_MARGIN ? right : left >= VIEWPORT_MARGIN ? left : right;
  const maxTop = Math.max(VIEWPORT_MARGIN, viewport.height - menu.height - VIEWPORT_MARGIN);
  return {
    top: clamp(parent.top, VIEWPORT_MARGIN, maxTop),
    left: clamp(preferredLeft, VIEWPORT_MARGIN, maxLeft)
  };
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// src/ui/client/popover.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var MENU_WIDTH = 220;
function PopoverMenu(props) {
  const [open, setOpen] = (0, import_react3.useState)(false);
  const ref = (0, import_react3.useRef)(null);
  const menuRef = (0, import_react3.useRef)(null);
  const [pos, setPos] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    if (!open) return;
    const onDocumentClick = (event) => {
      const target = event.target;
      if (ref.current !== null && ref.current.contains(target)) return;
      if (menuRef.current !== null && menuRef.current.contains(target)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onResize = () => setOpen(false);
    document.addEventListener("mousedown", onDocumentClick);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  (0, import_react3.useLayoutEffect)(() => {
    if (!open || ref.current === null || menuRef.current === null) return;
    const trigger = ref.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const next = placePopover(
      trigger,
      { width: menu.width, height: menu.height },
      { width: window.innerWidth, height: window.innerHeight },
      props.align
    );
    setPos((current) => current?.top === next.top && current.left === next.left ? current : next);
  }, [open, props.align, props.entries]);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && ref.current !== null) {
      const rect = ref.current.getBoundingClientRect();
      setPos(placePopover(
        rect,
        { width: MENU_WIDTH, height: estimateMenuHeight(props.entries) },
        { width: window.innerWidth, height: window.innerHeight },
        props.align
      ));
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { ref, style: { position: "relative", display: "inline-flex" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "span",
      {
        style: { display: "inline-flex" },
        onClick: (e) => {
          e.stopPropagation();
          toggle();
        },
        children: props.trigger
      }
    ),
    open && pos !== null && (0, import_react_dom.createPortal)(
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          ref: menuRef,
          style: {
            ...style.menu,
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: MENU_WIDTH,
            maxWidth: "calc(100vw - 16px)",
            // Body-level portal: sit above the whole panel (zIndex 300) so the
            // menu can never be buried by list rows or clipped by a scrollable
            // sidebar's overflow.
            zIndex: 1e3
          },
          onClick: (e) => e.stopPropagation(),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MenuItems, { entries: props.entries, onCloseAll: () => setOpen(false) })
        }
      ),
      document.body
    )
  ] });
}
function estimateMenuHeight(entries) {
  let h = 8;
  for (const e of entries) h += e.label === void 0 ? 9 : 36;
  return h;
}
function MenuItems(props) {
  const [openSub, setOpenSub] = (0, import_react3.useState)(null);
  const closeTimer = (0, import_react3.useRef)(null);
  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenSub(null), 150);
  };
  (0, import_react3.useEffect)(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);
  const openChildren = (entry, element) => {
    if (entry.children === void 0) return;
    const rect = element.getBoundingClientRect();
    setOpenSub({
      key: entry.key,
      position: placeSubmenu(
        rect,
        { width: MENU_WIDTH, height: estimateMenuHeight(entry.children) },
        { width: window.innerWidth, height: window.innerHeight }
      )
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: props.entries.map(
    (entry) => entry.label === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: style.menuSeparator }, entry.key) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "div",
      {
        style: { position: "relative" },
        onMouseEnter: (event) => {
          if (entry.children !== void 0) {
            cancelClose();
            openChildren(entry, event.currentTarget);
          }
        },
        onMouseLeave: () => {
          if (openSub?.key === entry.key) scheduleClose();
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "button",
            {
              className: "kb-row kb-menuitem",
              style: { ...style.menuItem, ...entry.danger === true ? style.menuItemDanger : {} },
              onClick: (event) => {
                if (entry.children !== void 0) {
                  if (openSub?.key === entry.key) setOpenSub(null);
                  else openChildren(entry, event.currentTarget.parentElement ?? event.currentTarget);
                  return;
                }
                props.onCloseAll();
                entry.onSelect?.();
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { flex: 1, display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
                  entry.icon ?? null,
                  entry.label
                ] }),
                entry.children !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "inherit", opacity: 0.55, fontSize: 10 }, children: "\u25B8" })
              ]
            }
          ),
          entry.children !== void 0 && openSub?.key === entry.key && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "div",
            {
              style: {
                ...style.menu,
                position: "fixed",
                top: openSub.position.top,
                left: openSub.position.left,
                width: MENU_WIDTH,
                maxWidth: "calc(100vw - 16px)",
                zIndex: 1001
              },
              onMouseEnter: cancelClose,
              onMouseLeave: scheduleClose,
              children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                MenuItems,
                {
                  entries: entry.children,
                  onCloseAll: () => {
                    cancelClose();
                    setOpenSub(null);
                    props.onCloseAll();
                  }
                }
              )
            }
          )
        ]
      },
      entry.key
    )
  ) });
}
function ContextMenu(props) {
  const ref = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    const onDown = (event) => {
      if (ref.current !== null && !ref.current.contains(event.target)) props.onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") props.onClose();
    };
    const onScroll = () => props.onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [props.onClose]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { ref, style: { ...style.menu, position: "fixed", left: props.x, top: props.y, zIndex: 300 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MenuItems, { entries: props.entries, onCloseAll: props.onClose }) });
}

// src/ui/client/rag-config.tsx
var import_react4 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function RagConfigPanel(props) {
  const { base, globalConfig, api, t, busy, onSaved } = props;
  const [values, setValues] = (0, import_react4.useState)(() => ({
    ...globalConfig,
    ...base.config ?? {}
  }));
  const [advancedOpen, setAdvancedOpen] = (0, import_react4.useState)(false);
  const [localStatus, setLocalStatus] = (0, import_react4.useState)(null);
  const [suggestions, setSuggestions] = (0, import_react4.useState)({ embedding: [], local: [], rerank: [], ollamaEmbedding: [], ollamaVision: [] });
  const [readyLocalEmbeddings, setReadyLocalEmbeddings] = (0, import_react4.useState)([]);
  const [readyLocalRerankers, setReadyLocalRerankers] = (0, import_react4.useState)([]);
  const [ollamaEmbeddingModels, setOllamaEmbeddingModels] = (0, import_react4.useState)([]);
  const [ollamaCaptionModels, setOllamaCaptionModels] = (0, import_react4.useState)([]);
  const [ollamaEmbeddingUnreachable, setOllamaEmbeddingUnreachable] = (0, import_react4.useState)(false);
  const [ollamaCaptionUnreachable, setOllamaCaptionUnreachable] = (0, import_react4.useState)(false);
  const [saveError, setSaveError] = (0, import_react4.useState)(null);
  const [probing, setProbing] = (0, import_react4.useState)(false);
  const [processorChecking, setProcessorChecking] = (0, import_react4.useState)(false);
  const [processorCheckResult, setProcessorCheckResult] = (0, import_react4.useState)(null);
  const [processorCheckError, setProcessorCheckError] = (0, import_react4.useState)(false);
  (0, import_react4.useEffect)(() => {
    let cancelled = false;
    void api.getModelSuggestions().then((result) => {
      if (!cancelled) setSuggestions(result);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [api]);
  (0, import_react4.useEffect)(() => {
    let cancelled = false;
    void api.listLocalModels().then((list) => {
      if (cancelled) return;
      const ready = list.filter((m) => m.status === "ready").map((m) => ({ id: m.id, kind: m.kind }));
      setReadyLocalEmbeddings(ready.filter((m) => m.kind === "embedding").map((m) => m.id));
      setReadyLocalRerankers(ready.filter((m) => m.kind === "reranking").map((m) => m.id));
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [api]);
  const ollamaBaseFor = (base2) => base2.trim() === "" ? "http://127.0.0.1:11434" : base2.trim();
  const autoFixOllamaTag = (kind, current, installed) => {
    const model = current.trim();
    if (model === "" || installed.includes(model)) return;
    const siblings = installed.filter((name) => name === `${model}:latest` || name.startsWith(`${model}:`));
    if (siblings.length === 1) {
      patch(kind === "embedding" ? { embeddingModel: siblings[0] } : { imageCaptionModel: siblings[0] });
    }
  };
  (0, import_react4.useEffect)(() => {
    let cancelled = false;
    const base2 = ollamaBaseFor(values.embeddingBaseUrl);
    void api.listOllamaModels(base2).then(({ models }) => {
      if (cancelled) return;
      const names = models.map((m) => m.name);
      setOllamaEmbeddingModels(names);
      setOllamaEmbeddingUnreachable(false);
      autoFixOllamaTag("embedding", values.embeddingModel, names);
    }).catch(() => {
      if (cancelled) return;
      setOllamaEmbeddingModels([]);
      setOllamaEmbeddingUnreachable(true);
    });
    return () => {
      cancelled = true;
    };
  }, [api, values.embeddingBaseUrl]);
  (0, import_react4.useEffect)(() => {
    let cancelled = false;
    const base2 = ollamaBaseFor(values.imageCaptionBaseUrl);
    void api.listOllamaModels(base2).then(({ models }) => {
      if (cancelled) return;
      const names = models.map((m) => m.name);
      setOllamaCaptionModels(names);
      setOllamaCaptionUnreachable(false);
      autoFixOllamaTag("caption", values.imageCaptionModel, names);
    }).catch(() => {
      if (cancelled) return;
      setOllamaCaptionModels([]);
      setOllamaCaptionUnreachable(true);
    });
    return () => {
      cancelled = true;
    };
  }, [api, values.imageCaptionBaseUrl]);
  const listId = (kind) => `kb-${kind}-models-${base.id}`;
  (0, import_react4.useEffect)(() => {
    if (values.embeddingProvider !== "local") {
      setLocalStatus(null);
      return;
    }
    let cancelled = false;
    const model = values.embeddingModel.trim() === "" ? "onnx-community/Qwen3-Embedding-0.6B-ONNX" : values.embeddingModel.trim();
    const poll = async () => {
      try {
        const status = await api.getLocalModelStatus(model);
        if (!cancelled) setLocalStatus(status);
      } catch {
      }
    };
    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 800);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [api, values.embeddingProvider, values.embeddingModel]);
  const initial = (0, import_react4.useMemo)(() => ({
    ...globalConfig,
    ...base.config ?? {}
  }), [globalConfig, base.config]);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const processorDirty = ["documentProcessorProvider", "mineruLocalUrl", "mineruLocalApiKey", "mineruTier"].some((key) => values[key] !== initial[key]);
  const checkProcessor = async () => {
    setProcessorChecking(true);
    setProcessorCheckResult(null);
    try {
      const result = await api.checkProcessor(base.id);
      setProcessorCheckError(false);
      setProcessorCheckResult(`${t("processorCheckSuccess")} \xB7 MinerU ${result.version} \xB7 ${result.tiers.join(", ")}`);
    } catch (error) {
      setProcessorCheckError(true);
      setProcessorCheckResult(error instanceof Error ? error.message : String(error));
    } finally {
      setProcessorChecking(false);
    }
  };
  const embeddingChanged = values.embeddingProvider !== initial.embeddingProvider || values.embeddingModel !== initial.embeddingModel;
  const hadModel = initial.embeddingProvider !== "none" && (initial.embeddingModel ?? "").trim() !== "";
  const needsRebuild = embeddingChanged && hadModel && (base.documentCount ?? 0) > 0;
  const patch = (p) => setValues((prev) => ({ ...prev, ...p }));
  const NUMBER_RANGES = {
    chunkSize: { min: 1, int: true },
    chunkOverlap: { min: 0, int: true },
    topK: { min: 1, int: true },
    embeddingBatchSize: { min: 1, int: true },
    siblingChunks: { min: 0, max: 3, int: true },
    chunkTokenLimit: { min: 0, int: true },
    urlRefreshHours: { min: 0, int: true },
    autoRetrieveWeight: { min: 0, max: 5, int: true },
    similarityThreshold: { min: 0, max: 1 },
    mmrDiversity: { min: 0, max: 1 },
    rrfVectorWeight: { min: 0.1, max: 5 },
    semanticChunkThreshold: { min: 0, max: 1 },
    localRerankTimeoutMs: { min: 1e4, max: 3e5, int: true },
    documentProcessingTimeoutMs: { min: 1e4, max: 72e5, int: true },
    localWorkerIdleTimeoutMs: { min: 0, int: true }
  };
  const patchNumber = (key, raw) => {
    if (raw.trim() === "") return;
    let n = Number(raw);
    if (!Number.isFinite(n)) return;
    const range = NUMBER_RANGES[key];
    if (range !== void 0) {
      if (range.int === true) n = Math.trunc(n);
      if (n < range.min) n = range.min;
      if (range.max !== void 0 && n > range.max) n = range.max;
    }
    patch({ [key]: n });
  };
  const save = async () => {
    setSaveError(null);
    const embeddingChangedNow = values.embeddingProvider !== initial.embeddingProvider || values.embeddingModel !== initial.embeddingModel;
    if (embeddingChangedNow && values.embeddingProvider !== "none") {
      setProbing(true);
      try {
        const dimensions = await api.probeEmbeddingDimensions({
          provider: values.embeddingProvider,
          baseUrl: values.embeddingBaseUrl,
          model: values.embeddingModel,
          apiKey: values.embeddingApiKey ?? ""
        });
        if (!Number.isFinite(dimensions) || dimensions <= 0) {
          throw new Error("embedding returned an invalid dimension");
        }
      } catch (err) {
        setProbing(false);
        setSaveError(`${t("dimensionProbeFailed")}: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
      setProbing(false);
    }
    const overrides = {};
    const current = base.config ?? {};
    for (const key of Object.keys(values)) {
      const value = values[key];
      const wasOverridden = current[key] !== void 0;
      if (value !== globalConfig[key] || wasOverridden) {
        ;
        overrides[key] = value === globalConfig[key] && typeof value === "string" ? "" : value;
      }
    }
    try {
      await api.updateBase(base.id, { config: overrides });
      onSaved();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };
  const usesThreshold = values.rerankModel.trim() !== "";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { ...style.card, flex: 1, overflowY: "auto" }, className: "kb-scroll kb-rag-config", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Section, { title: t("docProcessing"), hint: t("docProcessingHint"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "select",
          {
            style: style.input,
            value: values.documentProcessorProvider,
            "aria-label": t("docProcessing"),
            onChange: (e) => {
              patch({ documentProcessorProvider: e.target.value });
              setProcessorCheckResult(null);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "builtin", children: t("processorBuiltin") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "mineru-local", children: t("mineruLocalOption") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "mineru", children: t("mineruOption") })
            ]
          }
        ),
        values.documentProcessorProvider === "mineru" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: style.input,
              type: "password",
              placeholder: "MinerU API Key",
              value: values.mineruApiKey,
              onChange: (e) => patch({ mineruApiKey: e.target.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: style.input,
              placeholder: t("mineruHostPlaceholder"),
              value: values.mineruApiHost,
              onChange: (e) => patch({ mineruApiHost: e.target.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 13, color: C.muted, lineHeight: 1.6 }, children: t("processorMineruDesc") })
        ] }),
        values.documentProcessorProvider === "mineru-local" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { style: { display: "block", fontSize: 13, lineHeight: 1.5 }, children: [
            t("mineruLocalUrl"),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: { ...style.input, marginTop: 6 }, value: values.mineruLocalUrl ?? "http://127.0.0.1:8000", onChange: (e) => patch({ mineruLocalUrl: e.target.value }), spellCheck: false })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { style: { display: "block", fontSize: 13, lineHeight: 1.5 }, children: [
            t("mineruLocalKey"),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: { ...style.input, marginTop: 6 }, type: "password", autoComplete: "new-password", value: values.mineruLocalApiKey ?? "", onChange: (e) => patch({ mineruLocalApiKey: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { style: { display: "block", fontSize: 13, lineHeight: 1.5 }, children: [
            t("mineruTier"),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { style: { ...style.input, marginTop: 6 }, value: values.mineruTier ?? "basic", onChange: (e) => patch({ mineruTier: e.target.value }), children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "flash", children: t("mineruFlash") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "basic", children: t("mineruBasic") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "standard", children: t("mineruStandard") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "advanced", children: t("mineruAdvanced") })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { fontSize: 13, color: C.muted, lineHeight: 1.6 }, children: [
            t("mineruLocalDesc"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("a", { href: "https://github.com/opendatalab/MinerU/blob/mineru-4.0.6-released/LICENSE.md", target: "_blank", rel: "noreferrer", children: "MinerU license" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", style: style.button, disabled: busy || processorChecking || processorDirty, onClick: () => void checkProcessor(), children: t(processorChecking ? "processorChecking" : "processorCheck") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 13, color: C.muted }, children: t("processorCheckSaved") }),
          !processorDirty && processorCheckResult !== null && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { role: "status", style: { fontSize: 12, color: processorCheckError ? C.danger : C.success }, children: processorCheckResult })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("processingTimeout"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "number", style: style.input, min: 1e4, max: 72e5, step: 1e3, value: values.documentProcessingTimeoutMs ?? 18e5, onChange: (e) => patchNumber("documentProcessingTimeoutMs", e.target.value) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("structuredChunking"), hint: t("structuredChunkingHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Switch, { checked: values.structuredChunking ?? true, onChange: (v) => patch({ structuredChunking: v }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 13, color: C.muted, lineHeight: 1.6 }, children: t("imageCaptionHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "select",
            {
              style: style.input,
              value: values.imageCaptionProvider,
              onChange: (e) => {
                const provider = e.target.value;
                if (provider === "ollama") {
                  const next = ollamaCaptionModels.includes(values.imageCaptionModel) ? values.imageCaptionModel : ollamaCaptionModels[0] ?? "";
                  patch({ imageCaptionProvider: provider, imageCaptionModel: next });
                } else {
                  patch({ imageCaptionProvider: provider });
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "off", children: t("imageCaptionOff") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "openai", children: t("imageCaptionOpenAI") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "ollama", children: t("imageCaptionOllama") })
              ]
            }
          ),
          values.imageCaptionProvider !== "off" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
            values.imageCaptionProvider === "ollama" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
              "select",
              {
                style: style.input,
                value: ollamaCaptionModels.includes(values.imageCaptionModel) ? values.imageCaptionModel : "",
                onChange: (e) => {
                  if (e.target.value !== "") patch({ imageCaptionModel: e.target.value });
                },
                children: [
                  ollamaCaptionModels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: ollamaCaptionUnreachable ? t("ollamaUnreachable") : t("noOllamaModels") }),
                  !ollamaCaptionModels.includes(values.imageCaptionModel) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: values.imageCaptionModel.trim() !== "" ? `${values.imageCaptionModel}${t("staleModelSuffix")}` : t("selectModelPlaceholder") }),
                  ollamaCaptionModels.map((name) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: name, children: name }, name))
                ]
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                style: style.input,
                placeholder: t("visionModelPlaceholder"),
                value: values.imageCaptionModel,
                onChange: (e) => patch({ imageCaptionModel: e.target.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                style: style.input,
                placeholder: values.imageCaptionProvider === "ollama" ? t("captionBaseUrlOllamaPlaceholder") : t("captionBaseUrlPlaceholder"),
                value: values.imageCaptionBaseUrl,
                onChange: (e) => patch({ imageCaptionBaseUrl: e.target.value })
              }
            ),
            values.imageCaptionProvider === "openai" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                style: style.input,
                type: "password",
                placeholder: "API Key",
                value: values.imageCaptionApiKey,
                onChange: (e) => patch({ imageCaptionApiKey: e.target.value })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Section, { title: t("embeddingProvider"), hint: t("perBaseHint"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "select",
          {
            style: style.input,
            value: values.embeddingProvider,
            onChange: (e) => {
              const provider = e.target.value;
              if (provider === "local") {
                const next = readyLocalEmbeddings.includes(values.embeddingModel) ? values.embeddingModel : readyLocalEmbeddings[0] ?? "";
                patch({ embeddingProvider: provider, embeddingModel: next });
              } else if (provider === "ollama") {
                const next = ollamaEmbeddingModels.includes(values.embeddingModel) ? values.embeddingModel : ollamaEmbeddingModels[0] ?? "";
                const nextBase = values.embeddingBaseUrl.trim() === "" ? "http://127.0.0.1:11434" : values.embeddingBaseUrl;
                patch({ embeddingProvider: provider, embeddingModel: next, embeddingBaseUrl: nextBase });
              } else {
                patch({ embeddingProvider: provider });
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "none", children: t("providerNone") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "openai", children: t("providerOpenAI") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "ollama", children: t("providerOllama") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "local", children: t("providerLocal") })
            ]
          }
        ),
        values.embeddingProvider === "local" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("embeddingModel") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "select",
            {
              style: style.input,
              value: readyLocalEmbeddings.includes(values.embeddingModel) ? values.embeddingModel : "",
              onChange: (e) => {
                if (e.target.value !== "") patch({ embeddingModel: e.target.value });
              },
              children: [
                readyLocalEmbeddings.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: t("noLocalModelsReady") }),
                !readyLocalEmbeddings.includes(values.embeddingModel) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: values.embeddingModel.trim() !== "" ? `${values.embeddingModel}${t("staleModelSuffix")}` : t("selectModelPlaceholder") }),
                readyLocalEmbeddings.map((id) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: id, children: id }, id))
              ]
            }
          ),
          localStatus !== null && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12 }, children: [
            localStatus.status === "downloading" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "kb-spinner", style: style.spinner }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { color: C.accent }, children: [
                t("localModelDownloading"),
                " ",
                Math.floor(localStatus.progress),
                "%"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { flex: 1, height: 4, borderRadius: 2, background: C.surface2 }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { width: `${localStatus.progress}%`, height: 4, borderRadius: 2, background: C.accent } }) })
            ] }),
            localStatus.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { color: C.success }, children: [
              "\u2713 ",
              t("localModelReady")
            ] }),
            localStatus.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { color: C.danger }, title: localStatus.message, children: [
              "\u2715 ",
              t("localModelError")
            ] }),
            localStatus.status === "idle" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { color: C.muted }, children: t("localModelHint") })
          ] })
        ] }),
        values.embeddingProvider === "ollama" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: "1 1 220px", minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("embeddingModel") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
              "select",
              {
                style: style.input,
                value: ollamaEmbeddingModels.includes(values.embeddingModel) ? values.embeddingModel : "",
                onChange: (e) => {
                  if (e.target.value !== "") patch({ embeddingModel: e.target.value });
                },
                children: [
                  ollamaEmbeddingModels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: ollamaEmbeddingUnreachable ? t("ollamaUnreachable") : t("noOllamaModels") }),
                  !ollamaEmbeddingModels.includes(values.embeddingModel) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: values.embeddingModel.trim() !== "" ? `${values.embeddingModel}${t("staleModelSuffix")}` : t("selectModelPlaceholder") }),
                  ollamaEmbeddingModels.map((name) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: name, children: name }, name))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: "1 1 220px", minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("embeddingBaseUrl") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: style.input, value: values.embeddingBaseUrl, onChange: (e) => patch({ embeddingBaseUrl: e.target.value }) })
          ] })
        ] }),
        values.embeddingProvider === "openai" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: "1 1 220px", minWidth: 0 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("embeddingModel") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "input",
                {
                  list: listId("embedding"),
                  style: style.input,
                  value: values.embeddingModel,
                  onChange: (e) => patch({ embeddingModel: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: "1 1 220px", minWidth: 0 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("embeddingBaseUrl") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: style.input, value: values.embeddingBaseUrl, onChange: (e) => patch({ embeddingBaseUrl: e.target.value }) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: 10 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("embeddingApiKey") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                style: style.input,
                value: values.embeddingApiKey ?? "",
                onChange: (e) => patch({ embeddingApiKey: e.target.value })
              }
            )
          ] })
        ] }),
        needsRebuild && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { marginTop: 10 }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: style.warningHint, children: t("embeddingSwitchWarning") }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Section, { title: t("rerankModel"), hint: t("rerankHint"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: "1 1 220px", minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("modelLabel") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                list: listId("rerank"),
                style: style.input,
                value: values.rerankModel,
                onChange: (e) => patch({ rerankModel: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: "1 1 220px", minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("rerankBaseUrl") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: style.input, value: values.rerankBaseUrl, onChange: (e) => patch({ rerankBaseUrl: e.target.value }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("rerankApiKey") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: style.input,
              value: values.rerankApiKey ?? "",
              onChange: (e) => patch({ rerankApiKey: e.target.value })
            }
          )
        ] }),
        values.rerankModel.startsWith("local:") && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { style: style.label, children: t("localRerankTimeoutMs") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: style.input,
              type: "number",
              min: 1e4,
              max: 3e5,
              step: 5e3,
              value: values.localRerankTimeoutMs,
              onChange: (e) => patchNumber("localRerankTimeoutMs", e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: style.hint, children: t("localRerankTimeoutHint") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { "aria-label": t("retrievalTuning"), style: { marginBottom: 20, padding: "18px 18px 4px", border: `1px solid ${C.border}`, borderRadius: 14, background: C.surface2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { style: { fontSize: 15, fontWeight: 600, margin: "0 0 18px", color: C.text }, children: t("retrievalTuning") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Section, { title: t("topK"), hint: t("topKHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Slider,
          {
            value: values.topK,
            min: 1,
            max: 50,
            step: 1,
            onChange: (v) => patch({ topK: v }),
            minLabel: "1",
            maxLabel: "50",
            format: (v) => String(v)
          }
        ) }),
        usesThreshold && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Section, { title: t("threshold"), hint: t("thresholdHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Slider,
          {
            value: values.similarityThreshold,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => patch({ similarityThreshold: v }),
            minLabel: "0.00",
            maxLabel: "1.00",
            format: (v) => v.toFixed(2)
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Section, { title: t("siblingChunks"), hint: t("siblingChunksHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Slider,
          {
            value: values.siblingChunks,
            min: 0,
            max: 3,
            step: 1,
            onChange: (v) => patch({ siblingChunks: v }),
            minLabel: "0",
            maxLabel: "3",
            format: (v) => String(v)
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { borderTop: `1px solid ${C.border}`, paddingTop: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { style: style.accordionHeader, onClick: () => setAdvancedOpen((v) => !v), children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: t("advancedSettings") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { color: C.muted, fontSize: 12 }, children: advancedOpen ? "\u25BE" : "\u25B8" })
        ] }),
        advancedOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("smartChunk"), hint: t("smartChunkHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Switch, { checked: values.smartChunk, onChange: (v) => patch({ smartChunk: v }) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("semanticChunk"), hint: t("semanticChunkHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Switch, { checked: values.semanticChunk, onChange: (v) => patch({ semanticChunk: v }) }) }),
          values.semanticChunk && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("semanticChunkThreshold"), hint: t("semanticChunkThresholdHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              min: 0,
              max: 1,
              step: 0.05,
              value: values.semanticChunkThreshold,
              onChange: (e) => patchNumber("semanticChunkThreshold", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("chunkTokenLimit"), hint: t("chunkTokenLimitHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              min: 0,
              value: values.chunkTokenLimit,
              onChange: (e) => patchNumber("chunkTokenLimit", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("conflictStrategy"), hint: t("conflictStrategyHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "select",
            {
              style: { ...style.input, width: 140 },
              value: values.conflictStrategy,
              onChange: (e) => patch({ conflictStrategy: e.target.value }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "rename", children: t("conflictRename") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "replace", children: t("conflictReplace") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "keep", children: t("conflictKeep") })
              ]
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("urlRefreshHours"), hint: t("urlRefreshHoursHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              min: 0,
              value: values.urlRefreshHours,
              onChange: (e) => patchNumber("urlRefreshHours", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("resumeInterrupted"), hint: t("resumeInterruptedHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "checkbox",
              checked: values.resumeInterruptedOnStartup,
              onChange: (e) => patch({ resumeInterruptedOnStartup: e.target.checked })
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("autoRetrieve"), hint: t("autoRetrieveHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "checkbox",
              checked: values.autoRetrieve,
              onChange: (e) => patch({ autoRetrieve: e.target.checked })
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("autoRetrieveWeight"), hint: t("autoRetrieveWeightHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              min: 0,
              max: 5,
              value: values.autoRetrieveWeight,
              onChange: (e) => patchNumber("autoRetrieveWeight", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("injectUsagePrompt"), hint: t("injectUsagePromptHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "checkbox",
              "aria-label": t("injectUsagePrompt"),
              checked: values.injectUsagePrompt !== false,
              onChange: (e) => patch({ injectUsagePrompt: e.target.checked })
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("chunkSeparator"), hint: t("chunkSeparatorHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 140 },
              value: values.chunkSeparator,
              onChange: (e) => patch({ chunkSeparator: e.target.value })
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("chunkSize"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              value: values.chunkSize,
              onChange: (e) => patchNumber("chunkSize", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("chunkOverlap"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              value: values.chunkOverlap,
              onChange: (e) => patchNumber("chunkOverlap", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FieldRow, { label: t("rrfVectorWeight"), hint: t("rrfVectorWeightHint"), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              style: { ...style.input, width: 100 },
              type: "number",
              step: "0.1",
              min: "0.1",
              max: "5",
              value: values.rrfVectorWeight,
              onChange: (e) => patchNumber("rrfVectorWeight", e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: style.warningHint, children: t("chunkChangeWarning") })
        ] })
      ] })
    ] }),
    saveError !== null && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { ...style.error, marginBottom: 8 }, children: saveError }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        "button",
        {
          style: { ...style.ghostButton, opacity: dirty ? 1 : 0.45 },
          disabled: !dirty || busy,
          onClick: () => setValues(initial),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(IconRefresh, { size: 13 }),
            t("reset")
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "kb-primary", style: style.primary, disabled: !dirty || busy || probing, onClick: () => void save(), children: probing ? t("dimensionProbing") : t("save") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("datalist", { id: listId("embedding"), children: (values.embeddingProvider === "ollama" ? [...suggestions.ollamaEmbedding, ...suggestions.embedding] : suggestions.embedding).map((model) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: model }, model)) }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("datalist", { id: listId("local"), children: suggestions.local.map((model) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: model }, model)) }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("datalist", { id: listId("rerank"), children: [...readyLocalRerankers.map((id) => `local:${id}`), ...suggestions.rerank].map((model) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: model }, model)) })
  ] });
}
function Section(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginBottom: 24 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: { ...style.sectionTitle, fontSize: 15, margin: "0 0 5px", lineHeight: 1.45 }, children: props.title }),
    props.hint !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: { ...style.sectionHint, fontSize: 13, margin: "0 0 14px", lineHeight: 1.65, maxWidth: 680 }, children: props.hint }),
    props.children
  ] });
}
function FieldRow(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "kb-rag-config-field", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { minWidth: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 14, fontWeight: 600, lineHeight: 1.45 }, children: props.label }),
      props.hint !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.55 }, children: props.hint })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "kb-rag-config-control", children: props.children })
  ] });
}
function Switch(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "button",
    {
      style: { ...style.switch, ...props.checked ? style.switchOn : {} },
      role: "switch",
      "aria-checked": props.checked,
      onClick: () => props.onChange(!props.checked),
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { ...style.switchKnob, transform: props.checked ? "translateX(16px)" : "none" } })
    }
  );
}
function Slider(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: style.sliderRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", {}),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: style.sliderValue, children: props.format(props.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "input",
      {
        type: "range",
        min: props.min,
        max: props.max,
        step: props.step,
        value: props.value,
        onChange: (e) => props.onChange(Number(e.target.value)),
        style: { width: "100%", accentColor: C.accent }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: style.sliderBounds, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: props.minLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: props.maxLabel })
    ] })
  ] });
}

// src/ui/client/KnowledgeSection.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
if (typeof document !== "undefined" && document.getElementById("kb-panel-styles") === null) {
  const el = document.createElement("style");
  el.id = "kb-panel-styles";
  el.textContent = PANEL_CSS;
  document.head.appendChild(el);
}
var PREVIEW_RAW_TEXT_LIMIT = 2e5;
var PREVIEW_CHUNK_LIMIT = 500;
var PDF_PREVIEW_MAX_BYTES = 100 * 1024 * 1024;
function SidebarKnowledgeAction(props) {
  const open = (0, import_react5.useSyncExternalStore)(props.store.subscribe, props.store.getSnapshot);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "button",
    {
      className: "kb-sidebar-action",
      style: {
        ...style.sidebarAction,
        ...props.wide ? {} : style.sidebarActionRail,
        ...open ? style.sidebarActionActive : {}
      },
      onClick: () => props.store.toggle(),
      title: props.t("nav"),
      "aria-label": props.t("nav"),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconBook, { size: props.wide ? 16 : 18 }),
        props.wide ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: props.t("nav") }) : null
      ]
    }
  );
}
function KnowledgePanel(props) {
  const open = (0, import_react5.useSyncExternalStore)(props.store.subscribe, props.store.getSnapshot);
  if (!open) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    PanelBody,
    {
      api: props.api,
      t: props.t,
      onClose: () => props.store.close(),
      workspaces: props.workspaces,
      sessions: props.sessions
    }
  );
}
function PanelBody(props) {
  const titlebarInset = (0, import_react5.useSyncExternalStore)(subscribeTitlebarInset, getTitlebarInset, () => 0);
  const { api, t, onClose } = props;
  const [bases, setBases] = (0, import_react5.useState)([]);
  const [groups, setGroups] = (0, import_react5.useState)([]);
  const [collapsedGroups, setCollapsedGroups] = (0, import_react5.useState)([]);
  const [filter, setFilter] = (0, import_react5.useState)("");
  const [selectedBaseId, setSelectedBaseId] = (0, import_react5.useState)(null);
  const [ragOpen, setRagOpen] = (0, import_react5.useState)(false);
  const [recallOpen, setRecallOpen] = (0, import_react5.useState)(false);
  const [documents, setDocuments] = (0, import_react5.useState)([]);
  const [chunks, setChunks] = (0, import_react5.useState)([]);
  const [rawText, setRawText] = (0, import_react5.useState)(null);
  const [rawTextTruncated, setRawTextTruncated] = (0, import_react5.useState)(false);
  const [selectedDocId, setSelectedDocId] = (0, import_react5.useState)(null);
  const [currentDirectoryId, setCurrentDirectoryId] = (0, import_react5.useState)(null);
  const [detailMode, setDetailMode] = (0, import_react5.useState)("preview");
  const [checkedDocIds, setCheckedDocIds] = (0, import_react5.useState)(/* @__PURE__ */ new Set());
  const [globalConfig, setGlobalConfig] = (0, import_react5.useState)(null);
  const [toggle, setToggle] = (0, import_react5.useState)(null);
  const [registryWorkspaces, setRegistryWorkspaces] = (0, import_react5.useState)([]);
  const [currentPath, setCurrentPath] = (0, import_react5.useState)(null);
  const [stats, setStats] = (0, import_react5.useState)(null);
  const [searchQuery, setSearchQuery] = (0, import_react5.useState)("");
  const [hits, setHits] = (0, import_react5.useState)([]);
  const [searchMeta, setSearchMeta] = (0, import_react5.useState)(null);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [toasts, setToasts] = (0, import_react5.useState)([]);
  const [dialog, setDialog] = (0, import_react5.useState)(null);
  const [recallHistory, setRecallHistory] = (0, import_react5.useState)([]);
  const [contextMenu, setContextMenu] = (0, import_react5.useState)(null);
  const [optimisticProcessing, setOptimisticProcessing] = (0, import_react5.useState)(/* @__PURE__ */ new Set());
  const [localEmbeddingDownloaded, setLocalEmbeddingDownloaded] = (0, import_react5.useState)(null);
  const [localModelStatus, setLocalModelStatus] = (0, import_react5.useState)(null);
  const [docLimit, setDocLimit] = (0, import_react5.useState)(100);
  const [navWidth, setNavWidth] = (0, import_react5.useState)(272);
  const [sidePanelWidth, setSidePanelWidth] = (0, import_react5.useState)(460);
  const [dragOver, setDragOver] = (0, import_react5.useState)(false);
  const dragDepth = (0, import_react5.useRef)(0);
  const fileInputRef = (0, import_react5.useRef)(null);
  const dirInputRef = (0, import_react5.useRef)(null);
  const [, setNowTick] = (0, import_react5.useState)(0);
  (0, import_react5.useEffect)(() => {
    const timer = window.setInterval(() => setNowTick((t2) => t2 + 1), 6e4);
    return () => window.clearInterval(timer);
  }, []);
  const notify = (0, import_react5.useCallback)((kind, text) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, text }]);
    if (kind === "error" || kind === "warning") return;
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);
  const dismissToast = (0, import_react5.useCallback)((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  const run = (0, import_react5.useCallback)(async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [notify]);
  const refreshBases = (0, import_react5.useCallback)(async () => {
    const [nextBases, nextConfig, nextGroups, nextToggle] = await Promise.all([
      api.listBases(),
      api.getConfig(),
      api.listGroups(),
      api.getKnowledgeToggle()
    ]);
    setBases(nextBases);
    setGlobalConfig(nextConfig);
    setGroups(nextGroups);
    setToggle(nextToggle);
  }, [api]);
  (0, import_react5.useEffect)(() => {
    void run(refreshBases);
  }, [run, refreshBases]);
  (0, import_react5.useEffect)(() => {
    const read = () => {
      const snapshot = props.sessions?.list?.getSnapshot?.();
      const rows = Object.values(snapshot?.byId ?? {});
      const current = rows.find((row) => (row.retainedBy?.mainView ?? 0) > 0);
      if (typeof current?.cwd === "string" && current.cwd.length > 0) setCurrentPath(current.cwd);
    };
    const items = props.workspaces?.list?.getSnapshot?.()?.items ?? [];
    setRegistryWorkspaces(items.filter((item) => typeof item.path === "string" && item.path.length > 0).map((item) => ({ path: item.path, title: item.title ?? item.path })));
    read();
    let unsubscribe;
    try {
      const subscribe = props.workspaces?.list?.subscribe;
      unsubscribe = subscribe?.call(props.workspaces?.list, read);
    } catch {
      unsubscribe = void 0;
    }
    return unsubscribe;
  }, [props.workspaces, props.sessions]);
  const updateToggle = (0, import_react5.useCallback)(async (patch) => {
    const next = await api.setKnowledgeToggle(patch);
    setToggle(next);
    notify("success", t("save"));
  }, [api, notify, t]);
  const onNavResizeStart = (0, import_react5.useCallback)((event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = navWidth;
    const onMove = (ev) => {
      setNavWidth(Math.min(360, Math.max(220, startWidth + (ev.clientX - startX))));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [navWidth]);
  const onSideResizeStart = (0, import_react5.useCallback)((event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidePanelWidth;
    const onMove = (ev) => {
      setSidePanelWidth(Math.min(680, Math.max(360, startWidth - (ev.clientX - startX))));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [sidePanelWidth]);
  (0, import_react5.useEffect)(() => {
    let cancelled = false;
    void api.listLocalModels().then((list) => {
      if (!cancelled) setLocalEmbeddingDownloaded(list.some((m) => m.kind === "embedding" && m.status === "ready"));
    }).catch(() => {
      if (!cancelled) setLocalEmbeddingDownloaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [api]);
  const refreshStats = (0, import_react5.useCallback)(async (baseId) => {
    setStats(await api.stats(baseId ?? void 0));
  }, [api]);
  const navSeq = (0, import_react5.useRef)(0);
  const selectBase = (0, import_react5.useCallback)(async (id) => {
    const seq = ++navSeq.current;
    setSelectedBaseId(id);
    setSelectedDocId(null);
    setCurrentDirectoryId(null);
    setCheckedDocIds(/* @__PURE__ */ new Set());
    setChunks([]);
    setRawText(null);
    setRawTextTruncated(false);
    setHits([]);
    setSearchMeta(null);
    setRagOpen(false);
    setRecallOpen(false);
    setDocLimit(100);
    await run(async () => {
      const [docs, stats2] = await Promise.all([api.listDocuments(id), api.stats(id)]);
      if (seq !== navSeq.current) return;
      setDocuments(docs);
      setStats(stats2);
    });
  }, [api, run]);
  const openDocument = (0, import_react5.useCallback)(async (id, mode) => {
    const seq = ++navSeq.current;
    setSelectedDocId(id);
    setDetailMode(mode);
    setChunks([]);
    setRawText(null);
    setRawTextTruncated(false);
    const known = documents.find((doc) => doc.id === id);
    const pdfPreview = known?.sourceType === "file" && (known.fileName ?? "").toLowerCase().endsWith(".pdf");
    await run(async () => {
      const [doc, chunkList] = await Promise.all([
        api.getDocument(id, { rawTextLimit: pdfPreview ? 0 : PREVIEW_RAW_TEXT_LIMIT }),
        api.listChunks(id, PREVIEW_CHUNK_LIMIT)
      ]);
      if (seq !== navSeq.current) return;
      setChunks(chunkList);
      setRawText(doc.rawText ?? null);
      setRawTextTruncated(doc.rawTextTruncated === true);
      if (doc.processing !== void 0) setDocuments((current) => current.map((row) => row.id === id ? { ...row, processing: doc.processing } : row));
    });
  }, [api, run, documents]);
  const loadMoreChunks = (0, import_react5.useCallback)(async () => {
    if (selectedDocId === null) return;
    const seq = navSeq.current;
    await run(async () => {
      const more = await api.listChunks(selectedDocId, chunks.length + PREVIEW_CHUNK_LIMIT);
      if (seq !== navSeq.current) return;
      setChunks(more);
    });
  }, [api, run, selectedDocId, chunks.length]);
  const drillIntoDirectory = (0, import_react5.useCallback)((directoryId) => {
    setSelectedDocId(null);
    setCurrentDirectoryId(directoryId);
    setCheckedDocIds(/* @__PURE__ */ new Set());
    setDocLimit(100);
  }, []);
  const navigateUp = (0, import_react5.useCallback)(() => {
    const current = currentDirectoryId !== null ? documents.find((doc) => doc.id === currentDirectoryId) : void 0;
    setCurrentDirectoryId(current?.parentDirectoryId ?? null);
    setCheckedDocIds(/* @__PURE__ */ new Set());
    setDocLimit(100);
  }, [currentDirectoryId, documents]);
  const reloadDocuments = (0, import_react5.useCallback)(async () => {
    if (selectedBaseId === null) return;
    const next = await api.listDocuments(selectedBaseId);
    setDocuments(next);
    await refreshStats(selectedBaseId);
    await refreshBases();
    if (next.some((doc) => doc.status === "processing")) setPollKick((kick) => kick + 1);
  }, [api, refreshBases, refreshStats, selectedBaseId]);
  const [pollKick, setPollKick] = (0, import_react5.useState)(0);
  (0, import_react5.useEffect)(() => {
    if (selectedBaseId === null) return;
    let disposed = false;
    let timer;
    const activeIdsRef = { current: /* @__PURE__ */ new Set() };
    const poll = async () => {
      let anyActive = false;
      try {
        const entries = await api.getIndexingStatus();
        const activeIds = /* @__PURE__ */ new Set();
        for (const entry of entries) {
          if (entry.baseId === selectedBaseId) activeIds.add(entry.docId);
        }
        anyActive = activeIds.size > 0;
        const changed = !sameSet(activeIdsRef.current, activeIds);
        activeIdsRef.current = activeIds;
        if (!disposed) {
          const byId = new Map(entries.filter((entry) => entry.baseId === selectedBaseId).map((entry) => [entry.docId, entry]));
          setDocuments((current) => current.map((doc) => {
            const entry = byId.get(doc.id);
            return entry === void 0 ? doc : { ...doc, indexingPhase: entry.phase, indexingProgress: entry.progress, processingProgress: entry.processingProgress };
          }));
        }
        if (!disposed && changed) void reloadDocuments();
      } catch {
      }
      if (!disposed && anyActive) {
        timer = window.setTimeout(() => {
          void poll();
        }, 800);
      }
    };
    void poll();
    return () => {
      disposed = true;
      if (timer !== void 0) window.clearTimeout(timer);
    };
  }, [api, selectedBaseId, reloadDocuments, pollKick]);
  const createBase = (0, import_react5.useCallback)(async (name, description, group) => {
    await run(async () => {
      const created = await api.createBase(name, description, group ?? "");
      notify("success", `${t("newBase")}: ${name}`);
      setDialog(null);
      await refreshBases();
      await selectBase(created.id);
    });
  }, [api, run, refreshBases, selectBase, notify, t]);
  const renameBase = (0, import_react5.useCallback)(async (base, name) => {
    await run(async () => {
      await api.updateBase(base.id, { name, description: base.description });
      notify("success", t("save"));
      setDialog(null);
      await refreshBases();
    });
  }, [api, run, refreshBases, notify, t]);
  const createGroup = (0, import_react5.useCallback)(async (name, forBaseId) => {
    await run(async () => {
      const next = await api.createGroup(name);
      setGroups(next);
      if (forBaseId !== void 0) await api.updateBase(forBaseId, { group: name });
      notify("success", `${t("newGroup")}: ${name}`);
      setDialog(null);
      await refreshBases();
    });
  }, [api, run, refreshBases, notify, t]);
  const renameGroup = (0, import_react5.useCallback)(async (from, to) => {
    await run(async () => {
      setGroups(await api.renameGroup(from, to));
      notify("success", t("save"));
      setDialog(null);
      await refreshBases();
    });
  }, [api, run, refreshBases, notify, t]);
  const deleteGroup = (0, import_react5.useCallback)(async (name) => {
    await run(async () => {
      await api.deleteGroup(name);
      notify("success", `${t("delete")}: ${name}`);
      setDialog(null);
      await refreshBases();
    });
  }, [api, run, refreshBases, notify, t]);
  const moveBase = (0, import_react5.useCallback)(async (base, group) => {
    await run(async () => {
      await api.updateBase(base.id, { group: group ?? "" });
      await refreshBases();
    });
  }, [api, run, refreshBases]);
  const removeBase = (0, import_react5.useCallback)(async (base) => {
    await run(async () => {
      await api.deleteBase(base.id);
      notify("success", `${t("delete")}: ${base.name}`);
      if (selectedBaseId === base.id) {
        setSelectedBaseId(null);
        setDocuments([]);
        setChunks([]);
        setRawText(null);
        setHits([]);
        setStats(null);
      }
      setDialog(null);
      await refreshBases();
    });
  }, [api, run, refreshBases, notify, selectedBaseId, t]);
  const saveBaseConfig = (0, import_react5.useCallback)(async () => {
    notify("success", t("save"));
    await reloadDocuments();
    await refreshBases();
  }, [notify, reloadDocuments, refreshBases, t]);
  const onImported = (0, import_react5.useCallback)((label) => {
    notify("success", `${label} ${t("uploaded")}`);
    setDialog(null);
    void run(reloadDocuments);
  }, [notify, run, reloadDocuments, t]);
  const promptForUrl = (0, import_react5.useCallback)(() => {
    if (selectedBaseId === null) return;
    setDialog({ kind: "addUrl" });
  }, [selectedBaseId]);
  const addUrl = (0, import_react5.useCallback)((url) => {
    if (selectedBaseId === null) return;
    const trimmed = url.trim();
    if (trimmed === "") return;
    void run(async () => {
      try {
        await api.addUrlDocument(selectedBaseId, trimmed, currentDirectoryId ?? void 0);
        onImported(trimmed);
      } catch (err) {
        notify("error", err instanceof Error ? err.message : String(err));
      }
    });
  }, [api, run, onImported, notify, selectedBaseId, currentDirectoryId]);
  const promptForPath = (0, import_react5.useCallback)(() => {
    if (selectedBaseId === null) return;
    setDialog({ kind: "addPath" });
  }, [selectedBaseId]);
  const notifySync = (0, import_react5.useCallback)((label, sync) => {
    const parts = [];
    if (sync.created > 0) parts.push(`${t("syncCreated")} ${sync.created}`);
    if (sync.updated > 0) parts.push(`${t("syncUpdated")} ${sync.updated}`);
    if (sync.deleted > 0) parts.push(`${t("syncDeleted")} ${sync.deleted}`);
    if (sync.unchanged > 0) parts.push(`${t("syncUnchanged")} ${sync.unchanged}`);
    if (sync.failed > 0) parts.push(`${t("syncFailed")} ${sync.failed}`);
    const summary = parts.join(" \xB7 ");
    if (sync.failed > 0) {
      const first = sync.items.find((item) => item.action === "failed" && item.error !== void 0);
      notify("warning", `${label} \xB7 ${summary}${first?.error !== void 0 ? ` \u2014 ${first.relativePath}: ${first.error.message}` : ""}`);
      return;
    }
    if (sync.created + sync.updated + sync.deleted === 0) {
      notify("info", `${label} \xB7 ${t("syncNoChanges")}${sync.unchanged > 0 ? ` (${t("syncUnchanged")} ${sync.unchanged})` : ""}`);
      return;
    }
    notify("success", `${label} \xB7 ${summary}`);
  }, [notify, t]);
  const addPath = (0, import_react5.useCallback)((path) => {
    if (selectedBaseId === null) return;
    const trimmed = path.trim();
    if (trimmed === "") return;
    void run(async () => {
      try {
        const result = await api.importFromPath(selectedBaseId, trimmed);
        setDialog(null);
        if (result.sync !== void 0) {
          notifySync(t("tabPath"), result.sync);
        } else if (result.errors.length > 0) {
          notify("warning", t("pathImportPartial").replace("{count}", String(result.imported)).replace("{errors}", String(result.errors.length)));
        } else {
          notify("success", `${t("tabPath")}: ${result.imported}`);
        }
        await refreshBases();
        await reloadDocuments();
      } catch (err) {
        notify("error", err instanceof Error ? err.message : String(err));
      }
    });
  }, [api, run, refreshBases, reloadDocuments, notify, notifySync, selectedBaseId, t]);
  const promptForSourcePath = (0, import_react5.useCallback)((source) => {
    if (selectedBaseId === null) return;
    if (source.sourcePath === void 0) return;
    setDialog({ kind: "editSourcePath", sourceId: source.sourceId, initial: source.sourcePath });
  }, [selectedBaseId]);
  const editSourcePath = (0, import_react5.useCallback)((sourceId, path) => {
    if (selectedBaseId === null) return;
    const trimmed = path.trim();
    if (trimmed === "") return;
    void run(async () => {
      try {
        const result = await api.setBaseSourcePath(selectedBaseId, sourceId, trimmed);
        setDialog(null);
        notify("success", `${t("sourcePathEdit")}: ${result.set}`);
        await refreshBases();
      } catch (err) {
        notify("error", err instanceof Error ? err.message : String(err));
      }
    });
  }, [api, run, refreshBases, notify, selectedBaseId, t]);
  const addText = (0, import_react5.useCallback)((title, content) => {
    if (selectedBaseId === null) return;
    void run(async () => {
      try {
        await api.addTextDocument(selectedBaseId, title, content, currentDirectoryId ?? void 0);
        setDialog(null);
        notify("success", `${t("tabText")}: ${title}`);
        await reloadDocuments();
      } catch (err) {
        notify("error", err instanceof Error ? err.message : String(err));
      }
    });
  }, [api, run, notify, reloadDocuments, selectedBaseId, currentDirectoryId, t]);
  const [pendingConflict, setPendingConflict] = (0, import_react5.useState)(null);
  const [pendingResolution, setPendingResolution] = (0, import_react5.useState)(null);
  const reportImportFailure = (0, import_react5.useCallback)((err) => {
    notify("error", err instanceof Error ? err.message : String(err));
  }, [notify]);
  const runFileImport = (0, import_react5.useCallback)(async (files, conflict) => {
    if (selectedBaseId === null || files.length === 0) return;
    const oversized = files.filter((file) => file.size > MAX_UPLOAD_BYTES);
    const accepted = files.filter((file) => file.size <= MAX_UPLOAD_BYTES);
    for (const file of oversized) notify("warning", t("fileTooLarge").replace("{name}", file.name));
    if (accepted.length === 0) return;
    const nameOf = (file) => file.webkitRelativePath || file.name;
    if (conflict === void 0) {
      const detect = await api.addFiles(
        selectedBaseId,
        accepted.map((file) => ({ fileName: nameOf(file) })),
        "detect",
        currentDirectoryId ?? void 0
      );
      if (detect.status === "conflicts") {
        setPendingConflict({ files: accepted, conflicts: detect.conflicts });
        return;
      }
      if (detect.status === "clean") {
        const result = await api.addFiles(
          selectedBaseId,
          await Promise.all(accepted.map(async (file) => ({
            fileName: nameOf(file),
            mimeType: file.type || "application/octet-stream",
            contentBase64: await readFileAsBase64(file)
          }))),
          "rename",
          currentDirectoryId ?? void 0
        );
        await reloadDocuments();
        if (result.status === "added") {
          const skipped2 = result.accepted.filter((doc) => doc.skipped === true).length;
          const imported2 = result.accepted.length - skipped2;
          if (skipped2 > 0) notify("info", `${t("uploaded")} ${imported2} \xB7 ${t("conflictSkipped")} ${skipped2}`);
          else notify("success", `${accepted.length} ${t("uploaded")}`);
        }
        return;
      }
      return;
    }
    const effective = conflict;
    notify("info", `${accepted.length} ${t("uploaded")}\u2026`);
    let failed = 0;
    let skipped = 0;
    let firstError = "";
    for (const file of accepted) {
      try {
        const contentBase64 = await readFileAsBase64(file);
        const result = await api.addFileDocument(selectedBaseId, nameOf(file), file.type || "application/octet-stream", contentBase64, effective, currentDirectoryId ?? void 0);
        if (result.skipped === true) skipped += 1;
      } catch (err) {
        failed += 1;
        if (firstError === "") firstError = err instanceof Error ? err.message : String(err);
      }
    }
    await reloadDocuments();
    const imported = accepted.length - failed - skipped;
    if (failed === 0 && skipped === 0) {
      notify("success", `${accepted.length} ${t("uploaded")}`);
    } else {
      if (imported > 0) notify("success", `${imported}/${accepted.length} ${t("uploaded")}`);
      if (skipped > 0) notify("warning", `${skipped} ${t("conflictSkipped")}`);
      if (failed > 0) notify("error", `${failed} ${t("importFailed")}: ${firstError}`);
    }
  }, [api, notify, reloadDocuments, selectedBaseId, currentDirectoryId, t]);
  const resolveConflict = (0, import_react5.useCallback)((resolution) => {
    if (pendingConflict === null || pendingResolution !== null) return;
    const { files } = pendingConflict;
    setPendingConflict(null);
    if (resolution !== "cancel") {
      setPendingResolution(resolution);
      void runFileImport(files, resolution).finally(() => setPendingResolution(null)).catch(reportImportFailure);
    }
  }, [pendingConflict, pendingResolution, runFileImport]);
  const dragCarriesFiles = (event) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
  const handleDragEnter = (0, import_react5.useCallback)((event) => {
    if (!dragCarriesFiles(event)) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragOver(true);
  }, []);
  const handleDragOver = (0, import_react5.useCallback)((event) => {
    if (dragCarriesFiles(event)) event.preventDefault();
  }, []);
  const handleDragLeave = (0, import_react5.useCallback)(() => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragOver(false);
  }, []);
  const handleDrop = (0, import_react5.useCallback)((event) => {
    if (!dragCarriesFiles(event)) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length === 0) return;
    if (files.length > MAX_FILES) {
      notify("warning", t("tooManyFiles").replace("{count}", String(MAX_FILES)));
      return;
    }
    const supported = files.filter((file) => {
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";
      return SUPPORTED_IMPORT_EXTENSIONS.has(ext);
    });
    if (supported.length === 0) {
      notify("warning", t("noSupportedFiles"));
      return;
    }
    if (supported.length < files.length) {
      notify("warning", t("unsupportedFilesSkipped").replace("{count}", String(files.length - supported.length)));
    }
    void runFileImport(supported).catch(reportImportFailure);
  }, [runFileImport, notify, t]);
  const runDirectoryImport = (0, import_react5.useCallback)(async (files) => {
    if (selectedBaseId === null || files.length === 0) return;
    const supported = files.filter((file) => {
      const rel2 = file.webkitRelativePath || file.name;
      if (rel2.split("/").some((segment) => segment.startsWith("."))) return false;
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";
      return SUPPORTED_IMPORT_EXTENSIONS.has(ext);
    });
    const skippedCount = files.length - supported.length;
    if (supported.length === 0) {
      notify("warning", t("noSupportedFiles"));
      return;
    }
    const rel = (file) => file.webkitRelativePath || file.name;
    const segments = (file) => rel(file).split("/");
    const rootName = segments(supported[0])[0] ?? "folder";
    notify("info", `${t("tabDir")}: ${supported.length} ${t("uploaded")}\u2026`);
    let oversizedCount = 0;
    let submitted = 0;
    let failed = 0;
    let firstError = "";
    try {
      const dirPaths = /* @__PURE__ */ new Set();
      for (const file of supported) {
        const parts = segments(file);
        for (let i = 1; i < parts.length - 1; i += 1) dirPaths.add(parts.slice(0, i + 1).join("/"));
      }
      const sortedDirs = [...dirPaths].sort((a, b) => a.split("/").length - b.split("/").length);
      const dirId = /* @__PURE__ */ new Map();
      const root = await api.createDirectory(selectedBaseId, rootName);
      dirId.set(rootName, root.id);
      for (const dirPath of sortedDirs) {
        const parts = dirPath.split("/");
        const parentPath = parts.slice(0, -1).join("/");
        const created = await api.createDirectory(selectedBaseId, parts[parts.length - 1], dirId.get(parentPath));
        dirId.set(dirPath, created.id);
      }
      for (const file of supported) {
        if (file.size > MAX_UPLOAD_BYTES) {
          oversizedCount += 1;
          notify("warning", t("fileTooLarge").replace("{name}", file.name));
          continue;
        }
        const parts = segments(file);
        const dirPath = parts.slice(0, -1).join("/");
        const parentId = dirPath === rootName || dirPath === "" ? root.id : dirId.get(dirPath);
        try {
          const contentBase64 = await readFileAsBase64(file);
          await api.addFileDocument(selectedBaseId, file.name, file.type || "application/octet-stream", contentBase64, void 0, parentId);
          submitted += 1;
        } catch (err) {
          failed += 1;
          if (firstError === "") firstError = err instanceof Error ? err.message : String(err);
        }
      }
      if (oversizedCount > 0) {
        notify("warning", t("fileTooLarge").replace("{name}", `${oversizedCount} files`));
      }
      if (failed > 0) {
        notify("warning", `${submitted}/${supported.length - oversizedCount} ${t("uploaded")}`);
        notify("error", `${failed} ${t("importFailed")}: ${firstError}`);
      }
    } catch (err) {
      notify("error", err instanceof Error ? err.message : String(err));
    }
    await reloadDocuments();
    if (submitted > 0) notify("success", `${submitted} ${t("uploaded")}`);
    if (skippedCount > 0) notify("info", t("skippedFiles").replace("{count}", String(skippedCount)));
  }, [api, notify, reloadDocuments, selectedBaseId, t]);
  const renameDocument = (0, import_react5.useCallback)(async (doc, title) => {
    await run(async () => {
      await api.renameDocument(doc.id, title);
      notify("success", t("save"));
      setDialog(null);
      await reloadDocuments();
    });
  }, [api, run, reloadDocuments, notify, t]);
  const removeDocument = (0, import_react5.useCallback)(async (doc, recursive = false) => {
    await run(async () => {
      if (!recursive) {
        const impact = await api.getDeleteImpact(doc.id);
        if (impact.requiresRecursive) {
          setDialog({ kind: "confirmCascadeDelete", doc, impact });
          return;
        }
      }
      await api.deleteDocument(doc.id, recursive);
      notify("success", `${t("delete")}: ${doc.title}`);
      if (selectedDocId === doc.id) {
        setChunks([]);
        setRawText(null);
        setRawTextTruncated(false);
        setSelectedDocId(null);
      }
      setDialog(null);
      await reloadDocuments();
    });
  }, [api, run, reloadDocuments, notify, selectedDocId, t]);
  const collectSubtreeIds = (0, import_react5.useCallback)((rootId) => {
    const ids = [];
    const walk = (parentId) => {
      for (const doc of documents) {
        if (doc.parentDirectoryId === parentId) {
          ids.push(doc.id);
          walk(doc.id);
        }
      }
    };
    walk(rootId);
    return [rootId, ...ids];
  }, [documents]);
  const outermostSelectedIds = (0, import_react5.useCallback)((ids) => {
    const selected = new Set(ids);
    const byId = new Map(documents.map((doc) => [doc.id, doc]));
    return ids.filter((id) => {
      let parentId = byId.get(id)?.parentDirectoryId;
      while (parentId !== void 0) {
        if (selected.has(parentId)) return false;
        parentId = byId.get(parentId)?.parentDirectoryId;
      }
      return true;
    });
  }, [documents]);
  const cascadeImpactDetails = (0, import_react5.useCallback)((impacts) => {
    const sum = (pick) => impacts.reduce((total, impact) => total + pick(impact), 0);
    return [
      `${t("cascadeImpactDirectories")}: ${sum((impact) => impact.directories)}`,
      `${t("cascadeImpactFiles")}: ${sum((impact) => impact.files)}`,
      `${t("cascadeImpactChunks")}: ${sum((impact) => impact.chunks)}`,
      `${t("cascadeImpactSnapshots")}: ${sum((impact) => impact.rawSnapshots)}`
    ];
  }, [t]);
  const reindexDoc = (0, import_react5.useCallback)(async (doc, mode) => {
    const optimisticIds = collectSubtreeIds(doc.id);
    setOptimisticProcessing((prev) => /* @__PURE__ */ new Set([...prev, ...optimisticIds]));
    setPollKick((kick) => kick + 1);
    await run(async () => {
      const result = await api.reindexDocument(doc.id, mode);
      if (result.sync !== void 0) notifySync(`${t("reindexDone")}: ${doc.title}`, result.sync);
      else notify("success", `${t("reindexDone")}: ${doc.title}`);
      await reloadDocuments();
    });
    setOptimisticProcessing((prev) => {
      const next = new Set(prev);
      for (const id of optimisticIds) next.delete(id);
      return next;
    });
  }, [api, run, reloadDocuments, notify, notifySync, t, collectSubtreeIds]);
  const refreshUrlDoc = (0, import_react5.useCallback)(async (doc) => {
    await run(async () => {
      const result = await api.refreshUrlDocument(doc.id);
      notify("success", result.changed ? `${t("urlRefreshed")}: ${doc.title}` : `${t("urlUnchanged")}: ${doc.title}`);
      if (selectedDocId === doc.id) {
        setChunks([]);
        setRawText(null);
        setRawTextTruncated(false);
        setSelectedDocId(null);
      }
      await reloadDocuments();
    });
  }, [api, run, reloadDocuments, notify, selectedDocId, t]);
  const cancelProcessing = (0, import_react5.useCallback)(async (doc) => {
    try {
      const result = await api.cancelProcessing(doc.id);
      if (result.cancelled) notify("info", `${t("cancel")}: ${doc.title}`);
      await reloadDocuments();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : String(error));
    }
  }, [api, notify, reloadDocuments, t]);
  const checkedDocs = documents.filter((doc) => checkedDocIds.has(doc.id));
  const allChecked = documents.length > 0 && checkedDocs.length === documents.length;
  const someChecked = checkedDocs.length > 0 && !allChecked;
  const toggleDoc = (0, import_react5.useCallback)((id, next) => {
    setCheckedDocIds((prev) => {
      const nextSet = new Set(prev);
      if (next) nextSet.add(id);
      else nextSet.delete(id);
      return nextSet;
    });
  }, []);
  const toggleAll = (0, import_react5.useCallback)(() => {
    setCheckedDocIds(allChecked ? /* @__PURE__ */ new Set() : new Set(documents.map((doc) => doc.id)));
  }, [allChecked, documents]);
  const bulkReindex = (0, import_react5.useCallback)(async () => {
    const reindexable = checkedDocs.filter((doc) => doc.status !== "processing");
    const skipped = checkedDocs.length - reindexable.length;
    if (reindexable.length === 0) {
      notify("warning", t("bulkReindexNone"));
      return;
    }
    const optimisticIds = reindexable.flatMap((doc) => collectSubtreeIds(doc.id));
    setOptimisticProcessing((prev) => /* @__PURE__ */ new Set([...prev, ...optimisticIds]));
    setPollKick((kick) => kick + 1);
    await run(async () => {
      const result = await api.reindexDocuments(reindexable.map((doc) => doc.id));
      const totalSkipped = skipped + (result.skipped ?? 0);
      const failed = result.failed ?? 0;
      const summary = `${t("reindexDone")} ${result.reindexed}${totalSkipped > 0 ? ` \xB7 ${t("bulkReindexSkipped")} ${totalSkipped}` : ""}${failed > 0 ? ` \xB7 ${t("syncFailed")} ${failed}` : ""}`;
      if (failed > 0) {
        const first = result.items.find((item) => item.action === "failed" && item.error !== void 0);
        notify("warning", `${summary}${first?.error !== void 0 ? ` \u2014 ${first.relativePath}: ${first.error.message}` : ""}`);
      } else {
        notify("success", summary);
      }
      setCheckedDocIds(/* @__PURE__ */ new Set());
      await reloadDocuments();
    });
    setOptimisticProcessing((prev) => {
      const next = new Set(prev);
      for (const id of optimisticIds) next.delete(id);
      return next;
    });
  }, [api, run, reloadDocuments, notify, checkedDocs, t, collectSubtreeIds]);
  const bulkDelete = (0, import_react5.useCallback)(async (recursive = false) => {
    await run(async () => {
      const ids = checkedDocs.map((doc) => doc.id);
      if (!recursive) {
        const impacts = (await Promise.all(outermostSelectedIds(ids).map(async (id) => api.getDeleteImpact(id)))).filter((impact) => impact.requiresRecursive);
        if (impacts.length > 0) {
          setDialog({ kind: "confirmCascadeBulkDelete", count: ids.length, impacts });
          return;
        }
      }
      const result = await api.deleteDocuments(ids, recursive);
      notify("success", `${t("delete")}: ${result.deleted}`);
      setCheckedDocIds(/* @__PURE__ */ new Set());
      setDialog(null);
      await reloadDocuments();
    });
  }, [api, run, reloadDocuments, notify, checkedDocs, t, outermostSelectedIds]);
  const restoreBase = (0, import_react5.useCallback)(async (name, config) => {
    if (selectedBaseId === null) return;
    await run(async () => {
      if (config !== void 0) {
        try {
          await api.probeEmbeddingDimensions({
            provider: config.provider,
            baseUrl: config.baseUrl,
            model: config.model,
            apiKey: config.apiKey
          });
        } catch (error) {
          notify("error", `${t("dimensionProbeFailed")}: ${error instanceof Error ? error.message : String(error)}`);
          return;
        }
      }
      const created = await api.restoreBase(selectedBaseId, name, config !== void 0 ? {
        embeddingProvider: config.provider,
        embeddingBaseUrl: config.baseUrl,
        embeddingModel: config.model,
        embeddingApiKey: config.apiKey
      } : void 0);
      notify("success", `${t("rebuildBase")}: ${created.name}`);
      setDialog(null);
      await refreshBases();
      await selectBase(created.id);
    });
  }, [api, run, refreshBases, selectBase, notify, selectedBaseId, t]);
  const docTypeLabel = (0, import_react5.useCallback)((doc) => {
    if (doc.sourceType === "url") return t("tabUrl");
    if (doc.sourceType === "text") return t("tabText");
    if (doc.sourceType === "directory") return t("tabDir");
    const name = doc.fileName ?? "";
    const dot = name.lastIndexOf(".");
    if (dot < 0) return "FILE";
    return name.slice(dot + 1).toUpperCase();
  }, [t]);
  const searchSeq = (0, import_react5.useRef)(0);
  const doSearch = (0, import_react5.useCallback)(async (query) => {
    const trimmed = query.trim();
    if (trimmed === "") return;
    const seq = ++searchSeq.current;
    setSearchQuery(trimmed);
    await run(async () => {
      const result = await api.search({ query: trimmed, baseId: selectedBaseId ?? void 0 });
      if (seq !== searchSeq.current) return;
      setHits(result.hits);
      setSearchMeta({ reranked: result.reranked, elapsedMs: result.elapsedMs, ...result.rerank !== void 0 ? { rerank: result.rerank } : {} });
      setRecallHistory((prev) => [{ id: Date.now(), query: trimmed, time: Date.now() }, ...prev].slice(0, 20));
    });
  }, [api, run, selectedBaseId]);
  const removeRecallHistory = (0, import_react5.useCallback)((id) => {
    setRecallHistory((prev) => prev.filter((entry) => entry.id !== id));
  }, []);
  const clearRecallHistory = (0, import_react5.useCallback)(() => {
    setRecallHistory([]);
  }, []);
  const selectedBase = bases.find((b) => b.id === selectedBaseId) ?? null;
  const selectedBaseLocalModel = (0, import_react5.useMemo)(() => {
    if (selectedBase === null || globalConfig === null) return null;
    const provider = selectedBase.config?.embeddingProvider ?? globalConfig.embeddingProvider;
    if (provider !== "local") return null;
    const model = (selectedBase.config?.embeddingModel ?? globalConfig.embeddingModel).trim();
    return model === "" ? "onnx-community/Qwen3-Embedding-0.6B-ONNX" : model;
  }, [selectedBase, globalConfig]);
  (0, import_react5.useEffect)(() => {
    if (selectedBaseLocalModel === null) {
      setLocalModelStatus(null);
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const status = await api.getLocalModelStatus(selectedBaseLocalModel);
        if (!cancelled) setLocalModelStatus(status);
      } catch {
      }
    };
    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 800);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [api, selectedBaseLocalModel]);
  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) ?? null;
  const visibleDocuments = documents.filter((doc) => (doc.parentDirectoryId ?? null) === currentDirectoryId);
  const renderedDocuments = visibleDocuments.slice(0, docLimit);
  const hasMoreDocuments = visibleDocuments.length > docLimit;
  const parentOf = /* @__PURE__ */ new Map();
  for (const doc of documents) parentOf.set(doc.id, doc.parentDirectoryId ?? null);
  const processingDocIds = /* @__PURE__ */ new Set();
  for (const doc of documents) if (doc.status === "processing") processingDocIds.add(doc.id);
  const importingFolderIds = /* @__PURE__ */ new Set();
  for (const id of processingDocIds) {
    let parent = parentOf.get(id) ?? null;
    while (parent !== null) {
      importingFolderIds.add(parent);
      parent = parentOf.get(parent) ?? null;
    }
  }
  const currentDirectoryTitle = currentDirectoryId !== null ? documents.find((doc) => doc.id === currentDirectoryId)?.title ?? "" : "";
  const filterText = filter.trim().toLowerCase();
  const filteredBases = filterText === "" ? bases : bases.filter((base) => base.name.toLowerCase().includes(filterText));
  const hasGroups = groups.length > 0;
  const sectionOf = (base) => base.group ?? "";
  const sectionKeys = [];
  if (hasGroups || filterText !== "") sectionKeys.push("");
  for (const group of groups) sectionKeys.push(group);
  const basesBySection = /* @__PURE__ */ new Map();
  for (const base of filteredBases) {
    let key = hasGroups ? sectionOf(base) : "";
    if (hasGroups && key !== "" && !groups.includes(key)) key = "";
    const list = basesBySection.get(key);
    if (list !== void 0) list.push(base);
    else basesBySection.set(key, [base]);
  }
  const toggleCollapse = (key) => {
    setCollapsedGroups((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };
  const baseRowMenu = (base) => [
    { key: "rename", label: t("rename"), onSelect: () => setDialog({ kind: "renameBase", base }) },
    {
      key: "move",
      label: t("moveToGroup"),
      children: [
        { key: "ungrouped", label: t("ungrouped"), onSelect: () => void moveBase(base) },
        ...groups.map((group) => ({ key: group, label: group, onSelect: () => void moveBase(base, group) }))
      ]
    },
    { key: "create-group", label: t("newGroup"), onSelect: () => setDialog({ kind: "createGroup", forBaseId: base.id }) },
    { key: "sep" },
    { key: "delete", label: t("delete"), danger: true, onSelect: () => setDialog({ kind: "confirmDeleteBase", base }) }
  ];
  const groupRowMenu = (group) => [
    { key: "rename", label: t("rename"), onSelect: () => setDialog({ kind: "renameGroup", group }) },
    { key: "create-base", label: t("newBase"), onSelect: () => setDialog({ kind: "createBase", initialGroup: group }) },
    { key: "sep" },
    { key: "delete", label: t("delete"), danger: true, onSelect: () => setDialog({ kind: "confirmDeleteGroup", group }) }
  ];
  const baseSourceGlyph = (kind) => {
    switch (kind) {
      case "directory":
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconFolderOpen, { size: 12 });
      case "url":
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconLink, { size: 12 });
      case "file":
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconDoc, { size: 12 });
      default:
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconPencil, { size: 12 });
    }
  };
  const renderBaseRow = (base) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      className: "kb-row kb-card",
      style: { ...style.baseCard, ...base.id === selectedBaseId ? style.baseCardActive : {} },
      onClick: () => void selectBase(base.id),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { ...style.baseAvatar, background: avatarColor(base.name) }, children: base.name.trim().charAt(0).toUpperCase() || "?" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { ...style.baseName, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: base.name }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: style.baseMeta, children: [
            base.documentCount,
            t("docCount"),
            " \xB7 ",
            formatSize(base.charCount)
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          PopoverMenu,
          {
            align: "end",
            trigger: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-iconbtn", style: style.iconOnlyButton, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconMore, {}) }),
            entries: baseRowMenu(base)
          }
        )
      ]
    },
    base.id
  );
  const addSourceMenu = [
    { key: "file", label: t("tabFile"), onSelect: () => fileInputRef.current?.click() },
    { key: "dir", label: t("tabDir"), onSelect: () => dirInputRef.current?.click() },
    { key: "path", label: t("tabPath"), onSelect: () => promptForPath() },
    { key: "url", label: t("tabUrl"), onSelect: () => promptForUrl() },
    { key: "text", label: t("tabText"), onSelect: () => setDialog({ kind: "addText" }) }
  ];
  const docRowMenu = (doc) => {
    if (doc.sourceType === "directory") {
      return [
        { key: "open", label: t("openFolder"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconFolderOpen, { size: 14 }), onSelect: () => drillIntoDirectory(doc.id) },
        { key: "reindex", label: t("reindexButton"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconRefresh, { size: 14 }), onSelect: () => void reindexDoc(doc) },
        { key: "sep" },
        { key: "delete", label: t("delete"), danger: true, onSelect: () => setDialog({ kind: "confirmDeleteDoc", doc }) }
      ];
    }
    return [
      { key: "preview", label: t("viewSource"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconEye, { size: 14 }), onSelect: () => void openDocument(doc.id, "preview") },
      { key: "chunks", label: t("viewChunks"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconEye, { size: 14 }), onSelect: () => void openDocument(doc.id, "chunks") },
      ...doc.status === "processing" || doc.status === "pending" || optimisticProcessing.has(doc.id) ? [{ key: "cancel-processing", label: t("cancel"), onSelect: () => void cancelProcessing(doc) }] : [],
      { key: "reindex", label: t("reindexButton"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconRefresh, { size: 14 }), onSelect: () => void reindexDoc(doc) },
      { key: "reparse", label: t("reparseDocument"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconRefresh, { size: 14 }), onSelect: () => void reindexDoc(doc, "reparse") },
      ...doc.processing ? [{ key: "rechunk", label: t("rechunkDocument"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconRefresh, { size: 14 }), onSelect: () => void reindexDoc(doc, "rechunk") }] : [],
      ...doc.sourceType === "url" ? [{ key: "refresh-url", label: t("refreshUrl"), icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconRefresh, { size: 14 }), onSelect: () => void refreshUrlDoc(doc) }] : [],
      { key: "sep" },
      { key: "delete", label: t("delete"), danger: true, onSelect: () => setDialog({ kind: "confirmDeleteDoc", doc }) }
    ];
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.panel, "--kb-titlebar-inset": `${titlebarInset}px` }, className: "kb-panel-in", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.header, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.headerLeft, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconBook, { size: 20, color: C.accent }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.headerTitle, children: t("nav") }),
        busy && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: style.spinner }),
          t("processing")
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }, children: [
        toggle !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          KnowledgeWorkspaceGate,
          {
            enabled: toggle.enabled,
            enabledBaseIds: toggle.enabledBaseIds,
            workspacePaths: toggle.workspacePaths,
            workspaces: registryWorkspaces,
            currentPath,
            t,
            onChangeWorkspacePaths: (paths) => void updateToggle({ workspacePaths: paths })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: style.closeButton, onClick: onClose, title: t("close"), "aria-label": t("close"), children: "\u2715" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Toasts, { toasts, onDismiss: dismissToast }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.body, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("aside", { style: { ...style.sidebar, width: navWidth }, className: "kb-scroll", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: style.input,
            placeholder: t("searchBases"),
            value: filter,
            onChange: (e) => setFilter(e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { style: style.newBaseButton, onClick: () => setDialog({ kind: "createBase" }), disabled: busy, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconPlus, {}),
          t("newBase")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { style: style.newBaseButton, onClick: () => setDialog({ kind: "createGroup" }), disabled: busy, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconPlus, {}),
          t("newGroup")
        ] }),
        filteredBases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.empty, children: t("noBases") }) : !hasGroups && filterText === "" ? filteredBases.map(renderBaseRow) : sectionKeys.map((key) => {
          const items = basesBySection.get(key) ?? [];
          if (filterText !== "" && items.length === 0) return null;
          const collapsed = collapsedGroups.includes(key);
          const isGroup = key !== "";
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { marginBottom: 2 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 2, padding: "2px 6px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                "button",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flex: 1,
                    minWidth: 0,
                    border: "none",
                    background: "transparent",
                    padding: "4px 6px",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textAlign: "left",
                    letterSpacing: 0.4,
                    textTransform: "uppercase"
                  },
                  onClick: () => toggleCollapse(key),
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 9 }, children: collapsed ? "\u25B8" : "\u25BE" }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }, children: isGroup ? key : t("ungrouped") }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 10, fontWeight: 600, opacity: 0.75 }, children: items.length })
                  ]
                }
              ),
              isGroup && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                PopoverMenu,
                {
                  align: "end",
                  trigger: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-iconbtn", style: { ...style.iconOnlyButton, width: 22, height: 22 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconMore, {}) }),
                  entries: groupRowMenu(key)
                }
              )
            ] }),
            !collapsed && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { children: items.map(renderBaseRow) })
          ] }, key);
        })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "div",
        {
          className: "kb-sash",
          onMouseDown: onNavResizeStart,
          style: { width: 8, cursor: "col-resize", flexShrink: 0, background: "transparent", borderRight: `1px solid ${C.border}` },
          title: t("dragResize"),
          "aria-label": t("dragResize")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("main", { style: style.main, className: "kb-scroll", children: selectedBaseId === null || selectedBase === null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.card, ...style.empty }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 30, marginBottom: 8, color: C.muted }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconBook, { size: 30, color: C.muted }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }, children: t("selectBase") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12 }, children: t("noDocsHint") })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { ...style.baseAvatar, background: avatarColor(selectedBase.name), width: 26, height: 26, fontSize: 12 }, children: selectedBase.name.trim().charAt(0).toUpperCase() || "?" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: selectedBase.name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.actionsRow, children: stats?.staleEmbeddings === true ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "button",
            {
              className: "kb-row",
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: C.danger,
                border: `1px solid ${C.danger}`,
                borderRadius: 999,
                padding: "2px 10px",
                background: "transparent",
                cursor: "pointer"
              },
              onClick: () => setDialog({ kind: "restoreBase" }),
              title: t("rebuildHint"),
              children: [
                "\u2715 ",
                t("rebuildBase")
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "button",
              {
                className: "kb-row",
                style: { ...style.ghostButton, ...recallOpen ? { color: C.accent, background: accentSoftText() } : {} },
                onClick: () => setRecallOpen((v) => !v),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconFlask, { size: 14 }),
                  t("recallTest")
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "button",
              {
                className: "kb-iconbtn",
                style: { ...style.iconOnlyButton, ...ragOpen ? { color: C.accent, background: accentSoftText() } : {} },
                title: t("settings"),
                "aria-label": t("settings"),
                onClick: () => setRagOpen((v) => !v),
                children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconSliders, { size: 14 })
              }
            )
          ] }) })
        ] }),
        (selectedBase.sourceInfo ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.baseSourceRow, children: selectedBase.sourceInfo.map((source) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: style.baseSourceItem, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.baseSourceGlyph, children: baseSourceGlyph(source.kind) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.baseSourceText, title: source.text, children: source.text }),
          source.sourcePath !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "button",
            {
              className: "kb-iconbtn",
              style: { ...style.baseSourceEdit, ...style.iconOnlyButton },
              title: t("sourcePathEdit"),
              "aria-label": `${t("sourcePathEdit")}: ${source.text}`,
              onClick: () => promptForSourcePath(source),
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconPencil, { size: 11 })
            }
          )
        ] }, source.sourceId)) }),
        selectedDocId !== null && selectedDoc !== null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          DocumentDetailPanel,
          {
            doc: selectedDoc,
            api,
            rawText,
            rawTextTruncated,
            chunks,
            t,
            initialMode: detailMode,
            onBack: () => {
              setSelectedDocId(null);
              setChunks([]);
              setRawText(null);
              setRawTextTruncated(false);
            },
            onLoadMoreChunks: () => void loadMoreChunks()
          },
          selectedDoc.id
        ) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
          stats !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.statsRow, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: stats.documentCount, label: t("statsSourceDocs"), title: t("statsSourceDocsTitle") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: stats.storedDocCount, label: t("statsStoredDocs"), title: t("statsStoredDocsTitle") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: stats.chunkCount, label: t("statsChunks") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: stats.tokenCount, label: t("statsTokens") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: formatSize(stats.charCount), label: t("statsChars") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: stats.embedded ? "\u2713" : "\u2014", label: stats.embedded ? t("embedded") : t("notEmbedded") }),
            stats.embeddingDimensions !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(StatChip, { value: `${stats.embeddingDimensions}d`, label: t("statsDims") })
          ] }),
          stats !== null && stats.documentCount > 0 && !stats.embedded && globalConfig !== null && (selectedBase.config?.embeddingProvider ?? globalConfig.embeddingProvider) === "none" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.warningHint, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("embeddingNotConfigured") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { style: { ...style.button, flexShrink: 0 }, onClick: () => setRagOpen(true), children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconSliders, { size: 13 }),
              t("settings")
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "div",
            {
              style: { ...style.card, ...dragOver ? { outline: `2px dashed ${C.accent}`, outlineOffset: -4 } : {} },
              onDragEnter: handleDragEnter,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
              children: [
                dragOver && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: {
                  position: "absolute",
                  inset: 0,
                  zIndex: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #3b6ef6) 8%, transparent)",
                  borderRadius: 10,
                  pointerEvents: "none"
                }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 14, fontWeight: 600, color: C.accent, background: C.bg, padding: "8px 16px", borderRadius: 999, boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }, children: t("dragToUpload") }) }),
                currentDirectoryId !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-row", style: style.button, onClick: navigateUp, children: [
                    "\u2190 ",
                    t("backToParent")
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: currentDirectoryTitle })
                ] }),
                someChecked || allChecked ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { fontSize: 13, fontWeight: 600 }, children: [
                    t("selected"),
                    " ",
                    checkedDocs.length
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: style.actionsRow, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { style: style.button, disabled: busy, onClick: () => void bulkReindex(), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconRefresh, { size: 13 }),
                      t("bulkReindex")
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                      "button",
                      {
                        className: "kb-danger-primary",
                        style: style.primaryDanger,
                        disabled: busy,
                        onClick: () => setDialog({ kind: "confirmBulkDelete", count: checkedDocs.length }),
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconTrash, { size: 13 }),
                          t("bulkDelete")
                        ]
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { fontSize: 11, color: C.muted }, children: [
                      t("updatedAtText"),
                      " ",
                      formatRelativeTime(selectedBase.updatedAt, t)
                    ] }),
                    selectedBaseLocalModel !== null && localModelStatus !== null && localModelStatus.status !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                      "span",
                      {
                        style: {
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: localModelStatus.status === "error" ? C.danger : C.warn,
                          whiteSpace: "nowrap"
                        },
                        title: localModelStatus.message || void 0,
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { width: 7, height: 7, borderRadius: 999, background: localModelStatus.status === "error" ? C.danger : C.warn, flexShrink: 0 } }),
                          t("localModelStatusLabel"),
                          localModelStatus.status === "downloading" ? ` ${Math.round(localModelStatus.progress)}%` : localModelStatus.status === "error" ? ` \xB7 ${t("localModelErrorTitle")}` : ` \xB7 ${t("localModelNotReadyTitle")}`,
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                            "button",
                            {
                              style: { color: C.accent, cursor: "pointer", background: "none", border: "none", fontSize: 11, padding: "0 2px", textDecoration: "underline" },
                              onClick: () => setRagOpen(true),
                              children: t("goToSettings")
                            }
                          )
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    PopoverMenu,
                    {
                      align: "end",
                      trigger: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-primary", style: style.primary, disabled: busy, children: [
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconPlus, {}),
                        t("addSource")
                      ] }),
                      entries: addSourceMenu
                    }
                  )
                ] }),
                visibleDocuments.length === 0 ? currentDirectoryId !== null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.empty, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", justifyContent: "center", marginBottom: 6 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconFolder, { size: 26, color: C.muted }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: C.text }, children: t("emptyFolder") })
                ] }) : documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.empty, padding: "28px 12px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }, children: t("firstUploadTitle") }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    PopoverMenu,
                    {
                      align: "start",
                      trigger: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-primary", style: style.primary, disabled: busy, children: [
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconPlus, {}),
                        t("addSource")
                      ] }),
                      entries: addSourceMenu
                    }
                  ) }),
                  selectedBaseLocalModel !== null && localModelStatus !== null && localModelStatus.status !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }, children: [
                    localModelStatus.status === "downloading" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { width: 52, height: 52, viewBox: "0 0 52 52", "aria-hidden": "true", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { cx: "26", cy: "26", r: "22", fill: "none", stroke: C.border, strokeWidth: "5" }),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                          "circle",
                          {
                            cx: "26",
                            cy: "26",
                            r: "22",
                            fill: "none",
                            stroke: C.accent,
                            strokeWidth: "5",
                            strokeLinecap: "round",
                            strokeDasharray: `${2 * Math.PI * 22}`,
                            strokeDashoffset: `${2 * Math.PI * 22 * (1 - Math.min(1, Math.max(0, localModelStatus.progress / 100)))}`,
                            transform: "rotate(-90 26 26)"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: C.text }, children: t("localModelDownloadingTitle") }),
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { fontSize: 12, color: C.muted }, children: [
                        selectedBaseLocalModel,
                        " \xB7 ",
                        Math.round(localModelStatus.progress),
                        "%"
                      ] })
                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: localModelStatus.status === "error" ? C.danger : C.text }, children: localModelStatus.status === "error" ? t("localModelErrorTitle") : t("localModelNotReadyTitle") }),
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: C.muted, maxWidth: 420, textAlign: "center" }, children: localModelStatus.message || t("localModelNotReadyHint") })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: { ...style.button, marginTop: 4 }, onClick: () => setRagOpen(true), children: t("goToSettings") })
                  ] }),
                  selectedBaseLocalModel === null && globalConfig !== null && globalConfig.embeddingProvider === "local" && localEmbeddingDownloaded === false && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { ...style.warningHint, marginTop: 14, maxWidth: 420, marginLeft: "auto", marginRight: "auto", textAlign: "center" }, children: t("embeddingModelMissingHint") })
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.empty, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 26, marginBottom: 6 }, children: "\u{1F4C4}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }, children: t("noDocuments") }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12 }, children: t("noDocsHint") })
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { marginTop: 8 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.tableHeadRow, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Checkbox, { checked: allChecked, indeterminate: someChecked, onChange: () => toggleAll(), ariaLabel: t("selectAll") }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("baseName") }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("type") }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("status") }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("updatedAtColumn") }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", {})
                  ] }),
                  renderedDocuments.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                    "div",
                    {
                      className: "kb-row",
                      style: style.tableRow,
                      onClick: () => doc.sourceType === "directory" ? drillIntoDirectory(doc.id) : void openDocument(doc.id, "preview"),
                      onContextMenu: (e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, doc });
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                          Checkbox,
                          {
                            checked: checkedDocIds.has(doc.id),
                            onChange: (next) => toggleDoc(doc.id, next),
                            ariaLabel: doc.title
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { minWidth: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
                          doc.sourceType === "directory" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: docIconStyle("#f5a623"), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconFolder, { size: 16 }) }) : (() => {
                            const visual = doc.sourceType === "url" ? { color: "#10b981", icon: fileVisual("page").icon } : fileVisual(doc.fileName ?? "text.txt");
                            const DocIcon = visual.icon;
                            return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: docIconStyle(visual.color), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(DocIcon, { size: 15, color: visual.color }) });
                          })(),
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { minWidth: 0 }, children: [
                            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { ...style.docTitle, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: doc.title }),
                            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.docMeta, children: doc.sourceType === "directory" ? `${doc.childCount ?? 0} ${t("docCount")}` : `${doc.chunkCount}${t("chunkCount")} \xB7 ${formatSize(doc.charCount)}` })
                          ] })
                        ] }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 12, color: C.muted }, children: docTypeLabel(doc) }),
                        doc.sourceType === "directory" ? importingFolderIds.has(doc.id) ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.accent }, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: { ...style.spinner, width: 10, height: 10, borderWidth: 2 } }),
                          t("statusImporting")
                        ] }) : doc.indexingPhase !== void 0 || optimisticProcessing.has(doc.id) ? (
                          // The container itself is being rescanned (reindex of a
                          // source-backed folder) — Cherry's directory preparing.
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.accent }, children: [
                            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: { ...style.spinner, width: 10, height: 10, borderWidth: 2 } }),
                            doc.indexingPhase === "parsing" || optimisticProcessing.has(doc.id) ? t("statusParsing") : t("statusProcessing")
                          ] })
                        ) : (
                          // Cherry's directory completed → ready badge (dsh used a
                          // bare '—' here, which read as 'no model running').
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: C.success }, children: [
                            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconCheck, { size: 12 }),
                            t("ready")
                          ] })
                        ) : (() => {
                          const phase = doc.indexingPhase;
                          const progress = doc.indexingProgress ?? 0;
                          if (phase !== void 0) {
                            return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.accent }, children: [
                              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: { ...style.spinner, width: 10, height: 10, borderWidth: 2 } }),
                              doc.processingProgress ? processingStageLabel(doc.processingProgress, t) : phase === "parsing" ? t("statusParsing") : `${t("statusProcessing")} ${progress}%`
                            ] });
                          }
                          if (optimisticProcessing.has(doc.id)) {
                            return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.accent }, children: [
                              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: { ...style.spinner, width: 10, height: 10, borderWidth: 2 } }),
                              t("statusParsing")
                            ] });
                          }
                          if (doc.status === "completed") {
                            return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { title: doc.processing?.warnings.map((warning) => warning.message).join("\n"), style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: doc.processing?.completeness === "partial" ? C.warn : C.success }, children: [
                              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconCheck, { size: 12 }),
                              doc.processing?.completeness === "partial" ? t("processingPartial") : t("ready")
                            ] });
                          }
                          if (doc.status === "pending") {
                            return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: C.muted }, children: t("statusPending") });
                          }
                          if (doc.status === "failed") {
                            const reason = failureReasonLabel(doc, t);
                            return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                              "span",
                              {
                                style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: C.danger },
                                tabIndex: 0,
                                role: "img",
                                "aria-label": `${t("embeddingFailed")}: ${reason}`,
                                title: reason,
                                children: [
                                  "\u2715 ",
                                  t("embeddingFailed")
                                ]
                              }
                            );
                          }
                          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                            "span",
                            {
                              style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: C.muted },
                              title: t("lexicalOnlyHint"),
                              children: t("lexicalOnly")
                            }
                          );
                        })(),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 11, color: C.muted }, children: doc.updatedAt !== void 0 ? formatRelativeTime(doc.updatedAt, t) : "" }),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                          PopoverMenu,
                          {
                            align: "end",
                            trigger: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-iconbtn", style: style.iconOnlyButton, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconMore, {}) }),
                            entries: docRowMenu(doc)
                          }
                        )
                      ]
                    },
                    doc.id
                  )),
                  hasMoreDocuments && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", justifyContent: "center", padding: "10px 0 4px" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-row", style: style.button, onClick: () => setDocLimit((v) => v + 100), children: [
                    t("loadMore"),
                    " (",
                    renderedDocuments.length,
                    "/",
                    visibleDocuments.length,
                    ")"
                  ] }) }),
                  !hasMoreDocuments && visibleDocuments.length > 100 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 12, color: C.muted }, children: t("listEndReached") })
                ] })
              ]
            }
          )
        ] })
      ] }) }),
      ragOpen && globalConfig !== null && selectedBase !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SidePanel, { title: t("baseSettings"), onClose: () => setRagOpen(false), width: sidePanelWidth, onResizeWidth: onSideResizeStart, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        RagConfigPanel,
        {
          base: selectedBase,
          globalConfig,
          api,
          t,
          busy,
          onSaved: () => void saveBaseConfig()
        }
      ) }),
      recallOpen && selectedBase !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SidePanel, { title: t("recallTest"), onClose: () => setRecallOpen(false), width: sidePanelWidth, onResizeWidth: onSideResizeStart, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        RecallPanel,
        {
          t,
          busy,
          searchQuery,
          hits,
          searchMeta,
          history: recallHistory,
          onQueryChange: setSearchQuery,
          onSearch: (query) => void doSearch(query),
          onReplay: (query) => void doSearch(query),
          onRemoveHistory: removeRecallHistory,
          onClearHistory: clearRecallHistory
        }
      ) })
    ] }),
    dialog?.kind === "createBase" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      CreateBaseDialog,
      {
        t,
        groups,
        initialGroup: dialog.initialGroup,
        busy,
        onCreate: (name, description, group) => void createBase(name, description, group),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "createGroup" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("newGroup"),
        label: t("groupName"),
        initial: "",
        onOk: (value) => void createGroup(value, dialog.forBaseId),
        busy,
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "renameGroup" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("renameGroup"),
        label: t("groupName"),
        initial: dialog.group,
        onOk: (value) => void renameGroup(dialog.group, value),
        busy,
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "confirmDeleteGroup" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConfirmDialog,
      {
        title: t("delete"),
        message: t("confirmDeleteGroup"),
        confirmLabel: t("delete"),
        busy,
        onConfirm: () => void deleteGroup(dialog.group),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "renameBase" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("rename"),
        label: t("baseName"),
        initial: dialog.base.name,
        onOk: (value) => void renameBase(dialog.base, value),
        busy,
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "restoreBase" && selectedBase !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      RestoreBaseDialog,
      {
        defaultName: `${selectedBase.name} (${t("rebuildBase")})`,
        t,
        busy,
        onRestore: (name) => void restoreBase(name),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "confirmDeleteBase" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConfirmDialog,
      {
        title: t("delete"),
        message: t("confirmDeleteBase"),
        confirmLabel: t("delete"),
        busy,
        onConfirm: () => void removeBase(dialog.base),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "confirmDeleteDoc" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConfirmDialog,
      {
        title: t("delete"),
        message: t("confirmDeleteDoc"),
        confirmLabel: t("delete"),
        busy,
        onConfirm: () => void removeDocument(dialog.doc),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "confirmCascadeDelete" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConfirmDialog,
      {
        title: t("confirmCascadeDeleteTitle"),
        message: t("confirmCascadeDelete"),
        details: cascadeImpactDetails([dialog.impact]),
        confirmLabel: t("cascadeDeleteConfirm"),
        busy,
        onConfirm: () => void removeDocument(dialog.doc, true),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "confirmCascadeBulkDelete" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConfirmDialog,
      {
        title: t("confirmCascadeBulkDeleteTitle"),
        message: t("confirmCascadeBulkDelete"),
        details: cascadeImpactDetails(dialog.impacts),
        confirmLabel: `${t("cascadeDeleteConfirm")} (${dialog.count})`,
        busy,
        onConfirm: () => void bulkDelete(true),
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "confirmBulkDelete" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConfirmDialog,
      {
        title: t("delete"),
        message: t("confirmBulkDelete").replace("{count}", String(dialog.count)),
        confirmLabel: t("bulkDelete"),
        busy,
        onConfirm: () => {
          setDialog(null);
          void bulkDelete();
        },
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "addUrl" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("tabUrl"),
        label: t("urlDesc"),
        initial: "",
        onOk: (value) => {
          setDialog(null);
          addUrl(value);
        },
        busy,
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "addPath" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("tabPath"),
        label: t("pathDesc"),
        initial: "",
        onOk: (value) => {
          setDialog(null);
          addPath(value);
        },
        busy,
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "editSourcePath" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("sourcePathEdit"),
        label: t("sourcePathPrompt"),
        initial: dialog.initial,
        onOk: (value) => {
          setDialog(null);
          editSourcePath(dialog.sourceId, value);
        },
        busy,
        onClose: () => setDialog(null)
      }
    ),
    dialog?.kind === "addText" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      TextDocumentDialog,
      {
        t,
        busy,
        onCreate: (title, content) => addText(title, content),
        onClose: () => setDialog(null)
      }
    ),
    pendingConflict !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.modalBackdrop, onClick: () => pendingResolution === null && resolveConflict("cancel"), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.modal, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.modalHeader, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { fontSize: 14 }, children: t("conflictDialogTitle") }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { fontSize: 13, margin: "0 0 12px", lineHeight: 1.6 }, children: t("conflictDialogMessage").replace("{count}", String(pendingConflict.files.length)) }),
      pendingConflict.conflicts !== void 0 && pendingConflict.conflicts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { style: { maxHeight: 200, overflowY: "auto", margin: "0 0 12px", padding: 0, listStyle: "none" }, children: pendingConflict.conflicts.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
        "li",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: C.text,
            background: C.surface2,
            borderRadius: 6,
            padding: "4px 8px",
            marginBottom: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { width: 14, height: 14, borderRadius: 3, background: "color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f5a623) 25%, transparent)", flexShrink: 0 } }),
            name
          ]
        },
        `${name}-${index}`
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.actionsRow, justifyContent: "flex-end" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "kb-primary", style: style.primary, disabled: pendingResolution !== null, onClick: () => resolveConflict("rename"), children: pendingResolution === "rename" ? t("resolvingConflict") : t("conflictKeepAll") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "kb-danger-primary", style: style.primaryDanger, disabled: pendingResolution !== null, onClick: () => resolveConflict("replace"), children: pendingResolution === "replace" ? t("resolvingConflict") : t("conflictReplaceAll") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: style.button, disabled: pendingResolution !== null, onClick: () => resolveConflict("cancel"), children: t("cancel") })
      ] })
    ] }) }),
    dialog?.kind === "renameDoc" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      PromptDialog,
      {
        title: t("renameDoc"),
        label: t("baseName"),
        initial: dialog.doc.title,
        onOk: (value) => void renameDocument(dialog.doc, value),
        busy,
        onClose: () => setDialog(null)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        multiple: true,
        accept: FILE_ACCEPT,
        style: { display: "none" },
        onChange: (e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (picked.length > MAX_FILES) {
            notify("warning", t("tooManyFiles").replace("{count}", String(MAX_FILES)));
            return;
          }
          void runFileImport(picked).catch(reportImportFailure);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "input",
      {
        ref: dirInputRef,
        type: "file",
        multiple: true,
        webkitdirectory: "",
        style: { display: "none" },
        onChange: (e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          void runDirectoryImport(picked);
        }
      }
    ),
    contextMenu !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ContextMenu,
      {
        x: contextMenu.x,
        y: contextMenu.y,
        entries: docRowMenu(contextMenu.doc),
        onClose: () => setContextMenu(null)
      }
    )
  ] });
}
function accentSoftText() {
  return "color-mix(in srgb, var(--dsw-alias-brand-primary, #3b6ef6) 10%, transparent)";
}
function failureReasonLabel(doc, t) {
  switch (doc.errorCode) {
    case "interrupted":
      return t("errorInterrupted");
    case "dimension_mismatch":
      return `${t("errorDimensionMismatch")}: ${doc.embeddingError ?? ""}`;
    case "parse_failed":
      return `${t("errorParseFailed")}: ${doc.embeddingError ?? ""}`;
    case "embedding_provider":
      return `${t("errorEmbeddingProvider")}: ${doc.embeddingError ?? ""}`;
    default:
      return doc.embeddingError ?? t("embeddingFailed");
  }
}
function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}
function RecallPanel(props) {
  const { t } = props;
  const [historyOpen, setHistoryOpen] = (0, import_react5.useState)(false);
  const hasHistory = props.history.length > 0;
  const canSearch = props.searchQuery.trim().length > 0 && !props.busy;
  const topScore = props.hits.length > 0 ? Math.max(...props.hits.map((hit) => hit.score)) : 0;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 12, minHeight: 0, flex: 1 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", position: "relative" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", background: C.surface }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconSearch, { size: 14, color: C.muted }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: { flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: C.text, minWidth: 0 },
            placeholder: t("searchPlaceholder"),
            value: props.searchQuery,
            onChange: (e) => props.onQueryChange(e.target.value),
            onFocus: () => setHistoryOpen(hasHistory),
            onKeyDown: (e) => {
              if (e.key === "Enter" && canSearch) props.onSearch(props.searchQuery);
            }
          }
        ),
        hasHistory && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            style: { ...style.iconOnlyButton, width: 22, height: 22 },
            onClick: () => setHistoryOpen((v) => !v),
            "aria-label": t("recallHistory"),
            children: "\u{1F558}"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-primary", style: style.primary, disabled: !canSearch, onClick: () => props.onSearch(props.searchQuery), children: [
        "\u26A1",
        t("searchButton")
      ] }),
      hasHistory && historyOpen && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 40, maxHeight: 220, overflowY: "auto", background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 10px 32px rgba(0,0,0,0.18)", padding: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 11, color: C.muted }, children: t("recallHistory") }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: { border: "none", background: "transparent", color: C.danger, cursor: "pointer", fontSize: 11 }, onClick: props.onClearHistory, children: t("recallHistoryClear") })
        ] }),
        props.history.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "kb-row", style: { display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 7, cursor: "pointer" }, onClick: () => {
          props.onReplay(entry.query);
          setHistoryOpen(false);
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
            "\u{1F558} ",
            entry.query
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "button",
            {
              style: { border: "none", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 },
              "aria-label": t("recallHistoryRemove"),
              onClick: (e) => {
                e.stopPropagation();
                props.onRemoveHistory(entry.id);
              },
              children: "\u2715"
            }
          )
        ] }, entry.id))
      ] })
    ] }),
    props.busy ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.empty, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: style.spinner }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("recallSearching") })
    ] }) : props.searchMeta === null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...style.empty, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: C.text }, children: t("recallEmptyTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12 }, children: t("recallEmptyDesc") })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1, minHeight: 0, overflowY: "auto" }, className: "kb-scroll", children: [
      props.searchMeta.rerank?.status === "degraded" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { marginBottom: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #d9a441", background: "color-mix(in srgb, #d9a441 12%, transparent)", color: C.text, fontSize: 12, lineHeight: 1.5 }, children: [
        "\u26A0 ",
        props.searchMeta.rerank.error?.message ?? "Rerank unavailable; using the original retrieval order."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 12, fontSize: 12, color: C.muted, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
          "\u2728 ",
          props.hits.length,
          " ",
          t("recallResultsSuffix")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
          "\u23F1 ",
          props.searchMeta.elapsedMs,
          "ms"
        ] }),
        props.searchMeta.rerank?.status === "applied" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
          t("reranked"),
          " \xB7 ",
          props.searchMeta.rerank.elapsedMs ?? 0,
          "ms"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
          t("recallTopScore"),
          ": ",
          Math.round(topScore * 100),
          "%"
        ] })
      ] }),
      props.hits.map((hit, index) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RecallResultCard, { hit, index, t }, hit.chunkId))
    ] })
  ] });
}
function RecallResultCard(props) {
  const { hit, index, t } = props;
  const [expanded, setExpanded] = (0, import_react5.useState)(false);
  const [copied, setCopied] = (0, import_react5.useState)(false);
  const displayText = expanded && hit.contextWindow !== void 0 ? serializeContextWindow(hit.contextWindow) : hit.text;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citationMarkdown(hit, t));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2e3);
    } catch {
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, marginBottom: 8 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: C.surface2, color: C.muted, fontSize: 12, flexShrink: 0 }, children: index + 1 }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconBook, { size: 13, color: C.muted }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: hit.documentTitle }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { fontSize: 12, color: C.muted, flexShrink: 0 }, children: [
          "#",
          hit.index + 1
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { fontSize: 12, color: C.muted, width: 96, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }, children: [
        t("recallRelevance"),
        " ",
        Math.round(hit.score * 100),
        "%"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: { ...style.iconOnlyButton, width: 20, height: 20 }, "aria-label": t("recallCopy"), onClick: () => void copy(), children: copied ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconCheck, { size: 12, color: C.success }) : "\u29C9" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: { ...style.iconOnlyButton, width: 20, height: 20 }, "aria-label": t(expanded ? "recallCollapse" : "recallExpand"), onClick: () => setExpanded((v) => !v), children: expanded ? "\u25B4" : "\u25BE" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { padding: "0 10px 10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: {
        margin: 0,
        fontSize: 13,
        color: C.muted,
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        ...expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
      }, children: displayText }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SourceReferences, { documentId: hit.docId, spans: hit.sourceSpans, t })
    ] })
  ] });
}
function SidePanel(props) {
  const resizable = props.onResizeWidth !== void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.sidePanelScrim, onClick: props.onClose, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      style: { ...style.sidePanel, width: props.width ?? 460, flexDirection: "row" },
      onClick: (e) => e.stopPropagation(),
      children: [
        resizable && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "div",
          {
            className: "kb-sash",
            onMouseDown: props.onResizeWidth,
            style: {
              width: 8,
              cursor: "col-resize",
              flexShrink: 0,
              alignSelf: "stretch",
              position: "relative",
              zIndex: 6,
              borderRight: `1px solid ${C.border}`
            },
            title: "Drag to resize",
            "aria-label": "Drag to resize"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.sidePanelHeader, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 14, fontWeight: 600 }, children: props.title }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "kb-row", style: style.closeButton, onClick: props.onClose, "aria-label": "close", children: "\u2715" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.sidePanelBody, className: "kb-scroll", children: props.children })
        ] })
      ]
    }
  ) });
}
function StatChip(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: style.statChip, title: props.title, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.statValue, children: props.value }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: style.statLabel, children: props.label })
  ] });
}
function KnowledgeWorkspaceGate(props) {
  const [open, setOpen] = (0, import_react5.useState)(false);
  const ref = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current !== null && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const all = props.workspacePaths.length === 1 && props.workspacePaths[0] === "*";
  const none = props.workspacePaths.length === 0;
  const setAll = () => props.onChangeWorkspacePaths(["*"]);
  const togglePath = (path) => {
    const next = props.workspacePaths.filter((p) => p !== "*");
    props.onChangeWorkspacePaths(next.includes(path) ? next.filter((p) => p !== path) : [...next, path]);
  };
  const checked = (path) => all || !none && props.workspacePaths.includes(path);
  const label = all ? props.t("kbWorkspaceAll") : none ? props.t("kbWorkspaceNone") : `${props.workspacePaths.length} ${props.t("kbWorkspace")}`;
  const stale = props.workspacePaths.filter(
    (path) => path !== "*" && path !== props.currentPath && !props.workspaces.some((w) => w.path === path)
  );
  const rule = { height: 1, background: C.border, margin: "5px 0" };
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 8px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13
  };
  const pathText = {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  };
  const groupLabel = {
    fontSize: 10,
    color: C.muted,
    padding: "2px 8px 4px",
    letterSpacing: 0.4
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { ref, style: { position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      "button",
      {
        className: "kb-row",
        onClick: () => setOpen((v) => !v),
        title: props.t("kbWorkspaceHint"),
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12,
          fontWeight: 600,
          // Red when the list is empty (nothing may invoke knowledge), green as
          // soon as at least one workspace is open. The dot mirrors the same state.
          color: none ? C.danger : C.success,
          border: `1px solid ${none ? C.danger : C.success}`,
          borderRadius: 999,
          padding: "3px 10px",
          background: none ? "transparent" : "color-mix(in srgb, var(--dsw-alias-state-success-primary, #30a46c) 12%, transparent)",
          cursor: "pointer"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: {
            width: 8,
            height: 8,
            borderRadius: 999,
            background: none ? C.danger : C.success
          } }),
          props.t("kbWorkspace"),
          " \xB7 ",
          label
        ]
      }
    ),
    open && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: {
      position: "absolute",
      top: "calc(100% + 6px)",
      right: 0,
      zIndex: 300,
      minWidth: 300,
      maxWidth: 440,
      maxHeight: 360,
      overflowY: "auto",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
      padding: 6
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 11, color: C.muted, padding: "4px 8px", lineHeight: 1.5 }, children: props.t("kbWorkspaceHint") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "kb-row", style: rowStyle, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: all, onChange: () => all ? togglePath("*") : setAll() }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { ...pathText, fontWeight: 600 }, children: props.t("kbWorkspaceAll") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: rule }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: groupLabel, children: props.t("kbWorkspaceCurrent") }),
      props.currentPath !== null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "kb-row", style: rowStyle, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: checked(props.currentPath), onChange: () => togglePath(props.currentPath) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: pathText, title: props.currentPath, children: props.currentPath }),
        !checked(props.currentPath) && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 11, color: C.muted, flexShrink: 0 }, children: props.t("kbWorkspaceOff") })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 11, color: C.muted, padding: "2px 8px 4px" }, children: "\u2014" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: rule }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: groupLabel, children: props.t("kbWorkspace") }),
      props.workspaces.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 11, color: C.muted, padding: "2px 8px 4px" }, children: "\u2014" }),
      props.workspaces.map((w) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "kb-row", style: rowStyle, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: checked(w.path), onChange: () => togglePath(w.path) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: pathText, title: w.path, children: [
          w.title,
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { color: C.muted, fontSize: 11 }, children: [
            " \xB7 ",
            w.path
          ] })
        ] })
      ] }, w.path)),
      stale.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: rule }),
        stale.map((path) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "kb-row", style: rowStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: true, onChange: () => togglePath(path) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: pathText, title: path, children: path }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 11, color: C.muted, flexShrink: 0 }, children: props.t("kbWorkspaceOff") })
        ] }, path))
      ] })
    ] })
  ] });
}
function Checkbox(props) {
  const active = props.checked || props.indeterminate === true;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "button",
    {
      type: "button",
      role: "checkbox",
      "aria-checked": props.indeterminate === true ? "mixed" : props.checked,
      "aria-label": props.ariaLabel,
      style: { ...style.checkbox, ...active ? style.checkboxOn : {} },
      onClick: (e) => {
        e.stopPropagation();
        props.onChange(!props.checked);
      },
      children: props.indeterminate === true ? "\u2013" : props.checked ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconCheck, { size: 10 }) : null
    }
  );
}
function DocumentDetailPanel(props) {
  const { doc, t } = props;
  const [mode, setMode] = (0, import_react5.useState)(props.initialMode);
  const [pageIndex, setPageIndex] = (0, import_react5.useState)(0);
  const showPage = (index) => {
    setPageIndex(index);
    setMode("preview");
  };
  const [chunkExpansion, setChunkExpansion] = (0, import_react5.useState)(collapsedChunkExpansion);
  const chunkIds = (0, import_react5.useMemo)(() => props.chunks.map((chunk) => chunk.id), [props.chunks]);
  const anyChunkExpanded = chunkExpansion.allExpanded || chunkExpansion.expandedChunkIds.size > 0;
  const visual = doc.sourceType === "url" ? { color: "#10b981", icon: fileVisual("page").icon } : fileVisual(doc.fileName ?? "text.txt");
  const DocIcon = visual.icon;
  const chunksTruncated = props.chunks.length < doc.chunkCount;
  const isPdfPreview = doc.sourceType === "file" && (doc.fileName ?? "").toLowerCase().endsWith(".pdf");
  const [pdfUrl, setPdfUrl] = (0, import_react5.useState)(null);
  const [pdfPreviewError, setPdfPreviewError] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    if (!isPdfPreview || mode !== "preview") return;
    let disposed = false;
    let objectUrl = null;
    setPdfUrl(null);
    setPdfPreviewError(null);
    void fetch(`/knowledge/documents/${doc.id}/raw`, { signal: AbortSignal.timeout(3e4) }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (blob.size > PDF_PREVIEW_MAX_BYTES) {
        setPdfPreviewError(t("pdfTooLarge"));
        return;
      }
      if (disposed) return;
      objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
    }).catch((error) => {
      if (!disposed) setPdfPreviewError(error instanceof Error ? error.message : String(error));
    });
    return () => {
      disposed = true;
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id, isPdfPreview, mode, t]);
  const tabStyle = (active) => ({
    border: "none",
    background: active ? accentSoftText() : "transparent",
    color: active ? C.accent : C.muted,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 6
  });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.card, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-row", style: style.button, onClick: props.onBack, children: [
        "\u2190 ",
        t("back")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: docIconStyle(visual.color), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(DocIcon, { size: 16, color: visual.color }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { ...style.docTitle, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: doc.title }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: style.docMeta, children: [
          doc.chunkCount,
          t("chunkCount"),
          " \xB7 ",
          formatSize(doc.charCount)
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", gap: 2, background: C.surface2, borderRadius: 8, padding: 2, flexShrink: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "kb-row", style: tabStyle(mode === "preview"), onClick: () => setMode("preview"), children: t("preview") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "kb-row", style: tabStyle(mode === "chunks"), onClick: () => setMode("chunks"), children: [
          t("chunks"),
          " (",
          doc.chunkCount,
          ")"
        ] }),
        doc.processing ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "kb-row", style: tabStyle(mode === "evidence"), onClick: () => setMode("evidence"), children: t("evidence") }) : null
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ProcessingSummary, { processing: doc.processing, t }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "kb-scroll", style: { maxHeight: "calc(100vh - 250px)", overflowY: "auto" }, children: mode === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(EvidenceInspector, { api: props.api, documentId: doc.id, revision: doc.processing?.revision, t, onPage: showPage }, `${doc.id}-${doc.processing?.revision}`) : mode === "preview" ? isPdfPreview ? pdfPreviewError !== null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: style.empty, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: C.danger, marginBottom: 6 }, children: t("pdfPreviewFailed") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: C.muted, wordBreak: "break-all" }, children: pdfPreviewError })
    ] }) : pdfUrl === null ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "kb-spinner", style: { ...style.spinner, width: 22, height: 22, borderWidth: 3 } }) }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "iframe",
      {
        src: `${pdfUrl}#page=${pageIndex + 1}`,
        title: doc.title,
        style: {
          width: "100%",
          height: "calc(100vh - 320px)",
          minHeight: 420,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          background: "#fff"
        }
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
      props.rawTextTruncated && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { ...style.warningHint, marginBottom: 8 }, children: t("previewTruncated").replace("{count}", String(PREVIEW_RAW_TEXT_LIMIT)) }),
      props.rawText === null || props.rawText === "" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.empty, children: t("noDocsHint") }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("pre", { style: { whiteSpace: "pre-wrap", fontSize: 12, margin: 0, color: C.text, lineHeight: 1.6, wordBreak: "break-word", fontFamily: "inherit" }, children: props.rawText })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
      chunksTruncated && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { ...style.warningHint, marginBottom: 8 }, children: t("chunksTruncated").replace("{loaded}", String(props.chunks.length)).replace("{total}", String(doc.chunkCount)) }),
      props.chunks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            className: "kb-row",
            style: { ...style.button, padding: "4px 8px", fontSize: 11, ...chunkExpansion.allExpanded ? { opacity: 0.5, cursor: "default" } : {} },
            disabled: chunkExpansion.allExpanded,
            onClick: () => setChunkExpansion(expandAllChunks()),
            children: t("chunksExpandAll")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            className: "kb-row",
            style: { ...style.button, padding: "4px 8px", fontSize: 11, ...!anyChunkExpanded ? { opacity: 0.5, cursor: "default" } : {} },
            disabled: !anyChunkExpanded,
            onClick: () => setChunkExpansion(collapseAllChunks()),
            children: t("chunksCollapseAll")
          }
        )
      ] }),
      props.chunks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: style.empty, children: t("lexicalOnly") }) : props.chunks.map((chunk) => {
        const expanded = isChunkExpanded(chunkExpansion, chunk.id);
        const bodyId = chunkPreviewBodyId(doc.id, chunk.id);
        const toggleLabel = t(expanded ? "chunkCollapse" : "chunkExpand");
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, background: C.surface }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: `1px solid ${C.border}` }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 5, background: C.accent, color: "var(--dsw-alias-label-primary-foreground, #fff)", fontSize: 11, fontWeight: 600 }, children: chunk.index + 1 }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { flex: 1, minWidth: 0, fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: chunk.heading !== void 0 ? chunk.heading : "" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { fontSize: 11, color: C.muted, flexShrink: 0 }, children: [
              estimateTokens(chunk.text),
              " tokens"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "button",
              {
                type: "button",
                className: "kb-iconbtn",
                style: { ...style.iconOnlyButton, width: 22, height: 22, flexShrink: 0 },
                "aria-label": toggleLabel,
                title: toggleLabel,
                "aria-expanded": expanded,
                "aria-controls": bodyId,
                onClick: () => setChunkExpansion((current) => toggleChunkExpansion(current, chunkIds, chunk.id)),
                children: expanded ? "\u25B4" : "\u25BE"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { id: bodyId, style: {
            margin: 0,
            padding: "8px 10px",
            fontSize: 13,
            color: C.muted,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            ...expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
          }, children: chunk.text }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { padding: "0 10px 8px" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SourceReferences, { documentId: doc.id, spans: chunk.sourceSpans, t, revision: doc.processing?.revision, onPage: isPdfPreview ? showPage : void 0 }) })
        ] }, chunk.id);
      }),
      chunksTruncated && props.chunks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", justifyContent: "center", padding: "4px 0 10px" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "kb-row", style: style.button, onClick: props.onLoadMoreChunks, children: t("loadMoreChunks") }) })
    ] }) })
  ] });
}
function citationMarkdown(hit, t) {
  const quote = hit.text.split("\n").map((line) => `> ${line}`).join("\n");
  const source = hit.heading !== void 0 && hit.heading.length > 0 ? `${hit.documentTitle} / ${hit.heading}` : hit.documentTitle;
  return `${quote}
>
> \u2014 ${source}${t("citationSource").replace("{id}", hit.baseId)}`;
}
function estimateTokens(text) {
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? []).length;
  const latin = text.length - cjk;
  return Math.max(1, Math.ceil(cjk / 1.5 + latin / 4));
}

// src/ui/client/LocalModelsSection.tsx
var import_react7 = require("react");

// src/ui/client/MineruDeploymentSection.tsx
var import_react6 = require("react");
var import_jsx_runtime7 = require("react/jsx-runtime");
var DRAFT_KEY = "dsh-knowledge:mineru-deployment-draft:v1";
var DEFAULT_PYTHON_INDEX = "https://pypi.org/simple";
function readDraft() {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? "{}");
    return value && typeof value === "object" ? {
      root: typeof value.root === "string" ? value.root.slice(0, 4096) : void 0,
      existing: typeof value.existing === "string" ? value.existing.slice(0, 4096) : void 0,
      python: typeof value.python === "string" ? value.python.slice(0, 4096) : void 0,
      manualPython: typeof value.manualPython === "string" ? value.manualPython.slice(0, 4096) : void 0
    } : {};
  } catch {
    return {};
  }
}
function saveDraft(draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
  }
}
function capacity(bytes) {
  return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
}
var phases = { absent: "mineruPhaseAbsent", preparing_environment: "mineruPhaseEnvironment", downloading: "stageDownloading", probing: "mineruPhaseProbe", ready: "mineruPhaseReady", failed: "stageFailed", canceled: "stageCanceled", interrupted: "mineruPhaseInterrupted" };
var pythonReasons = {
  probe_failed: "pythonReasonProbe",
  version_unsupported: "pythonReasonVersion",
  implementation_unsupported: "pythonReasonImplementation",
  architecture_unsupported: "pythonReasonArchitecture",
  prerelease: "pythonReasonPrerelease",
  free_threaded: "pythonReasonThreaded",
  venv_missing: "pythonReasonVenv",
  ensurepip_missing: "pythonReasonPip"
};
function MineruDeploymentSection({ api, t, pickDirectory }) {
  const id = (0, import_react6.useId)();
  const initial = (0, import_react6.useRef)(readDraft()).current;
  const [root, setRoot] = (0, import_react6.useState)(initial.root ?? "");
  const [existing, setExisting] = (0, import_react6.useState)(initial.existing ?? "");
  const [python, setPython] = (0, import_react6.useState)(initial.python ?? "");
  const [pythonIndexUrl, setPythonIndexUrl] = (0, import_react6.useState)(DEFAULT_PYTHON_INDEX);
  const [pythonIndexSaved, setPythonIndexSaved] = (0, import_react6.useState)(false);
  const [manualPython, setManualPython] = (0, import_react6.useState)(initial.manualPython ?? initial.python ?? "");
  const [pythonVerified, setPythonVerified] = (0, import_react6.useState)(false);
  const [discovery, setDiscovery] = (0, import_react6.useState)(null);
  const [busy, setBusy] = (0, import_react6.useState)(false);
  const [plan, setPlan] = (0, import_react6.useState)(null);
  const [error, setError] = (0, import_react6.useState)(null);
  const [statusError, setStatusError] = (0, import_react6.useState)(null);
  const [status, setStatus] = (0, import_react6.useState)(null);
  const [confirming, setConfirming] = (0, import_react6.useState)(false);
  const [applied, setApplied] = (0, import_react6.useState)(false);
  const dialog = (0, import_react6.useRef)(null);
  const pending = (0, import_react6.useRef)(false);
  const mounted = (0, import_react6.useRef)(true);
  const statusRevision = (0, import_react6.useRef)(0);
  (0, import_react6.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  (0, import_react6.useEffect)(() => {
    saveDraft({ root, existing, python, manualPython });
  }, [root, existing, python, manualPython]);
  (0, import_react6.useEffect)(() => {
    let canceled = false;
    let timer;
    async function poll() {
      let fastPoll = false;
      const revision = statusRevision.current;
      try {
        const next = await api.mineruDeploymentStatus();
        fastPoll = next.active || next.service === "starting" || next.service === "stopping";
        if (!canceled && revision === statusRevision.current) {
          setStatus(next);
          setStatusError(null);
        }
      } catch (reason) {
        if (!canceled && revision === statusRevision.current) setStatusError(reason instanceof Error ? reason.message : String(reason));
      }
      if (!canceled) timer = setTimeout(() => void poll(), fastPoll ? 1200 : 8e3);
    }
    void poll();
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [api]);
  (0, import_react6.useEffect)(() => {
    let canceled = false;
    void api.getConfig().then((config) => {
      if (!canceled) {
        setPythonIndexUrl(config.mineruPythonIndexUrl || DEFAULT_PYTHON_INDEX);
        setPythonIndexSaved(true);
      }
    }).catch(() => {
      if (!canceled) setPythonIndexSaved(false);
    });
    return () => {
      canceled = true;
    };
  }, [api]);
  (0, import_react6.useEffect)(() => {
    if (confirming) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirming]);
  const locked = busy || status?.active === true || status?.service === "running";
  function invalidatePlan() {
    setPlan(null);
    setError(null);
  }
  async function action(operation) {
    if (pending.current) return;
    statusRevision.current++;
    pending.current = true;
    setBusy(true);
    setError(null);
    setConfirming(false);
    try {
      if (operation === "use") {
        await api.useManagedMineru();
        if (mounted.current) setApplied(true);
      } else {
        const next = operation === "prepare" ? await api.prepareMineruDeployment(plan.id) : await api.mineruDeploymentAction(operation);
        if (mounted.current) {
          statusRevision.current++;
          setStatus(next);
          if (operation === "prepare") setPlan(null);
        }
      }
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      statusRevision.current++;
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function check() {
    if (pending.current || !python || !pythonVerified || !pythonIndexSaved) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    setPlan(null);
    try {
      const next = await api.planMineruDeployment(root, existing.trim() || void 0, python);
      if (mounted.current) setPlan(next);
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function savePythonSource() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    invalidatePlan();
    try {
      const config = await api.setConfig({ mineruPythonIndexUrl: pythonIndexUrl.trim() || DEFAULT_PYTHON_INDEX });
      if (mounted.current) {
        setPythonIndexUrl(config.mineruPythonIndexUrl || DEFAULT_PYTHON_INDEX);
        setPythonIndexSaved(true);
      }
    } catch (reason) {
      if (mounted.current) {
        setPythonIndexSaved(false);
        setError(reason instanceof Error ? reason.message : String(reason));
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function browse(set) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const path = await pickDirectory?.();
      if (path && mounted.current) {
        set(path);
        invalidatePlan();
      }
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function detect(executable) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    invalidatePlan();
    try {
      const next = await api.detectMineruPython(executable);
      if (mounted.current) {
        setDiscovery(next);
        const chosen = executable ? next.environments[0] : next.environments.find((item) => item.executable === python) ?? (!python ? next.environments.find((item) => item.eligible) : void 0);
        if (executable && chosen) {
          setPython(chosen.executable);
          setManualPython(executable);
          setPythonVerified(chosen.eligible);
        } else if (chosen?.eligible) {
          setPython(chosen.executable);
          setManualPython(chosen.executable);
          setPythonVerified(true);
        } else setPythonVerified(false);
      }
    } catch (reason) {
      if (mounted.current) {
        setPythonVerified(false);
        setError(reason instanceof Error ? reason.message : String(reason));
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const selectPython = (path) => {
    setPython(path);
    setManualPython(path);
    setPythonVerified(discovery?.environments.some((item) => item.executable === path && item.eligible) ?? false);
    invalidatePlan();
  };
  const setDraftPath = (setter) => (value) => {
    setter(value);
    invalidatePlan();
  };
  const validationLabels = [
    ["interpreter", "pythonStepInterpreter"],
    ["environment", "pythonStepEnvironment"],
    ["dependencies", "pythonStepDependencies"],
    ["inference", "pythonStepInference"]
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { "aria-labelledby": `${id}-title`, style: { padding: 18, marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 14, background: C.surface }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { id: `${id}-title`, style: { fontSize: 16, margin: "0 0 6px", color: C.text }, children: t("mineruDeployTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0, maxWidth: 720 }, children: t("mineruDeployDescription") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { fontSize: 12, fontWeight: 600, color: C.accent, border: `1px solid ${C.border}`, borderRadius: 999, padding: "5px 10px", whiteSpace: "nowrap", background: C.surface2 }, children: "Basic \xB7 ONNX" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, minWidth: 0, background: C.surface2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { "aria-hidden": "true", style: { display: "inline-grid", placeItems: "center", width: 24, height: 24, borderRadius: 999, background: accentSoft, color: C.accent }, children: "1" }),
          t("pythonChoose")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("select", { "aria-label": t("pythonChoose"), style: { ...style.input, width: "100%", marginBottom: 8 }, value: python, disabled: locked, onChange: (event) => selectPython(event.target.value), children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "", children: t("pythonChoose") }),
          python && !discovery?.environments.some((item) => item.executable === python) ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("option", { value: python, children: [
            t("pythonRemembered"),
            " \xB7 ",
            python
          ] }) : null,
          discovery?.environments.map((env) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("option", { value: env.executable, disabled: !env.eligible, children: [
            env.version ?? "?",
            " \xB7 ",
            env.bits ?? "?",
            " bit \xB7 ",
            env.executable
          ] }, env.executable))
        ] }),
        python ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontSize: 12, overflowWrap: "anywhere", color: C.muted, marginBottom: 8, lineHeight: 1.55 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { children: python }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
          pythonVerified ? t("pythonEligible") : t("pythonRefreshHint")
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "kb-btn", style: style.button, disabled: locked, onClick: () => void detect(), children: t("pythonDetect") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: locked || !python, onClick: () => void detect(python), children: t("pythonVerify") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("details", { style: { marginTop: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("summary", { style: { cursor: "pointer", fontSize: 13, padding: "5px 0" }, children: t("pythonPath") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { color: C.muted, fontSize: 12, lineHeight: 1.55 }, children: t("pythonManualHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { "aria-label": t("pythonPath"), style: { ...style.input, width: "100%", boxSizing: "border-box", marginBottom: 8 }, value: manualPython, disabled: locked, onChange: (event) => {
            const value = event.target.value;
            setManualPython(value);
            setPython(value);
            setPythonVerified(false);
            invalidatePlan();
          } }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: locked || !manualPython.trim(), onClick: () => void detect(manualPython.trim()), children: t("pythonVerify") })
        ] }),
        discovery?.environments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "status", style: { fontSize: 12, color: C.muted }, children: t("pythonMissing") }) : null,
        discovery?.truncated ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "status", style: { fontSize: 12, color: C.muted }, children: t("pythonLimited") }) : null,
        discovery?.environments.some((item) => !item.eligible) ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("details", { style: { marginTop: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("summary", { style: { cursor: "pointer", fontSize: 12, color: C.muted, padding: "5px 0" }, children: t("pythonOtherDetected") }),
          discovery.environments.filter((item) => !item.eligible).map((env) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontSize: 11, overflowWrap: "anywhere", paddingTop: 6 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { children: env.executable }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
            env.version ?? "?",
            " \xB7 ",
            t(pythonReasons[env.reason])
          ] }, env.executable))
        ] }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, minWidth: 0, background: C.surface2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { "aria-hidden": "true", style: { display: "inline-grid", placeItems: "center", width: 24, height: 24, borderRadius: 999, background: accentSoft, color: C.accent }, children: "2" }),
          t("mineruDeployRoot")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { htmlFor: `${id}-root`, style: { display: "block", fontSize: 12, color: C.muted, marginBottom: 5 }, children: t("mineruDeployRoot") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { id: `${id}-root`, value: root, disabled: locked, style: { ...style.input, flex: 1, minWidth: 0 }, onChange: (event) => setDraftPath(setRoot)(event.target.value) }),
          pickDirectory ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "kb-btn", style: style.button, disabled: locked, onClick: () => void browse(setDraftPath(setRoot)), children: t("mineruDeployBrowse") }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("details", { style: { marginTop: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("summary", { style: { cursor: "pointer", fontSize: 13, padding: "8px 0 5px" }, children: t("mineruDeployExisting") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 12, color: C.muted, lineHeight: 1.55 }, children: t("mineruExternalCopy") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { "aria-label": t("mineruDeployExisting"), value: existing, disabled: locked, style: { ...style.input, flex: 1, minWidth: 0 }, onChange: (event) => {
              setExisting(event.target.value);
              invalidatePlan();
            } }),
            pickDirectory ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "kb-btn", style: style.button, disabled: locked, onClick: () => void browse(setDraftPath(setExisting)), children: t("mineruDeployBrowse") }) : null
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { htmlFor: `${id}-python-index`, style: { display: "block", fontSize: 12, color: C.muted, marginBottom: 5 }, children: t("mineruPythonSource") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 12, lineHeight: 1.55, color: C.muted, margin: "0 0 8px" }, children: t("mineruPythonSourceHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { id: `${id}-python-index`, value: pythonIndexUrl, disabled: locked || busy, style: { ...style.input, flex: "1 1 220px", minWidth: 0 }, onChange: (event) => {
              setPythonIndexUrl(event.target.value);
              setPythonIndexSaved(false);
              invalidatePlan();
            } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: locked || busy || pythonIndexSaved, onClick: () => void savePythonSource(), children: t("mineruSaveSource") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "kb-btn", style: style.button, disabled: locked || !root.trim() || !python || !pythonVerified || !pythonIndexSaved, onClick: () => void check(), children: t("mineruDeployCheck") }),
      busy ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { role: "status", style: { color: C.muted, fontSize: 12 }, children: t("mineruDeployChecking") }) : null
    ] }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "alert", style: style.warningHint, children: error }) : null,
    statusError ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "status", style: style.warningHint, children: statusError }) : null,
    discovery?.environments.some((item) => item.eligible) ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("details", { style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("summary", { style: { cursor: "pointer", fontSize: 12, color: C.muted, padding: "5px 0" }, children: t("pythonDetectedDetails") }),
      discovery.environments.filter((item) => item.eligible).map((env) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontSize: 11, overflowWrap: "anywhere", paddingTop: 6 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { children: env.executable }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
        t("pythonVersion"),
        " ",
        env.version,
        " \xB7 ",
        t("pythonArchitecture"),
        " ",
        env.architecture,
        " \xB7 ",
        t("pythonSource"),
        " ",
        env.source
      ] }, env.executable))
    ] }) : null,
    status ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { "aria-live": "polite", style: { fontSize: 12, lineHeight: 1.7, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontWeight: 600 }, children: [
        t(phases[status.phase]),
        " \xB7 ",
        t(status.service === "running" ? "mineruServiceRunning" : status.service === "starting" ? "mineruServiceStarting" : status.service === "stopping" ? "mineruServiceStopping" : status.service === "error" ? "mineruServiceError" : "mineruServiceStopped")
      ] }),
      status.root ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { color: C.muted, overflowWrap: "anywhere" }, children: [
        t("mineruCurrentInstall"),
        ": ",
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { children: status.root })
      ] }) : null,
      status.totalBytes && status.completedBytes !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("progress", { max: status.totalBytes, value: status.completedBytes, style: { width: "100%" } }),
        capacity(status.completedBytes),
        " / ",
        capacity(status.totalBytes)
      ] }) : null,
      status.validation ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6, marginTop: 8 }, children: validationLabels.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { color: status.validation?.[key] ? C.success : C.muted }, children: [
        status.validation?.[key] ? "\u2713" : "\u25CB",
        " ",
        t(label)
      ] }, key)) }) : null,
      status.error ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { role: "alert", style: style.warningHint, children: [
        status.error.code,
        ": ",
        status.error.message
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }, children: [
        status.active ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: busy, onClick: () => void action("cancel"), children: t("mineruCancelTask") }) : null,
        !status.active && status.phase === "ready" && status.service !== "running" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: busy, onClick: () => void action("start"), children: t("mineruStart") }) : null,
        status.service === "running" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: busy, onClick: () => void action("stop"), children: t("mineruStop") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", style: style.button, disabled: busy, onClick: () => void action("use"), children: t("mineruUse") })
        ] }) : null
      ] }),
      applied ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "status", children: t("mineruApplied") }) : null
    ] }) : null,
    plan ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { "aria-live": "polite", style: { marginTop: 14, padding: 12, border: `1px solid ${C.border}`, borderRadius: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { style: { fontSize: 13, margin: "0 0 10px" }, children: t("mineruDeployCheck") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("dl", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, fontSize: 12, margin: 0 }, children: [["mineruDeployTotal", plan.capacity.totalBytes], ["mineruDeployReuse", plan.capacity.verifiedReusableBytes], ["mineruDeployRemaining", plan.capacity.downloadBytes]].map(([label, bytes]) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("dt", { style: { color: C.muted }, children: t(label) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("dd", { style: { margin: "4px 0", fontWeight: 600 }, children: capacity(bytes) })
      ] }, label)) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { style: { color: C.muted, fontSize: 11, overflowWrap: "anywhere" }, children: [
        plan.modelRepo,
        " \xB7 ",
        plan.modelRevision.slice(0, 12),
        " \xB7 ",
        plan.metadataDate,
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
        t("mineruDownloadSource"),
        ": ",
        plan.modelEndpoint
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: style.warningHint, children: t("mineruDeployUnknownRuntime") }),
      plan.blockers.map((code) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "alert", style: style.warningHint, children: code === "external_models_incomplete" ? t("mineruDeployIncomplete") : code === "insufficient_model_space" ? t("mineruDeploySpace") : code }, code)),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "kb-btn", style: style.button, disabled: locked || plan.blockers.length > 0, onClick: () => setConfirming(true), children: t("mineruPrepare") })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 11, lineHeight: 1.55, color: C.muted, margin: "12px 0 0" }, children: t("mineruManagedPreview") }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("dialog", { ref: dialog, onCancel: () => setConfirming(false), onClose: () => setConfirming(false), "aria-labelledby": `${id}-confirmation`, style: { maxWidth: 520, width: "calc(100% - 48px)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, background: C.surface }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { id: `${id}-confirmation`, children: t("mineruPrepare") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 12, lineHeight: 1.7 }, children: t("mineruConfirmPreparation") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { style: { overflowWrap: "anywhere", fontSize: 12 }, children: [
        plan?.root,
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
        "MinerU ",
        plan?.runtimeVersion,
        " \xB7 Basic / ONNX",
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
        plan?.pythonIndexUrl,
        " \xB7 ",
        plan?.modelEndpoint,
        " \xB7 ",
        capacity(plan?.capacity.downloadBytes ?? 0)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 12 }, children: t("mineruDeployUnknownRuntime") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { style: { overflowWrap: "anywhere", fontSize: 12 }, children: [
        "Python ",
        plan?.python?.version,
        " \xB7 ",
        plan?.python?.bits,
        " bit",
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
        plan?.python?.executable
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", autoFocus: true, style: style.button, onClick: () => setConfirming(false), children: t("mineruNotNow") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "kb-btn", style: style.button, disabled: busy || !plan, onClick: () => void action("prepare"), children: t("mineruConfirm") })
      ] })
    ] })
  ] });
}

// src/ui/client/LocalModelsSection.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function LocalModelsSection(props) {
  const { api, t, directoryActions } = props;
  const [models, setModels] = (0, import_react7.useState)(null);
  const [error, setError] = (0, import_react7.useState)(null);
  const [notice, setNotice] = (0, import_react7.useState)(null);
  const [pollError, setPollError] = (0, import_react7.useState)(null);
  const [busyId, setBusyId] = (0, import_react7.useState)(null);
  const [customRerankerId, setCustomRerankerId] = (0, import_react7.useState)("");
  const [customRerankerAccepted, setCustomRerankerAccepted] = (0, import_react7.useState)(false);
  const [mirror, setMirror] = (0, import_react7.useState)("");
  const [mirrorLoaded, setMirrorLoaded] = (0, import_react7.useState)(false);
  const [cacheDir, setCacheDir] = (0, import_react7.useState)("");
  const [workerIdleTimeoutMs, setWorkerIdleTimeoutMs] = (0, import_react7.useState)(6e4);
  const [ocrStatus, setOcrStatus] = (0, import_react7.useState)({ status: "idle", progress: 0, message: "" });
  const [ocrBusy, setOcrBusy] = (0, import_react7.useState)(false);
  const [ollamaBase, setOllamaBase] = (0, import_react7.useState)("http://127.0.0.1:11434");
  const [ollamaModel, setOllamaModel] = (0, import_react7.useState)("");
  const [ollamaInstalled, setOllamaInstalled] = (0, import_react7.useState)([]);
  const [pullingModels, setPullingModels] = (0, import_react7.useState)([]);
  const [ollamaBusy, setOllamaBusy] = (0, import_react7.useState)(false);
  const [ollamaSuggestions, setOllamaSuggestions] = (0, import_react7.useState)({ ollamaEmbedding: [], ollamaVision: [] });
  const refresh = (0, import_react7.useCallback)(async () => {
    try {
      const [next, ocr] = await Promise.all([api.listLocalModels(), api.getOcrStatus()]);
      setModels(next);
      setOcrStatus(ocr);
      setPollError(null);
    } catch (err) {
      setPollError(err instanceof Error ? err.message : String(err));
    }
  }, [api]);
  (0, import_react7.useEffect)(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 1e3);
    return () => window.clearInterval(timer);
  }, [refresh]);
  (0, import_react7.useEffect)(() => {
    void api.getConfig().then((config) => {
      setMirror(config.hfEndpoint);
      setCacheDir(config.localModelCacheDir);
      setWorkerIdleTimeoutMs(config.localWorkerIdleTimeoutMs);
      setMirrorLoaded(true);
    }).catch(() => {
      setMirrorLoaded(true);
    });
  }, [api]);
  (0, import_react7.useEffect)(() => {
    void api.getModelSuggestions().then((suggestions) => {
      setOllamaSuggestions({
        ollamaEmbedding: suggestions.ollamaEmbedding ?? [],
        ollamaVision: suggestions.ollamaVision ?? []
      });
    }).catch(() => {
    });
  }, [api]);
  const saveMirror = (0, import_react7.useCallback)(async () => {
    setError(null);
    try {
      await api.setConfig({ hfEndpoint: mirror.trim() });
      setMirror(mirror.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [api, mirror]);
  const saveCacheDir = (0, import_react7.useCallback)(async () => {
    setError(null);
    setNotice(null);
    try {
      await api.setConfig({ localModelCacheDir: cacheDir.trim() });
      setCacheDir(cacheDir.trim());
      setNotice(t("cacheDirSaved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [api, cacheDir, t]);
  const saveWorkerIdleTimeout = (0, import_react7.useCallback)(async () => {
    setError(null);
    try {
      const config = await api.setConfig({ localWorkerIdleTimeoutMs: workerIdleTimeoutMs });
      setWorkerIdleTimeoutMs(config.localWorkerIdleTimeoutMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [api, workerIdleTimeoutMs]);
  const browseCacheDir = (0, import_react7.useCallback)(async () => {
    setError(null);
    setNotice(null);
    if (typeof directoryActions?.pickDirectory !== "function") {
      setNotice(t("cacheDirPickUnavailable"));
      return;
    }
    try {
      const picked = await directoryActions.pickDirectory();
      if (picked !== null) setCacheDir(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [directoryActions, t]);
  const openCacheDir = (0, import_react7.useCallback)(async () => {
    setError(null);
    setNotice(null);
    if (typeof directoryActions?.openPath !== "function") {
      setNotice(t("cacheDirOpenUnavailable"));
      return;
    }
    try {
      if (typeof directoryActions.canOpenPath === "function" && !await directoryActions.canOpenPath()) {
        setNotice(t("cacheDirOpenUnavailable"));
        return;
      }
      const { path } = await api.prepareLocalModelCacheDirectory(cacheDir.trim());
      await directoryActions.openPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [directoryActions, api, cacheDir, t]);
  const [migrating, setMigrating] = (0, import_react7.useState)(false);
  const migrateCacheDir = (0, import_react7.useCallback)(async () => {
    setMigrating(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api.migrateLocalModels(cacheDir.trim());
      setCacheDir(result.to);
      if (result.moved > 0) {
        setNotice(t("cacheDirMigrated").replace("{count}", String(result.moved)).replace("{to}", result.to));
      } else {
        setNotice(t("cacheDirMigrateNone"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setMigrating(false);
    }
  }, [api, cacheDir, t]);
  const refreshOllamaTags = (0, import_react7.useCallback)(async () => {
    setOllamaBusy(true);
    setError(null);
    try {
      const { models: installed } = await api.listOllamaModels(ollamaBase);
      setOllamaInstalled(installed);
    } catch (err) {
      setError(`${err instanceof Error ? err.message : String(err)} ${t("ollamaNeedInstall")}`);
    } finally {
      setOllamaBusy(false);
    }
  }, [api, ollamaBase, t]);
  (0, import_react7.useEffect)(() => {
    if (pullingModels.length === 0) return;
    const timer = window.setInterval(() => {
      void (async () => {
        let finishedReady = false;
        const next = [];
        for (const pull of pullingModels) {
          const status = await api.getOllamaPullStatus(pull.model).catch(() => null);
          if (status === null) continue;
          if (status.status === "pulling" || status.status === "error") {
            next.push({ model: pull.model, ...status });
          } else if (status.status === "ready") {
            finishedReady = true;
          }
        }
        setPullingModels(next);
        if (finishedReady) void refreshOllamaTags();
      })();
    }, 1e3);
    return () => window.clearInterval(timer);
  }, [api, pullingModels, refreshOllamaTags]);
  (0, import_react7.useEffect)(() => {
    void refreshOllamaTags();
  }, [refreshOllamaTags]);
  (0, import_react7.useEffect)(() => {
    void api.listActiveOllamaPulls().then(({ pulls }) => {
      if (pulls.length > 0) setPullingModels(pulls);
    }).catch(() => {
    });
  }, [api]);
  const [pendingDelete, setPendingDelete] = (0, import_react7.useState)(null);
  const deleteOllama = (0, import_react7.useCallback)(async (model) => {
    if (pendingDelete !== model) {
      setPendingDelete(model);
      window.setTimeout(() => setPendingDelete((current) => current === model ? null : current), 3e3);
      return;
    }
    setPendingDelete(null);
    setOllamaBusy(true);
    setError(null);
    try {
      await api.deleteOllamaModel(model, ollamaBase);
      const { models: installed } = await api.listOllamaModels(ollamaBase);
      setOllamaInstalled(installed);
    } catch (err) {
      setError(`${err instanceof Error ? err.message : String(err)} ${t("ollamaNeedInstall")}`);
    } finally {
      setOllamaBusy(false);
    }
  }, [api, ollamaBase, pendingDelete, t]);
  const pullOllama = (0, import_react7.useCallback)(async () => {
    const model = ollamaModel.trim();
    if (model === "") return;
    setOllamaBusy(true);
    setError(null);
    try {
      await api.pullOllamaModel(model, ollamaBase);
      setPullingModels((prev) => prev.some((p) => p.model === model) ? prev : [...prev, { model, status: "pulling", progress: 0, message: "" }]);
      setOllamaBusy(false);
    } catch (err) {
      setError(`${err instanceof Error ? err.message : String(err)} ${t("ollamaNeedInstall")}`);
      setOllamaBusy(false);
    }
  }, [api, ollamaModel, ollamaBase, t]);
  const cancelOllama = (0, import_react7.useCallback)(async (model) => {
    try {
      await api.cancelOllamaPull(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setPullingModels((prev) => prev.filter((p) => p.model !== model));
    setOllamaBusy(false);
  }, [api]);
  const download = (0, import_react7.useCallback)(async (id) => {
    setBusyId(id);
    setError(null);
    try {
      await api.downloadLocalModel(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
      void refresh();
    }
  }, [api, refresh]);
  const cancel = (0, import_react7.useCallback)(async (id) => {
    setError(null);
    try {
      await api.cancelLocalModel(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      void refresh();
    }
  }, [api, refresh]);
  const remove = (0, import_react7.useCallback)(async (id) => {
    setBusyId(id);
    setError(null);
    try {
      await api.removeLocalModel(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }, [api, refresh]);
  const registerCustomReranker = (0, import_react7.useCallback)(async () => {
    const id = customRerankerId.trim();
    if (id === "") return;
    setBusyId(id);
    setError(null);
    try {
      await api.registerCustomLocalReranker(id);
      setCustomRerankerId("");
      setCustomRerankerAccepted(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }, [api, customRerankerId, refresh]);
  const selfTest = (0, import_react7.useCallback)(async (id) => {
    setBusyId(id);
    setError(null);
    try {
      await api.selfTestLocalModel(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }, [api, refresh]);
  const downloadOcr = (0, import_react7.useCallback)(async () => {
    setOcrBusy(true);
    setError(null);
    try {
      await api.downloadOcr();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setOcrBusy(false);
    }
  }, [api, refresh]);
  const removeOcr = (0, import_react7.useCallback)(async () => {
    setOcrBusy(true);
    setError(null);
    try {
      await api.removeOcr();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setOcrBusy(false);
    }
  }, [api, refresh]);
  const ocrReady = ocrStatus.status === "ready";
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { minWidth: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { style: { fontSize: 17, fontWeight: 650, color: C.text, margin: "0 0 6px" }, children: t("localModelsTitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 0, marginBottom: 16, fontSize: 13, color: C.muted, lineHeight: 1.65, maxWidth: 760 }, children: t("localModelsDesc") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MineruDeploymentSection, { api, t, pickDirectory: typeof directoryActions?.pickDirectory === "function" ? directoryActions.pickDirectory.bind(directoryActions) : void 0 }),
    mirrorLoaded && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginBottom: 14, padding: 16, border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { style: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }, children: t("hfMirror") }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            style: style.input,
            placeholder: "https://hf-mirror.com",
            value: mirror,
            onChange: (e) => setMirror(e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "kb-btn", style: style.button, onClick: () => void saveMirror(), children: t("hfMirrorSave") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.55 }, children: t("hfMirrorHint") })
    ] }),
    mirrorLoaded && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginBottom: 14, padding: 16, border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { style: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }, children: t("cacheDirTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            style: { ...style.input, flex: "1 1 260px", minWidth: 0 },
            placeholder: "C:\\\\Users\\\\you\\\\.dsh\\\\cache\\\\dsh-knowledge\\\\local-models",
            value: cacheDir,
            onChange: (e) => setCacheDir(e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { className: "kb-btn", style: style.button, onClick: () => void browseCacheDir(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconFolderSearch, { size: 13 }),
          " ",
          t("cacheDirBrowse")
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "kb-btn", style: style.button, onClick: () => void saveCacheDir(), children: t("hfMirrorSave") }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { className: "kb-btn", style: style.button, disabled: migrating, onClick: () => void migrateCacheDir(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconFolderInput, { size: 13 }),
          " ",
          t("cacheDirMigrate")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { className: "kb-btn", style: style.button, onClick: () => void openCacheDir(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconFolderOpen, { size: 13 }),
          " ",
          t("cacheDirOpen")
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.55 }, children: t("cacheDirHint") })
    ] }),
    mirrorLoaded && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginBottom: 14, padding: 16, border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { style: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }, children: t("localWorkerIdleTimeoutMs") }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            style: { ...style.input, flex: "1 1 240px", minWidth: 0 },
            type: "number",
            min: 0,
            max: 864e5,
            step: 6e4,
            value: workerIdleTimeoutMs,
            onChange: (e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) setWorkerIdleTimeoutMs(next);
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "kb-btn", style: style.button, onClick: () => void saveWorkerIdleTimeout(), children: t("hfMirrorSave") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.55 }, children: t("localWorkerIdleTimeoutMsHint") })
    ] }),
    notice !== null && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { ...style.error, color: C.success, background: "color-mix(in srgb, var(--dsw-alias-state-success-primary, #30a46c) 10%, transparent)", marginBottom: 12 }, children: notice }),
    error !== null && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { ...style.error, marginBottom: 12 }, children: error }),
    pollError !== null && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { ...style.error, marginBottom: 12 }, children: [
      t("statusPollFailed"),
      ": ",
      pollError
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginBottom: 16, padding: 16, border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { style: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }, children: t("customRerankTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            style: { ...style.input, flex: "1 1 260px", minWidth: 0 },
            placeholder: "owner/onnx-reranker-model",
            value: customRerankerId,
            onChange: (event) => setCustomRerankerId(event.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { className: "kb-btn", style: style.button, disabled: customRerankerId.trim() === "" || !customRerankerAccepted || busyId !== null, onClick: () => void registerCustomReranker(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconDownload, { size: 13 }),
          " ",
          t("customRerankAdd")
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.55 }, children: t("customRerankHint") }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { style: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.5 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "checkbox", checked: customRerankerAccepted, onChange: (event) => setCustomRerankerAccepted(event.target.checked) }),
        t("customRerankAccept")
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 14 }, children: [
      (models ?? []).map((model) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        ModelCard,
        {
          model,
          t,
          busy: busyId === model.id,
          onDownload: () => void download(model.id),
          onCancel: () => void cancel(model.id),
          onRemove: () => void remove(model.id),
          onSelfTest: () => void selfTest(model.id)
        },
        model.id
      )),
      models !== null && models.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: style.empty, children: t("noLocalModels") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { ...cardStyle, marginTop: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: ocrReady ? accentSoft2 : C.surface2,
              color: ocrReady ? C.accent : C.muted
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconScanText, { size: 18 })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontSize: 13, fontWeight: 600 }, children: t("ocrTitle") }),
            ocrReady && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: readyBadge, children: t("ready") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 2, fontSize: 12, color: C.muted, lineHeight: 1.5 }, children: t("ocrDesc") })
        ] }),
        ocrReady && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            className: "kb-dangerbtn",
            style: style.iconOnlyButton,
            title: t("ocrRemove"),
            "aria-label": t("ocrRemove"),
            disabled: ocrBusy,
            onClick: () => void removeOcr(),
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconTrash, { size: 14 })
          }
        )
      ] }),
      ocrStatus.status === "error" && ocrStatus.message !== "" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.danger, lineHeight: 1.5 }, children: ocrStatus.message }),
      ocrStatus.status === "downloading" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { height: 6, width: "100%", borderRadius: 999, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { height: "100%", width: `${ocrStatus.progress}%`, borderRadius: 999, background: C.accent, transition: "width 0.2s" } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: C.muted }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: t("localModelDownloading") }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
            Math.floor(ocrStatus.progress),
            "%"
          ] })
        ] })
      ] }),
      !ocrReady && ocrStatus.status !== "downloading" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        "button",
        {
          className: "kb-btn",
          style: { ...style.button, width: "100%", justifyContent: "center" },
          disabled: ocrBusy,
          onClick: () => void downloadOcr(),
          children: [
            ocrStatus.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconRefresh, { size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconDownload, { size: 13 }),
            ocrStatus.status === "error" ? t("localModelRetry") : t("ocrDownload")
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { ...cardStyle, marginTop: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: C.surface2, color: C.muted }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconBot, { size: 18 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 13, fontWeight: 600 }, children: t("ollamaTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 2, fontSize: 12, color: C.muted, lineHeight: 1.5 }, children: t("ollamaDesc") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, marginTop: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            style: { ...style.input, flex: 1 },
            placeholder: "http://127.0.0.1:11434",
            value: ollamaBase,
            onChange: (e) => setOllamaBase(e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { className: "kb-btn", style: style.button, disabled: ollamaBusy, onClick: () => void refreshOllamaTags(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconRefresh, { size: 13 }),
          t("ollamaRefresh")
        ] })
      ] }),
      ollamaInstalled.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 }, children: t("ollamaInstalledTitle") }),
        ollamaInstalled.map((item) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "div",
          {
            style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface2, marginBottom: 6 },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { color: C.muted, display: "inline-flex" }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconBox, { size: 14 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                "span",
                {
                  style: { flex: 1, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" },
                  title: t("ollamaEmbeddingHint"),
                  onClick: () => setOllamaModel(item.name),
                  children: item.name
                }
              ),
              item.size !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontSize: 11, color: C.muted, flexShrink: 0 }, children: formatBytes(item.size) }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                "button",
                {
                  style: { border: 0, padding: "2px 6px", background: "transparent", color: pendingDelete === item.name ? C.danger : C.muted, cursor: "pointer", fontSize: 11, fontWeight: 600, flexShrink: 0 },
                  title: t("ollamaDelete"),
                  "aria-label": t("ollamaDelete"),
                  disabled: ollamaBusy,
                  onClick: () => void deleteOllama(item.name),
                  children: pendingDelete === item.name ? t("ollamaConfirmDelete") : "\xD7"
                }
              )
            ]
          },
          item.name
        ))
      ] }),
      (ollamaSuggestions.ollamaEmbedding.length > 0 || ollamaSuggestions.ollamaVision.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 }, children: t("ollamaRecommended") }),
        ollamaSuggestions.ollamaEmbedding.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }, children: ollamaSuggestions.ollamaEmbedding.map((name) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            title: t("ollamaEmbeddingHint"),
            style: { fontSize: 11, padding: "3px 8px", borderRadius: 999, border: `1px solid ${C.border}`, background: "transparent", color: C.text, cursor: "pointer" },
            onClick: () => setOllamaModel(name),
            children: name
          },
          name
        )) }),
        ollamaSuggestions.ollamaVision.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: ollamaSuggestions.ollamaVision.map((name) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            title: t("ollamaVisionHint"),
            style: { fontSize: 11, padding: "3px 8px", borderRadius: 999, border: `1px solid ${C.border}`, background: "transparent", color: C.text, cursor: "pointer" },
            onClick: () => setOllamaModel(name),
            children: name
          },
          name
        )) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            style: { ...style.input, flex: 1 },
            placeholder: "llava / qwen2.5vl / nomic-embed-text \u2026",
            value: ollamaModel,
            onChange: (e) => setOllamaModel(e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "button",
          {
            className: "kb-btn",
            style: style.button,
            disabled: ollamaBusy || ollamaModel.trim() === "" || pullingModels.length > 0,
            onClick: () => void pullOllama(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconDownload, { size: 13 }),
              t("ollamaPull")
            ]
          }
        )
      ] }),
      pullingModels.map((pull) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginTop: 10, padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: C.text }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { color: pull.status === "error" ? C.danger : C.accent, display: "inline-flex" }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconDownload, { size: 13 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: pull.model }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "button",
            {
              style: { border: 0, padding: "2px 8px", borderRadius: 6, background: C.surface, color: C.text, cursor: "pointer", fontSize: 11 },
              onClick: () => void cancelOllama(pull.model),
              children: pull.status === "error" ? t("localModelCancel") : t("localModelCancel")
            }
          )
        ] }),
        pull.status !== "error" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { height: 6, width: "100%", borderRadius: 999, background: C.surface, overflow: "hidden", marginTop: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { height: "100%", width: `${pull.progress}%`, borderRadius: 999, background: C.accent, transition: "width 0.2s" } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, color: C.muted }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
              t("localModelDownloading"),
              pull.message !== "" ? ` \xB7 ${pull.message}` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
              Math.floor(pull.progress),
              "%"
            ] })
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.danger, lineHeight: 1.5 }, children: pull.message !== "" ? pull.message : t("localModelError") })
      ] }, pull.model))
    ] })
  ] });
}
function ModelCard(props) {
  const { model, t, busy, onDownload, onCancel, onRemove, onSelfTest } = props;
  const ready = model.status === "ready";
  const downloading = model.status === "downloading";
  const inProgress = downloading || model.status === "validating";
  const failed = model.status === "error" || model.status === "unhealthy";
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { ...cardStyle, ...ready ? {} : {} }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 12,
            flexShrink: 0,
            background: ready ? accentSoft2 : C.surface2,
            color: ready ? C.accent : C.muted
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconBox, { size: 20 })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: model.name }),
          ready && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: readyBadge, children: t("ready") }),
          model.support !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: readyBadge, children: t(model.support === "official" ? "officialSupport" : "experimentalSupport") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 2, fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: model.subtitle }),
        model.kind === "reranking" && model.lastCheckedAt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("p", { style: { marginTop: 4, fontSize: 12, color: C.muted, lineHeight: 1.5 }, children: [
          t("rerankLastValidated"),
          new Date(model.lastCheckedAt).toLocaleString(),
          " \xB7 ",
          model.latencyMs ?? 0,
          "ms"
        ] })
      ] }),
      ready && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 4 }, children: [
        model.kind === "reranking" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "kb-btn", style: style.iconOnlyButton, title: t("rerankRevalidate"), "aria-label": t("rerankRevalidate"), disabled: busy, onClick: onSelfTest, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconRefresh, { size: 14 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "kb-dangerbtn", style: style.iconOnlyButton, title: t("localModelRemove"), "aria-label": t("localModelRemove"), disabled: busy, onClick: onRemove, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconTrash, { size: 14 }) })
      ] })
    ] }),
    failed && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: { marginTop: 8, fontSize: 12, color: C.danger, lineHeight: 1.5 }, children: model.message !== "" ? model.message : t("localModelError") }),
    inProgress && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginTop: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { height: 6, width: "100%", borderRadius: 999, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { height: "100%", width: `${model.progress}%`, borderRadius: 999, background: C.accent, transition: "width 0.2s" } }) }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: C.muted }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: model.status === "validating" ? t("rerankValidating") : t("localModelDownloading") }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
          Math.floor(model.progress),
          "%"
        ] })
      ] }),
      downloading && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        "button",
        {
          className: "kb-btn",
          style: { ...style.button, width: "100%", justifyContent: "center" },
          disabled: busy,
          onClick: onCancel,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconX, { size: 13 }),
            t("localModelCancel")
          ]
        }
      ) })
    ] }),
    !ready && !inProgress && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
      "button",
      {
        className: "kb-btn",
        style: { ...style.button, width: "100%", justifyContent: "center" },
        disabled: busy,
        onClick: model.kind === "reranking" && model.status === "unhealthy" ? onSelfTest : onDownload,
        children: [
          failed ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconRefresh, { size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconDownload, { size: 13 }),
          model.kind === "reranking" && model.status === "unhealthy" ? t("rerankRevalidate") : failed ? t("localModelRetry") : t("localModelDownload")
        ]
      }
    ) })
  ] });
}
var cardStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 16,
  background: C.surface
};
var accentSoft2 = "color-mix(in srgb, var(--dsw-alias-brand-primary, #3b6ef6) 10%, transparent)";
var readyBadge = {
  fontSize: 12,
  lineHeight: 1.5,
  padding: "0 6px",
  borderRadius: 999,
  background: C.surface2,
  color: C.muted,
  flexShrink: 0
};
function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// src/ui/client/locales.ts
var zh = {
  mineruLocalOption: "MinerU\uFF08\u672C\u5730 / \u81EA\u90E8\u7F72 V1\uFF09",
  mineruLocalDesc: "\u6587\u4EF6\u53EA\u53D1\u9001\u5230\u6B64\u81EA\u90E8\u7F72\u5730\u5740\u3002\u670D\u52A1\u9700\u72EC\u7ACB\u5B89\u88C5\uFF1B\u6B64\u63D2\u4EF6\u4E0D\u4E0B\u8F7D\u6A21\u578B\uFF0C\u4E5F\u4E0D\u4F1A\u81EA\u52A8\u8F6C\u5230\u4E91\u7AEF\u3002\u7531 MinerU \u63D0\u4F9B\u89E3\u6790\u3002",
  mineruLocalUrl: "\u670D\u52A1\u5730\u5740",
  mineruLocalKey: "\u670D\u52A1\u5BC6\u94A5\uFF08\u53EF\u9009\uFF09",
  mineruTier: "\u89E3\u6790\u6863\u4F4D",
  mineruFlash: "\u6781\u901F flash \xB7 \u539F\u751F\u6587\u6863 / \u9884\u89C8",
  mineruBasic: "\u57FA\u7840 basic \xB7 CPU OCR\u3001\u8868\u683C\u3001\u516C\u5F0F",
  mineruStandard: "\u6807\u51C6 standard \xB7 \u5C0F\u6A21\u578B + VLM",
  mineruAdvanced: "\u9AD8\u7EA7 advanced \xB7 \u66F4\u591A\u63A8\u7406\u8BA1\u7B97",
  processorCheck: "\u6D4B\u8BD5\u5DF2\u4FDD\u5B58\u914D\u7F6E",
  processorChecking: "\u6B63\u5728\u8FDE\u63A5\u2026",
  processorCheckSaved: "\u5148\u4FDD\u5B58\u5904\u7406\u5668\u914D\u7F6E\uFF0C\u518D\u6D4B\u8BD5\u8FDE\u63A5\u3002\u6D4B\u8BD5\u53EA\u68C0\u67E5\u670D\u52A1\u80FD\u529B\uFF0C\u4E0D\u4E0A\u4F20\u6587\u4EF6\u3002",
  processorCheckSuccess: "\u8FDE\u63A5\u6210\u529F",
  processingTimeout: "\u6587\u6863\u5904\u7406\u603B\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF09",
  structuredChunking: "\u6309\u6587\u6863\u7ED3\u6784\u5207\u5757",
  structuredChunkingHint: "\u4EC5\u5BF9\u542B\u7ED3\u6784\u4FE1\u606F\u7684\u6587\u6863\u4FDD\u7559\u8868\u683C\u3001\u516C\u5F0F\u548C\u56FE\u6CE8\u5355\u5143\uFF1B\u666E\u901A\u6587\u672C\u6CBF\u7528\u539F\u5207\u5757\u65B9\u5F0F\u3002",
  processingInfo: "\u89E3\u6790\u6765\u6E90",
  processingComplete: "\u5B8C\u6574",
  processingPartial: "\u90E8\u5206\u89E3\u6790",
  processingUnknown: "\u5B8C\u6574\u6027\u672A\u77E5",
  processingReused: "\u590D\u7528\u4E86\u5DF2\u6709\u8BC1\u636E",
  reparseDocument: "\u91CD\u65B0\u89E3\u6790\u6E90\u6587\u4EF6",
  rechunkDocument: "\u590D\u7528\u89E3\u6790\u7ED3\u679C\u91CD\u65B0\u5207\u5757",
  evidence: "\u7ED3\u6784\u8BC1\u636E",
  evidenceEmpty: "\u6B64\u6587\u6863\u6CA1\u6709\u53EF\u7528\u7684\u7ED3\u6784\u8BC1\u636E\u3002",
  evidenceNext: "\u7EE7\u7EED\u8BFB\u53D6",
  evidenceBack: "\u4E0A\u4E00\u6BB5",
  evidenceRetry: "\u91CD\u65B0\u52A0\u8F7D",
  mineruDeployTitle: "MinerU \u672C\u5730\u89E3\u6790 \xB7 \u90E8\u7F72\u9884\u68C0",
  mineruDownloadSource: "\u6A21\u578B\u4E0B\u8F7D\u6E90",
  mineruPythonSource: "Python \u5305\u4E0B\u8F7D\u6E90",
  mineruPythonSourceHint: "\u7528\u4E8E\u72EC\u7ACB MinerU \u73AF\u5883\uFF0C\u9ED8\u8BA4\u4F7F\u7528\u5B98\u65B9 PyPI\u3002\u53EA\u63A5\u53D7 HTTPS \u5730\u5740\uFF1B\u4FEE\u6539\u540E\u8BF7\u4FDD\u5B58\u5E76\u91CD\u65B0\u9884\u68C0\u3002",
  mineruSaveSource: "\u4FDD\u5B58\u4E0B\u8F7D\u6E90",
  mineruCurrentInstall: "\u5F53\u524D\u5DF2\u9A8C\u8BC1\u5B89\u88C5\u76EE\u5F55",
  mineruPhaseAbsent: "\u5C1A\u672A\u90E8\u7F72",
  mineruPhaseEnvironment: "\u51C6\u5907\u9694\u79BB\u73AF\u5883",
  mineruPhaseProbe: "\u6D4B\u8BD5 PDF \u89E3\u6790\u4E2D",
  mineruPhaseReady: "\u5DF2\u901A\u8FC7\u89E3\u6790\u81EA\u68C0",
  mineruPhaseInterrupted: "\u4E0A\u6B21\u4EFB\u52A1\u4E2D\u65AD\uFF0C\u9700\u91CD\u65B0\u9884\u68C0",
  mineruServiceRunning: "\u670D\u52A1\u8FD0\u884C\u4E2D",
  mineruServiceStarting: "\u670D\u52A1\u542F\u52A8\u4E2D",
  mineruServiceStopping: "\u670D\u52A1\u505C\u6B62\u4E2D",
  mineruServiceError: "\u670D\u52A1\u5F02\u5E38",
  mineruServiceStopped: "\u670D\u52A1\u672A\u8FD0\u884C",
  mineruCancelTask: "\u53D6\u6D88\u5F53\u524D\u4EFB\u52A1",
  mineruStart: "\u542F\u52A8\u670D\u52A1",
  mineruStop: "\u505C\u6B62\u670D\u52A1",
  mineruUse: "\u8BBE\u4E3A\u5168\u5C40\u9ED8\u8BA4\u89E3\u6790\u5668",
  mineruApplied: "\u5DF2\u8BBE\u4E3A\u5168\u5C40\u9ED8\u8BA4\uFF1B\u77E5\u8BC6\u5E93\u5DF2\u6709\u7684\u5355\u72EC\u914D\u7F6E\u4ECD\u4F18\u5148\u751F\u6548\u3002",
  mineruExternalCopy: "\u5916\u90E8\u6A21\u578B\u5C06\u590D\u5236\u5230\u72EC\u7ACB\u5B89\u88C5\u76EE\u5F55\uFF0C\u539F\u76EE\u5F55\u4FDD\u6301\u53EA\u8BFB\uFF1B\u514D\u4E0B\u8F7D\u4E0D\u4EE3\u8868\u514D\u78C1\u76D8\u5360\u7528\u3002",
  mineruPrepare: "\u51C6\u5907\u672C\u5730 MinerU",
  mineruNotNow: "\u6682\u4E0D\u5B89\u88C5",
  mineruConfirm: "\u786E\u8BA4\u5B89\u88C5\u4E0E\u4E0B\u8F7D",
  pythonDetect: "\u91CD\u65B0\u68C0\u6D4B\u73AF\u5883",
  pythonPath: "Python \u53EF\u6267\u884C\u6587\u4EF6\u8DEF\u5F84",
  pythonVerify: "\u9A8C\u8BC1\u5E76\u8BB0\u4F4F",
  pythonChoose: "\u9009\u62E9\u5DF2\u68C0\u6D4B\u5230\u7684\u89E3\u91CA\u5668",
  pythonEligible: "\u53EF\u7528\u4E8E\u5C1D\u8BD5\u90E8\u7F72",
  pythonMissing: "\u6CA1\u6709\u53D1\u73B0\u53EF\u7528\u73AF\u5883\u3002\u53EF\u586B\u5199 Python \u53EF\u6267\u884C\u6587\u4EF6\u8DEF\u5F84\u540E\u9A8C\u8BC1\u3002",
  pythonLimited: "\u68C0\u6D4B\u5230\u7684\u73AF\u5883\u8F83\u591A\uFF1B\u672A\u663E\u793A\u7684\u73AF\u5883\u53EF\u624B\u52A8\u6307\u5B9A\u3002",
  pythonHint: "\u68C0\u6D4B\u4E0D\u4F1A\u5B89\u88C5\u8F6F\u4EF6\u3002\u9700\u7A33\u5B9A\u7248 64 \u4F4D CPython 3.10\u20133.14\uFF0C\u5E76\u5305\u542B venv \u548C ensurepip\u3002\u901A\u8FC7\u68C0\u6D4B\u4E0D\u4EE3\u8868 MinerU \u4F9D\u8D56\u6216\u89E3\u6790\u5DF2\u9A8C\u8BC1\u3002",
  pythonStages: "\u90E8\u7F72\u9A8C\u8BC1\u8FDB\u5EA6",
  pythonRemembered: "\u5DF2\u8BB0\u4F4F\u7684\u8DEF\u5F84",
  pythonRefreshHint: "\u8DEF\u5F84\u5DF2\u4ECE\u6D4F\u89C8\u5668\u8BBE\u7F6E\u6062\u590D\u3002\u90E8\u7F72\u524D\u8BF7\u91CD\u65B0\u68C0\u6D4B\uFF0C\u786E\u8BA4\u89E3\u91CA\u5668\u4ECD\u53EF\u7528\u3002",
  pythonManualHint: "\u4F8B\u5982 Windows\uFF1AC:\\Python313\\python.exe\uFF1BmacOS/Linux\uFF1A/usr/bin/python3\u3002",
  pythonOtherDetected: "\u5176\u4ED6\u68C0\u6D4B\u5230\u7684\u73AF\u5883",
  pythonDetectedDetails: "\u5DF2\u68C0\u6D4B\u5230\u7684 Python \u8BE6\u60C5",
  pythonSource: "\u53D1\u73B0\u6765\u6E90",
  pythonVersion: "\u7248\u672C",
  pythonArchitecture: "\u67B6\u6784",
  pythonStepInterpreter: "\u89E3\u91CA\u5668",
  pythonStepEnvironment: "\u9694\u79BB\u73AF\u5883",
  pythonStepDependencies: "\u4F9D\u8D56",
  pythonStepInference: "\u771F\u5B9E\u89E3\u6790",
  pythonReasonProbe: "\u65E0\u6CD5\u542F\u52A8\u6216\u8BFB\u53D6\u89E3\u91CA\u5668\u4FE1\u606F",
  pythonReasonVersion: "\u9700\u4F7F\u7528 Python 3.10\u20133.14",
  pythonReasonImplementation: "\u4EC5\u652F\u6301 CPython",
  pythonReasonArchitecture: "\u9700 64 \u4F4D Python",
  pythonReasonPrerelease: "\u9700\u4F7F\u7528\u6B63\u5F0F\u7A33\u5B9A\u7248",
  pythonReasonThreaded: "\u6682\u4E0D\u652F\u6301\u81EA\u7531\u7EBF\u7A0B\u6784\u5EFA",
  pythonReasonVenv: "\u7F3A\u5C11 venv \u6A21\u5757",
  pythonReasonPip: "\u7F3A\u5C11 ensurepip \u6A21\u5757",
  mineruManagedPreview: "\u5B9E\u9A8C\u6027\u6258\u7BA1\u90E8\u7F72\uFF1A\u76EE\u524D\u4EC5 Basic / ONNX\uFF0C\u4F7F\u7528\u9009\u5B9A Python \u521B\u5EFA\u72EC\u7ACB\u73AF\u5883\uFF0C\u4E0D\u4FEE\u6539\u539F\u6709\u73AF\u5883\u3002\u5C1A\u672A\u901A\u8FC7\u771F\u5B9E\u6A21\u578B\u548C\u8DE8\u5E73\u53F0\u5B9E\u673A\u9A8C\u6536\u3002Standard/Advanced \u6682\u8BF7\u4F7F\u7528\u5916\u90E8\u670D\u52A1\u3002",
  mineruConfirmPreparation: "\u5C06\u5728\u6240\u9009\u76EE\u5F55\u521B\u5EFA\u72EC\u7ACB Python \u73AF\u5883\uFF0C\u4ECE PyPI \u5B89\u88C5 MinerU 4.0.6 \u53CA\u4F9D\u8D56\uFF0C\u4ECE Hugging Face \u4E0B\u8F7D\u56FA\u5B9A\u7248\u672C\u6A21\u578B\uFF0C\u5E76\u7528\u516C\u5F00\u6D4B\u8BD5 PDF \u81EA\u68C0\u3002\u8FD0\u884C\u73AF\u5883\u603B\u5360\u7528\u5C1A\u4E0D\u786E\u5B9A\uFF0C\u8BF7\u9884\u7559\u989D\u5916\u7A7A\u95F4\u3002\u8BF7\u786E\u8BA4\u63A5\u53D7\u4E0A\u6E38\u8F6F\u4EF6\u4E0E\u6A21\u578B\u5404\u81EA\u7684\u8BB8\u53EF\u8BC1\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u5207\u6362\u73B0\u6709\u89E3\u6790\u914D\u7F6E\u3002",
  mineruDeployDescription: "\u53EF\u9009\u72EC\u7ACB\u90E8\u7F72\uFF0C\u4E0D\u590D\u7528\u5411\u91CF\u6216\u91CD\u6392\u6A21\u578B\uFF0C\u4E5F\u4E0D\u6539\u53D8\u73B0\u6709\u4E91 API \u914D\u7F6E\u3002Basic \u4F7F\u7528 ONNX \u89E3\u6790\u6A21\u578B\u3002",
  mineruDeployRoot: "\u72EC\u7ACB\u5B89\u88C5\u76EE\u5F55",
  mineruDeployExisting: "\u5DF2\u6709 MinerU \u6A21\u578B\u76EE\u5F55\uFF08\u53EF\u9009\uFF0C\u53EA\u8BFB\u6838\u9A8C\uFF09",
  mineruDeployBrowse: "\u9009\u62E9\u76EE\u5F55",
  mineruDeployCheck: "\u68C0\u67E5\u8DEF\u5F84\u4E0E\u5BB9\u91CF",
  mineruDeployChecking: "\u6B63\u5728\u6838\u9A8C\u6587\u4EF6\uFF0C\u8BF7\u7A0D\u5019\u2026",
  mineruDeployTotal: "\u6A21\u578B\u603B\u5927\u5C0F",
  mineruDeployReuse: "\u5DF2\u6838\u9A8C\u53EF\u590D\u7528",
  mineruDeployRemaining: "\u9700\u4E0B\u8F7D\u6A21\u578B",
  mineruDeployUnknownRuntime: "\u4EE5\u4E0A\u4EC5\u4E3A\u6A21\u578B\u5BB9\u91CF\u3002Python\u3001\u8FD0\u884C\u73AF\u5883\u4E0E\u4F9D\u8D56\u5360\u7528\u5C1A\u672A\u786E\u5B9A\uFF0C\u4E0D\u5305\u542B\u5728\u6B64\u6570\u503C\u4E2D\u3002",
  mineruDeployIncomplete: "\u5DF2\u6709\u6A21\u578B\u7F3A\u5931\u6216\u6458\u8981\u4E0D\u5339\u914D\u3002\u4E0D\u4F1A\u4FEE\u6539\u8BE5\u76EE\u5F55\uFF0C\u8BF7\u9009\u62E9\u5B8C\u6574\u6A21\u578B\u76EE\u5F55\u6216\u6E05\u7A7A\u6B64\u9009\u9879\u3002",
  mineruDeploySpace: "\u53EF\u7528\u7A7A\u95F4\u4E0D\u8DB3\u4EE5\u5B8C\u6210\u6A21\u578B\u4E0B\u8F7D\u4E0E\u6682\u5B58\u3002",
  mineruDeployPreflightOnly: "\u90E8\u7F72\u51C6\u5907\u4F1A\u5728\u72EC\u7ACB\u76EE\u5F55\u521B\u5EFA Python \u73AF\u5883\u3001\u5B89\u88C5 MinerU \u5E76\u4E0B\u8F7D\u6A21\u578B\u3002\u77E5\u8BC6\u5E93\u5F53\u524D\u4F7F\u7528\u7684\u89E3\u6790\u5668\u4E0D\u4F1A\u81EA\u52A8\u5207\u6362\u3002",
  sourcePage: "\u539F\u6587\u7B2C {page} \u9875",
  sourceBlock: "\u5757",
  sourceRegion: "\u5757\u533A\u57DF\uFF08\u5F52\u4E00\u5316\u5750\u6807\uFF09",
  sourceAsset: "\u67E5\u770B\u9644\u4EF6",
  sourceUnavailable: "\u539F\u6587\u4F4D\u7F6E\u672A\u77E5",
  stageQueued: "\u6392\u961F\u4E2D",
  stageChecking: "\u68C0\u67E5\u670D\u52A1",
  stageUploading: "\u4E0A\u4F20\u81F3\u914D\u7F6E\u670D\u52A1",
  stageParsing: "\u89E3\u6790\u4E2D",
  stageDownloading: "\u4E0B\u8F7D\u89E3\u6790\u7ED3\u679C",
  stageNormalizing: "\u6574\u7406\u7ED3\u6784\u8BC1\u636E",
  stageIndexing: "\u5EFA\u7ACB\u7D22\u5F15",
  stageCompleted: "\u5904\u7406\u5B8C\u6210",
  stageFailed: "\u5904\u7406\u5931\u8D25",
  stageCanceled: "\u5DF2\u53D6\u6D88",
  nav: "\u77E5\u8BC6\u5E93",
  newBase: "\u65B0\u5EFA\u77E5\u8BC6\u5E93",
  baseName: "\u540D\u79F0",
  baseDescription: "\u63CF\u8FF0",
  create: "\u521B\u5EFA",
  cancel: "\u53D6\u6D88",
  save: "\u4FDD\u5B58",
  delete: "\u5220\u9664",
  rename: "\u91CD\u547D\u540D",
  renameDoc: "\u91CD\u547D\u540D\u6587\u6863",
  confirmDeleteBase: "\u5220\u9664\u540E\u5C06\u65E0\u6CD5\u6062\u590D\u8BE5\u77E5\u8BC6\u5E93\u3002",
  documents: "\u6587\u6863",
  addText: "\u6DFB\u52A0\u6587\u672C",
  textTitlePlaceholder: "\u4E3A\u8FD9\u7BC7\u7B14\u8BB0\u53D6\u4E2A\u540D\u5B57",
  textContentPlaceholder: "\u5728\u6B64\u8F93\u5165\u7B14\u8BB0\u5185\u5BB9\u2026",
  textContentLabel: "\u5185\u5BB9",
  addTextButton: "\u6DFB\u52A0",
  addDocument: "\u6DFB\u52A0\u6570\u636E\u6E90",
  tabText: "\u7B14\u8BB0",
  tabFile: "\u6587\u4EF6",
  tabUrl: "\u94FE\u63A5",
  uploadAll: "\u4E0A\u4F20\u5168\u90E8",
  queuedFiles: "\u4E2A\u6587\u4EF6\u5F85\u4E0A\u4F20",
  processing: "\u5904\u7406\u4E2D\u2026",
  searchBases: "\u641C\u7D22\u77E5\u8BC6\u5E93\u2026",
  noDocsHint: "\u7C98\u8D34\u6587\u672C\u3001\u4E0A\u4F20\u6587\u4EF6\u6216\u5BFC\u5165\u7F51\u9875\uFF0C\u5F00\u59CB\u79EF\u7D2F\u77E5\u8BC6",
  baseSettings: "\u77E5\u8BC6\u5E93\u8BBE\u7F6E",
  editBase: "\u7F16\u8F91\u77E5\u8BC6\u5E93",
  confirmDeleteDoc: "\u5220\u9664\u8BE5\u6587\u6863\u53CA\u5176\u5168\u90E8\u5206\u5757\uFF1F",
  uploaded: "\u5DF2\u5BFC\u5165",
  importFailed: "\u5BFC\u5165\u5931\u8D25",
  tooManyFiles: "\u5355\u6B21\u6700\u591A\u9009\u62E9 {count} \u4E2A\u6587\u4EF6\uFF0C\u8BF7\u5206\u6279\u5BFC\u5165",
  listEndReached: "\u5DF2\u5230\u5E95",
  unsupportedFilesSkipped: "\u5DF2\u8DF3\u8FC7 {count} \u4E2A\u4E0D\u652F\u6301\u7684\u6587\u4EF6",
  resolvingConflict: "\u5904\u7406\u4E2D\u2026",
  fileTooLarge: "\u300C{name}\u300D\u8D85\u8FC7 22MB\uFF0C\u65E0\u6CD5\u4E0A\u4F20\uFF08\u4E0A\u4F20\u63A5\u53E3\u4E0A\u9650\u7EA6 24MB\uFF09\uFF0C\u5DF2\u8DF3\u8FC7",
  noSupportedFiles: "\u6240\u9009\u5185\u5BB9\u4E2D\u6CA1\u6709\u652F\u6301\u7684\u6587\u4EF6\uFF08\u9690\u85CF\u6587\u4EF6\u4E0E\u4E0D\u652F\u6301\u7684\u683C\u5F0F\u5DF2\u8DF3\u8FC7\uFF09",
  skippedFiles: "\u5DF2\u8DF3\u8FC7 {count} \u4E2A\u4E0D\u652F\u6301\u7684\u6587\u4EF6",
  bulkReindexSkipped: "\u8DF3\u8FC7\u5904\u7406\u4E2D {count}",
  bulkReindexNone: "\u6240\u9009\u6587\u6863\u90FD\u8FD8\u5728\u5904\u7406\u4E2D\uFF0C\u7A0D\u540E\u518D\u8BD5",
  dragToUpload: "\u677E\u5F00\u4E0A\u4F20\u6587\u4EF6",
  pdfTooLarge: "\u6587\u4EF6\u8D85\u8FC7 100MB\uFF0C\u65E0\u6CD5\u5185\u5D4C\u9884\u89C8\uFF0C\u8BF7\u53F3\u952E\u4E0B\u8F7D\u67E5\u770B",
  pdfPreviewFailed: "PDF \u9884\u89C8\u52A0\u8F7D\u5931\u8D25",
  ocrTitle: "\u672C\u5730 OCR\uFF08\u626B\u63CF\u4EF6\u8BC6\u522B\uFF09",
  ocrDesc: "\u4E0B\u8F7D PaddleOCR \u6A21\u578B\uFF08\u7EA6 25MB\uFF0C\u5B8C\u6574\u4E2D\u6587\u8BC6\u522B\uFF09\u540E\uFF0C\u626B\u63CF\u7248 PDF\uFF08\u65E0\u6587\u672C\u5C42\uFF09\u81EA\u52A8\u8BC6\u522B\u51FA\u6587\u5B57\u5E76\u8FDB\u7D22\u5F15",
  ocrDownload: "\u4E0B\u8F7D OCR \u6A21\u578B",
  ocrRemove: "\u5220\u9664 OCR \u6A21\u578B",
  processorBuiltinDesc: "\u5185\u7F6E\u5904\u7406\u5668\uFF1A\u672C\u5730\u89E3\u6790\u5168\u90E8\u652F\u6301\u683C\u5F0F\uFF1B\u626B\u63CF\u4EF6 PDF \u5728\u4E0B\u8F7D OCR \u6A21\u578B\u540E\u81EA\u52A8\u8BC6\u522B\uFF08\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\uFF09",
  processorMineruDesc: "PDF \u4F1A\u4E0A\u4F20\u5230\u914D\u7F6E\u7684 MinerU \u4E91\u670D\u52A1\uFF0C\u5931\u8D25\u53EF\u56DE\u9000\u672C\u5730\u89E3\u6790\u5E76\u8BB0\u5F55\u8B66\u544A\u3002\u5728 mineru.net \u83B7\u53D6 API Key\u3002",
  perBaseHint: "\u7559\u7A7A\u5219\u4F7F\u7528\u5168\u5C40\u8BBE\u7F6E",
  uploadFile: "\u4E0A\u4F20\u6587\u4EF6",
  uploadButton: "\u70B9\u51FB\u9009\u62E9\u6587\u4EF6\u6216\u62D6\u62FD\u5230\u6B64\u5904",
  dragHint: "\u652F\u6301 PDF, DOCX, MD, XLSX, TXT, CSV",
  importUrl: "\u5BFC\u5165\u5355\u4E2A\u7F51\u9875",
  urlPlaceholder: "https://example.com",
  urlDesc: "\u8F93\u5165\u7F51\u9875\u94FE\u63A5\uFF1A",
  urlHelp: "\u5C06\u81EA\u52A8\u6293\u53D6\u9875\u9762\u6587\u672C\u5E76\u5206\u5757\u7D22\u5F15",
  importUrlButton: "\u5BFC\u5165",
  reindex: "\u91CD\u5EFA\u7D22\u5F15",
  reindexButton: "\u91CD\u65B0\u7D22\u5F15",
  reindexDone: "\u5DF2\u91CD\u5EFA",
  refreshUrl: "\u5237\u65B0\u5FEB\u7167",
  urlRefreshed: "\u5DF2\u5237\u65B0",
  urlUnchanged: "\u9875\u9762\u65E0\u53D8\u5316",
  chunks: "\u5206\u5757",
  preview: "\u9884\u89C8",
  rawText: "\u539F\u6587",
  close: "\u5173\u95ED",
  search: "\u68C0\u7D22\u6D4B\u8BD5",
  searchPlaceholder: "\u8F93\u5165\u6D4B\u8BD5 Query...",
  searchButton: "\u68C0\u7D22",
  searchMode: "\u68C0\u7D22\u65B9\u5F0F",
  modeAuto: "\u81EA\u52A8",
  modeHybrid: "\u6DF7\u5408\uFF08BM25 + \u5411\u91CF\uFF09",
  modeVector: "\u5411\u91CF",
  modeLexical: "\u5173\u952E\u8BCD",
  threshold: "\u76F8\u4F3C\u5EA6\u9608\u503C",
  settings: "\u8BBE\u7F6E",
  advancedSettings: "\u9AD8\u7EA7\u8BBE\u7F6E",
  embeddingProvider: "\u5D4C\u5165\u6A21\u578B",
  providerOpenAI: "OpenAI \u517C\u5BB9\u63A5\u53E3",
  providerOllama: "Ollama\uFF08\u672C\u5730\uFF09",
  providerNone: "\u4E0D\u4F7F\u7528",
  embeddingBaseUrl: "\u63A5\u53E3\u5730\u5740",
  embeddingModel: "\u6A21\u578B",
  embeddingApiKey: "API Key\uFF08\u53EF\u9009\uFF09",
  chunkSize: "\u5206\u6BB5\u5927\u5C0F",
  chunkOverlap: "\u91CD\u53E0\u5927\u5C0F",
  topK: "Top K",
  retrievalTuning: "\u53EC\u56DE\u4E0E\u4E0A\u4E0B\u6587",
  mmrDiversity: "\u7ED3\u679C\u591A\u6837\u6027\uFF08MMR\uFF0C0=\u5173\uFF09",
  rrfVectorWeight: "\u5411\u91CF\u878D\u5408\u6743\u91CD",
  rrfVectorWeightHint: "\u6DF7\u5408\u68C0\u7D22\u4E2D\u5411\u91CF lane \u7684\u76F8\u5BF9\u6743\u91CD\uFF080.1\u20135\uFF0C1=\u5747\u8861\uFF1B\u8BED\u4E49\u95EE\u9898\u53EF\u8C03\u5927\uFF09",
  siblingChunks: "\u4E0A\u4E0B\u6587\u62FC\u63A5",
  siblingChunksHint: "\u6BCF\u4E2A\u547D\u4E2D\u7ED3\u679C\u9644\u5E26\u76F8\u90BB\u5206\u5757\u7684\u6570\u91CF\uFF080\u20133\uFF0C0=\u5173\uFF1B\u8BA9\u56DE\u7B54\u83B7\u5F97\u5B8C\u6574\u6BB5\u843D\u4E0A\u4E0B\u6587\uFF09",
  batchSize: "embedding \u6279\u5927\u5C0F",
  stats: "\u7EDF\u8BA1",
  statsDocs: "\u6587\u6863",
  statsSourceDocs: "\u6765\u6E90\u9879",
  statsStoredDocs: "\u5DF2\u89E3\u6790\u6587\u6863",
  statsSourceDocsTitle: "\u6765\u6E90\u4E2D\u8DDF\u8E2A\u7684\u9879\u76EE\uFF08\u6587\u4EF6\u5939 + \u6587\u4EF6\uFF09",
  statsStoredDocsTitle: "\u5B9E\u9645\u89E3\u6790\u5E76\u4F5C\u4E3A\u539F\u59CB\u526F\u672C\u5B58\u50A8\u5728\u7F13\u5B58\u4E2D\u7684\u6587\u6863",
  statsChunks: "\u5206\u5757",
  statsChars: "\u5B57\u7B26",
  statsTokens: "\u2248 Token",
  statsDims: "\u5411\u91CF\u7EF4\u5EA6",
  dimensionProbeFailed: "\u5D4C\u5165\u6A21\u578B\u63A2\u6D4B\u5931\u8D25",
  dimensionProbing: "\u63A2\u6D4B\u4E2D\u2026",
  embedded: "\u5DF2\u5411\u91CF\u5316",
  notEmbedded: "\u672A\u5411\u91CF\u5316",
  noBases: "\u6682\u65E0\u77E5\u8BC6\u5E93",
  selectBase: "\u9009\u62E9\u4E00\u4E2A\u77E5\u8BC6\u5E93",
  noDocuments: "\u6682\u65E0\u6570\u636E\u6E90",
  docCount: "\u4E2A\u6587\u6863",
  chunkCount: "\u4E2A\u5206\u5757",
  tabDir: "\u76EE\u5F55",
  tabPath: "\u8DEF\u5F84",
  pathDesc: "\u8F93\u5165\u76EE\u5F55\u6216\u6587\u4EF6\u7684\u7EDD\u5BF9\u8DEF\u5F84",
  sourcePathEdit: "\u4FEE\u6539\u6765\u6E90\u8DEF\u5F84",
  sourcePathPrompt: "\u6765\u6E90\u8DEF\u5F84",
  pathImportPartial: "\u5BFC\u5165\u5B8C\u6210\uFF1A\u6210\u529F {count}\uFF0C\u5931\u8D25 {errors}",
  dirPlaceholder: "\u8F93\u5165\u672C\u673A\u76EE\u5F55\u8DEF\u5F84\uFF0C\u5982 D:\\docs\\policy",
  importDirButton: "\u5BFC\u5165",
  conflictTitle: "\u5B58\u5728\u540C\u540D\u6570\u636E\u6E90",
  conflictMessage: "\u6709\u540C\u540D\u6570\u636E\u6E90\u4E0E\u77E5\u8BC6\u5E93\u4E2D\u5DF2\u5B58\u5728\u7684\u9879\u76EE\u540C\u540D\uFF0C\u8BF7\u9009\u62E9\u5904\u7406\u65B9\u5F0F\u3002",
  keepAll: "\u5168\u90E8\u4FDD\u7559",
  replace: "\u66FF\u6362",
  rerankModel: "\u91CD\u6392\u6A21\u578B",
  rerankBaseUrl: "\u91CD\u6392\u63A5\u53E3\u5730\u5740",
  rerankApiKey: "\u91CD\u6392 API Key\uFF08\u53EF\u9009\uFF09",
  rerankHint: "\u5BF9\u521D\u6B65\u53EC\u56DE\u7ED3\u679C\u91CD\u65B0\u6392\u5E8F\u7684\u6A21\u578B\uFF0C\u53EF\u63D0\u5347\u6700\u7EC8\u7247\u6BB5\u76F8\u5173\u6027\u3002",
  modelLabel: "\u6A21\u578B",
  elapsed: "\u8017\u65F6",
  reranked: "\u5DF2\u91CD\u6392",
  recallTest: "\u53EC\u56DE\u6D4B\u8BD5",
  addSource: "\u6DFB\u52A0\u6570\u636E\u6E90",
  docProcessing: "\u6587\u6863\u5904\u7406",
  docProcessingHint: "\u6587\u6863\u9884\u5904\u7406\u5C06\u5728\u6587\u6863\u5BFC\u5165\u65F6\u81EA\u52A8\u6267\u884C\uFF0C\u9009\u62E9\u5408\u9002\u7684\u5904\u7406\u670D\u52A1\u5546\u53EF\u63D0\u5347\u6587\u6863\u89E3\u6790\u8D28\u91CF",
  processorBuiltin: "\u5185\u7F6E\u89E3\u6790\u5668\uFF08PDF / DOCX / PPTX / XLSX / EPUB / HTML / \u6587\u672C\uFF09",
  smartChunk: "\u667A\u80FD\u5206\u6BB5",
  smartChunkHint: "\u81EA\u52A8\u6CBF Markdown \u7ED3\u6784\uFF08\u6807\u9898\u3001\u4EE3\u7801\u5757\u3001\u6BB5\u843D\uFF09\u5206\u6BB5\uFF0C\u4E14\u4E0D\u4ECE\u4EE3\u7801\u5757\u5185\u90E8\u5207\u5F00\u3002\u5173\u95ED\u540E\u4EC5\u6309\u5206\u9694\u7B26\u5207\u5206\u3002",
  semanticChunk: "\u8BED\u4E49\u5206\u5757",
  semanticChunkHint: "\u5BF9\u6BB5\u843D\u505A\u5D4C\u5165\u5E76\u5408\u5E76\u8BED\u4E49\u76F8\u8FD1\u7684\u76F8\u90BB\u6BB5\uFF08\u9700\u8981\u5DF2\u914D\u7F6E\u5D4C\u5165\u6A21\u578B\uFF1B\u5173\u95ED\u5219\u6309\u6807\u9898/\u6BB5\u843D\u5206\u5757\uFF09",
  semanticChunkThreshold: "\u5408\u5E76\u9608\u503C",
  semanticChunkThresholdHint: "\u76F8\u90BB\u6BB5\u843D\u4F59\u5F26\u76F8\u4F3C\u5EA6\u4F4E\u4E8E\u8BE5\u503C\uFF08\u9ED8\u8BA4 0.75\uFF09\u65F6\u53E6\u8D77\u4E00\u5757\uFF1B\u8C03\u9AD8 \u2192 \u5757\u66F4\u788E\u3001\u66F4\u805A\u7126",
  chunkTokenLimit: "\u5206\u5757 Token \u4E0A\u9650",
  chunkTokenLimitHint: "\u8D85\u8FC7\u8BE5 token \u6570\u7684\u5757\u4F1A\u5728\u53E5\u53F7/\u9017\u53F7/\u7A7A\u683C\u7B49\u8FB9\u754C\u5904\u7EE7\u7EED\u5207\u5206\uFF080 = \u4E0D\u9650\u5236\uFF09\uFF1B\u672C\u5730\u6A21\u578B\u5EFA\u8BAE\u8BBE\u4E3A\u6A21\u578B\u4E0A\u4E0B\u6587\u7A97\u53E3\u4EE5\u5185",
  conflictStrategy: "\u540C\u540D\u6587\u4EF6\u7B56\u7565",
  conflictStrategyHint: "\u5BFC\u5165\u6587\u4EF6\u4E0E\u5E93\u5185\u540C\u540D\u65F6\uFF1A\u91CD\u547D\u540D\uFF08\u81EA\u52A8\u52A0 _1 \u540E\u7F00\uFF09/ \u66FF\u6362 / \u4FDD\u7559\u4E24\u8005",
  conflictRename: "\u91CD\u547D\u540D\uFF08\u81EA\u52A8 _1 \u540E\u7F00\uFF09",
  conflictReplace: "\u66FF\u6362\u65E7\u6587\u4EF6",
  conflictKeep: "\u4FDD\u7559\u4E24\u8005",
  urlRefreshHours: "URL \u81EA\u52A8\u5237\u65B0\uFF08\u5C0F\u65F6\uFF09",
  urlRefreshHoursHint: "\u8D85\u8FC7\u8BE5\u65F6\u957F\u7684 URL \u6587\u6863\u6BCF\u5C0F\u65F6\u81EA\u52A8\u91CD\u65B0\u6293\u53D6\u5E76\u66F4\u65B0\u7D22\u5F15\uFF080 = \u5173\u95ED\uFF09",
  resumeInterrupted: "\u91CD\u542F\u540E\u81EA\u52A8\u6062\u590D\u4E2D\u65AD\u7684\u5BFC\u5165",
  resumeInterruptedHint: "\u5173\u95ED\u540E\uFF0C\u91CD\u542F\u65F6\u4E2D\u65AD\u7684\u5BFC\u5165\u6807\u8BB0\u4E3A\u5931\u8D25\uFF08\u9700\u624B\u52A8\u91CD\u5EFA\uFF09\uFF0C\u4E0D\u518D\u81EA\u52A8\u91CD\u8DD1\u5D4C\u5165\uFF08Cherry Studio \u884C\u4E3A\uFF09",
  autoRetrieve: "\u81EA\u52A8\u68C0\u7D22\uFF08\u7528\u6237\u6D88\u606F\u8FDB\u6765\u65F6\u9884\u68C0\u7D22\u5E76\u6CE8\u5165\u76F8\u5173\u80CC\u666F\uFF09",
  injectUsagePrompt: "\u53EF\u7528\u77E5\u8BC6\u5E93\u63D0\u793A",
  injectUsagePromptHint: "\u6BCF\u6B21\u8BF7\u6C42\u4EC5\u63D0\u793A\u5E93\u540D\uFF1B\u5173\u95ED\u4E0D\u5F71\u54CD\u77E5\u8BC6\u5E93\u5DE5\u5177\u6216\u81EA\u52A8\u68C0\u7D22",
  autoRetrieveHint: "\u5F00\u542F\u540E\uFF0C\u6A21\u578B\u56DE\u7B54\u4E8B\u5B9E\u6027\u95EE\u9898\u65F6\u81EA\u52A8\u4F7F\u7528\u77E5\u8BC6\u5E93\u5185\u5BB9\uFF0C\u65E0\u9700\u663E\u5F0F\u63D0\u5230\u201C\u77E5\u8BC6\u5E93\u201D\uFF1B\u5173\u95ED\u540E\u4EC5\u6309\u9700\u8C03\u7528\uFF08knowledge_search \u5DE5\u5177 + \u663E\u5F0F\u8BF7\u6C42\uFF09",
  autoRetrieveWeight: "\u81EA\u52A8\u68C0\u7D22\u6743\u91CD\uFF08\u6BCF\u5E93\u53EF\u6CE8\u5165\u7684\u5206\u5757\u6570\uFF0C0 = \u4E0D\u53C2\u4E0E\uFF09",
  autoRetrieveWeightHint: "\u6BCF\u4E2A\u5E93\u5728\u4E00\u6B21\u81EA\u52A8\u68C0\u7D22\u6CE8\u5165\u4E2D\u6700\u591A\u8D21\u732E\u8BE5\u6570\u91CF\u7684\u5206\u5757\uFF080\u20135\uFF0C\u9ED8\u8BA4 3\uFF09\uFF1B\u6743\u91CD\u9AD8\u53EF\u8BA9\u8BE5\u5E93\u5185\u5BB9\u5360\u66F4\u591A\u4E0A\u4E0B\u6587\uFF0C0 \u5219\u5B8C\u5168\u6392\u9664\u8BE5\u5E93",
  localWorkerIdleTimeoutMs: "\u672C\u5730\u6A21\u578B worker \u7A7A\u95F2\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF0C0 = \u6A21\u578B\u5E38\u9A7B\uFF09",
  localWorkerIdleTimeoutMsHint: "\u672C\u5730\u5D4C\u5165\u6A21\u578B\u7A7A\u95F2\u8BE5\u65F6\u957F\u540E\u4F1A\u88AB\u5378\u8F7D\u4EE5\u91CA\u653E\u5185\u5B58\uFF08\u7EA6 600MB\uFF09\uFF0C\u4F46 worker \u8FDB\u7A0B\u4FDD\u7559\u2014\u2014onnxruntime \u7ED1\u5B9A\u53EA\u5728\u8FDB\u7A0B\u5185\u52A0\u8F7D\u4E00\u6B21\uFF0C\u4E0D\u4F1A\u51FA\u73B0 Linux \u4E0A\u7684\u91CD\u8F7D\u5931\u8D25\uFF08Module did not self-register\uFF09\uFF1B\u4E0B\u6B21\u8BF7\u6C42\u4ECE\u78C1\u76D8\u91CD\u8F7D\u6A21\u578B\uFF08\u7EA6 1 \u79D2\uFF09\u30020 = \u6A21\u578B\u5E38\u9A7B\uFF08\u6700\u5FEB\uFF0C\u5360\u7528\u5185\u5B58\uFF09",
  imageCaptionHint: "\u56FE\u8868\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09\uFF1A\u7528\u89C6\u89C9\u6A21\u578B\u63CF\u8FF0 PDF \u4E2D\u7684\u56FE\u7247/\u56FE\u8868\uFF0C\u63CF\u8FF0\u6587\u672C\u53EF\u88AB\u68C0\u7D22",
  imageCaptionOff: "\u5173\u95ED",
  imageCaptionOpenAI: "OpenAI \u517C\u5BB9\u89C6\u89C9\u6A21\u578B",
  imageCaptionOllama: "Ollama \u672C\u5730\u89C6\u89C9\u6A21\u578B",
  cacheDirTitle: "\u672C\u5730\u6A21\u578B\u7F13\u5B58\u76EE\u5F55",
  cacheDirHint: "\u5D4C\u5165 / \u91CD\u6392 / OCR \u6A21\u578B\u6587\u4EF6\u4E0B\u8F7D\u5230\u8FD9\u91CC\uFF08\u652F\u6301 ~ \u4E0E DSH_HOME \u53D8\u91CF\uFF09\u3002\u6CE8\u610F\uFF1A\u300C\u4FDD\u5B58\u300D\u53EA\u5207\u6362\u914D\u7F6E\u6307\u5411\u3001\u4E0D\u79FB\u52A8\u6587\u4EF6\uFF1B\u8981\u642C\u52A8\u5DF2\u6709\u6A21\u578B\u8BF7\u70B9\u300C\u8FC1\u79FB\u6A21\u578B\u5230\u6B64\u5904\u300D\u3002",
  cacheDirBrowse: "\u9009\u62E9\u6587\u4EF6\u5939",
  cacheDirMigrate: "\u8FC1\u79FB\u6A21\u578B\u5230\u6B64\u5904",
  cacheDirOpen: "\u6253\u5F00\u76EE\u5F55",
  cacheDirSaved: "\u5DF2\u4FDD\u5B58\u7F13\u5B58\u76EE\u5F55\uFF08\u4EC5\u5207\u6362\u914D\u7F6E\uFF0C\u6587\u4EF6\u672A\u79FB\u52A8\uFF1B\u5982\u9700\u79FB\u52A8\u5DF2\u6709\u6A21\u578B\u8BF7\u70B9\u300C\u8FC1\u79FB\u6A21\u578B\u5230\u6B64\u5904\u300D\uFF09",
  cacheDirMigrateNone: "\u6CA1\u6709\u53EF\u8FC1\u79FB\u7684\u6A21\u578B\u76EE\u5F55\uFF08\u6E90\u4E0E\u76EE\u6807\u76F8\u540C\uFF0C\u6216\u76EE\u6807\u76EE\u5F55\u5DF2\u5B58\u5728\u540C\u540D\u6761\u76EE\uFF09",
  ollamaTitle: "Ollama \u6A21\u578B",
  ollamaDesc: "\u901A\u8FC7 Ollama API \u4E0B\u8F7D\u6A21\u578B\uFF08\u5D4C\u5165\u3001\u89C6\u89C9\u7B49\uFF09\uFF0C\u4E0B\u8F7D\u540E\u53EF\u5728\u77E5\u8BC6\u5E93\u8BBE\u7F6E\u4E2D\u9009\u7528\uFF08\u5D4C\u5165\u63D0\u4F9B\u65B9\u9009 Ollama\uFF09\u3002\u9700\u5148\u5B89\u88C5\u5E76\u542F\u52A8 Ollama\uFF1Ahttps://ollama.com/download",
  ollamaInstalledTitle: "\u5DF2\u5B89\u88C5\u6A21\u578B\uFF08\u70B9\u51FB\u540D\u79F0\u586B\u5165\u8F93\u5165\u6846\uFF09",
  ollamaNeedInstall: "\uFF08\u63D0\u793A\uFF1A\u82E5\u6301\u7EED\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5\u5E76\u542F\u52A8 Ollama\uFF0C\u6216\u68C0\u67E5\u4E0A\u65B9\u5730\u5740\uFF09",
  ollamaRefresh: "\u5237\u65B0\u5DF2\u88C5\u6A21\u578B",
  ollamaPull: "\u4E0B\u8F7D\u6A21\u578B",
  ollamaRecommended: "\u63A8\u8350\u6A21\u578B\uFF08\u70B9\u51FB\u586B\u5165\uFF0C\u518D\u70B9\u4E0B\u8F7D\uFF09",
  ollamaEmbeddingHint: "\u5D4C\u5165\u6A21\u578B \u2014 \u77E5\u8BC6\u5E93\u8BBE\u7F6E\u300C\u5D4C\u5165\u63D0\u4F9B\u65B9\u300D\u9009 Ollama \u540E\u586B\u5165",
  ollamaVisionHint: "\u89C6\u89C9\u6A21\u578B \u2014 \u77E5\u8BC6\u5E93\u8BBE\u7F6E\u300C\u56FE\u8868\u63CF\u8FF0\u300D\u9009 Ollama \u540E\u586B\u5165",
  ollamaDelete: "\u79FB\u9664\u8BE5\u6A21\u578B\uFF08Ollama \u6B63\u5728\u8FD0\u884C\u8BE5\u6A21\u578B\u65F6\u4F1A\u5931\u8D25\uFF09",
  ollamaConfirmDelete: "\u786E\u8BA4\u79FB\u9664\uFF1F",
  chunkSeparator: "\u5206\u9694\u7B26",
  chunkSeparatorHint: "\u5207\u5206\u6587\u672C\u6240\u7528\u7684\u5206\u9694\u7B26\uFF08\u8F6C\u4E49\u5F62\u5F0F\uFF09\u3002\u5F00\u542F\u667A\u80FD\u5206\u6BB5\u65F6\u4F5C\u4E3A\u989D\u5916\u5207\u5206\u70B9\uFF1B\u5173\u95ED\u540E\u4EC5\u6309\u6B64\u5206\u9694\u7B26\u5207\u5206\u3002",
  reset: "\u6062\u590D\u9ED8\u8BA4",
  viewSource: "\u9884\u89C8\u539F\u6587",
  viewChunks: "\u67E5\u770B Chunks",
  more: "\u66F4\u591A",
  chunkChangeWarning: "\u5206\u5757\u8BBE\u7F6E\u7684\u4FEE\u6539\u53EA\u9488\u5BF9\u65B0\u6DFB\u52A0\u7684\u5185\u5BB9\u6709\u6548",
  topKHint: "\u6BCF\u6B21\u53EC\u56DE\u8FD4\u56DE\u7684\u6700\u5927\u6587\u6863\u7247\u6BB5\u6570\uFF0C\u8D8A\u5927\u8986\u76D6\u8D8A\u591A\u4F46\u6D88\u8017\u66F4\u591A\u4E0A\u4E0B\u6587\u3002",
  thresholdHint: "\u7528\u4E8E\u8FC7\u6EE4\u4F4E\u76F8\u5173\u6027\u91CD\u6392\u7247\u6BB5\u7684\u76F8\u4F3C\u5EA6\u9608\u503C\uFF0C\u6570\u503C\u8D8A\u9AD8\u53EC\u56DE\u8D8A\u4E25\u683C\u3002",
  providerLocal: "\u672C\u5730\u6A21\u578B",
  localModelHint: "\u8FDB\u7A0B\u5185\u63A8\u7406\uFF08transformers.js\uFF09\uFF0C\u65E0\u9700\u8054\u7F51\u670D\u52A1\uFF1B\u9996\u6B21\u4F7F\u7528\u9700\u4E0B\u8F7D\u6A21\u578B\u6743\u91CD\u3002\u6A21\u578B\u4E3A Hugging Face \u4ED3\u5E93 id\uFF0C\u9ED8\u8BA4 onnx-community/Qwen3-Embedding-0.6B-ONNX",
  noLocalModelsReady: "\u6682\u65E0\u5DF2\u4E0B\u8F7D\u7684\u672C\u5730\u6A21\u578B\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\u300D\u4E0B\u8F7D",
  noOllamaModels: "\u6682\u65E0\u5DF2\u5B89\u88C5\u7684 Ollama \u6A21\u578B\uFF0C\u8BF7\u5728\u300C\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\u300D\u62C9\u53D6",
  selectModelPlaceholder: "\u8BF7\u9009\u62E9\u6A21\u578B",
  ollamaUnreachable: "\u65E0\u6CD5\u8FDE\u63A5 Ollama\uFF08\u68C0\u67E5\u5730\u5740\u6216\u662F\u5426\u5DF2\u542F\u52A8\uFF09",
  embeddingSwitchWarning: "\u26A0 \u5207\u6362\u5D4C\u5165\u6A21\u578B\u4F1A\u4F7F\u672C\u5E93\u5DF2\u6709\u5411\u91CF\u5168\u90E8\u5931\u6548\uFF0C\u4FDD\u5B58\u4F1A\u88AB\u62D2\u7EDD\u2014\u2014\u8BF7\u6539\u7528\u300C\u91CD\u5EFA\u77E5\u8BC6\u5E93\u300D\u4EE5\u65B0\u6A21\u578B\u91CD\u5EFA\uFF08\u6216\u5148\u6E05\u7A7A\u672C\u5E93\u6587\u6863\uFF09",
  staleModelSuffix: "\uFF08\u672A\u5B89\u88C5\uFF09",
  embeddingModelMissingHint: "\u5D4C\u5165\u6A21\u578B\u4F7F\u7528\u672C\u5730\u6A21\u578B\uFF0C\u4F46\u5C1A\u672A\u4E0B\u8F7D\u2014\u2014\u5BFC\u5165\u7684\u5185\u5BB9\u5C06\u65E0\u6CD5\u5411\u91CF\u5316\u68C0\u7D22\u3002\u8BF7\u5148\u5230\u300C\u8BBE\u7F6E \u2192 \u672C\u5730\u6A21\u578B\u300D\u4E0B\u8F7D\u5D4C\u5165\u6A21\u578B\uFF08\u7EA6 585MB\uFF09\u3002",
  localModelStatusLabel: "\u672C\u5730\u5D4C\u5165\u6A21\u578B",
  goToSettings: "\u53BB\u8BBE\u7F6E",
  localModelDownloadingTitle: "\u672C\u5730\u5D4C\u5165\u6A21\u578B\u4E0B\u8F7D\u4E2D",
  localModelNotReadyTitle: "\u672C\u5730\u5D4C\u5165\u6A21\u578B\u672A\u5C31\u7EEA",
  localModelNotReadyHint: "\u672A\u5C31\u7EEA\u524D\u5BFC\u5165\u7684\u5185\u5BB9\u53EA\u80FD\u5173\u952E\u8BCD\u68C0\u7D22\uFF0C\u65E0\u6CD5\u5411\u91CF\u5316\u3002\u8BF7\u4E0B\u8F7D\u6216\u68C0\u67E5\u672C\u5730\u6A21\u578B\u3002",
  localModelErrorTitle: "\u672C\u5730\u5D4C\u5165\u6A21\u578B\u52A0\u8F7D\u5931\u8D25",
  openFolder: "\u6253\u5F00",
  conflictDialogTitle: "\u540C\u540D\u6587\u4EF6",
  conflictDialogMessage: "\u6709 {count} \u4E2A\u6587\u4EF6\u4E0E\u77E5\u8BC6\u5E93\u4E2D\u5DF2\u6709\u6587\u4EF6\u540C\u540D\uFF0C\u5982\u4F55\u5904\u7406\uFF1F",
  conflictKeepAll: "\u5168\u90E8\u91CD\u547D\u540D\uFF08\u4FDD\u7559\u4E24\u8005\uFF09",
  conflictReplaceAll: "\u66FF\u6362\u73B0\u6709",
  conflictSkipped: "\u4E2A\u540C\u540D\u6587\u4EF6\u5DF2\u8DF3\u8FC7\uFF08\u4FDD\u7559\u73B0\u6709\uFF09",
  localModelReady: "\u672C\u5730\u6A21\u578B\u5C31\u7EEA",
  localModelDownloading: "\u6A21\u578B\u4E0B\u8F7D\u4E2D",
  localModelError: "\u6A21\u578B\u52A0\u8F7D\u5931\u8D25",
  localModelsNav: "\u672C\u5730\u6A21\u578B",
  localModelsTitle: "\u672C\u5730\u6A21\u578B",
  localModelsDesc: "\u4E0B\u8F7D\u3001\u9A8C\u8BC1\u5E76\u7BA1\u7406\u672C\u5730\u5D4C\u5165\u548C\u91CD\u6392\u6A21\u578B\uFF1B\u53EA\u6709\u901A\u8FC7\u5065\u5EB7\u68C0\u67E5\u7684\u91CD\u6392\u6A21\u578B\u624D\u4F1A\u51FA\u73B0\u5728\u77E5\u8BC6\u5E93\u8BBE\u7F6E\u4E2D\u3002",
  localModelDownload: "\u4E0B\u8F7D",
  localModelRetry: "\u91CD\u8BD5",
  localModelRemove: "\u5220\u9664",
  localModelCancel: "\u53D6\u6D88",
  customRerankTitle: "\u9AD8\u7EA7\uFF1A\u6DFB\u52A0\u81EA\u5B9A\u4E49\u672C\u5730 reranker",
  customRerankHint: "\u5B9E\u9A8C\u6027\u529F\u80FD\uFF1A\u4EC5\u652F\u6301\u65E0\u9700\u8FDC\u7A0B\u81EA\u5B9A\u4E49\u4EE3\u7801\u3001\u5E76\u80FD\u8FD4\u56DE\u5355 logit \u7684 Hugging Face ONNX sequence-classification \u6A21\u578B\u3002",
  customRerankAccept: "\u6211\u4E86\u89E3\u81EA\u5B9A\u4E49\u6A21\u578B\u5C5E\u4E8E\u5B9E\u9A8C\u6027\u652F\u6301\uFF0C\u5E76\u540C\u610F\u4E0B\u8F7D\u540E\u6267\u884C\u672C\u5730\u517C\u5BB9\u6027\u81EA\u68C0",
  customRerankAdd: "\u6DFB\u52A0\u5E76\u9A8C\u8BC1",
  officialSupport: "\u5B98\u65B9\u652F\u6301",
  experimentalSupport: "\u5B9E\u9A8C\u6027",
  rerankRevalidate: "\u91CD\u65B0\u9A8C\u8BC1",
  rerankValidating: "\u6B63\u5728\u9A8C\u8BC1\u517C\u5BB9\u6027",
  localRerankTimeoutMs: "\u672C\u5730\u91CD\u6392\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF09",
  localRerankTimeoutHint: "\u5305\u542B\u6392\u961F\u7B49\u5F85\uFF1B\u8D85\u65F6\u540E\u4FDD\u7559\u539F\u59CB\u68C0\u7D22\u987A\u5E8F\uFF0C\u5E76\u81EA\u52A8\u9694\u79BB\u5361\u4F4F\u7684\u91CD\u6392\u8FDB\u7A0B\u3002",
  hfMirror: "Hugging Face \u955C\u50CF\u7AD9",
  hfMirrorHint: "\u65E0\u6CD5\u76F4\u8FDE huggingface.co \u65F6\u586B\u955C\u50CF\u5730\u5740\uFF08\u5982 https://hf-mirror.com\uFF09\uFF0C\u7ACB\u5373\u751F\u6548\uFF1B\u7559\u7A7A\u4F7F\u7528\u5B98\u65B9\u6E90\u6216 HF_ENDPOINT \u73AF\u5883\u53D8\u91CF\u3002",
  hfMirrorSave: "\u4FDD\u5B58",
  newGroup: "\u65B0\u5EFA\u5206\u7EC4",
  groupName: "\u5206\u7EC4\u540D\u79F0",
  renameGroup: "\u91CD\u547D\u540D\u5206\u7EC4",
  ungrouped: "\u9ED8\u8BA4",
  recallHistory: "\u641C\u7D22\u5386\u53F2",
  recallEmptyTitle: "\u8F93\u5165\u67E5\u8BE2\u8BED\u53E5\u5F00\u59CB\u68C0\u7D22\u6D4B\u8BD5",
  recallEmptyDesc: "\u7ED3\u679C\u5C06\u5C55\u793A\u5339\u914D\u7684\u6587\u6863\u7247\u6BB5\u548C\u5206\u6570",
  recallSearching: "\u6B63\u5728\u68C0\u7D22...",
  recallResultsSuffix: "\u4E2A\u7ED3\u679C",
  recallTopScore: "\u6700\u9AD8",
  recallRelevance: "\u76F8\u5173\u5EA6",
  recallCopy: "\u590D\u5236\u5F15\u7528",
  recallExpand: "\u5C55\u5F00\u7247\u6BB5",
  recallCollapse: "\u6536\u8D77\u7247\u6BB5",
  recallHistoryClear: "\u6E05\u7A7A",
  recallHistoryRemove: "\u5220\u9664\u5386\u53F2",
  backToParent: "\u8FD4\u56DE\u4E0A\u7EA7",
  back: "\u8FD4\u56DE",
  ready: "\u5C31\u7EEA",
  updatedAtText: "\u66F4\u65B0\u4E8E",
  updatedAtColumn: "\u66F4\u65B0\u65F6\u95F4",
  moveToGroup: "\u79FB\u52A8\u5230",
  confirmDeleteGroup: "\u5220\u9664\u540E\uFF0C\u8BE5\u5206\u7EC4\u4E0B\u7684\u77E5\u8BC6\u5E93\u5C06\u79FB\u81F3\u9ED8\u8BA4\u5206\u7EC4\u3002",
  selected: "\u5DF2\u9009",
  bulkReindex: "\u91CD\u65B0\u7D22\u5F15",
  bulkDelete: "\u5220\u9664",
  type: "\u7C7B\u578B",
  status: "\u72B6\u6001",
  selectAll: "\u5168\u9009",
  noResults: "\u65E0\u7ED3\u679C",
  embeddingFailed: "\u5D4C\u5165\u5931\u8D25",
  confirmBulkDelete: "\u5220\u9664\u9009\u4E2D\u7684 {count} \u4EFD\u6587\u6863\u53CA\u5176\u5168\u90E8\u5206\u5757\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
  confirmCascadeDeleteTitle: "\u786E\u8BA4\u7EA7\u8054\u5220\u9664",
  confirmCascadeDelete: "\u8BE5\u76EE\u5F55\u5305\u542B\u5B50\u9879\uFF0C\u5220\u9664\u4F1A\u8FDE\u540C\u6574\u68F5\u5B50\u6811\u4E00\u5E76\u79FB\u9664\u3002\u4EE5\u4E0B\u5185\u5BB9\u5C06\u88AB\u6C38\u4E45\u5220\u9664\uFF1A",
  confirmCascadeBulkDeleteTitle: "\u786E\u8BA4\u7EA7\u8054\u5220\u9664",
  confirmCascadeBulkDelete: "\u9009\u4E2D\u9879\u4E2D\u5305\u542B\u975E\u7A7A\u76EE\u5F55\uFF0C\u5220\u9664\u4F1A\u8FDE\u540C\u5B83\u4EEC\u7684\u6574\u68F5\u5B50\u6811\u4E00\u5E76\u79FB\u9664\u3002\u4EE5\u4E0B\u5185\u5BB9\u5C06\u88AB\u6C38\u4E45\u5220\u9664\uFF1A",
  cascadeImpactDirectories: "\u76EE\u5F55",
  cascadeImpactFiles: "\u6587\u4EF6",
  cascadeImpactChunks: "\u5206\u5757",
  cascadeImpactSnapshots: "\u539F\u59CB\u5FEB\u7167",
  cascadeDeleteConfirm: "\u7EA7\u8054\u5220\u9664",
  syncCreated: "\u65B0\u5EFA",
  syncUpdated: "\u66F4\u65B0",
  syncDeleted: "\u5220\u9664",
  syncUnchanged: "\u672A\u53D8\u5316",
  syncFailed: "\u5931\u8D25",
  syncNoChanges: "\u672A\u68C0\u6D4B\u5230\u53D8\u5316",
  statusPollFailed: "\u72B6\u6001\u5237\u65B0\u5931\u8D25",
  rerankLastValidated: "\u6700\u8FD1\u9A8C\u8BC1\uFF1A",
  noLocalModels: "\u6682\u65E0\u672C\u5730\u6A21\u578B",
  lexicalOnly: "\u4EC5\u5173\u952E\u8BCD",
  lexicalOnlyHint: "\u672A\u914D\u7F6E\u5411\u91CF\u5316\u6A21\u578B\uFF0C\u5F53\u524D\u4EC5\u5173\u952E\u8BCD\u68C0\u7D22\u3002\u70B9\u53F3\u4E0A\u89D2\u300C\u8BBE\u7F6E\u300D\u914D\u7F6E\u5D4C\u5165\u6A21\u578B\u53EF\u542F\u7528\u8BED\u4E49\u68C0\u7D22",
  embeddingNotConfigured: "\u672C\u77E5\u8BC6\u5E93\u672A\u914D\u7F6E\u5411\u91CF\u5316\uFF0C\u76EE\u524D\u4EC5\u5173\u952E\u8BCD\u68C0\u7D22\u3002\u70B9\u300C\u53BB\u8BBE\u7F6E\u300D\u9009\u62E9\u5D4C\u5165\u6A21\u578B\uFF08OpenAI / Ollama / \u672C\u5730\u6A21\u578B\uFF09\uFF0C\u4FDD\u5B58\u540E\u91CD\u65B0\u7D22\u5F15\u5373\u53EF\u542F\u7528\u8BED\u4E49\u53EC\u56DE\u3002",
  rebuildBase: "\u91CD\u5EFA\u77E5\u8BC6\u5E93",
  rebuildHint: "\u5D4C\u5165\u6A21\u578B\u5DF2\u66F4\u6539\uFF0C\u73B0\u6709\u5411\u91CF\u4E0E\u65B0\u6A21\u578B\u4E0D\u5339\u914D\uFF0C\u8BF7\u91CD\u5EFA\u77E5\u8BC6\u5E93\u4EE5\u91CD\u65B0\u751F\u6210\u5411\u91CF\u3002",
  previewTruncated: "\u5185\u5BB9\u8FC7\u5927\uFF0C\u4EC5\u663E\u793A\u524D {count} \u5B57\u7B26\u3002",
  chunksTruncated: "\u4EC5\u52A0\u8F7D\u524D {loaded} \u4E2A\u5206\u5757\uFF08\u5171 {total} \u4E2A\uFF09\u3002",
  chunkExpand: "\u5C55\u5F00\u6B64\u5206\u5757",
  chunkCollapse: "\u6536\u8D77\u6B64\u5206\u5757",
  chunksExpandAll: "\u5168\u90E8\u5C55\u5F00",
  chunksCollapseAll: "\u5168\u90E8\u6536\u8D77",
  firstUploadTitle: "\u4E0A\u4F20\u7B2C\u4E00\u4E2A\u6570\u636E\u6E90",
  emptyFolder: "\u8BE5\u6587\u4EF6\u5939\u4E3A\u7A7A",
  statusProcessing: "\u5D4C\u5165\u4E2D",
  statusParsing: "\u89E3\u6790\u4E2D",
  statusPending: "\u7B49\u5F85\u4E2D",
  errorInterrupted: "\u5BFC\u5165\u56E0\u7A0B\u5E8F\u5173\u95ED\u800C\u4E2D\u65AD\u2014\u2014\u8BF7\u91CD\u5EFA\u4EE5\u7EE7\u7EED",
  errorDimensionMismatch: "\u5D4C\u5165\u5411\u91CF\u7EF4\u5EA6\u4E0D\u5339\u914D\uFF08\u5DF2\u5207\u6362\u6A21\u578B\uFF1F\uFF09\u2014\u2014\u8BF7\u4F7F\u7528\u300C\u91CD\u5EFA\u77E5\u8BC6\u5E93\u300D\u4EE5\u65B0\u6A21\u578B\u91CD\u5EFA",
  errorParseFailed: "\u6587\u6863\u89E3\u6790\u5931\u8D25",
  errorEmbeddingProvider: "\u5D4C\u5165\u670D\u52A1/\u6A21\u578B\u8C03\u7528\u5931\u8D25",
  statusImporting: "\u5BFC\u5165\u4E2D",
  restoreHint: "\u5C06\u4F7F\u7528\u5F53\u524D\u5D4C\u5165\u6A21\u578B\u65B0\u5EFA\u4E00\u4E2A\u77E5\u8BC6\u5E93\uFF0C\u5E76\u91CD\u65B0\u7D22\u5F15\u6240\u6709\u6587\u6863\u3002\u53EF\u9009\u66F4\u6362\u5D4C\u5165\u6A21\u578B\uFF08\u6362\u6A21\u578B\u91CD\u5EFA\uFF09\u3002",
  restoreKeepModel: "\u6CBF\u7528\u539F\u5E93\u914D\u7F6E",
  modelId: "\u6A21\u578B ID",
  baseUrlLabel: "API \u5730\u5740",
  apiKeyLabel: "API Key",
  loadMore: "\u52A0\u8F7D\u66F4\u591A",
  kbInvocation: "\u77E5\u8BC6\u5E93\u8C03\u7528",
  kbOn: "\u5F00",
  kbOff: "\u5173",
  kbAll: "\u5168\u90E8",
  kbScopeHint: "\u7559\u7A7A = \u5168\u90E8\u5E93\u53EF\u7528",
  kbWorkspace: "\u5F00\u653E\u5DE5\u4F5C\u533A",
  kbWorkspaceAll: "\u6240\u6709\u5DE5\u4F5C\u533A",
  kbWorkspaceNone: "\u672A\u5F00\u653E\u4EFB\u4F55\u5DE5\u4F5C\u533A",
  kbWorkspaceHint: "\u53EA\u6709\u5728\u6B64\u5217\u8868\u4E2D\u7684\u5DE5\u4F5C\u533A\u53EF\u4EE5\u8C03\u7528\u77E5\u8BC6\u5E93\uFF1B\u7559\u7A7A = \u5168\u90E8\u5173\u95ED\u3002\u5F53\u524D\u5DE5\u4F5C\u533A\u4E0D\u5728\u5217\u8868\u4E2D\u65F6\u4E0D\u6CE8\u5165\u3001\u4E5F\u4E0D\u5141\u8BB8\u8C03\u7528\u5DE5\u5177\u3002",
  kbWorkspaceCurrent: "\u5F53\u524D\u5DE5\u4F5C\u533A",
  kbWorkspaceOff: "\u672A\u5F00\u653E",
  dragResize: "\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6",
  loadMoreChunks: "\u52A0\u8F7D\u66F4\u591A\u5206\u5757",
  timeJustNow: "\u521A\u521A",
  timeMinutes: "{n} \u5206\u949F\u524D",
  timeHours: "{n} \u5C0F\u65F6\u524D",
  timeDays: "{n} \u5929\u524D",
  cacheDirPickUnavailable: "\u6587\u4EF6\u5939\u9009\u62E9\u4E0D\u53EF\u7528\uFF08\u5F53\u524D\u73AF\u5883\u65E0\u76EE\u5F55\u9009\u62E9\u80FD\u529B\uFF09",
  cacheDirOpenUnavailable: "\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u6253\u5F00\u76EE\u5F55\uFF1B\u53EF\u624B\u52A8\u590D\u5236\u76EE\u5F55\u8DEF\u5F84\u5230\u6587\u4EF6\u7BA1\u7406\u5668",
  cacheDirMigrated: "\u6A21\u578B\u7F13\u5B58\u5DF2\u8FC1\u79FB\u5230 {to}\uFF08\u79FB\u52A8\u6761\u76EE\uFF1A{count}\uFF09",
  mineruOption: "MinerU\uFF08\u4E91 API\uFF0C\u6587\u4EF6\u5C06\u4E0A\u4F20\uFF09",
  mineruHostPlaceholder: "API Host\uFF08\u9ED8\u8BA4 https://mineru.net\uFF09",
  visionModelPlaceholder: "\u89C6\u89C9\u6A21\u578B\uFF08\u5982 qwen-vl-plus\u3001gpt-4o-mini\uFF09",
  captionBaseUrlOllamaPlaceholder: "Ollama \u5730\u5740\uFF08\u9ED8\u8BA4 http://127.0.0.1:11434\uFF09",
  captionBaseUrlPlaceholder: "API \u5730\u5740\uFF08\u7559\u7A7A\u7528\u5D4C\u5165\u6A21\u578B\u5730\u5740\uFF09",
  citationSource: "\uFF08\u77E5\u8BC6\u5E93 {id}\uFF09",
  error: "\u51FA\u9519\u4E86"
};
var en = {
  mineruLocalOption: "MinerU (local / self-hosted V1)",
  mineruLocalDesc: "Files are sent only to this self-hosted address. Install the service separately; this plugin does not download models or switch to cloud automatically. Parsing powered by MinerU.",
  mineruLocalUrl: "Service URL",
  mineruLocalKey: "Service key (optional)",
  mineruTier: "Parsing tier",
  mineruFlash: "Flash \xB7 native documents / preview",
  mineruBasic: "Basic \xB7 CPU OCR, tables and formulas",
  mineruStandard: "Standard \xB7 small models + VLM",
  mineruAdvanced: "Advanced \xB7 more inference compute",
  processorCheck: "Test saved configuration",
  processorChecking: "Connecting\u2026",
  processorCheckSaved: "Save processor changes before testing. This checks capabilities without uploading a file.",
  processorCheckSuccess: "Connected",
  processingTimeout: "Document processing timeout (ms)",
  structuredChunking: "Structure-aware chunking",
  structuredChunkingHint: "Preserve tables, formulas and captions in structured documents; ordinary text keeps its existing chunking behavior.",
  processingInfo: "Parsing provenance",
  processingComplete: "Complete",
  processingPartial: "Partially parsed",
  processingUnknown: "Completeness unknown",
  processingReused: "Existing evidence reused",
  reparseDocument: "Reparse source",
  rechunkDocument: "Rechunk saved parsing result",
  evidence: "Structured evidence",
  evidenceEmpty: "No structured evidence is available for this document.",
  evidenceNext: "Continue reading",
  evidenceBack: "Previous excerpt",
  evidenceRetry: "Reload",
  mineruDeployTitle: "MinerU local parsing \xB7 Deployment preflight",
  mineruDownloadSource: "Model download source",
  mineruPythonSource: "Python package index",
  mineruPythonSourceHint: "Used only by the isolated MinerU environment. Defaults to official PyPI. Save and rerun preflight after changing it.",
  mineruSaveSource: "Save package source",
  mineruCurrentInstall: "Currently verified installation",
  mineruPhaseAbsent: "Not deployed",
  mineruPhaseEnvironment: "Preparing isolated environment",
  mineruPhaseProbe: "Parsing test PDF",
  mineruPhaseReady: "Parse self-test passed",
  mineruPhaseInterrupted: "Previous task interrupted; run preflight",
  mineruServiceRunning: "Service running",
  mineruServiceStarting: "Service starting",
  mineruServiceStopping: "Service stopping",
  mineruServiceError: "Service error",
  mineruServiceStopped: "Service stopped",
  mineruCancelTask: "Cancel task",
  mineruStart: "Start service",
  mineruStop: "Stop service",
  mineruUse: "Use as global default parser",
  mineruApplied: "Global default updated. Existing per-base overrides still take precedence.",
  mineruExternalCopy: "External models are copied into managed storage; the source stays read-only. Reusing downloads still requires disk space for the copy.",
  mineruPrepare: "Prepare local MinerU",
  mineruNotNow: "Not now",
  mineruConfirm: "Confirm installation and download",
  pythonDetect: "Rescan environments",
  pythonPath: "Python executable path",
  pythonVerify: "Verify and remember",
  pythonChoose: "Choose a detected interpreter",
  pythonEligible: "Eligible to attempt setup",
  pythonMissing: "No eligible environment found. Enter a Python executable path and verify it.",
  pythonLimited: "Discovery reached its limit. Specify other environments manually.",
  pythonHint: "Detection does not install software. Requires stable 64-bit CPython 3.10\u20133.14 with venv and ensurepip. Eligibility does not verify MinerU dependencies or parsing.",
  pythonStages: "Deployment validation",
  pythonRemembered: "Remembered path",
  pythonRefreshHint: "Restored from browser settings. Rescan before deployment to confirm the interpreter is still available.",
  pythonManualHint: "For example: C:\\Python313\\python.exe or /usr/bin/python3.",
  pythonOtherDetected: "Other detected environments",
  pythonDetectedDetails: "Detected Python details",
  pythonSource: "Source",
  pythonVersion: "Version",
  pythonArchitecture: "Architecture",
  pythonStepInterpreter: "Interpreter",
  pythonStepEnvironment: "Isolated environment",
  pythonStepDependencies: "Dependencies",
  pythonStepInference: "Real parsing",
  pythonReasonProbe: "Could not start interpreter or read its details",
  pythonReasonVersion: "Python 3.10\u20133.14 required",
  pythonReasonImplementation: "CPython only",
  pythonReasonArchitecture: "64-bit Python required",
  pythonReasonPrerelease: "Stable release required",
  pythonReasonThreaded: "Free-threaded builds are not supported",
  pythonReasonVenv: "venv module is missing",
  pythonReasonPip: "ensurepip module is missing",
  mineruManagedPreview: "Experimental managed deployment: Basic / ONNX only. Creates an isolated environment from the selected Python without modifying existing environments. Real-model and cross-platform acceptance are pending. Use an external service for Standard/Advanced.",
  mineruConfirmPreparation: "Creates an isolated Python environment in the chosen directory, installs MinerU 4.0.6 and dependencies from PyPI, downloads pinned models from Hugging Face, and parses a public test PDF. Total runtime size is unknown; allow additional disk space. Confirm acceptance of upstream software and model licenses. Existing parser settings will not switch automatically.",
  mineruDeployDescription: "Optional isolated deployment. Embedding and reranking models are separate, and existing cloud API settings stay unchanged. Basic uses ONNX parsing models.",
  mineruDeployRoot: "Dedicated installation directory",
  mineruDeployExisting: "Existing MinerU model directory (optional, read-only verification)",
  mineruDeployBrowse: "Choose directory",
  mineruDeployCheck: "Check paths and capacity",
  mineruDeployChecking: "Verifying files\u2026",
  mineruDeployTotal: "Total model size",
  mineruDeployReuse: "Verified reusable",
  mineruDeployRemaining: "Model download remaining",
  mineruDeployUnknownRuntime: "Model files only. Python, runtime and dependency sizes are not yet known and are not included above.",
  mineruDeployIncomplete: "Existing model files are missing or do not match their fingerprints. This directory will not be modified; choose a complete model directory or clear this option.",
  mineruDeploySpace: "Insufficient space for model downloads and staging.",
  mineruDeployPreflightOnly: "Preparation creates a Python environment in the dedicated directory, installs MinerU, and downloads its models. The parser currently used by your knowledge base will not switch automatically.",
  sourcePage: "Source page {page}",
  sourceBlock: "Block",
  sourceRegion: "Block region (normalized coordinates)",
  sourceAsset: "View asset",
  sourceUnavailable: "Source location unknown",
  stageQueued: "Queued",
  stageChecking: "Checking service",
  stageUploading: "Uploading to configured service",
  stageParsing: "Parsing",
  stageDownloading: "Downloading results",
  stageNormalizing: "Normalizing evidence",
  stageIndexing: "Indexing",
  stageCompleted: "Completed",
  stageFailed: "Failed",
  stageCanceled: "Canceled",
  nav: "Knowledge",
  newBase: "New base",
  baseName: "Name",
  baseDescription: "Description",
  create: "Create",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  rename: "Rename",
  renameDoc: "Rename document",
  confirmDeleteBase: "After deletion the knowledge base cannot be restored.",
  documents: "Documents",
  addText: "Add text",
  textTitlePlaceholder: "Name this note",
  textContentPlaceholder: "Type note content...",
  textContentLabel: "Content",
  addTextButton: "Add",
  addDocument: "Add Data Source",
  tabText: "Note",
  tabFile: "Files",
  tabUrl: "Link",
  uploadAll: "Upload all",
  queuedFiles: "files queued",
  processing: "Processing\u2026",
  searchBases: "Search bases\u2026",
  noDocsHint: "Paste text, upload files, or import a URL to get started",
  baseSettings: "Base settings",
  editBase: "Edit base",
  confirmDeleteDoc: "Delete this document and all its chunks?",
  uploaded: "imported",
  importFailed: "import failed",
  tooManyFiles: "At most {count} files per selection; split the import",
  listEndReached: "End of list",
  unsupportedFilesSkipped: "{count} unsupported file(s) skipped",
  resolvingConflict: "Resolving\u2026",
  fileTooLarge: '"{name}" exceeds 22MB \u2014 cannot upload (the upload API caps at ~24MB); skipped',
  noSupportedFiles: "No supported files in the selection (hidden files and unsupported formats are skipped)",
  skippedFiles: "Skipped {count} unsupported files",
  bulkReindexSkipped: "skipped {count} in progress",
  bulkReindexNone: "All selected documents are still processing \u2014 try again later",
  dragToUpload: "Drop to upload",
  pdfTooLarge: "File exceeds 100MB \u2014 cannot preview inline; download it to view",
  pdfPreviewFailed: "Failed to load PDF preview",
  ocrTitle: "Local OCR (scanned documents)",
  ocrDesc: "Download the PaddleOCR models (~25MB, full Chinese recognition); scanned PDFs (no text layer) are then OCRed automatically and indexed",
  ocrDownload: "Download OCR models",
  ocrRemove: "Remove OCR models",
  processorBuiltinDesc: "Built-in processor: parses every supported format locally; scanned PDFs are OCRed automatically once the OCR models are downloaded (Settings \u2192 Local Models)",
  processorMineruDesc: "PDFs are uploaded to the configured MinerU cloud service. Failures may fall back to local parsing with a recorded warning. Get an API key at mineru.net.",
  perBaseHint: "Leave empty to use global settings",
  uploadFile: "Upload file",
  uploadButton: "Click to select files or drag them here",
  dragHint: "Supports PDF, DOCX, MD, XLSX, TXT, CSV",
  importUrl: "Import a single webpage",
  urlPlaceholder: "https://example.com",
  urlDesc: "Enter a webpage URL:",
  urlHelp: "The page text will be fetched and indexed automatically",
  importUrlButton: "Import",
  reindex: "Reindex",
  reindexButton: "Reindex",
  reindexDone: "reindexed",
  refreshUrl: "Refresh snapshot",
  urlRefreshed: "refreshed",
  urlUnchanged: "page unchanged",
  chunks: "Chunks",
  preview: "Preview",
  rawText: "Raw text",
  close: "Close",
  search: "Search test",
  searchPlaceholder: "Enter test query...",
  searchButton: "Search",
  searchMode: "Search mode",
  modeAuto: "Auto",
  modeHybrid: "Hybrid (BM25 + vector)",
  modeVector: "Vector",
  modeLexical: "Lexical",
  threshold: "Similarity Threshold",
  settings: "Settings",
  advancedSettings: "Advanced Settings",
  embeddingProvider: "Embedding Model",
  providerOpenAI: "OpenAI-compatible",
  providerOllama: "Ollama (local)",
  providerNone: "Disabled",
  embeddingBaseUrl: "Base URL",
  embeddingModel: "Model",
  embeddingApiKey: "API key (optional)",
  chunkSize: "Chunk Size",
  chunkOverlap: "Overlap Size",
  topK: "Top K",
  retrievalTuning: "Retrieval and context",
  mmrDiversity: "Diversity (MMR, 0=off)",
  rrfVectorWeight: "Vector fusion weight",
  rrfVectorWeightHint: "Relative weight of the vector lane in hybrid fusion (0.1\u20135, 1=balanced; raise for semantic questions)",
  siblingChunks: "Context stitching",
  siblingChunksHint: "Neighbouring chunks (\xB1) attached to each hit (0\u20133, 0=off; gives answers the full paragraph)",
  batchSize: "Embedding batch size",
  stats: "Stats",
  statsDocs: "docs",
  statsSourceDocs: "source items",
  statsStoredDocs: "parsed docs",
  statsSourceDocsTitle: "Items tracked from the source (folders + files)",
  statsStoredDocsTitle: "Documents actually parsed and stored as raw copies in the cache",
  statsChunks: "chunks",
  statsChars: "chars",
  statsTokens: "~tokens",
  statsDims: "vector dims",
  dimensionProbeFailed: "Embedding probe failed",
  dimensionProbing: "Probing\u2026",
  embedded: "embedded",
  notEmbedded: "not embedded",
  noBases: "No knowledge bases",
  selectBase: "Select a knowledge base",
  noDocuments: "No data sources",
  docCount: " docs",
  chunkCount: " chunks",
  tabDir: "Directory",
  tabPath: "Path",
  pathDesc: "Absolute path to a directory or file",
  sourcePathEdit: "Edit source path",
  sourcePathPrompt: "Source path",
  pathImportPartial: "Import finished: {count} succeeded, {errors} failed",
  dirPlaceholder: "Enter a local directory path, e.g. D:\\docs\\policy",
  importDirButton: "Import",
  conflictTitle: "Same-name source",
  conflictMessage: "Some sources have the same name as items already in this base. How to proceed?",
  keepAll: "Keep both",
  replace: "Replace",
  rerankModel: "Rerank model",
  rerankBaseUrl: "Rerank base URL",
  rerankApiKey: "Rerank API key (optional)",
  rerankHint: "Model used to rerank initial retrieval results and improve final chunk relevance.",
  modelLabel: "Model",
  elapsed: "latency",
  reranked: "reranked",
  recallTest: "Recall Test",
  addSource: "Add Data Source",
  docProcessing: "File Processing",
  docProcessingHint: "Document preprocessing runs automatically during document import. Choosing the right provider can improve document parsing quality.",
  processorBuiltin: "Built-in parser (PDF / DOCX / PPTX / XLSX / EPUB / HTML / text)",
  smartChunk: "Smart Chunking",
  smartChunkHint: "Automatically split along Markdown structure (headings, code blocks, paragraphs) and never split inside a code block. Turn off to split purely by the separator.",
  semanticChunk: "Semantic chunking",
  semanticChunkHint: "Embed paragraphs and merge adjacent similar ones (needs an embedding provider; off = heading/paragraph chunking)",
  semanticChunkThreshold: "Merge threshold",
  semanticChunkThresholdHint: "Start a new chunk when adjacent segments fall below this cosine (default 0.75); higher = smaller, more focused chunks",
  chunkTokenLimit: "Chunk token limit",
  chunkTokenLimitHint: "Chunks above this token count split further at sentence/comma/space boundaries (0 = off); set within your local model's context window",
  conflictStrategy: "Same-name conflict",
  conflictStrategyHint: "When an imported file matches an existing name: rename (auto _1 suffix) / replace / keep both",
  conflictRename: "Rename (auto _1 suffix)",
  conflictReplace: "Replace the old file",
  conflictKeep: "Keep both",
  urlRefreshHours: "URL auto-refresh (hours)",
  urlRefreshHoursHint: "URL documents older than this are re-fetched and re-indexed hourly (0 = off)",
  resumeInterrupted: "Resume interrupted imports on restart",
  resumeInterruptedHint: "When off, imports interrupted by a shutdown are marked failed instead of auto re-embedding (Cherry Studio behavior)",
  autoRetrieve: "Auto-retrieve (pre-search user messages and inject relevant background)",
  injectUsagePrompt: "Available knowledge-base prompt",
  injectUsagePromptHint: "Lists base names on each request; turning it off keeps tools and auto-retrieval available",
  autoRetrieveHint: 'When on, the model automatically uses knowledge-base content for factual questions without an explicit "knowledge base" mention; when off, only on-demand calls (knowledge_search tool + explicit requests)',
  autoRetrieveWeight: "Auto-retrieve weight (chunks this base may contribute, 0 = excluded)",
  autoRetrieveWeightHint: "A base contributes at most this many chunks per auto-retrieve injection (0\u20135, default 3); higher lets its content take more context, 0 excludes it entirely",
  localWorkerIdleTimeoutMs: "Local-model worker idle timeout (ms, 0 = keep models hot)",
  localWorkerIdleTimeoutMsHint: 'After this much idle time the local model is UNLOADED to free memory (~600MB) but the worker process stays alive \u2014 the onnxruntime binding is loaded once per process, so the Linux respawn failure ("Module did not self-register") cannot occur; the next request reloads from disk (~1s). 0 = keep models hot (fastest, costs resident memory)',
  imageCaptionHint: "Image/table captioning (optional): a vision model describes embedded PDF figures so charts become searchable",
  imageCaptionOff: "Off",
  imageCaptionOpenAI: "OpenAI-compatible vision model",
  imageCaptionOllama: "Ollama local vision model",
  cacheDirTitle: "Local model cache directory",
  cacheDirHint: 'Embedding / rerank / OCR model files download here (~ and DSH_HOME are expanded). Note: "Save" only points the config here \u2014 it does NOT move files; use "Migrate models here" to move existing models.',
  cacheDirBrowse: "Pick folder",
  cacheDirMigrate: "Migrate models here",
  cacheDirOpen: "Open folder",
  cacheDirSaved: 'Cache directory saved (config only, files not moved; use "Migrate models here" to move existing models)',
  cacheDirMigrateNone: "Nothing to migrate (source equals target, or the target already has the same entries)",
  ollamaTitle: "Ollama models",
  ollamaDesc: "Pull models through the Ollama API (embeddings, VLMs); pulled models are selectable in the base settings (provider: Ollama). Requires Ollama to be installed and running: https://ollama.com/download",
  ollamaInstalledTitle: "Installed models (click a name to fill the input)",
  ollamaNeedInstall: "(Tip: if connections keep failing, make sure Ollama is installed and running, or check the address above)",
  ollamaRefresh: "Refresh installed",
  ollamaPull: "Pull model",
  ollamaRecommended: "Recommended models (click to fill, then pull)",
  ollamaEmbeddingHint: "Embedding model \u2014 pick provider Ollama in the base settings and fill this name",
  ollamaVisionHint: "Vision model \u2014 pick Ollama for image captioning in the base settings and fill this name",
  ollamaDelete: "Delete this model (fails while Ollama is running it)",
  ollamaConfirmDelete: "Confirm delete?",
  chunkSeparator: "Separator",
  chunkSeparatorHint: "Delimiter the text is split on, in escaped form. With smart chunking on it adds a break point; with it off the text is split only by this delimiter.",
  reset: "Restore Defaults",
  viewSource: "Preview Source",
  viewChunks: "View Chunks",
  more: "More",
  chunkChangeWarning: "Chunking changes only apply to newly added content",
  topKHint: "Maximum number of document chunks returned for each retrieval. Higher values cover more content but use more context.",
  thresholdHint: "Similarity threshold used to filter low-relevance reranked chunks; higher is stricter.",
  providerLocal: "Local model",
  localModelHint: "In-process inference (transformers.js), no server needed; first use downloads the weights. Model = Hugging Face repo id, default onnx-community/Qwen3-Embedding-0.6B-ONNX",
  noLocalModelsReady: "No downloaded local models \u2014 download one in Settings \u2192 Local Models",
  noOllamaModels: "No installed Ollama models \u2014 pull one in Settings \u2192 Local Models",
  selectModelPlaceholder: "Select a model",
  ollamaUnreachable: "Cannot reach Ollama (check the address or whether it is running)",
  embeddingSwitchWarning: "\u26A0 Switching the embedding model invalidates this base's stored vectors, so the save will be refused \u2014 rebuild via \u201CRebuild base\u201D with the new model instead (or empty the base first)",
  staleModelSuffix: " (not installed)",
  embeddingModelMissingHint: "The embedding provider is the local model, which is not downloaded yet \u2014 imported content cannot be vectorized for retrieval. Download the embedding model (~585MB) in Settings \u2192 Local Models first.",
  localModelStatusLabel: "Local embedding model",
  goToSettings: "Settings",
  localModelDownloadingTitle: "Downloading the local embedding model",
  localModelNotReadyTitle: "Local embedding model not ready",
  localModelNotReadyHint: "Until it is ready, imports are keyword-searchable only. Download or check the local model.",
  localModelErrorTitle: "Local embedding model failed to load",
  openFolder: "Open",
  conflictDialogTitle: "Same-name files",
  conflictDialogMessage: "{count} files share a name with items already in this base. How to proceed?",
  conflictKeepAll: "Rename all (keep both)",
  conflictReplaceAll: "Replace existing",
  conflictSkipped: "same-name file(s) skipped (existing kept)",
  localModelReady: "Local model ready",
  localModelDownloading: "Downloading model",
  localModelError: "Model load failed",
  localModelsNav: "Local Models",
  localModelsTitle: "Local Models",
  localModelsDesc: "Download, validate, and manage local embedding and rerank models. Only healthy rerankers appear in base settings.",
  localModelDownload: "Download",
  localModelRetry: "Retry",
  localModelRemove: "Remove",
  localModelCancel: "Cancel",
  customRerankTitle: "Advanced: add a custom local reranker",
  customRerankHint: "Experimental: only Hugging Face ONNX sequence-classification models that need no remote custom code and return one logit are supported.",
  customRerankAccept: "I understand custom models are experimental and agree to run a local compatibility check after download",
  customRerankAdd: "Add and validate",
  officialSupport: "Official support",
  experimentalSupport: "Experimental",
  rerankRevalidate: "Revalidate",
  rerankValidating: "Validating compatibility",
  localRerankTimeoutMs: "Local rerank timeout (ms)",
  localRerankTimeoutHint: "Includes queue wait. On timeout, retrieval order is preserved and the stuck rerank process is isolated.",
  hfMirror: "Hugging Face mirror",
  hfMirrorHint: "When huggingface.co is unreachable, set a mirror (e.g. https://hf-mirror.com); takes effect immediately. Empty = official hub or the HF_ENDPOINT env var.",
  hfMirrorSave: "Save",
  newGroup: "New group",
  groupName: "Group name",
  renameGroup: "Rename group",
  ungrouped: "Default",
  recallHistory: "Search History",
  recallEmptyTitle: "Enter a query to start the recall test",
  recallEmptyDesc: "Results will show matching document chunks and scores",
  recallSearching: "Searching...",
  recallResultsSuffix: "results",
  recallTopScore: "Top",
  recallRelevance: "Relevance",
  recallCopy: "Copy citation",
  recallExpand: "Expand",
  recallCollapse: "Collapse",
  recallHistoryClear: "Clear",
  recallHistoryRemove: "Remove",
  backToParent: "Back to parent",
  back: "Back",
  ready: "Ready",
  updatedAtText: "Updated",
  updatedAtColumn: "Updated at",
  moveToGroup: "Move to",
  confirmDeleteGroup: "After deletion, bases in this group will move to the default group.",
  selected: "Selected",
  bulkReindex: "Reindex",
  bulkDelete: "Delete",
  type: "Type",
  status: "Status",
  selectAll: "Select all",
  noResults: "No results",
  embeddingFailed: "Embedding failed",
  confirmBulkDelete: "Delete the selected {count} documents and all their chunks? This cannot be undone.",
  confirmCascadeDeleteTitle: "Confirm cascading delete",
  confirmCascadeDelete: "This directory has children, so deleting it removes the whole subtree. The following will be permanently deleted:",
  confirmCascadeBulkDeleteTitle: "Confirm cascading delete",
  confirmCascadeBulkDelete: "The selection contains non-empty directories, so deleting it removes their whole subtrees. The following will be permanently deleted:",
  cascadeImpactDirectories: "Directories",
  cascadeImpactFiles: "Files",
  cascadeImpactChunks: "Chunks",
  cascadeImpactSnapshots: "Raw snapshots",
  cascadeDeleteConfirm: "Delete subtree",
  syncCreated: "Created",
  syncUpdated: "Updated",
  syncDeleted: "Deleted",
  syncUnchanged: "Unchanged",
  syncFailed: "Failed",
  syncNoChanges: "No changes detected",
  statusPollFailed: "Status refresh failed",
  rerankLastValidated: "Last validated: ",
  noLocalModels: "No local models yet",
  lexicalOnly: "Lexical only",
  lexicalOnlyHint: "No embedding model configured \u2014 search is lexical only. Use the Settings button (top right) to configure an embedding model and enable semantic retrieval.",
  embeddingNotConfigured: "This base has no embedding configured, so search is lexical only. Open Settings to pick an embedding model (OpenAI / Ollama / local), save, then reindex to enable semantic recall.",
  rebuildBase: "Rebuild base",
  rebuildHint: "The embedding model has changed; existing vectors no longer match. Rebuild the base to regenerate vectors.",
  previewTruncated: "Content too large; showing the first {count} characters.",
  chunksTruncated: "Showing the first {loaded} of {total} chunks.",
  chunkExpand: "Expand chunk",
  chunkCollapse: "Collapse chunk",
  chunksExpandAll: "Expand all",
  chunksCollapseAll: "Collapse all",
  firstUploadTitle: "Upload your first data source",
  emptyFolder: "This folder is empty",
  statusProcessing: "Embedding",
  statusParsing: "Parsing",
  statusPending: "Pending",
  errorInterrupted: "Import was interrupted by a shutdown \u2014 reindex to resume",
  errorDimensionMismatch: "Embedding dimension mismatch (model switched?) \u2014 rebuild the base with the new model",
  errorParseFailed: "Document parse failed",
  errorEmbeddingProvider: "Embedding provider/model call failed",
  statusImporting: "Importing",
  restoreHint: "A new base will be created and all documents re-indexed. Optionally switch the embedding model (rebuild-with-new-model).",
  restoreKeepModel: "Keep the source base config",
  modelId: "Model ID",
  baseUrlLabel: "API base URL",
  apiKeyLabel: "API key",
  loadMore: "Load more",
  kbInvocation: "Knowledge base",
  kbOn: "on",
  kbOff: "off",
  kbAll: "All",
  kbScopeHint: "Empty = all bases",
  kbWorkspace: "Workspaces",
  kbWorkspaceAll: "All workspaces",
  kbWorkspaceNone: "No workspace allowed",
  kbWorkspaceHint: "Only these workspaces may invoke the knowledge base; empty = closed everywhere. Outside the list nothing is injected and no tool call is allowed.",
  kbWorkspaceCurrent: "Current workspace",
  kbWorkspaceOff: "not allowed",
  dragResize: "Drag to resize",
  loadMoreChunks: "Load more chunks",
  timeJustNow: "just now",
  timeMinutes: "{n} min ago",
  timeHours: "{n} h ago",
  timeDays: "{n} d ago",
  cacheDirPickUnavailable: "Folder picking is unavailable (this environment has no directory picker)",
  cacheDirOpenUnavailable: "Opening folders is unavailable in this environment; copy the path into your file manager",
  cacheDirMigrated: "Model cache migrated to {to} ({count} entries moved)",
  mineruOption: "MinerU (cloud API, uploads files)",
  mineruHostPlaceholder: "API Host (default https://mineru.net)",
  visionModelPlaceholder: "Vision model (e.g. qwen-vl-plus, gpt-4o-mini)",
  captionBaseUrlOllamaPlaceholder: "Ollama URL (default http://127.0.0.1:11434)",
  captionBaseUrlPlaceholder: "API URL (leave empty to use the embedding model URL)",
  citationSource: " (KB {id})",
  error: "Error"
};

// src/ui/client/panel-store.ts
function createKnowledgePanelStore() {
  let open = false;
  const listeners = /* @__PURE__ */ new Set();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => open,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    open() {
      open = true;
      emit();
    },
    close() {
      open = false;
      emit();
    },
    toggle() {
      open = !open;
      emit();
    }
  };
}

// src/ui/client/directory-actions.ts
function record(value) {
  return value !== null && (typeof value === "object" || typeof value === "function") ? value : void 0;
}
function method(owner, name) {
  const value = record(owner)?.[name];
  return typeof value === "function" ? value.bind(owner) : void 0;
}
function sessionOf(remote) {
  try {
    return record(remote)?.session;
  } catch {
    return void 0;
  }
}
function remoteValue(response) {
  const result = record(response);
  if (result?.ok === true) return result.value;
  if (result?.ok === false) {
    const message = record(result.error)?.message;
    throw new Error(typeof message === "string" ? message : typeof result.error === "string" ? result.error : "DSH directory operation failed");
  }
  throw new Error("DSH returned an invalid directory operation response");
}
function liveDirectoryActions(resolve) {
  const current = () => createDirectoryActions(resolve());
  const pickDirectory = async () => {
    const pick = current().pickDirectory;
    if (pick === void 0) throw new Error("DSH directory picker is unavailable");
    return pick();
  };
  const openPath = async (path) => {
    const open = current().openPath;
    if (open === void 0) throw new Error("DSH directory opener is unavailable");
    await open(path);
  };
  const canOpenPath = async () => {
    const canOpen = current().canOpenPath;
    return canOpen === void 0 ? false : canOpen();
  };
  const actions = {};
  Object.defineProperties(actions, {
    pickDirectory: {
      enumerable: true,
      get: () => current().pickDirectory === void 0 ? void 0 : pickDirectory
    },
    openPath: {
      enumerable: true,
      get: () => current().openPath === void 0 ? void 0 : openPath
    },
    canOpenPath: {
      enumerable: true,
      get: () => current().canOpenPath === void 0 ? void 0 : canOpenPath
    }
  });
  return actions;
}
function createDirectoryActions(services) {
  if (typeof services === "function") return liveDirectoryActions(services);
  const actions = {};
  const pick = method(services.nativePicker, "pick") ?? method(services.uiWorkspace, "pickDirectory") ?? method(services.workspaces, "pickDirectory");
  if (pick !== void 0) {
    actions.pickDirectory = async () => {
      const path = await pick();
      if (path === null || path === "") return null;
      if (typeof path === "string") return path;
      throw new Error("DSH directory picker returned an invalid path");
    };
  }
  const session = sessionOf(services.remote);
  const open = method(session, "openWorkspacePath");
  if (open !== void 0) {
    const canOpen = method(session, "canOpenWorkspacePath");
    actions.canOpenPath = async () => {
      if (canOpen === void 0) return true;
      const available = remoteValue(await canOpen());
      if (typeof available !== "boolean") throw new Error("DSH returned an invalid directory capability response");
      return available;
    };
    actions.openPath = async (path) => {
      const result = record(remoteValue(await open({ path })));
      if (result?.opened !== true) throw new Error("DSH did not open the directory");
    };
  } else {
    const legacyOpen = method(services.workspaces, "openPath");
    if (legacyOpen !== void 0) {
      actions.canOpenPath = async () => true;
      actions.openPath = async (path) => {
        await legacyOpen(path);
      };
    }
  }
  return actions;
}

// src/ui/client/index.tsx
var NS = "settings.knowledge";
function readWorkspaceService(ctx) {
  try {
    return ctx.get("workspaces");
  } catch {
    return void 0;
  }
}
function readSessionService(ctx) {
  try {
    return ctx.get("sessions");
  } catch {
    return void 0;
  }
}
var inject = ["slots", "locale"];
function apply(ctx) {
  const slots = ctx.get("slots");
  const locale = ctx.get("locale");
  if (slots === void 0 || locale === void 0) return;
  ctx.effect(() => locale.register(NS, { zh, en }), "ui-knowledge: dictionaries");
  const t = locale.bind(NS);
  const store = createKnowledgePanelStore();
  const api = new KnowledgeApi();
  slots.inject("sidebar.footer.action", () => slots.register({
    name: "sidebar.footer.action",
    id: "knowledge",
    order: 10,
    label: () => t("nav"),
    inject: () => ({ store, t })
  }, SidebarKnowledgeAction));
  slots.inject("shell.overlay", () => slots.register({
    name: "shell.overlay",
    id: "knowledge",
    order: 10,
    inject: () => ({
      store,
      api,
      t,
      // Registered workspaces + the live session list, so the invocation
      // gate popover can list them and show which one the panel is in.
      // Resolved per render (not captured) because root slot props are cached.
      workspaces: readWorkspaceService(ctx),
      sessions: readSessionService(ctx)
    })
  }, KnowledgePanel));
  slots.inject("settings.section", () => slots.register({
    name: "settings.section",
    id: "local-models",
    order: 60,
    label: () => t("localModelsNav"),
    inject: () => ({
      api,
      t,
      // Root slot props are cached. Resolve optional services again on each
      // capability read and action so late registration/HMR stays usable.
      directoryActions: createDirectoryActions(() => ({
        nativePicker: globalThis.__DSH_DIRECTORY_PICKER__,
        uiWorkspace: ctx.get("uiWorkspace"),
        // `remote.session` is a scoped Remote service: reading `.session` off
        // the `remote` service object is gated by the fiber's inject
        // declaration and throws `cannot get property "remote.session"
        // without inject`, crashing this whole slot (issue #47). The optional
        // `ctx.get('remote.session')` lookup resolves the namespace directly
        // and stays undefined on DSH generations that do not provide it.
        remote: { session: ctx.get("remote.session") },
        workspaces: ctx.get("workspaces")
      }))
    })
  }, LocalModelsSection));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
