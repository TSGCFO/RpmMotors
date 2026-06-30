# Threat Model

## Project Overview

RPM Auto is a full-stack TypeScript dealership application with a public customer-facing website and a back-office employee/admin portal. The production stack is React + Vite on the client, Express on the server, and PostgreSQL via Drizzle ORM. The highest-risk production areas are the employee/admin API paths, authentication flow, inquiry handling, and public file upload/static file serving.

Production assumptions for this scan:
- Only production-reachable code is in scope.
- `NODE_ENV=production` in deployed environments.
- Replit mockup/sandbox-only code and agent helper directories are out of scope unless production reachability is shown.
- TLS is handled by the platform, so transport encryption is assumed at the edge.

## Assets

- **Employee and admin capabilities** — inventory management, inquiry handling, sales record access, blog publishing, and email retry operations. Compromise lets an attacker alter dealership data or operate privileged workflows.
- **Customer and lead PII** — inquiry names, email addresses, phone numbers, message contents, and vehicle interest data. Disclosure would expose customer contact details and communications.
- **Garage register / sales records** — buyer names, addresses, VINs, plate numbers, and odometer data. These records are sensitive business and personal data.
- **User credentials** — usernames, passwords, and any future session state. Credential compromise enables employee or admin impersonation.
- **Uploaded media and same-origin static content** — dealership images and any files placed under the public `/uploads` tree. Abuse could enable malicious content hosting under the dealership origin.
- **Application secrets and external integrations** — database credentials and SendGrid credentials. Exposure would enable data theft or email abuse.

## Trust Boundaries

- **Browser to API** — all `/api/*` requests cross from an untrusted client to trusted server code. Every privileged action must authenticate and authorize server-side.
- **Public site to employee/admin functionality** — public browsing is intentionally open, but inventory mutation, inquiry management, sales records, uploads, and content management must be restricted to authorized staff.
- **Server to PostgreSQL** — the Express app can read and modify all dealership data. Broken access control at the API layer directly exposes or changes database records.
- **Multipart upload boundary** — uploaded files enter the system from untrusted users and are later served back from `/uploads`. Validation must treat both metadata and file contents as attacker-controlled.
- **Server to SendGrid** — inquiry data crosses to a third-party email provider. Failure handling and logging must avoid exposing sensitive data.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`, `server/upload.ts`, `client/src/App.tsx`
- **Highest-risk code areas:** employee/admin layouts in `client/src/components/employee/` and `client/src/components/admin/`; privileged API handlers in `server/routes.ts`; credential/bootstrap logic in `server/storage.ts`; upload and static serving in `server/upload.ts` and `server/storage-adapter.ts`
- **Public surfaces:** vehicle browsing/search, contact/inquiry submission, blog reads, testimonials reads, `/uploads/*`
- **Authenticated/admin surfaces that must be enforced server-side:** vehicle create/update/delete, status changes, inquiry listing and management, garage register access, blog creation, upload endpoints
- **Usually dev-only/out of scope:** `.agents/`, `.local/skills/`, mockup helper scripts, and development-only tooling unless directly imported by production entry points

## Threat Categories

### Spoofing

This project exposes employee and admin features to ordinary web users, so identity checks must be real server-side controls rather than browser-side flags. All privileged API endpoints must require a valid authenticated identity, and any employee/admin role claim must be derived from trusted server state instead of values stored in `sessionStorage`, `localStorage`, or request bodies.

### Tampering

Attackers must not be able to create, edit, delete, or mark vehicles sold unless the server independently verifies permission. Blog creation, inquiry-management actions, and any sales record creation must also be enforced server-side. Uploaded files must be validated by content and safe extension rules before they are stored and later served.

### Information Disclosure

Customer inquiries and garage register records contain sensitive personal data. Public or weakly protected endpoints must not expose these records, and operational logs must not include raw customer contact details or message bodies unless there is a narrowly controlled business need and protected retention path.

### Denial of Service

Public endpoints that accept uploads or trigger resource-intensive work must be bounded. Upload routes must enforce authentication, strict size/count/type limits, and safe storage practices so they cannot be abused for storage exhaustion or malicious content hosting.

### Elevation of Privilege

The central risk in this application is privilege escalation from anonymous/public users into employee or admin capabilities. The server must enforce role-based access control on every privileged route, eliminate hardcoded/default credentials, and avoid trusting client-side route guards as security controls.