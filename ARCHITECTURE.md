# Frontend Architecture Documentation

## Multi-Tenant Inventory Management System - Frontend

### Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [State Management](#state-management)
4. [Routing](#routing)
5. [API Integration](#api-integration)
6. [Real-time Updates](#real-time-updates)
7. [Component Architecture](#component-architecture)
8. [Authentication Flow](#authentication-flow)
9. [Responsive Design](#responsive-design)
10. [Performance Optimizations](#performance-optimizations)

---

## Technology Stack

### Core Technologies

- **React 18.2.0**: Modern React with hooks
- **React Router 6.16.0**: Client-side routing
- **Axios 1.5.1**: HTTP client for API calls
- **Socket.io Client 4.6.1**: Real-time updates

### Development Tools

- **React Scripts 5.0.1**: Build tooling
- **ESLint**: Code linting

### Why These Choices?

1. **React**: Industry standard, large ecosystem, excellent performance
2. **React Router**: Declarative routing, easy to use
3. **Axios**: Better error handling than fetch, interceptors support
4. **Socket.io**: Real-time bidirectional communication

---

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          → Reusable UI components
│   │   ├── Layout.js        → Main layout with navigation
│   │   ├── Layout.css
│   │   └── PrivateRoute.js  → Protected route wrapper
│   │
│   ├── pages/               → Page components
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Dashboard.js
│   │   ├── Dashboard.css
│   │   ├── Products.js
│   │   ├── Orders.js
│   │   ├── PurchaseOrders.js
│   │   ├── Suppliers.js
│   │   └── Users.js
│   │
│   ├── context/             → React Context
│   │   └── AuthContext.js   → Authentication state
│   │
│   ├── utils/               → Utility functions
│   │   ├── api.js           → Axios instance & config
│   │   └── socket.js        → Socket.io client
│   │
│   ├── App.js               → Main app component
│   ├── index.js             → Entry point
│   └── index.css            → Global styles
│
└── package.json
```

### Design Principles

1. **Separation of Concerns**: Components, pages, utilities separated
2. **Reusability**: Common components in `/components`
3. **Single Responsibility**: Each component has one clear purpose
4. **DRY Principle**: No code duplication

---

## State Management

### Context API

We use React Context API for global state management instead of Redux for simplicity.

#### AuthContext

Manages authentication state:
- User information
- JWT token
- Login/logout functions
- Loading states

```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Login, logout, register functions
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### Local State

- Component-level state using `useState` hook
- Form data managed locally
- UI state (modals, dropdowns) managed locally

### Why Context API over Redux?

1. **Simplicity**: Less boilerplate, easier to understand
2. **Smaller Bundle**: No additional library
3. **Sufficient**: Current app doesn't need complex state management
4. **Future Ready**: Can migrate to Redux if needed

---

## Routing

### Route Structure

```javascript
/                    → Dashboard (protected)
/login              → Login page (public)
/products           → Products & Variants (protected)
/orders             → Orders (protected)
/purchase-orders     → Purchase Orders (protected)
/suppliers           → Suppliers (protected)
/users               → Users (protected, Owner/Manager only)
```

### Route Protection

- **PrivateRoute**: Wrapper component that checks authentication
- **Role-based Access**: Some routes hidden based on user role
- **Redirect**: Unauthenticated users redirected to `/login`

### Implementation

```javascript
<Route
  path="/"
  element={
    <PrivateRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </PrivateRoute>
  }
/>
```

---

## API Integration

### Axios Configuration

Centralized API client in `utils/api.js`:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Features

1. **Base URL**: Configurable via environment variable
2. **Token Injection**: Automatically adds JWT token to requests
3. **Error Interceptor**: Handles 401 errors (logout on token expiry)
4. **Request/Response Transform**: Consistent data format

### API Call Pattern

```javascript
// GET request
const response = await api.get('/products');
setProducts(response.data.data);

// POST request
await api.post('/orders', orderData);

// PATCH request
await api.patch(`/orders/${orderId}/fulfill`, fulfillmentData);
```

### Error Handling

- Try-catch blocks in all API calls
- User-friendly error messages
- Network error handling
- Validation error display

---

## Real-time Updates

### Socket.io Integration

Real-time stock updates via Socket.io client.

### Implementation

1. **Connection**: Established on login
2. **Authentication**: JWT token sent in handshake
3. **Event Listening**: Listen for `stock-updated` events
4. **State Updates**: Update component state on events

### Example

```javascript
useEffect(() => {
  const handleStockUpdate = (data) => {
    setVariants((prevVariants) =>
      prevVariants.map((v) =>
        v._id === data.variantId 
          ? { ...v, stock: data.variant.stock } 
          : v
      )
    );
  };

  onStockUpdate(handleStockUpdate);
  return () => offStockUpdate(handleStockUpdate);
}, []);
```

### Benefits

- Instant updates across multiple browser tabs
- No need to refresh page
- Better user experience
- Reduced server load (no polling)

---

## Component Architecture

### Component Types

1. **Layout Components**: Layout, Navigation
2. **Page Components**: Dashboard, Products, Orders, etc.
3. **Form Components**: Inline forms within pages
4. **Utility Components**: PrivateRoute

### Component Patterns

#### Functional Components
All components use functional components with hooks (no class components).

#### Hooks Usage
- `useState`: Local state management
- `useEffect`: Side effects (API calls, subscriptions)
- `useContext`: Access global state
- `useNavigate`: Programmatic navigation

### Example Component Structure

```javascript
const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
};
```

---

## Authentication Flow

### Login Flow

1. User enters email/password
2. POST request to `/auth/login`
3. Receive JWT token and user data
4. Store token in localStorage
5. Initialize Socket.io connection
6. Redirect to dashboard

### Logout Flow

1. Clear localStorage
2. Disconnect Socket.io
3. Clear user state
4. Redirect to login

### Token Management

- **Storage**: localStorage (persists across sessions)
- **Injection**: Automatically added to API requests
- **Expiration**: Handled by backend (401 response)
- **Refresh**: Not implemented (can be added)

### Protected Routes

- Check for token in localStorage
- If no token → redirect to login
- If token exists → render protected content

---

## Responsive Design

### CSS Approach

- **Global Styles**: `index.css` for base styles
- **Component Styles**: Separate CSS files per component
- **Utility Classes**: Reusable classes (btn, card, form-group)

### Responsive Breakpoints

- **Desktop**: Default (1200px+)
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### Mobile Considerations

- Navigation collapses on mobile
- Tables scroll horizontally
- Forms stack vertically
- Touch-friendly button sizes

### CSS Features

- Flexbox for layouts
- CSS Grid for complex layouts
- Media queries for responsiveness
- CSS variables (can be added for theming)

---

## Performance Optimizations

### Code Splitting

- React.lazy() for route-based code splitting (can be added)
- Dynamic imports for large components

### Optimization Techniques

1. **useEffect Dependencies**: Proper dependency arrays
2. **Memoization**: React.memo for expensive components (can be added)
3. **Debouncing**: For search inputs (can be added)
4. **Pagination**: Limit data fetching (can be added)

### Bundle Size

- Current: ~200KB (gzipped)
- Optimization: Tree shaking, code splitting
- Future: Lazy loading routes

### Loading States

- Spinner component for loading states
- Skeleton screens (can be added)
- Optimistic UI updates

---

## Security Considerations

### Client-Side Security

1. **Token Storage**: localStorage (consider httpOnly cookies for production)
2. **XSS Protection**: React escapes by default
3. **CSRF**: Not applicable (JWT-based)
4. **Input Validation**: Client-side + server-side validation

### Best Practices

- Never expose sensitive data in client code
- Validate all user inputs
- Sanitize data before display
- Use HTTPS in production

---

## Future Enhancements

### Planned Features

1. **State Management**: Migrate to Redux if complexity increases
2. **Code Splitting**: Route-based lazy loading
3. **Caching**: Service workers for offline support
4. **PWA**: Progressive Web App features
5. **Testing**: Unit tests with Jest, E2E with Cypress
6. **TypeScript**: Type safety (bonus feature)
7. **Storybook**: Component documentation

### Performance Improvements

- Virtual scrolling for large lists
- Infinite scroll pagination
- Image optimization
- CDN for static assets

---

## Conclusion

This frontend architecture provides a clean, maintainable structure for the inventory management system. The use of React hooks, Context API, and modern patterns ensures scalability and developer experience.

The real-time updates via Socket.io enhance user experience, while the responsive design ensures accessibility across devices.

Future enhancements can be added incrementally without major refactoring.
