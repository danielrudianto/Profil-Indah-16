import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-archive-search',
    templateUrl: './archive-search.component.html',
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgIf, MatIconButton, MatSuffix, MatIcon]
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
