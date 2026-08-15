import { Component } from '@angular/core';

/**
 * Lapisan dekoratif di belakang isi halaman — dua lingkaran besar beraksen.
 *
 * Dipasang SEKALI di shell, bukan di tiap halaman: ia milik latar aplikasinya,
 * bukan milik salah satu halaman. Dan sengaja tidak ikut ke dalam dialog —
 * dialog punya backdrop-nya sendiri, dan menumpuk keduanya membuat isinya
 * berkabut.
 *
 * pointer-events: none supaya ia tidak pernah menghalangi apa pun yang bisa
 * ditekan; z-index 0 dengan seluruh isi shell di lapis 1 di atasnya.
 */
@Component({
  selector: 'app-page-bloom',
  template: `
    <div class="bloom" aria-hidden="true">
      <span class="bloom__a"></span>
      <span class="bloom__b"></span>
    </div>
  `,
  styleUrls: ['./page-bloom.component.scss'],
})
export class PageBloomComponent {}
