# Nathan Frontend – Comprehensive Next.js Candy E‑commerce Storefront & Administrative Platform

Welcome to the Nathan Frontend repository, the official codebase for a modern, enterprise‑grade candy e‑commerce platform. This application delivers a polished, mobile‑first shopping experience and a powerful administrative dashboard that enables efficient store operations at scale. Built on Next.js (App Router), Zustand state management, and a utility‑first CSS approach, the platform emphasizes performance, security, maintainability, and long‑term extensibility.

---

## Table of Contents

- Overview & Vision
- Core Features
- Architecture & Technology Stack
- Project Structure
- Data & API Integration
- Authentication & Authorization
- Admin Dashboard (Back‑Office)
- State Management (Zustand)
- Styling, UX, and Accessibility
- Environment & Configuration
- Local Development
- Production Build & Deployment
- Reverse Proxy & API Proxying
- Images, Assets, and Uploads
- Observability & Error Handling
- Security Best Practices
- Performance Optimizations
- SEO & Marketing
- Internationalization & Localization (Roadmap)
- Affiliate System (Roadmap)
- Mobile Application (Roadmap)
- Testing Strategy (Roadmap)
- Troubleshooting & FAQ
- Contributing Guidelines
- License

---

## Overview & Vision

Nathan Frontend provides:

- A user‑centric, conversion‑focused storefront that showcases candy products, including flavor compositions and curated "3‑pack" bundles.
- A robust admin area for product management (with images and flavors), stock visibility, and efficient order oversight.
- A foundation for future growth including a full affiliate program and companion mobile apps.

Business vision:

- Enable rapid product iteration and launches (e.g., seasonal flavors, bundles).
- Provide an exceptional mobile experience to meet modern shopping behavior.
- Offer clean integrations with third‑party services (payments, analytics, communications).

---

## Core Features

### User‑facing Features:

- **Product Catalog**: Comprehensive product browsing with flavor metadata and stock indicators
- **Product Detail Pages**: Rich content with images, descriptions, and interactive elements
- **Custom Pack Builder**: Interactive 3-pack creation tool allowing users to select exactly 3 flavors
- **Wishlist & Cart**: Persistent state with backend synchronization
- **Order Management**: Complete order history with payment status tracking
- **Stripe Payment Integration**: Secure checkout with success/failure handling and retry functionality
- **Responsive Design**: Mobile-first approach with seamless desktop experience

### Admin Dashboard Features:

- **Product Management**: Full CRUD operations with server‑side pagination and image upload
- **Flavor Management**: Complete flavor lifecycle with image uploads and bulk operations
- **Inventory Management**: Real-time stock tracking with low-stock alerts and bulk updates
- **Order Management**: Advanced filtering, sorting, search, and bulk operations
- **Analytics Dashboard**: Real-time metrics for high-volume traffic monitoring
- **Automated Order Verification**: AI-powered risk scoring and fraud detection
- **Category Management**: Dynamic category creation and management
- **System Configuration**: Centralized system settings and configuration

### Platform Features:

- **Authentication**: Secure cookie-based auth with middleware protection
- **Accessibility**: WCAG-compliant components with proper ARIA attributes
- **Performance**: Optimized images, lazy loading, and efficient state management
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

---

## Architecture & Technology Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript with strict type checking
- **State Management**: Zustand for cart, orders, wishlist, and user state
- **Styling**: Tailwind CSS with utility-first approach
- **Authentication**: HTTP-only cookie flow with middleware enforcement
- **Payments**: Stripe integration with webhook handling
- **Images**: Next.js Image component with optimized remote patterns

---

## Project Structure

```
app/
  (root)/              # main storefront routes (home, shop, products, profile, cart)
  auth/                # login, register, forgot password, reset password
  dashboard/           # administrative pages (orders, products, analytics)
components/
  custom/              # shared custom UI elements
  shared/              # shared layout/header/footer
  ui/                  # specialized UI components (FlavorCard, CustomPackBuilder)
constant/              # global constants and utilities
hooks/                 # custom hooks (useUser, useAuth)
public/                # static assets (favicon, icons, images)
store/                 # Zustand stores (cart, orders, wishlist, user)
styles/                # global styles and Tailwind configuration
```

---

## Data & API Integration

- **Primary API**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Proxy Routes**: Next.js rewrites for seamless API integration
- **Pagination**: Server-side pagination for scalable data handling
- **Image Handling**: Optimized image serving with cache busting
- **Real-time Updates**: WebSocket-ready architecture for live data

### API Endpoints Integration:

- **Products**: `/products/*` - Product catalog and management
- **Orders**: `/orders/*` - Order creation, tracking, and management
- **Payments**: `/payments/*` - Stripe integration and webhook handling
- **Admin**: `/admin/*` - Administrative operations
- **Analytics**: `/analytics/*` - Real-time metrics and reporting

---

## Authentication & Authorization

- **Cookie-based Auth**: Secure HTTP-only cookies for session management
- **Middleware Protection**: Automatic route protection and redirection
- **Role-based Access**: User and admin role separation
- **Session Management**: Automatic token refresh and session persistence

### Security Features:

- **HTTPS Enforcement**: Required for production deployments
- **CORS Configuration**: Strict origin validation
- **Input Validation**: Client-side validation with server-side verification
- **XSS Protection**: Sanitized inputs and secure rendering

---

## Admin Dashboard (Back‑Office)

### Product Management:

- **CRUD Operations**: Create, read, update, delete products with validation
- **Image Upload**: Drag-and-drop image upload with preview and validation
- **Flavor Integration**: Product-flavor relationship management
- **Bulk Operations**: Mass updates and batch processing
- **Search & Filter**: Advanced filtering by category, status, and custom criteria

### Inventory Management:

- **Real-time Stock**: Live inventory tracking with automatic updates
- **Low Stock Alerts**: Automated alerts for inventory management
- **Bulk Updates**: Mass inventory adjustments with validation
- **Stock History**: Track inventory changes over time

### Order Management:

- **Advanced Filtering**: Filter by status, payment status, date range, and amount
- **Bulk Operations**: Mass status updates and batch processing
- **Search Functionality**: Full-text search across orders
- **Export Capabilities**: Data export for external analysis

### Analytics Dashboard:

- **Real-time Metrics**: Live order tracking and revenue monitoring
- **Risk Analytics**: Automated fraud detection and risk scoring
- **Performance Metrics**: Conversion rates, AOV, and traffic analysis
- **Hourly Reports**: Time-based performance analysis

---

## State Management (Zustand)

### Store Architecture:

- **cartStore.ts**: Persistent cart with backend synchronization
- **ordersStore.ts**: Order management with status tracking
- **wishlistStore.ts**: Lightweight wishlist with persistence
- **userStore.ts**: User authentication and profile management

### Features:

- **Persistence**: Automatic state persistence across sessions
- **Optimistic Updates**: Immediate UI updates with rollback capability
- **Error Handling**: Comprehensive error states and recovery
- **Type Safety**: Full TypeScript integration with type-safe operations

---

## Styling, UX, and Accessibility

### Design System:

- **Mobile-first**: Responsive design optimized for mobile devices
- **Consistent Spacing**: Standardized spacing and typography scales
- **Color Semantics**: Meaningful color usage for status and actions
- **Interactive States**: Clear hover, focus, and active states

### Accessibility Features:

- **ARIA Attributes**: Proper labeling and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and proper structure
- **Focus Management**: Logical focus flow and visible indicators

---

## Environment & Configuration

### Required Environment Variables:

```env
# Backend API configuration
NEXT_PUBLIC_API_URL=https://api.example.com

# Optional configurations
NEXT_PUBLIC_POST_AUTH_REDIRECT_URL=/
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Configuration Notes:

- Use full origin (scheme + host, no trailing slash)
- Development: `http://localhost:4000`
- Production: `https://api.licorice4good.com`

---

## Local Development

### Prerequisites:

- Node.js 18+
- npm or yarn package manager

### Setup:

```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Development Features:

- **Hot Reload**: Instant updates during development
- **Type Checking**: Real-time TypeScript validation
- **Error Overlay**: Detailed error information in browser
- **Performance Monitoring**: Built-in performance metrics

---

## Production Build & Deployment

### Build Process:

```bash
# Clean install
npm ci

# Production build
npm run build

# Start production server
npm run start
```

### Deployment Considerations:

- **Reverse Proxy**: Use Nginx or similar for TLS and compression
- **Environment Variables**: Ensure all required variables are set
- **Static Assets**: Configure CDN for optimal performance
- **Monitoring**: Set up error tracking and performance monitoring

---

## Reverse Proxy & API Proxying

### Proxy Configuration:

- **Automatic Rewrites**: Configured based on `NEXT_PUBLIC_API_URL`
- **Route Mapping**: `/auth/*`, `/api/products*`, `/cart*`, `/orders*`, `/uploads/*`
- **Cookie Handling**: Same-origin cookies for security

### Best Practices:

- Prefer same-origin API (`/api`) to simplify cookie handling
- Use HTTPS in production for secure cookie transmission
- Configure proper CORS headers for cross-origin requests

---

## Images, Assets, and Uploads

### Image Handling:

- **Next.js Image**: Optimized image loading with lazy loading
- **Remote Patterns**: Configured for backend image serving
- **Cache Busting**: Automatic cache invalidation for updated images
- **Responsive Images**: Multiple sizes for different screen densities

### Asset Management:

- **Static Assets**: Served from `public/` directory
- **Favicon**: Configured in `app/layout.tsx`
- **Icons**: SVG icons with proper accessibility attributes

---

## Observability & Error Handling

### Error Management:

- **Error Boundaries**: React error boundaries for graceful failures
- **User-friendly Messages**: Clear error messages for users
- **Logging**: Comprehensive error logging for debugging
- **Recovery**: Automatic retry mechanisms for failed operations

### Monitoring Recommendations:

- **Error Tracking**: Integrate Sentry or similar service
- **Performance Monitoring**: Use Vercel Analytics or similar
- **User Analytics**: Implement privacy-compliant analytics

---

## Security Best Practices

### Implementation:

- **HTTPS Enforcement**: Required for production deployments
- **Secure Cookies**: HTTP-only, secure, same-site cookies
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized inputs and secure rendering

### Headers Configuration:

- **Content Security Policy**: Prevent XSS attacks
- **X-Frame-Options**: Prevent clickjacking
- **HSTS**: HTTP Strict Transport Security

---

## Performance Optimizations

### Frontend Optimizations:

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image with WebP support
- **Lazy Loading**: Components and images loaded on demand
- **Caching**: Aggressive caching strategies for static assets

### Backend Optimizations:

- **Server-side Pagination**: Efficient data loading
- **Database Indexing**: Optimized queries with proper indices
- **CDN Integration**: Global content delivery
- **Compression**: Gzip/Brotli compression for assets

---

## SEO & Marketing

### SEO Features:

- **Metadata**: Dynamic meta tags for products and pages
- **Structured Data**: JSON-LD for rich snippets
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine crawling instructions

### Marketing Integration:

- **Analytics**: Google Analytics integration ready
- **Social Sharing**: Open Graph and Twitter Card support
- **Email Marketing**: Integration points for email campaigns

---

## Recent Updates & New Features

### Version 2.0 Features (Latest):

- **Custom Pack Builder**: Interactive 3-pack creation tool
- **Stripe Payment Integration**: Complete payment processing with webhooks
- **Advanced Admin Dashboard**: Enhanced product and order management
- **Real-time Analytics**: Live metrics and performance monitoring
- **Automated Order Verification**: AI-powered fraud detection
- **Bulk Operations**: Mass updates for products, orders, and inventory
- **Image Management**: Advanced image upload and management system
- **Enhanced Error Handling**: Comprehensive error boundaries and recovery
- **Performance Optimizations**: Improved loading times and user experience
- **Accessibility Improvements**: WCAG 2.1 AA compliance

### Technical Improvements:

- **TypeScript Strict Mode**: Enhanced type safety
- **Code Refactoring**: Reduced cognitive complexity
- **Component Optimization**: Better performance and maintainability
- **State Management**: Improved Zustand store architecture
- **Build Optimization**: SWC integration for faster builds

---

## Internationalization & Localization (Roadmap)

- i18n scaffolding for multi‑language storefront
- Currency/locale formatting
- RTL language support

---

## Affiliate System (Roadmap)

- Affiliate login and dashboards
- Link generator, campaign attribution, and commission reporting
- Exportable statements and payout tracking

---

## Mobile Application (Roadmap)

- React Native application sharing the same auth and API
- Deep linking into product, cart, and orders
- Push notifications for order updates and promotions

---

## Testing Strategy (Roadmap)

- Component unit tests (Jest/RTL)
- API contract tests for critical endpoints
- E2E flows (Playwright) for login, add to cart, and checkout

---

## Troubleshooting & FAQ

### Common Issues:

- **"Destination undefined" on build**: Ensure `NEXT_PUBLIC_API_URL` is set
- **Auth flicker on auth pages**: Middleware enforces server‑side redirect
- **Product images not loading**: Check backend static `/uploads` mapping and Next Image remote patterns
- **Payment failures**: Verify Stripe webhook configuration and environment variables
- **Build errors**: Clear `.swc` cache and rebuild

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables
3. Check network requests in DevTools
4. Clear browser cache and cookies
5. Restart development server

---

## Contributing Guidelines

- Use feature branches and meaningful commit messages
- Keep components small and accessible; colocate tests near code
- Submit PRs with screenshots for UI changes
- Follow TypeScript strict mode guidelines
- Ensure accessibility compliance

## License

- Proprietary / All rights reserved (update if open‑sourcing)
