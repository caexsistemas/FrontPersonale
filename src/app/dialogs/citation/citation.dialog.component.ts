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
import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import { global } from "../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";

import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";

export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}
@Component({
  selector: "app-citation.dialog",
  templateUrl: "./citation.dialog.component.html",
  styleUrls: ["./citation.dialog.component.css"],
})
export class CitationDialog {
  // endpoint: string = "/reception";
  endpoint: string = "/citation";
  component = "/process/reception";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idCit: number = null;

  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  //loading: boolean = false;
  dataSource: any = [];
  RolInfo: any[];
  formLista: FormGroup;
  role: any = [];
  formCreate: FormGroup;
  citaTable: any = [];
  cantCit: any = [];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  historyMon: any = [];
  displayedColumns: any = [];

  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<CitationDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog
  ) {
    this.view = this.data.window;
    this.idCit = null;

    switch (this.view) {
      case "createCit":
        this.initFormsRole();
        this.title = "Crear Nueva Citación";
        this.citaTable = this.data.codigo[0];
        console.log(this.data);
        
        break;
      case "updateCit":
        this.initFormsRole();
        this.title = "Actualizar Citación";
        this.idCit = this.data.codigo;
        
        break;
      case "viewCit":
        this.idCit = this.data.codigo;
        this.title = "Información detallada";
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idCit, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.role = data.data[0];
              this.loading.emit(false);
            } else {
              this.handler.handlerError(data);
              this.closeDialog();
              this.loading.emit(false);
            }
          },
          (error) => {
            this.handler.showError("Se produjo un error");
            this.loading.emit(false);
          }
        );
        break;
        case "pdfCitation":
          console.log(this.data);
          this.cantCit = this.data.idPersonale;
          this.pdf(this.data.codigo, this.cantCit);
          dialogRef.close();  
        break;
    }
  }
  initFormsRole() {
    this.getDataInitCit();
    this.formCreate = new FormGroup({
      idPersonale: new FormControl(""),
      cas_id: new FormControl(""),
      cit_fec_hor: new FormControl(""),
      cit_fec_elab: new FormControl(""),
      cit_estado: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
      cla_id: new FormControl(""),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }
  sendRequest() {}

  getDataInitCit() {
    this.idCit = this.data.codigo;
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsViewCit",
      idCit: this.idCit,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.formCreate.get("idPersonale").setValue(data.data[0].idPersonale);
          this.formCreate.get("cas_id").setValue(data.data[0].cas_id);
          this.formCreate.get("cla_id").setValue(data.data[0].cla_id);

          if (this.view == "updateCit") {
            this.getDataUpdate();
          }
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  }

  getDataUpdate() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsUpdateCit",
      id: this.idCit,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          
          this.formCreate
            .get("idPersonale")
            .setValue(data.data["getSelecUpdat"][0].idPersonale);
          this.formCreate
            .get("cit_fec_hor")
            .setValue(data.data["getSelecUpdat"][0].cit_fec_hor);
          this.formCreate
            .get("cit_fec_elab")
            .setValue(data.data["getSelecUpdat"][0].cit_fec_elab);
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
          this.closeDialog();
        }
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSubmi() {
    if (this.formCreate.valid) {
      this.loading.emit(true);

      let body = {
        listas: this.formCreate.value,
      };
      console.log('form => ', body);
      
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }
  
  onSubmitUpdate() {
    if (this.formCreate.valid) {
      let body = {
        listas: this.formCreate.value,
      };
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint + "/" + this.idCit, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      );
    } else {
      this.handler.showError("Complete la información necesaria");
    }
  }
  pdf(id, cantidad) {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "pdf",
      id: id,
      cantidad: cantidad,
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
          this.loading.emit(false);
      // this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
          // this.loading = false;
        }
      },
      (error) => {
        console.log(error);
        this.handler.showError("Se produjo un error");
          this.loading.emit(false);
          // this.loading = false;
      }
    );
  }
}
