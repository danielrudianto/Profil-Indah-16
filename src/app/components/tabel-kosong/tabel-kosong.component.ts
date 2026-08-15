import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Blok kosong tabel — pola `19a` berkas desain, berlaku untuk SEMUA daftar.
 *
 * DIPASANG DI DALAM SEL TABEL, bukan menggantikan tabelnya. Itu inti polanya:
 * ketika tidak ada baris, yang berubah hanya isi tabelnya — baris alat, judul
 * kolom, dan kaki halaman tetap tergambar. Menyembunyikan semuanya membuat
 * halaman kosong terbaca seperti halaman yang gagal dimuat, dan menghilangkan
 * satu-satunya jalan menambah data atau membatalkan pencarian.
 *
 * Komponen ini sengaja tidak punya tombol tambah. Tombol itu sudah berdiri di
 * baris alat, dan menggandakannya berarti dua jalan untuk satu perbuatan.
 */
@Component({
  selector: 'app-tabel-kosong',
  templateUrl: './tabel-kosong.component.html',
  styleUrls: ['./tabel-kosong.component.scss'],
  imports: [NgIf, NgClass, TranslatePipe],
})
export class TabelKosongComponent {
  /** Kelas ikon Phosphor, menyesuaikan isi halamannya. */
  @Input() ikon = 'ph-tray';

  /** Judul varian "belum ada data"; sudah diterjemahkan pemanggilnya. */
  @Input() judul = '';

  /** Satu kalimat penjelasan. Satu, bukan dua. */
  @Input() penjelasan = '';

  /**
   * Kata kunci yang sedang menyaring daftarnya.
   *
   * Terisi berarti varian "hasil pencarian kosong": judulnya mengutip kata
   * kuncinya dan tombol reset muncul. Kosong berarti memang belum ada data,
   * dan tidak ada tombol apa pun.
   */
  @Input() kataKunci = '';

  @Output() reset = new EventEmitter<void>();
}
