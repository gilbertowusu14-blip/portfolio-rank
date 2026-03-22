import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Rankfolio™",
  description: "Terms governing your use of Rankfolio™ portfolio analysis.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/" className="text-sm text-yellow-400 hover:underline">
          ← Home
        </Link>
        <h1 className="font-heading mt-8 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-lg font-semibold text-white">1. Agreement</h2>
            <p className="mt-3">
              By accessing or using Rankfolio™ (“the Service”), you agree to these Terms. If you do
              not agree, do not use the Service. We may update these Terms; continued use after
              changes constitutes acceptance where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">2. The Service</h2>
            <p className="mt-3">
              Rankfolio™ provides informational portfolio analysis, scores, and optional AI-generated
              commentary and reports. Features may change, be suspended, or discontinued. We do not
              guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">
              3. Not financial advice
            </h2>
            <p className="mt-3">
              Nothing on Rankfolio™ is investment, tax, or legal advice. We are not a regulated
              financial adviser. You are solely responsible for your investment decisions. Past
              performance does not guarantee future results. Always consider your own circumstances
              and consult a qualified professional where appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">4. Eligibility</h2>
            <p className="mt-3">
              You must be able to form a binding contract in your jurisdiction. You may not use the
              Service for unlawful purposes or in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">
              5. Accounts, fees, and payments
            </h2>
            <p className="mt-3">
              Certain features may require payment through our third-party payment processor. Fees
              are as displayed at checkout. Taxes may apply. Refunds are handled in accordance with
              applicable law and any policy stated at purchase.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">
              6. Intellectual property
            </h2>
            <p className="mt-3">
              Rankfolio™, its branding, software, and content are protected by intellectual property
              laws. You receive a limited, non-exclusive, non-transferable licence to use the
              Service for personal, non-commercial use unless otherwise agreed. You may not copy,
              scrape, reverse engineer, or resell the Service without permission.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">7. User content</h2>
            <p className="mt-3">
              You retain rights to data you submit. You grant us a licence to use that data to
              operate and improve the Service, including generating analyses and aggregated
              statistics, as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">8. Disclaimers</h2>
            <p className="mt-3">
              THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUTPUTS ARE ACCURATE, COMPLETE, OR SUITABLE
              FOR ANY PURPOSE.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">
              9. Limitation of liability
            </h2>
            <p className="mt-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RANKFOLIO™ AND ITS SUPPLIERS SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
              ANY LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT
              OF THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID
              US IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) FIFTY POUNDS STERLING (£50), EXCEPT
              WHERE LIABILITY CANNOT BE LIMITED BY LAW (SUCH AS DEATH OR PERSONAL INJURY CAUSED BY
              NEGLIGENCE).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">10. Indemnity</h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless Rankfolio™ from claims arising from your use
              of the Service, your data, or your breach of these Terms, to the extent permitted by
              law.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">11. Suspension and termination</h2>
            <p className="mt-3">
              We may suspend or terminate access if you breach these Terms, create risk, or where
              required by law. Provisions that by nature should survive will survive termination.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">12. Governing law</h2>
            <p className="mt-3">
              These Terms are governed by the laws of England and Wales, unless mandatory consumer
              protections in your country require otherwise. Courts of England and Wales shall have
              non-exclusive jurisdiction, subject to any rights you have as a consumer to bring
              proceedings in your home courts.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">13. Contact</h2>
            <p className="mt-3">
              Questions about these Terms:{" "}
              <a href="mailto:hello@rankfolio.app" className="text-yellow-400 hover:underline">
                hello@rankfolio.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
