export const translations = {
  id: {
    header: {
      features: "Fitur",
      howItWorks: "Cara kerja",
      login: "Masuk",
      register: "Daftar",
    },
    hero: {
      title: "Pahami materi, bukan cuma dicatat.",
      subtitle:
        "Tulis catatan dengan bahasamu sendiri, tanya AI kalau ada yang bingung, lalu uji pemahamanmu lewat kuis dan flashcard.",
      ctaStart: "Daftar gratis",
      ctaLogin: "Sudah punya akun? Masuk",
      handNote: "gratis buat pelajar & mahasiswa",
    },
    demo: {
      tryIt: "coba di sini!",
      hint: "Bingung? Klik kalimat yang digaris bawah.",
      aiLabel: "Penjelasan AI",
      quizLabel: "Kuis singkat",
      right: "Benar!",
      wrong: "Belum tepat. Jawabannya:",
      subjects: [
        {
          name: "Biologi",
          color: "green",
          title: "Fotosintesis",
          lines: [
            "Fotosintesis terjadi di kloroplas.",
            "Klorofil menyerap cahaya matahari.",
            "Hasilnya glukosa dan oksigen.",
          ],
          confusing: 0,
          explain:
            "Kloroplas adalah bagian sel tumbuhan yang berwarna hijau. Anggap saja dapurnya: di situ cahaya, air, dan CO₂ diolah jadi makanan.",
          question: "Di bagian sel mana fotosintesis terjadi?",
          options: ["Mitokondria", "Kloroplas", "Ribosom"],
          answer: 1,
        },
        {
          name: "Sejarah",
          color: "yellow",
          title: "Sumpah Pemuda",
          lines: [
            "Diikrarkan pada 28 Oktober 1928.",
            "Hasil Kongres Pemuda II di Batavia.",
            "Isinya: satu tanah air, satu bangsa, satu bahasa.",
          ],
          confusing: 1,
          explain:
            "Kongres Pemuda II adalah pertemuan organisasi pemuda dari berbagai daerah. Di hari terakhir kongres itulah mereka mengikrarkan Sumpah Pemuda.",
          question: "Sumpah Pemuda diikrarkan pada tahun…",
          options: ["1908", "1928", "1945"],
          answer: 1,
        },
        {
          name: "Matematika",
          color: "pink",
          title: "Teorema Pythagoras",
          lines: [
            "Berlaku untuk segitiga siku-siku.",
            "Rumusnya a² + b² = c².",
            "c adalah sisi miring (hipotenusa).",
          ],
          confusing: 2,
          explain:
            "Hipotenusa adalah sisi terpanjang pada segitiga siku-siku, letaknya berhadapan dengan sudut 90°.",
          question: "Jika a = 3 dan b = 4, berapa panjang c?",
          options: ["5", "7", "12"],
          answer: 0,
        },
      ],
    },
    features: {
      title: "Yang bisa kamu lakukan di sini",
      handNote: "semua dalam satu tempat",
      items: [
        {
          title: "Menulis catatan",
          desc: "Rangkum materi dengan bahasamu sendiri. Ada judul, daftar, gambar, sampai blok kode.",
        },
        {
          title: "Bertanya ke AI",
          desc: "Blok kalimat yang membingungkan, lalu minta penjelasan yang lebih sederhana.",
        },
        {
          title: "Membuat kuis",
          desc: "Soal pilihan ganda dibuat dari catatanmu atau dari topik apa saja, dengan tingkat kesulitan pilihanmu.",
        },
        {
          title: "Menghafal dengan flashcard",
          desc: "Catatan panjang diubah jadi kartu hafalan untuk mengulang materi sebelum ujian.",
        },
      ],
    },
    how: {
      title: "Tiga langkah belajarnya",
      steps: [
        { title: "Catat", desc: "Tulis atau tempel materi dari kelas ke editor." },
        { title: "Pahami", desc: "Tanya AI untuk bagian yang belum kamu mengerti." },
        { title: "Uji", desc: "Latihan dengan kuis dan flashcard dari catatanmu." },
      ],
    },
    cta: {
      title: "Ulangan minggu depan? Mulai dari catatan hari ini.",
      button: "Buat akun gratis",
    },
    footer: {
      description: "Ruang belajar berbantuan AI untuk pelajar dan mahasiswa.",
      madeWith: "Dibuat dengan",
      by: "oleh",
    },
  },
  en: {
    header: {
      features: "Features",
      howItWorks: "How it works",
      login: "Log in",
      register: "Sign up",
    },
    hero: {
      title: "Understand your lessons, not just write them down.",
      subtitle:
        "Write notes in your own words, ask AI when something is unclear, then test yourself with quizzes and flashcards.",
      ctaStart: "Sign up free",
      ctaLogin: "Have an account? Log in",
      handNote: "free for students",
    },
    demo: {
      tryIt: "try it here!",
      hint: "Confused? Click the underlined sentence.",
      aiLabel: "AI explanation",
      quizLabel: "Quick quiz",
      right: "Correct!",
      wrong: "Not quite. The answer is:",
      subjects: [
        {
          name: "Biology",
          color: "green",
          title: "Photosynthesis",
          lines: [
            "Photosynthesis happens in the chloroplast.",
            "Chlorophyll absorbs sunlight.",
            "It produces glucose and oxygen.",
          ],
          confusing: 0,
          explain:
            "The chloroplast is the green part of a plant cell. Think of it as the kitchen: light, water, and CO₂ are turned into food there.",
          question: "In which part of the cell does photosynthesis happen?",
          options: ["Mitochondria", "Chloroplast", "Ribosome"],
          answer: 1,
        },
        {
          name: "History",
          color: "yellow",
          title: "The Youth Pledge",
          lines: [
            "Declared on 28 October 1928.",
            "Result of the Second Youth Congress in Batavia.",
            "One homeland, one nation, one language.",
          ],
          confusing: 1,
          explain:
            "The Second Youth Congress gathered youth organizations from across the archipelago. On its final day they declared the Youth Pledge.",
          question: "The Youth Pledge was declared in…",
          options: ["1908", "1928", "1945"],
          answer: 1,
        },
        {
          name: "Math",
          color: "pink",
          title: "Pythagorean theorem",
          lines: [
            "Works for right triangles.",
            "The formula is a² + b² = c².",
            "c is the hypotenuse.",
          ],
          confusing: 2,
          explain:
            "The hypotenuse is the longest side of a right triangle, opposite the 90° angle.",
          question: "If a = 3 and b = 4, what is c?",
          options: ["5", "7", "12"],
          answer: 0,
        },
      ],
    },
    features: {
      title: "What you can do here",
      handNote: "all in one place",
      items: [
        {
          title: "Write notes",
          desc: "Summarize lessons in your own words, with headings, lists, images, and code blocks.",
        },
        {
          title: "Ask AI",
          desc: "Highlight a confusing sentence and ask for a simpler explanation.",
        },
        {
          title: "Make quizzes",
          desc: "Multiple-choice questions from your notes or any topic, at the difficulty you choose.",
        },
        {
          title: "Memorize with flashcards",
          desc: "Turn long notes into flashcards to review before exams.",
        },
      ],
    },
    how: {
      title: "Three steps to study",
      steps: [
        { title: "Write", desc: "Type or paste your class material into the editor." },
        { title: "Understand", desc: "Ask AI about the parts you don't get yet." },
        { title: "Test", desc: "Practice with quizzes and flashcards from your notes." },
      ],
    },
    cta: {
      title: "Test next week? Start with today's notes.",
      button: "Create a free account",
    },
    footer: {
      description: "An AI-assisted study space for students.",
      madeWith: "Made with",
      by: "by",
    },
  },
};
