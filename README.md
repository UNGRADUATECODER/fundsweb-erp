# FundsWeb ERP – Full Stack Case Study

## Overview

FundsWeb ERP is a full-stack ERP workflow application built using the PERN stack:

* PostgreSQL
* Express.js
* React.js
* Node.js
* Prisma ORM
* JWT Authentication
* bcrypt password hashing

The application implements the complete business workflow:

**Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch**

The main focus is backend business logic, relational data integrity, authentication, authorization, quotation calculation, and transaction-safe inventory management.

---

## Features

### Authentication & Authorization

* User registration and login
* Password hashing using bcrypt
* JWT-based authentication
* ADMIN and SALES_USER roles
* Protected API routes
* Backend role-based authorization

### Customer & Enquiry Management

* Create customers
* Create customer enquiries
* Add products and quantities to enquiries
* View enquiries

### Quotation Management

* Create quotations from enquiries
* Product-based pricing
* GST calculation
* Discount calculation
* Backend-authoritative quotation totals
* Accept quotations
* View quotations

### Sales Orders

* Convert only ACCEPTED quotations into sales orders
* Prevent duplicate sales orders for the same quotation
* Automatically reserve inventory
* Transaction-safe inventory reservation
* Prevent reservation beyond available inventory

### Dispatch

* Dispatch sales orders
* Reduce physical inventory
* Release reserved inventory
* Update sales order status
* Prevent duplicate dispatch

---

## Business Workflow

```text
Customer
   |
   v
Customer Enquiry
   |
   v
Quotation
   |
   | ACCEPTED
   v
Sales Order
   |
   v
Inventory Reservation
   |
   v
Dispatch
   |
   v
Physical Inventory Updated
```

---

## Technology Stack

| Layer             | Technology           |
| ----------------- | -------------------- |
| Frontend          | React                |
| Backend           | Node.js + Express.js |
| Database          | PostgreSQL           |
| ORM               | Prisma               |
| Authentication    | JWT                  |
| Password Security | bcrypt               |
| Testing           | Jest + Supertest     |

---

## Database Design

## ER Diagram

![FundsWeb ERP ER Diagram](docs/er-diagram.png)

Main entities:

* User
* Customer
* CustomerEnquiry
* EnquiryItem
* Product
* Quotation
* QuotationItem
* SalesOrder
* SalesOrderItem
* Dispatch

Important relationships:

```text
Customer 1 ──── * CustomerEnquiry
CustomerEnquiry 1 ──── * EnquiryItem
Product 1 ──── * EnquiryItem

CustomerEnquiry 1 ──── * Quotation
Quotation 1 ──── * QuotationItem
Product 1 ──── * QuotationItem

Quotation 1 ──── 0..1 SalesOrder
SalesOrder 1 ──── * SalesOrderItem
Product 1 ──── * SalesOrderItem

SalesOrder 1 ──── * Dispatch

User 1 ──── * Quotation
User 1 ──── * SalesOrder
```

---

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Customers

```text
POST /api/customers
GET  /api/customers
```

### Enquiries

```text
POST /api/enquiries
GET  /api/enquiries
```

### Products

```text
POST /api/products
GET  /api/products
```

### Quotations

```text
POST  /api/quotations
GET   /api/quotations
PATCH /api/quotations/:id/status
```

### Sales Orders

```text
POST /api/sales-orders
GET  /api/sales-orders
```

### Dispatch

```text
POST /api/dispatches
GET  /api/dispatches
```

### System

```text
GET /api/health
GET /api/db-test
GET /api/protected
```

---

## Authentication

Protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

JWT contains the authenticated user's ID and role.

Backend authorization is implemented using middleware.

---

## Quotation Calculation

Quotation calculation is performed on the backend using product pricing and GST information stored in the database.

For each item:

```text
Line Subtotal = Unit Price × Quantity

GST = Line Subtotal × GST %

Taxable Amount = Subtotal − Discount

Total = Taxable Amount + GST
```

The client does not control the final quotation total.

---

## Inventory Reservation

Inventory uses:

```text
physicalQty
reservedQty
```

Available inventory is:

```text
Available = physicalQty − reservedQty
```

When a sales order is created, inventory is reserved inside a PostgreSQL transaction.

The reservation update checks available inventory atomically before increasing `reservedQty`.

This prevents over-reservation when inventory is insufficient.

---

## Sales Order Rules

A sales order can only be created when:

1. The quotation exists.
2. The quotation status is `ACCEPTED`.
3. A sales order does not already exist for that quotation.
4. Sufficient inventory is available.

The database also enforces the one-order-per-quotation rule using a unique constraint on `quotationId`.

---

## Dispatch Rules

During dispatch:

```text
physicalQty = physicalQty − dispatched quantity

reservedQty = reservedQty − dispatched quantity
```

The sales order status is changed to:

```text
DISPATCHED
```

The complete operation is performed inside a database transaction.

---

## Automated Testing

The project includes Jest and Supertest tests.

Run:

```bash
npm test
```

Current test result:

```text
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

The five required tests cover:

1. Quotation calculation
2. Invalid quotation conversion prevention
3. Duplicate sales order prevention
4. Over-reservation prevention
5. Unauthorized operation prevention

---

## Local Setup

### Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fundsweb_erp?schema=public"
JWT_SECRET="your_jwt_secret"
```

Run Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

Start development server:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Run Tests

From the backend directory:

```bash
npm test
```

---

## Project Structure

```text
fundsweb-erp/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── lib/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   │   └── erp.test.js
│   │
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── vite.config.js
```

---

## Key Design Decisions

### Backend-authoritative calculations

Quotation totals are calculated using product information from PostgreSQL rather than trusting client-provided totals.

### Transaction-safe inventory

Sales order creation and inventory reservation happen within a database transaction.

Dispatch inventory updates are also performed transactionally.

### Database constraints

Unique and foreign-key constraints are used to protect relational integrity.

### RBAC

Authorization is enforced at the backend API layer rather than relying only on frontend controls.

### Password security

Passwords are stored as bcrypt hashes and never stored as plain text.

---

## Testing Evidence

All five required automated tests pass successfully.

```text
PASS tests/erp.test.js

Tests:       5 passed, 5 total
Test Suites: 1 passed, 1 total
```

---

## Conclusion

FundsWeb ERP demonstrates a complete enquiry-to-dispatch ERP workflow using the PERN stack, with emphasis on relational database design, backend business rules, authentication, authorization, quotation calculations, and transaction-safe inventory reservation.
