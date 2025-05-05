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
import { UserServices } from "../../../services/user.service";
import { ApplicationDialog } from "../../../dialogs/application/application.dialog.component";
import { Clipboard } from "@angular/cdk/clipboard";
import { UpdateApplicationsDialog } from "../../../dialogs/updateApplications/updateApplications.dialog.component";
import { environment } from "../../../../environments/environment";
@Component({
  selector: "app-update-aplications",
  templateUrl: "./update-aplications.component.html",
  styleUrls: ["./update-aplications.component.css"],
})
export class UpdateAplicationsComponent implements OnInit {
  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  ValorRol: any = [];
  public detailRoles = [];

  component = "/applications/update_applications";
  permissions: any = null;
  contaClick: number = 0;
  endpoint: string = "/updApp";
  contenTable: any = [];
  color_state: any = [];
  ifCheck: boolean;
  endpointup: string = "/applicationupload";
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  personaleData: any = [];
  datapersonale: any = [];
  modal: "successModal";

  public afuConfig = {
    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    maxSize: "20",
    uploadAPI: {
      url: this.url,
      method: "POST",
      headers: {
        Authorization: this._tools.getToken(),
      },
    },
    theme: "dragNDrop",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    replaceTexts: {
      selectFileBtn: "Seleccione Archivo",
      resetBtn: "Limpiar",
      uploadBtn: "Subir Archivo",
      attachPinBtn: "Sube información usuarios",
      hideProgressBar: false,
      afterUploadMsg_success: "",
      afterUploadMsg_error: "Fallo al momento de cargar el archivo!",
      sizeLimit: "Límite de tamaño",
    },
  };

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private clipboard: Clipboard
  ) {}

  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  @ViewChild("successModal", { static: false })
  public successModal: ModalDirective;

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getAplication",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      idPersonale: this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.permissions = this.handler.getPermissions(this.component);
          // this.generateTable(response.data);
          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
          // this.ValorRol = data.data
          this.loading = false;
        } else {
          this.loading = false;
          this.ValorRol = [];
          this.handler.handlerError(data);
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
      "us_red",
      "username",
      "idPersonale",
      "us_role",
      "campana",
      "updated_at",
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

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }
  showDetails(item) {
    this.detailRoles = item;
    this.infoModal.show();
  }
  option(action, codigo = null) {
    var dialogRef;
    switch (action) {
      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(UpdateApplicationsDialog, {
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
          this.sendRequest();
          // console.log("The dialog was closed");
          // console.log(result);
        });
        break;
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(UpdateApplicationsDialog, {
          data: {
            window: "create",
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
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(UpdateApplicationsDialog, {
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
    }
  }

  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }
  colorMap = {
    "115/1": "#CE9E08",
    "115/2": "#339CFF",
    "115/3": "#FF6202",
    "115/4": "#28C433",
    "115/5": "#CA342B",
  };

  colorState(state) {
    return this.colorMap[state] || ""; // Devuelve el color correspondiente o cadena vacía si no coincide
  }
  // openc(){
  //   if(this.contaClick == 0){
  //     this.sendRequest();
  //   }
  //   this.contaClick = this.contaClick + 1;
  // }
  // applyFilter(search) {
  //   this.dataSource.filter = search.trim().toLowerCase();
  // }
  // closeDialog() {
  //   this.dialogRef.close();
  //   this.reload.emit(true);

  //   }
  hidePassword(password: string): string {
    if (password) {
      this.ifCheck = true;

      return "*".repeat(password.length);
    } else {
      this.ifCheck = false;

      return "no hay contraseña asignada";
    }
  }
  copyPassword(password: string): void {
    if (password) {
      this.ifCheck = true;
      this.clipboard.copy(password);
    } else {
      this.ifCheck = false;
    }
  }

  getAllPersonal() {
    this.WebApiService.getRequest(this.endpoint, {
      action: "getAplication",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
    }).subscribe(
      (response) => {
        this.permissions = this.handler.getPermissions(this.component);

        if (response.success) {
          this.handler.showSuccess("El archivo se cargo exitosamente");
          this.personaleData = response.data;
          this.loading = false;
          this.successModal.hide();
          this.sendRequest();
        } else {
          this.datapersonale = [];
          this.handler.handlerError(response);
        }
      },
      (mistake) => {
        let msjErr = "Se presento problema al descargar el archivo";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
}
