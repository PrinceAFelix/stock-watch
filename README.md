# Discord NFC Webhook

A Vercel-ready project that handles NFC tag scans and sends messages to Discord via webhook.

## Project Structure

- **`/api/scan.js`** - Serverless function for handling NFC scans
- **`/frontend/`** - React + Vite frontend application
- **`vercel.json`** - Vercel deployment configuration

## Features

- 📱 NFC tag scanning interface
- 🔄 Bulk scan mode for multiple items
- 📊 Supplier-based inventory organization
- 🚨 Discord webhook integration for alerts
- ⚡ Modern React + Vite frontend
- ☁️ Serverless deployment on Vercel

## Development

```bash
# Install dependencies
npm install
cd frontend && npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

The project is configured for automatic deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Set environment variables** for Discord webhook URL
3. **Deploy automatically** on push to main branch

### Environment Variables

- `DISCORD_WEBHOOK_URL` - Your Discord webhook URL

## API Endpoints

- `GET /api/scan?item=<item_name>` - Single item scan
- `POST /api/scan/bulk` - Bulk item scan

## Frontend

Built with:
- React 18 + TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Responsive design for mobile/desktop

