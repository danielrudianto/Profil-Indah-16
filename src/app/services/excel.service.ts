import { Injectable } from '@angular/core';
import type * as ExcelJS from 'exceljs';
import { isiModul } from 'src/app/utils/dynamic-import.utils';
import { saveAs } from 'file-saver';

/**
 * Satu kolom pada sheet. Lebar dalam satuan karakter Excel; kosong berarti
 * mengikuti bawaan per format.
 */
export interface KolomExcel {
  judul: string;
  format?: 'teks' | 'uang' | 'angka' | 'tanggal';
  lebar?: number;
}

export interface SheetExcel {
  /** Nama tab; dipangkas ke 31 karakter dan karakter terlarang dibuang. */
  nama: string;
  /** Judul besar di baris pertama sheet. */
  judul: string;
  /** Baris kedua yang redup — periode, saringan, dan sebangsanya. */
  keterangan?: string;
  kolom: KolomExcel[];
  baris: (string | number | Date | null | undefined)[][];
  /** Baris TOTAL tebal di dasar tabel; null pada sel yang dibiarkan kosong. */
  totalBaris?: (string | number | null)[];
}

/**
 * Pembangun Excel bersama — SEMUA unduhan Excel aplikasi lewat sini supaya
 * rupanya satu bahasa: judul tebal, keterangan redup, kepala tabel putih di
 * atas biru tua yang beku saat digulir, border tipis, angka rata kanan
 * dengan pemisah ribuan, dan baris total bergaris ganda.
 *
 * exceljs, bukan SheetJS: edisi komunitas SheetJS hanya menulis sel polos —
 * tanpa warna, tanpa border, tanpa format angka — dan "rapi" justru soal
 * itu semua.
 */
@Injectable({ providedIn: 'root' })
export class ExcelService {
  /* Palet unduhan: biru tua kepala tabel, abu tipis border. */
  private static readonly WARNA_KEPALA = 'FF1E293B';
  private static readonly WARNA_BORDER = 'FFD5DAE3';
  private static readonly FONT = 'Calibri';

  async unduh(namaBerkas: string, sheets: SheetExcel[]): Promise<void> {
    /*
      exceljs berbobot 0,9 MB dan hanya dipakai di dalam metode ini. Impornya
      dinamis supaya bobot itu baru terunduh ketika seseorang benar-benar
      menekan Ekspor — bukan ketika halaman yang memuat tombolnya dibuka.
      Impor di kepala berkas sengaja `import type`: ia hanya memasok tipe dan
      lenyap saat dikompilasi.
    */
    const modul = await import('exceljs');
    /*
      Bukan destrukturisasi bernama: exceljs dipaketkan sebagai UMD, sehingga
      impor dinamisnya hanya mengekspor `default` dan `{ Workbook }` menjadi
      undefined. Lihat dynamic-import.utils.ts.
    */
    const { Workbook } = isiModul<typeof ExcelJS>(modul);

    if (typeof Workbook !== 'function') {
      throw new Error('exceljs termuat tetapi Workbook tidak ditemukan.');
    }

    const buku = new Workbook();

    for (const sheet of sheets) {
      this.tulisSheet(buku, sheet);
    }

    const isi = await buku.xlsx.writeBuffer();
    const blob = new Blob([isi], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(
      blob,
      namaBerkas.endsWith('.xlsx') ? namaBerkas : `${namaBerkas}.xlsx`,
    );
  }

  private tulisSheet(buku: ExcelJS.Workbook, sheet: SheetExcel): void {
    const ws = buku.addWorksheet(this.namaTab(sheet.nama), {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    const nKolom = sheet.kolom.length;

    /* Baris 1: judul. Baris 2: keterangan. Baris 3 sengaja kosong. */
    ws.mergeCells(1, 1, 1, Math.max(nKolom, 1));
    const selJudul = ws.getCell(1, 1);
    selJudul.value = sheet.judul;
    selJudul.font = { name: ExcelService.FONT, size: 14, bold: true };

    if (sheet.keterangan) {
      ws.mergeCells(2, 1, 2, Math.max(nKolom, 1));
      const selKet = ws.getCell(2, 1);
      selKet.value = sheet.keterangan;
      selKet.font = {
        name: ExcelService.FONT,
        size: 10,
        italic: true,
        color: { argb: 'FF64748B' },
      };
    }

    /* Baris 4: kepala tabel. */
    const kepala = ws.getRow(4);
    sheet.kolom.forEach((kolom, i) => {
      const sel = kepala.getCell(i + 1);
      sel.value = kolom.judul;
      sel.font = {
        name: ExcelService.FONT,
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      sel.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: ExcelService.WARNA_KEPALA },
      };
      sel.alignment = {
        vertical: 'middle',
        horizontal: this.rataKanan(kolom) ? 'right' : 'left',
      };
      sel.border = this.border();

      const k = ws.getColumn(i + 1);
      k.width = kolom.lebar ?? this.lebarBawaan(kolom);
    });
    kepala.height = 20;

    ws.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: Math.max(nKolom, 1) },
    };

    /* Isi. */
    let barisKe = 5;
    for (const baris of sheet.baris) {
      const r = ws.getRow(barisKe++);
      sheet.kolom.forEach((kolom, i) => {
        const sel = r.getCell(i + 1);
        sel.value = this.nilai(baris[i], kolom);
        this.gayaSel(sel, kolom);
      });
    }

    /* Baris total: tebal, dipisah garis ganda dari isinya. */
    if (sheet.totalBaris) {
      const r = ws.getRow(barisKe);
      sheet.kolom.forEach((kolom, i) => {
        const sel = r.getCell(i + 1);
        const nilai = sheet.totalBaris![i];
        sel.value = nilai === null || nilai === undefined ? '' : nilai;
        this.gayaSel(sel, kolom);
        sel.font = { name: ExcelService.FONT, size: 10, bold: true };
        sel.border = {
          ...this.border(),
          top: { style: 'double', color: { argb: 'FF94A3B8' } },
        };
      });
    }
  }

  private nilai(
    mentah: string | number | Date | null | undefined,
    kolom: KolomExcel,
  ): ExcelJS.CellValue {
    if (mentah === null || mentah === undefined || mentah === '') {
      return '';
    }
    if (kolom.format === 'uang' || kolom.format === 'angka') {
      const angka = Number(mentah);
      return Number.isFinite(angka) ? angka : String(mentah);
    }
    return mentah as ExcelJS.CellValue;
  }

  private gayaSel(sel: ExcelJS.Cell, kolom: KolomExcel): void {
    sel.font = { name: ExcelService.FONT, size: 10 };
    sel.border = this.border();
    if (kolom.format === 'uang') {
      sel.numFmt = '#,##0';
      sel.alignment = { horizontal: 'right' };
    } else if (kolom.format === 'angka') {
      sel.numFmt = '#,##0.##';
      sel.alignment = { horizontal: 'right' };
    } else if (kolom.format === 'tanggal') {
      sel.numFmt = 'dd mmm yyyy';
    }
  }

  private rataKanan(kolom: KolomExcel): boolean {
    return kolom.format === 'uang' || kolom.format === 'angka';
  }

  private lebarBawaan(kolom: KolomExcel): number {
    if (kolom.format === 'uang') return 16;
    if (kolom.format === 'angka') return 12;
    if (kolom.format === 'tanggal') return 14;
    return 26;
  }

  private border(): Partial<ExcelJS.Borders> {
    const tipis: ExcelJS.Border = {
      style: 'thin',
      color: { argb: ExcelService.WARNA_BORDER },
    };
    return { top: tipis, bottom: tipis, left: tipis, right: tipis };
  }

  /** Excel menolak nama tab >31 karakter atau berisi []:*?/\ . */
  private namaTab(nama: string): string {
    const bersih = nama.replace(/[\[\]:*?\/\\]/g, ' ').trim() || 'Sheet';
    return bersih.slice(0, 31);
  }
}
