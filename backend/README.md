# Nathan Backend – Comprehensive Candy E‑commerce API (Express & Prisma)

Nathan Backend powers a modern candy e‑commerce platform with secure authentication, rich product modeling (including flavors and bundles), carts, orders, inventory checks, and an administrative surface for operations. Built on Express 5 and Prisma/PostgreSQL, the API emphasizes correctness, security, maintainability, and production readiness.

---

## Table of Contents

- Overview & Vision
- Core Domains & Features
- Architecture & Technology Stack
- Project Structure
- Environment & Configuration
- Local Development
- Database & Migrations
- API Reference (High‑level)
- Authentication & Cookies
- File Uploads & Static Assets
- Admin & Operations
- Observability & Logging
- Security Best Practices
- Performance & Scalability
- Deployment Guide
- Reverse Proxy & Networking
- Troubleshooting & FAQ
- Roadmap: Affiliate System
- Roadmap: Mobile Applications
- Contributing
- License

---

## Overview & Vision

The backend is designed to:

- Provide a robust, secure, and extensible foundation for an online candy store
- Model real business requirements: product flavors, 3‑pack recipes, inventory availability
- Support administrative workflows: product CRUD, order lifecycle, inventory management
- Scale operationally with migrations, logging, and sensible defaults
- Handle high-volume traffic with automated order verification and fraud detection

---

## Core Domains & Features

### User Management:

- **Registration & Authentication**: Secure user registration with email verification
- **Password Reset**: 6-digit code-based password reset system
- **Role-based Access**: User and admin role separation
- **Session Management**: JWT-based authentication with HTTP-only cookies

### Product Management:

- **Product CRUD**: Complete product lifecycle management
- **Flavor Integration**: Product-flavor relationships via `ProductFlavor` joins
- **Category Management**: Dynamic category creation and management
- **Image Upload**: Secure file upload with validation and storage
- **SKU Generation**: Automatic SKU generation for products
- **Bulk Operations**: Mass product updates and batch processing

### Order Management:

- **Order Creation**: From cart or direct payload with inventory validation
- **Order Tracking**: Complete order lifecycle with status updates
- **Payment Integration**: Stripe payment processing with webhook handling
- **Retry Payments**: Failed payment retry functionality
- **Bulk Operations**: Mass order status updates and batch processing

### 3-Pack System:

- **Pack Recipes**: Predefined 3-pack combinations
- **Custom Packs**: User-created 3-pack combinations
- **Inventory Integration**: Real-time availability checks
- **SKU Generation**: Automatic SKU generation for packs

### Inventory Management:

- **Real-time Tracking**: Live inventory updates with stock decrements
- **Low Stock Alerts**: Automated alerts for inventory management
- **Bulk Updates**: Mass inventory adjustments with validation
- **Safety Stock**: Configurable safety stock levels

### Analytics & Monitoring:

- **Real-time Metrics**: Live order tracking and revenue monitoring
- **Risk Analytics**: Automated fraud detection and risk scoring
- **Performance Metrics**: Conversion rates, AOV, and traffic analysis
- **Automated Verification**: AI-powered order verification system

---

## Architecture & Technology Stack

- **Runtime**: Node.js with Express 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Email**: Nodemailer (Gmail or Ethereal fallback)
- **File Uploads**: Multer with size/type validation
- **Payments**: Stripe integration with webhook handling
- **Logging**: Custom logger utility with structured logging
- **Build**: TypeScript compilation with SWC

---

## Project Structure

```
src/
  controller/               # business logic per domain
    - adminController.ts    # admin operations (products, flavors, inventory)
    - analyticsController.ts # analytics and monitoring
    - orderController.ts    # order management and verification
    - orderVerificationService.ts # automated order verification
    - threePackCartController.ts # 3-pack cart operations
  middlewares/              # auth/admin/upload middlewares
    - auth.middleware.ts    # authentication middleware
    - admin.middleware.ts   # admin role verification
    - upload.middleware.ts  # file upload handling
  routes/                   # express routers by domain
    - admin.routes.ts       # admin endpoints
    - analytics.routes.ts   # analytics endpoints
    - auth.routes.ts        # authentication endpoints
    - order.routes.ts       # order management endpoints
    - payments.routes.ts    # payment processing endpoints
  services/                 # business logic services
    - orderVerificationService.ts # automated order verification
  utils/                    # utilities (jwt, mailer, logger)
    - jwt.ts               # JWT token management
    - mailer.ts            # email sending utilities
    - logger.ts            # logging utilities
  server.ts                 # app initialization and configuration
prisma/
  schema.prisma             # database schema definition
  migrations/               # migration history
uploads/                    # local file storage (images)
  flavors/                  # flavor images
  products/                 # product images
```

---

## Environment & Configuration

### Required Environment Variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Authentication
JWT_SECRET=your_long_random_jwt_secret_key
CLIENT_URL=https://app.example.com

# Email Configuration
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Upload
MAX_FILE_SIZE=20971520  # 20MB in bytes
```

### Configuration Notes:

- **Database**: Neon/managed Postgres typically requires `?sslmode=require`
- **Email**: If credentials are missing, system falls back to Ethereal in development
- **Stripe**: Webhook secret is required for payment verification
- **File Upload**: Configurable file size limits and type validation

---

## Local Development

### Prerequisites:

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Setup:

```bash
# Install dependencies
npm ci

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Development Features:

- **Hot Reload**: Automatic server restart on file changes
- **Database Studio**: Prisma Studio for database management
- **Type Checking**: Real-time TypeScript validation
- **Error Handling**: Detailed error messages and stack traces

---

## Database & Migrations

### Schema Overview:

```prisma
// Core entities
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  // ... other fields
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  category    String
  imageUrl    String?
  isActive    Boolean  @default(true)
  // ... other fields
}

model Order {
  id            String        @id @default(cuid())
  userId        String
  total         Float
  status        OrderStatus   @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)
  // ... other fields
}

model Flavor {
  id        String   @id @default(cuid())
  name      String   @unique
  aliases   String[]
  active    Boolean  @default(true)
  imageUrl  String?
  // ... other fields
}
```

### Migration Commands:

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

---

## API Reference

### Authentication Endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset with code
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Product Endpoints:

- `GET /products` - Public product catalog
- `GET /products/:id` - Product details
- `GET /products/categories` - Available categories
- `GET /products/admin/all` - Admin product list (paginated)
- `POST /products/admin/products` - Create product
- `PUT /products/admin/:id` - Update product
- `DELETE /products/admin/:id` - Delete product

### Order Endpoints:

- `POST /orders` - Create order
- `GET /orders` - User orders (paginated)
- `GET /orders/:id` - Order details
- `PUT /orders/:id/status` - Update order status
- `GET /orders/admin/all` - Admin order list (paginated)
- `PUT /orders/admin/bulk-update` - Bulk order updates

### Payment Endpoints:

- `POST /payments/create-checkout-session` - Create Stripe checkout
- `POST /payments/retry-payment` - Retry failed payment
- `POST /payments/webhook` - Stripe webhook handler

### Admin Endpoints:

- `GET /admin/flavors` - Flavor management
- `POST /admin/flavors` - Create flavor
- `PUT /admin/flavors/:id` - Update flavor
- `DELETE /admin/flavors/:id` - Delete flavor
- `PUT /admin/flavors/bulk-update-images` - Bulk image updates
- `POST /admin/flavors/cleanup-images` - Cleanup orphaned images
- `GET /admin/inventory/alerts` - Low stock alerts
- `PUT /admin/inventory/:flavorId` - Update inventory
- `GET /admin/config` - System configuration

### Analytics Endpoints:

- `GET /analytics/dashboard` - Real-time analytics dashboard

### 3-Pack Endpoints:

- `GET /3pack/product` - 3-pack variants
- `GET /3pack/inventory/availability` - Availability checks
- `POST /3pack/cart/add` - Add to 3-pack cart
- `GET /3pack/cart` - Get 3-pack cart
- `PUT /3pack/cart/:id` - Update 3-pack cart item
- `DELETE /3pack/cart/:id` - Remove from 3-pack cart
- `DELETE /3pack/cart` - Clear 3-pack cart

---

## Authentication & Cookies

### JWT Implementation:

- **Token Storage**: HTTP-only cookies for security
- **Token Expiry**: Configurable expiration times
- **Refresh Logic**: Automatic token refresh mechanism
- **Role-based Access**: User and admin role separation

### Security Features:

- **Secure Cookies**: `secure: true`, `sameSite: lax` in production
- **CORS Protection**: Strict origin validation
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive input sanitization

---

## File Uploads & Static Assets

### Upload Configuration:

- **Multer Integration**: File upload handling with validation
- **File Types**: Image files only (JPEG, PNG, WebP)
- **Size Limits**: Configurable file size limits (default: 20MB)
- **Storage**: Local filesystem with organized directory structure

### File Organization:

```
uploads/
  flavors/          # Flavor images
  products/         # Product images
  temp/            # Temporary uploads
```

### Security Measures:

- **MIME Type Validation**: Strict file type checking
- **File Size Limits**: Prevent large file uploads
- **Directory Traversal Protection**: Secure file paths
- **Virus Scanning**: Integration points for antivirus scanning

---

## Admin & Operations

### Product Management:

- **CRUD Operations**: Complete product lifecycle management
- **Image Management**: Upload, update, and delete product images
- **Flavor Integration**: Product-flavor relationship management
- **Bulk Operations**: Mass product updates and batch processing
- **Search & Filter**: Advanced filtering and search capabilities

### Inventory Management:

- **Real-time Tracking**: Live inventory updates
- **Low Stock Alerts**: Automated alert system
- **Bulk Updates**: Mass inventory adjustments
- **Safety Stock**: Configurable safety stock levels

### Order Management:

- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe payment processing
- **Status Updates**: Order status management
- **Bulk Operations**: Mass order updates

### Analytics & Monitoring:

- **Real-time Metrics**: Live performance monitoring
- **Risk Assessment**: Automated fraud detection
- **Performance Analytics**: Conversion and revenue tracking
- **Automated Verification**: AI-powered order verification

---

## Observability & Logging

### Logging System:

- **Structured Logging**: JSON-formatted log entries
- **Log Levels**: Debug, info, warn, error levels
- **Request Tracking**: Unique request IDs for tracing
- **Error Tracking**: Comprehensive error logging

### Monitoring Integration:

- **Health Checks**: Endpoint health monitoring
- **Performance Metrics**: Response time tracking
- **Error Rates**: Error rate monitoring
- **Resource Usage**: Memory and CPU monitoring

### Recommended Integrations:

- **Sentry**: Error tracking and performance monitoring
- **PM2**: Process management and monitoring
- **Log Aggregation**: ELK stack or similar for log analysis

---

## Security Best Practices

### Implementation:

- **JWT Security**: Strong secrets with regular rotation
- **CORS Configuration**: Strict origin validation
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Output encoding and sanitization

### File Upload Security:

- **MIME Type Validation**: Strict file type checking
- **File Size Limits**: Prevent large file uploads
- **Virus Scanning**: Integration points for antivirus
- **Directory Traversal Protection**: Secure file paths

### API Security:

- **Rate Limiting**: Protection against abuse
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **HTTPS Enforcement**: Required for production

---

## Performance & Scalability

### Database Optimization:

- **Indexing**: Strategic database indices for performance
- **Query Optimization**: Efficient Prisma queries
- **Connection Pooling**: Database connection management
- **Caching**: Redis integration for hot data

### API Performance:

- **Pagination**: Server-side pagination for large datasets
- **Compression**: Gzip compression for responses
- **Caching**: Response caching for static data
- **Load Balancing**: Horizontal scaling support

### Scalability Features:

- **Stateless Design**: Horizontal scaling capability
- **Microservices Ready**: Modular architecture
- **Queue Integration**: Background job processing
- **CDN Integration**: Global content delivery

---

## Deployment Guide

### Production Setup:

```bash
# Install dependencies
npm ci

# Build application
npm run build

# Run database migrations
npx prisma migrate deploy

# Start with PM2
pm2 start dist/src/server.js --name nathan-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### Environment Configuration:

- **Production Environment**: Set `NODE_ENV=production`
- **Database**: Use production PostgreSQL instance
- **Secrets**: Use strong, unique secrets for production
- **HTTPS**: Enable HTTPS for secure cookie transmission

### Reverse Proxy (Nginx):

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /path/to/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Reverse Proxy & Networking

### Configuration:

- **TLS Termination**: SSL/TLS handling at proxy level
- **HTTP/2 Support**: Modern protocol support
- **Compression**: Gzip/Brotli compression
- **Static Assets**: Direct serving of uploads

### Best Practices:

- **Same-origin Cookies**: Proxy API under `/api` path
- **CORS Headers**: Proper CORS configuration
- **Security Headers**: Security header implementation
- **Rate Limiting**: API rate limiting at proxy level

---

## Recent Updates & New Features

### Version 2.0 Features (Latest):

- **Stripe Payment Integration**: Complete payment processing with webhooks
- **Automated Order Verification**: AI-powered fraud detection and risk scoring
- **Advanced Analytics**: Real-time metrics and performance monitoring
- **Bulk Operations**: Mass updates for products, orders, and inventory
- **Image Management**: Advanced image upload with deduplication and cleanup
- **Enhanced Admin Dashboard**: Improved product and order management
- **Retry Payment System**: Failed payment retry functionality
- **Webhook Handling**: Secure Stripe webhook processing
- **Performance Optimizations**: Improved query performance and caching
- **Security Enhancements**: Enhanced authentication and authorization

### Technical Improvements:

- **TypeScript Strict Mode**: Enhanced type safety
- **Code Refactoring**: Reduced cognitive complexity
- **Error Handling**: Comprehensive error boundaries and recovery
- **Database Optimization**: Improved query performance
- **Build Optimization**: SWC integration for faster builds
- **Image Deduplication**: Automatic cleanup of orphaned images
- **Cache Busting**: Improved image caching strategies

---

## Troubleshooting & FAQ

### Common Issues:

#### Database Connection:

- **P1001 Error**: Verify `DATABASE_URL`, credentials, and SSL mode
- **Migration Failures**: Check database permissions and connection
- **Connection Timeouts**: Verify network connectivity and firewall settings

#### Authentication:

- **JWT Errors**: Verify `JWT_SECRET` is set and consistent
- **Cookie Issues**: Check CORS configuration and HTTPS settings
- **Session Expiry**: Verify token expiration settings

#### File Uploads:

- **Upload Failures**: Check file size limits and MIME type validation
- **Image Processing**: Verify Multer configuration and file permissions
- **Storage Issues**: Check disk space and directory permissions

#### Payment Processing:

- **Stripe Errors**: Verify API keys and webhook configuration
- **Webhook Failures**: Check webhook secret and endpoint configuration
- **Payment Failures**: Verify Stripe account status and limits

### Debug Steps:

1. Check application logs for errors
2. Verify environment variables
3. Test database connectivity
4. Check file permissions
5. Verify external service configurations

---

## Roadmap: Affiliate System

- **Entities**: Affiliate, Referral, Commission, Payout models
- **Features**: Referral links (UTM), commission ledger, payout cycles
- **API**: Endpoints for affiliate registration, link generation, reporting
- **Dashboard**: Affiliate management interface

---

## Roadmap: Mobile Applications

- **React Native**: Mobile app using same auth and API
- **Deep Linking**: Product, cart, and order detail links
- **Push Notifications**: Order updates and promotional notifications
- **Offline Support**: Cached data for offline functionality

---

## Contributing

- Use feature branches and descriptive commit messages
- Prefer small PRs with focused scope
- Include tests for new functionality
- Follow TypeScript strict mode guidelines
- Ensure security best practices

## License

- Proprietary / All rights reserved (update if open‑sourcing)
