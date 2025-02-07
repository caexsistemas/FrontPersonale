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
// import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { RequisitionDialog } from "../../../dialogs/selection/requisition/requisition.dialog.component";
import { HolidayDialog } from "../../../dialogs/holiday/holiday.dialog.component";
import { AcceptanceDialog } from "../../../dialogs/holiday/acceptance/acceptance.dialog.component";
import * as moment from "moment";

@Component({
  selector: 'app-acceptance',
  templateUrl: './acceptance.component.html',
  styleUrls: ['./acceptance.component.css']
})
export class AcceptanceComponent implements OnInit {

  contenTable: any = [];
  // contenTableVacation: any = [];
  loading: boolean = false;
  endpoint: string = "/acceptance";
  permissions: any = null;
  displayedColumns: any = [];
  // displayedColumnsVacation: any = [];
  // displayedColumnsPrueba: any = [];
  dataSource: any = [];
  // dataSourceVacation: any = [];
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

  component = "/selfManagement/acceptance";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }


  ngOnInit():void {
    this.sendRequest();
    // this.sendRequestVacation();

    this.permissions = this.handler.permissionsApp;

  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getAcceptanceAll",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale:this.cuser.idPersonale,

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        // console.log(this.permissions);
        // console.log(data.success);

        if (data.success == true) {

          this.generateTable(data.data["getSelecUpdat"]);
          this.contenTable = data.data["getSelecUpdat"];

          this.contenTable.forEach(element => {

            if(element.fec_rei == null || element.fec_fin == null){
              element.fec_rei = 'No Aplica';
              element.fec_fin = 'No Aplica';
            }else{
              const newDateFin = moment(element.fec_rei);
              const newDateRei = moment(element.fec_fin);
              element.fec_rei = newDateFin.format("MMM D, YYYY");   
              element.fec_fin = newDateRei.format("MMM D, YYYY");   
            }            
          });
         
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
      "fec_rad",
      "document",
      "idPersonale",
      "fec_ini",
      "day_vac",
      "day_com",
      "tot_day",
      "day_adv",
      "fec_fin",
      "fec_rei",
      "state",
      "sta_liq",
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
        dialogRef = this.dialog.open(AcceptanceDialog,{
          data: {
            window: 'create',
            codigo,
            id:id
            // tipoMat: tipoMat
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
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(AcceptanceDialog,{
          data: {
            window: 'update',
            codigo,
            id:id,
            
            // tipoMat: tipoMat

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
        dialogRef = this.dialog.open(AcceptanceDialog,{
          data: {
            window: 'view',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe(result => {
         
        });
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

