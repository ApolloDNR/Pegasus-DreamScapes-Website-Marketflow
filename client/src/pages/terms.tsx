import { useSEO } from "@/hooks/use-seo";

export default function Terms() {
  useSEO({
    title: "Terms of Service | Pegasus Dreamscapes Corp",
    description: "Terms of service for using the Pegasus Dreamscapes Corp real estate investment platform.",
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-terms-title">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>
        
        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Pegasus Dreamscapes Corp website and platform ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use our Services. These Terms constitute a legally binding agreement between you and Pegasus Dreamscapes Corp ("Company," "we," "our," or "us").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pegasus Dreamscapes Corp operates a real estate investment platform that connects property sellers with investors. Our Services include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Wholesale real estate deal marketplace</li>
              <li>Capital raising project listings</li>
              <li>Property listing services</li>
              <li>Investor-seller matching and communication tools</li>
              <li>Deal negotiation facilitation</li>
              <li>Educational resources and calculators</li>
              <li>Community forums and messaging</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium mb-2">Registration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features of our Services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>
            <h3 className="text-xl font-medium mb-2">Account Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide false or misleading information about properties or deals</li>
              <li>Engage in fraudulent or deceptive practices</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems to access or scrape our platform</li>
              <li>Interfere with the proper functioning of the Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Property and Deal Listings</h2>
            <h3 className="text-xl font-medium mb-2">Accuracy of Listings</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Users who list properties or deals are solely responsible for the accuracy and completeness of all information provided. We do not verify the accuracy of listings and make no representations about the condition, value, or investment potential of any listed property.
            </p>
            <h3 className="text-xl font-medium mb-2">No Guarantee of Transactions</h3>
            <p className="text-muted-foreground leading-relaxed">
              We facilitate connections between parties but do not guarantee that any transaction will be completed. All negotiations and transactions are conducted directly between users at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Investment Disclaimer</h2>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="font-semibold text-foreground">IMPORTANT NOTICE</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The information provided through our Services is for general informational purposes only and should not be construed as investment advice, financial advice, or a recommendation to buy or sell any real estate or securities.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Real estate investments carry inherent risks, including the potential loss of principal</li>
              <li>Past performance is not indicative of future results</li>
              <li>Property values can fluctuate and may not appreciate as projected</li>
              <li>Rental income and returns are not guaranteed</li>
              <li>You should conduct your own due diligence before making any investment decisions</li>
              <li>We recommend consulting with qualified legal, tax, and financial professionals</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Fees and Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features of our Services may require payment of fees. All fees are disclosed before purchase and are non-refundable unless otherwise stated. We reserve the right to change our fee structure with reasonable notice to users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content, features, and functionality of our Services, including but not limited to text, graphics, logos, and software, are owned by Pegasus Dreamscapes Corp and are protected by intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit to our platform but grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PEGASUS DREAMSCAPES CORP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OUR SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Pegasus Dreamscapes Corp, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising out of your use of our Services, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising out of or relating to these Terms or our Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the state where our principal place of business is located, and the decision of the arbitrator shall be final and binding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account and access to our Services at any time, with or without cause, and with or without notice. Upon termination, your right to use the Services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of our Services after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Arizona, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">Pegasus Dreamscapes Corp</p>
              <p className="text-muted-foreground">Email: legal@pegasusdreamscapes.com</p>
                          </div>
          </section>
        </div>
      </div>
    </div>
  );
}
