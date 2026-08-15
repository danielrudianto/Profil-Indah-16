import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import {
  NAV_GROUPS,
  NAV_ITEMS,
  NavGroup,
  NavItem,
} from 'src/app/constants/navigation.constant';

/** Satu item yang siap digambar: jalurnya sudah digabung dengan awalan shell. */
interface ItemTampil {
  item: NavItem;
  /** Sudah jadi, bukan dihitung ulang di template — lihat catatan di bawah. */
  jalur: string[];
}

interface GrupTampil {
  key: NavGroup;
  label: string;
  items: ItemTampil[];
}

/**
 * Navigasi samping — sistem desain Nocturne.
 *
 * Menggantikan empat daftar menu yang sebelumnya ditulis tangan di masing-
 * masing template shell peran. Isinya kini disaring dari satu daftar
 * (navigation.constant.ts) berdasarkan peran pengguna.
 *
 * Menyembunyikan menu BUKAN penjagaan. Yang benar-benar menahan akses tetap
 * guard rute di frontend dan middleware di backend; komponen ini hanya
 * merapikan apa yang ditawarkan.
 *
 * ---------------------------------------------------------------------------
 * DAFTARNYA DISIMPAN, BUKAN DIHITUNG DI TEMPLATE.
 *
 * Bentuk sebelumnya memakai `get grup()` yang dipanggil langsung oleh
 * *ngFor. Setiap pemeriksaan perubahan memanggil getter itu lagi, dan getter
 * itu membangun array serta objek BARU setiap kali. NgFor membandingkan
 * berdasarkan identitas, jadi seluruh isi menu dianggap berganti: semua
 * <a routerLink routerLinkActive> dibongkar dan dipasang ulang. Setiap
 * RouterLinkActive yang baru berlangganan kejadian router dan menandai
 * induknya kotor, yang memicu pemeriksaan berikutnya — dan seterusnya, tanpa
 * henti.
 *
 * Akibatnya bukan sekadar lambat: utas utama tidak pernah selesai. Halaman
 * sempat tergambar sekali lalu menjadi hitam, permintaan jaringan yang sedang
 * berjalan menggantung di status pending, dan tab-nya tidak bisa ditutup.
 * Tidak ada satu pun galat di konsol, karena memang tidak ada yang gagal —
 * semuanya hanya berputar.
 *
 * Karena itu daftarnya dihitung SEKALI, lalu diperbarui hanya ketika ada
 * alasan nyata: kata kunci pencarian berubah, bahasa berganti, atau awalan
 * shell berubah. trackBy dipasang sebagai lapis kedua supaya kekeliruan
 * serupa di kemudian hari tidak langsung berujung pada gejala yang sama.
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class SidenavComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private translateService: TranslateService
  ) {}

  private destroyRef = inject(DestroyRef);

  /**
   * Awalan jalur shell yang sedang dipakai, misalnya "Administrator".
   *
   * Diperlukan selama keempat subpohon peran masih berdiri sendiri. Ketika
   * rutenya digabung menjadi satu pohon nanti, masukan ini cukup dikosongkan —
   * daftar menunya sendiri tidak perlu disentuh.
   */
  @Input({ required: true })
  set base(nilai: string) {
    this._base = nilai;
    this.hitungUlang();
  }
  get base(): string {
    return this._base;
  }
  private _base = '';

  /** Diciutkan: hanya ikon yang tampil, lebar 76px. */
  @Input() collapsed = false;

  cariControl = new FormControl<string>('');
  private kataKunci = '';

  /** Grup beserta isinya, sudah disaring peran dan kata kunci. */
  grup: GrupTampil[] = [];

  ngOnInit(): void {
    this.cariControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nilai) => {
        this.kataKunci = (nilai ?? '').trim().toLowerCase();
        this.hitungUlang();
      });

    /*
      Pencarian mencocokkan label yang SUDAH diterjemahkan, jadi mengganti
      bahasa mengubah hasilnya. Tanpa ini, hasil pencarian lama tetap bertahan
      setelah bahasa berganti.
    */
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.hitungUlang());

    this.hitungUlang();
  }

  /** Identitas untuk NgFor — kunci grup dan jalur item tidak pernah berubah. */
  lacakGrup = (_: number, g: GrupTampil): string => g.key;
  lacakItem = (_: number, i: ItemTampil): string => i.item.path;

  /**
   * Grup yang kosong tidak ikut ditampilkan — judul grup tanpa satu pun item
   * di bawahnya hanya menyisakan ruang kosong yang terbaca seperti kesalahan.
   */
  private hitungUlang(): void {
    const peran = this.authService.getUserInfo()?.role;

    this.grup = NAV_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      items: NAV_ITEMS.filter(
        (item) =>
          item.group === g.key &&
          peran != null &&
          item.roles.includes(peran) &&
          this.cocokKataKunci(item)
      ).map((item) => ({
        item,
        jalur: [`/${this._base}`, ...item.path.split('/')],
      })),
    })).filter((g) => g.items.length > 0);
  }

  /*
    Pencarian dilakukan pada LABEL YANG DITERJEMAHKAN, bukan pada kunci i18n.
    Mencari pada kuncinya membuat pengguna berbahasa Indonesia harus mengetik
    "sales_invoice" untuk menemukan "Faktur Penjualan".
  */
  private cocokKataKunci(item: NavItem): boolean {
    if (!this.kataKunci) return true;
    const label = this.translateService.instant(item.label) as string;
    return label.toLowerCase().includes(this.kataKunci);
  }
}
