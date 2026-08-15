import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell pengeluaran — kini hanya penampung rute anaknya.
 *
 * Judul dan perpindahan antara daftar, laporan, dan formulir dipegang
 * app-list-page di masing-masing halaman anak, sesuai berkas desain.
 */
@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  imports: [RouterOutlet],
})
export class ExpenseComponent {}
