import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell kelebihan bayar — kini hanya penampung rute anaknya.
 *
 * Judul, pencarian, dan perpindahan antara daftar dan formulir dipegang
 * app-list-page di masing-masing halaman anak, sesuai berkas desain.
 */
@Component({
  selector: 'app-overpayment',
  templateUrl: './overpayment.component.html',
  imports: [RouterOutlet],
})
export class OverpaymentComponent {}
