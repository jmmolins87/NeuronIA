# Brevo Email Integration Guide

Complete guide for setting up and testing transactional emails with Brevo (formerly Sendinblue).

---

## 📋 Required Environment Variables

Add these to your `.env` file:

```bash
# Email Provider
EMAIL_ENABLED="true"                  # Set to "false" to disable email sending
EMAIL_PROVIDER="brevo"                # Currently only "brevo" is supported

# Brevo API
BREVO_API_KEY="xkeysib-your-api-key-here"  # Get from Brevo dashboard

# Sender Configuration
EMAIL_FROM="ClinvetIA <info@clinvetia.com>"  # Your sender name and email

# Optional: DryRun mode (logs but doesn't send in non-production)
EMAIL_DRY_RUN="true"                  # Set to "false" to actually send emails in dev

# Application URL (required for links in emails)
APP_URL="https://clinvetia.com"       # Your production URL (or localhost in dev)

# Token Expiry
CANCEL_TOKEN_EXPIRY_DAYS="30"        # Default: 30 days
RESCHEDULE_TOKEN_EXPIRY_DAYS="30"    # Default: 30 days
```

---

## 🔐 Getting Your Brevo API Key

1. Sign up at [Brevo](https://www.brevo.com/) (free tier available)
2. Go to **Settings > SMTP & API**
3. Click **Create a new API key**
4. Give it a name (e.g., "ClinvetIA Production")
5. Copy the key (starts with `xkeysib-`)
6. Add it to your `.env` as `BREVO_API_KEY`

---

## ✅ Email Flow Overview

### 1. **Booking Confirmation Email**
Sent when a booking is confirmed (status changes to `CONFIRMED`).

**Contains:**
- Booking details (date, time, timezone)
- Contact information
- ROI data (if provided)
- Cancel button/link
- Reschedule button/link
- Download .ics calendar file

**Triggered by:**
- `POST /api/bookings/confirm` endpoint

### 2. **Cancellation Email**
Sent when a booking is cancelled.

**Contains:**
- Cancellation confirmation
- Original booking details
- "Book again" link

**Triggered by:**
- `POST /api/bookings/cancel` endpoint

### 3. **Reschedule Email**
Sent when a booking is rescheduled.

**Contains:**
- New booking details
- Comparison with old time (if available)
- Cancel/reschedule links for new booking
- Download .ics with new time

**Triggered by:**
- `POST /api/bookings/reschedule` endpoint

---

## 🧪 Testing Emails

### Method 1: CLI Script (Recommended)

```bash
# Install dependencies
npm install

# Send test email
npm run test:email -- your@email.com

# With custom subject
npm run test:email -- your@email.com "My Test Email"

# Or directly with tsx
npx tsx scripts/test-email.ts your@email.com
```

### Method 2: API Endpoint (Development Only)

```bash
# POST to debug endpoint (only works in dev mode)
curl -X POST http://localhost:3000/api/debug/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","subject":"Test Email"}'

# Should return:
# {
#   "ok": true,
#   "message": "Test email sent successfully",
#   "messageId": "...",
#   "to": "your@email.com",
#   "subject": "Test Email"
# }
```

### Method 3: Postman Collection

Import this request into Postman:

**POST** `http://localhost:3000/api/debug/send-test-email`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "to": "your@email.com",
  "subject": "Test Email from Postman"
}
```

---

## 🔍 Debugging Email Issues

### Check Logs

All email operations log with the `[EMAIL]` prefix. Look for:

```bash
# Successful send
[EMAIL] 2026-02-09T... [INFO] Sending email via Brevo {"to":"user@example.com","subject":"...","attempt":1}
[EMAIL] 2026-02-09T... [INFO] Email sent successfully {"to":"user@example.com","messageId":"...","attempt":1}

# Failed send
[EMAIL] 2026-02-09T... [ERROR] Brevo API error {"to":"user@example.com","status":401,"attempt":1,"error":"Invalid API key"}

# Skipped (EMAIL_ENABLED=false)
[EMAIL] 2026-02-09T... [INFO] Email sending skipped (EMAIL_ENABLED=false) {"to":"user@example.com"}

# Configuration error
[EMAIL] 2026-02-09T... [ERROR] BREVO_API_KEY not configured {"to":"user@example.com"}
```

### Common Issues & Solutions

#### 1. **"BREVO_API_KEY not configured"**
- **Cause**: `BREVO_API_KEY` env var is missing or empty
- **Solution**: Add it to `.env` and restart server

#### 2. **"EMAIL_FROM not configured"**
- **Cause**: `EMAIL_FROM` env var is missing
- **Solution**: Add `EMAIL_FROM="Your Name <email@domain.com>"` to `.env`

#### 3. **"Invalid API key" (401)**
- **Cause**: Wrong or expired API key
- **Solution**: Generate a new API key in Brevo dashboard

#### 4. **"Sender email not verified" (400)**
- **Cause**: The email in `EMAIL_FROM` is not verified in Brevo
- **Solution**: Go to Brevo > Senders > Add/verify your sender email

#### 5. **"Daily sending limit exceeded" (402)**
- **Cause**: Free tier limit reached (300 emails/day)
- **Solution**: Upgrade your Brevo plan or wait 24 hours

#### 6. **Network timeout**
- **Cause**: Slow network or Brevo API issues
- **Solution**: The client retries 3 times automatically. Check Brevo status page.

#### 7. **Emails not arriving**
- **Cause**: Spam filters, wrong email, or deliverability issues
- **Solution**:
  - Check spam folder
  - Verify email address is correct
  - Check Brevo dashboard > Email > Statistics for delivery status
  - Add SPF/DKIM records to your domain (in Brevo docs)

---

## 📊 Monitoring in Brevo Dashboard

1. Go to **Transactional > Email**
2. See real-time delivery status
3. Check bounce rates, opens, clicks
4. View individual email logs

---

## 🚀 Production Deployment Checklist

- [ ] Set `EMAIL_ENABLED="true"`
- [ ] Add production `BREVO_API_KEY`
- [ ] Set `EMAIL_FROM` with your verified sender
- [ ] Set `APP_URL` to your production domain (https://...)
- [ ] Set `EMAIL_DRY_RUN="false"` (or remove it)
- [ ] Verify sender email in Brevo dashboard
- [ ] Add SPF/DKIM records to your domain (optional but recommended)
- [ ] Test with `npm run test:email` before deploying
- [ ] Monitor logs for `[EMAIL]` prefix after deployment
- [ ] Check Brevo dashboard for delivery stats

---

## 🔒 Security Best Practices

1. **Never commit** `.env` file with real API keys
2. Use **environment variables** in Vercel/hosting platform
3. **Rotate API keys** periodically (every 90 days)
4. **Limit API key** permissions in Brevo (only "Send transactional emails")
5. **Monitor usage** in Brevo dashboard to detect anomalies

---

## 💡 Advanced Configuration

### Custom Reply-To Email

The system automatically sets reply-to for booking emails if you configure:

```bash
INBOUND_EMAIL_DOMAIN="reply.clinvetia.com"
```

This will set reply-to as: `booking+{bookingId}@reply.clinvetia.com`

### Email Retry Logic

The Brevo client automatically retries failed requests:
- **3 attempts** for network errors or 5xx responses
- **Exponential backoff**: 1s, 2s, 3s between retries
- **No retry** for 4xx errors (bad request, invalid key, etc.)

### Timeout Configuration

Default timeout is 12 seconds. You can override per-call:

```ts
await sendTransacEmail({
  // ...
  timeoutMs: 30000, // 30 seconds
})
```

---

## 🐛 Troubleshooting

### Enable Debug Mode

Set env var:
```bash
DEBUG="email:*"
```

### Test Email Locally Without Sending

Set:
```bash
EMAIL_DRY_RUN="true"
```

Emails will be logged but not sent.

### Verify Configuration

```bash
# Check if Brevo API key is loaded
npm run dev
# Look for "[EMAIL]" logs in console

# Or check in Node REPL
node
> require('dotenv').config()
> process.env.BREVO_API_KEY
> process.env.EMAIL_FROM
```

---

## 📞 Support

- **Brevo Docs**: https://developers.brevo.com/docs
- **Brevo Support**: support@brevo.com
- **Brevo Status**: https://status.brevo.com/

---

## 🔗 Related Files

- `lib/email/brevo.ts` - Brevo API client
- `lib/email/sendConfirmation.ts` - Confirmation email sender
- `lib/email/sendCancelled.ts` - Cancellation email sender
- `lib/email/sendRescheduled.ts` - Reschedule email sender
- `lib/email/templates/` - HTML/text email templates
- `scripts/test-email.ts` - CLI test script
- `app/api/debug/send-test-email/route.ts` - Debug endpoint
