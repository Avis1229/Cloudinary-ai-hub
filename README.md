# Aethravia Store 🛒✨

![Aethravia Storefront Placeholder](https://via.placeholder.com/1200x400?text=Aethravia+Store)

Aethravia is a premium, full-stack e-commerce platform built with modern web technologies, focusing on cutting-edge security, dynamic personalized user experiences, and high performance.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [daisyUI](https://daisyui.com/), and [Framer Motion](https://www.framer.com/motion/) for micro-animations
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js v5](https://next-auth.js.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Payments:** [Razorpay](https://razorpay.com/)
- **Real-time Engine:** [Socket.io](https://socket.io/)
- **Media & Assets:** [Cloudinary](https://cloudinary.com/)
- **Rate Limiting:** [Upstash Redis](https://upstash.com/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## 💎 Key Features

- **Advanced Security Architecture:** Comprehensive API security wrappers, Upstash rate limiting, NextAuth session strategies, strict CSP policies, and advanced error boundaries.
- **Premium User Experience:** Stunning UI with custom components (like Bento grids, dynamic sliders, and personalized sections) powered by Tailwind CSS and Framer Motion.
- **Real-Time Order Tracking:** Integrated WebSockets ensure users are kept up-to-date with their order status without needing to refresh.
- **Seamless Checkout Flow:** Highly optimized checkout integration with Razorpay, robust cancellation flows, and automated inventory sync.
- **Multi-Channel Notifications:** Extensible notification engine supporting Nodemailer (Email), Twilio/Fast2SMS (SMS), and future WhatsApp integrations.
- **Loyalty & Rewards:** Built-in mechanisms for user coupons, referrals, and loyalty progression.

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/heukcare01/aethravia.git
cd aethravia
```

### 2. Install Dependencies
This project uses modern dependency resolution. Run the following command to install required packages:
```bash
npm install
```

### 3. Environment Variables
A comprehensive `.env` configuration is required to hook up all third-party services.
Duplicate the provided example or copy your keys:
```bash
cp .env.notifications.example .env
```
Ensure you provide at least:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- Cloudinary Keys

*(See the actual `.env` file in the root for a full list of over 50 configurable variables.)*

### 4. Start the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to see your app running!

---

## 📁 Directory Structure

- **`/app`**: Next.js App Router (pages, layouts, error boundaries). Includes `/admin` dashboard and `/(front)` storefront.
- **`/components`**: Reusable React components organized by feature (checkout, home, layout, products, etc.).
- **`/lib`**: Core backend logic. Includes database connections, Mongoose models, security wrappers, external service integrations (Razorpay, Cloudinary), and Websockets.
- **`/public`**: Static assets, brand imagery, and seed files.
- **`/scripts`**: Automation scripts for database seeding, production checks, and DNS debugging.

---

## 🛡️ Security Highlights
- **NoSQL Injection Defense:** Inputs sanitized using `mongo-sanitize`.
- **DDoS Mitigation:** `lib/advanced-rate-limit.ts` pairs with Redis to halt malicious spikes.
- **Bot Protection:** Out-of-the-box support for ReCaptcha, HCaptcha, and Cloudflare Turnstile.
- **Secure Sessions:** NextAuth paired with `AUTH_TRUST_HOST` and encrypted cookies.

---

## 📜 License
This project is proprietary and confidential.

*Maintained by the Aethravia Engineering Team.*
