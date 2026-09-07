# Servexa Backend

Servexa is a **Field Service Management (FSM)** backend API designed to manage service requests, work orders, technician assignments, scheduling, invoices, payments, notifications, and administrative operations.

The backend is built as a RESTful API using TypeScript, Node.js, Express.js, PostgreSQL, and Prisma ORM.

## Project Information

- **Project Name:** Servexa
- **Category:** Field Service Management (FSM)
- **Backend Repository:** https://github.com/abdulrehmanaarmaan/servexa-backend
- **Live API:** https://servexa-backend.vercel.app
- **API Documentation:** https://0kumfhmdsy.apidog.io

## Tech Stack

### Backend
- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod

### Authentication & Security
- Email/Password Authentication
- Google Social Login
- Bearer Token Authentication
- Role-Based Access Control (RBAC)
- Password Hashing
- Helmet
- CORS
- API Rate Limiting with `express-rate-limit`

### Payment
- bKash Payment Gateway

### Deployment
- Vercel

## User Roles

Servexa implements three distinct roles:

### Customer

Customers can:

- Manage their profile
- Manage addresses
- Create service requests
- View their service requests
- Cancel eligible service requests
- View their work orders
- View invoices
- Make payments
- View notifications

### Technician

Technicians can:

- Manage their profile
- View assigned work orders
- Manage availability
- Update work order status
- Manage work order notes
- View assignments

### Admin

Administrators can:

- Manage users
- Manage user account status
- Manage user roles
- Manage technicians
- Manage services
- Manage service requests
- Manage work orders
- Manage invoices
- View payments
- View audit logs
- Access dashboard information
- Create system notifications

## Core Workflow

```text
Customer
   ↓
Service Request
   ↓
Work Order
   ↓
Technician Assignment
   ↓
Scheduling / Visit
   ↓
Work Order Completion
   ↓
Invoice
   ↓
Payment
```

## Main Features

- Customer management
- Customer address management
- Service management
- Service request management
- Service request cancellation
- Work order management
- Technician management
- Technician assignment
- Technician availability management
- Work order scheduling
- Work order status tracking
- Job status history
- Work order notes
- Invoice management
- bKash payment integration
- Payment status tracking
- Notification management
- Audit logging
- Administrative dashboard
- Pagination
- Filtering
- Sorting
- Server-side request validation
- Soft delete support
- Database transactions

## Database

Servexa uses **PostgreSQL** with **Prisma ORM**.

The database contains relationships between users, customers, technicians, addresses, services, service requests, work orders, assignments, availability records, invoices, payments, notifications, notes, and audit logs.

The database uses:

- Foreign key relationships
- Unique constraints
- Database indexes
- Prisma migrations
- Decimal types for monetary values
- Transactions for important multi-step operations
- Seed data for the demo administrator account

## API

All API endpoints are versioned under:

```text
/api/v1
```

The API follows a consistent JSON response structure.

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Something went wrong",
  "errors": []
}
```

## API Documentation

Interactive API documentation is available through Apidog:

https://0kumfhmdsy.apidog.io

The documentation covers the project's important API endpoints, request information, authentication requirements, validation, and response examples.

## Authentication & Authorization

Servexa supports:

- Email/password authentication
- Google social login
- Protected routes
- Role-Based Access Control (RBAC)
- Object-level authorization

The application uses three roles:

```text
CUSTOMER
TECHNICIAN
ADMIN
```

Public registration creates customer accounts. Privileged roles are managed through administrative functionality.

## Security

The backend implements security measures including:

- Password hashing
- Bearer authentication
- Protected private routes
- Role-Based Access Control (RBAC)
- Object-level authorization
- Server-side Zod validation
- API rate limiting using `express-rate-limit`
- Helmet security headers
- CORS configuration
- Environment variables for secrets and configuration

## Payment

Servexa integrates the **bKash payment gateway** for real payment processing.

The payment workflow is:

```text
Invoice
   ↓
Payment Creation
   ↓
bKash Checkout
   ↓
Payment Callback
   ↓
Payment Verification
   ↓
Payment Status Update
   ↓
Invoice Status Update
```

Payment records maintain the payment amount, provider, status, transaction information, and relevant gateway information.

## Seed Data

The project includes Prisma seed data containing a demo administrator account for evaluation and testing.

### Demo Admin Credentials

```text
Email    : admin@servexa.com
Password : Admin@123456
```

These credentials are provided specifically for project evaluation.

## API Security & Implementation Note

The project includes Prisma seed data with a demo ADMIN account for evaluation and testing.

API rate limiting has been implemented using `express-rate-limit` as part of the application's security and API-abuse protection measures.

Other implemented security measures include:

- Helmet
- CORS configuration
- Password hashing
- Bearer authentication
- Role-based access control

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/abdulrehmanaarmaan/servexa-backend.git
cd servexa-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file and provide the required environment variables for the database, authentication, application configuration, and payment gateway.

Do not commit the `.env` file or any secret credentials to the repository.

### 4. Run Database Migrations

```bash
pnpm prisma migrate dev
```

### 5. Generate Prisma Client

```bash
pnpm prisma generate
```

### 6. Run Seed Data

```bash
pnpm seed
```

### 7. Start the Development Server

Use the development script defined in `package.json`.

## Deployment

The live backend API is deployed on Vercel:

https://servexa-backend.vercel.app

## Demo Video

### API Walkthrough

1. https://drive.google.com/file/d/1VHM78_ZEhlamZJt82uGDMKSPksyxxYHJ/view?usp=sharing

2. https://drive.google.com/file/d/1K8zENSCxYD5EVkiEabHnelqLMJkQoOvo/view?usp=sharing

## Repository

Source code:

https://github.com/abdulrehmanaarmaan/servexa-backend

## API Documentation

Interactive API Documentation:

https://0kumfhmdsy.apidog.io
