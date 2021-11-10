import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ManagementRoutingModule } from './management-routing.module';
// Ng2-select
import { SelectModule } from 'ng-select';
//dataTables
import { DataTableModule } from 'angular2-datatable';
// Modal Component
import { ModalModule } from 'ngx-bootstrap/modal';
import { RolesComponent } from './roles.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
// Dropdowns Component
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
import { RolesCreateComponent } from './create/roles-create.component';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows
};

@NgModule({ 
  imports: [
    CommonModule,
    RolesCreateComponent,
    DataTableModule,
    SelectModule,
    ModalModule,
    TabsModule,
    AngularFileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig)
  ],
  declarations: [
    RolesComponent,
    RolesCreateComponent    
  ],
})
export class ManagementModule { }