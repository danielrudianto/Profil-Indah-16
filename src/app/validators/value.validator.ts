import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ValueValidator(value: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = parseFloat(control.value);
    return forbidden == value
      ? { forbiddenName: { value: control.value } }
      : null;
  };
}
