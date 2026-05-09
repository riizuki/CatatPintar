"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 transition-colors duration-500 border-t border-gray-100 dark:border-gray-900">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="flex items-center gap-3 group mb-6 inline-flex">
              <div className="relative overflow-hidden rounded-xl bg-white p-1 border border-gray-100 dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/img/logo.png"
                  alt="CatatPintar Logo"
                  width={32}
                  height={32}
                  className="relative z-10"
                />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-500">CatatPintar</h3>
            </Link>
            <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 whitespace-pre-line overflow-y-auto max-h-96 pr-2">
              {t.description}
            </div>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                <span className="sr-only">GitHub</span>
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">
                <span className="sr-only">LinkedIn</span>
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">{t.products}</h4>
              <ul className="space-y-4">
                <li><a href="#fitur" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.features}</a></li>
                <li><a href="#cara-kerja" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.howItWorks}</a></li>
                <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.pricing}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">{t.company}</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.about}</a></li>
                <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.blog}</a></li>
                <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.careers}</a></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">{t.legal}</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.privacy}</a></li>
                <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-[#00A2D8] dark:hover:text-[#4CC1EE] transition-colors duration-300">{t.terms}</a></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} CatatPintar. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            {t.madeWith} <span className="text-red-500">&hearts;</span> {t.by} <span className="font-semibold text-gray-700 dark:text-gray-300">Rizky Alfarid Hafizh</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
