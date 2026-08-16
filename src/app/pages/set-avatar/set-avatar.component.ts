import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';

import { panelAnimation } from 'src/app/animations/panel.animation';
import {
  AvatarAccessories,
  AvatarClothes,
  AvatarEyebrows,
  AvatarEyes,
  AvatarMouth,
  AvatarTop,
} from 'src/app/models/avatar.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { ColorPickerComponent } from 'src/app/components/color-picker/color-picker.component';

/** Satu kelompok pilihan beserta banyak opsinya. */
interface KelompokAvatar {
  /** Sama dengan nama kontrol formulir dan awalan nama berkas SVG-nya. */
  kunci: string;
  label: string;
  /** Nomor 0..n-1; sama persis dengan nilai yang tersimpan di basis data. */
  opsi: number[];
}

/**
 * Ubah avatar — bagian `21a` berkas desain.
 *
 * ENAM DAFTAR PILIH DIGANTI PETAK BERGAMBAR. Sebelumnya bentuk tiap opsi tidak
 * bisa dilihat sebelum dipilih: untuk tahu "Shaggy" itu seperti apa, orang
 * harus memilihnya, melihat pratinjau, lalu mengganti lagi — 58 kali kalau mau
 * membandingkan semuanya.
 *
 * Gambarnya berkas SVG tersendiri di assets/avatar, satu per opsi, dan
 * NOMORNYA ADALAH NILAI YANG TERSIMPAN DI BASIS DATA — bukan urutan tampilan.
 * Mengurutkan ulang daftar di sini akan mengubah avatar setiap pengguna yang
 * sudah pernah menyimpannya, tanpa satu pun dari mereka menyentuh apa pun.
 */
@Component({
  selector: 'app-set-avatar',
  templateUrl: './set-avatar.component.html',
  styleUrls: ['./set-avatar.component.scss'],
  animations: [panelAnimation],
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    AvatarComponent,
    ColorPickerComponent,
    MatSlideToggle,
    TranslatePipe,
  ],
})
export class SetAvatarComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  panelState: string = 'closed';
  isSubmitting: boolean = false;

  /*
    Jumlah tiap kelompok mengikuti cabang ngSwitch pada komponen avatar, dan
    berkas SVG-nya dinamai dengan nomor yang sama. Ketiganya harus tetap
    sejalan; kalau salah satu bergeser, yang tergambar bukan yang tersimpan.
  */
  readonly kelompok: KelompokAvatar[] = [
    { kunci: 'top', label: 'set-avatar__group__top', opsi: this.deret(15) },
    {
      kunci: 'accessories',
      label: 'set-avatar__group__accessories',
      opsi: this.deret(5),
    },
    {
      kunci: 'clothes',
      label: 'set-avatar__group__clothes',
      opsi: this.deret(8),
    },
    { kunci: 'eyes', label: 'set-avatar__group__eyes', opsi: this.deret(11) },
    {
      kunci: 'eyebrows',
      label: 'set-avatar__group__eyebrows',
      opsi: this.deret(7),
    },
    { kunci: 'mouth', label: 'set-avatar__group__mouth', opsi: this.deret(12) },
  ];

  /** Kelompok yang tabnya sedang terbuka. */
  kelompokAktif: string = 'top';

  avatarFormGroup: FormGroup = new FormGroup({
    top: new FormControl(0, Validators.required),
    accessories: new FormControl(0, Validators.required),
    clothes: new FormControl(0, Validators.required),
    eyes: new FormControl(0, Validators.required),
    eyebrows: new FormControl(0, Validators.required),
    mouth: new FormControl(0, Validators.required),
    circle: new FormControl(true, Validators.required),
    color: new FormControl('', Validators.required),
  });

  private deret(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  ngOnInit(): void {
    this.panelState = 'opened';

    const avatar = this.authService.getSelfAvatar();
    if (avatar == null) {
      this.avatarFormGroup.patchValue({
        top: AvatarTop['no hair'],
        accessories: AvatarAccessories.none,
        clothes: AvatarClothes['blazer shirt'],
        eyes: AvatarEyes.default,
        eyebrows: AvatarEyebrows.default,
        mouth: AvatarMouth.default,
        circle: true,
        color: '#ffa600',
      });
    } else {
      this.avatarFormGroup.patchValue(avatar);
    }
  }

  /** Kelompok yang sedang dibuka tabnya. */
  get kelompokTerbuka(): KelompokAvatar {
    return (
      this.kelompok.find((k) => k.kunci === this.kelompokAktif) ??
      this.kelompok[0]
    );
  }

  bukaKelompok(kunci: string): void {
    this.kelompokAktif = kunci;
  }

  /** Berkas gambar sebuah opsi. Nomornya dua digit, sesuai nama berkasnya. */
  gambar(kelompok: string, nomor: number): string {
    return `assets/avatar/${kelompok}-${String(nomor).padStart(2, '0')}.svg`;
  }

  terpilih(kelompok: string, nomor: number): boolean {
    return Number(this.avatarFormGroup.value[kelompok]) === nomor;
  }

  pilih(kelompok: string, nomor: number): void {
    this.avatarFormGroup.patchValue({ [kelompok]: nomor });
  }

  /**
   * Warna lingkaran latar.
   *
   * Dipakai baik oleh pratinjau maupun oleh setiap petak, supaya petaknya
   * memperlihatkan hasil yang sebenarnya — bukan avatar di atas warna lain.
   * Ketika lingkarannya dimatikan, petaknya memakai warna bawaan desain agar
   * bentuk opsinya tetap terbaca.
   */
  get warnaLatar(): string {
    return this.avatarFormGroup.value.circle
      ? this.avatarFormGroup.value.color || '#65C9FF'
      : '#65C9FF';
  }

  onColorSelected(event: any) {
    this.avatarFormGroup.patchValue({ color: event });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.apiService.post('user-avatar', this.avatarFormGroup.value).subscribe({
      next: (data) => {
        this.authService.setSelfAvatar(data);
        this.alertService.showSuccess(
          'set-avatar__saved',
        );
        this.close();
      },
      error: (error) => {
        console.error(`[error]: Error on setting avatar`, error);
        this.alertService.showError(error);
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  close() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
