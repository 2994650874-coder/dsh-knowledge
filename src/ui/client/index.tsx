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

  // Ollama model management lives inside the official plugin page, keyed by the
  // npm package name (`plugins.bundle.config`). It deliberately does NOT register
  // a `settings.section`: the settings page belongs to the host, and a plugin
  // configures itself through its own plugin card (same posture as the session
  // translator and grokbot).
  //
  // The entry is called with `{ view }`: `'summary'` is the one-line blurb on
  // the plugin card and stays the host's business, so only the detail page
  // renders. Returning `null` for the summary is what grokbot does; omitting the
  // check would paint the whole form inside the card.
  slots.inject('plugins.bundle.config', () => slots.register({
    name: 'plugins.bundle.config',
    key: 'dsh-knowledge',
  }, function KnowledgeConfig({ view }: { view?: string }) {
    if (view === 'summary') return null
    return <LocalModelsSection api={api} t={t} />
  } as never))
}
