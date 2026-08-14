import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatTooltip]
})
export class ColorPickerComponent {
  @Input('selectedColor') selectedColor!: string;
  @Input('disabled') disabled!: boolean;
  @Output('onColorSelected') onColorSelected = new EventEmitter<string>();

  h: number = 0;
  s: number = 100;
  l: number = 50;
  opacity: number = 1;
  colorFormGroup: FormGroup = new FormGroup({
    h: new FormControl(0, Validators.required),
  });

  ngOnInit(): void {
    this.hexToHSL(this.selectedColor);
    this.colorFormGroup.valueChanges.subscribe({
      next: (data) => {
        this.onColorSelected.emit(
          this.hslToHex(this.colorFormGroup.value.h, this.s, this.l)
        );
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.hasOwnProperty('disabled') &&
      changes['disabled'].currentValue == true
    ) {
      this.colorFormGroup.disable();
    } else if (
      changes.hasOwnProperty('disabled') &&
      changes['disabled'].currentValue == false
    ) {
      this.colorFormGroup.enable();
    }
  }

  onSliderChange(event: any) {
    const value = event.target.value;
    this.h = Math.floor((value / 100) * 360);
    const hex = this.hslToHex(this.h, this.s, this.l);
    this.onColorSelected.emit(hex);
  }

  hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    // Calculate chroma
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    // Convert RGB values to the range [0, 255] and round them
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    // Convert each component to a 2-digit hexadecimal string
    const toHex = (n: number) => n.toString(16).padStart(2, '0');

    // Combine the hexadecimal strings into one
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  hexToHSL(hex: string) {
    let r = 0,
      g = 0,
      b = 0;

    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h *= 60;
    }

    this.colorFormGroup.patchValue({
      h: h,
    });
    // this.s = s * 100;
    // this.l = l * 100;
    return;
  }
}
