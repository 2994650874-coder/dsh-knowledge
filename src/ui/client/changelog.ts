/**
 * Local fork change log shown in the empty detail pane.
 *
 * The panel's right side has nothing to show before a base is picked, and a
 * bare "select a base" card wastes the widest area of the page. This list fills
 * it with the fork's own history — what was changed locally and why — which is
 * the one thing a user opening this page with nothing selected might want.
 *
 * **Maintenance contract**: every local change appends one entry at the TOP of
 * `CHANGELOG`, same day as the manual's appendix A. This array is the single
 * source of truth for "what changed and when" — the panel header no longer
 * carries a separate build/date pill, so nothing else needs a matching date.
 * An entry says what changed and what the user can observe, never how it was
 * discovered.
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
    date: '2026-11-14',
    area: '安装',
    title: '改为 link 安装，重装不再覆盖本地改动',
    detail: '插件不再从 npm 装实体副本，而是直接指向源码目录（link）。宿主需要的包改由本地副本提供。',
    effect: '插件市场更新或重装这个插件时，本地改动不会再被原版覆盖。',
  },
  {
    date: '2026-11-14',
    area: '精简',
    title: '移除本地模型与 OCR 管理',
    detail: '设置页里「下载本地嵌入模型」「本地 OCR 模型」两块整体移除，连同下拉里「本地模型」这个嵌入方式一起删掉。',
    effect: '嵌入方式只剩 无 / OpenAI / Ollama 三种，不再出现选了会报错的选项。',
  },
  {
    date: '2026-11-14',
    area: '精简',
    title: '移除 MinerU 部署',
    detail: '设置页里「MinerU 本地解析 · 部署预检」整块移除，包括它配套的 Python 环境检测。',
    effect: '设置页只剩 Ollama 一块内容。txt/markdown 走内置解析，不受影响。',
  },
  {
    date: '2026-11-14',
    area: '设置',
    title: '配置入口移到「插件 → 设置 → 知识库」',
    detail: '不再占用官方设置页，改为注册到插件页自己的配置区（与翻译插件、grokbot 一致）。',
    effect: '设置页里不再有「知识库」这一项，到插件页里找知识库的配置。',
  },
  {
    date: '2026-11-14',
    area: '依赖',
    title: '运行依赖从 15 个减到 2 个',
    detail: 'PDF、Word、OCR、本地嵌入相关的库全部从依赖声明中移除，只留解压与网络两个。',
    effect: '插件体积与安装内容显著变小，txt/markdown 与 Ollama 嵌入不受影响。',
  },
  {
    date: '2026-11-14',
    area: '状态',
    title: '嵌入完成后进度不再卡住',
    detail: '任务结束时行状态长时间停在「嵌入中 0%」，要切一次知识库才刷新。',
    effect: '向量化一完成，那一行立刻变成「✓ 就绪」。',
  },
  {
    date: '2026-11-14',
    area: '状态',
    title: '进度轮询不再造成整表闪烁',
    detail: '轮询每 800ms 无条件刷新整个文档表，即使数据没变，导致行内转圈动画反复重启。',
    effect: '只有进度真的跳变时才刷新那一行，空闲时不重渲染。',
  },
  {
    date: '2026-11-03',
    area: '面板',
    title: '标题栏去掉版本标签',
    detail: '面板标题后面不再显示「v0.5.2 · 本地改 日期」。',
    effect: '改动内容统一看这一页，标题栏只留「知识库」三个字。',
  },
  {
    date: '2026-11-03',
    area: '面板',
    title: '未选知识库时显示这一页',
    detail: '右侧详情区原来是一张空白提示卡，现在显示版本更新详情。',
    effect: '选中任一知识库后本页被其内容覆盖，取消选择后回来。',
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
