# Inventory Management System - React Frontend

A modern React + TypeScript + Tailwind CSS frontend for the Discord NFC Webhook inventory management system.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Tailwind CSS** for beautiful, responsive styling
- **Vite** for fast development and building
- **Type-safe** with TypeScript interfaces
- **Responsive design** that works on all devices
- **Hover effects** and smooth animations
- **Real-time status updates**

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm
- **Backend**: Node.js API (runs on port 3000)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 URLs

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api/scan?item=ItemName

## 🔧 Development

The frontend communicates with the backend API through a proxy configuration in `vite.config.ts`. All `/api/*` requests are automatically forwarded to `http://localhost:3000`.

## 📱 Usage

1. **View Inventory**: Browse items organized by supplier
2. **Test Scanner**: Use the test input to simulate NFC scans
3. **Scan Items**: Click "Scan" buttons to trigger low stock alerts
4. **Real-time Feedback**: See immediate confirmation of actions

## 🎨 Styling

- **Gradient Backgrounds**: Beautiful blue-to-purple gradients
- **Card-based Layout**: Clean, modern card design
- **Hover Effects**: Interactive elements with smooth transitions
- **Responsive Grid**: Adapts to different screen sizes
- **Custom Animations**: Pulse effects and smooth transitions

## 📁 Project Structure

```
frontend/
├── src/
│   ├── types/          # TypeScript interfaces
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Tailwind CSS imports
├── public/             # Static assets
├── tailwind.config.js  # Tailwind configuration
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

## 🚀 Deployment

This frontend can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

The build output is in the `dist/` folder after running `npm run build`.
