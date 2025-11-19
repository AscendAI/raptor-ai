# PDF Generation - Production Setup (Vercel)

## 🚀 Overview

The PDF generation feature uses Puppeteer to create high-quality PDFs. This implementation works seamlessly in both local development and production (Vercel) environments.

## 📦 Dependencies

- **`puppeteer-core`**: Lightweight Puppeteer without bundled Chromium (works in serverless)
- **`@sparticuz/chromium`**: Optimized Chromium binary for AWS Lambda/Vercel serverless functions

## 🔧 Key Configuration

### 1. **API Route** (`src/app/api/generate-pdf/route.ts`)

```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel function timeout (60s max for Pro plan)
```

### 2. **Environment Detection**

The code automatically detects whether it's running in production or development:

```typescript
const isProduction = process.env.NODE_ENV === 'production';
```

- **Production (Vercel)**: Uses `@sparticuz/chromium` with optimized args
- **Development**: Uses local Chrome/Chromium installation

### 3. **Next.js Configuration** (`next.config.ts`)

Excludes `@sparticuz/chromium` from webpack bundling:

```typescript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = [...(config.externals || []), '@sparticuz/chromium'];
  }
  return config;
};
```

## ⚙️ Vercel Settings

### Function Timeout

- **Hobby Plan**: 10 seconds max
- **Pro Plan**: 60 seconds max (set via `maxDuration`)

If PDF generation takes longer, consider:

1. Upgrading to Pro plan
2. Optimizing HTML/CSS complexity
3. Reducing image sizes

### Memory Limit

- Default: 1024 MB (sufficient for most PDFs)
- Can be increased in Vercel project settings if needed

## 🧪 Testing Production Locally

Test the production build locally before deploying:

```bash
# Build for production
pnpm build

# Run production server
pnpm start
```

Then test PDF generation to ensure it works with the production configuration.

## 📝 Environment Variables

No additional environment variables required for PDF generation. The code automatically detects the environment.

## 🔍 Troubleshooting

### Issue: "Function execution timeout"

**Solution**:

- Reduce HTML complexity
- Optimize images in the template
- Upgrade to Vercel Pro for 60s timeout

### Issue: "Cannot find Chrome executable"

**Solution**:

- In production, this is handled automatically by `@sparticuz/chromium`
- In development, ensure Chrome/Chromium is installed on your machine

### Issue: "Memory limit exceeded"

**Solution**:

- Increase Vercel function memory limit in project settings
- Optimize template to reduce memory usage

## 📊 Performance Tips

1. **Optimize Template HTML**
   - Minimize inline styles
   - Reduce image sizes
   - Avoid complex CSS animations

2. **Reduce Rendering Time**
   - Use simpler layouts
   - Avoid loading external resources
   - Keep tables and grids reasonably sized

3. **Monitor Function Logs**
   - Check Vercel function logs for timing insights
   - Look for bottlenecks in rendering

## ✅ Verification Checklist

Before deploying to production:

- [ ] `puppeteer-core` and `@sparticuz/chromium` installed
- [ ] `next.config.ts` has webpack configuration
- [ ] API route has `maxDuration` set appropriately
- [ ] Local production build works (`pnpm build && pnpm start`)
- [ ] PDF generates successfully in development
- [ ] No console errors in browser or server logs

## 🔗 Resources

- [@sparticuz/chromium](https://github.com/Sparticuz/chromium) - Optimized Chromium for serverless
- [Puppeteer API](https://pptr.dev/) - Puppeteer documentation
- [Vercel Function Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration) - Function timeout limits
