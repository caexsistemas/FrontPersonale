import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorFn, ValidationErrors } from '@angular/forms';
import { IOption } from 'ng-select';


import { ActivatedRoute } from '@angular/router';
import { Tools } from '../../../../Tools/tools.page';
//import { ManagementService } from '../../../services/management.service';
//import { ValidationFormsService } from '../../../services/validation-forms.service';
import { of } from 'rxjs';

import { NgWizardConfig, NgWizardService, StepChangedArgs, StepValidationArgs, STEP_STATE, THEME } from 'ng-wizard';


@Component({
  selector: 'app-lists-create',
  templateUrl: './lists-create.component.html',
  /*ManagementService,ValidationFormsService*/
  providers: [Tools]
})

export class RolesCreateComponent  {

  
}