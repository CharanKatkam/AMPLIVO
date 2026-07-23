import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BackButton } from '@/components/ui/BackButton';

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-32 pb-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-slate">
          <div className="not-prose mb-8">
            <BackButton label="Back to Home" />
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif" }}>Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: July 2024</p>
          
          <h2>1. Introduction</h2>
          <p>Amplivo Digital Growth Private Limited (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
          
          <h2>2. The Data We Collect About You</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
          </ul>

          <h2>3. How We Use Your Personal Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
