# 闲鱼自动回复系统

一个运行于自托管环境的闲鱼（Goofish）自动回复与自动发货系统。通过 WebSocket 长连接监听闲鱼账号的买卖消息，按关键词、商品、AI 策略自动回复，并可在订单付款后执行自动发货 / 自动确认发货。

- **后端**：Python 3.11+ / FastAPI / SQLite / asyncio
- **前端**：Vue 3 + TypeScript + Element Plus（`frontend/`），亦可使用 `static/` 中的旧版原生前端
- **运行方式**：本地直接运行，或 Docker 部署
- **面向用户**：需要管理多个闲鱼账号、并期望自动化回复与发货流程的开发者或卖家

> 本项目为独立实现的自动化业务系统，**非**闲鱼官方出品，与闲鱼 / 淘宝 / 阿里巴巴集团无附属关系。仅供学习研究使用。

---

## 快速开始

### Docker（推荐）

```bash
# 准备环境变量（管理员初始密码与一个随机密钥为必填项）
cat > .env <<'EOF'
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<你的强密码>
JWT_SECRET_KEY=<随机字符串>
EOF

docker compose up -d --build
```

国内服务器可改用 `docker-compose-cn.yml`：

```bash
docker compose -f docker-compose-cn.yml up -d --build
```

启动后访问 `http://<host>:8080` 登录，默认管理员为环境变量中设置的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`。

### 源码直接运行

```bash
pip install -r requirements.txt
playwright install chromium
python Start.py
```

Web 服务默认监听 `0.0.0.0:8080`。

---

## 解决的问题

管理一个以上闲鱼账号时，重复的手工操作会占用大量时间。本系统把以下几类工作接成自动化：

- **消息监听**：通过 WebSocket 长连接持续接收闲鱼买卖消息（主动推送，而非轮询）。
- **自动回复**：按优先级匹配回复内容（指定商品回复 → 商品关键词 → 通用关键词 → 默认回复 → AI 回复）。
- **自动发货**：订单付款后从匹配的卡券（文本 / 数据 / 图片 / API）自动发货。
- **自动确认发货**：调用闲鱼接口确认订单发货，带并发锁与防重复确认。
- **管理与监控**：多用户多账号、商品、卡券、发货规则、通知渠道、日志、备份等 Web 管理界面。

---

## How It Works

```text
闲鱼 / Goofish
     │  WebSocket 长连接 (wss://wss-goofish.dingtalk.com)
     ▼
XianyuAutoAsync.py ── 消息解析、回复策略、订单/发货事件
     │
     ├──► cookie_manager.py ── 多账号任务调度
     ├──► order_status_handler.py ── 订单状态 → 自动发货 / 确认
     ├──► ai_reply_engine.py ── AI 回复（OpenAI 兼容接口）
     └──► db_manager.py ── SQLite 持久化
     │
     ▼
reply_server.py ── FastAPI + WebSocket，托管管理 Web 前端
     │
     ▼
浏览器（Vue SPA）／管理 API
```

`Start.py` 是启动入口：迁移数据库 → 初始化依赖 → 加载账号 → 启动闲鱼任务 → 后台线程拉起 FastAPI（`reply_server:app`）。

---

## 项目结构

```
xianyu-auto-reply/
├── Start.py                 # 启动入口：数据库迁移、依赖初始化、启动 API 服务
├── reply_server.py          # FastAPI 应用与全部 REST / WebSocket 接口，托管前端
├── XianyuAutoAsync.py       # 闲鱼 WebSocket 消息处理核心
├── db_manager.py            # SQLite 数据库访问层（多用户隔离、落库加密、SQL 日志）
├── cookie_manager.py        # 多账号 Cookie 管理与任务调度
├── ai_reply_engine.py       # AI 回复引擎（OpenAI 兼容 / DashScope / Gemini）
├── order_status_handler.py  # 订单状态处理与自动发货逻辑
├── secure_confirm*.py       # 自动确认发货模块（含解密版与安全化的 ultra 版）
├── secure_freeshipping*.py  # 自动免拼发货模块（同上）
├── file_log_collector.py    # 日志收集与实时查看
├── config.py                # 读取 global_config.yml
├── usage_statistics.py      # 可选匿名使用统计（默认关闭）
├── global_config.yml        # 运行时配置（闲鱼接口、回复、日志等）
├── requirements.txt         # Python 依赖
├── static/                  # 旧版前端（原生 JS + Bootstrap，仍可用）
├── frontend/                # 新版 Vue 3 前端工程（见下）
├── utils/                   # 辅助模块：扫码/密码登录、滑块、商品搜索、图片等
├── nginx/                   # 可选 Nginx 反向代理配置
├── Dockerfile / Dockerfile-cn / docker-compose*.yml / entrypoint.sh  # 容器部署
└── data/                    # 运行时数据目录（SQLite 数据库），不应提交到 Git
```

### `frontend/`（新版前端）

```
frontend/
├── package.json / vite.config.ts / tsconfig.json
├── index.html
└── src/
    ├── main.ts / App.vue        # 应用入口
    ├── router/                  # Vue Router（hash 模式）+ 登录守卫
    ├── stores/                  # Pinia 状态（认证）
    ├── api/                     # 后端接口封装（axios）
    ├── views/                   # 各业务页面
    └── styles/theme.css         # 主题与样式覆盖
```

`frontend/dist/` 是构建产物，被后端 `reply_server.py` 静态托管（`/assets` + SPA fallback），**不应提交到 Git**（见 `frontend/.gitignore`）。

---

## 需求

### 环境要求

| 用途 | 需要 |
|---|---|
| 运行（源码） | Python 3.11+、依赖见 `requirements.txt`、Chromium（Playwright） |
| 构建前端 | Node.js 18+、npm |
| Docker 部署 | Docker + Docker Compose |

> **构建前端**需要 Node.js；**运行最终系统**不需要 Node.js（前端构建产物 `dist/` 已由后端托管）。普通用户按「Docker / 源码直接运行」即可，无需 Node 环境。

运行时还需要一个可用的闲鱼账号 Cookie（在 Web 界面的「账号管理」中配置）。自动回复、自动发货等功能依赖真实闲鱼运营环境，无法离线验证。

---

## 配置

系统通过两层配置控制行为：

### 1. `global_config.yml`
- 闲鱼接口地址、WebSocket 地址、请求头、回复策略、日志格式与轮转、滑块验证参数等。

### 2. 环境变量（可覆盖默认值）
常用项：

| 变量 | 默认 | 说明 |
|---|---|---|
| `API_HOST` / `API_PORT` | `0.0.0.0` / `8080` | Web 服务监听地址与端口 |
| `DB_PATH` | `data/xianyu_data.db` | SQLite 数据库路径 |
| `INITIAL_ADMIN_PASSWORD` | 随机生成 | 初次创建 admin 用户的密码（未设置则自动生成并在日志提示一次） |
| `CORS_ORIGINS` | `localhost:5173` | 前后端分离开发时允许的跨域来源，逗号分隔 |
| `COOKIE_ENCRYPTION_KEY` | 自动生成 | Cookie / 账号密码落库加密密钥 |
| `COOKIE_ENCRYPTION_DISABLED` | `false` | 设为 `true` 关闭落库加密 |
| `ADMIN_PASSWORD` / `JWT_SECRET_KEY` | 无 | Docker 部署时必填（Compose 强制要求） |
| `AUTO_DELIVERY_ENABLED` | `false` | 是否开启自动发货（默认关闭，需显式开启） |

完整的环境变量清单见 `docker-compose.yml` 的 `environment` 段。

---

## 数据、权限与用户文件

- **SQLite 数据库**：位于 `data/xianyu_data.db`（或 `DB_PATH` 指定的路径），保存用户、Cookie、关键词、卡券、订单等全部数据。
- **运行时数据目录**：`data/`、`logs/`、`backups/`、`static/uploads/`。这些目录由系统创建并写入，**不应提交到 Git**（已由根 `.gitignore` 处理）。
- **Cookie 落库加密**：默认启用。加密密钥优先取环境变量 `COOKIE_ENCRYPTION_KEY`，否则自动生成并保存到数据库同级目录的 `.crypto_key`（权限 600）。**此密钥文件需随数据一并备份**；若丢失且未设置环境变量密钥，历史密文将无法解密。
- **用户密码**：使用带盐 PBKDF2-SHA256 存储（自动兼容旧版无盐 SHA-256 哈希，并可在更新时升级）。
- **认证会话**：登录后返回 Bearer Token，存于**进程内存**（`SESSION_TOKENS`），默认 24 小时过期。系统重启后所有会话失效。**注意**：内存会话机制意味着该项目的认证并非无状态 JWT。
- **匿名使用统计**：`usage_statistics.py` 默认**关闭**（需 `ENABLE_USAGE_STATISTICS=true` 才会上报），上报内容仅为匿名机器标识、系统类型与版本号，不包含账号、密码、关键词等业务数据。

---

## 开发

### 前端开发（前后端分离模式）

```bash
cd frontend
npm install
npm run dev        # 启动 Vite dev server（默认 http://localhost:5173，代理到后端 8080）
```

后端需先在 8080 运行（`python Start.py`），或设置 `VITE_BACKEND_TARGET` 指向其它后端地址。

### 生产构建

```bash
cd frontend
npm run build      # 生成 frontend/dist，由后端托管
```

构建后刷新后端托管的页面（`/`）即为新前端。

---

## 当前状态

**已完成 / 支持**

- 多用户、多闲鱼账号管理与数据隔离。
- 关键词 / 指定商品 / 默认回复 / AI 回复，以及优先级策略。
- 自动发货（文本 / 数据 / 图片 / API 卡券）、规格匹配、自动确认发货、自动免拼发货。
- 商品管理、订单管理、商品搜索、通知渠道、系统日志、数据管理、用户管理等管理界面。
- 前端重构：(新版) Vue 3 + Element Plus 页面，覆盖登录、仪表盘与大部分管理与运维模块。

**尚未支持 / 已知限制**

- 自动回复、自动发货等能力依赖**真实闲鱼运营环境**，需真实账号 Cookie 且闲鱼接口可能随时调整——不保证任意时刻可用。
- 认证基于进程内存会话，非无状态 JWT；**不支持多实例 / 进程重启后保持会话**。
- 新版前端尚未覆盖旧版 `static/` 中的全部交互（例如扫码登录、滑块 / 人脸验证的完整弹窗流程）；相关功能仍可在旧前端使用。
- 关键词等部分数据通过「整体替换」接口写入，前端目前按该语义实现（新增 / 删除后整体提交）。
- 匿名使用统计默认关闭；若手动开启会向第三方服务器上报匿名运行信息。

**后续可能方向**

- 补齐扫码 / 密码登录与滑块 / 人脸验证在新前端的完整流程。
- 将会话改为可持久化的无状态认证，支持多实例。
- 增加针对闲鱼接口变更的适配机制。

---

## 下载 / 获取最新版本

- 最新代码以 **GitHub 仓库为准**：<https://github.com/zhinianboke/xianyu-auto-reply>
- 镜像 / 打包文件（如有）见仓库 Releases 页或部署向导。
- 项目根目录另附 `最新镜像地址.txt` 及网盘转存提示，可参考仓库说明。

---

## 免责声明

- 本项目**仅供学习研究**，禁止商业用途。
- 使用本项目即表示你同意：自行承担因使用自动回复、自动发货等功能可能产生的账号风险与法律责任。
- 系统会连接闲鱼 / 淘宝相关服务，请遵守平台规则。

---

## 许可证

本项目未附带开源许可证（以仓库与文件声明为准），默认保留所有权利，仅供学习研究。商业使用需另行取得授权。
