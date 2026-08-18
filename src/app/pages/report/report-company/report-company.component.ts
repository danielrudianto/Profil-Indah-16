import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepicker,
} from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-report-company',
  templateUrl: './report-company.component.html',
  styleUrls: ['./report-company.component.scss'],
  imports: [
    MatDialogTitle,
    FormsModule,
    ReactiveFormsModule,
    CdkScrollable,
    MatDialogContent,
    AutocompleteSearchComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatDialogActions,
    MatButton,
    TranslatePipe,
  ],
})
export class ReportCompanyComponent {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
    private dynamicComponentService: DynamicComponentService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private translateService: TranslateService,
  ) {}

  companyFormGroup: FormGroup = new FormGroup({
    company: new FormControl('', Validators.required),
    date: new FormControl(new Date(), Validators.required),
  });

  isDownloading: boolean = false;
  isOpened: boolean = false;

  ngOnInit(): void {
    this.isOpened = true;
  }

  get currentYear(): number[] {
    return Array.from(
      { length: new Date().getFullYear() - 2022 },
      (_, i) => new Date().getFullYear() - i,
    );
  }

  onSelectCompany(event: any) {
    console.log(event);
    this.companyFormGroup.patchValue({
      company: event.id,
    });
  }

  onUnselectCompany() {
    this.companyFormGroup.patchValue({
      company: '',
    });
  }

  downloadReport() {
    this.isDownloading = true;
    this.apiService
      .post('report/output-company', {
        date: this.datePipe.transform(
          this.companyFormGroup.value.date,
          'yyyy-MM-dd',
        ),
        company_id: Number(this.companyFormGroup.value.company),
      })
      .subscribe({
        next: (data: any) => {
          const tanggal = this.datePipe.transform(
            this.companyFormGroup.value.date,
            'yyyy-MM-dd',
          );
          const buatSheet = (nama: string, isi: any[]) => ({
            nama,
            judul: `Laporan keluar-masuk perusahaan — ${nama}`,
            keterangan: tanggal ?? '',
            kolom: [
              { judul: 'No', format: 'angka' as const, lebar: 6 },
              { judul: 'Reference', lebar: 18 },
              { judul: 'Description', lebar: 42 },
              { judul: 'Quantity', format: 'angka' as const },
              { judul: 'Unit', lebar: 10 },
              { judul: 'Document', lebar: 24 },
              { judul: 'Opponent', lebar: 24 },
            ],
            baris: (isi ?? []).map((x: any, index: number) => [
              index + 1,
              x.reference,
              x.description,
              x.quantity,
              x.unit,
              x.document,
              x.opponent,
            ]),
          });

          this.excelService
            .unduh(`Laporan_perusahaan_${tanggal}`, [
              buatSheet('Output', data.output),
              buatSheet('Input', data.input),
            ])
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'report-company__download__success',
                ),
              );
            });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  closeDialog() {
    if (this.isDownloading) {
      return;
    } else {
      this.isOpened = false;
      setTimeout(() => {
        this.dynamicComponentService.closeDynamicComponent();
      }, 300);
    }
  }
}
