"use client";

import "./landing.css";
import Footer from "./components/Footer";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import CTA from "./components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="landing min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
