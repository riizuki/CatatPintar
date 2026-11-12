/**
 * Ubah semua kata sandi lama yang masih tersimpan sebagai teks biasa menjadi
 * hash bcrypt.
 *
 *   node -r dotenv/config scripts/hash-legacy-passwords.mjs           (hanya melihat)
 *   node -r dotenv/config scripts/hash-legacy-passwords.mjs --apply   (menulis)
 *
 * Aman dijalankan berulang kali: akun yang sudah ter-hash dilewati.
 * Pengguna tetap masuk dengan kata sandi yang SAMA — hanya cara simpannya
 * yang berubah. Skrip ini tidak pernah mencetak kata sandi.
 *
 * Login sendiri juga meng-hash ulang akun lama secara otomatis
 * (lihat src/lib/auth/password.js). Skrip ini ada supaya kata sandi teks
 * biasa tidak tetap tersimpan di database sampai pemiliknya kebetulan login.
 *
 * Catatan: aturan di bawah sengaja disalin dari src/lib/auth/password.js
 * (berkas itu memakai alias impor khusus Next.js, jadi tidak bisa diimpor
 * dari skrip Node biasa). Kalau BCRYPT_ROUNDS di sana diubah, ubah juga di sini.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const BCRYPT_ROUNDS = 12;
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const apply = process.argv.includes('--apply');
const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany({ select: { id: true, email: true, password: true } });
  const legacy = users.filter((u) => !BCRYPT_PATTERN.test(u.password ?? ''));

  console.log(`Akun: ${users.length} | sudah ter-hash: ${users.length - legacy.length} | teks biasa: ${legacy.length}`);

  if (legacy.length === 0) {
    console.log('Tidak ada yang perlu diubah.');
  } else if (!apply) {
    for (const u of legacy) console.log(`  akan di-hash: user #${u.id}`);
    console.log('\nMode lihat saja. Jalankan ulang dengan --apply untuk menulis.');
  } else {
    let done = 0;
    for (const u of legacy) {
      if (!u.password) {
        console.log(`  lewati user #${u.id}: kata sandi kosong`);
        continue;
      }
      const hash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);

      // Pastikan hash-nya benar-benar cocok SEBELUM menimpa — kalau tidak,
      // pemilik akun akan terkunci tanpa jalan kembali.
      if (!(await bcrypt.compare(u.password, hash))) {
        console.log(`  GAGAL verifikasi user #${u.id}, tidak diubah`);
        continue;
      }

      // Hanya timpa kalau isinya masih sama dengan yang kita baca, supaya
      // ganti sandi yang terjadi bersamaan tidak tertimpa.
      const { count } = await prisma.user.updateMany({
        where: { id: u.id, password: u.password },
        data: { password: hash },
      });
      if (count === 1) done += 1;
      console.log(`  ${count === 1 ? 'di-hash' : 'berubah di tengah jalan, dilewati'}: user #${u.id}`);
    }
    console.log(`\nSelesai: ${done} akun di-hash.`);
  }
} finally {
  await prisma.$disconnect();
}
