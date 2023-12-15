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
  ElementRef,
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
import { calculateDays } from "../../services/holiday.service";
import SignaturePad from 'signature_pad';


export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}
@Component({
  selector: "app-conclusion.dialog",
  templateUrl: "./conclusion.dialog.component.html",
  styleUrls: ["./conclusion.dialog.component.css"],
})
export class ConclusionDialog {
  endpoint: string = "/conclusion";
  endpointPdf: string = "/img";
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
  formImga: FormGroup;
  citaTable: any = [];
  fecSus: any = [];
  daySus: any = [];
  sundaySus: any = [];
  totaLfecHol: any = [];
  fec_fin: any = [];
  sumTotalMen: any = [];
  monthAll: any = [];
  totalSunday: any = [];
  typeSuspen: any = [];
  count: number = 0;
  sundayDesc: any = [];
  respec_jornad: any = [];
  respec_mate: any = [];
  respec_rela: any = [];
  respec_orde: any = [];
  contraHones: any = [];
  respect_acti: any = [];
  concer_ord: any = [];
  conclu_fin: any = [];
  falt: any = [];
  nuevoArchivo: any = [];
  soporte: boolean;

  selection: any = [];
  cantCit: any = [];
  imagenUrl: any = [];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  // @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @Output() firmaCompleta = new EventEmitter<string>();
  firmaData: string = '';
  // @ViewChild('firmaImagen') firmaImagen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  signaturePad: SignaturePad;
  base64Image: string = '';

  historyMon: any = [];
  displayedColumns: any = [];

  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<ConclusionDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private holiday: calculateDays
  ) {
    this.view = this.data.window;
    this.idCit = null;

    switch (this.view) {
      case "createAc":
        this.initFormsRole();
        this.title = "Crear Nueva Citación";
        this.citaTable = this.data.codigo[0];

        break;
      case "updateConc":
        this.initFormsRole();

        this.title = "Conclusion Final";
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
        case "pdfConclusion":
          this.cantCit = this.data.idPersonale;          
          this.pdf(this.data.codigo, this.cantCit);
          // this.pdf(this.data.codigo);
          dialogRef.close();  
        break;
        case "firma_pdf":
          this.forImg();
          this.title = "Firmar PDF";
        break;
    }
  }
  initFormsRole() {
    this.getDataInitAc();
    // this.citaTable = this.data.codigo[0];
    this.formCreate = new FormGroup({
      con_fec_ela: new FormControl(""),
      con_fec_di: new FormControl(""),
      con_final: new FormControl(""),
      con_fal: new FormControl(""),
      con_day: new FormControl(""),
      con_fec_ini: new FormControl(""),
      con_fec_rei: new FormControl(""),
      con_descrip: new FormControl(""),
      file_sp: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
  }
  forImg(){
    this.formImga = new FormGroup({
      firma_pdf: new FormControl(""),
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
    // this.idCit = this.data.codigo;
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      // idCit: this.idCit,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.respec_jornad = data.data["respec_jornad"];
          this.respec_mate = data.data["respec_mate"];
          this.respec_rela = data.data["respec_rela"];
          this.respec_orde = data.data["respec_orde"];
          this.contraHones = data.data["contraHones"];
          this.respect_acti = data.data["respect_acti"];
          this.concer_ord = data.data["concer_ord"];
          this.conclu_fin = data.data["conclu_fin"];
          this.falt = this.respec_jornad.concat(
            this.respec_mate,
            this.respec_rela,
            this.respec_orde,
            this.contraHones,
            this.respect_acti,
            this.concer_ord
          );
          if (this.view == "updateConc") {
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
      action: "getParamsUpdateConc",
      id: this.idCit,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          // this.formCreate
          //   .get("idPersonale")
          //   .setValue(data.data["getSelecUpdat"][0].idPersonale);
          this.formCreate
            .get("con_fec_ela")
            .setValue(data.data["getSelecUpdat"][0].con_fec_ela);
          this.formCreate
            .get("con_fec_di")
            .setValue(data.data["getSelecUpdat"][0].con_fec_di);
          this.formCreate
            .get("con_final")
            .setValue(data.data["getSelecUpdat"][0].con_final);
          this.formCreate
            .get("con_fal")
            .setValue(data.data["getSelecUpdat"][0].con_fal);
          this.formCreate
            .get("con_fec_ini")
            .setValue(data.data["getSelecUpdat"][0].con_fec_ini);
          this.formCreate
            .get("con_day")
            .setValue(data.data["getSelecUpdat"][0].con_day);
          this.formCreate
            .get("con_fec_rei")
            .setValue(data.data["getSelecUpdat"][0].con_fec_rei);
          this.formCreate.get("con_descrip").setValue(data.data["getSelecUpdat"][0].con_descrip);
          if (!data.data["getSelecUpdat"][0].file_sp) {
            this.soporte = false;
          } else {
            this.soporte = true;
            this.selection.file_sp = JSON.parse(
              data.data["getSelecUpdat"][0].file_sp
            );
          }

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
      

      this.WebApiService.putRequest(this.endpoint + "/" + this.idCit, body, {
        action: "updaConclusion",
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
  suspendFech(event) {
    this.fecSus = event;
    this.holiday.holiday(this.fecSus, this.daySus);
  }

  calculate(event) {
    if (event) {
      this.daySus = event;
      this.holiday.holiday(this.fecSus, this.daySus);
      this.totaLfecHol = this.holiday.holiday(this.fecSus, this.daySus);

      this.fec_fin = this.totaLfecHol[0];
      this.sumTotalMen = this.totaLfecHol[1];
      this.sundaySus = this.totaLfecHol[2];
      if (this.sundaySus.length >= 2) {
        this.count = this.sundaySus.length++;

        // this.formSelec.get('sus_dom').setValue(this.sundaySus);
        // this.formSelec.get('tot_dom').setValue(this.count);

        this.sundaySus.forEach((element) => {
          var sunday = new Date(element);
          var sundayFormt = `${sunday.getDate()}-${
            sunday.getMonth() + 1
          }-${sunday.getFullYear()}`;
          this.sundayDesc.push(sundayFormt);
          //----------
          // this.formCreate.get('sus_dom').setValue(this.sundayDesc);
          // this.formCreate.get('tot_dom').setValue(this.count);
          //---------

          // this.data[index][10] =this.sun[0].concat(this.sun[1]);
          // this.data[index][10] =this.sundayDesc[0].concat(',').concat(' ').concat(this.sundayDesc[1]);
          // this.data[index][11] = this.count;
        });
      } else {
        this.count = this.sundaySus.length++;
        // var sunday = new Date(this.sundaySus);
        // var sundayFormt = `${sunday.getDate()}-${sunday.getMonth() + 1}-${sunday.getFullYear()}`;
        // this.sundayDesc = sundayFormt;

        //pendiente ----
        // this.formCreate.get('sus_dom').setValue(this.sundaySus);
        // this.formCreate.get('tot_dom').setValue(this.count);
        //--------------

        // this.data[index][10] =this.sundayDesc;
        // this.data[index][11] = this.count;
      }
      this.sundaySus.forEach((element) => {
        const data = new Date(element);

        this.formatDate(data);
      });
      // var arrFecha = this.sundaySus.split('-');
      // var fecha = new Date(arrFecha[0], arrFecha[1] - 1, arrFecha[2]);

      // this.formCreate.get("fec_fin").setValue(this.fec_fin);
      this.formCreate.get("con_fec_rei").setValue(this.sumTotalMen);
    }
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    this.totalSunday = `${year}-${month}-${day}`;
  }
  checkUp: boolean;
  suspen: boolean;
  upload(event) {
    if (event === "124/3") {
      this.checkUp = true;
    } else {
      this.checkUp = false;
    }
    if (event === "124/12" || event === "124/13") {
      this.suspen = true;
    } else {
      this.suspen = false;
    }
  }
  seleccionarArchivo(event) {
    // console.log(event);
    
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

  ngAfterViewInit() {
    this.initializeSignaturePad();
  }
  initializeSignaturePad() {

    if (this.canvas && this.canvas.nativeElement) {
      const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
      
      this.signaturePad = new SignaturePad(canvasElement);
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }
  

  resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;

    canvasElement.width = canvasElement.offsetWidth * ratio;
    canvasElement.height = canvasElement.offsetHeight * ratio;
    canvasElement.getContext("2d").scale(ratio, ratio);

    this.signaturePad.clear();
  }

  guardarYFinalizar() {
    const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
    const image = canvasElement.toDataURL();
    this.base64Image = image;

    this.convertirBase64AImagen(this.base64Image);

  }
  convertirBase64AImagen(base64Data: string): void {
    
    const [header, encodedData] = base64Data.split(',');
    
    this.idCit = this.data.codigo;
    const nombreArchivoConExtension = this.cuser.idPersonale + '.png';

    var archivos = [];
    var archivo = {
      nombreArchivo: nombreArchivoConExtension,
      base64textString: (encodedData.toString()),
    };
    archivos.push(archivo);

    this.nuevoArchivo = archivos;
    this.loading.emit(true);
      let body = {
        incapacidades: this.formImga.value,
        archivoRes: this.nuevoArchivo,
      };
      
      this.WebApiService.putRequest(this.endpoint + "/" + this.idCit, body, {
        action: "imgFirma",
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
      
  }
 
}
