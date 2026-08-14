import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { NgIf, NgFor } from '@angular/common';
import { MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'app-autocomplete-search',
    templateUrl: './autocomplete-search.component.html',
    styleUrls: ['./autocomplete-search.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatAutocompleteTrigger, MatAutocomplete, NgIf, MatOption, NgFor, MatIcon, MatPrefix, MatIconButton, MatSuffix]
})
export class AutocompleteSearchComponent {
  constructor(private apiService: ApiService) {}

  @Input('routeName') routeName!: string;
  @Input('placeholder') placeholder!: string;
  @Input('label') label!: string;
  @Input('selected') selected!: boolean;
  @Input('defaultValue') defaultValue!: string;
  @Input('reset') reset: boolean = false;
  @Input('disabled') disabled: boolean = false;

  @Output() onSelectData = new EventEmitter<any>();
  @Output() onUnselectData = new EventEmitter();

  searchFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    searchBar: new FormControl({
      value: '',
      disabled: this.disabled,
    }),
  });
  items: any[] = [];

  isLoading: boolean = false;

  selectData(data: any) {
    const id = data.option.value;
    if (this.defaultValue == null || (this.defaultValue != null && id != 0)) {
      const index = this.items.findIndex((x) => x.id == id);
      if (index != -1) {
        this.searchFormGroup.setValue({
          id: this.items[index].id,
          searchBar: this.items[index].name,
        });
        this.onSelectData.emit(this.items[index]);
      }
    } else {
      this.searchFormGroup.setValue({
        id: 0,
        searchBar: this.defaultValue,
      });
      this.onSelectData.emit({
        name: this.defaultValue,
        id: 0,
      });
    }

    if (this.reset) {
      this.searchFormGroup.setValue({
        id: '',
        searchBar: '',
      });
    }
  }

  clearData() {
    this.onUnselectData.emit();
    this.searchFormGroup.setValue({
      id: null,
      searchBar: '',
    });
  }

  ngOnInit(): void {
    if (this.defaultValue != undefined) {
      this.searchFormGroup.patchValue({
        searchBar: this.defaultValue,
      });
    }

    this.fetchItems();
    this.searchFormGroup.valueChanges.pipe(debounceTime(500)).subscribe((_) => {
      this.fetchItems();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('disabled')) {
      if (changes['disabled'].currentValue) {
        this.searchFormGroup.controls['searchBar'].disable();
      } else {
        this.searchFormGroup.controls['searchBar'].enable();
      }
    }

    if (changes.hasOwnProperty('defaultValue')) {
      if (changes['defaultValue'].currentValue != null) {
        this.searchFormGroup.patchValue({
          searchBar: changes['defaultValue'].currentValue,
        });
      }
    }
  }

  fetchItems() {
    this.isLoading = true;
    const formattedRouteName = this.routeName.split('#')[0];
    this.apiService
      .get(`${formattedRouteName}/autocomplete`, {
        keyword: this.searchFormGroup.controls['searchBar'].value,
      })
      .subscribe({
        next: (data: any) => {
          switch (this.routeName) {
            case 'customer':
              this.items = [
                {
                  id: 0,
                  name: 'Retail customer',
                },
                ...data,
              ];
              break;
            case 'payment-method#no-dor':
              this.items = data.filter((x: any) => x.id != 0);
              this.items.unshift({
                id: -1,
                name: 'Cash',
                description: 'Cash',
              });
              break;
            case 'payment-method':
              this.items = data;
              this.items.unshift({
                id: -1,
                name: 'Cash',
                description: 'Cash',
              });
              break;
            default:
              this.items = data;
              break;
          }
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
