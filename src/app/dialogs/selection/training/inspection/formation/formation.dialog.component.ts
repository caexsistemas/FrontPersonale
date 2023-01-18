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
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../../../../services/handler-app.service";
import { environment } from "../../../../../../environments/environment";
import { global } from "../../../../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../../../services/web-api.service";
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
  selector: "app-formation",
  templateUrl: "./formation.dialog.component.html",
  styleUrls: ["./formation.dialog.component.css"],
})

export class FormationDialog {
  endpoint: string = "/Assignment";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  formTraining: FormGroup;
  formInsp: FormGroup;
  formVac:FormGroup;
  selection: any = [];
  position: any = [];
  typeRequisition: any = [];
  idSel: number = null;
  rol: number;
  typeMatriz: any = [];
  component = "/selection/assignment";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: 0;
  displayedColumns: any = [];
  checked = false;
  disabled = false;
  matriz: boolean = false;
  typeCargo: any = [];
  PersonaleInfo: any = [];
  typeFormation: any = [];
  idUser: number = null;
  nomi: boolean;
  idIns: number = null;
  idvac: number = null;
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<FormationDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSel = null;
    this.idUser= this.cuser.iduser

    if(this.idUser == 62 || this.idUser == 255){
      this.nomi = true;
    }else{
      this.nomi = false;
    }
    
    switch (this.view) {
      case "state":
        this.idSel = this.data.codigo;
        this.idIns = this.data.isnp;
        this.idvac = this.data.codigo;

        this.initForms();
        this.title = "Actualizar Formación";
      break;
    }
  }
  initForms() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      
      state: new FormControl(""),
      aprobacion1: new FormControl(""),
      aprobacion2: new FormControl(""),
      aprobacion3: new FormControl(""),
      day_for: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

    });this.formVac = new FormGroup({
      
      create_User: new FormControl(this.cuser.iduser),
      con_fin: new FormControl(""),
      
    });
    this.formTraining = new FormGroup({
      tip_for: new FormControl(""),
      cod_grup: new FormControl(""),
      grupo: new FormControl(""),
      metodologia: new FormControl(""),
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      fec_ini: new FormControl(""),
      fec_fin: new FormControl(""),
      est: new FormControl(""),
      idsel: new FormControl(""),
      day_for: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),


    });this.formInsp = new FormGroup({
     
      idsel: new FormControl(this.idSel),
    create_User: new FormControl(this.cuser.iduser),

  });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      idSel: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.position        = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);
          this.PersonaleInfo = data.data['getDataPersonale']; 
          this.typeFormation = data.data['getFormation'];

          if (this.view == "state") {
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
      action: "getTrainUpdateSet",
      id: this.idSel,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {

        this.formTraining.get("est").setValue(data.data["getSelecUpdat"][0].est);
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
        formacion: this.formTraining.value, 
        vacant: this.formVac.value,
        seguimiento: this.formInsp.value
    }
    if (this.formTraining.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idSel,body,{
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
  
}
