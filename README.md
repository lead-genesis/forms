# Genesis Flow

**Genesis Flow** is a high-performance, developer-first lead capture engine engineered to bridge the gap between user engagement and actionable technical data delivery. Build, deploy, and scale conversion-optimized multi-step funnels with zero friction.

---

## ⚡ Core Architecture

### 🛡️ Brand Engine
The system operates on an hierarchical identity structure, allowing for complete isolation between different market segments or business units.
- **Identity Isolation**: Maintain separate brand profiles, logos, and banners.
- **Dynamic Subdomain Mapping**: Forms are automatically hosted on brand-specific subdomains (e.g., `survey.yourbrand.io`), instantly boosting consumer trust and brand consistency.

### 🏗️ Funnel Architect
A visual, multi-step form builder designed for maximum conversion. Orchestrate micro-commitments through intuitive, sequential input steps.
- **Diverse Input Modules**:
  - **Welcome Engine**: High-impact entry pages.
  - **Multi-Choice Nodes**: Qualification filters.
  - **Address Capture**: Google Maps integrated location data.
  - **Classic Inputs**: Tailored text capture.
  - **Contact Details**: Centralized PII collection.
  - **Thank You Redirects**: Meaningful closing sequences.
- **Real-time Preview**: Validate your design across **Desktop**, **Tablet**, and **Mobile** viewports instantly.
- **Smart Validation**: Built-in verification for emails, phone numbers, and required fields.

### 🔐 Data Guard (SMS Verification)
Eliminate lead decay and fraud at the source.
- **Two-Factor Validation**: Optionally gate submissions with SMS verification codes.
- **Verification History**: Track `is_sms_verified` status and timestamps for every lead.

### 🔌 Webhook Connectivity
Instantaneous data routing to your entire marketing stack.
- **Payload Delivery**: Push lead data to CRMs, email platforms, or automated dialers the moment a submission completes.
- **Response Tracking**: Capture and monitor webhook status and responses directly in the dashboard.
- **Field Mapping**: Consistent JSON payloads tailored to your external endpoints.

---

## 🚀 Technical Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Heroicons](https://heroicons.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Type Safety**: TypeScript 5+

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account & Project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/genesis-flow.git
   cd genesis-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## 🧭 Project Navigation
- `/dashboard`: Overview of performance, leads, and forms.
- `/builder`: The visual funnel architect.
- `/dashboard/users`: Team management and access control.
- `/form-subdomain/[subdomain]`: Hidden dynamic routing for custom brands.

---

## 📈 Performance & Analytics
Genesis Flow includes a built-in **Performance Tab** for every form, providing real-time insights into unique views, total submissions, and conversion rates, allowing you to optimize your flows with data-driven precision.
