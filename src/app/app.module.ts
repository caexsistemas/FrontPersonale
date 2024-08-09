// import {HttpClientModule} from '@angular/common/http/http';
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";

import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";

import { FormArray, FormBuilder, FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http/http";
import { OnlynumberDirective } from "./Tools/onlynumber.directive";

import {
  ToasterModule,
  ToasterService,
} from "angular2-toaster/angular2-toaster";
import { AlertModule } from "ngx-bootstrap/alert";
import { ModalModule } from "ngx-bootstrap/modal";
// import { DataTableModule } from 'angular2-datatable';
// import {MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';

import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatBadgeModule } from "@angular/material/badge";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

import { AppComponent } from "./app.component";
import { DefaultLayoutComponent } from "./containers";

const APP_CONTAINERS = [DefaultLayoutComponent];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from "@coreui/angular";
import { AppRoutingModule } from "./app.routing";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";
import { ChartsModule } from "ng2-charts";
import { LoginComponent } from "./views/login/login.component";
import { AdministratorComponent } from "./views/administrator/administrator.component";
import { NovedadesnominaComponent } from "./views/novedadesnomina/novedadesnomina.component";
import { AngularFileUploaderModule } from "angular-file-uploader";
import { NgWizardModule } from "ng-wizard";
import { Routes, RouterModule } from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatExpansionModule } from "@angular/material/expansion";

import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
// DIALOG
import { UsersDialog } from "./dialogs/users/users.dialog.component";
import { ManagementDialog } from "./dialogs/management/management.dialog.component";
import { ListasDialog } from "./dialogs/lists/lists.dialog.component";
import { StateDialog } from "./dialogs/state/state.dialog.component";
import { IncapacidadesDialog } from "./dialogs/incapacidades/incapacidades.dialog.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { IngresoDialog } from "./dialogs/ingresonomi/ingreso.dialog.component";
import { NovedadesaludComponent } from "./views/novedadesalud/novedadesalud.component";
import { TemplateComponent } from "./template/template.component";
import { ProcessaludDialog } from "./dialogs/processalud/processalud.dialog.component";
import { ReportProcessaludComponent } from "./dialogs/reports/processalud/reports-processalud.component";
import { ReportIncaapacidadesComponent } from "./dialogs/reports/incapacidades/reports-incapacidades.component";
import { ReportIncapasinsopComponent } from "./dialogs/reports/incapasinsop/reports-incapasinsop.component";
import { ReportIngresoComponent } from "./dialogs/reports/ingreso/reports-ingreso.component";
import { CallcenterComponent } from "./views/callcenter/callcenter.component";
import { RqcalidadDialog } from "./dialogs/rqcalidad/rqcalidad.dialog.component";
import { RoleDialog } from "./dialogs/role/role.dialog.component";
import { ReportsRqcalidadComponent } from "./dialogs/reports/rqcalidad/reports-rqcalidad.component";
import { FeedbackDialog } from "./dialogs/feedback/feedback.dialog.component";
import { ReportsFeddBackComponent } from "./dialogs/reports/feedback/reports-feedback.component";
import { InventoryComponent } from "./views/inventory/InventoryComponent";
import { TechnologyDialog } from "./dialogs/technology/technology.dialog.component";
import { RqcalidadvmrpComponent } from "./dialogs/reportview/rqcalidadvmrp/rqcalidadvmrp.component";
import { AbsenteeismDialog } from "./dialogs/absenteeism/absenteeism.dialogs.component";
import { ReportsAbsenteeismComponent } from "./dialogs/reports/absenteeism/reports-absenteeism.component";
import { ReportsTechnologyComponent } from "./dialogs/reports/technology/reports-technology.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { SelectionComponent } from "./views/selection/selection.component";
import { RequisitionDialog } from "./dialogs/selection/requisition/requisition.dialog.component";
import { PendingDialog } from "./dialogs/selection/pending/pending.dialog.component";
import { VacantDialog } from "./dialogs/selection/vacant/vacant.dialog.component";
import { ApprovalDialog } from "./dialogs/selection/approval/approval.dialog.component";
import { MatRadioModule } from "@angular/material/radio";
import { DeclineDialog } from "./dialogs/selection/approval/decline.dialog.component";
import { Pending } from "./dialogs/selection/approval/pending";
import { TrainingComponent } from "./views/selection/training/training.component";
import { EntryDialog } from "./dialogs/selection/vacant/entry/entry.dialog.component";
import { TrainingDialog } from "./dialogs/selection/training/training.dialog.component";
import { AssignmentDialog } from "./dialogs/selection/assignment/assignment.dialog.component";
import { TrainerDataDialog } from "./dialogs/selection/assignment/trainer data/trainer.dialog.component";
import { HiringDialog } from "./dialogs/selection/hiring/hiring.dialog.component";
import { InspectionDialog } from "./dialogs/selection/training/inspection/inspection.dialog.component";
import { FormationDialog } from "./dialogs/selection/training/inspection/formation/formation.dialog.component";
import { OwnerDialog } from "./dialogs/technology/owner/owner.dialog.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { PreselectedDialog } from "./dialogs/selection/hiring/preselected/preselected.dialog.component";
import { SelfManagementComponent } from "./views/selfManagement/selfManagement.component";
import { HolidayDialog } from "./dialogs/holiday/holiday.dialog.component";
import { AcceptanceDialog } from "./dialogs/holiday/acceptance/acceptance.dialog.component";
import { LiquidationDialog } from "./dialogs/holiday/liquidation/liquidation.dialog.component";
import { AdvanceDialog } from "./dialogs/holiday/advance/advance.dialog.component";
import { CalendarDialog } from "./dialogs/calendar/calendar.dialog.component";
import { ReportsManagementComponent } from "./dialogs/reports/management/reports-management.component";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { CertificatesDialog } from "./dialogs/certificates/certificates.dialogs.component";
import { SuspendDialog } from "./dialogs/suspend/suspend.dialog.component";
import { ComisionDialog } from "./dialogs/comision/comision.dialog.component";
import { ReportsComisionComponent } from "./dialogs/reports/comision/reports-comision.component";
import { ReportsLiquidationComponent } from "./dialogs/reports/liquidation/reports-liquidation.component";
import { ReportsSuspendComponent } from "./dialogs/reports/suspend/reports-suspend.component";
import { SigComponent } from "./views/sig/sig.component";
import { SigDialog } from "./dialogs/sig/sig.dialog.component";
import { ReportsPersonaleComponent } from "./dialogs/reports/personale/reports-personale.component";
import { ReportsVacationComponent } from "./dialogs/reports/vacation/reports-vacation.component";
import { RetributionDialog } from "./dialogs/retribution/retribution.dialog.component";
import { ContactDialog } from "./dialogs/contact/contact.dialog.component";
import { CustomerDialog } from "./dialogs/customer/customer.dialog.component";
import { ReportsCustomerComponent } from "./dialogs/reports/customer/reports-customer.component";
import { FormalitiesDialog } from "./dialogs/formalities/formalities.dialog.component";
import { NotificationDialog } from "./dialogs/notification/notification.dialog.component";
import { ModuleDialog } from "./dialogs/module/module.dialog.component";
import { ApplicationsComponent } from "./views/applications/applications.component";
import { ApplicationDialog } from "./dialogs/application/application.dialog.component";
import { RequestDialog } from "./dialogs/request/request.dialog.component";
import { ReqDialog } from "./dialogs/req/req.dialog.component";
import { ReportsFormalitiesComponent } from "./dialogs/reports/formalities/reports-formalities.component";
import { LiquidationFormalitiesDialog } from "./dialogs/liquidationFormalities/liquidationFormalities.dialog.component";
import { ProcessComponent } from "./views/process/process.component";
import { DisciplinaryDialog } from "./dialogs/disciplinary/disciplinary.dialog.component";
import { MatStepperModule } from "@angular/material/stepper";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { UpdateApplicationsDialog } from "./dialogs/updateApplications/updateApplications.dialog.component";
import { ReceptionDialogComponent } from "./dialogs/reception/reception.dialog.component";
import { cargueBaseDialog } from "./dialogs/cargueBase/cargueBase.dialog.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CitationDialog } from "./dialogs/citation/citation.dialog.component";
import { ClarificationDialog } from "./dialogs/clarification/clarification.dialog.component";
import { PostponementDialog } from "./dialogs/postponement/postponement.dialog.component";
import { ConclusionDialog } from "./dialogs/conclusion/conclusion.dialog.component";
import { MatMenuModule } from "@angular/material/menu";
import { ReportsDisciplinaryComponent } from "./dialogs/reports/disciplinary/reports-disciplinary.component";
import { ReportsUserComponent } from "./dialogs/reports/user/reports-user.component";
import { MeetingDialog } from './dialogs/meeting/meeting.dialog.component';
import { BypassSeguroPipe } from "./services/bypass-seguro.pipe";
import { MatChipsModule } from "@angular/material/chips";
import { AssignmentViewDialog } from "./dialogs/selection/assignment-view/assignment-view.dialog.component";
import { ReportsAssignmentTrainerComponent } from "./dialogs/reports/assignment-trainer/reports-assignment-trainer.component";
import { LearningDialog } from "./dialogs/learning/learning.dialog.component";
import { ReportsMeetingComponent } from "./dialogs/reports/meeting/reports-meeting.component";
import { ReportsLearningComponent } from "./dialogs/reports/learning/reports-learning.component";
// import { SignaturePadModule } from 'angular2-signaturepad';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { ReportsLiquidationgeneralComponent } from "./dialogs/reports/liquidationgeneral/reports-liquidationgeneral.component";
import { Tools } from "./Tools/tools.page";
import { UploadDialog } from "./dialogs/selection/upload/upload.dialog.component";
import { UploadTrainingDialog } from "./dialogs/selection/upload-training/upload-training.dialog.component";
import { TrainingReportsComponent } from "./dialogs/reports/training/training-reports.component";
import { RefuteDialog } from "./dialogs/refute/refute.dialog.component";
import { BillingComponent } from "./views/billing/billing.component";
import { PrestacionServiciosRoutingModule } from './views/prestacionservicios/prestacion-servicios-routing.module';
import { PrestacionServiciosDialog } from "./dialogs/prestacionServicios/prestacionServicios.dialog.component";
import { GestionContratistasDialog } from './dialogs/gestion-contratistas/gestion-contratistas.dialog.component';
// import { UploadTrainingDialog } from "./dialogs/selection/upload-training/upload-training.dialog.component";
const routes: Routes = [];
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    // HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    ToasterModule.forRoot(),
    AlertModule.forRoot(),
    // DataTableModule,
    AngularFileUploaderModule,
    NgWizardModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatTableModule,
    ModalModule,
    MatExpansionModule,
    RouterModule.forRoot(routes),
    MatTabsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatCardModule,
    MatRadioModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatBadgeModule,
    MatStepperModule,
    ClipboardModule,
    MatTooltipModule,
    MatChipsModule,
    NgxMaterialTimepickerModule,
    PrestacionServiciosRoutingModule
    
    
    // NgxDocViewerModule
    
    // SignaturePadModule 
  ],
  declarations: [
    AppComponent,
    APP_CONTAINERS,
    LoginComponent,
    OnlynumberDirective,
    AdministratorComponent,
    UsersDialog,
    ManagementDialog,
    ListasDialog,
    StateDialog,
    IncapacidadesDialog,
    NovedadesnominaComponent,
    IngresoDialog,
    NovedadesaludComponent,
    TemplateComponent,
    ProcessaludDialog,
    ReportProcessaludComponent,
    ReportIncaapacidadesComponent,
    ReportIncapasinsopComponent,
    ReportIngresoComponent,
    CallcenterComponent,
    RqcalidadDialog,
    RoleDialog,
    ReportsRqcalidadComponent,
    FeedbackDialog,
    ReportsFeddBackComponent,
    RqcalidadvmrpComponent,
    AbsenteeismDialog,
    InventoryComponent,
    TechnologyDialog,
    ReportsTechnologyComponent,
    SelectionComponent,
    RequisitionDialog,
    PendingDialog,
    VacantDialog,
    ApprovalDialog,
    DeclineDialog,
    Pending,
    ReportsAbsenteeismComponent,
    EntryDialog,
    TrainingDialog,
    AssignmentDialog,
    TrainerDataDialog,
    ReportsAbsenteeismComponent,
    HiringDialog,
    InspectionDialog,
    FormationDialog,
    OwnerDialog,
    PreselectedDialog,
    SelfManagementComponent,
    HolidayDialog,
    AcceptanceDialog,
    LiquidationDialog,
    AdvanceDialog,
    ReportsManagementComponent,
    CertificatesDialog,
    SuspendDialog,
    CalendarDialog,
    ReportsManagementComponent,
    ComisionDialog,
    ReportsComisionComponent,
    ReportsLiquidationComponent,
    ReportsSuspendComponent,
    SigComponent,
    SigDialog,
    ReportsPersonaleComponent,
    ReportsVacationComponent,
    RetributionDialog,
    ContactDialog,
    CustomerDialog,
    ReportsCustomerComponent,
    FormalitiesDialog,
    NotificationDialog,
    ModuleDialog,
    ApplicationsComponent,
    ApplicationDialog,
    RequestDialog,
    ReqDialog,
    ReportsFormalitiesComponent,
    LiquidationFormalitiesDialog,
    ProcessComponent,
    DisciplinaryDialog,
    UpdateApplicationsDialog,
    ReceptionDialogComponent,
    cargueBaseDialog,
    CitationDialog,
    ClarificationDialog,
    PostponementDialog,
    ConclusionDialog,
    cargueBaseDialog,
    ReportsDisciplinaryComponent,
    ReportsUserComponent,
    MeetingDialog,
    BypassSeguroPipe,
    AssignmentViewDialog,
    ReportsAssignmentTrainerComponent,
    LearningDialog,
    ReportsMeetingComponent,
    ReportsLearningComponent,
    ReportsLiquidationgeneralComponent,
    UploadDialog,
    UploadTrainingDialog,
    TrainingReportsComponent,
    RefuteDialog,
    BillingComponent,
    PrestacionServiciosDialog,
    GestionContratistasDialog,
    // ReportsLearningComponent
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    Tools
    // SignatureService
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
