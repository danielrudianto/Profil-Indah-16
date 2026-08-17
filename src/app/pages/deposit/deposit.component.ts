import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell deposit — kini hanya penampung rute anaknya, mengikuti shell
 * faktur penjualan dan retur penjualan. Deposit dibuat dari formulir
 * faktur (tipe transaksi), jadi anak-anaknya: daftar menunggu, arsip,
 * dan halaman konfirmasi.
 */
@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  imports: [RouterOutlet],
})
export class DepositComponent {}
