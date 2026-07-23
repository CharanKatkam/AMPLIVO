import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BackButton } from '@/components/ui/BackButton';

export default function TermsOfServicePage() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 pb-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-slate">
          <div className="not-prose mb-8">
            <BackButton label="Back to Home" />
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif" }}>Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: July 2024</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using the services provided by Amplivo Digital Growth Private Limited, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.</p>
          
          <h2>2. Services Description</h2>
          <p>Amplivo provides digital marketing services including but not limited to search engine optimization, performance marketing, social media management, content creation, and website development. The specific scope of services will be outlined in a separate Statement of Work (SOW) or contract.</p>

          <h2>3. Client Responsibilities</h2>
          <p>To enable us to provide effective services, clients must:</p>
          <ul>
            <li>Provide necessary access to platforms, websites, and analytics accounts.</li>
            <li>Respond to requests for approvals or information in a timely manner.</li>
            <li>Ensure all provided materials (images, copy, logos) do not infringe on third-party copyrights.</li>
          </ul>

          <h2>4. Payment Terms</h2>
          <p>Invoices are payable within 15 days of receipt unless otherwise specified in your contract. Late payments may result in the suspension of services.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
