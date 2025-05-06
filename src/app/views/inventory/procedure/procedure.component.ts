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
import {
  MatDialog,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { TechnologyDialog } from "../../../dialogs/technology/technology.dialog.component";
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { ProcedureDialog } from "../../../dialogs/procedure/procedure.dialog.component";
import { EquipmentLoanDialog } from "../../../dialogs/equipment-loan/equipment-loan.dialog.component";
@Component({
  selector: "app-procedure",
  templateUrl: "./procedure.component.html",
  styleUrls: ["./procedure.component.css"],
})

export class ProcedureComponent implements OnInit {
  contenTable: any = [];
  contenTableUser: any = [];
  loading: boolean = false;
  endpoint: string = "/procedure";
  permissions: any = null;
  displayedColumns: any = [];
  displayedColumnsUser: any = [];
  dataSource: any = [];
  dataSourceEquip: any = [];
  contaClick: number = 0;
  name: any = [];
  area: any = [];
  getEquipment: any = [];
  displayedColumnsEquip: any = []; 

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/inventory/procedure";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getProcedure",
      idUser: this.cuser.iduser,
      idPersonale:this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        if (data.success == true) {
          this.generateTable(data.data["getDataAll"]);
          this.generateTableEquip(data.data["getEquipment"]);
          this.name = data.data['getPersonale'];
          
          this.contenTable = data.data["getDataAll"];
          this.getEquipment = data.data['getEquipment'];

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
      "fec_radi",
      "idPersonale",
      "sede",
      "ubicacion",
      "tipo_solicitud",
      "estado",
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

  generateTableEquip(data) {
    this.displayedColumnsEquip = [
      "view",
      "fec_radi",
      "idPersonale",
      "activo",
      "gestion_tec",
      "actions",
    ];
    this.dataSourceEquip = new MatTableDataSource(data);
    this.dataSourceEquip.sort = this.sort.toArray()[0];
    this.dataSourceEquip.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }


  option(action, codigo = null, id) {
    var dialogRef;
    switch (action) {
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(ProcedureDialog, {
          data: {
            window: "create",
            codigo,
            id: id,
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
        dialogRef = this.dialog.open(ProcedureDialog, {
          data: {
            window: "update",
            codigo,
            id: id,
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

      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(ProcedureDialog, {
          data: {
            window: "view",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {});
        break;
        case "loan":
        this.loading = true;
        dialogRef = this.dialog.open(EquipmentLoanDialog, {
          data: {
            window: "loan",
            codigo,
            id: id,
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
        case "update_loan":
        this.loading = true;
        dialogRef = this.dialog.open(EquipmentLoanDialog, {
          data: {
            window: "update_loan",
            codigo,
            id: id,
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
        case "return_loan":
          this.loading = true;
          dialogRef = this.dialog.open(EquipmentLoanDialog, {
            data: {
              window: "return_loan",
              codigo,
              id: id,
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
          case "view_loan":
          this.loading = true;
          dialogRef = this.dialog.open(EquipmentLoanDialog, {
            data: {
              window: "view_loan",
              codigo,
              id: id,
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
          case "accept_equipment":
          this.loading = true;
          dialogRef = this.dialog.open(EquipmentLoanDialog, {
            data: {
              window: "accept_equipment",
              codigo,
              id: id,
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

  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }
  applyFilterEq(search) {
    this.dataSourceEquip.filter = search.trim().toLowerCase();
  }
  onTriggerSheetClick(event: MouseEvent) {
    // console.log(event.target['id']);    
    this.matBottomSheet.open(ReportsTechnologyComponent);
  }

  

}
