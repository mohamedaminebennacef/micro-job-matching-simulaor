"use client";

import {
  BackgroundShapes,
  Navbar,
  Hero,
  LogoStrip,
  WhatIs,
  HowItWorks,
  Features,
  WhyCampusGigs,
  Screenshots,
  TechStack,
  CTA,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-white text-slate-900 antialiased">
      <BackgroundShapes />
      <Navbar />
      <main className="relative">
        <Hero />
        <LogoStrip />
        <WhatIs />
        <HowItWorks />
        <Features />
        <WhyCampusGigs />
        <Screenshots />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
