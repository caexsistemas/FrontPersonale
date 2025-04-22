import {
  Component,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { Tools } from "../../../Tools/tools.page";
import { WebApiService } from "../../../services/web-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { HandlerAppService } from "../../../services/handler-app.service";
import { global } from "../../../services/global";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { RequisitionDialog } from "../../../dialogs/selection/requisition/requisition.dialog.component";
import { HolidayDialog } from "../../../dialogs/holiday/holiday.dialog.component";
import { AcceptanceDialog } from "../../../dialogs/holiday/acceptance/acceptance.dialog.component";
import { CalendarDialog } from "../../../dialogs/calendar/calendar.dialog.component";
import { ContactDialog } from "../../../dialogs/contact/contact.dialog.component";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contenTable: any = [];
  loading: boolean = false;
  endpoint: string = "/contact";
  permissions: any = null;
  displayedColumns: any = [];
  dataSource: any = [];
  contaClick: number = 0;
  name: any = [];
  username: any = [];
  days: any = [];
  fec_in: any = [];
  daysTo: any = [];
  daysRe: any = [];
  daysFor: any = [];
  total: any = [];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/admin/contact";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    // private matBottomSheet : MatBottomSheet
  ) { }


  ngOnInit():void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getContact",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      idPersonale:this.cuser.idPersonale,

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        // console.log(this.permissions);
        // console.log(data.success);

        if (data.success == true) {

          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
         
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (mistake) => {
        let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "user_usuario",
      "user_nombre",
      "user_ident",
      "user_rol",
      "user_camp",
      // "user_nred",
      "actions", 
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }
  option(action,codigo=null, id,){
    var dialogRef;
    switch(action){
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(ContactDialog, {
          data: {
            window: 'create',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(ContactDialog,{
          data: {
            window: 'update',
            codigo,
            id:id,
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
        break;

      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(ContactDialog,{
          data: {
            window: 'view',
            codigo,
            id:id
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
        // dialogRef.afterClosed().subscribe(result => {
         
        // });
      break;
      }
    }
  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }
}

