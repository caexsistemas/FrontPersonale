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
  ElementRef,
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
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BypassSeguroPipe } from "../../services/bypass-seguro.pipe";
// import * as mammoth from 'mammoth';
// var mammoth = require("mammoth");
import html2canvas from 'html2canvas';
import Swal from "sweetalert2";

// import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { startWith, map } from 'rxjs/operators';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from "@angular/material/chips/chip-input";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
// import { MatChipInputEvent } from '@angular/material/chips';
@Component({
  selector: 'app-learning.dialog',
  templateUrl: './learning.dialog.component.html',
  styleUrls: ['./learning.dialog.component.css']
})
export class LearningDialog {

  endpoint: string = "/learning";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idMee: number = null;
  permissions: any = null;
  //loading: boolean = false;
  component = "/meeting/learning";
  dataSource: any = [];
  RolInfo: any[];
  formLista: FormGroup;
  nuevoArchivo: any = [];
  archivoSesion: any = [];
  nuevoImg: any = [];
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
  selectionImg: any = [];
  selectionSesion: any = [];
  areaLog: any = [];
  urlSafe: SafeResourceUrl;
  positionLog: any = [];
  filteredOptions: Observable<string[]>;
  filteredPersonInfoLine: Observable<any[]>;
  selectedPersons: any[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  status: any = [];
  // readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedUsers: any[] = [];
  selectedMatri: any[] = [];
  userCtrl = new FormControl(); 
  text:boolean;
  contenTable: any = [];
  disabled = false;
  checkPlace: boolean;
  matriz: any = [];
  duration: Date = new Date(0, 0, 0, 0, 0);
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  // @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  @ViewChildren(MatPaginator) paginator!: QueryList<MatPaginator>;

  historyMon: any = [];
  displayedColumns: any = [];
  urlDocumentoWord: any = [];
  colorMap: any =[]
  check_date:boolean = false;
  panelOpenState = false;
  meeting_view: any = [];
  che_date: any = [];
  viewDataActua: boolean = false;
  checkViewLink:boolean = false;
  checkViewDoc:boolean = false;
  place: any = [];
  checkState: boolean = false;
  checkSesion: boolean = false;
  selectedTime: string = ''; // Para ngx-timepicker-field
  selectedHour: number = 0; // Para ngx-material-timepicker-dial y ngx-material-timepicker-face
  selectedMinute: number = 0; // Para ngx-material-timepicker-dial y ngx-material-timepicker-face
  filteredMatriz: Observable<any[]>;

  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<LearningDialog>,
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
        this.title = "Editar Capacitación";
        this.idMee = this.data.codigo;
        break;
      case "view":
        this.idMee = this.data.codigo;
        this.che_date =this.data.check        
        this.title = "Información detallada";
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idMee, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          role: this.cuser.role,
          check: this.data.check,
          modulo: this.component,
          idPersonale: this.cuser.idPersonale,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.meeting = data.data['getSelectData'][0];
              this.meeting_view = data.data['getSelectAllMeeting'];

              if( this.meeting.idPersonale === this.cuser.idPersonale || this.cuser.role == 5 || this.cuser.role == 1){
                this.viewDataActua = true;
                this.generateTable(data.data['getSelectAllMeeting']);
                this.contenTable = data.data['getSelectAllMeeting'];
              }

              this.paginator.changes.subscribe((paginator: QueryList<MatPaginator>) => {
                this.dataSource.paginator = paginator.first;
              });

              //validar si el estado de capacitacion es en curso
              (this.meeting.lear_state === '144/2') ? this.checkViewLink = true : this.checkViewLink = false;
              (this.meeting.lear_state === '144/2' || this.meeting.lear_state === '144/3') ? this.checkViewDoc = true : this.checkViewDoc = false;

              this.selection = data.data["getSelectData"][0];
              this.selectionImg = data.data["getSelectData"][0];
              this.selectionSesion = data.data["getSelectData"][0];
              
              this.panelOpenState = false;
              if(this.selectionSesion.file_sp_sesion){
                this.selectionSesion.file_sp_sesion = JSON.parse(this.selectionSesion.file_sp_sesion);
              }
              if(this.selectionImg.file_sp){
                this.selectionImg.file_sp = JSON.parse(this.selection.file_sp);
              }
              this.selection.file_sp_doc = JSON.parse(this.selection.file_sp_doc);
            
              if(this.meeting.mee_fec_fin){
                this.check_date = true;
              }
              if( this.cuser.role == 5 || this.cuser.role == 1 || this.meeting.idPersonale === this.cuser.idPersonale){
                this.checkSesion = true;
              }
            
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
  generateTable(data) {
    this.displayedColumns = [
      "document",
      "idPersonale",
      "view_state",
      "date_view",
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  colorState(ev) {
    return ev || ""; // Devuelve el color correspondiente o cadena vacía si no coincide
  }
  textStyle() {
    if (this.meeting.mee_desc.length < 50) {
      return {
        "padding-left": "30%",
      };
    } else {
      return {
        "padding-left": "10%",
      };
    }
  }
  initFormsRole() {
    this.getDataInit();
    this.formCreate = new FormGroup({
      lear_name: new FormControl(""),
      idPersonale: new FormControl(""),
      file_sp: new FormControl(""),
      file_sp_doc:new FormControl(""),
      file_sp_sesion:new FormControl(""),
      lear_fec_eje: new FormControl(""),
      lear_time: new FormControl(""),
      receiver: new FormControl(""),
      receiver2: new FormControl(""),
      receiver3: new FormControl(""),
      receiver4: new FormControl(""),
      receiver5: new FormControl(""),
      lear_desc: new FormControl(""),
      lear_link_quest: new FormControl(""),
      lear_link_satis: new FormControl(""),
      lear_state: new FormControl(""),
      lear_place: new FormControl(""),
      lear_place_other: new FormControl(""),
      matriz: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
  closeDialogView() {
    this.dialogRef.close();
    this.onSubmitUpdateDate();
  }
  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }
  sendRequest() {}

  idPositionAct: any = [];
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
          this.businessLine = data.data["businessLine"].slice(0,3);
          this.areaLog = data.data["areaLog"];         
          this.PersonaleInfo = data.data["getDataPersonale"];
          this.boss = data.data["getDataBoss"];
          this.positionLog = data.data["positionLog"];
          this.status = data.data["state"];
          this.place = data.data["place"];
          this.matriz = data.data["matriz"];

          
          this.filteredMatriz = this.userCtrl.valueChanges.pipe(
            startWith(null),
            map((userInput: string | null) => (userInput ? this._filterMatriz(userInput) : this.matriz.slice()))
          );

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
          this.formCreate.get("lear_name").setValue(data.data["getParamUpdate"][0].lear_name);
          this.formCreate.get("receiver").setValue(data.data["getParamUpdate"][0].receiver.split(','));
          this.formCreate.get("receiver4").setValue(data.data["getParamUpdate"][0].receiver4);
          this.formCreate.get("lear_fec_eje").setValue(data.data["getParamUpdate"][0].lear_fec_eje);
          this.formCreate.get("lear_time").setValue(data.data["getParamUpdate"][0].lear_time.slice(0,5));
          this.formCreate.get('lear_time').disable();

          this.formCreate.get("lear_desc").setValue(data.data["getParamUpdate"][0].lear_desc);
          this.formCreate.get("lear_link_quest").setValue(data.data["getParamUpdate"][0].lear_link_quest);
          this.formCreate.get("lear_link_satis").setValue(data.data["getParamUpdate"][0].lear_link_satis);
          this.formCreate.get("lear_state").setValue(data.data["getParamUpdate"][0].lear_state);
          this.formCreate.get("lear_place").setValue(data.data["getParamUpdate"][0].lear_place);
          this.formCreate.get("lear_place_other").setValue(data.data["getParamUpdate"][0].lear_place_other);
          // this.formCreate.get("matriz").setValue(data.data["getParamUpdate"][0].matriz);
          this.formCreate.get("matriz").setValue(data.data["getParamUpdate"][0].matriz.split(','));


          if(data.data["getParamUpdate"][0].file_sp){
            this.selection.file_sp = JSON.parse(data.data["getParamUpdate"][0].file_sp );
          }

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
            // console.log(data.data["getParamUpdate"].matriz);
            
            const arrayOfFromAss: any = [];

            this.filteredUsers = this.userCtrl.valueChanges.pipe(
              startWith(null),
              map((userInput: string | null) => (userInput ? this._filterUsers(userInput) : data.data["getParamUpdate"].slice()))
            );
            // this.filteredMatriz = this.userCtrl.valueChanges.pipe(
            //   startWith(null),
            //   map((userInput: string | null) => (userInput ? this._filterMatriz(userInput) : data.data["getParamUpdate"][0].matriz.split(',').slice()))
            // );
            this.checkPerson = true;
          }       
             

          if(data.data["getParamUpdate"][0].encargado == this.cuser.idPersonale){
            this.checkState = true;
          }else{
            this.checkState = false;

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
        listas: this.formCreate.value,
        archivoRes: this.nuevoArchivo,
      };
      this.WebApiService.putRequest(this.endpoint + "/" + this.idMee, body, {
        action:"formMeeting",
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
    
    if(this.personInfoLine.length > 0){
       this.formCreate.get('receiver5').setValue([this.personInfoLine]);
      }
    if(this.selectedUsers.length > 0){
      this.formCreate.get('receiver5').setValue([this.selectedUsers]);
      }

      this.formCreate.get('matriz').setValue([this.selectedMatri]);

    if (this.formCreate.valid) {
      this.loading.emit(true);
        let body = {
          listas: this.formCreate.value,
          archivoRes: this.nuevoArchivo,
          img: this.nuevoImg,
          archiSesion: this.archivoSesion
        };
      if(this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 && this.formCreate.value['receiver3'].length > 0 && this.formCreate.value['receiver5'].length > 0 ){
        this.saveCase = "params";
        this.onSave(this.saveCase, body)
       // }else if(this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 && this.formCreate.value['receiver3'].length > 0 || this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 || this.formCreate.value['receiver'].length > 0){
        }else if(this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 && this.formCreate.value['receiver3'].length > 0 ){
          this.saveCase = "params";
          this.onSave(this.saveCase, body)
        }else if(this.formCreate.value['receiver'].length > 0 && this.formCreate.value['receiver2'].length > 0 || this.formCreate.value['receiver'].length > 0){
          this.saveCase = "onSave";
          this.onSave(this.saveCase, body)
         }
     
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
            idPersonale: this.cuser.idPersonale,
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
              idPersonale: this.cuser.idPersonale,
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
  selectedFiles: File[] = [];
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
    // para ver el nombre de los documentos adjuntos
    this.selectedFiles = [];
    const filess: FileList = event.target.files;
    for (let i = 0; i < filess.length; i++) {
      this.selectedFiles.push(filess[i]);
    }
  }
  selectedFilesSesion: File[] = [];
  seleccionarSesion(event) {
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
      this.archivoSesion = archivos; // Actualizar el arreglo this.nuevoArchivo con los archivos leídos
    };

    leerArchivosSecuencialmente();
    // para ver el nombre de los documentos adjuntos
    this.selectedFilesSesion = [];
    const filess: FileList = event.target.files;
    for (let i = 0; i < filess.length; i++) {
      this.selectedFilesSesion.push(filess[i]);
    }
  }

selectedFileName: string = '';

  seleccionarImg(event) {
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
      this.nuevoImg = archivos; // Actualizar el arreglo this.nuevoArchivo con los archivos leídos
    };

    leerArchivosSecuencialmente();
    // para ver le nombre de las imagen
    const file = event.target.files[0];
    this.selectedFileName = file.name;
  }

  onSelectArea(event){
    this.reload.emit();

    this.checkArea = false;
    this.area = [];
   
    for(let element of event){
      var lines = this.areaLog.filter((lin) => lin.businessLine === element)
      
      for (let line of lines) {
        this.area.push(line);
      } 
      
       this.checkArea = true; 
    }
  }

  onSelectCargo(event) {
    this.onSelectPerson([]);

    if(event.length > 0){
    
       this.reload.emit();

      this.checkCargo = false;
      this.cargo = [];
  
    for (let element of event) {
      // Filtrar las áreas según el elemento actual
      this.positionLog.forEach(position => {

        const arrayPos = {
          "idArea": position.idAreas.split(','),
          "idPosition": position.idCargo,
          "cargo": position.cargo
        }

        const arrayPosFiltrado = {
          "idArea": "",
          "idPosition": position.idCargo,
          "cargo": position.cargo
        };

        arrayPos.idArea.forEach(idArea => {
            if(idArea === element){

              arrayPosFiltrado.idArea = idArea;
          }
            
        });
        // Verificas si al menos una de las áreas coincide
        if (arrayPosFiltrado.idArea !== "") {
          this.cargo.push(arrayPosFiltrado);
        }
     });
    }
    this.checkCargo = true;

  }else if (event.length == 0){
     this.reload.emit();

    this.cargo = [];
    this.checkCargo = false;
    this.onSelectPerson([]);
    this.formCreate.get("receiver3").setValue([]);
    this.formCreate.get("receiver5").setValue([]);    
  }
  }

  selectedCargoCount: number = 0;
  areaCargoMapping: string[] = [];
  filteredUsers: Observable<any[]>;
  onSelectPerson(event) {

    let contador = 0;
    this.reload.emit();
    this.personInfoLine = [];
    this.selectedCargoCount = event.length;

    if (event.length > 0) {
      contador++
        this.checkPerson = false;
        
        event.forEach(idpos => {
          
          this.cargo.forEach(idarea => {

            const filteredPeople = this.PersonaleInfo.filter(user => user.idPosition === idpos && user.idArea === idarea.idArea );
            this.personInfoLine = this.personInfoLine.concat(filteredPeople);
          });
          
        });
            // Eliminar duplicados de la lista de cargos
            this.personInfoLine = Array.from(new Set(this.personInfoLine));

            if (this.personInfoLine.length === 0) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se encontraron personas activas",
                });
            }
            this.checkPerson = true;
    }
      //-- esta linea carga la lista de las personas filtradas en preseleccion----
      this.selectedUsers = this.personInfoLine.slice();
     // ---------------------------------------------------------


    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(null),
      map((userInput: string | null) => (userInput ? this._filterUsers(userInput) : this.personInfoLine.slice()))
    );

    // this.formCreate.get('receiver5').valueChanges.subscribe((selectedPersons) => {
    //   this.selectedPersons = selectedPersons;
    // });
}
removePerson(person: any) {
  const index = this.selectedPersons.indexOf(person);
  if (index !== -1) {
    this.selectedPersons.splice(index, 1);
    this.formCreate.get('receiver5').setValue(this.selectedPersons);
  }
}

onSelectUser(event){
  
}
hayImagenValida: boolean = false;
esImagen(archivo: string): boolean {
  // Lógica para determinar si el archivo es una imagen, por ejemplo, verificar la extensión del archivo
  const extension = archivo.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif';
}
verificarImagenesValidas(): void {
  if (this.selection.file_sp) {
    this.hayImagenValida = this.selection.file_sp.some(archivo => this.esImagen(archivo));
  } else {
    this.hayImagenValida = false; // No hay imágenes si 'file_sp' es undefined
  }
}
  addUser(event: MatChipInputEvent): void {
    
    const input = event.input;
    const value = event.value;

    // Agrega el usuario si se ha proporcionado un valor
    if ((value || '').trim()) {
      this.selectedUsers.push({ name: value.trim() });
    }

    // Resetea el valor del input
    if (input) {
      input.value = '';
    }

    // Limpia el filtro del autocomplete
    this.formCreate.get('receiver5').setValue('');

    // Actualiza la lista filtrada para excluir los usuarios seleccionados
    // this.updateFilteredPersonInfoLine();
  }

 

     // Función para agregar usuarios a la lista de usuarios seleccionados
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Agregar el usuario solo si es válido y no está duplicado
    if ((value || '').trim() && !this.selectedUsers.find(user => user.name === value.trim())) {
      this.selectedUsers.push({ name: value.trim() });
    }

    // Limpiar el campo de entrada después de agregar el usuario
    if (input) {
      input.value = '';
    }

    // Limpiar el FormControl asociado al campo de entrada
    this.userCtrl.setValue(null);
  }

  // Función para eliminar un usuario de la lista
  remove(user: any): void {
    
    const index = this.selectedUsers.indexOf(user);

    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    this.formCreate.get('receiver5').setValue([this.selectedUsers]);

    }
  }

  // Función para manejar la selección de una opción del autocompletado
  selected(event: MatAutocompleteSelectedEvent): void {
    
    this.selectedUsers.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);

  }
  addMatriz(event: MatChipInputEvent): void {
    
    const input = event.input;
    const value = event.value;

    // Agrega el usuario si se ha proporcionado un valor
    if ((value || '').trim()) {
      this.selectedMatri.push({ name: value.trim() });
    }

    // Resetea el valor del input
    if (input) {
      input.value = '';
    }

    // Limpia el filtro del autocomplete
    this.formCreate.get('matriz').setValue('');

    // Actualiza la lista filtrada para excluir los usuarios seleccionados
    // this.updateFilteredPersonInfoLine();
  }

 

     // Función para agregar usuarios a la lista de usuarios seleccionados
  addM(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    

    // Agregar el usuario solo si es válido y no está duplicado
    if ((value || '').trim() && !this.selectedMatri.find(user => user.description === value.trim())) {
      this.selectedMatri.push({ name: value.trim() });
    }

    // Limpiar el campo de entrada después de agregar el usuario
    if (input) {
      input.value = '';
    }

    // Limpiar el FormControl asociado al campo de entrada
    this.userCtrl.setValue(null);
  }

  // Función para eliminar un usuario de la lista
  removeMatriz(user: any): void {
    
    const index = this.selectedMatri.indexOf(user);

    if (index >= 0) {
      this.selectedMatri.splice(index, 1);
    this.formCreate.get('matriz').setValue([this.selectedMatri]);

    }
  }
  selectedMatriz(event: MatAutocompleteSelectedEvent): void {
    
    this.selectedMatri.push(event.option.value);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);

  }
  
  private _filterUsers(value: string): any[] {
    const filterValue = (value || '').toString().toLowerCase();
    return this.personInfoLine.filter(user => {
      const userName = (user.name || '').toString().toLowerCase(); // Convertir a cadena y luego a minúsculas
      
      return userName.includes(filterValue);
    });
  }
  private _filterMatriz(value: string): any[] {

    const filterValueMatriz = (value || '').toString().toLowerCase();
    return this.matriz.filter(user => {
      const userName = (user.description || '').toString().toLowerCase(); // Convertir a cadena y luego a minúsculas
      
      return userName.includes(filterValueMatriz);
    });
  }
  onReadonly(event){

    if(event == true){
      this.disabled = true;
      this.formCreate.get('mee_fec_fin').setValue('');
    }else{
      this.disabled = false;
    }
    
  }
  getAssist(event){

    const idLearAssi = event;
    // this.loading.emit(true);
    const date_fin = {
      "date_view": "",
    }

    let body = {
      listas: date_fin
    };
    
    this.WebApiService.putRequest(this.endpoint + "/" + idLearAssi, body, {
      action: "finDateAssis",
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
  // }

}
 onSelectPlace(event){
  if(event === '145/3'){
    this.getNivel();
    this.checkPlace = true;
  }else{
    this.getNivel();

    this.checkPlace = false;
  }

}
isRequired(state):boolean{

  return state === true;

}
getNivel() {
  const selectLevel = this.formCreate.get("lear_place");
  const selectedValue = selectLevel.value;

  // Verifica si el valor seleccionado es '145/3'
  if (selectedValue === '145/3') {
    // Establece el campo lear_place_other como requerido
    this.formCreate.get('lear_place_other').setValidators([Validators.required]);
  } else {
    // Si no es '145/3', elimina las validaciones
    this.formCreate.get('lear_place_other').clearValidators();
  }

  // Actualiza las validaciones del campo lear_place_other
  this.formCreate.get('lear_place_other').updateValueAndValidity();
}

onSubmitUpdateDate() {
    
  this.loading.emit(true);
  const date_fin = {
    "date_view": "",
  }

  let body = {
    listas: date_fin
  };
  
  this.WebApiService.putRequest(this.endpoint + "/" + this.meeting.le_ass_id, body, {
    action: "finDateView",
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

onOpeningOrClosingTimeChanged(event){
  let hour = event.slice(0, 2);
  const minutes = event.slice(3, 5);

  // Convertir la hora a '00' si es '24'
  if (hour === '24') {
    hour = '00';
  }

  // Unir la hora ajustada con los minutos
  this.selectedTime = hour + ':' + minutes;
this.formCreate.get("lear_time").setValue(this.selectedTime);

}

}