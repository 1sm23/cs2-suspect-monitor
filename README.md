# CS2 Suspect Monitor

CS2 Cheating Suspect Monitoring System - Steam API Monitoring Tool Based on Next.js

[中文文档](./README.zh-CN.md) | English

![CS2 Suspect Monitor](/public/screenshot.png)

## 🎯 Project Overview

CS2 Suspect Monitor is a cheating suspect monitoring system designed specifically for Counter-Strike 2 players who are serious about climbing the competitive ladder. 

**The Story Behind This Project:**
As a dedicated CS2 player aiming for Premier rank, I faced a frustrating reality - at high skill levels (around 30,000 Premier rating), losing a single match could cost 400-500 rating points. Encountering cheaters at this stage was absolutely devastating to ranking progress. This tool was born from the need to strategically avoid queuing when known cheaters are online, and to time my matches when suspicious players have already entered games, maximizing the chances of fair competition.

**How It Works:**
By integrating Steam API, this system tracks suspicious players' online status, game activities, and ban status in real-time. Players can monitor their personal "blacklist" database, check if suspects are currently online or in-game, and make informed decisions about when to queue for competitive matches. It's about playing smarter, not harder - protecting your hard-earned rating from the inevitable cheater encounters that plague high-level CS2.

## ✨ Key Features

### 🔍 Suspect Management
- **Add Suspects**: Support Steam ID or Steam profile URL
- **Smart Categories**: Confirmed, High Risk, Suspicious three levels
- **Real-time Monitoring**: Automatically fetch Steam user status and ban information
- **Batch Updates**: Periodically refresh all suspects' status

### 📊 Status Monitoring
- **Online Status**: Real-time display of user online/offline status
- **Game Status**:
  - CS2 Launched (orange indicator)
  - In Game (green indicator, showing server IP)
- **Ban Status**: VAC ban and game ban detection
- **Last Activity**: Display last offline time

### 🎛️ Filtering Features
- **Online Only**: Quickly view currently online suspects
- **CS2 Launched Only**: Filter users running CS2
- **In Game Only**: View users actually playing on servers

### 🛠️ Management Features
- **Edit Information**: Modify nickname and category
- **Delete Confirmation**: Safe deletion of suspect records
- **Data Persistence**: Local SQLite database storage

### 🌍 Internationalization
- 🇨🇳 Simplified Chinese
- 🇺🇸 English
- Dynamic language switching

## 🚀 Tech Stack

- **Frontend Framework**: Next.js 15.4.7 (App Router)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **State Management**: Zustand
- **API Integration**: Steam Web API
- **Type Safety**: TypeScript

## 📦 Installation and Deployment

### Prerequisites
- Node.js 18+ 
- Steam API Key ([Get here](https://steamcommunity.com/dev/apikey))

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/1sm23/cs2-suspect-monitor.git
cd cs2-suspect-monitor
```

2. **Install Dependencies**
```bash
pnpm install
# or
npm install
```

3. **Configure Environment Variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` file:
```env
STEAM_API_KEY=your_steam_api_key_here
AUTH_PASSWORD=your_login_password
```

4. **Start Development Server**
```bash
pnpm dev
# or
npm run dev
```

5. **Access Application**
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cs2-suspect-monitor/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── suspects/          # Suspects page
│   └── login/             # Login page
├── components/            # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database configuration
│   ├── steam.ts          # Steam API integration
│   └── i18n.ts           # Internationalization
├── messages/             # Translation files
├── data/                 # SQLite database (gitignored)
└── scripts/              # Utility scripts
```

## 🔧 Core Implementation

### Steam API Integration
- **User Information**: `ISteamUser/GetPlayerSummaries/v2`
- **Ban Status**: `ISteamUser/GetPlayerBans/v1`
- **Real-time Status**: Online status, game status, server IP

### Database Design
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
  -- ... more fields
);
```

### Filtering System
Backend API supports dynamic filtering:
- `GET /api/suspects?online=true` - Online users only
- `GET /api/suspects?cs2_launched=true` - CS2 launched only
- `GET /api/suspects?in_game=true` - In game only

## 📋 TODO List

### 🔥 High Priority
- [ ] **Evidence Upload System**
  - [ ] Screenshot upload and preview
  - [ ] Video evidence support
  - [ ] File management and organization
  - [ ] Evidence timeline display

- [ ] **Search Functionality**
  - [ ] Search by nickname/Steam ID
  - [ ] Filter by category
  - [ ] Filter by time range
  - [ ] Advanced search combinations

### 🎯 Medium Priority
- [ ] **Enhanced Monitoring**
  - [ ] Status change history
  - [ ] Ban status change notifications
  - [ ] Game time statistics
  - [ ] Friends list analysis

- [ ] **Data Analytics**
  - [ ] Suspect statistics charts
  - [ ] Ban rate statistics
  - [ ] Activity time analysis
  - [ ] Data export functionality

- [ ] **User Experience Optimization**
  - [x] Dark mode support
  - [ ] Responsive layout optimization
  - [ ] Keyboard shortcuts
  - [ ] Loading state optimization

### 🔮 Future Plans
- [ ] **Collaboration Features**
  - [ ] Multi-user support
  - [ ] Team shared blacklist
  - [ ] Community reporting system
  - [ ] Reputation scoring system

- [ ] **Advanced Features**
  - [ ] Machine learning behavior detection
  - [ ] Automated monitoring alerts
  - [ ] Third-party platform integration
  - [ ] Open API interface

- [ ] **Performance Optimization**
  - [ ] Database index optimization
  - [ ] API request caching
  - [ ] Large data processing
  - [ ] Deployment optimization

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details

## ⚠️ Disclaimer

This tool is for personal learning and legitimate game monitoring purposes only. Please comply with relevant laws and Steam Terms of Service, and do not use for malicious purposes.

## 📞 Contact

- GitHub: [@1sm23](https://github.com/1sm23)
- Issues: [GitHub Issues](https://github.com/1sm23/cs2-suspect-monitor/issues)

---

**Let's create a fairer gaming environment together!** 🎮
