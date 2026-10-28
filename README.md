This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Database

CodeTrack uses Supabase PostgreSQL only; authentication stays in this app. Copy `.env.example` to `.env`, set the Supabase pooled `DATABASE_URL` and direct `DIRECT_URL`, then run `npm run db:migrate` and `npm run bootstrap:admin` once. For local development, `docker compose up -d` starts PostgreSQL.

The supplied dataset is imported as a public catalogue, never as user-owned study data: `npm run import:leetcode -- "C:\\Lett code Data Set\\leetcode_problems.json"`. Dataset descriptions, solutions, and instruction text are intentionally excluded.

## Deploy to Render

Push this repository to GitHub, then create a Render Blueprint from `render.yaml`. Enter `DATABASE_URL` and `DIRECT_URL` from Supabase when prompted; never commit them. The Blueprint uses Node 20–22, runs `npm ci && npm run render:build`, starts with `npm start`, and checks `/api/health`.

Run `npx prisma migrate deploy` once from a Render Shell or set it as the service pre-deploy command on a paid Render plan. Then run `npm run bootstrap:admin` once with `INITIAL_ADMIN_USER_ID` and `INITIAL_ADMIN_PASSWORD` temporarily set in Render. Remove those two bootstrap variables after the first admin exists.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
