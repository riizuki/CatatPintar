"use client";

import dynamic from "next/dynamic";
import Footer from "./components/Footer";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";

// Lazy-load below-the-fold sections — they aren't needed for first paint
const Features = dynamic(() => import("./components/landing/Features"), {
  loading: () => <div className="min-h-[60vh]" />,
});
const HowItWorks = dynamic(() => import("./components/landing/HowItWorks"), {
  loading: () => <div className="min-h-[60vh]" />,
});
const Testimonials = dynamic(
  () => import("./components/landing/Testimonials"),
  { loading: () => <div className="min-h-[40vh]" /> }
);
const CTA = dynamic(() => import("./components/landing/CTA"), {
  loading: () => <div className="min-h-[40vh]" />,
});
const ScrollToTop = dynamic(
  () => import("./components/landing/ScrollToTop"),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-brand-gray dark:text-gray-300 transition-colors duration-500">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <ScrollToTop />
      <Footer />
    </div>
  );
}