import { Injectable } from '@angular/core';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { isiModul } from 'src/app/utils/dynamic-import.utils';

/**
 * Pemuat pdfmake yang ditunda sampai PDF-nya benar-benar diminta.
 *
 * pdfmake beserta berkas fontnya berbobot 2,4 MB — lebih berat daripada
 * seluruh muatan awal aplikasi. Ketika ia diimpor secara statis di komponen,
 * bobot itu ikut terunduh begitu halaman laporan atau tampilan faktur dibuka,
 * walaupun penggunanya tidak pernah menekan Cetak sekali pun. Di sini
 * impornya dinamis, jadi pustakanya baru diambil pada unduhan pertama.
 *
 * `pdfmake/interfaces` sengaja tetap statis: berkas itu hanya berisi tipe,
 * jadi ia lenyap saat dikompilasi dan tidak menambah bobot apa pun.
 */
@Injectable({ providedIn: 'root' })
export class PdfService {
  /*
    Yang disimpan adalah JANJI pemuatannya, bukan modul hasilnya. Dua
    penekanan tombol beruntun sebelum unduhan pertama selesai akan menunggu
    janji yang sama; menyimpan modulnya saja membuat keduanya terlanjur
    memulai unduhan masing-masing.
  */
  private pemuatan?: Promise<{
    createPdf: typeof import('pdfmake/build/pdfmake').createPdf;
    vfs: { [berkas: string]: string };
  }>;

  async unduh(
    definisi: TDocumentDefinitions,
    namaBerkas: string,
  ): Promise<void> {
    const { createPdf, vfs } = await this.muat();
    createPdf(definisi, undefined, undefined, vfs).download(namaBerkas);
  }

  private muat() {
    this.pemuatan ??= (async () => {
      const [modulPdf, modulFont] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);

      /*
        Font diserahkan lewat argumen keempat createPdf, bukan dengan menimpa
        pdfMake.vfs seperti dulu. Alasannya bukan gaya: impor dinamis
        menghasilkan objek namespace modul, yang propertinya baca-saja di mata
        TypeScript, sehingga penugasan itu tidak lagi dapat dikompilasi tanpa
        pemaksaan tipe. pdfmake 0.2.23 memang membaca `vfs || globalVfs`, jadi
        jalur argumen ini setara dan tidak menyentuh keadaan global.

        Bentuk lamanya sendiri punya jebakan yang layak diingat: sampai 0.2.10
        vfs_fonts mengekspor pembungkus, sehingga jalurnya pdfFonts.pdfMake.vfs;
        sejak 0.2.23 yang diekspor objek vfs-nya langsung. Memakai jalur lama
        menghasilkan undefined dan PDF gagal dibuat saat dijalankan, tanpa satu
        pun galat kompilasi.

        isiModul() di bawah bukan hiasan, dan sebab yang sama: pdfmake
        dipaketkan sebagai UMD, sehingga impor dinamisnya menghasilkan
        namespace ber-`default` saja — akses bernama `modulPdf.createPdf`
        menghasilkan undefined, dan galatnya baru meledak saat tombol Cetak
        ditekan. Lihat dynamic-import.utils.ts.
      */
      const pdfMake =
        isiModul<typeof import('pdfmake/build/pdfmake')>(modulPdf);
      const vfs = isiModul<{ [berkas: string]: string }>(modulFont);

      if (typeof pdfMake?.createPdf !== 'function') {
        throw new Error('pdfmake termuat tetapi createPdf tidak ditemukan.');
      }

      return { createPdf: pdfMake.createPdf, vfs };
    })();

    return this.pemuatan;
  }
}
