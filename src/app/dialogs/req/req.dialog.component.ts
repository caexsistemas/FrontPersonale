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

export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}

@Component({
  selector: "app-req.dialog",
  templateUrl: "./req.dialog.component.html",
  styleUrls: ["./req.dialog.component.css"],
})
export class ReqDialog {
  endpoint: string = "/req";
  // endpoint: string = "/rol";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idRol: number = null;

  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  //loading: boolean = false;
  component = "/applications/req";
  // component = "/admin/roles";
  dataSource: any = [];
  typeReq: any[];
  formLista: FormGroup;

  view_user: any = [];
  formRole: FormGroup;
  formCreate: FormGroup;
  formUpdate: FormGroup;
  formExcel: FormGroup;
  reqCamp: any = [];
  exitsPersonal: any = [];
  typeSolit: any = [];
  application: any = [];
  soliMot: any = [];
  position: any = [];
  check_user: boolean = false;
  check_cood: boolean = false;
  rol_user: any = [];
  state_sol: any = [];
  checkUs: boolean;
  title_us: any = [];
  state: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  selectedFile: File | null = null;
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
    public dialogRef: MatDialogRef<ReqDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog
  ) {
    this.view = this.data.window;
    this.idRol = null;

    switch (this.view) {
      case "create":
        this.initFormsRole();
        this.title = "Solicitud de usuarios";
        break;
      case "excel":
        this.UploadExcel();
        this.title = "Adjuntar excel";

        break;
      case "update":
        this.initFormsRole();
        this.title = "Actualizar Informacion";
        this.idRol = this.data.codigo;

        break;
      case "view":
        this.idRol = this.data.codigo;
        this.title = "Información detallada";
        this.title_us = "Persona para gestion";

        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idRol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.view_user = data.data[0];
              // this.view_user.us_document && this.view_user.us_idPersonale
              //   ? ((this.checkUs = true),
              //     (this.title_us = "Nombre y apellidos"))
              //   : ((this.checkUs = false),
              //     (this.title_us = "Persona que solicita gestion"));
              this.generateTable(data.data["getDatHistory"]);
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
    this.getDataInit();
    this.formCreate = new FormGroup({
      fec_rad: new FormControl(""),
      req_tip: new FormControl(""),
      req_tip_id: new FormControl(""),
      req_cam: new FormControl(""),
      req_mot: new FormControl(""),
      req_state: new FormControl(""),
      req_obs: new FormControl(""),
      req_updated_at: new FormControl(""),
      req_excel: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
  }
  UploadExcel() {
    this.getExcel();
    this.formExcel = new FormGroup({
      req_excel: new FormControl(""),
    });
  }
  getExcel() {
    this.loading.emit(false);
    // this.WebApiService.getRequest(this.endpoint, {
    //   action: "uploadExcel",
    //   token: this.cuser.token,
    //   idUser: this.cuser.iduser,
    //   modulo: this.component,
    // }).subscribe(
    // (data) => {
    //   if (data.success == true) {
    //DataInfo
    // this.typeReq = data.data["typeReq"];
    // this.reqCamp = data.data["reqCamp"];
    // this.soliMot = data.data["soliMot"];
    // this.position = data.data["idPosition"];
    // this.state_sol = data.data["state"];
    this.rol_user = this.cuser.role;
    // 23,14,21

    if (this.view == "update") {
      this.getDataUpdate();

      this.loading.emit(false);
    } else {
      this.handler.handlerError("error");
      this.loading.emit(false);
    }
    // },
    // (error) => {
    //   this.handler.showError("Se produjo un error");
    //   this.loading.emit(false);
    // }
    // );
  }

  closeDialog() {
    this.reload.emit();
    this.dialogRef.close();
  }
  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }
  sendRequest() {}

  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.typeReq = data.data["typeReq"];
          this.reqCamp = data.data["reqCamp"];
          this.soliMot = data.data["soliMot"];
          this.state = data.data["state"];
          // this.position = data.data["idPosition"];
          // this.state_sol = data.data["state"];
          this.rol_user = this.cuser.role;
          // 23,14,21

          if (this.view == "update") {
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
      action: "getParamsUpdateSub",
      id: this.idRol,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.formCreate
            .get("fec_rad")
            .setValue(data.data["getParamUpdate"][0].fec_rad);
          this.formCreate
            .get("req_tip")
            .setValue(data.data["getParamUpdate"][0].req_tip);
          this.formCreate
            .get("req_cam")
            .setValue(data.data["getParamUpdate"][0].req_cam);
          this.formCreate
            .get("req_mot")
            .setValue(data.data["getParamUpdate"][0].req_mot);
          this.formCreate
            .get("req_state")
            .setValue(data.data["getParamUpdate"][0].req_state);
          this.formCreate
            .get("req_updated_at")
            .setValue(data.data["getParamUpdate"][0].req_updated_at);
          this.formCreate
            .get("req_obs")
            .setValue(data.data["getParamUpdate"][0].req_obs);
          this.formCreate
            .get("req_tip_id")
            .setValue(data.data["getParamUpdate"][0].req_tip_id);

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

  onSubmitUpdate() {
    if (this.formCreate.valid) {
      // if( this.formIncapad.value.fechainicausen <= this.formIncapad.value.fechafinausen){
      this.loading.emit(true);
      let body = {
        incapacidades: this.formCreate.value,
        archivoRes: this.archivo,
      };
      this.WebApiService.putRequest(this.endpoint + "/" + this.idRol, body, {
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
      // }else {
      //     this.handler.showError('Por favor validar el rango de fechas');
      //     this.loading.emit(false);
      // }
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }

  onSubmit() {
    if (this.formCreate.valid) {
      // if( this.formIncapad.value.fechainicausen <= this.formIncapad.value.fechafinausen){
      this.loading.emit(true);
      let body = {
        incapacidades: this.formCreate.value,
        archivoRes: this.archivo,
      };
      this.handler.showLoadin("Guardando Registro", "Por favor espere...");
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
            //console.log('vbv');
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
            //console.log('yxy');
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
          //console.log('fhf');
        }
      );
      // }else {
      //     this.handler.showError('Por favor validar el rango de fechas');
      //     this.loading.emit(false);
      // }
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }
  // onSelectionChange(event) {
  //   let exitsPersonal = this.PersonaleInfo.find(
  //     (element) => element.document == event
  //   );

  //   if (exitsPersonal) {
  //     this.formCreate.get("us_idPersonale").setValue(exitsPersonal.idPersonale);
  //     // this.formCreate
  //     //   .get("immediateBoss")
  //     //   .setValue(exitsPersonal.jef_idPersonale);
  //     // this.formCreate.get("us_are_tra").setValue(this.exitsPersonal.idPosition);
  //   }
  // }
  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
  seleccionarArchivo(event) {
    var files = event.target.files;
    var file = files[0];
    this.archivo.nombreArchivo = file.name;

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
  // onFileSelected(event: any) {
  //   this.selectedFile = event.target.files[0];
  // }

  // uploadFile(event: Event) {
  //   event.preventDefault();

  //   if (!this.selectedFile) {
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("excelFile", this.selectedFile);
  //   this.WebApiService.uploadRequest()

  // }
}
