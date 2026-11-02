# dsh-knowledge 个人维护分支 · 维护说明

> 这份文档写给**要维护这个 fork 的人**（包括未来的自己）。
> 上游功能说明见 [README.md](./README.md)；本分支改了什么见 [README.md 顶部声明](./README.md#本仓库是个人维护分支fork)。

---

## 一、仓库关系

```
Soren-ABT/dsh-knowledge          ← upstream（作者主线，只读）
        │ fork
        ▼
2994650874-coder/dsh-knowledge   ← origin（我的仓库，可写）
        │ clone
        ▼
C:\Users\猫猫\.dsh\plugin-src\dsh-knowledge   ← 本地工作副本
        │ build + 复制 lib/
        ▼
C:\Users\猫猫\.dsh\profiles\desktop\node_modules\dsh-knowledge\   ← DSH 实际加载的
```

| remote | 指向 | 权限 |
|---|---|---|
| `upstream` | `Soren-ABT/dsh-knowledge` | 只读，只 fetch |
| `origin` | `2994650874-coder/dsh-knowledge` | 读写 |

| 分支 | 作用 |
|---|---|
| `local/main` | **主线**，所有本地化改动在这里，GitHub 默认分支 |
| `upstream/main` | 作者的 main，只 fetch 不直接改 |

---

## 二、日常开发流程

### 改代码 → 构建 → 部署

```powershell
cd C:\Users\猫猫\.dsh\plugin-src\dsh-knowledge

# 1. 改 src/ 下的源码

# 2. 构建
node build.mjs

# 3. 复制到 DSH 加载位置
Copy-Item ".\lib\*" "C:\Users\猫猫\.dsh\profiles\desktop\node_modules\dsh-knowledge\lib" -Recurse -Force

# 4. 重启 DSH（必须完全退出，见 §五 坑2）
```

> **`build.mjs` 的 tsc 步骤会失败**（`typescript` 未安装），但 **JS 产物正常生成**。
> 只有 `lib/types/` 停在旧版，不影响运行。要修就 `npm i -D typescript`。

### ⚠️ 每次改代码必须更新 `LOCAL_MODIFIED`

```ts
// src/ui/client/build-info.ts
export const LOCAL_MODIFIED = '2026-11-02'   // ← 改成当天日期，和代码同一次提交
```

面板标题「知识库」后面的胶囊会显示 `v0.5.2 · 本地改 2026-11-02`。

**为什么必须改**：本 fork 的版本号跟上游一致，光看版本号看不出 `lib/` 是不是本地的。
上游更新或 `dsh plugin update` 会覆盖 `lib/`，此时**版本号可能没变，但补丁已经没了**。

**判据**：胶囊上的日期不是你最后一次改动的日期 → `lib/` 已被覆盖，重新构建部署。

版本号那半边是 `build.mjs` 从 `package.json` 经 esbuild `define` 注入的，**不用手改**。

### 提交

```powershell
git add src/ lib/ .gitignore
git commit -m "说明"
git push origin local/main
```

> **必须连 `lib/` 一起提交** —— 本仓库已解除对 `lib/` 的忽略，clone 下来即可直接部署。

---

## 三、同步上游更新

### 为什么不能无脑 merge

本 fork 改了 10 个文件，其中 `KnowledgeSection.tsx` 是**整个组件重写**。
上游如果动了同一区域，冲突会很难受。所以流程是**先看差异，再决定**。

### 标准流程

```powershell
cd C:\Users\猫猫\.dsh\plugin-src\dsh-knowledge

# ── 1. 拉上游 ──
git fetch upstream

# ── 2. 看上游有哪些新提交 ──
git log --oneline local/main..upstream/main

# ── 3. 看上游改了哪些文件 ──
git diff --stat local/main...upstream/main

# ── 4. 重点看：我改过的文件，上游也改了吗 ──
git diff --stat local/main...upstream/main -- `
  src/knowledge/domain.ts src/knowledge/store.ts src/knowledge/index.ts `
  src/knowledge/http.ts src/tool-knowledge/index.ts `
  src/ui/client/api.ts src/ui/client/KnowledgeSection.tsx `
  src/ui/client/index.tsx src/ui/client/locales.ts
```

### 判断表

| 情况 | 处理 |
|---|---|
| 上游只改了我没碰的文件 | **直接 merge**，零冲突 |
| 上游改了我碰过的文件，但**不重叠** | merge，可能自动成功 |
| 上游改了我碰过的文件且**同一区域** | **逐个手工合并**，跑测试后再提交 |
| 上游重构了核心结构（如改了 store 接口） | **暂停**，先理解再动，必要时重做本地化 |

### 合并命令

```powershell
# 保守做法：先建临时分支试合并
git checkout -b try-upstream-merge-<日期>
git merge upstream/main

# 有冲突就手工解决，然后：
node build.mjs
# 复制到 profile，重启 DSH，四个工作区各测一次

# 验证通过后回到主线
git checkout local/main
git merge try-upstream-merge-<日期>
git branch -d try-upstream-merge-<日期>
git push origin local/main
```

### 每次合并后必做的验证

```powershell
# 1. 语法
node --check lib/knowledge/index.js
node --check lib/tool-knowledge/index.js
node --check lib/client.js

# 2. 合并综合检测（33 项：本地改动存活 + 上游生效 + 无冲突残留 + 铁律8）
node F:\知识库架构\工程区\dsh-knowledge\仿真测试\check-merge.mjs

# 3. 部署 + 重启 + 四工作区实测，看探针
Get-Content C:\Users\猫猫\.dsh\kb-scope-whitelist.probe.log -Tail 20
```

### ⚠️ 自动合并成功 ≠ 语义正确

git 只保证**文本层面**没打架。

判据：合并后必须逐项确认**本地符号还在**，不能只看「没报冲突」。
最省事的做法是跑 `check-merge.mjs` —— 它把「本地改动的 8 个符号还在不在」
「上游的 8 个新符号生效没」都写成硬断言，比人工 grep 可靠。

### 已知的重叠文件（合并时重点看）

| 文件 | 本地改 | 上游改 |
|---|---|---|
| `src/knowledge/store.ts` | `Store` 接口 + `MemoryStore`（工作区白名单） | `openStore` + `DomainStore` 写入路径（metadata 串行化） |
| `src/knowledge/index.ts` | `workspaceAllowed` + getter | `resumeInterruptedDocuments` 错误处理 |
| `README.md` / `README.en.md` | fork 声明 | 版本表 |

> 这三处两边都改，但改动**区域不重叠**，实测可零冲突合并。合完仍要验语义。

---

## 四、构建环境

### 必需

| 依赖 | 版本 | 说明 |
|---|---|---|
| Node.js | 22.x | |
| esbuild | **0.25.12** | 必须这个版本，与上游 `pnpm-lock.yaml` 一致 |
| `@deepseek-ai/schemastery` | DSH 内置版 | **不能用 profile 版**（会差约 50 行） |
| `@deepseek-ai/cosmokit` | DSH 内置版 | 同上 |

### 本机现状

```
plugin-src\dsh-knowledge\node_modules\
  esbuild                   → symlink 到 _buildtools
  @deepseek-ai\schemastery  → symlink 到 profile 的 vendored 副本
  @deepseek-ai\cosmokit     → 同上
```

### 换机器时

```powershell
git clone https://github.com/2994650874-coder/dsh-knowledge.git
cd dsh-knowledge
npm i -D esbuild@0.25.12 typescript
# schemastery/cosmokit 从 DSH 的 asar 里取，或从 profile 复制
node build.mjs
```

---

## 五、踩坑记录

### 坑1：DSH 主进程会覆盖 node_modules 下的 bundle

调试期间发现 `lib/knowledge/index.js` 的 mtime 变成"刚刚"，内容被宿主改写。
**排查**：改动前记录 size + 哈希，改动后比对；不一致先弄清是谁写的。

### 坑2：DSH 多进程导致"改了没生效"

Electron 多进程。关窗口时主进程可能仍在后台，**旧进程加载旧 bundle**。

```powershell
Get-Item "C:\Users\猫猫\.dsh\profiles\desktop\node_modules\dsh-knowledge\lib\tool-knowledge\index.js" | Select LastWriteTime
Get-Process -Name "DeepSeek Harness" | Select Id, StartTime
```

进程启动时间 **早于** bundle 修改时间 = 用的是旧代码。必须进程归零再开。

### 坑3：多行字符串写入被逐字展开

用 JS 数组拼多行代码时，若把多行字符串交给字符串拼接，会得到"一行一个字符"。
**正确做法**：每行一个数组元素，`lines.join("\r\n")` 一次性写入；写完立刻 `node --check`。

### 坑4：`process.env.USERPROFILE` 可能为空

沙箱里跑脚本时 `USERPROFILE` 是空字符串，`path.join("", ".dsh")` 退化成相对路径。
**正确做法**：`DSH_HOME` → `USERPROFILE` → 写死本机路径，三级兜底。

### 坑5：GitHub 直连不通，必须走代理

```powershell
git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl clone <url>
```

API 调用同理：`curl -x http://127.0.0.1:7897 -H "Authorization: Bearer <token>" ...`

---

## 六、重装 / 换机器后怎么恢复

### 结论先说

**这个仓库是「源码 + 构建产物」的备份，不是「可直接运行」的备份。**
clone 下来还需要装依赖才能用。

### 不会带过来的东西

| 内容 | 在哪 | 会丢吗 |
|---|---|---|
| 知识库文档与向量（22 MB+） | `~/.dsh/storages/knowledge*.sqlite`、`knowledge.json` | ✅ 会丢（不在仓库里） |
| 原始文件 | `~/.dsh/storages/knowledge-raw/` | ✅ 会丢 |
| 15 个运行时依赖（625 MB） | `node_modules/` | ✅ 会丢（gitignore） |
| 我们的代码改动 | `lib/` | ❌ 不会丢（已提交） |

> 知识库内容是空的，需要重新建库、导入文档、勾选工作区。这是正常的干净状态。

### 恢复流程

```powershell
# 1. clone
git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl clone `
  https://github.com/2994650874-coder/dsh-knowledge.git
cd dsh-knowledge

# 2. 装运行时依赖（625 MB，首次较慢）
pnpm install

# 3. 装进 profile（用标准安装，不要 link —— 见 §八）
dsh plugin --profile desktop add <此目录的绝对路径>

# 4. 重启 DSH
```

### ⚠️ 为什么不要用 link

本插件 bundle 里有 6 个 external 裸 specifier（`@deepseek-ai/cordis`、
`@deepseek-ai/dsh-storage-domain`、`@deepseek-ai/dsh-tools`、`zod`、`jszip`、`undici`），
运行时由**宿主**提供。

`link:` 会把插件搬到 `~/.dsh/plugin-src/`，那里向上查找**看不到** profile 的
`node_modules`，6 个依赖全部解析失败 → `knowledge` 服务起不来 → 所有
`/knowledge/*` 返回 **404**。

2026-10-20 实测踩过，已回退。**用标准安装**，跟上游作者的方式一致。

### 验证恢复成功

```powershell
# 1. 闸门在不在（我们的改动）
Select-String -Path "C:\Users\猫猫\.dsh\profiles\desktop\node_modules\dsh-knowledge\lib\tool-knowledge\index.js" -Pattern "kbAllowedHere"

# 2. 服务活着（应返回 JSON，不是 404）
Invoke-WebRequest "http://127.0.0.1:<端口>/knowledge/stats" -UseBasicParsing

# 3. 面板能打开，工作区下拉可用
```

## 七、回滚到上游原样

```powershell
cd C:\Users\猫猫\.dsh\plugin-src\dsh-knowledge
git checkout upstream/main -- src/
node build.mjs
# 复制 lib/ 到 profile，重启 DSH
```

或直接 clone 一份干净的上游：

```powershell
git clone -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl `
  https://github.com/Soren-ABT/dsh-knowledge.git dsh-knowledge-clean
```

---

## 八、上游通知机制

### fork 了，作者会收到通知吗

**不会。** GitHub 的 fork 是单向静默的：fork 动作、往 fork 推代码，作者都收不到提醒。
只有主动发起 Pull Request 才会通知他。

### 还能收到上游更新吗

**能，但要主动订阅。** 默认 fork 不会自动发"上游有新提交"的邮件。

| 方式 | 操作 | 效果 |
|---|---|---|
| Watch（推荐） | 上游仓库页 → Watch → Custom → 勾 Commits | 上游有新提交时发邮件 |
| 手动查 | `git fetch upstream && git log --oneline local/main..upstream/main` | 完全可控，无邮件 |
| GitHub 网页 | fork 页面显示 "This branch is N commits behind" | 被动可见 |

---

## 九、许可证

本分支继承上游 **AGPL-3.0**。分发（含通过网络提供服务）须同样开源。
详见 [LICENSE](./LICENSE)。
