import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorFn, ValidationErrors } from '@angular/forms';
import { IOption } from 'ng-select';

import { Tools } from '../../../../Tools/tools.page';
import { UserServices } from '../../../../services/user.service';
import { RoleServices } from '../../../../services/role.service';
import { ValidationFormsService } from '../../../../services/validation-forms.service';


import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/users';

/** passwords must match - custom validator */
export const confirmPasswordValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  return password && confirm && password.value === confirm.value ? null : { 'passwordMismatch': true };
};

@Component({
  selector: 'app-users-create',
  templateUrl: './user-create.component.html',
  providers: [Tools, UserServices, RoleServices, ValidationFormsService]
})

export class UserCreateComponent implements OnInit {

  public idUserParams;
  userForm: FormGroup;
  public user: User;
  public role: Array<IOption>;
  public phoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  submitted = false;

  constructor(private _userService: UserServices,
    private _tools: Tools,
    private activatedRoute: ActivatedRoute,
    private _roleService: RoleServices,
    private formBuilder: FormBuilder,
    private vf: ValidationFormsService) {
    this.idUserParams = this.activatedRoute.snapshot.params.idUser;

  }
  ngOnInit(): void {
    this.getRoleUser()
    this.createForm()
    this.showOneUser()
  }

  createForm() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(this.vf.formRules.passwordMin)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: confirmPasswordValidator })
  }
  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (!this.idUserParams) {
      this.saveUser()
    } else {
      this.updateUser()
    }
  }
  saveUser() {
    this._userService.saveUser(this.userForm.value).subscribe(
      response => {
        console.log(response);
        // redrigir pagina
        this._tools.goToPage(['/admin/users']);
      },
      error => {
        this._tools.showNotify("error", "GESTIN", <any>error.error.messages.error)
      }
    );
  }
  updateUser() {
    this._userService.updateUser(this.userForm.value,this.idUserParams).subscribe(
      response => {
        console.log(response);
        // redrigir pagina
        this._tools.goToPage(['/admin/users']);
      },
      error => {
        this._tools.showNotify("error", "GESTIN", <any>error.error.messages.error)
      }
    );
  }

  showOneUser(){
    if(this.idUserParams){
      this._userService.getOneUser(this.idUserParams).subscribe(
        response => {
          this.userForm.patchValue(response[0])
          this.userForm.controls['confirmPassword'].setValue(response[0].password)
          this.userForm.controls['password'].disable();
          this.userForm.controls['confirmPassword'].disable();

        },
        error => {
          console.log(<any>error)
          if (<any>error.status == 401) {
            this._tools.goToPage('login')
          } else if (<any>error.status == 500) {
            this._tools.showNotify("error", "GESTIN", "Error Interno")
          } else if (<any>error.status == 403) {
            this._tools.goToPage('403')
          }
        }
      );
    }
  }

  onReset() {

    this.submitted = false;
    this.userForm.reset();

  }
  getRoleUser() {
    this._roleService.getListRoleSelect().subscribe(response => {
      this.role = response
    },
      error => {
        console.log(<any>error)
        if (<any>error.status == 401) {
          this._tools.goToPage('login')
        } else if (<any>error.status == 500) {
          this._tools.showNotify("error", "GESTIN", "Error Interno")
        } else if (<any>error.status == 403) {
          this._tools.showNotify("error", "GESTIN", "No tienes permisos para listar Roles")
        }
      }
    )
  }
}