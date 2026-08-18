import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

/**
 * Kerangka dialog — sistem desain Nocturne.
 *
 * Menyediakan kepala (lencana ikon, judul, keterangan, tombol tutup) dan kaki
 * (tombol batal dan tombol utama). Isinya disalurkan halaman lewat ng-content,
 * sama seperti app-list-page — yang dibagi hanya bagian yang memang tidak boleh
 * berbeda antar dialog.
 *
 * Dipakai DI DALAM wadah dialog apa pun: MatDialog maupun
 * app-dynamic-dialog. Komponen ini tidak tahu dan tidak peduli siapa yang
 * membukanya; itu yang membuatnya bisa dipasang tanpa lebih dulu menyeragamkan
 * kedua mekanisme dialog yang sekarang hidup berdampingan di aplikasi ini.
 */
@Component({
  selector: 'app-dialog-shell',
  templateUrl: './dialog-shell.component.html',
  styleUrls: ['./dialog-shell.component.scss'],
  imports: [NgIf, FormsModule, TranslatePipe],
})
export class DialogShellComponent {
  /** Ikon Phosphor lengkap dengan awalannya, misalnya "ph ph-tag-simple". */
  @Input({ required: true }) icon!: string;

  @Input({ required: true }) heading!: string;

  /** Satu kalimat di bawah judul; boleh kosong. */
  @Input() lede = '';

  /** Label tombol utama. */
  @Input({ required: true }) submitLabel!: string;

  @Input() submitting = false;

  /** Tombol utama dimatikan selama formulirnya belum sah. */
  @Input() canSubmit = false;

  /*
    Dialog pemberitahuan murni (kredensial sekali tampil, misalnya) tidak
    punya apa pun untuk dibatalkan — tombol Batal di sana berbohong.
  */
  @Input() hideCancel = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
}
