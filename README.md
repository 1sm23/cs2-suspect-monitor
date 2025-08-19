# CS2 Suspect Monitor

CS2作弊嫌疑人监控系统 - 基于Next.js的Steam API监控工具

A Next.js-based monitoring system for tracking Counter-Strike 2 suspected cheaters using Steam API.

## Features

- 🔍 Monitor suspected cheaters via Steam profiles
- 📊 Track ban history and status changes
- 📁 Evidence management (files, screenshots, demos)
- 🌐 Multi-language support (English/Chinese)
- 🔐 Simple password-based authentication
- 📱 Responsive design with dark mode support

## Setup

### Prerequisites

- Node.js 18+ 
- Steam API Key (get from https://steamcommunity.com/dev/apikey)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cs2-suspect-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:
```env
STEAM_API_KEY=your_steam_api_key_here
DATABASE_URL=./database.sqlite
ADMIN_PASSWORD=your_secure_password
SUPPORTED_LANGS=en,zh
DEFAULT_LANG=zh
MAX_UPLOAD_SIZE=26214400
```

4. Run the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:3000`

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Usage

1. Navigate to the application URL
2. Login with your admin password
3. Add suspects using Steam profile URLs or Steam IDs
4. Monitor status changes and manage evidence
5. View detailed suspect profiles and ban history

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, better-sqlite3
- **Authentication**: Session-based with HTTP-only cookies
- **APIs**: Steam Web API

## TODO - Future Features

- [ ] **Data Export**
  - [ ] Export suspects list to CSV/JSON
  - [ ] Backup/restore database functionality
  
- [ ] **Analytics & Charts**
  - [ ] Ban rate statistics and trends
  - [ ] Evidence type distribution charts
  - [ ] Monthly/yearly reports
  
- [ ] **Enhanced Tagging System**
  - [ ] Tag management interface
  - [ ] Tag-based filtering and search
  - [ ] Auto-tagging based on evidence patterns
  
- [ ] **Performance & Caching**
  - [ ] Steam API response caching
  - [ ] Background job queue for bulk operations
  - [ ] Database query optimization
  
- [ ] **User Management & Roles**
  - [ ] Multiple user accounts
  - [ ] Role-based access control (admin, viewer, contributor)
  - [ ] Activity logging and audit trails
  
- [ ] **Advanced Evidence Features**
  - [ ] Video/demo file preview
  - [ ] Evidence thumbnails and metadata
  - [ ] Bulk evidence upload
  - [ ] Evidence verification workflow
  
- [ ] **API & Integration**
  - [ ] Rate limiting for API endpoints
  - [ ] Webhook notifications for status changes
  - [ ] REST API documentation
  - [ ] Third-party integrations (Discord, Telegram)
  
- [ ] **Automation & Monitoring**
  - [ ] Scheduled Steam profile checks
  - [ ] Automated ban detection notifications
  - [ ] Bulk suspect import from game logs
  
- [ ] **Data Validation & Quality**
  - [ ] Zod schema validation for all inputs
  - [ ] Data integrity checks
  - [ ] Duplicate detection and merging
  
- [ ] **Testing & Quality Assurance**
  - [ ] Unit test coverage (Jest/Vitest)
  - [ ] Integration tests for API routes
  - [ ] End-to-end testing (Playwright)
  - [ ] Performance testing
  
- [ ] **DevOps & Deployment**
  - [ ] Docker containerization
  - [ ] Docker Compose for development
  - [ ] CI/CD pipeline setup
  - [ ] Environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
