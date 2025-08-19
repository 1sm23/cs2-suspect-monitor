# CS2 Suspect Monitor

CS2作弊嫌疑人监控系统 - 基于Next.js的Steam API监控工具

A comprehensive CS2 suspect monitoring system built with Next.js 14, TypeScript, and Tailwind CSS. This application allows you to monitor Steam players' online status, manage evidence, and track status history changes.

## Features

- **Suspect Management**: Add, import, and delete suspects using Steam IDs
- **Real-time Status Monitoring**: Automatic status updates via Steam API
- **Evidence Management**: Support for text, links, images, videos, and file uploads
- **Status History**: Track status changes over time
- **Multi-language Support**: English and Chinese (Simplified)
- **Authentication**: Simple password-based authentication
- **Responsive UI**: Modern design with Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Steam API key (get one from https://steamcommunity.com/dev/apikey)

### Installation

1. **Clone the repository:**
````bash
git clone <repository-url>
cd cs2-suspect-monitor
````

2. **Install dependencies:**
````bash
npm install
````

3. **Set up environment variables:**
````bash
cp .env.example .env.local
````

Edit `.env.local` with your configuration:
````env
# Steam API Key - get from https://steamcommunity.com/dev/apikey
STEAM_API_KEY=your_steam_api_key_here

# Database URL for SQLite
DATABASE_URL=./database.db

# Admin password for authentication
ADMIN_PASSWORD=your_secure_password

# Supported languages (comma-separated)
SUPPORTED_LANGS=en,zh

# Default language
DEFAULT_LANG=en

# Maximum upload file size in bytes (10MB default)
MAX_UPLOAD_SIZE=10485760
````

4. **Run the development server:**
````bash
npm run dev
````

5. **Access the application:**
Open http://localhost:3000 in your browser

### Production Deployment

1. **Build the application:**
````bash
npm run build
````

2. **Start the production server:**
````bash
npm start
````

## Usage

### Authentication

1. Navigate to the application URL
2. Enter your admin password (set in ADMIN_PASSWORD environment variable)
3. Click "Sign In"

### Managing Suspects

#### Adding Individual Suspects
1. Go to "Add Suspect" from the navigation
2. Enter a 17-digit Steam ID
3. Optionally add a nickname
4. Click "Add Suspect"

#### Importing Multiple Suspects
1. Go to "Import" from the navigation
2. Enter one Steam ID per line in the text area
3. Optionally add nicknames after each Steam ID
4. Click "Import Suspects"

### Monitoring Status

- The system automatically refreshes suspect statuses every 30 seconds
- Manual refresh is available via the refresh button
- Status history is tracked and displayed for each suspect

### Managing Evidence

1. Click on a suspect to view their details
2. Use the "Evidence" tab to add new evidence
3. Supported evidence types:
   - Text: Plain text notes
   - Link: URLs to external resources
   - Image: Upload image files
   - Video: Upload video files
   - File: Upload any file type

### Status Meanings

- **Online**: Player is currently online on Steam
- **Offline**: Player is offline
- **Private**: Player's profile is private
- **Unknown**: Status cannot be determined
- **Banned**: Player appears to be banned (detected via Steam API)

## Configuration

### Environment Variables

- `STEAM_API_KEY`: Required for Steam API integration
- `DATABASE_URL`: SQLite database file path
- `ADMIN_PASSWORD`: Authentication password
- `SUPPORTED_LANGS`: Available languages (en,zh)
- `DEFAULT_LANG`: Default language
- `MAX_UPLOAD_SIZE`: Maximum file upload size in bytes

### Database

The application uses SQLite with automatic database initialization. Tables are created automatically on first run:

- `suspects`: Stores suspect information
- `evidence`: Stores evidence files and data
- `suspect_status_history`: Tracks status changes

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Suspects
- `GET /api/suspects` - List all suspects
- `POST /api/suspects` - Create new suspect
- `GET /api/suspects/[id]` - Get suspect details
- `DELETE /api/suspects/[id]` - Delete suspect
- `POST /api/suspects/import` - Batch import suspects
- `POST /api/suspects/status/refresh` - Refresh all statuses

### Evidence
- `GET /api/suspects/[id]/evidence` - Get suspect evidence
- `POST /api/suspects/[id]/evidence` - Add evidence
- `DELETE /api/suspects/[id]/evidence` - Delete evidence

### Utilities
- `POST /api/upload` - Upload files
- `GET /api/health` - Health check

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Authentication**: Custom JWT-like tokens
- **File Uploads**: Local file system storage
- **API Integration**: Steam Web API

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
