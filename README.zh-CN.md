# CS2 Suspect Monitor

CS2作弊嫌疑人监控系统 - 基于Next.js的Steam API监控工具

![CS2 Suspect Monitor](/public/screenshot.png)

## 🎯 项目简介

CS2 Suspect Monitor 是一个专为追求高段位的 Counter-Strike 2 玩家设计的作弊嫌疑人监控系统。

**项目诞生的初衷：**
作为一名致力于冲击优先分段位的 CS2 玩家，我深刻体会到了高分段竞技的残酷现实——当分数接近 30,000 分时，输掉一局比赛就要扣掉四五百分。在这个水平遇到外挂简直是毁灭性的打击。这个工具的诞生源于一个朴素的想法：既然无法完全避免外挂，那就通过智能监控来规避风险。

**工作原理：**
通过集成 Steam API，实时追踪可疑玩家的在线状态、游戏活动和封禁情况。当发现嫌疑人在线但还没有进入游戏时，我会选择暂时不排；等他们进入游戏后，我再开始排，这样可以大大降低在同一局游戏中遇到他们的概率。这不仅仅是一个监控工具，更是高分段玩家保护自己珍贵分数的战略武器。

## ✨ 主要功能

### 🔍 嫌疑人管理

- **添加嫌疑人**：支持 Steam ID 或 Steam 个人资料 URL
- **智能分类**：实锤、高风险、嫌疑三个等级
- **实时监控**：自动获取 Steam 用户状态和封禁信息
- **批量更新**：定期刷新所有嫌疑人状态

### 📊 状态监控

- **在线状态**：实时显示用户在线/离线状态
- **游戏状态**：
  - CS2 已启动 (橙色标记)
  - 正在游戏中 (绿色标记，显示服务器IP)
- **封禁状态**：VAC 封禁和游戏封禁检测
- **最后活动**：显示最后下线时间

### 🎛️ 筛选功能

- **仅在线用户**：快速查看当前在线的嫌疑人
- **仅已启动 CS2**：筛选正在运行 CS2 的用户
- **仅正在游戏中**：查看真正在服务器中游戏的用户

### 🛠️ 管理功能

- **编辑信息**：修改昵称和分类
- **删除确认**：安全删除嫌疑人记录
- **数据持久化**：本地 SQLite 数据库存储

### 🌍 国际化支持

- 🇨🇳 简体中文
- 🇺🇸 English
- 动态语言切换

## 🚀 技术栈

- **前端框架**：Next.js 15.4.7 (App Router)
- **UI 组件**：shadcn/ui + Tailwind CSS
- **数据库**：SQLite (better-sqlite3)
- **状态管理**：Zustand
- **API 集成**：Steam Web API
- **类型安全**：TypeScript

## 📦 安装和部署

### 前置要求

- Node.js 18+
- Steam API Key ([获取地址](https://steamcommunity.com/dev/apikey))

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/1sm23/cs2-suspect-monitor.git
cd cs2-suspect-monitor
```

2. **安装依赖**

```bash
pnpm install
# 或
npm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
STEAM_API_KEY=your_steam_api_key_here
AUTH_PASSWORD=your_login_password
```

4. **启动开发服务器**

```bash
pnpm dev
# 或
npm run dev
```

5. **访问应用**
   打开 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
cs2-suspect-monitor/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── components/        # React 组件
│   ├── suspects/          # 嫌疑人页面
│   └── login/             # 登录页面
├── components/            # shadcn/ui 组件
├── lib/                   # 工具库
│   ├── auth.ts           # 认证逻辑
│   ├── db.ts             # 数据库配置
│   ├── steam.ts          # Steam API 集成
│   └── i18n.ts           # 国际化
├── locales/             # 翻译文件
├── data/                 # SQLite 数据库 (gitignored)
└── scripts/              # 工具脚本
```

## 🔧 核心功能实现

### Steam API 集成

- **用户信息**：`ISteamUser/GetPlayerSummaries/v2`
- **封禁状态**：`ISteamUser/GetPlayerBans/v1`
- **实时状态**：在线状态、游戏状态、服务器IP

### 数据库设计

```sql
CREATE TABLE suspects (
  id INTEGER PRIMARY KEY,
  steam_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
  personaname TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  vac_banned BOOLEAN,
  game_ban_count INTEGER,
  current_gameid INTEGER,
  game_server_ip TEXT,
  -- ... 更多字段
);
```

### 筛选系统

后端 API 支持动态筛选：

- `GET /api/suspects?online=true` - 仅在线用户
- `GET /api/suspects?cs2_launched=true` - 仅已启动 CS2
- `GET /api/suspects?in_game=true` - 仅正在游戏中

## 📋 TODO 清单

### 🔥 高优先级

- [ ] **罪证上传系统**
  - [ ] 截图上传和预览
  - [ ] 视频证据支持
  - [ ] 文件管理和组织
  - [ ] 证据时间线展示

- [ ] **搜索功能**
  - [ ] 按昵称/Steam ID 搜索
  - [ ] 按分类筛选
  - [ ] 按时间范围筛选
  - [ ] 高级搜索组合

### 🎯 中优先级

- [ ] **增强的监控功能**
  - [ ] 状态变化历史记录
  - [ ] 封禁状态变化通知
  - [ ] 游戏时长统计
  - [ ] 朋友列表分析

- [ ] **数据分析**
  - [ ] 嫌疑人统计图表
  - [ ] 封禁率统计
  - [ ] 活跃时间分析
  - [ ] 数据导出功能

- [ ] **用户体验优化**
  - [x] 黑暗模式支持
  - [ ] 响应式布局优化
  - [ ] 键盘快捷键
  - [ ] 加载状态优化

### 🔮 未来规划

- [ ] **协作功能**
  - [ ] 多用户支持
  - [ ] 团队共享黑名单
  - [ ] 社区举报系统
  - [ ] 信誉评分系统

- [ ] **高级功能**
  - [ ] 机器学习行为检测
  - [ ] 自动化监控告警
  - [ ] 第三方平台集成
  - [ ] API 开放接口

- [ ] **性能优化**
  - [ ] 数据库索引优化
  - [ ] API 请求缓存
  - [ ] 大数据量处理
  - [ ] 部署优化

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## ⚠️ 免责声明

本工具仅用于个人学习和合法的游戏监控目的。请遵守相关法律法规和 Steam 服务条款，不得用于恶意用途。

## 📞 联系方式

- GitHub: [@1sm23](https://github.com/1sm23)
- Issues: [GitHub Issues](https://github.com/1sm23/cs2-suspect-monitor/issues)

---

**让我们一起创造更公平的游戏环境！** 🎮
