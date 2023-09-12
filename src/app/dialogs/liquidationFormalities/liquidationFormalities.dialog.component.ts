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
// import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  RequiredValidator,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import { global } from "../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../services/web-api.service";
import { element } from "protractor";
import { threadId } from "worker_threads";
import * as moment from "moment";
interface Food {
  value: string;
  viewValue: string;
}

export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}
@Component({
  selector: "app-LiquidationFormalitiesDialog.Component",
  templateUrl: "./LiquidationFormalities.Dialog.Component.html",
  styleUrls: ["./LiquidationFormalities.Dialog.Component.css"],
})
export class LiquidationFormalitiesDialog {
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  formSelec: FormGroup;
  permissions: any = null;
  // component = "/management/formalities";
  component = "/management/liquidation";
  dataSource: any = [];
  endpoint: string = "/liquidation";
  idSig: number = null;
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: boolean = false;
  displayedColumns: any = [];
  selection: any = [];

  PersonaleInfo: any = [];
  area: any = [];
  idPosition: any = [];
  afirm: any = [];
  afirm_fin: any = [];
  rol: any = [];
  processAct: any[];
  status: boolean = false;
  fec_block: boolean = false;
  user_sesion: any = [];
  jef_inm: any = [];
  check_proc: boolean = false;
  motivoRenuncia: any = [];
  idUser: any = [];
  selectedUserId: number | null = null;
  allForm: any = [];
  nuevoArchivo: any = [];
  caract: boolean;

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<LiquidationFormalitiesDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices,
    private fb: FormBuilder,
    private tc: FormBuilder
  ) {
    this.view = this.data.window;
    this.idSig = null;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Crear Paz y salvo";
        break;
      case "update":
        this.rol = this.cuser.role;

        this.idSig = this.data.codigo;
        this.initForms();
        this.title = "Actualizar Reporte Paz y salvo";
        break;
      case "view":
        this.rol = this.cuser.role;
        this.idSig = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idSig, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              if (!this.selection.file_sp) {
                this.caract = false;
              } else {
                this.caract = true;
                this.selection.file_sp = JSON.parse(this.selection.file_sp);
              }
              this.jef_inm = data.data["getSelectData"][0].immediateBoss;

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
  initForms() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      document: new FormControl("", [Validators.required]),
      idPersonale: new FormControl("", [Validators.required]),
      fec_ret: new FormControl("", [Validators.required]),
      reason: new FormControl(""),
      idPosition: new FormControl("", [Validators.required]),
      pro_res: new FormControl("", [Validators.required]),
      immediateBoss: new FormControl("", [Validators.required]),
      file_sp: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
  }
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
          this.PersonaleInfo = data.data["getDataPersonale"];
          this.area = data.data["getArea"];
          this.idPosition = data.data["getPosition"];
          this.motivoRenuncia = data.data["motivoRenuncia"];
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
  onSubmi() {
    if (this.formSelec.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.formSelec.value,
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
      this.formSelec.get("idPersonale").setValue(exitsPersonal.idPersonale);
      this.formSelec
        .get("immediateBoss")
        .setValue(exitsPersonal.jef_idPersonale);
      this.formSelec.get("pro_res").setValue(exitsPersonal.idArea);
      this.formSelec.get("idPosition").setValue(exitsPersonal.idPosition);
      exitsPersonal.status == "13/1"
        ? (this.status = true)
        : (this.status = false);

      if (exitsPersonal.status == "13/2") {
        const fec_format = moment(exitsPersonal.withdrawalDate, "DD/MM/YYYY");
        const fec_real = fec_format.format("YYYY-MM-DD");
        this.formSelec.get("fec_ret").setValue(fec_real);
        this.fec_block = true;
      } else {
        this.formSelec.get("fec_ret").setValue("");
        this.fec_block = false;
      }
    }
  }

  onSelectionJFChange(event) {
    let exitsPersonal = this.PersonaleInfo.find(
      (element) => element.document == event
    );
    if (exitsPersonal) {
      this.formSelec.get("directboss_nc").setValue(exitsPersonal.idPersonale);
    }
  }
  getDataUpdate() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSet",
      id: this.idSig,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        this.formSelec
          .get("idPersonale")
          .setValue(data.data["getPersonGuia"][0].idPersonale);
        this.formSelec
          .get("document")
          .setValue(data.data["getPersonGuia"][0].document);
        if (data.data["getPersonGuia"][0].fec_ret) {
          const fec_format = moment(
            data.data["getPersonGuia"][0].fec_ret,
            "DD/MM/YYYY"
          );
          const fec_real = fec_format.format("YYYY-MM-DD");
          this.formSelec.get("fec_ret").setValue(fec_real);
        }
        this.formSelec
          .get("idPosition")
          .setValue(data.data["getPersonGuia"][0].idPosition);
        this.formSelec
          .get("pro_res")
          .setValue(data.data["getPersonGuia"][0].pro_res);
        this.formSelec
          .get("immediateBoss")
          .setValue(data.data["getPersonGuia"][0].immediateBoss);
        this.user_sesion = this.cuser.idPersonale;
        this.processAct = data.data["getPersonGuia"][0].area;
        this.jef_inm = data.data["getPersonGuia"][0].immediateBoss;
        this.user_sesion == this.jef_inm || this.rol == 1 || this.rol == 5
          ? (this.check_proc = true)
          : (this.check_proc = false);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }

  onSubmitUpdate() {
    if (this.formSelec.valid) {
      // if( this.formIncapad.value.fechainicausen <= this.formIncapad.value.fechafinausen){
      this.loading.emit(true);
      let body = {
        incapacidades: this.formSelec.value,
        archivoRes: this.nuevoArchivo,
      };
      this.WebApiService.putRequest(this.endpoint + "/" + this.idSig, body, {
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

  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
  closeDialog() {
    this.dialogRef.close();
  }
  ngOnInit() {}
  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }
  // mat:boolean= false;
  mat = RequiredValidator;
  // onSelectMat(e){
  //   this.mat = e

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
      console.log(this.nuevoArchivo); // Aquí puedes hacer lo que necesites con el arreglo de archivos
    };

    leerArchivosSecuencialmente();
  }

  _handleReaderLoaded(readerEvent) {
    var binaryString = readerEvent.target.result;
    this.archivo.base64textString = btoa(binaryString);
  }
}
