import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
// Ng2-select
import { SelectModule } from 'ng-select';
//dataTables
// import { DataTableModule } from 'angular2-datatable';
// Modal Component
import { ModalModule } from 'ngx-bootstrap/modal';
import { ManagementComponent } from './management.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
// Dropdowns Component
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
import { ManagementCreateComponent } from './create/management-create.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }  from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';


const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows
};

@NgModule({ 
  imports: [
    CommonModule,
    ManagementRoutingModule,
    // DataTableModule,
    SelectModule,
    ModalModule,
    TabsModule,
    AngularFileUploaderModule,
    FormsModule,
    MatTableModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatTabsModule,
    MatIconModule,

    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig)
  ],
  declarations: [
    ManagementComponent,
    ManagementCreateComponent    
  ],
})
export class ManagementModule { }
