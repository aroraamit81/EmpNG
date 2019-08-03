import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidators {
  static EmailDomain(domain: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const controlValue: string = control.value;

      if (
        controlValue === "" ||
        controlValue.toLowerCase().substring(controlValue.indexOf("@") + 1) ==
          domain.toLowerCase()
      ) {
        return null;
      }
      return { EmailDomain: true };
    };
  }

  static EmailMatch(group: AbstractControl): ValidationErrors | null {
    const EmailControl = group.get('email');
    const ConfirmEmail = group.get('confirmEmail');
    
    if(EmailControl.value == ConfirmEmail.value ||  (ConfirmEmail.pristine  && ConfirmEmail.value === ''))
      return null;
    
    else return {'EmailMismatch' : true};
  }
}
