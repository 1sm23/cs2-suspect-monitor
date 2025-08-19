# CS2 嫌疑人监控系统

基于 Next.js 的 CS2 作弊嫌疑人监控工具，可以实时监控嫌疑人的在线状态、游戏状态，并管理相关证据。

## 功能特性

### 🎯 核心功能
- **实时监控**: 自动获取嫌疑人的在线状态和CS2游戏状态
- **证据管理**: 支持文字、链接、视频、图片等多种证据类型
- **Steam集成**: 通过Steam Web API获取玩家信息和状态
- **响应式设计**: 完美支持桌面端和移动端

### 📋 证据系统
- **多种类型**: 文字描述、链接、视频、图片
- **重要性标记**: 1-5级重要性评分
- **视频预览**: 支持YouTube视频嵌入播放
- **时间追踪**: 自动记录证据添加时间

### 🔍 监控功能
- **状态追踪**: 在线/离线/游戏中/忙碌等状态
- **CS2检测**: 自动识别是否正在玩CS2
- **批量刷新**: 一键刷新所有嫌疑人状态
- **搜索过滤**: 按昵称或Steam ID搜索

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui + Radix UI
- **数据库**: SQLite (better-sqlite3)
- **API**: Steam Web API
- **图标**: Lucide React

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Steam Web API Key (必须)
STEAM_API_KEY=your_steam_api_key_here

# 数据库文件路径
DATABASE_URL=./database.sqlite

# 应用URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 获取 Steam API Key

1. 访问 [Steam Web API Key](https://steamcommunity.com/dev/apikey)
2. 登录Steam账号
3. 填写域名信息（本地开发可填 `localhost`）
4. 获取API Key并填入 `.env` 文件

### 4. 初始化数据库

```bash
npm run db:init
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 使用指南

### 添加嫌疑人

1. 点击"添加嫌疑人"按钮
2. 输入嫌疑人的 Steam 64位 ID
3. 系统会自动获取玩家信息
4. 嫌疑人添加到监控列表

### 查看详细信息

1. 在主页点击嫌疑人卡片的"查看详情"
2. 查看详细的玩家信息和状态
3. 管理相关证据记录

### 添加证据

1. 在嫌疑人详情页点击"添加证据"
2. 选择证据类型：文字、链接、视频、图片
3. 设置重要性等级 (1-5)
4. 填写证据内容和描述
5. 保存证据记录

### 状态监控

- **绿点**: 在线
- **蓝点**: 游戏中
- **黄点**: 离开
- **红点**: 忙碌
- **灰点**: 离线
- **CS2 标签**: 正在玩CS2

## 获取 Steam 64位 ID

### 方法一：从个人资料URL获取
1. 访问玩家的Steam个人资料页面
2. URL格式：`https://steamcommunity.com/profiles/76561198XXXXXXXXX`
3. 复制 `/profiles/` 后面的17位数字

### 方法二：使用在线工具
1. 访问 [SteamID.io](https://steamid.io/)
2. 输入任意格式的Steam ID
3. 获取对应的Steam64 ID

### 方法三：Steam客户端
1. 在Steam中右键点击好友
2. 选择"复制Steam ID"
3. 使用转换工具转换为64位ID

## 项目结构

```
├── app/
│   ├── api/                    # API路由
│   │   ├── suspects/          # 嫌疑人相关API
│   │   └── steam/             # Steam API集成
│   ├── components/            # React组件
│   │   ├── SuspectCard.tsx    # 嫌疑人卡片
│   │   ├── SuspectList.tsx    # 嫌疑人列表
│   │   ├── SuspectDetail.tsx  # 嫌疑人详情
│   │   ├── EvidenceList.tsx   # 证据列表
│   │   ├── EvidenceForm.tsx   # 证据表单
│   │   └── AddSuspectForm.tsx # 添加嫌疑人表单
│   ├── lib/                   # 工具库
│   │   ├── db.ts             # 数据库操作
│   │   ├── steam.ts          # Steam API封装
│   │   ├── types.ts          # 类型定义
│   │   └── utils.ts          # 工具函数
│   ├── suspects/             # 嫌疑人相关页面
│   └── globals.css           # 全局样式
├── components/ui/             # UI组件库
├── scripts/
│   └── init-db.js            # 数据库初始化脚本
└── README.md
```

## 数据库结构

### suspects 表
```sql
CREATE TABLE suspects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_checked DATETIME,
  status TEXT,
  is_playing_cs2 BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  profile_url TEXT
);
```

### evidence 表
```sql
CREATE TABLE evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suspect_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  importance INTEGER DEFAULT 1,
  FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
);
```

## 部署

### Vercel 部署

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 配置环境变量：
   - `STEAM_API_KEY`
   - `DATABASE_URL` (使用绝对路径)
4. 部署完成

### 本地构建

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 开发说明

### 添加新功能
1. 在 `app/lib/types.ts` 中定义类型
2. 在 `app/api/` 中添加API路由
3. 在 `app/components/` 中创建组件
4. 在页面中使用组件

### 数据库操作
- 使用 `app/lib/db.ts` 中的工具函数
- 支持CRUD操作和关联查询
- 自动处理外键约束

### Steam API集成
- 在 `app/lib/steam.ts` 中封装API调用
- 支持玩家信息获取和状态检查
- 处理API错误和限制

## 常见问题

### Steam API Key无效
- 确保API Key正确复制
- 检查域名设置是否匹配
- API Key有使用频率限制

### 嫌疑人状态不更新
- 检查Steam API Key是否有效
- 确认网络连接正常
- Steam API可能有延迟

### 数据库错误
- 确保有写入权限
- 检查数据库文件路径
- 重新运行 `npm run db:init`

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

⚠️ **免责声明**: 此工具仅用于监控目的，请遵守相关法律法规和平台规则。
