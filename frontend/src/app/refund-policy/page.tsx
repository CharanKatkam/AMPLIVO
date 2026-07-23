import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BackButton } from '@/components/ui/BackButton';

export default function RefundPolicyPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 pb-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-slate">
          <div className="not-prose mb-8">
            <BackButton label="Back to Home" />
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif" }}>Refund & Cancellation Policy</h1>
          <p className="text-sm text-slate-500">Last updated: July 2024</p>
          
          <h2>1. General Policy</h2>
          <p>At Amplivo, we strive to deliver high-quality digital marketing services. Due to the nature of our work, which involves dedicated time, strategic planning, and immediate allocation of resources (such as ad spend), our refund policies are strict but fair.</p>
          
          <h2>2. Retainer Services</h2>
          <p>For monthly retainer services (SEO, Social Media Management, Ads Management):</p>
          <ul>
            <li>Clients must provide a 30-day written notice prior to cancellation.</li>
            <li>Payments made for the current billing cycle are non-refundable once work has commenced.</li>
          </ul>

          <h2>3. Project-Based Work</h2>
          <p>For one-off projects (Website Development, Brand Identity):</p>
          <ul>
            <li>Initial deposits (usually 50%) are non-refundable as they secure our team&apos;s time.</li>
            <li>If a project is cancelled midway, the client will be billed for the pro-rated amount of work completed up to that point.</li>
          </ul>

          <h2>4. Ad Spend</h2>
          <p>Any funds paid directly to platforms like Google Ads, Meta Ads, or LinkedIn are strictly non-refundable by Amplivo. Refunds for ad spend must be requested directly from the respective platforms according to their individual policies.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
