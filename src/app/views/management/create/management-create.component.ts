import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorFn, ValidationErrors } from '@angular/forms';
import { IOption } from 'ng-select';


import { ActivatedRoute } from '@angular/router';
import { Tools } from '../../../Tools/tools.page';
import { ManagementService } from '../../../services/management.service';
import { ValidationFormsService } from '../../../services/validation-forms.service';
import { of } from 'rxjs';

import { NgWizardConfig, NgWizardService, StepChangedArgs, StepValidationArgs, STEP_STATE, THEME } from 'ng-wizard';


@Component({
  selector: 'app-management-create',
  templateUrl: './management-create.component.html',
  providers: [Tools, ManagementService,ValidationFormsService]
})

export class ManagementCreateComponent implements OnInit {

  public idPersonalParams;
  userForm: FormGroup;
  public role: Array<IOption>;
  public phoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  submitted = false;


  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };
 
  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.default,
    lang:{ next: 'Siguiente', previous: 'Previo' },
    toolbarSettings: {
      toolbarExtraButtons: [
        { text: 'Guardar', class: 'btn btn-info', event: () => { alert("Finished!!!"); } }
      ],
    }
  };

  constructor(private _managementService: ManagementService,
    private _tools: Tools,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private vf: ValidationFormsService,
    private ngWizardService: NgWizardService) {
    this.idPersonalParams = this.activatedRoute.snapshot.params.idUser;

  }
  ngOnInit(): void {
  
      }
      stepChanged(args: StepChangedArgs) {
       // console.log(args.step);
      }
     
      isValidTypeBoolean: boolean = true;
     
      isValidFunctionReturnsBoolean(args: StepValidationArgs) {
      
        return true;
      }
     
      isValidFunctionReturnsObservable(args: StepValidationArgs) {
        return of(true);
      }
}