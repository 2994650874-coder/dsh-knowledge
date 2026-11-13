/**
 * Loader shim for the `knowledge` host plugin.
 *
 * `cordis.patch.yml` points this row at `dsh-knowledge/knowledge`, whose
 * `package.json` export is redirected here instead of `lib/knowledge/index.js`.
 * See `heal.ts` for why the indirection is required: the real module has
 * top-level imports of host-provided packages, so it cannot be loaded until
 * those packages are physically present next to this plugin.
 *
 * Exports are re-exported one by one on purpose — `export * from` would still be
 * a static dependency on the target and defeat the whole arrangement.
 *
 * @module dsh-knowledge/bootstrap/knowledge
 */

import { loadHealed, readManifest } from './heal.js'

const root = new URL('../../', import.meta.url)
const specifiers = readManifest()

const loaded = await loadHealed({ root, specifiers, entry: 'lib/knowledge/index.js' })

export const Config = loaded.Config
export const ConflictError = loaded.ConflictError
export const DEFAULT_LOCAL_MODEL = loaded.DEFAULT_LOCAL_MODEL
export const DirectorySourceError = loaded.DirectorySourceError
export const KnowledgeService = loaded.KnowledgeService
export const MAX_RAW_TEXT_LIMIT = loaded.MAX_RAW_TEXT_LIMIT
export const MODEL_SUGGESTIONS = loaded.MODEL_SUGGESTIONS
export const NotFoundError = loaded.NotFoundError
export const StorageUnavailableError = loaded.StorageUnavailableError
export const chunkText = loaded.chunkText
export const clampRawTextLimit = loaded.clampRawTextLimit
export const composeContextWindow = loaded.composeContextWindow
export const cosineSimilarity = loaded.cosineSimilarity
export const embedTexts = loaded.embedTexts
export const estimateContextTokens = loaded.estimateContextTokens
export const extractWithMineruLocal = loaded.extractWithMineruLocal
export const getLocalModelStatus = loaded.getLocalModelStatus
export const knowledgeDomainSpec = loaded.knowledgeDomainSpec
export const localEmbeddingErrorText = loaded.localEmbeddingErrorText
export const openStore = loaded.openStore
export const probeMineruLocal = loaded.probeMineruLocal
export const rank = loaded.rank
export const serializeContextWindow = loaded.serializeContextWindow
export const tokenize = loaded.tokenize

/** The service class the cordis loader instantiates. */
export default loaded.default
