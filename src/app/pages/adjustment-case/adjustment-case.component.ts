import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell penyesuaian stok — kini hanya penampung rute anaknya.
 *
 * Judul, pencarian, dan perpindahan antara daftar, formulir, dan antrian
 * konfirmasi dipegang app-list-page di masing-masing halaman anak, sesuai
 * berkas desain.
 */
@Component({
  selector: 'app-adjustment-case',
  templateUrl: './adjustment-case.component.html',
  imports: [RouterOutlet],
})
export class AdjustmentCaseComponent {}
