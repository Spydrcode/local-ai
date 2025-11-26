'use client';

import { useState } from 'react';
import { PRICING_TIERS, formatPrice, getPlanFeatures } from '@/types/agency';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session');
    }
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@yourdomain.com?subject=Enterprise Plan Inquiry';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-white font-semibold text-lg">Forecasta AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plans Built for Agencies at Every Stage
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Generate client-ready strategic analysis in minutes. Choose the plan that fits your team.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-900/50 backdrop-blur border border-white/10 rounded-full p-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PRICING_TIERS.map((plan, index) => {
            const isPopular = plan.id === 'starter';
            const price =
              billingCycle === 'annual' && plan.annualPrice
                ? plan.annualPrice / 12 / 100
                : plan.monthlyPrice / 100;
            const features = getPlanFeatures(plan.id);

            return (
              <div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur border rounded-2xl p-6 ${
                  isPopular
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-white/10'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  {plan.id === 'enterprise' ? (
                    <div>
                      <p className="text-3xl font-bold text-white">Custom</p>
                      <p className="text-sm text-slate-400 mt-1">Contact sales for pricing</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(Math.round(price * 100))}
                        </span>
                        <span className="text-slate-400">/month</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-sm text-emerald-400 mt-1">
                          Billed annually ({formatPrice(plan.annualPrice!)}/year)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'enterprise' ? (
                  <button
                    onClick={handleContactSales}
                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all"
                  >
                    Contact Sales
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    Start Free Trial
                  </button>
                )}

                <p className="text-xs text-slate-400 text-center mt-3">
                  14-day free trial • No credit card required
                </p>
              </div>
            );
          })}
        </div>

        {/* ROI Calculator */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            💰 ROI Calculator
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">If you charge</p>
              <p className="text-3xl font-bold text-white">$2,000</p>
              <p className="text-sm text-slate-300">per strategic report</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">And create</p>
              <p className="text-3xl font-bold text-white">5 per month</p>
              <p className="text-sm text-slate-300">for clients</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Monthly revenue</p>
              <p className="text-3xl font-bold text-emerald-400">$10,000</p>
              <p className="text-sm text-emerald-300">vs. $299/month cost = 3% of revenue</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <p className="text-center text-slate-300">
              <span className="text-white font-semibold">Plus:</span> Save 20-25 hours/month =$3,000-$7,500 worth of billable time
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="Can I change plans later?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
            />
            <FAQItem
              question="What happens if I go over my monthly report limit?"
              answer="You can purchase additional report packs ($5 per report) or upgrade to the next tier. We'll notify you when you're approaching your limit."
            />
            <FAQItem
              question="Is there a refund policy?"
              answer="Yes! We offer a 30-day money-back guarantee. If you're not satisfied for any reason, we'll refund your first month."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely. There are no long-term contracts. Cancel anytime from your account settings."
            />
            <FAQItem
              question="Do you offer discounts for nonprofits or educational institutions?"
              answer="Yes! Contact us at sales@yourdomain.com for special pricing."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, Amex) and ACH transfers for annual plans."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to 10x Your Strategic Deliverable Output?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Join 50+ agencies using Forecasta AI to scale strategic consulting without hiring more analysts.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all text-lg"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-xl transition-all text-lg"
            >
              Watch Demo
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white">{question}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-slate-300">{answer}</p>
        </div>
      )}
    </div>
  );
}
