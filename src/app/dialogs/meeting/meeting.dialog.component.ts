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
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BypassSeguroPipe } from "../../services/bypass-seguro.pipe";
// import * as mammoth from 'mammoth';
// var mammoth = require("mammoth");
import html2canvas from 'html2canvas';
import showdown from 'showdown';
import Swal from "sweetalert2";
// import { NgxDocViewerModule } from 'ngx-doc-viewer';

@Component({
  selector: 'app-meeting.dialog',
  templateUrl: './meeting.dialog.component.html',
  styleUrls: ['./meeting.dialog.component.css']
})
export class MeetingDialog {

  endpoint: string = "/meeting";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idMee: number = null;
  permissions: any = null;
  //loading: boolean = false;
  component = "/meeting/list-meeting";
  dataSource: any = [];
  RolInfo: any[];
  formLista: FormGroup;
  nuevoArchivo: any = [];
  meeting: any = [];
  formRole: FormGroup;
  formCreate: FormGroup;
  group: any = [];
  area: any = [];
  cargo: any = [];
  PersonaleInfo:any = [];
  checkArea:boolean = false;
  checkCargo: boolean = false;
  checkJef: boolean = false;
  checkPerson: boolean = false;
  checkbusinessLine:boolean = false;
  boss: any = [];
  area_posit: any = [];
  businessLine: any = [];
  idPositionLine: any = [];
  personInfoLine: any = [];
  selectIdPer: any = [];
  selection: any = [];
  areaLog: any = [];
  urlSafe: SafeResourceUrl;
  positionLog: any = [];

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  historyMon: any = [];
  displayedColumns: any = [];
  urlDocumentoWord: any = [];
  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<MeetingDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
  ) {
    this.view = this.data.window;
    this.idMee = null;

    switch (this.view) {
      case "create":
        this.initFormsRole();
        this.title = "Crear Nueva Capacitación";
        break;
      case "update":
        this.initFormsRole();
        this.title = "Editar Capacitaión";
        this.idMee = this.data.codigo;
        break;
      case "view":
        this.idMee = this.data.codigo;
        this.title = "Información detallada";
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idMee, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.meeting = data.data['getSelectData'][0];
              console.log('==> view',this.meeting);
              this.selection = data.data["getSelectData"][0];
              this.selection.file_sp = JSON.parse(this.selection.file_sp);
              // this.urlDocumentoWord  = this.sanitizer.bypassSecurityTrustResourceUrl(this.selection.file_sp);

              
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
      mee_name: new FormControl(""),
      file_sp: new FormControl(""),
      mee_fec_ini: new FormControl(""),
      mee_fec_fin: new FormControl(""),
      receiver: new FormControl(""),
      receiver2: new FormControl(""),
      receiver3: new FormControl(""),
      receiver4: new FormControl(""),
      receiver5: new FormControl(""),
      mee_desc: new FormControl(""),
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
          this.group =   data.data["group"];
          this.area =   data.data["idArea"];
          this.cargo =   data.data["idPosition"];
          // console.log('todos los cargos',this.cargo);
          
          this.PersonaleInfo = data.data["getDataPersonale"];
    // console.log('personal =>',this.PersonaleInfo);areaLog

          this.boss = data.data["getDataBoss"];
          this.area_posit = data.data["area_posit"];
          this.businessLine = data.data["businessLine"];
          this.idPositionLine = data.data["idPositionLine"];

          this.areaLog = data.data["areaLog"];
          this.positionLog = data.data["positionLog"];


        //  console.log(this.idPositionLine);


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
      action: "getParamsUpdate",
      idMee: this.idMee,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.area =   data.data["idArea"];
          this.cargo =   data.data["idPosition"];

          console.log('update => ',data.data["getParamUpdate"][0]);
          console.log('update 2=> ',data.data["getParamUpdate"][0].receiver.split(','));

          this.formCreate.get("mee_name").setValue(data.data["getParamUpdate"][0].mee_name);
          this.formCreate.get("receiver").setValue(data.data["getParamUpdate"][0].receiver.split(','));
          // this.formCreate.get("receiver2").setValue(data.data["getParamUpdate"][0].receiver2.split(','));
          // this.formCreate.get("receiver3").setValue(data.data["getParamUpdate"][0].receiver3.split(','));
          this.formCreate.get("receiver4").setValue(data.data["getParamUpdate"][0].receiver4);
          this.formCreate.get("mee_fec_ini").setValue(data.data["getParamUpdate"][0].mee_fec_ini);
          this.formCreate.get("mee_fec_fin").setValue(data.data["getParamUpdate"][0].mee_fec_fin);

          this.selection.file_sp = JSON.parse(data.data["getParamUpdate"][0].file_sp );

          if(data.data["getParamUpdate"][0].receiver2){
            this.checkArea = true;
          this.formCreate.get("receiver2").setValue(data.data["getParamUpdate"][0].receiver2.split(','));
            this.onSelectCargo(data.data["getParamUpdate"][0].receiver2.split(','));

          }
          if(data.data["getParamUpdate"][0].receiver3){
            this.checkCargo = true;
            this.formCreate.get("receiver3").setValue(data.data["getParamUpdate"][0].receiver3.split(','));
            this.onSelectPerson(data.data["getParamUpdate"][0].receiver3.split(','));

          }
          if(data.data["getParamUpdate"][0].receiver4){
            this.checkPerson = true;
          }
          if(data.data["getParamUpdate"]){
            const arrayOfFromAss: any = [];

            data.data["getParamUpdate"].forEach(element => {
              // console.log(element.idPersonale); 
              
            const fromAss =  element.idPersonale ;
            arrayOfFromAss.push(fromAss);
              
            this.formCreate.get("receiver5").setValue(arrayOfFromAss);
              
            });
            this.checkPerson = true;
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
      this.WebApiService.putRequest(this.endpoint + "/" + this.idMee, body, {
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

saveCase: any = [];
  onSubmi() {
    if (this.formCreate.valid) {
      this.loading.emit(true);
        let body = {
          listas: this.formCreate.value,
          archivoRes: this.nuevoArchivo
        };
      console.log('cantidad => ',this.formCreate.value['receiver'].length);
      if(this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 && this.formCreate.value['receiver3'].length > 0 && this.formCreate.value['receiver5'].length > 0 ){
        this.saveCase = "params";

      
        console.log('form1 =>',body);
        this.onSave(this.saveCase, body)
      }else if(this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 && this.formCreate.value['receiver3'].length > 0 || this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 || this.formCreate.value['receiver'].length > 0){
        this.saveCase = "onSave";
        console.log('form2 =>',body);

        this.onSave(this.saveCase, body)
      }
     
     
      
      // this.WebApiService.postRequest(this.endpoint, body, {
      //   token: this.cuser.token,
      //   idUser: this.cuser.iduser,
      //   modulo: this.component,
      // }).subscribe(
      //   (data) => {
      //     if (data.success) {
      //       this.handler.showSuccess(data.message);
      //       this.reload.emit();
      //       this.closeDialog();
      //     } else {
      //       this.handler.handlerError(data);
      //       this.loading.emit(false);
      //     }
      //   },
      //   (error) => {
      //     this.handler.showError();
      //     this.loading.emit(false);
      //   }
      // );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }
  onSave(cas, body){

    switch(cas){
      case "params":
        this.WebApiService.postRequest(this.endpoint, body, {
            action: "params",
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
          break;
          case "onSave":
            this.WebApiService.postRequest(this.endpoint, body, {
              action: "onSave",
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
          break;
    }
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

  onSelectionChange(event){
    // console.log('grupos ==> ',event);
    // this.checkbusinessLine = false;
    // this.checkArea = false;
    // this.checkCargo = false;
    // this.checkJef = false;
    // this.checkPerson = false;

    // for (let element of event) {
    //   if (element == '139/2') {
    //     this.checkArea = true;
    //   } else if (element == '139/3') {
    //     this.checkCargo = true;
    //   } else if (element == '139/4') {
    //     this.checkJef = true;
    //   } else if (element == '139/5') {
    //     this.checkPerson = true;
    //   } else if(element == '139/1'){
    //     this.checkbusinessLine = true;
    //   }
    // }
    
  }
  onSelectArea(event){
    this.checkArea = false;
    this.area = [];

    console.log('==>linea',event);
    // event.forEach(element => {

    //   if(element === '140/1'){
    //     this.area = this.areaLog;
    //   }
    // });
   
    // console.log('==>consulta',this.area_posit);
    for(let element of event){
      var lines = this.areaLog.filter((lin) => lin.businessLine === element)
      console.log('areas de linea => ', lines);
      
      for (let line of lines) {
        this.area.push(line);
      }
  
    // // Eliminar duplicados de la lista de cargos
    // this.area = Array.from(new Set(this.area));
    this.checkArea = true;
    // console.log('prueba upd',this.formCreate.get('receiver2').value);
    
    // this.onSelectCargo(this.formCreate.get('receiver2').value);
    // const ar =  Object.groupBy(this.ar)
    console.log('===>', this.area);
    
  // array.forEach(element => {
    
  // });
    
   
    }
    
  }
  onSelectCargo(event) {
    console.log('cargos =>', event);
    this.checkCargo = false;
    this.cargo = [];
    console.log('22 =>', this.positionLog);
  
    for (let element of event) {
      // Filtrar las áreas según el elemento actual
      var areas = this.positionLog.filter((area) => area.idArea === element && area.idPosition != null);
  
      
      for (let area of areas) {
        this.cargo.push(area);
      }
      // Agrupar las áreas por algún criterio, por ejemplo, el nombre del área
    //   const groupedAreas = areas.reduce((acc, area) => {
    //     // Utilizar el nombre del área como clave para agrupar
    //     const key = area.nombreArea;
  
    //     // Si la clave aún no existe en el acumulador, crear un nuevo array para esa clave
    //     if (!acc[key]) {
    //       acc[key] = [];
    //     }
  
    //     // Agregar el área actual al array correspondiente a la clave
    //     acc[key].push(area);
  
    //     return acc;
    //   }, {});
  
    //   // Convertir el objeto agrupado de nuevo a un array y concatenar con this.cargo
    //   for (let key in groupedAreas) {
    //     if (groupedAreas.hasOwnProperty(key)) {
    //       this.cargo = this.cargo.concat(groupedAreas[key]);
    //     }
    //   }
    }
  
    // Eliminar duplicados de la lista de cargos
    this.cargo = Array.from(new Set(this.cargo));
    console.log('===>', this.cargo);

    this.checkCargo = true;
  }
  
  onSelectPerson(event){
    console.log(event);

    this.checkPerson = false;
    this.personInfoLine = [];
    
    for (let idpos of event){
      // console.log('for',idpos);
      
      var peoples = this.PersonaleInfo.filter((user) => user.idPosition == idpos );
      // console.log('===>', peoples);
      
      for (let people of peoples) {
        this.personInfoLine.push(people);
      }
  
    // Eliminar duplicados de la lista de cargos
    this.personInfoLine = Array.from(new Set(this.personInfoLine));
    if(this.personInfoLine.length === 0){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se encontraron personas activas",
        
      });
    }
    console.log('===personas>', this.personInfoLine.length);

    this.checkPerson = true;

  }
}
onSelectUser(event){
  console.log(event);
  
}
esImagen(archivo: string): boolean {
  // Lógica para determinar si el archivo es una imagen, por ejemplo, verificar la extensión del archivo
  const extension = archivo.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif';
}
documentoHTML: string;
 esDocumentoWord(url: string): boolean {
  console.log('==>',url);
  
    const extension = url.split('.').pop()?.toLowerCase();
  if(extension === 'docx'){
    let urlDocumento = 'http://192.168.0.10/BackPersonale/public/imagenes/proceso_disciplinario/20240109131522_capacitacion.docx';
    // console.log(urlDocumento);
    
    // let urlDocumento = 'https://docs.google.com/document/d/e/2PACX-1vTNVSYHu-WptuADbb9VLTRnIv-JhP0R2dEsvI8xUFVqyQBawHyr0-JslHawZyOvhA/pub';

    // let urlDocumento = url;

    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(urlDocumento);
    this.documentoHTML =  url;
    console.log('==2>', this.documentoHTML);

  }

    return extension === 'docx';
  }
  
}