import Hero from "@/components/home/Hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold">CompeteTrack</h2>
        <div className="flex gap-4">
          <Link href="/auth/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Start Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center pt-20">
        <Hero />
      </div>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What You Get
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-800 p-6 rounded-lg">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">24/7 Monitoring</h3>
              <p className="text-zinc-400">
                Automatically track competitor websites daily. Never miss a change.
              </p>
            </div>
            <div className="bg-zinc-800 p-6 rounded-lg">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
              <p className="text-zinc-400">
                Get strategic insights on what competitor changes mean for you.
              </p>
            </div>
            <div className="bg-zinc-800 p-6 rounded-lg">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Weekly Reports</h3>
              <p className="text-zinc-400">
                Executive briefings delivered every Monday morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-zinc-400 mb-12">Start free, upgrade when you need more</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <div className="text-4xl font-bold mb-4">$0</div>
              <ul className="text-left space-y-3 mb-8">
                <li>✓ 1 Project</li>
                <li>✓ Track 3 competitors</li>
                <li>✓ Weekly scans</li>
                <li>✓ AI analysis</li>
              </ul>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </div>
            
            <div className="bg-blue-600 p-8 rounded-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-4">$47/mo</div>
              <ul className="text-left space-y-3 mb-8">
                <li>✓ Unlimited projects</li>
                <li>✓ Track 15 competitors</li>
                <li>✓ Daily scans</li>
                <li>✓ Priority AI analysis</li>
                <li>✓ Email alerts</li>
              </ul>
              <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Stop Losing to Competitors You're Not Watching
        </h2>
        <p className="text-xl text-zinc-400 mb-8">
          Start tracking for free. No credit card required.
        </p>
        <Link href="/auth/signup">
          <Button size="lg">Start Free Today →</Button>
        </Link>
      </section>
    </main>
  );
}