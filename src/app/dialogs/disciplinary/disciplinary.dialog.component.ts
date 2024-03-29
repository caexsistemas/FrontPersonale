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
  ViewChild,
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
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}

@Component({
  selector: "app-disciplinary.dialog",
  templateUrl: "./disciplinary.dialog.component.html",
  styleUrls: ["./disciplinary.dialog.component.css"],
})
export class DisciplinaryDialog {
  @ViewChild("stepper") stepper: MatStepper;
  endpoint: string = "/disciplinary";
  // endpoint: string = "/rol";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idRol: number = null;

  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  //loading: boolean = false;
  component = "/process/disciplinary";
  // component = "/admin/roles";
  dataSource: any = [];
  RolInfo: any[];
  formLista: FormGroup;

  selection: any = [];
  formRole: FormGroup;
  formCreate: FormGroup;
  formUpdate: FormGroup;
  PersonaleInfo: any = [];
  exitsPersonal: any = [];
  typeFalt: any = [];
  application: any = [];
  area: any = [];
  position: any = [];
  check_user: boolean = false;
  check_cood: boolean = false;
  rol_user: any = [];

  checkUs: boolean = false;
  title_us: any = [];
  nuevoArchivo: any = [];
  level: any = [];
  afirm: any = [];
  caract: boolean;
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  checkOther: boolean;
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
    public dialogRef: MatDialogRef<DisciplinaryDialog>,
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
        this.title = "Solicitud procesos disciplinarios";
        break;
      case "update":
        this.initFormsRole();
        this.title = "Actualizar Solicitud procesos disciplinarios";
        this.idRol = this.data.codigo;

        break;
      case "view":
        this.idRol = this.data.codigo;
        this.title = "Información detallada del proceso";
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idRol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              this.selection.dis_fal === "121/16"
                ? (this.checkUs = true)
                : (this.checkUs = false);

              if (!this.selection.file_sp || this.selection.file_sp === "[]") {
                this.caract = false;
              } else {
                this.caract = true;
                this.selection.file_sp = JSON.parse(this.selection.file_sp);
              }
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
      dis_doc: new FormControl(""),
      dis_idPersonale: new FormControl(""),
      dis_pos: new FormControl(),
      dis_doc_sol: new FormControl(this.cuser.username),
      dis_idp_sol: new FormControl(this.cuser.idPersonale),
      dis_po_sol: new FormControl(""),
      dis_fal: new FormControl(""),
      dis_oth_fal: new FormControl(""),
      dis_fal_des: new FormControl(""),
      dis_des_rel: new FormControl(""),
      dis_niv: new FormControl(""),
      dis_sop: new FormControl(""),
      file_sp: new FormControl(""),
      dis_con: new FormControl(""),
      dis_est: new FormControl(""),
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
          this.RolInfo = data.data["getDataRole"];
          this.PersonaleInfo = data.data["getDataPersonale"];
          this.area = data.data["idArea"];
          this.position = data.data["idPosition"];
          this.rol_user = this.cuser.role;
          // 23,14,21

          this.typeFalt = data.data["typeFal"];
          this.level = data.data["level"];
          this.afirm = data.data["afirm"];
          // this.typeFalt.forEach((element) => {
          //   console.log("****", element.ls_codvalue);afirm

          //   element.ls_codvalue = "121/16"
          //     ? (this.checkUs = true)
          //     : this.checkUs;
          // });

          // this.typeFalt === "121/16";

          // this.check_cood = true;

          this.exitsPersonal = this.PersonaleInfo.find(
            (element) => element.idPersonale == this.cuser.idPersonale
          );
          // this.formCreate.get("us_are_tra").setValue(this.exitsPersonal.idArea);
          this.formCreate
            .get("dis_po_sol")
            .setValue(this.exitsPersonal.idPosition);

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
          // this.formCreate
          //   .get("dis_fec")
          //   .setValue(data.data["getParamUpdate"][0].dis_fec);
          this.formCreate
            .get("dis_doc")
            .setValue(data.data["getParamUpdate"][0].dis_doc);
          this.formCreate
            .get("dis_idPersonale")
            .setValue(data.data["getParamUpdate"][0].dis_idPersonale);
          this.formCreate
            .get("dis_idp_sol")
            .setValue(data.data["getParamUpdate"][0].dis_idp_sol);
          this.formCreate
            .get("dis_pos")
            .setValue(data.data["getParamUpdate"][0].dis_pos);
          this.formCreate
            .get("dis_po_sol")
            .setValue(data.data["getParamUpdate"][0].dis_po_sol);
          this.formCreate
            .get("dis_fal")
            .setValue(data.data["getParamUpdate"][0].dis_fal);
          this.formCreate
            .get("dis_niv")
            .setValue(data.data["getParamUpdate"][0].dis_niv);
          this.formCreate
            .get("dis_oth_fal")
            .setValue(data.data["getParamUpdate"][0].dis_oth_fal);
          this.formCreate
            .get("dis_fal_des")
            .setValue(data.data["getParamUpdate"][0].descripcion_falta);
          this.formCreate
            .get("dis_des_rel")
            .setValue(data.data["getParamUpdate"][0].elementos_relev);
          this.formCreate
            .get("dis_sop")
            .setValue(data.data["getParamUpdate"][0].dis_sop);
          // this.formCreate
          //   .get("file_sp")
          //   .setValue(data.data["getParamUpdate"][0].file_sp);
          if (!data.data["getParamUpdate"][0].file_sp) {
            this.caract = false;
          } else {
            this.caract = true;
            this.selection.file_sp = JSON.parse(
              data.data["getParamUpdate"][0].file_sp
            );
          }

          // this.archivo.nombre = JSON.parse(
          //   data.data["getParamUpdate"][0].file_sp
          // );
          this.formCreate
            .get("dis_con")
            .setValue(data.data["getParamUpdate"][0].dis_con);

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
        archivoRes: this.nuevoArchivo,
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
      this.loading.emit(true);
      let body = {
        incapacidades: this.formCreate.value,
        archivoRes: this.nuevoArchivo,
      };

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
  onSelectionChange(event) {
    let exitsPersonal = this.PersonaleInfo.find(
      (element) => element.document == event
    );

    if (exitsPersonal) {
      this.formCreate
        .get("dis_idPersonale")
        .setValue(exitsPersonal.idPersonale);
      this.formCreate.get("dis_pos").setValue(exitsPersonal.idPosition);
      // this.formCreate
      //   .get("immediateBoss")
      //   .setValue(exitsPersonal.jef_idPersonale);
      // this.formCreate.get("us_are_tra").setValue(this.exitsPersonal.idPosition);
    }
  }
  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }

  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  nextStep1() {
    this.step++;
    // this.stepper.next();
  }
  nextStep() {
    // this.step++;
    this.stepper.next();
  }
  prevStep() {
    this.step--;
  }
  finish() {
    // Aquí puedes acceder a los valores de los campos dis_fal y dis_fal_des
    const disFalValue = this.formCreate.get("dis_fal").value;
    const disFalDesValue = this.formCreate.get("dis_fal_des").value;
  }
  onRadioChange(event) {
    event === "121/16" ? (this.checkUs = true) : (this.checkUs = false);
    // if (event === "121/16") {
    //   this.checkUs = true;
    //   this.checkOther = true;
    // } else {
    //   this.checkUs = false;
    //   this.checkOther = true;
    // }
  }
  onChangeAfirm(event) {
    event === "17/1" ? (this.check_cood = true) : (this.check_cood = false);
    if (this.view == "update" && event === "17/0") {
      this.caract = false;
      this.formCreate.get("file_sp").setValue("");
    } else {
      this.caract = true;
    }
  }
  isObsRequired(stateValue: string): boolean {
    return stateValue === "39/1" || stateValue === "39/3";
  }

  seleccionarArchivo(event) {
    var files = event.target.files;
    var archivos = [];

    // Función para leer archivos de manera secuencial con Promesas
    const leerArchivo = (file) => {
      return new Promise<void>((resolve) => {
        var reader = new FileReader();
        reader.onload = (readerEvent) => {
          var archivo = {
            nombreArchivo: file.name,
            base64textString: btoa(readerEvent.target.result.toString()),
          };
          archivos.push(archivo);
          resolve();
        };
        reader.readAsBinaryString(file);
      });
    };

    // Utilizar async/await para leer archivos secuencialmente
    const leerArchivosSecuencialmente = async () => {
      for (var i = 0; i < files.length; i++) {
        await leerArchivo(files[i]);
      }
      this.nuevoArchivo = archivos; // Actualizar el arreglo this.nuevoArchivo con los archivos leídos
    };

    leerArchivosSecuencialmente();
  }
}
