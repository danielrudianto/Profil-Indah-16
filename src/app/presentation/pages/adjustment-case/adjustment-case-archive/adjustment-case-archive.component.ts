import { Component } from '@angular/core';
import { AdjustmentCaseArchiveFilterComponent } from './adjustment-case-archive-filter/adjustment-case-archive-filter.component';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { PageEvent } from '@angular/material/paginator';
import { ArchiveViewComponent } from 'src/app/presentation/components/archives/archive-view/archive-view.component';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-adjustment-case-archive',
  templateUrl: './adjustment-case-archive.component.html',
  styleUrls: ['./adjustment-case-archive.component.css'],
  animations: [slideInOutAnimation],
})
export class AdjustmentCaseArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  mode: ArchiveMode = ArchiveMode.year;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  isLoading: boolean = false;
  month: number | null = null;
  year: number | null = null;
  keyword: string = '';
  filterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    isConfirmed: new FormControl(true),
    isPending: new FormControl(true),
    isRejected: new FormControl(true),
    isActive: new FormControl(true),
    isDelete: new FormControl(true),
    isLost: new FormControl(true),
    isFound: new FormControl(true),
  });

  ngOnInit(): void {}

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';

    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      status: 0,
      type: 0,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .get('adjustment-case/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        keyword: this.keyword,
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value)
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value)
        ).format('YYYY-MM-DD'),
        isConfirmed: this.filterFormGroup.get('isConfirmed')?.value,
        isPending: this.filterFormGroup.get('isPending')?.value,
        isRejected: this.filterFormGroup.get('isRejected')?.value,
        isActive: this.filterFormGroup.get('isActive')?.value,
        isDelete: this.filterFormGroup.get('isDelete')?.value,
        isLost: this.filterFormGroup.get('isLost')?.value,
        isFound: this.filterFormGroup.get('isFound')?.value,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.fetchSelectedMonth();
  }

  backToYear() {
    this.mode = ArchiveMode.year;
    this.month = null;
    this.year = null;
  }

  onQueryChanged(event: string) {
    this.keyword = event;
    this.fetchSelectedMonth(1);
  }

  openFilter() {
    this.dialog
      .open(AdjustmentCaseArchiveFilterComponent, {
        data: {
          month: this.month,
          year: this.year,
          ...this.filterFormGroup.value,
        },
      })
      .afterClosed()
      .subscribe((data) => {});
  }

  viewArchive(id: number) {
    // this.dynamicComponentService.createDynamicComponent(ArchiveViewComponent, {
    //   route: 'adjustment-event',
    //   id: id,
    // });
  }
}
