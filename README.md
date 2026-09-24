This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

## النشر على Cloudflare Pages (Deploy on Cloudflare Pages)

تم إعداد المشروع بالكامل ليعمل بسلاسة فائقة وبأعلى سرعة على **Cloudflare Pages** عبر التصدير الثابت (`Static HTML Export`):

### الطريقة الأولى: عبر لوحة تحكم Cloudflare (مستحسن مع GitHub)
1. ادخل إلى حسابك في [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. انتقل إلى **Workers & Pages** ثم اضغط **Create application** > **Pages** > **Connect to Git**.
3. اختر مستودع المشروع (`deltahamid249/smart-services`).
4. في إعدادات البناء (**Build settings**):
   - **Framework preset**: `Next.js (Static HTML Export)` أو اختر `None`
   - **Build command**: `npm run build` أو `npx next build`
   - **Build output directory**: `out`
5. اضغط **Save and Deploy**.

---

### الطريقة الثانية: النشر المباشر عبر السطر البرمجي (Wrangler CLI)
يمكنك النشر مباشرة من جهازك أو بيئة العمل بتنفيذ الأمر:
```bash
npm run pages:deploy
```
أو:
```bash
npx wrangler pages deploy out --project-name=smart-services
```
عند التشغيل لأول مرة سيطلب منك تسجيل الدخول لحساب Cloudflare لربط المشروع ونشره فوراً.
