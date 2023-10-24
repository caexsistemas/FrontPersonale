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
  selector: "app-clarification.dialog",
  templateUrl: "./clarification.dialog.component.html",
  styleUrls: ["./clarification.dialog.component.css"],
})
export class ClarificationDialog {
  endpoint: string = "/reception";
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
    public dialogRef: MatDialogRef<ClarificationDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog
  ) {
    this.view = this.data.window;
    this.idCit = null;

    switch (this.view) {
      case "createAcla":
        this.initFormsRole();
        this.title = "Crear Nueva aclaracion";
        this.citaTable = this.data.codigo[0];

        break;
      case "updateAcla":
        this.initFormsRole();

        this.title = "Editar Aclaración";
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
    }
  }
  initFormsRole() {
    this.getDataInitAc();
    // this.citaTable = this.data.codigo[0];
    this.formCreate = new FormGroup({
      idPersonale: new FormControl(""),
      dis_id: new FormControl(""),
      cit_id: new FormControl(""),
      cas_id: new FormControl(""),
      cla_fec_ref: new FormControl(""),
      cla_fec_pres: new FormControl(""),
      cla_description: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
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

  getDataInitAc() {
    this.idCit = this.data.codigo;
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsViewAc",
      idCit: this.idCit,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          // this.RolInfo = data.data["getDataRole"];

          this.formCreate.get("idPersonale").setValue(this.data.idPersonale);
          this.formCreate.get("cit_id").setValue(this.data.codigo);
          this.formCreate.get("dis_id").setValue(this.data.dis_id);
          if (this.view == "updateAcla") {
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
    this.idCit = this.data.codigo;
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsUpdateAcla",
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
            .get("dis_id")
            .setValue(data.data["getSelecUpdat"][0].dis_id);
          this.formCreate
            .get("cla_fec_ref")
            .setValue(data.data["getSelecUpdat"][0].cla_fec_ref);
          this.formCreate
            .get("cla_fec_pres")
            .setValue(data.data["getSelecUpdat"][0].cla_fec_pres);
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

      this.WebApiService.getRequest(this.endpoint, {
        action: "insertAcla",
        idvalist: this.idCit,
        fechref: this.data.fechref,
        forma: "" + JSON.stringify({ body }),
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
      this.WebApiService.getRequest(this.endpoint, {
        action: "updateAcla",
        idCit: this.idCit,
        forma: "" + JSON.stringify({ body }),
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
}
