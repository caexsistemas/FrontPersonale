
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
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  RequiredValidator,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../../services/handler-app.service";
import { environment } from "../../../../environments/environment";
import { global } from "../../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable, pipe } from "rxjs";
import { NovedadesnominaServices } from "../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../services/web-api.service";
import * as moment from "moment";
import { element } from "protractor";
import { exit } from "process";
import { MatPaginator } from "@angular/material/paginator";
import { isArray } from "util";
// import { element } from "protractor";
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
  selector: 'app-liquidation',
  templateUrl: './liquidation.dialog.component.html',
  styleUrls: ['./liquidation.dialog.component.css']
})
export class LiquidationDialog  {

  endpoint: string = "/liquidation";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  idHol: number = null;
  rol: number;
  component = "/selfManagement/liquidation";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  // check: 0;
  displayedColumns: any = [];
  PersonaleInfo: any = [];
  document: any = [];
  people: any = [];
  position: any = [];
  contenTable:   any = [];
  fec_in: any = [];
  days: any = [];
  stateLiq:any = [];
  checkAvd: boolean;
  checkSol: boolean;
  advance: any = [];
  totalSol: any = [];
  check: boolean;
  checkS: boolean;
  nuevoArchivo:any = [];
  rutasVisualizacion: any =[];
  caract: boolean;
  caractJson: boolean;
  element: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    public dialogRef: MatDialogRef<LiquidationDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idHol = null;

    switch (this.view) {
      case "create":
        this.initForms();
        this.document = this.data.codigo
        this.people = this.data.id
       


        this.title = "Solicitud de Vacaciones";
      break;
      case "update":
        this.idHol = this.data.codigo;
        this.initForms();
        this.title = "Liquidación Vacaciones";
      break;
      case "view":
        this.idHol = this.data.codigo;
        this.title ="Información General"
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idHol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelecUpdat"][0];

              if(!(this.selection.file_sp)){
                   this.caract = false;
                }else{
                    this.caract = true;
                    this.selection.file_sp = JSON.parse(this.selection.file_sp);
                }

              (this.selection.day_adv)? this.checkAvd = true: this.checkAvd = false;
              (this.selection.tot_day)? this.checkSol = true: this.checkSol = false;
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
  sendRequest() {
     this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSelection",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale:this.cuser.idPersonale,

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data.success);

        if (data.success == true) {

          this.contenTable = data.data["getSelectData"]['vac'];
          
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
  
  initForms() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      document: new FormControl(this.document),
      idPersonale: new FormControl(this.people),
      fec_ini: new FormControl(""),
      fec_fin: new FormControl(""),
      fec_rei: new FormControl(""),
      day_vac: new FormControl(""),
      state:new FormControl(""),
      day_adv: new FormControl(""),
      sta_liq: new FormControl("", [Validators.required]),
      file_sp: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
   
  }
  getDataInit() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      idHol: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.PersonaleInfo = data.data['getDataPersonale'];        
          this.position        = data.data["getPosition"];
          this.stateLiq = data.data["getStateLiq"];

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
  onSubmit() {
    if (this.formSelec.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.formSelec.value,
        
      };
      console.log('req=>',body);
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
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
  getDataUpdate() {

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSet",
      id: this.idHol,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        this.formSelec.get("fec_ini").setValue(data.data["getSelecUpdat"][0].fec_ini);
        this.formSelec.get("fec_fin").setValue(data.data["getSelecUpdat"][0].fec_fin);
        this.formSelec.get("fec_rei").setValue(data.data["getSelecUpdat"][0].fec_rei);
        this.formSelec.get("day_vac").setValue(data.data["getSelecUpdat"][0].day_vac);
        this.formSelec.get("day_adv").setValue(data.data["getSelecUpdat"][0].day_adv);
        this.formSelec.get("state").setValue(data.data["getSelecUpdat"][0].state);
        // this.formSelec.get("sta_liq").setValue(data.data["getSelecUpdat"][0].sta_liq);
        // this.archivo.nombre = data.data["getSelecUpdat"][0].file_sp;
        this.nuevoArchivo.nombre = data.data["getSelecUpdat"][0].file_sp;
        this.totalSol =(data.data["getSelecUpdat"][0].tot_day);
        this.advance = (data.data["getSelecUpdat"][0].day_adv);
        // console.log(this.advance);
        (this.totalSol)? this.checkS = true: this.checkS = false;
        (this.advance)? this.check = true: this.check = false;
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSubmitUpdate(){

    let body = {
      listas: this.formSelec.value,
      // archivoRes: this.archivo
      archivoRes:  this.nuevoArchivo
        //  id: this.idHol
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idHol,body,{
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      })
      .subscribe(
          data=>{
              if(data.success){
                  this.handler.showSuccess(data.message);
                  this.reload.emit();
                  this.closeDialog();
              }else{
                  this.handler.handlerError(data);
                  this.loading.emit(false);
              }
          },
          error=>{
            console.log(error);
              this.handler.showError(error);
              this.loading.emit(false);
          }
      );
    }else {
      this.handler.showError('Complete la informacion necesaria');
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
  onSelectionChange(event){
        
       
    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
    if( exitsPersonal ){
      
        this.formSelec.get('idPersonale').setValue(exitsPersonal.idPersonale);
        // this.formSelec.get('car_user').setValue(exitsPersonal.idArea);
       
    }        
  }
//   seleccionarArchivo(event){
//     // var files = event.target.files;
//     // var file  = files[0];
//     // console.log(file);
    
//     // this.archivo.nombreArchivo = file.name;

//     // if(files && file){
//     //     var reader = new FileReader();
//     //     reader.onload = this._handleReaderLoaded.bind(this);
//     //     reader.readAsBinaryString(file);
//     // }

//     var files = event.target.files;
//     var archivos = [];
//     for (var i = 0; i < files.length; i++) {
//         var file = files[i];
//         var archivo = {
//             nombreArchivo: file.name,
//             archivoData: null
//         };
//         archivos.push(archivo);

//         if (files && file) {
//             var reader = new FileReader();
//             reader.onload = (function(archivo) {
//                 return function(e) {
//                     archivo.archivoData = e.target.result;
//                 }
//             })(archivo);
//             reader.readAsBinaryString(file);
//         }
//     }
// }
// _handleReaderLoaded(readerEvent){
//   var binaryString = readerEvent.target.result;
//   this.archivo.base64textString = btoa(binaryString);
// }
// seleccionarArchivo(event){
//   var files = event.target.files;
//   // var archivos = [];
//   // this.nuevoArchivo
//   for (var i = 0; i < files.length; i++) {
//       var file = files[i];
//       // console.log(file);
      
//       // Crear un objeto para cada archivo seleccionado
//       var archivo = {
//           nombreArchivo: file.name,
//           base64textString: ''
//       };

//       // Leer el archivo como Blob usando FileReader
//       if(files && file){
//           var reader = new FileReader();
//           reader.onload = (readerEvent) => {
//               // Obtener el resultado como Blob
//               var blob = new Blob([readerEvent.target.result]);
//               var readerText = new FileReader();
//               readerText.onloadend = (readerTextEvent) => {
//                   // Obtener el resultado como cadena de texto
//                   archivo.base64textString = btoa(readerTextEvent.target.result.toString());
//                   this.nuevoArchivo.push(archivo); // Agregar el archivo al arreglo de archivos
//               };
//               readerText.readAsBinaryString(blob);
//           };
//           reader.readAsArrayBuffer(file);
//       }
//   }

//   // Aquí puedes hacer lo que necesites con el arreglo de archivos, por ejemplo, enviarlo al backend para su procesamiento
//   console.log(this.nuevoArchivo);
// }
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
          base64textString: btoa(readerEvent.target.result.toString())
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





_handleReaderLoaded(readerEvent, archivo){
  var binaryString = readerEvent.target.result;
  archivo.base64textString = btoa(binaryString);
}


getStateInvalid(){
  return this.formSelec.get('sta_liq').invalid && this.formSelec.get('sta_liq').touched;
}
}

  



