import bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * Penyimpanan kata sandi.
 *
 * Sebelumnya kata sandi disimpan dan dicocokkan sebagai TEKS BIASA. Siapa pun
 * yang bisa membaca tabel `users` — termasuk lewat cadangan database atau
 * berkas .sql hasil ekspor — langsung melihat kata sandi setiap pengguna, dan
 * karena orang cenderung memakai kata sandi yang sama di banyak tempat,
 * kebocorannya tidak berhenti di aplikasi ini.
 *
 * Sekarang kata sandi disimpan sebagai hash bcrypt. Hash tidak bisa dibalik
 * jadi kata sandi; saat login, kata sandi yang diketik di-hash lalu
 * dibandingkan.
 */

/**
 * Faktor biaya bcrypt. 12 = 2^12 putaran: sekitar ratusan milidetik per
 * hash, cukup lambat untuk menghambat tebakan massal, cukup cepat untuk login.
 */
export const BCRYPT_ROUNDS = 12;

export const MIN_PASSWORD_LENGTH = 6;

/**
 * bcrypt hanya memakai 72 byte pertama dari kata sandi; sisanya diabaikan
 * diam-diam. Ditolak di depan supaya dua kata sandi panjang yang hanya beda
 * di ekornya tidak dianggap sama.
 */
export const MAX_PASSWORD_BYTES = 72;

const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isHashed(stored) {
  return BCRYPT_PATTERN.test(String(stored ?? ''));
}

/** Pesan kesalahan kalau kata sandi tidak memenuhi syarat, atau null kalau sah. */
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    return `Kata sandi terlalu panjang (maksimal ${MAX_PASSWORD_BYTES} byte).`;
  }
  return null;
}

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Bandingkan dua teks tanpa membocorkan di posisi mana keduanya mulai beda.
 * Keduanya di-hash dulu supaya panjangnya selalu sama — timingSafeEqual
 * menolak buffer yang panjangnya berbeda, dan perbedaan panjang itu sendiri
 * sudah merupakan bocoran.
 */
function constantTimeEquals(a, b) {
  const da = createHash('sha256').update(String(a)).digest();
  const db = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(da, db);
}

/**
 * Cocokkan kata sandi yang diketik dengan yang tersimpan.
 *
 * Masih menerima kata sandi lama yang tersimpan sebagai teks biasa, supaya
 * pengguna lama tidak terkunci. Dalam kasus itu `needsRehash` bernilai true,
 * dan pemanggil wajib segera menggantinya dengan hash.
 *
 * @returns {{ valid: boolean, needsRehash: boolean }}
 */
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || !stored) {
    return { valid: false, needsRehash: false };
  }

  if (isHashed(stored)) {
    return { valid: await bcrypt.compare(password, stored), needsRehash: false };
  }

  const valid = constantTimeEquals(password, stored);
  return { valid, needsRehash: valid };
}
