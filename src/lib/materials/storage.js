import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';

/**
 * Materi disimpan DI LUAR folder `public/`.
 *
 * Sebelumnya berkas ditulis ke `public/uploads/...`, artinya slide siapa pun
 * bisa diunduh lewat URL tanpa login. Sekarang berkas hanya bisa diambil
 * lewat rute terproteksi `GET /api/materials/[materialId]/file`.
 */
const ROOT = path.join(process.cwd(), 'var', 'materials');

function userDir(userId) {
  return path.join(ROOT, String(userId));
}

/** Buang karakter yang bisa dipakai untuk keluar dari folder tujuan. */
function safeName(filename) {
  return path
    .basename(String(filename))
    .replace(/[^\w.\- ]+/g, '_')
    .slice(0, 120);
}

/** Simpan berkas materi, kembalikan path relatif untuk disimpan di database. */
export async function saveMaterialFile(userId, filename, buffer) {
  const dir = userDir(userId);
  await mkdir(dir, { recursive: true });

  const unique = `${Date.now()}-${safeName(filename)}`;
  await writeFile(path.join(dir, unique), buffer);

  return `${userId}/${unique}`;
}

/** Baca kembali berkas materi dari path relatif yang tersimpan di database. */
export async function readMaterialFile(relativePath) {
  const full = path.resolve(ROOT, relativePath);

  // Pastikan path hasil resolve tetap berada di dalam ROOT.
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) {
    throw new Error('Invalid material path');
  }

  return readFile(full);
}

/** Hapus berkas materi. Diabaikan kalau berkasnya memang sudah tidak ada. */
export async function deleteMaterialFile(relativePath) {
  try {
    const full = path.resolve(ROOT, relativePath);
    if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return;
    await unlink(full);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
