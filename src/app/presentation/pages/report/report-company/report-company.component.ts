import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { saveAs } from 'file-saver';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import * as xlsx from 'xlsx';

@Component({
  selector: 'app-report-company',
  templateUrl: './report-company.component.html',
  styleUrls: ['./report-company.component.css'],
})
export class ReportCompanyComponent {
  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private translateService: TranslateService,
    private _hotKeysService: HotkeysService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

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
      (_, i) => new Date().getFullYear() - i
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
      .post('report/output-company/download', {
        date: this.datePipe.transform(
          this.companyFormGroup.value.date,
          'yyyy-MM-dd'
        ),
        company_id: Number(this.companyFormGroup.value.company),
      })
      .subscribe({
        next: (data: any) => {
          const workbook = xlsx.utils.book_new();
          const createSheet = (sheetName: string, sheetData: any[]) => {
            const worksheetData = [
              [
                'No',
                'Reference',
                'Description',
                'Quantity',
                'Unit',
                'Document',
                'Opponent',
              ],
            ];

            sheetData.forEach((x, index) => {
              worksheetData.push([
                index + 1,
                x.reference,
                x.description,
                x.quantity,
                x.unit,
                x.document,
                x.opponent,
              ]);
            });

            const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
            xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
          };

          createSheet('Output', data.output);
          createSheet('Input', data.input);

          const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, `Company_report_${new Date().getTime()}.xlsx`);
          this.alertService.showSuccess(
            this.translateService.instant('report-company__download__success')
          );
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
