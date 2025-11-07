"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

const painPoints = [
  {
    icon: "🔍",
    problem: "Not showing up on Google?",
    solution: "Find out why customers can't find you online",
  },
  {
    icon: "💔",
    problem: "Losing customers to competitors?",
    solution: "Discover what makes them choose others over you",
  },
  {
    icon: "⏰",
    problem: "Spending hours on social media?",
    solution: "Get 30 days of content created in 5 minutes",
  },
  {
    icon: "❓",
    problem: "Not sure what to fix first?",
    solution: "Get a simple action plan that actually works",
  },
]

const benefits = [
  {
    icon: "📈",
    title: "Grow Your Business",
    description: "See exactly why customers choose competitors and what to do about it",
    action: "Get Your Growth Plan",
    link: "/grow",
  },
  {
    icon: "✍️",
    title: "Never Run Out of Content",
    description: "Professional Facebook and Instagram posts, plus a 30-day content calendar",
    action: "Create Content Now",
    link: "/content",
  },
  {
    icon: "🤖",
    title: "Save 10+ Hours Weekly",
    description: "AI tools that handle the busy work so you can focus on customers",
    action: "Find Time-Savers",
    link: "/tools",
  },
]

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl) {
      setError("Please enter your website URL")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          website: websiteUrl,
          business_name: "",
          industry: ""
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      // Store analysis result with metadata and redirect to grow page
      sessionStorage.setItem('initialAnalysis', JSON.stringify({
        ...data,
        website: websiteUrl,
        analyzedAt: new Date().toISOString()
      }))
      router.push("/grow")
    } catch (err) {
      setError("Couldn't analyze the website. Please check the URL and try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">Local AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/grow" className="text-sm font-medium text-slate-300 hover:text-white">Grow My Business</Link>
              <Link href="/content" className="text-sm font-medium text-slate-300 hover:text-white">Content Creator</Link>
              <Link href="/tools" className="text-sm font-medium text-slate-300 hover:text-white">AI Tools</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Is Your Business Easy to Find Online?
          </h1>
          <p className="mb-10 text-xl leading-relaxed text-slate-300">
            Most customers search online before buying. Let's make sure they find YOU, not your competitors.
          </p>

          <form onSubmit={handleAnalyze} className="mx-auto mb-6 max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                value={websiteUrl}
                onChange={(e) => { setWebsiteUrl(e.target.value); setError("") }}
                placeholder="Enter your website (e.g., yourshop.com)"
                className="flex-1 h-12 text-base"
                required
              />
              <Button type="submit" disabled={isAnalyzing} size="lg" className="px-8 h-12">
                {isAnalyzing ? "Checking..." : "Check My Website"}
              </Button>
            </div>
            {error && (
              <div className="mt-3 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
            )}
          </form>
          <p className="text-sm text-slate-400">Free analysis • Takes 30 seconds • No signup required</p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="border-t border-white/10 bg-slate-900/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white">Sound Familiar?</h2>
            <p className="text-slate-400">We help fix these common problems</p>
          </div>

          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2">
            {painPoints.map((point, idx) => (
              <Card key={idx} className="p-6 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all">
                <div className="flex gap-4">
                  <div className="text-3xl">{point.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{point.problem}</h3>
                    <p className="text-slate-400">{point.solution}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white">What You Get</h2>
            <p className="text-slate-400">Simple tools that help you get more customers</p>
          </div>

          <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="p-8 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all flex flex-col">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-400 mb-6 flex-1">{benefit.description}</p>
                <Link href={benefit.link}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                    {benefit.action}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 bg-linear-to-b from-slate-900 to-slate-950 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Grow?</h2>
          <p className="mb-8 text-lg text-slate-300">Start with a free website check. Takes 30 seconds.</p>
          <Button size="lg" className="px-12 h-14 text-lg bg-emerald-500 hover:bg-emerald-600" onClick={() => document.querySelector('input')?.focus()}>
            Check My Website Now
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Local AI</span>
            </div>
            <p className="text-sm text-slate-500">© 2025 Local AI. Grow your business with simple AI tools.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
