# CMF Global Centre Platform

The official web platform and administrative backend for CMF Global Centre, connecting members worldwide through exclusive events, memberships, and community resources.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4, Next-Intl (i18n Multi-language support)
- **Backend**: Strapi v5 (Headless CMS), SQLite/MySQL
- **Payment Gateway**: HitPay API Integration (Sandbox & Production)
- **Process Management**: PM2
- **Deployment Infrastructure**: Hostinger VPS + Nginx Reverse Proxy + SSL

## 📁 Project Structure

This monorepo contains two primary directories:

- `/cmf-frontend`: The Next.js web application facing the public and authenticated members.
- `/cmf-backend`: The Strapi administrative panel and API serving the frontend.

## 🛠 Features

- **Multi-language Support**: English & Mandarin localization fully integrated across all pages and payment flows.
- **Membership Wallets**: Dynamic generation of member IDs, tracking of active/expired awards, and automated renewal payments.
- **Event Ticketing**: Members can browse exclusive events and generate secure, direct checkout links.
- **HitPay Integration**: Custom-built Strapi webhook listener and hitpay service file for real-time payment confirmation and automated provisioning.
- **Legacy Member Migration**: Includes custom NodeJS scripts for importing thousands of legacy users from CSV files into the new Strapi v5 ecosystem.

## 🌐 Local Development

To run the project locally, you will need two separate terminal windows.

### 1. Start the Backend (Strapi)
```bash
cd cmf-backend
npm install
npm run develop
```
The Strapi admin panel will be available at `http://localhost:1339/admin`.

### 2. Start the Frontend (Next.js)
```bash
cd cmf-frontend
npm install
npm run dev
```
The web app will be available at `http://localhost:3003`.

## 📦 Deployment to VPS (Production)

The application is deployed on an Ubuntu VPS running Node v20.

1. **Pull Latest Code**: `git pull origin main`
2. **Build Backend**: 
   ```bash
   cd cmf-backend && npm run build
   ```
3. **Build Frontend**: 
   ```bash
   cd cmf-frontend && npm run build
   ```
4. **Restart Processes**:
   ```bash
   pm2 restart cmf-backend
   pm2 restart cmf-frontend
   ```

*Note: The frontend is configured to run on Port 3003 via PM2, which is then proxied by Nginx to the primary domain.*

## 🔒 Environment Variables

Ensure both `.env` files are correctly configured on the production server. The frontend requires `NEXT_PUBLIC_STRAPI_URL` to point to the live domain, while the backend requires valid `APP_KEYS` and `HITPAY_ENDPOINT` configurations.
