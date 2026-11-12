"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faComments, faListCheck, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const marks = [
  { icon: faPenToSquare, hl: "hl-yellow" },
  { icon: faComments, hl: "hl-blue" },
  { icon: faListCheck, hl: "hl-green" },
  { icon: faClone, hl: "hl-pink" },
];

const Features = () => {
  const { language } = useLanguage();
  const t = translations[language].features;

  return (
    <section id="fitur" className="scroll-mt-16 border-t-2 border-[var(--rule)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">{t.title}</h2>
          <p className="hand mt-3 rotate-[-2deg] text-2xl text-[var(--margin)]">{t.handNote}</p>
        </div>

        <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {t.items.map((item, i) => {
            const m = marks[i % marks.length];
            return (
              <li key={item.title} className="flex gap-4">
                <FontAwesomeIcon icon={m.icon} className="mt-1.5 shrink-0 text-xl text-[var(--ink-soft)]" fixedWidth />
                <div>
                  <h3 className="text-xl font-bold">
                    <span className={`hl ${m.hl}`}>{item.title}</span>
                  </h3>
                  <p className="mt-2 leading-7 text-[var(--ink-soft)]">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Features;
