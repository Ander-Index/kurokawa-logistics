# 🚚 黑川物流 · Kurokawa Logistics

🌐 官网：[kurokawa-logistics.com](https://kurokawa-logistics.com)

## 分支结构

| 分支 | 用途 | 谁能推 |
|---|---|---|
| `dev` | 开发者自由实验区，随意改写提交 | 所有受邀协作者 |
| `pre` | 审阅区，管理员在此审阅 dev 的更改 | 仅管理员 |
| `main` | 正式备份，主创定稿 | 仅管理员 |

## 🚀 快速上手

### 1. 准备工具

- **[GitHub Desktop](https://desktop.github.com/)** —— 新手推荐，图形界面操作 git
  - 如果你是 git 熟手，直接用命令行 git 就行
- **[Obsidian（黑曜石）](https://obsidian.md/download)** —— 打开和编辑内容

### 2. 拉取仓库

**GitHub Desktop：**
左上角 `File` → `Clone Repository` → 切到 `URL` 标签页 → 粘贴：

```
https://github.com/Ander-Index/kurokawa-logistics.git
```

→ `Clone`，选一个你顺手存放的本地位置。

**命令行：**

```bash
git clone https://github.com/Ander-Index/kurokawa-logistics.git
```

### 3. 受邀加入仓库

想要直接推送的权限？**直接在群里吆喝一声，管理员看得到**，会给你发协作者邀请。接受邀请后即可直接推送 `dev`。

> 没受邀也没关系：fork 本仓库，改完后提 Pull Request 到 `dev` 即可。

### 4. 用 Obsidian 打开

打开 Obsidian → 「打开另一个库 / Open another vault」→「打开本地文件夹」→ 选择你克隆下来的目录里的 **`黑川物流`** 子文件夹。

> ⚠️ 注意：vault 是仓库里的 `黑川物流` 文件夹，不是仓库根目录。

### 5. 把更改推送到 dev 分支

**先切到 dev 分支，再开始改：**

**GitHub Desktop：** 顶部 `Branch` 菜单 → 切换到 `dev` → 改完后左下角填提交说明 → `Commit to dev` → `Push origin`

**命令行：**

```bash
git switch dev
git add -A
git commit -m "你改了什么"
git push
```

> ⚠️ 推送到 `main` 或 `pre` 会被 GitHub **直接拒绝**，别尝试了，乖乖推 `dev`。

## 📌 其他约定

- 换行符已由仓库统一强制为 **LF**，任何设备都不用手动设置
- `.obsidian/` 个人配置（设置、收藏夹、工作区）**不会同步**，每个人都用自己的编辑习惯
