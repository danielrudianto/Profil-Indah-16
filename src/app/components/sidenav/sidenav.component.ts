import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { PinnedNavService } from 'src/app/services/pinned-nav.service';
import {
  NAV_FOOTER,
  NAV_GROUPS,
  NAV_ITEMS,
  NavFooterItem,
  NavGroup,
  NavItem,
} from 'src/app/constants/navigation.constant';
import { BadgeService } from 'src/app/services/badge.service';

/** Satu item yang siap digambar. */
interface ItemTampil {
  item: NavItem;
  /** Sudah jadi, bukan dihitung ulang di template — lihat catatan di bawah. */
  jalur: string[];
  tersemat: boolean;
}

interface GrupTampil {
  key: NavGroup | 'pinned';
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
 * Susunannya tiga lapis dan hanya lapis tengah yang menggulung: brand di atas,
 * daftar menu di tengah, lalu pengaturan/aktivitas/keluar menetap di dasar.
 * Jalan keluar harus selalu berada di tempat yang sama; menaruhnya di ujung
 * daftar panjang berarti pengguna menggulung sampai habis hanya untuk keluar.
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
 * alasan nyata: kata kunci pencarian berubah, sematan berubah, atau bahasa
 * berganti. trackBy dipasang sebagai lapis kedua
 * supaya kekeliruan serupa di kemudian hari tidak langsung berujung pada
 * gejala yang sama.
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
    private pinnedNavService: PinnedNavService,
    private translateService: TranslateService,
    public badgeService: BadgeService,
  ) {}

  /**
   * Angka lencana untuk sebuah menu, dibatasi tampilannya di 9.
   *
   * Lebih dari itu ditulis "9+" — bukan karena tempatnya sempit, melainkan
   * karena selisih antara 14 dan 23 tidak mengubah apa pun yang dilakukan
   * orang. Yang perlu dibaca sekilas cuma "ada, dan banyak".
   *
   * Nol mengembalikan null supaya template tidak menggambar lencana kosong:
   * lencana bertuliskan 0 adalah pemberitahuan bahwa tidak ada pemberitahuan.
   */
  lencana(item: { badge?: 'overpayment' | 'goodReceipt' | 'adjustment' }):
    | string
    | null {
    if (!item.badge) {
      return null;
    }

    const nilai = this.badgeService.counts[item.badge];
    if (!nilai || nilai <= 0) {
      return null;
    }

    return nilai > 9 ? '9+' : String(nilai);
  }

  private destroyRef = inject(DestroyRef);

  /** Diciutkan: hanya ikon yang tampil, lebar 76px. */
  @Input() collapsed = false;

  cariControl = new FormControl<string>('');
  private kataKunci = '';

  /** Grup beserta isinya, sudah disaring peran dan kata kunci. */
  grup: GrupTampil[] = [];

  /** Isi kaki navigasi yang boleh dilihat peran ini. */
  kaki: NavFooterItem[] = [];

  ngOnInit(): void {
    this.badgeService.mulai();

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

    this.pinnedNavService.pinned$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.hitungUlang());

    const peran = this.authService.getUserInfo()?.role;
    this.kaki = NAV_FOOTER.filter(
      (item) => peran != null && item.roles.includes(peran),
    );

    this.hitungUlang();
  }

  /** Identitas untuk NgFor — kunci grup dan jalur item tidak pernah berubah. */
  lacakGrup = (_: number, g: GrupTampil): string => g.key;
  lacakItem = (_: number, i: ItemTampil): string => i.item.path;
  lacakKaki = (_: number, k: NavFooterItem): string => k.path;

  togglePin(entri: ItemTampil): void {
    this.pinnedNavService.toggle(entri.item.path);
  }

  keluar(): void {
    /* logout() sendiri yang memindahkan halaman ke /Login. */
    this.authService.logout();
  }

  /**
   * Grup yang kosong tidak ikut ditampilkan — judul grup tanpa satu pun item
   * di bawahnya hanya menyisakan ruang kosong yang terbaca seperti kesalahan.
   */
  private hitungUlang(): void {
    const peran = this.authService.getUserInfo()?.role;

    const boleh = (item: NavItem): boolean =>
      peran != null && item.roles.includes(peran) && this.cocokKataKunci(item);

    const susun = (item: NavItem): ItemTampil => ({
      item,
      jalur: ['/', ...item.path.split('/')],
      tersemat: this.pinnedNavService.isPinned(item.path),
    });

    /*
      Menu yang disematkan naik ke satu grup tersendiri di paling atas, DAN
      tetap berada di grup aslinya. Memindahkannya membuat daftar berubah
      susunan setiap kali seseorang menyematkan sesuatu, sehingga letak menu
      yang sudah dihafal ikut bergeser.
    */
    const tersemat = NAV_ITEMS.filter(
      (item) => boleh(item) && this.pinnedNavService.isPinned(item.path),
    ).map(susun);

    const grupBiasa = NAV_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      items: NAV_ITEMS.filter(
        (item) => item.group === g.key && boleh(item),
      ).map(susun),
    })).filter((g) => g.items.length > 0);

    this.grup = tersemat.length
      ? [
          {
            key: 'pinned' as const,
            label: 'nav__group_pinned',
            items: tersemat,
          },
          ...grupBiasa,
        ]
      : grupBiasa;
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
