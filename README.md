# Disaster Response Platform

A comprehensive real-time disaster management and emergency response platform built with Next.js, Supabase, and WebSocket technology. This platform enables efficient coordination, reporting, and resource management during emergency situations.

## 🌟 Features

### Core Functionality
- **Real-time Disaster Monitoring**: Live dashboard with real-time updates on active disasters
- **Multi-source Reporting**: Citizen reports, social media integration, and official updates
- **Geospatial Intelligence**: Location-based disaster tracking with PostGIS integration
- **Resource Management**: Track and coordinate emergency resources (shelters, hospitals, supplies)
- **AI-Powered Analysis**: Google Gemini AI integration for content analysis and image verification
- **WebSocket Real-time Updates**: Instant notifications and live data synchronization

### Key Components

#### 🚨 Disaster Management
- Create, update, and track disaster events
- Geospatial location tracking with coordinates
- Tag-based categorization system
- Audit trail for all changes
- Real-time status updates

#### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- Active disaster count and trends
- Resource deployment tracking
- Response time analytics
- Recent activity feed

#### 📱 Reporting System
- Citizen disaster reports with image uploads
- Social media integration for broader coverage
- Official government updates
- Image verification using AI
- Report verification workflow

#### 🏥 Resource Coordination
- Emergency shelter management
- Medical facility tracking
- Supply inventory management
- Contact information storage
- Capacity planning

#### 🤖 AI Integration
- **Content Analysis**: Automatic extraction of key information from reports
- **Image Verification**: AI-powered authenticity checking of uploaded images
- **Location Extraction**: Automatic location identification from text descriptions
- **Smart Caching**: Optimized performance with intelligent caching

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive UI design
- **Lucide React**: Beautiful icon library
- **Socket.io Client**: Real-time communication

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **PostGIS**: Geospatial data handling
- **Node.js**: Server-side JavaScript runtime
- **Express**: Web server framework
- **Socket.io**: Real-time WebSocket server

### External Services
- **Google Gemini AI**: Content analysis and image verification
- **Geocoding API**: Location services
- **Social Media APIs**: Twitter/X integration for disaster reports

### Database Schema

```sql
-- Core Tables
disasters: Main disaster events with geospatial data
reports: Citizen and official reports
resources: Emergency resources and facilities
cache: Performance optimization cache
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Gemini API key (optional for demo mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disaster-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google Gemini AI (Optional)
   GEMINI_API_KEY=your_gemini_api_key

   # Geocoding API (Optional)
   GEOCODING_API_KEY=your_geocoding_api_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start Development Servers**
   ```bash
   # Start both Next.js and WebSocket servers
   npm run dev
   
   # Or start individually
   npm run dev:next    # Next.js server on port 3000
   npm run dev:socket  # WebSocket server on port 3001
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - WebSocket Server: http://localhost:3001

## 📖 Usage Guide

### Admin Login
1. Access the application
2. Use any username to login (demo mode)
3. Gain access to full administrative features

### Reporting a Disaster
1. Click "Report Disaster" from the dashboard
2. Fill in disaster details:
   - Title and description
   - Location (automatic geocoding available)
   - Tags for categorization
3. Submit the report

### Managing Resources
1. Navigate to disaster details
2. Add emergency resources:
   - Shelters and medical facilities
   - Supply distribution points
   - Contact information
3. Track capacity and status

### Monitoring Reports
1. View citizen reports in disaster details
2. Verify images using AI analysis
3. Update verification status
4. Coordinate response efforts

## 🔧 API Endpoints

### Disaster Management
- `GET /api/disasters` - List all disasters
- `POST /api/disasters` - Create new disaster
- `GET /api/disasters/[id]` - Get disaster details
- `PUT /api/disasters/[id]` - Update disaster
- `DELETE /api/disasters/[id]` - Delete disaster

### Reports
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]/verify-image` - Verify report image

### Resources
- `GET /api/resources` - List all resources
- `POST /api/resources` - Create new resource
- `GET /api/resources/[id]` - Get resource details

### Cron Jobs
- `/api/cron/cache-cleanup` - Clean expired cache entries
- `/api/cron/official-updates` - Fetch official updates
- `/api/cron/social-media` - Process social media feeds

## 🛠️ Development

### Project Structure
```
project/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── config/           # Configuration files
│   ├── services/         # External service integrations
│   └── utils/            # Utility functions
├── supabase/             # Database migrations
└── socket-server.js      # WebSocket server
```

### Key Technologies

#### Frontend
- **Next.js 14**: Modern React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Socket.io Client**: Real-time updates

#### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Primary database
- **PostGIS**: Geospatial extensions
- **Node.js**: Runtime environment

#### AI & External Services
- **Google Gemini**: Content analysis
- **Geocoding APIs**: Location services
- **Social Media APIs**: Data integration

### Development Commands
```bash
# Development
npm run dev              # Start both servers
npm run dev:next         # Next.js only
npm run dev:socket       # WebSocket only

# Production
npm run build           # Build for production
npm run start           # Start production server

# Utilities
npm run lint            # Run ESLint
```

## 🔒 Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Sanitized user inputs
- **CORS Configuration**: Cross-origin security
- **Environment Variables**: Secure configuration
- **Audit Trails**: Change tracking and logging

## 📊 Performance Optimizations

- **Intelligent Caching**: Redis-like caching system
- **Database Indexing**: Optimized queries with PostGIS
- **Image Optimization**: Sharp library integration
- **Lazy Loading**: Component and data loading
- **WebSocket Efficiency**: Real-time updates without polling

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm run start`
3. Configure reverse proxy for WebSocket server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- **Mobile App**: React Native application
- **Advanced Analytics**: Machine learning insights
- **Multi-language Support**: Internationalization
- **Offline Capability**: Service worker integration
- **Advanced AI**: Predictive disaster modeling
- **Integration APIs**: Third-party emergency services

---

**Built with ❤️ for emergency response and disaster management** 