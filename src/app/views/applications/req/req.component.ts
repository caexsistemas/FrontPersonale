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
import { RequestDialog } from "../../../dialogs/request/request.dialog.component";
import { ReqDialog } from "../../../dialogs/req/req.dialog.component";
import { environment } from "../../../../environments/environment";
// import { FileSystemFileEntry } from "ngx-file-drop";
@Component({
  selector: "app-req",
  templateUrl: "./req.component.html",
  styleUrls: ["./req.component.css"],
})
export class ReqComponent implements OnInit {
  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  ValorRol: any = [];
  public detailRoles = [];

  component = "/applications/req";
  permissions: any = null;
  contaClick: number = 0;
  endpoint: string = "/req";
  endpointup: string = "/requpload";
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  contenTable: any = [];
  personaleData: any = [];
  datapersonale: any = [];

  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  // @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild("successModal", { static: false })
  public successModal: ModalDirective;
  selectedFile: File | null = null;
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
      afterUploadMsg_success: "El archivo se cargo exitosamente !",
      afterUploadMsg_error: "Fallo al momento de cargar el archivo!",
      sizeLimit: "Límite de tamaño",
    },
  };
  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog
  ) {}

  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getAplication",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
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
      (error) => {
        this.loading = false;
        this.permissions = this.handler.getPermissions(this.component);
        this.handler.showError();
      }
    );
  }

  generateTable(data) {
    this.displayedColumns = [
      "view",
      "fec_rad",
      "req_tip",
      "req_tip_id",
      "req_cam",
      "req_mot",
      "req_updated_at",
      "req_state",
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
        dialogRef = this.dialog.open(ReqDialog, {
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
          console.log("The dialog was closed");
          console.log(result);
        });
        break;
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(ReqDialog, {
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
        dialogRef = this.dialog.open(ReqDialog, {
          data: {
            window: "update",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        this.sendRequest();

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
        });
        break;
      case "excel":
        // this.loading = true;
        dialogRef = this.dialog.open(ReqDialog, {
          data: {
            window: "excel",
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
    "119/1": "#FFD733",
    "119/2": "#339CFF",
    "119/3": "#28C433",
    "119/4": "#CA342B",
  };

  colorState(state) {
    return this.colorMap[state] || "";
  }

  getAllPersonal() {
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDatUpload",
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
      (error) => {
        this.loading = false;
        //this.permissions = this.handler.getPermissions(this.component);
        this.handler.showError();
      }
    );
  }

  seleccionarArchivo(event) {
    var files = event.target.files;
    var file = files[0];
    // this.archivo.nombreArchivo = file.name;

    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvent) {
    var binaryString = readerEvent.target.result;
    this.archivo.base64textString = btoa(binaryString);
  }

  Excel(id) {
    //this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "excel",
      id: id,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
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
      (error) => {
        console.log(error);
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
    );
  }
}
