"use client";

import { motion } from "framer-motion";
import Footer from "./components/Footer";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import CTA from "./components/landing/CTA";
import Testimonials from "./components/landing/Testimonials";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="bg-white text-brand-gray font-sans dark:bg-gray-900 dark:text-gray-300">
      <Header />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </motion.div>

      <Footer />
    </div>
  );
}