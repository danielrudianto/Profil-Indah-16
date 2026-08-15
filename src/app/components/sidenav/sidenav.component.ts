import { Component, Input } from '@angular/core';
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

interface GrupTampil {
  key: NavGroup;
  label: string;
  items: NavItem[];
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
export class SidenavComponent {
  constructor(
    private authService: AuthService,
    private translateService: TranslateService
  ) {}

  /**
   * Awalan jalur shell yang sedang dipakai, misalnya "Administrator".
   *
   * Diperlukan selama keempat subpohon peran masih berdiri sendiri. Ketika
   * rutenya digabung menjadi satu pohon nanti, masukan ini cukup dikosongkan —
   * daftar menunya sendiri tidak perlu disentuh.
   */
  @Input({ required: true }) base!: string;

  /** Diciutkan: hanya ikon yang tampil, lebar 76px. */
  @Input() collapsed = false;

  cariControl = new FormControl<string>('');
  private kataKunci = '';

  ngOnInit(): void {
    this.cariControl.valueChanges.subscribe((nilai) => {
      this.kataKunci = (nilai ?? '').trim().toLowerCase();
    });
  }

  /**
   * Grup beserta isinya, sudah disaring peran dan kata kunci.
   *
   * Grup yang kosong tidak ikut ditampilkan — judul grup tanpa satu pun item
   * di bawahnya hanya menyisakan ruang kosong yang terbaca seperti kesalahan.
   */
  get grup(): GrupTampil[] {
    const peran = this.authService.getUserInfo()?.role;

    return NAV_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      items: NAV_ITEMS.filter(
        (item) =>
          item.group === g.key &&
          peran != null &&
          item.roles.includes(peran) &&
          this.cocokKataKunci(item)
      ),
    })).filter((g) => g.items.length > 0);
  }

  /** Jalur penuh item, digabung dengan awalan shell yang sedang berlaku. */
  jalur(item: NavItem): string[] {
    return [`/${this.base}`, ...item.path.split('/')];
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
