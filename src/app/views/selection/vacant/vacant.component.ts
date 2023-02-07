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
import { PendingDialog } from "../../../dialogs/selection/pending/pending.dialog.component";
import { VacantDialog } from "../../../dialogs/selection/vacant/vacant.dialog.component";
import { RqcalidadvmrpComponent } from "../../../dialogs/reportview/rqcalidadvmrp/rqcalidadvmrp.component";
import { element } from "protractor";


@Component({
  selector: 'app-vacant',
  templateUrl: './vacant.component.html',
  styleUrls: ['./vacant.component.css']
})
export class VacantComponent implements OnInit {

 contenTable: any = [];
  loading: boolean = false;
  endpoint: string = "/vacant";
  permissions: any = null;
  displayedColumns: any = [];
  dataSource: any = [];
  contaClick: number = 0;
  idsel: any= [];
  num_vac: number;
  state: any = [];
  
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/selection/vacant";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }


  ngOnInit():void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
    console.log(this.permissions);

  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getVacantAll",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component
      // role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      // idPersonale:this.cuser.idPersonale

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data);

        if (data.success == true) {

          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
          this.state = data.data["getSelectData"]['state']
         this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
    );
  }
  generateTable(data) {
    this.displayedColumns = [
      // "view",
      "idsel",
      "fec_req",
      "car_sol",
      "matrizarp",
      "tip_req",
      "state",
      "est_for",
      "num_vac",
      // "swi_mod",
      // "ser_mod",
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

  option(action,codigo=null, id,matriz){
    var dialogRef;
    switch(action){
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(VacantDialog,{
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
        // dialogRef.afterClosed().subscribe((result) => {
        //   console.log("The dialog was closed");
        //   console.log(result);
        // });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
      break;
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(PendingDialog,{
          data: {
            window: 'update',
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

      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(VacantDialog,{
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
      case "repor1vmrq":
        this.loading = true;
        dialogRef = this.dialog.open(VacantDialog, {
          data: {
            window: "repor1vmrq",
            codigo,
            id: id,
            matriz

            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
        });
        break;
        
      }
    }
    
openc(){
  if(this.contaClick == 0){
    this.sendRequest();
  }    
  this.contaClick = this.contaClick + 1;
}
applyFilter(search) {
  this.dataSource.filter = search.trim().toLowerCase();
}
onTriggerSheetClick(){
  this.matBottomSheet.open(ReportsTechnologyComponent)
}

}



