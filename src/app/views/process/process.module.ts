import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

import { TextMaskModule } from "angular2-text-mask";
import { SelectModule } from "ng-select";

// Components Routing
// import { InventoryRoutingModule } from './inventory-routing.module';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatFormFieldModule } from "@angular/material/form-field";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";

// Modal Component
import { ModalModule } from "ngx-bootstrap/modal";
import { DatafilterModule } from "../../Tools/pipe/datafilter.module";
import { MatInputModule } from "@angular/material/input";
import { NgWizardModule, NgWizardConfig, THEME } from "ng-wizard";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";

import { AngularFileUploaderModule } from "angular-file-uploader";
import { DisciplinaryComponent } from "./disciplinary/disciplinary.component";
import { ProcessRoutingModule } from "./process-routing.module";
import { ReceptionComponent } from "./reception/reception.component";

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows,
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    SelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    BsDropdownModule,
    TabsModule,
    ModalModule,
    DatafilterModule,
    MatInputModule,
    ProcessRoutingModule,
    MatBottomSheetModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    AngularFileUploaderModule,
  ],
  declarations: [DisciplinaryComponent, ReceptionComponent],
})
export class ProcessModule {}
