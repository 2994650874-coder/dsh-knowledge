/**
 * Loader shim for the `tool-knowledge` host plugin.
 *
 * Same two-phase arrangement as `knowledge.ts`: guarantee the host-provided
 * packages exist next to this plugin, then import the real module. Without it a
 * fresh `link:` install dies on `import … from 'undici'` before `apply` runs.
 *
 * @module dsh-knowledge/bootstrap/tool-knowledge
 */

import { loadHealed, readManifest } from './heal.js'

const root = new URL('../../', import.meta.url)
const specifiers = readManifest()

const loaded = await loadHealed({ root, specifiers, entry: 'lib/tool-knowledge/index.js' })

export const SEARCH_RENDER_MAX_TOKENS = loaded.SEARCH_RENDER_MAX_TOKENS
export const apply = loaded.apply
export const autoRetrieveBackground = loaded.autoRetrieveBackground
export const buildAutoRetrieveMessage = loaded.buildAutoRetrieveMessage
export const clipAroundQuery = loaded.clipAroundQuery
export const foldBackground = loaded.foldBackground
export const inject = loaded.inject
export const knowledgeDestructiveApprovalReason = loaded.knowledgeDestructiveApprovalReason
export const renderKnowledgeDocumentPage = loaded.renderKnowledgeDocumentPage
export const renderKnowledgeEvidence = loaded.renderKnowledgeEvidence
export const renderKnowledgeReadResult = loaded.renderKnowledgeReadResult
export const renderKnowledgeSearchResult = loaded.renderKnowledgeSearchResult
export const userTextOf = loaded.userTextOf
