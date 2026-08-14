import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgFor, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-receivable-list',
    templateUrl: './receivable-list.component.html',
    styleUrl: './receivable-list.component.css',
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, NgFor, DecimalPipe, TranslatePipe]
})
export class ReceivableListComponent {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  dataSource: any[] = [];
  filteredDataSource: any[] = [];
  searchFormControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.fetchReceivable();
    this.searchFormControl.valueChanges.subscribe(() => {
      const search = this.searchFormControl.value.toLowerCase();
      this.filteredDataSource = this.dataSource.filter((item) =>
        item.name?.toLowerCase().includes(search)
      );
    });
  }

  fetchReceivable() {
    this.apiService.get('receivable').subscribe({
      next: (data: any) => {
        this.dataSource = data;
        this.filteredDataSource = data;
      },
    });
  }

  get max() {
    // get maximum value of datasource.value
    return Math.max(...this.dataSource.map((item) => item.value));
  }

  viewReceivable(id: number) {
    this.router.navigate([id], {
      relativeTo: this.route,
    });
  }
}
