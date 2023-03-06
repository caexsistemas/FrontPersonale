
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
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  RequiredValidator,
} from "@angular/forms";
import { HandlerAppService } from "../../services/handler-app.service";
import { global } from "../../services/global";
import { MatSort } from "@angular/material/sort";
import { WebApiService } from "../../services/web-api.service";
import { MatPaginator } from "@angular/material/paginator";
import { calculateDays } from "../../services/holiday.service";
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
  selector: 'app-suspend',
  templateUrl: './suspend.dialog.component.html',
  styleUrls: ['./suspend.dialog.component.css']
})
export class SuspendDialog  {

  endpoint: string = "/suspend";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  idsus: number = null;
  rol: number;
  component = "/nomi/suspend";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  displayedColumns: any = [];
  PersonaleInfo: any = [];
  suspend: any = [];
  getHoliday: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    public dialogRef: MatDialogRef<SuspendDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private holiday: calculateDays,
    ) {
    this.view = this.data.window;
    this.idsus = null;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Crear Supension";

      break;
      case "update":
        this.idsus = this.data.codigo;
        
        this.initForms();
        this.title = "Actualizar Suspension";
      break;
      case "view":
        this.idsus = this.data.codigo;
        this.title ="Información General"
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idsus, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.suspend = data.data["getSelectData"][0];
             
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
      month: new FormControl("", [Validators.required]),
      idPersonale: new FormControl(""),
      document: new FormControl("",[Validators.required]),
      fec_ini: new FormControl("",[Validators.required]),
      fec_fin: new FormControl("",[Validators.required]),
      fec_rei: new FormControl(""),
      day_sus: new FormControl(""),
      createUser: new FormControl(this.cuser.iduser),
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
          this.getHoliday = data.data["getHoliday"];

          
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
      id: this.idsus,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("month").setValue(data.data["getSelecUpdat"][0].month);
        this.formSelec.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        this.formSelec.get("fec_ini").setValue(data.data["getSelecUpdat"][0].fec_ini);
        this.formSelec.get("fec_fin").setValue(data.data["getSelecUpdat"][0].fec_fin);
        this.formSelec.get("day_sus").setValue(data.data["getSelecUpdat"][0].day_sus);
        this.formSelec.get("fec_rei").setValue(data.data["getSelecUpdat"][0].fec_rei);
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
      archivoRes: this.archivo
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idsus,body,{
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
    }        
  }
  seleccionarArchivo(event){
    var files = event.target.files;
    var file  = files[0];
    this.archivo.nombreArchivo = file.name;

    if(files && file){
        var reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file);
    }
}
_handleReaderLoaded(readerEvent){
  var binaryString = readerEvent.target.result;
  this.archivo.base64textString = btoa(binaryString);
}
getDocument(){
  return this.formSelec.get('document').invalid && this.formSelec.get('document').touched;
}
getFecIni(){
  return this.formSelec.get('fec_ini').invalid && this.formSelec.get('fec_ini').touched;
}
getMes(){
  return this.formSelec.get('month').invalid && this.formSelec.get('month').touched;
}

suspendFech(event){
console.log(event);
let fec = event
this.getHoliday;
console.log('********');
this.holiday.holiday(fec,5);

// console.log(this.holiday.holiday(fec,10 ));


}
}

  



