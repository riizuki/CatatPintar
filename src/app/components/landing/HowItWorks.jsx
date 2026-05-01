"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 100 } },
};

const HowItWorks = () => {
  const { language } = useLanguage();
  const t = translations[language].how;

  const translatedSteps = [
    {
      id: "01",
      title: t.step1Title,
      description: t.step1Desc,
    },
    {
      id: "02",
      title: t.step2Title,
      description: t.step2Desc,
    },
    {
      id: "03",
      title: t.step3Title,
      description: t.step3Desc,
    }
  ];

  return (
    <section id="cara-kerja" className="relative py-24 lg:py-32 bg-white dark:bg-gray-900 transition-colors duration-500 overflow-hidden">

      {/* Abstract background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-100/40 to-blue-300/40 dark:from-blue-900/10 dark:to-blue-800/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-6 md:px-8 max-w-5xl">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            {t.title1} <span className="text-[#00A2D8] dark:text-[#4CC1EE]">{t.title2}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {/* Animated vertical connecting line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00A2D8]/20 via-blue-500/20 to-transparent dark:from-[#00A2D8]/10 dark:via-blue-500/10 md:-translate-x-1/2 rounded-full hidden sm:block">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#00A2D8] to-blue-700 rounded-full"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {translatedSteps.map((step, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row items-center justify-between group ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block md:w-5/12"></div>
                <motion.div variants={itemVariants} className="w-full md:w-5/12 flex md:justify-end text-left md:text-right">
                  <div className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 ml-12 md:ml-0 group-hover:-translate-y-1 ${index % 2 !== 0 ? 'md:!text-left md:!justify-start md:mr-12 md:ml-0' : ''}`}>
                    <div className="text-[#00A2D8] font-bold text-lg mb-2">{step.id}</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
                {/* Center Node */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-4 border-[#00A2D8] flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
                  <span className="text-[#00A2D8] font-bold">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
