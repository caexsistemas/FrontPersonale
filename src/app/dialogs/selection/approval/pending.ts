import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
  } from "@angular/material/dialog";
  import {
    Component,
    Inject,
    Output,
    EventEmitter,
    ViewChildren,
    QueryList,
  } from "@angular/core";
  // import { WebApiService } from "../../services/web-api.service";
  import {
    FormGroup,
    FormControl,
    Validators,
    ValidatorFn,
    ValidationErrors,
  } from "@angular/forms";
  import { DateAdapter } from "@angular/material/core";
  import { HandlerAppService } from "../../../services/handler-app.service";
  import { environment } from "../../../../environments/environment";
  import { global } from "../../../services/global";
  import { MatTableDataSource } from "@angular/material/table";
  import { MatSort } from "@angular/material/sort";
  import { Observable } from "rxjs";
  import { NovedadesnominaServices } from "../../../services/novedadesnomina.service";
  import { DatePipe } from "@angular/common";
  import { WebApiService } from "../../../services/web-api.service";
  // import { ApprovalDialog } from "../approval/approval.dialog.component";
  interface Food {
    value: string;
    viewValue: string;
  }
  
  export interface PeriodicElement {
    currentm_user: string;
    date_move: string;
    type_move: string;
  }
  @Component({
    selector: 'app-pending.dialog',
    templateUrl: './pending.html',
    // styleUrls: ['./pending.css']
  })
  export class Pending {
    
  }