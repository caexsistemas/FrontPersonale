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
import { MatPaginator } from "@angular/material/paginator";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CustomerDialog } from "../../../dialogs/customer/customer.dialog.component";
import { ReportsCustomerComponent } from "../../../dialogs/reports/customer/reports-customer.component";
import { PqrCallCenterDialog } from "../../../dialogs/pqrCallCenter/pqrCallCenter.dialog.component";
import { ReportsPqrCallCenterComponent } from "../../../dialogs/reports/pqrCallCenter/reports-pqrCallCenter.component";

@Component({
  selector: 'app-pqrCallcenter',
  templateUrl: './pqrCallcenter.component.html',
  styleUrls: ['./pqrCallcenter.component.css']
})
export class PqrCallcenterComponent implements OnInit {

  endpoint: string = "/pqr";
  id: number = null;
  permissions: any = null;
  contenTable: any = [];
  dataPdf: any = [];
  loading: boolean = false;
  displayedColumns: any = [];
  dataSource: any = [];
  public detaNovSal = [];
  contaClick: number = 0;
  //Control Permiso
  component = "/callcenter/pqr";
  //History
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // @Output() loading = new EventEmitter();
  // @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDataCustomer",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    }).subscribe(
      (data) => {
        
        if (data.success == true) {
          this.permissions = this.handler.getPermissions(this.component);
          this.generateTable(data.data["getContData"]);
          this.contenTable = data.data["getContData"];
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

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "document",
      "name",
      "phone",
      "creator",
      "matrizarp",
      "tipo_gestion",
      "fec_radi",
      "final_note",
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

  //Filtro Tabla
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  //Modales
  showDetails(item) {
    this.detaNovSal = item;
    this.infoModal.show();
  }

  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }

  onTriggerSheetClick(){
    this.matBottomSheet.open(ReportsPqrCallCenterComponent)
  }

  option(action, codigo = null, tipoMat) {
    var dialogRef;
    switch (action) {
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(PqrCallCenterDialog, {
          data: {
            window: "create",
            codigo,
            tipoMat: tipoMat
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

      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(PqrCallCenterDialog, {
          data: {
            window: "update",
            codigo,
            tipoMat: tipoMat
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

      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(PqrCallCenterDialog, {
          data: {
            window: "view",
            codigo
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {
          //console.log("The dialog was closed");
          //console.log(result);
        });
      break;

    }
  }

  pdf(id) {
    //console.log(id);
    //this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "pdf",
      id: id,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        //console.log(data);
        if (data.success == true) {
              
              const link = document.createElement("a");
              link.href = data.data.url;
              link.download = data.data.file;
              link.target = "_blank";
              link.click();
              this.handler.showSuccess(data.data.file);
              this.loading = false;
        } else {
                this.handler.handlerError(data);
                this.loading = false;
        }
      },
      (mistake) => {
        let msjErr = "Se presento problema al descargar el Pdf";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }

}
