/**
 * Browser half of the knowledge base: a Cherry Studio-style entry beside
 * Settings plus a center-column page.
 *
 * The page occupies the `main` KEYED slot — the same seat the skill center
 * uses — so it covers the conversation column only. The sidebar and the right
 * bar stay mounted and usable while it is open, and the conversation it
 * displaced stays retained by the workspace (`retainedBy.mainView`), so opening
 * this page never changes which session is current.
 * @module dsh-knowledge/client
 */

import type { Context } from '@deepseek-ai/cordis'
import { KnowledgeApi } from './api.js'
import { KnowledgePanel, SidebarKnowledgeAction } from './KnowledgeSection.js'
import type { Translate } from './KnowledgeSection.js'
import { LocalModelsSection } from './LocalModelsSection.js'
import { en, zh } from './locales.js'
import { createDirectoryActions } from './directory-actions.js'

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.knowledge'

/** Keyed `main` slot key AND the sidebar action id — one panel, one name. */
const PANEL_KEY = 'knowledge'

interface SlotsService {
  inject(name: string, callback: () => void): void
  register(options: Record<string, unknown>, component: unknown): unknown
}

interface LocaleService {
  register(ns: string, dict: { zh: unknown; en: unknown }): () => void
  bind(ns: string): (key: string) => string
}

/** The `layout` service face this plugin drives (see ui-layout's LayoutController). */
interface LayoutService {
  selectPanel?(panelId: string | null): void
}

/** Shape of the host workspace registry consumed by the invocation gate. */
interface HostWorkspacesService {
  list?: { getSnapshot?: () => { items?: { workspaceId?: string; path?: string; title?: string }[] } }
}

/** Shape of the host session store consumed by the invocation gate. */
interface HostSessionsService {
  list?: { getSnapshot?: () => { byId?: Record<string, { cwd?: string; retainedBy?: { mainView?: number } }> } }
}

/** Read `workspaces` without triggering cordis's inject gate (issue #47). */
function readWorkspaceService(ctx: Context): HostWorkspacesService | undefined {
  try {
    return ctx.get('workspaces') as HostWorkspacesService | undefined
  } catch {
    return undefined
  }
}

/** Read `sessions` without triggering cordis's inject gate (issue #47). */
function readSessionService(ctx: Context): HostSessionsService | undefined {
  try {
    return ctx.get('sessions') as HostSessionsService | undefined
  } catch {
    return undefined
  }
}

/**
 * Select the knowledge page, or `null` to return to the conversation.
 *
 * `layout.selectPanel` throws for a key that is not registered, which happens
 * only while this plugin's `main` entry is being re-registered (hot reload, or
 * ui-layout not yet mounted). A failed selection is a no-op here: the sidebar
 * action simply stays inactive until the entry exists.
 */
function selectKnowledgePanel(ctx: Context, open: boolean): void {
  try {
    const layout = ctx.get('layout') as LayoutService | undefined
    layout?.selectPanel?.(open ? PANEL_KEY : null)
  } catch {
    // ui-layout absent or the key is momentarily unregistered — nothing to do.
  }
}

/** Required services; each target slot is awaited through `slots.inject`. */
export const inject = ['slots', 'locale']

/** Register the knowledge sidebar action and its center-column page. */
export function apply(ctx: Context): void {
  const slots = ctx.get('slots') as SlotsService | undefined
  const locale = ctx.get('locale') as LocaleService | undefined
  if (slots === undefined || locale === undefined) return

  ctx.effect(() => locale.register(NS, { zh, en }), 'ui-knowledge: dictionaries')
  const t = locale.bind(NS) as Translate
  const api = new KnowledgeApi()

  // The page itself. `main` is a keyed root slot: it renders only while the
  // layout's `panelInfo.activePanelId` equals this key, and the panel goes away
  // when the user navigates back to the conversation.
  slots.inject('main', () => slots.register({
    name: 'main',
    key: PANEL_KEY,
    inject: () => ({
      api,
      t,
      // Switching away from this page is a layout action, not knowledge state:
      // `null` returns the center column to the conversation.
      onClose: () => selectKnowledgePanel(ctx, false),
      // Registered workspaces + the live session list, so the invocation gate
      // popover can list them and show which workspace the panel is in. The
      // conversation is only unmounted, not released, while this page is open,
      // so `retainedBy.mainView` still names the current session.
      workspaces: readWorkspaceService(ctx),
      sessions: readSessionService(ctx),
    }),
  }, KnowledgePanel))

  // Entry point beside Settings. The button derives its lit state from
  // `usePanelInfo` (a standard prop of every scope), so it needs no knowledge
  // state of its own: pressing it toggles the center column.
  slots.inject('sidebar.footer.action', () => slots.register({
    name: 'sidebar.footer.action',
    id: PANEL_KEY,
    order: 10,
    label: () => t('nav'),
    inject: () => ({
      t,
      panelKey: PANEL_KEY,
      setOpen: (open: boolean) => { selectKnowledgePanel(ctx, open) },
    }),
  }, SidebarKnowledgeAction))

  slots.inject('settings.section', () => slots.register({
    name: 'settings.section',
    id: 'local-models',
    order: 60,
    label: () => t('localModelsNav'),
    inject: () => ({
      api,
      t,
      // Root slot props are cached. Resolve optional services again on each
      // capability read and action so late registration/HMR stays usable.
      directoryActions: createDirectoryActions(() => ({
        nativePicker: (globalThis as typeof globalThis & { __DSH_DIRECTORY_PICKER__?: unknown }).__DSH_DIRECTORY_PICKER__,
        uiWorkspace: ctx.get('uiWorkspace'),
        // `remote.session` is a scoped Remote service: reading `.session` off
        // the `remote` service object is gated by the fiber's inject
        // declaration and throws `cannot get property "remote.session"
        // without inject`, crashing this whole slot (issue #47). The optional
        // `ctx.get('remote.session')` lookup resolves the namespace directly
        // and stays undefined on DSH generations that do not provide it.
        remote: { session: ctx.get('remote.session') },
        workspaces: ctx.get('workspaces'),
      })),
    }),
  }, LocalModelsSection))
}
