# TimeGlow - AI Photo Restoration SaaS

## 🚀 Project Status

TimeGlow is an AI-powered photo restoration SaaS application built with Next.js, Clerk, Supabase, Stripe, and Google Gemini AI.

## ✅ Completed Features

### Frontend
- ✅ Binsoo-inspired minimalist design with cream (#F5F0E8) color scheme
- ✅ Landing page with hero, features, pricing sections
- ✅ Dashboard with upload interface
- ✅ Drag-and-drop file upload component
- ✅ 8 restoration preset selector
- ✅ Before/After comparison slider
- ✅ Processing status indicator with progress
- ✅ Responsive design for all screen sizes

### Backend
- ✅ Image upload API with Supabase Storage
- ✅ Stripe webhook handler for subscriptions
- ✅ Inngest background job processing
- ✅ Database schema with RLS policies
- ✅ User profile and credit system

### Infrastructure
- ✅ GitHub repository: https://github.com/thenickb/timeglow-app
- ✅ Vercel deployment configured
- ✅ Supabase project connected
- ✅ Environment variables structured

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Stripe (Required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google Gemini AI (Required)
GEMINI_API_KEY=AIza...

# Inngest (Required)
INNGEST_APP_ID=timeglow
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Supabase Service Role Key (Required for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Supabase Setup

1. Run the database schema:
```bash
# Execute timeglow_schema.sql in Supabase SQL editor
```

2. Create storage buckets:
```sql
-- Run in Supabase SQL editor
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('original-images', 'original-images', true),
  ('restored-images', 'restored-images', true);
```

### 3. Stripe Setup

1. Create a product in Stripe Dashboard
2. Set up webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Listen to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Inngest Setup

1. Install Inngest CLI:
```bash
npm install -g inngest-cli
```

2. Run Inngest dev server:
```bash
inngest dev
```

3. Your functions will be available at `/api/inngest`

### 5. Google Gemini AI Setup

1. Get API key from Google AI Studio
2. Enable Gemini 2.0 Flash model
3. Add key to environment variables

## 📁 Project Structure

```
app/
├── api/
│   ├── images/
│   │   └── upload/          # Image upload endpoint
│   ├── stripe/
│   │   ├── checkout/        # Checkout session creation
│   │   └── webhook/         # Stripe webhook handler
│   └── inngest/            # Inngest function endpoint
├── dashboard/              # User dashboard
├── components/
│   ├── upload/            # Upload components
│   │   └── DropZone.tsx
│   ├── restoration/       # Restoration components
│   │   ├── PresetSelector.tsx
│   │   ├── BeforeAfterSlider.tsx
│   │   └── ProcessingStatus.tsx
│   └── billing/           # Billing components
├── lib/
│   ├── constants.ts       # App configuration
│   ├── inngest/          # Background job functions
│   └── supabase.ts       # Supabase client
└── types/
    └── database.d.ts     # TypeScript types
```

## 🎨 Design System

- **Primary Color**: Cream (#F5F0E8)
- **Text**: Black (#000000)
- **Accent**: Pure black borders
- **Typography**: Uppercase, tracking-wider
- **Style**: Minimalist, Binsoo-inspired

## 🚀 Deployment

### Vercel Deployment

1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy with:
```bash
vercel --prod
```

### Required Environment Variables in Vercel:

- All variables from `.env`
- Set `NEXT_PUBLIC_APP_URL` to your production domain

## 📝 TODO / Next Steps

1. **Gemini AI Integration**
   - Complete the image processing logic
   - Handle restored image uploads to storage
   - Implement proper error handling

2. **Payment Flow**
   - Add promo code validation
   - Implement subscription management UI
   - Add billing portal integration

3. **User Features**
   - Image history page
   - Download functionality
   - Re-roll implementation
   - 30-day auto-delete

4. **Admin Panel**
   - User management
   - Analytics dashboard
   - Manual credit adjustments

5. **Production Ready**
   - Add Sentry error tracking
   - Implement rate limiting
   - Add comprehensive testing
   - Security audit

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test image upload
# 1. Go to /dashboard
# 2. Upload an image
# 3. Select a preset
# 4. Process restoration

# Test payment flow
# 1. Click "Get Started"
# 2. Complete Stripe checkout
# 3. Verify subscription created
```

## 📧 Support

For issues or questions about the implementation, check:
- Planning document: `TIMEGLOW_PLANNING.md`
- Database schema: `timeglow_schema.sql`
- Environment example: `.env.example`

## 🎉 Launch Checklist

- [ ] Add production Stripe keys
- [ ] Configure custom domain
- [ ] Set up Google Gemini API
- [ ] Test complete user flow
- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Set up customer support email
- [ ] Configure monitoring (Sentry/LogRocket)
- [ ] Launch with LAUNCH50 promo code!