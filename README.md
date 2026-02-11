# Inventory SaaS - Frontend

React-based frontend for multi-tenant inventory management system.

## Features

- Modern React with hooks
- Responsive design
- Real-time stock updates via Socket.io
- Role-based UI access
- Complete CRUD operations
- Dashboard with analytics
- Order management with partial fulfillment
- Purchase order management

## Tech Stack

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Context API** - State management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/    → Reusable components
│   ├── pages/         → Page components
│   ├── context/       → React Context (Auth)
│   ├── utils/         → API & Socket utilities
│   ├── App.js
│   └── index.js
└── package.json
```

## Pages

- **Login** - User authentication
- **Dashboard** - Analytics and overview
- **Products** - Product and variant management
- **Orders** - Order management with partial fulfillment
- **Purchase Orders** - PO management
- **Suppliers** - Supplier management
- **Users** - User management (Owner/Manager only)

## Features Implemented

### Core Features
- [x] User authentication and login
- [x] Dashboard with analytics
- [x] Product and variant management
- [x] Order management
- [x] Purchase order management
- [x] Supplier management
- [x] User management
- [x] Real-time stock updates

### UI Features
- [x] Responsive design
- [x] Role-based navigation
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Real-time updates

## Test Credentials

After backend seeding, use these credentials:

### Tenant 1: Acme Corporation
- **Owner:** `owner1@acme.com` / `password123`
- **Manager:** `manager1@acme.com` / `password123`
- **Staff:** `staff1@acme.com` / `password123`

### Tenant 2: Tech Solutions Inc
- **Owner:** `owner2@techsolutions.com` / `password123`
- **Manager:** `manager2@techsolutions.com` / `password123`

## Assumptions

1. **Backend Running**: Assumes backend API is running on port 5000
2. **Modern Browser**: Requires modern browser with ES6+ support
3. **JavaScript Enabled**: Requires JavaScript enabled
4. **Network Access**: Requires network access to backend API

## Known Limitations

1. **No Pagination**: Large lists load all data (can add pagination)
2. **No Search**: Basic filtering only (can add full-text search)
3. **No Offline Support**: Requires network connection
4. **No Caching**: Data fetched on every page load
5. **No TypeScript**: JavaScript only (can add TypeScript)
6. **No Tests**: Unit tests not implemented

## Performance Considerations

- Code splitting can be added for better performance
- Lazy loading for routes
- Memoization for expensive components
- Virtual scrolling for large lists

## Development

### Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests (not configured)
- `npm run eject` - Eject from Create React App (not recommended)

### Environment Variables

See `.env.example` for required environment variables.

## Production Deployment

1. Build the application: `npm run build`
2. Serve the `build` folder using a static file server
3. Configure environment variables
4. Set up HTTPS
5. Configure CORS on backend
6. Use CDN for static assets

## Time Breakdown

- **Frontend Setup**: 1 hour
- **Components & Pages**: 3 hours
- **API Integration**: 2 hours
- **Real-time Updates**: 1 hour
- **Styling & Responsive**: 2 hours
- **Testing & Debugging**: 1 hour

**Total**: ~10 hours

## License

ISC

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for production use**
