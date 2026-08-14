import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-receivable-list',
    templateUrl: './receivable-list.component.html',
    styleUrl: './receivable-list.component.css',
    standalone: false
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
