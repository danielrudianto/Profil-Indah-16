import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-archive-search',
    templateUrl: './archive-search.component.html',
    styleUrls: ['./archive-search.component.css'],
    standalone: false
})
export class ArchiveSearchComponent {
  @Input('isFilterAvailable') isFilterAvailable!: boolean;
  @Output('onQueryChanged') onQueryChanged = new EventEmitter<string>();
  @Output('onFilterButtonClicked') onFilterButtonClicked = new EventEmitter();

  searchFormGroup: FormGroup = new FormGroup({
    search: new FormControl(''),
  });

  ngOnInit(): void {
    this.searchFormGroup.controls['search'].valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        this.onQueryChanged.emit(value);
      });
  }
}
