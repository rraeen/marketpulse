Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/marketpulse
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

Create a `.env.local` file in the root directory (copy from `.env.example` if it exists):

```env
# Required: MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/marketpulse
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/marketpulse

# Required in production, optional in development (has fallback)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Email Configuration (for notifications)
# If not set, emails will be logged to console in development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MarketPulse" <no-reply@marketpulse.com>
```

**Important:**

- The `.env.local` file must be in the `marketpulse/` directory (root of the Next.js app)
- Restart the dev server after creating or modifying `.env.local`
- Never commit `.env.local` to version control (it's in `.gitignore`)
  Create a `.env` file in the root directory:
  ```envCreate a `.env.local`file in the root directory (copy from`.env.example` if it exists):

```env
# Required: MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/marketpulse
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/marketpulse

# Required in production, optional in development (has fallback)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Email Configuration (for notifications)
# If not set, emails will be logged to console in development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MarketPulse" <no-reply@marketpulse.com>
```

**Important:**

- The `.env.local` file must be in the `marketpulse/` directory (root of the Next.js app)
- Restart the dev server after creating or modifying `.env.local`
- Never commit `.env.local` to version control (it's in `.gitignore`)
