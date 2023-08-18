/**
    * @description      : 
    * @author           : Victor Duran
    * @group            : 
    * @created          : 24/06/2021 - 15:20:26
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 24/06/2021
    * - Author          : Victor Duran
    * - Modification    : 
**/

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


import { TextMaskModule } from 'angular2-text-mask';
import { SelectModule } from 'ng-select';
import { NavbarsComponent } from './navbars/navbars.component';

// Components Routing
import { AdministratorRoutingModule } from './administrator-routing.module';
import { UsersComponent } from './users/users.component'
import { ListsComponent } from './lists/lists.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { StateComponent } from './state/state.component';

// Modal Component
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatafilterModule } from '../../Tools/pipe/datafilter.module';
import { MatInputModule }  from '@angular/material/input';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
import { RolesComponent } from './roles/roles.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ContactComponent } from './contact/contact.component';
import { ModuleComponent } from './permission/module.component';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AdministratorRoutingModule,
    // DataTableModule,
    ReactiveFormsModule,
    SelectModule,
    TextMaskModule,
    ModalModule,
    DatafilterModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    BsDropdownModule,
    TabsModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig)

  ],
  declarations: [
    NavbarsComponent,
    UsersComponent,
    ListsComponent,
    StateComponent,
    RolesComponent,
    CalendarComponent,
    ContactComponent,
    ModuleComponent


  ]
})
export class AdministratorModule { }
