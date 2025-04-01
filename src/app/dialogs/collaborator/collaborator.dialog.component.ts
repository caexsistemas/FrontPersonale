import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { global } from '../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { empty, Observable } from 'rxjs';
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';
import { DatePipe } from '@angular/common'
import { exists } from 'fs';
import {MatSnackBar} from '@angular/material/snack-bar';
import { calculateDays } from '../../services/holiday.service';


export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-Collaborator',
  templateUrl: './Collaborator.dialog.component.html',
  styleUrls: ['./Collaborator.dialog.component.css']
})


export class CollaboratorDialog 
{
  endpoint:      string = "/collaborators-permission";
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formColl:      FormGroup;
    permissions: any = null;
    component = "/management/collaborators-permission";
    dataSource: any=[];
    PersonaleInfo: any = [];
    collaborator: any = [];
    feed: any= [];
    idCol: number = null;
    retro: boolean = false;
    Position:      any = [];
    selectedFile:  File = null;
    tipInter: string = "";
    fechInicInc: string = "";
    public today: number = Date.now();//+
    formFeed: FormGroup;
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    typePermis:    any = [];
    statePermis: any = [];
    dataNovNi: any = []; 
    feedInfo: any=[];
    tipMatriz:        string = "";
    rol: number;
    tipRole : string = "";
    //History
    historyMon: any = [];
    check : 0;
    displayedColumns:any  = [];
    checked = false;
    disabled = false;
    block: boolean;
    exit: any = [];
    stateSign: any = [];
    acept: any = [];
    minDate: string;
    timePermis: any = [];
    fec_ini: any = [];
    dayPer: any = [];
    final: any = [];
    CheckTrue:boolean = true;
    blockSuccess:  boolean = false;
    nuevoArchivo:any = [];

    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<CollaboratorDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    private holiday: calculateDays,
    
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices,
    private _snackBar: MatSnackBar
    
  ) { 
    this.view = this.data.window;
    this.idCol = null;
    this.rol = this.cuser.role;
    this.minDate = this.getCurrentDateTime();
  
    switch (this.view) {
        case 'create':
            this.tipInter = this.data.tipoMat;
            this.tipMatriz = this.data.tipoMat;
            this.tipRole = this.data.tipRole;
            this.initForms();
            this.title = "Solicitar Permiso";
        break;
        case 'update':
          this.tipInter = this.data.tipoMat;
          this.tipMatriz = this.data.tipoMat;

          if( this.rol == 23){
            this.retro = true;
            }
            this.initForms();
            this.title = "Autorizar Permiso";
            this.idCol = this.data.codigo;
          break;
          case "view":
            this.title ="Detalle de Solicitud";
            this.idCol = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(
              this.endpoint + "/" + this.idCol,
              {
                token: this.cuser.token,
                idUser: this.cuser.iduser,
                modulo: this.component
              }
            ).subscribe(
              (data) => {
                if (data.success == true) {
                 
                  this.collaborator = data.data[0];

                  this.generateTable(data.data['getDatHistory']);   
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

  closeDialog() {
    this.dialogRef.close();
  }

  initForms() {
    //Condicion PQ Calidad
    let matParm = this.cuser.matrizarp;
    if(this.tipMatriz != "" && this.tipMatriz != null){
      matParm = this.tipMatriz;
    }  

    this.getDataInit();
    this.formColl = new FormGroup({
        document: new FormControl(""),
        email: new FormControl(""),
        fec_ini: new FormControl(""),
        fec_fin: new FormControl(""),
        dayHour: new FormControl("", [Validators.required, Validators.min(1), Validators.max(15)]),
        timePermis: new FormControl(""),
        idPersonale: new FormControl(""),
        id_cargo: new FormControl(""),
        type_per: new FormControl("", [Validators.required]),
        description: new FormControl(""),
        immediateBoss: new FormControl(""),
        jef_cargo: new FormControl(""),
        state_sol: new FormControl(""),
        emailBoss: new FormControl(""),
        file_sp: new FormControl(""),
        create_User: new FormControl(this.cuser.iduser),
        
    });
}
generateTable(data){
  this.displayedColumns = [
    'currentm_user',
    'date_move',
    'type_move'  
  ];
  this.historyMon = data;
  this.clickedRows = new Set<PeriodicElement>();
}
getDataInit(){

  //Condicion PQ Calidad
  let matParm = this.cuser.matrizarp;
  if(this.tipMatriz != "" && this.tipMatriz != null){
    matParm = this.tipMatriz;
  }

  this.loading.emit(false);
  this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      matrizarp: matParm,
      tipRole: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
  })
  .subscribe(
     
      data => {
          if (data.success == true) {
              //DataInfo
              this.PersonaleInfo = data.data['getDataPersonale'];
              this.Position      = data.data['getPosition'];
              this.typePermis   = data.data['typePermis'];
              this.statePermis = data.data['statePermis'];
              this.timePermis = data.data['timePermis'];
              this.tipRole = data.data['tipRole'];

              if (this.view == 'update') {
                      this.getDataUpdate();
                  }
                      this.loading.emit(false);
          } else {
              this.handler.handlerError(data);
              this.loading.emit(false);
          }
      },
      error => {
          this.handler.showError('Se produjo un error');
          this.loading.emit(false);
      }
  );
}
onSubmit() {
  if (this.formColl.valid) {
      this.loading.emit(true);
      let body = {
          listas: this.formColl.value,
          archivoRes:  this.nuevoArchivo

      }
      this.handler.showLoadin("Guardando Solicitud", "Por favor espere...");
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      })
          .subscribe(
              data => {
                  if (data.success) {
                     this.handler.showSuccess(data.message);
                      this.reload.emit();
                      this.closeDialog();
                  } else {
                      this.handler.handlerError(data);
                      this.loading.emit(false);
                  }
              },
              error => {
                  this.handler.showError();
                  this.loading.emit(false);
              }
          )
  } else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
  }
}
onSelectionChange(event){
        
       
  let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
 

  if( exitsPersonal ){
    
      this.formColl.get('idPersonale').setValue(exitsPersonal.idPersonale);
      this.formColl.get('id_cargo').setValue(exitsPersonal.idPosition);
      this.formColl.get('email').setValue(exitsPersonal.businessEmail ?? exitsPersonal.email);
      this.formColl.get('immediateBoss').setValue(exitsPersonal.jef_idPersonale);
      this.formColl.get('emailBoss').setValue(exitsPersonal.jef_businessEmail);
      this.formColl.get('jef_cargo').setValue(exitsPersonal.jef_cargo);
     
  }        
}

getDataUpdate(){
  this.loading.emit(true);
  this.WebApiService.getRequest(this.endpoint, {
      action: 'getParamUpdateSet',
      id: this.idCol,
      tipMat: this.tipMatriz,
      tipRole:this.tipRole,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component

  })
  .subscribe(
      data => {

          this.formColl.get('document').setValue(data.data['getDataUpda'][0].document);
          this.formColl.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
          this.formColl.get('email').setValue(data.data['getDataUpda'][0].businessEmail ?? data.data['getDataUpda'][0].email);          
          this.formColl.get('fec_ini').setValue(data.data['getDataUpda'][0].fec_ini);
          this.formColl.get('fec_fin').setValue(data.data['getDataUpda'][0].fec_fin);
          this.formColl.get('id_cargo').setValue(data.data['getDataUpda'][0].id_cargo);
          this.formColl.get('type_per').setValue(data.data['getDataUpda'][0].type_per);
          this.formColl.get('description').setValue(data.data['getDataUpda'][0].description);          
          this.formColl.get('immediateBoss').setValue(data.data['getDataUpda'][0].immediateBoss);
          this.formColl.get('jef_cargo').setValue(data.data['getDataUpda'][0].jef_cargo);
          this.formColl.get('state_sol').setValue(data.data['getDataUpda'][0].state_sol);
          this.formColl.get('emailBoss').setValue(data.data['getDataUpda'][0].emailBoss);
          this.formColl.get('timePermis').setValue(data.data['getDataUpda'][0].timePermis);
          this.formColl.get('dayHour').setValue(data.data['getDataUpda'][0].dayHour);
             
      },
      error => {
          this.handler.showError();
          this.loading.emit(false);
      }
  );
}
onSubmitUpdate(){

  let body = {
      listas: this.formColl.value,  
       tipMat: this.tipMatriz,
       id: this.idCol
  }
  if (this.formColl.valid) {
    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+this.idCol,body,{
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
getWeekNr(event){

  //var currentdate  = new Date(event);
  var now = new Date(event),i=0,f,sem=(new Date(now.getFullYear(), 0,1).getDay()>0)?1:0;
  while( (f=new Date(now.getFullYear(), 0, ++i)) < now ){
    if(!f.getDay()){
      sem++;
    }
  }
  
}


 //Acording
 step = 0;

 setStep(index: number) {
   this.step = index;

   //Visualizacion Asesor
   if( this.view == 'update' && this.cuser.role == 23 && this.step == 1 ){
     this.formColl.get('checked1').setValue(true); 
   }else if( this.view == 'update' && this.cuser.role == 23 && this.step == 2 ){
    this.formColl.get('checked2').setValue(true); 
   }else if( this.view == 'update' && this.cuser.role == 23 && this.step == 3 ){
    this.formColl.get('checked3').setValue(true); 
   }
   
 }

 nextStep() {
   this.step++;
 }

 prevStep() {
   this.step--;
 }
 labelMatriz(event){
  this.tipMatriz = event;
}

SendDataonChange(event: any) {
  } 
  
  openSnackBar(e){
    this.formColl.value.sign = e; 

  }
  get blockForm(): boolean {
    return this.view === 'update';
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  onSelectPermission(dayhour) {

   if(this.view === 'create'){
    const timePermis = this.formColl.get('timePermis')?.value; 
  
    if (timePermis === '153/1') {
      this.blockSuccess = false;

      const selectedDateTime = this.formColl.get('fec_ini')?.value;       

      if (dayhour) {

        const fechaInicio = new Date(selectedDateTime); 
        const fechaFin = new Date(fechaInicio.getTime() + (dayhour * 60 * 60 * 1000)); 
        this.formColl.get('fec_fin')?.setValue(this.formatDateTime(fechaFin)); 
      }
    } else if (timePermis === '153/2') {
      const dayHour = this.formColl.get('dayHour')?.value; 

        if (dayhour > 15) {
          const errorMessage = `No puedes solicitar más de 15 días para permiso`;
          this.handler.showError(errorMessage);
          this.blockSuccess = true;
          // this.formSelec.get('num_days')?.setValue(this.maximunDays); 
          return;
        }else if(dayhour < 15){
          this.blockSuccess = false;
        }

        if(dayHour && !isNaN(dayHour)){

          this.fec_ini = this.formColl.get('fec_ini')?.value.split('T')[0];

          this.dayPer = dayhour;
          this.final = this.holiday.holiday(this.fec_ini, this.dayPer)

          const fechaConHora = `${this.final[0]}T23:59`;
          
          this.formColl.get('fec_fin')?.setValue(fechaConHora); 
        }
    }
  }
  }
  
  // Función para saltar el domingo y avanzar al lunes
skipSunday(date: Date): Date {
  const fecha = new Date(date); // Crear una copia de la fecha
  if (fecha.getDay() === 0) { // Si es domingo (getDay() devuelve 0 para domingo)
    fecha.setDate(fecha.getDate() + 1); // Avanzar un día (lunes)
  }
  return fecha;
}

  // Función para formatear una fecha en el formato YYYY-MM-DDTHH:MM
  formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  onHoliday(event){

    if(event && this.view === 'create'){
      this.formColl.get('dayHour').setValue("");
      this.formColl.get('fec_ini').setValue("");
      this.formColl.get('fec_fin').setValue("");
    }
   

  }
  onFecIniChange(event){
    (event) ? this.CheckTrue = false : this.CheckTrue = true;
    this.formColl.get('dayHour').setValue("");

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
}
