/**
 * Local fork change log shown in the empty detail pane.
 *
 * The panel's right side has nothing to show before a base is picked, and a
 * bare "select a base" card wastes the widest area of the page. This list fills
 * it with the fork's own history — what was changed locally and why — which is
 * the one thing a user opening this page with nothing selected might want.
 *
 * **Maintenance contract**: every local change appends one entry, newest first,
 * same day as the `LOCAL_MODIFIED` bump (build-info.ts) and the manual's
 * appendix A. Grouped by area, not by build; an entry says what changed and
 * what the user can observe, never how it was discovered.
 *
 * @module dsh-knowledge/client/changelog
 */

/** One user-visible change to this fork. */
export interface ChangelogEntry {
  /** ISO date the change landed, `YYYY-MM-DD`. */
  date: string
  /** Area shown as a chip, e.g. 面板 / 闸门 / 工具. */
  area: string
  /** One-line headline, written for a user rather than a maintainer. */
  title: string
  /** What changed, in the user's terms. */
  detail: string
  /** Effect the user can check for themselves. */
  effect: string
}

/** Newest first. */
export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    date: '2026-11-03',
    area: '面板',
    title: '打开与关闭都有位移动画',
    detail: '页面从左侧推入；点侧栏按钮关闭时向左滑出，不再瞬间消失。',
    effect: '进场 240ms、出场 110ms；系统开启「减少动态效果」时两者都关闭。',
  },
  {
    date: '2026-11-03',
    area: '面板',
    title: '只占对话区，不再盖住左侧栏',
    detail: '面板改为挂在对话列，左侧栏、右侧栏、底部栏在打开时仍然可用。',
    effect: '打开知识库时左边栏还在，可以随时切会话或点别处。',
  },
  {
    date: '2026-11-02',
    area: '闸门',
    title: '封闭工作区不再收到知识库工具',
    detail: '未开放的工作区里，模型的工具表中直接没有这 8 个知识库工具。',
    effect: '封闭工作区每个请求省约 2,017 token。',
  },
  {
    date: '2026-11-02',
    area: '工具',
    title: '工具从 15 个减少到 8 个',
    detail: '删掉 7 个写入类工具，保留检索与读取相关的 8 个。',
    effect: '模型的工具选择更集中，误调用变少。',
  },
  {
    date: '2026-11-02',
    area: '面板',
    title: '标题栏显示本地改动日期',
    detail: '版本号后面显示「本地改 YYYY-MM-DD」，标明这份构建带着本地修改。',
    effect: '日期比你最后一次改动旧，就说明本地补丁被更新覆盖了。',
  },
  {
    date: '2026-10-20',
    area: '闸门',
    title: '可用工作区从插件面板里勾选',
    detail: '不再靠改配置文件，面板上直接勾选哪些工作区能用知识库。',
    effect: '全关时按钮变红，有开放时变绿。',
  },
]
