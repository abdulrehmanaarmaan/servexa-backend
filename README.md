src/
├── app.ts
├── server.ts
│
├── config/
│   ├── env.ts
│   └── constants.ts
│
├── lib/
│   ├── prisma.ts
│   └── logger.ts
│
├── middlewares/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validate.middleware.ts
│   ├── error.middleware.ts
│   ├── not-found.middleware.ts
│   └── rate-limit.middleware.ts
│
├── modules/
├──  auth/
│   ├── users/
│   ├── customers/
│   ├── technicians/
│   ├── addresses/
│   ├── services/
│   ├── service-requests/
│   ├── work-orders/
│   ├── assignments/
│   ├── availability/
│   ├── notes/
│   ├── attachments/
│   ├── invoices/
│   ├── payments/
│   ├── notifications/
│   ├── audit-logs/
│   └── admin/
│
├── integrations/
│   ├── google/
│   ├── stripe/        # or bkash
│   ├── email/
│   └── cloudinary/
│
├── utils/
│   ├── jwt.ts
│   ├── password.ts
│   ├── pagination.ts
│   └── response.ts
│
└── jobs/              # optional later

need to fix validate function,
need to check Google AUTH.