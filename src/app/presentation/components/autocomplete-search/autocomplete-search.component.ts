import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-autocomplete-search',
  templateUrl: './autocomplete-search.component.html',
  styleUrls: ['./autocomplete-search.component.css'],
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
    this.apiService
      .get(`${this.routeName}/autocomplete`, {
        keyword: this.searchFormGroup.controls['searchBar'].value,
      })
      .subscribe({
        next: (data: any) => {
          if (this.routeName == 'customer') {
            this.items = [
              {
                id: 0,
                name: 'Retail customer',
              },
              ...data,
            ];
          } else {
            this.items = data;
          }
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
