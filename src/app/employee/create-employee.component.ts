import { EmployeeService } from "./employee.service";
import { IEmployee, ISkill } from "./EmployeeModel";
import { CustomValidators } from "./../Shared/custom.validators";
import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormArray
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-create-employee",
  templateUrl: "./create-employee.component.html",
  styleUrls: ["./create-employee.component.css"]
})
export class CreateEmployeeComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}
  empForm: FormGroup;
  readonly NameMinLength: number = 3;
  readonly NameMaxLength: number = 12;

  ngOnInit() {
    this.empForm = this.fb.group({
      fullName: [
        "",
        [
          Validators.required,
          Validators.minLength(this.NameMinLength),
          Validators.maxLength(this.NameMaxLength)
        ]
      ],
      contactPreference: [],
      phone: [""],
      emailGroup: this.fb.group(
        {
          email: [
            "",
            [Validators.required, CustomValidators.EmailDomain("gmail.com")]
          ],
          confirmEmail: ["", Validators.required]
        },
        { validators: CustomValidators.EmailMatch }
      ),
      skills: this.fb.array([this.AddSkillFormGroup()])
    });
    this.contactPreference.valueChanges.subscribe((data: string) => {
      this.OnContactPrefernceChange(data);
    });

    this.empForm.valueChanges.subscribe(data => {
      this.logValidationErrors(this.empForm);
    });

    this.route.paramMap.subscribe(params => {
      const empId = +params.get("id");
      if (empId) {
        this.getEmployee(empId);
      }
    });
  }

  getEmployee(id: number) {
    this.employeeService
      .getEmployee(id)
      .subscribe(
        (employee: IEmployee) => this.editEmployee(employee),
        (err: any) => console.log(err)
      );
  }

  editEmployee(employee: IEmployee) {
    this.empForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });
    
    this.setExistingSkills(employee.skills);
  }

  setExistingSkills(skills: ISkill[]) {
    this.RemoveSkill(0);
    skills.forEach(s => {
      this.skills.push(this.AddSkillFormGroup(s));
    });
  }

  AddNewSkills() {
    this.skills.push(this.AddSkillFormGroup());
  }
  AddSkillFormGroup(skill: ISkill = null): AbstractControl {
    if (skill == null) {
      skill = { skillName: "", proficiency: "", experienceInYears: null };
    }
    return this.fb.group({
      skillName: [skill.skillName, Validators.required],
      experienceInYears: [skill.experienceInYears, Validators.required],
      proficiency: [skill.proficiency, Validators.required]
    });
  }

  RemoveSkill(SkillIndex) {
    this.skills.removeAt(SkillIndex);
  }

  OnContactPrefernceChange(data: string): void {
    if (this.contactPreference.value === "phone") {
      this.phone.setValidators(Validators.required);
    } else {
      this.phone.clearValidators();
    }
    this.phone.updateValueAndValidity();
  }
  formErrors = {};

  // This object contains all the validation messages for this form
  validationMessages = {
    fullName: {
      required: "Full Name is required.",
      minlength: "Full Name must be greater than 2 characters.",
      maxlength: "Full Name must be less than 10 characters."
    },
    email: {
      required: "email is required.",
      EmailDomain: "email domain should only be Gmail.com"
    },
    emailGroup: {
      EmailMismatch: "email and Confirm email should be same"
    },
    confirmEmail: {
      required: "Confirm email is required."
    },

    phone: {
      required: "phone is required."
    },
    skillName: {
      required: "Skill Name is required."
    },
    experienceInYears: {
      required: "Experience is required."
    },
    proficiency: {
      required: "proficiency is required."
    }
  };

  logValidationErrors(group: FormGroup = this.empForm): void {
    Object.keys(group.controls).forEach(key => {
      const control: AbstractControl = group.get(key);

      this.formErrors[key] = "";
      if (
        control &&
        !control.valid &&
        (control.touched || control.dirty || control.value !== "")
      ) {
        for (var error in control.errors) {
          if (error) {
            this.formErrors[key] += this.validationMessages[key][error] + " ";
          }
        }
      }

      if (control instanceof FormGroup) {
        this.logValidationErrors(control);
      }

      if (control instanceof FormArray) {
        for (const o of control.controls) {
          if (o instanceof FormGroup) {
            this.logValidationErrors(o);
          }
        }
      }
    });
  }
  OnSubmit(): void {
    //this.LogKeyValue(this.empForm);
    //console.log(this.formErrors);
  }

  OnLoadData(): void {
    this.OnClear();
    this.empForm.setValue({
      fullName: "aa",
      email: "aa@aa.com",
      skills: {
        skillName: "NG6",
        experienceInYears: "5",
        proficiency: "Intermediate"
      }
    });
  }
  OnClear(): void {
    this.empForm.reset();
  }
  OnPatchData(): void {
    this.OnClear();
    this.empForm.patchValue({
      skills: {
        skillName: "NG6",
        experienceInYears: "5",
        proficiency: "Intermediate"
      }
    });
  }

  get fullName(): AbstractControl {
    return this.empForm.controls.fullName;
  }
  get email(): AbstractControl {
    return this.empForm.controls.email;
  }
  get skillName(): AbstractControl {
    return this.empForm.controls.skillName;
  }
  get experienceInYears(): AbstractControl {
    return this.empForm.controls.experienceInYears;
  }
  get proficiency(): AbstractControl {
    return this.empForm.controls.proficiency;
  }
  get contactPreference(): AbstractControl {
    return this.empForm.controls.contactPreference;
  }
  get phone(): AbstractControl {
    return this.empForm.controls.phone;
  }

  get skills(): FormArray {
    return <FormArray>this.empForm.get("skills");
  }

  IsNameInvalid(): boolean {
    return (
      (this.fullName.touched || this.fullName.dirty) &&
      this.fullName.errors != null
    );
  }

  IsNameRequired(): boolean {
    return this.fullName.errors.required;
  }

  IsNameLengthInvalid(): boolean {
    return (
      !this.fullName.errors.required &&
      (this.fullName.errors.minlength || this.fullName.errors.maxlength)
    );
  }
}
