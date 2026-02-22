# Lake Effect Life (Monorepo)

This repository is now an npm workspace monorepo with three packages:

- `apps/frontend`: React + Vite single-page app
- `apps/backend`: Express API (local server + Lambda handler)
- `infra/cdk`: AWS CDK infrastructure and deployment

## Monorepo Structure

```text
apps/
  backend/
  frontend/
infra/
  cdk/
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for local Postgres)
- AWS CLI configured (`aws configure`) for cloud deploy

## Install

```bash
npm install
```

## Run Locally

1. Configure backend env:

- Copy `apps/backend/.env.example` to `apps/backend/.env`
- Fill DB + Cognito/S3 values as needed
- For admin inventory management, also set:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_JWT_SECRET`

2. Configure frontend env:

- Copy `apps/frontend/.env.example` to `apps/frontend/.env`
- Set `VITE_API_BASE_URL` (default local API is `http://localhost:3000`)

3. Run everything with one command (database + backend + frontend):

```bash
npm run dev
```

4. Run one-time lookup migration (converts enum-backed fields to lookup-table FKs):

```bash
npm run db:migrate-lookups
```

5. Run inventory model migration (creates inventory stock/reservation/movement tables and backfills current stock):

```bash
npm run db:migrate-inventory-model
```

6. Optional: stop the local database container:

```bash
npm run db:down
```

7. Open admin inventory manager:

- Go to `http://localhost:5173/admin` (or whatever Vite port is printed)
- Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Use the inventory list page with backend-powered search, sorting, and pagination
- Create inventory at `/admin/new`
- Edit inventory via row action (`/admin/:id/edit`)

## Deploy To AWS (CDK)

1. Configure backend env in `infra/cdk/.env.example` (or export environment variables in shell).

2. Bootstrap CDK once per account/region:

```bash
npm run cdk:bootstrap -w @lake-effect-life/infra
```

3. Build frontend (required before deployment so static assets can be uploaded):

```bash
npm run build:frontend
```

4. Deploy:

```bash
npm run cdk:deploy
```

After deploy, CDK outputs:

- CloudFront URL (if enabled)
- S3 site URL (if CloudFront is disabled)
- API URL
- RDS endpoint (if enabled)

## Cost Notes (Important)

- S3: not permanently free, but low cost at small scale.
- CloudFront: has a limited free tier for new AWS accounts, then pay-as-you-go. It is not universally free forever.
- RDS: no always-free option. New accounts can use Free Tier (typically micro instance + limited storage for 12 months). After that, costs apply.

## RDS Strategy (SQL-first)

If you prefer SQL over DynamoDB, start with:

- PostgreSQL RDS `db.t3.micro`
- Single-AZ
- minimal storage (e.g., 20 GB)

In this repo, RDS creation is optional via CDK context so you can avoid cost during early development.

## Useful Commands

```bash
npm run typecheck
npm run lint
npm run dev
npm run db:down
npm run cdk:synth
npm run cdk:deploy
npm run cdk:destroy
```
