/**
 * Ollama model settings: pull / list / remove models through the Ollama API.
 * The local-model (transformers / ONNX), OCR and MinerU management was removed
 * on this fork — the knowledge base runs on Ollama embeddings over txt/markdown
 * only, so those controls had no remaining consumer and their dependencies are
 * no longer installed.
 *
 * Registered through `plugins.bundle.config` (keyed by the npm package name),
 * so it renders inside the official plugin page instead of the settings shell.
 * The entry receives `view`; the plugin card's one-line summary is not ours to
 * draw, so only the detail page renders.
 * @module dsh-knowledge/client/LocalModelsSection
 */

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { KnowledgeApi } from './api.js'
import { C, style } from './theme.js'
import { IconBot, IconBox, IconDownload, IconRefresh } from './icons.js'
import type { Translate } from './locales.js'

export interface LocalModelsSectionProps {
  api: KnowledgeApi
  t: Translate
}

export function LocalModelsSection(props: LocalModelsSectionProps): JSX.Element {
  const { api, t } = props
  const [error, setError] = useState<string | null>(null)
  // Ollama: base URL + model picker + pull progress.
  const [ollamaBase, setOllamaBase] = useState('http://127.0.0.1:11434')
  const [ollamaModel, setOllamaModel] = useState('')
  const [ollamaInstalled, setOllamaInstalled] = useState<Array<{ name: string; size?: number }>>([])
  // In-flight pulls keyed by model — independent of the input field, so
  // editing the input mid-pull never desyncs the progress cards or the
  // cancel buttons (the status API is keyed by model name, not the input).
  // Survives panel close/reopen via listActiveOllamaPulls() on mount.
  const [pullingModels, setPullingModels] = useState<Array<{ model: string; status: string; progress: number; message: string }>>([])
  const [ollamaBusy, setOllamaBusy] = useState(false)
  // Recommended Ollama models (embedding + vision).
  const [ollamaSuggestions, setOllamaSuggestions] = useState<{ ollamaEmbedding: string[]; ollamaVision: string[] }>({ ollamaEmbedding: [], ollamaVision: [] })

  // Load the Ollama recommendations once.
  useEffect(() => {
    void api.getModelSuggestions().then(suggestions => {
      setOllamaSuggestions({
        ollamaEmbedding: suggestions.ollamaEmbedding ?? [],
        ollamaVision: suggestions.ollamaVision ?? [],
      })
    }).catch(() => {})
  }, [api])

  const refreshOllamaTags = useCallback(async (): Promise<void> => {
    setOllamaBusy(true)
    setError(null)
    try {
      const { models: installed } = await api.listOllamaModels(ollamaBase)
      setOllamaInstalled(installed)
    } catch (err) {
      setError(`${err instanceof Error ? err.message : String(err)} ${t('ollamaNeedInstall')}`)
    } finally {
      setOllamaBusy(false)
    }
  }, [api, ollamaBase, t])

  // Live Ollama pull progress (polled only while a pull is actually running).
  // The moment a pull leaves the `pulling` state its card clears and, on
  // success, an installed-model refresh brings the new model into the list.
  // A failed pull stays visible as an error card until dismissed.
  useEffect(() => {
    if (pullingModels.length === 0) return
    const timer = window.setInterval(() => {
      void (async (): Promise<void> => {
        let finishedReady = false
        const next: Array<{ model: string; status: string; progress: number; message: string }> = []
        for (const pull of pullingModels) {
          const status = await api.getOllamaPullStatus(pull.model).catch(() => null)
          if (status === null) continue
          if (status.status === 'pulling' || status.status === 'error') {
            next.push({ model: pull.model, ...status })
          } else if (status.status === 'ready') {
            finishedReady = true
          }
        }
        setPullingModels(next)
        if (finishedReady) void refreshOllamaTags()
      })()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [api, pullingModels, refreshOllamaTags])

  // Load the installed-model list on mount, and again whenever the Ollama
  // base URL changes (a different server has a different model set). Without
  // this the list stayed empty until the user clicked "refresh installed" —
  // or until a pull happened to finish.
  useEffect(() => {
    void refreshOllamaTags()
  }, [refreshOllamaTags])

  // Restore progress cards after a panel close/reopen: the pull lives in the
  // service (it survives the component), only the UI state was lost.
  useEffect(() => {
    void api.listActiveOllamaPulls().then(({ pulls }) => {
      if (pulls.length > 0) setPullingModels(pulls)
    }).catch(() => {})
  }, [api])

  // Two-step delete: the first click arms the chip, the second executes.
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const deleteOllama = useCallback(async (model: string): Promise<void> => {
    if (pendingDelete !== model) {
      setPendingDelete(model)
      window.setTimeout(() => setPendingDelete(current => (current === model ? null : current)), 3000)
      return
    }
    setPendingDelete(null)
    setOllamaBusy(true)
    setError(null)
    try {
      await api.deleteOllamaModel(model, ollamaBase)
      const { models: installed } = await api.listOllamaModels(ollamaBase)
      setOllamaInstalled(installed)
    } catch (err) {
      setError(`${err instanceof Error ? err.message : String(err)} ${t('ollamaNeedInstall')}`)
    } finally {
      setOllamaBusy(false)
    }
  }, [api, ollamaBase, pendingDelete, t])

  const pullOllama = useCallback(async (): Promise<void> => {
    const model = ollamaModel.trim()
    if (model === '') return
    setOllamaBusy(true)
    setError(null)
    try {
      await api.pullOllamaModel(model, ollamaBase)
      setPullingModels(prev => prev.some(p => p.model === model)
        ? prev
        : [...prev, { model, status: 'pulling', progress: 0, message: '' }])
      // The pull itself runs server-side; the busy flag must not stay set
      // until the progress poll happens to observe `ready` (which is the
      // only other path that resets it) — that would leave the refresh/pull
      // buttons disabled if the ready observation never fires.
      setOllamaBusy(false)
    } catch (err) {
      setError(`${err instanceof Error ? err.message : String(err)} ${t('ollamaNeedInstall')}`)
      setOllamaBusy(false)
    }
  }, [api, ollamaModel, ollamaBase, t])

  const cancelOllama = useCallback(async (model: string): Promise<void> => {
    try {
      await api.cancelOllamaPull(model)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setPullingModels(prev => prev.filter(p => p.model !== model))
    setOllamaBusy(false)
  }, [api])

  return (
    <div style={{ minWidth: 0 }}>
      <h2 style={{ fontSize: 17, fontWeight: 650, color: C.text, margin: '0 0 6px' }}>{t('localModelsTitle')}</h2>
      <p style={{ marginTop: 0, marginBottom: 16, fontSize: 13, color: C.muted, lineHeight: 1.65, maxWidth: 760 }}>{t('localModelsDesc')}</p>

      {error !== null && <div style={{ ...style.error, marginBottom: 12 }}>{error}</div>}

      {/* Ollama — pull local models through the Ollama API (embeddings, VLMs) */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: C.surface2, color: C.muted }}>
            <IconBot size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('ollamaTitle')}</div>
            <p style={{ marginTop: 2, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t('ollamaDesc')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            style={{ ...style.input, flex: 1 }}
            placeholder="http://127.0.0.1:11434"
            value={ollamaBase}
            onChange={(e) => setOllamaBase(e.target.value)}
          />
          <button className="kb-btn" style={style.button} disabled={ollamaBusy} onClick={() => void refreshOllamaTags()}>
            <IconRefresh size={13} />{t('ollamaRefresh')}
          </button>
        </div>
        {ollamaInstalled.length > 0 && (
          <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{t('ollamaInstalledTitle')}</div>
            {ollamaInstalled.map(item => (
              <div
                key={item.name}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface2, marginBottom: 6 }}
              >
                <span style={{ color: C.muted, display: 'inline-flex' }}><IconBox size={14} /></span>
                <span
                  style={{ flex: 1, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                  title={t('ollamaEmbeddingHint')}
                  onClick={() => setOllamaModel(item.name)}
                >
                  {item.name}
                </span>
                {item.size !== undefined && (
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{formatBytes(item.size)}</span>
                )}
                <button
                  style={{ border: 0, padding: '2px 6px', background: 'transparent', color: pendingDelete === item.name ? C.danger : C.muted, cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0 }}
                  title={t('ollamaDelete')}
                  aria-label={t('ollamaDelete')}
                  disabled={ollamaBusy}
                  onClick={() => void deleteOllama(item.name)}
                >
                  {pendingDelete === item.name ? t('ollamaConfirmDelete') : '×'}
                </button>
              </div>
            ))}
          </div>
        )}
        {(ollamaSuggestions.ollamaEmbedding.length > 0 || ollamaSuggestions.ollamaVision.length > 0) && (
          <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{t('ollamaRecommended')}</div>
            {ollamaSuggestions.ollamaEmbedding.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                {ollamaSuggestions.ollamaEmbedding.map(name => (
                  <button
                    key={name}
                    title={t('ollamaEmbeddingHint')}
                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer' }}
                    onClick={() => setOllamaModel(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            {ollamaSuggestions.ollamaVision.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ollamaSuggestions.ollamaVision.map(name => (
                  <button
                    key={name}
                    title={t('ollamaVisionHint')}
                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer' }}
                    onClick={() => setOllamaModel(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            style={{ ...style.input, flex: 1 }}
            placeholder="llava / qwen2.5vl / nomic-embed-text …"
            value={ollamaModel}
            onChange={(e) => setOllamaModel(e.target.value)}
          />
          <button
            className="kb-btn"
            style={style.button}
            disabled={ollamaBusy || ollamaModel.trim() === '' || pullingModels.length > 0}
            onClick={() => void pullOllama()}
          >
            <IconDownload size={13} />{t('ollamaPull')}
          </button>
        </div>
        {pullingModels.map(pull => (
          <div key={pull.model} style={{ marginTop: 10, padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: C.text }}>
              <span style={{ color: pull.status === 'error' ? C.danger : C.accent, display: 'inline-flex' }}><IconDownload size={13} /></span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pull.model}</span>
              <button
                style={{ border: 0, padding: '2px 8px', borderRadius: 6, background: C.surface, color: C.text, cursor: 'pointer', fontSize: 11 }}
                onClick={() => void cancelOllama(pull.model)}
              >
                {t('localModelCancel')}
              </button>
            </div>
            {pull.status !== 'error' ? (
              <>
                <div style={{ height: 6, width: '100%', borderRadius: 999, background: C.surface, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ height: '100%', width: `${pull.progress}%`, borderRadius: 999, background: C.accent, transition: 'width 0.2s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: C.muted }}>
                  <span>{t('localModelDownloading')}{pull.message !== '' ? ` · ${pull.message}` : ''}</span>
                  <span>{Math.floor(pull.progress)}%</span>
                </div>
              </>
            ) : (
              <p style={{ marginTop: 8, fontSize: 12, color: C.danger, lineHeight: 1.5 }}>{pull.message !== '' ? pull.message : t('localModelError')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 16,
  background: C.surface,
}

/** Human-readable size (Ollama reports bytes; show GB/MB). */
function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}
