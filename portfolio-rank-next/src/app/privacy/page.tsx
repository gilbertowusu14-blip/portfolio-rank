import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Rankfolio™",
  description: "How Rankfolio™ collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/" className="text-sm text-yellow-400 hover:underline">
          ← Home
        </Link>
        <h1 className="font-heading mt-8 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-lg font-semibold text-white">1. Who we are</h2>
            <p className="mt-3">
              Rankfolio™ (“we”, “us”) provides portfolio analysis tools through this website and
              related services. This policy explains how we handle personal data when you use
              Rankfolio™ in the United Kingdom and the European Economic Area, in line with the UK
              GDPR and the EU GDPR where applicable.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">2. Data we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-slate-200">Portfolio inputs:</strong> tickers, weights, and
                preferences you submit for analysis (e.g. risk tolerance, time horizon).
              </li>
              <li>
                <strong className="text-slate-200">Technical data:</strong> IP address, browser
                type, device information, and approximate location derived from IP for security and
                analytics.
              </li>
              <li>
                <strong className="text-slate-200">Payment data:</strong> when you purchase a
                premium report, payment processing is handled by our payment provider (e.g. Stripe).
                We do not store full card numbers on our servers.
              </li>
              <li>
                <strong className="text-slate-200">Communications:</strong> if you contact us, we
                keep the content of your message and your contact details to respond.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">
              3. How we use your data
            </h2>
            <p className="mt-3">We use personal data to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Run scoring, AI-assisted summaries, and optional premium report features.</li>
              <li>Operate, secure, and improve our service.</li>
              <li>Process payments and prevent fraud.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">
              4. Legal bases (UK / EU)
            </h2>
            <p className="mt-3">
              We rely on <strong className="text-slate-200">performance of a contract</strong> where
              you request analysis or a paid report;{" "}
              <strong className="text-slate-200">legitimate interests</strong> to secure and
              improve the service (balanced against your rights); and{" "}
              <strong className="text-slate-200">consent</strong> where we ask for optional
              marketing or non-essential cookies. Where required, we will ask for your consent before
              placing non-essential cookies.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">5. Sharing and processors</h2>
            <p className="mt-3">
              We may share data with infrastructure hosts, analytics providers, AI/API providers used
              to generate text or scores, and payment processors, solely as needed to provide the
              service. We use appropriate contracts (including Standard Contractual Clauses where
              data leaves the UK/EEA) where required.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">6. Retention</h2>
            <p className="mt-3">
              We keep data only as long as needed for the purposes above, including legal, tax, and
              accounting requirements. Aggregated or anonymised statistics may be retained without
              identifying you.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">7. Your rights</h2>
            <p className="mt-3">
              Depending on your location, you may have rights to access, rectify, erase, restrict, or
              object to processing, data portability, and to withdraw consent. You may lodge a
              complaint with a supervisory authority (in the UK, the ICO). To exercise your rights,
              contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">8. Security</h2>
            <p className="mt-3">
              We implement technical and organisational measures appropriate to the risk. No online
              service is completely secure; you use Rankfolio™ at your own risk as described in our
              Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">9. Children</h2>
            <p className="mt-3">
              Rankfolio™ is not directed at children under 16. We do not knowingly collect their
              personal data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">10. Changes</h2>
            <p className="mt-3">
              We may update this policy from time to time. The “Last updated” date will change
              accordingly. Continued use after changes constitutes acceptance where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-white">11. Contact</h2>
            <p className="mt-3">
              For privacy questions or requests:{" "}
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
