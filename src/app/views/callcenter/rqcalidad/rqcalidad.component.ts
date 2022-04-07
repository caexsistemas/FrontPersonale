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
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";

@Component({
  selector: "app-rqcalidad",
  templateUrl: "./rqcalidad.component.html",
  styleUrls: ["./rqcalidad.component.css"],
})
export class RqcalidadComponent implements OnInit {
  endpoint: string = "/rqcalidad";
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
  component = "/callcenter/rqcalidad";
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
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }

  sendRequest() {
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDataCalidad",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        if (data.success == true) {
          this.generateTable(data.data["getContData"]);
          this.contenTable = data.data["getContData"];
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        console.log(error);
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
    );
  }

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "monitoring_date",
      "login",
      "name",
      "coordinator",
      "campana",
      "tipo_gestion",
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

  option(action, codigo = null, tipoMat) {
    var dialogRef;
    switch (action) {
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(RqcalidadDialog, {
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
        dialogRef = this.dialog.open(RqcalidadDialog, {
          data: {
            window: "update",
            codigo,
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
        dialogRef = this.dialog.open(RqcalidadDialog, {
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
        dialogRef.afterClosed().subscribe((result) => {
          console.log("The dialog was closed");
          console.log(result);
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

  pdf(id) {
          console.log(id);
          //this.loading.emit(true);
          this.WebApiService.getRequest(this.endpoint, {
            action: "pdf",
            id: id,
          }).subscribe(
            (data) => {
              this.permissions = this.handler.getPermissions(this.component);
              console.log(data);
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
            (error) => {
                    console.log(error);
                    this.handler.showError("Se produjo un error");
                    this.loading = false;
            }
    );
  }
}
