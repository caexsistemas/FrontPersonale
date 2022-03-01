import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncapasinsopComponent } from './incapasinsop.component';
import { IncapasinsopRoutingModule } from './incapasinsop-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
//import { DataTableModule } from 'angular2-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { MatInputModule }  from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectModule } from 'ng-select';
import { FormsModule } from '@angular/forms';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
// Dropdowns Component
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';




const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows
};

@NgModule({
  declarations: [IncapasinsopComponent],
  imports: [
    CommonModule,
    IncapasinsopRoutingModule,
    MatPaginatorModule,
    MatTableModule,
    //DataTableModule,
    ModalModule,
    TabsModule,
    MatInputModule,
    MatSortModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    SelectModule,
    FormsModule,
    AngularFileUploaderModule,
    MatBottomSheetModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    MatFormFieldModule

  ]
}) 
export class IncapasinsopModule { }
