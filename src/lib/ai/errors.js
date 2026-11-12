/**
 * Terjemahkan error dari Gemini jadi pesan yang bisa dipahami mahasiswa.
 *
 * Pesan asli Google panjang, berbahasa Inggris, dan berisi URL serta detail
 * kuota. Menampilkannya mentah-mentah di UI membingungkan, dan menyimpannya
 * apa adanya di `errorReason` tidak berguna bagi pengguna.
 */

export class AiUnavailableError extends Error {
  constructor(message, { kind, retryAfterSeconds, cause } = {}) {
    super(message);
    this.name = 'AiUnavailableError';
    /** quota | rate | overloaded | auth | unknown */
    this.kind = kind ?? 'unknown';
    this.retryAfterSeconds = retryAfterSeconds ?? null;
    this.cause = cause;
  }

  /** Status HTTP yang pantas untuk dikembalikan rute API. */
  get httpStatus() {
    if (this.kind === 'quota' || this.kind === 'rate') return 429;
    if (this.kind === 'auth') return 500;
    return 503;
  }
}

function retryAfterFrom(message) {
  const match = String(message).match(/retry in\s+(?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/i);
  if (!match) return null;
  const [, h = 0, m = 0, s = 0] = match;
  return Math.round(Number(h) * 3600 + Number(m) * 60 + Number(s));
}

function humanDuration(seconds) {
  if (!seconds) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours} jam${minutes ? ` ${minutes} menit` : ''}`;
  if (minutes > 0) return `${minutes} menit`;
  return `${seconds} detik`;
}

/**
 * Kenali error dari Gemini. Mengembalikan AiUnavailableError kalau error-nya
 * berasal dari layanan AI (kuota, batas laju, server penuh, kunci API),
 * atau null kalau bukan — misalnya error kode biasa yang harus tetap dilempar.
 */
export function classifyAiError(error) {
  if (error instanceof AiUnavailableError) return error;

  const message = String(error?.message ?? error ?? '');
  const status = error?.status ?? Number(message.match(/\[(\d{3})\s/)?.[1]);

  if (status === 429 || /quota|rate.?limit|exceeded/i.test(message)) {
    const perDay = /per\s*day|PerDay/i.test(message);
    const retryAfterSeconds = retryAfterFrom(message);
    const wait = humanDuration(retryAfterSeconds);
    return new AiUnavailableError(
      perDay
        ? `Kuota harian AI sudah habis. Coba lagi ${wait ? `sekitar ${wait} lagi` : 'besok'}.`
        : `AI sedang menerima terlalu banyak permintaan. Coba lagi ${wait ? `dalam ${wait}` : 'sebentar lagi'}.`,
      { kind: perDay ? 'quota' : 'rate', retryAfterSeconds, cause: error },
    );
  }

  if (status === 503 || status === 500 || /overloaded|unavailable|internal error/i.test(message)) {
    return new AiUnavailableError('Layanan AI sedang sibuk. Coba lagi beberapa saat lagi.', {
      kind: 'overloaded',
      cause: error,
    });
  }

  if (status === 401 || status === 403 || /api key|permission|unauthorized/i.test(message)) {
    return new AiUnavailableError('Kunci API Gemini tidak valid atau tidak punya izin.', {
      kind: 'auth',
      cause: error,
    });
  }

  if (/GoogleGenerativeAI|generativelanguage\.googleapis\.com|fetch failed/i.test(message)) {
    return new AiUnavailableError('Gagal menghubungi layanan AI. Periksa koneksi internet lalu coba lagi.', {
      kind: 'unknown',
      cause: error,
    });
  }

  return null;
}
