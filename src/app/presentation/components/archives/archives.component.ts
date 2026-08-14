import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { NgFor, DatePipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { ArchiveCardComponent } from './archive-card/archive-card.component';

export enum ArchiveMode {
  year,
  month,
}

@Component({
    selector: 'app-archives',
    templateUrl: './archives.component.html',
    styleUrls: ['./archives.component.css'],
    imports: [NgFor, MatDivider, MatGridList, MatGridTile, ArchiveCardComponent, DatePipe]
})
export class ArchivesComponent {
  @Output('onMonthSelected') onMonthSelected: EventEmitter<any> =
    new EventEmitter<any>();
  @Input('route') route!: string;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  years: any[] = [];
  data: any[] = [];
  columnNumber: number = 4;
  aspectRatio: string = '4:3';
  isLoading: boolean = true;

  ngOnInit(): void {
    this.fetchAnnualItems();

    this.columnNumber = this.col;
    this.aspectRatio = this.ar;

    window.addEventListener('resize', () => {
      this.columnNumber = this.col;
      this.aspectRatio = this.ar;
    });
  }

  /**
   * Fetches annual items from the API.
   * This function sends a POST request to the API endpoint `${this.route}/archives/v2` with the parameters `year` and `month` set to `null`.
   * It subscribes to the response and updates the `data` property with the received data.
   * If there is an error, it shows the error using the `alertService.showError` method.
   */
  fetchAnnualItems() {
    this.apiService
      .get(`${this.route}/archives`)
      .subscribe({
        next: (data: any) => {
          this.data = data;
          this.getYears();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  getYears() {
    // Select distinct years from data
    this.years = this.data
      .map((x) => x.year)
      .filter((value, index, self) => self.indexOf(value) == index);
  }

  monthData(year: number) {
    return this.data.filter((x) => x.year == year);
  }

  getDateFromMonthYear(month: number, year: number): Date {
    return new Date(year, month, 1);
  }

  selectMonth(year: number, month: number) {
    this.onMonthSelected.emit({ year, month });
  }

  get col(): number {
    if (window.innerWidth > 1440) {
      return 4;
    } else if (window.innerWidth > 1200) {
      return 3;
    } else if (window.innerWidth > 992) {
      return 2;
    } else if (window.innerWidth > 768) {
      return 1;
    } else {
      return 1;
    }
  }

  get ar(): string {
    if (this.col == 1) {
      return '30:9';
    } else if (this.col == 2) {
      return '25:9';
    } else if (this.col == 3) {
      return '19:9';
    } else if (this.col == 4) {
      return '16:9';
    } else {
      return '16:9';
    }
  }
}
