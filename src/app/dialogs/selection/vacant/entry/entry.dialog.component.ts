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
import { WebApiService } from "../../../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../../../services/handler-app.service";
import { environment } from "../../../../../environments/environment";
import { global } from "../../../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
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
  selector: "app-entry",
  templateUrl: "./entry.dialog.component.html",
  styleUrls: ["./entry.dialog.component.css"],
})
export class EntryDialog {
  endpoint: string = "/vacant";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formNomi: FormGroup;
  form:FormGroup;
  formInsp:FormGroup;
  component = "/selection/vacant";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  dataNovNi: any = [];
  personalData: any = [];
  idTec: number = null;
  techno: any = [];
  
  typeDocument: any = [];
  depart: any = [];
  citytBirth: any = [];
  area: any = [];
  position: any = [];
  eps: any = [];
  pension: any = [];
  citieswork: any =[];
  cities: any = [];
  cargo: any =[];
  typeMatriz: any = [];
  //History
  historyMon: any = [];
  check: 0;
  displayedColumns: any = [];
  checked = false;
  disabled = false;
  matriz: boolean = false;
  country: any = [];
  typeCargo: any = [];
  birth: boolean = false;
  extra: boolean = false;
  ages: any = [];
  typeGender: any [];
  group: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // public citieswork: CityI[];

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<EntryDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idTec = null;
    // this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Crear Activos";
        break;
      case "update":
        this.idTec = this.data.codigo;
        this.initForms();
        this.title = "Gestion Vacante";
        break;
      case "view":
        this.idTec = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(
          this.endpoint + "/" + this.idTec,
          {
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
          }
        ).subscribe(
          (data) => {
            if (data.success == true) {
              this.techno = data.data["getSelectData"][0];
              this.country = this.techno.pais_nac
              this.typeCargo = this.techno.car_sol
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
    this.form = new FormGroup({
      fec_sel:  new FormControl(""),
      tip_doc: new FormControl(""),
      document: new FormControl(""),
      nom_com: new FormControl(""),
      birthDate: new FormControl(""),
      pais_nac: new FormControl(""),
      ciu_nac: new FormControl(""),
      dep_nac: new FormControl(""),
      are_tra: new FormControl(""),
      car_sol: new FormControl(this.cargo),
      eps: new FormControl(""),
      pension: new FormControl(""),
      obs_vac: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
      matrizarp: new FormControl(this.matriz),
      idGender: new FormControl(""),
      ages: new FormControl(""),
      etario: new FormControl(""),
      pai_ext: new FormControl(""),
      ciu_ext: new FormControl(""),
    });
     this.formInsp = new FormGroup({
      create_User: new FormControl(this.cuser.iduser),
    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      // tipRole: this.cuser.role,
      idTec: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component

    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.typeDocument = data.data["getDocument"];
          this.depart = data.data["getDepart"];
          this.citytBirth  = data.data["getCity"];
          this.position  = data.data["getPosition"];
          this.eps  = data.data["getEps"];
          this.pension  = data.data["getPension"];
          this.area  = data.data["getArea"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);
          this.typeGender      = data.data["getGender"];
          this.group           = data.data['getGroupAge']
          this.country         = data.data['getCountry']

          if (this.view == 'update') {
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
    if (this.form.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.form.value,
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
      id: this.idTec,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
       
        this.form.get("fec_sel").setValue(data.data["getSelecUpdat"][0].fec_sel);
        this.form.get("tip_doc").setValue(data.data["getSelecUpdat"][0].tip_doc);
        this.form.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.form.get("nom_com").setValue(data.data["getSelecUpdat"][0].nom_com);
        this.form.get("birthDate").setValue(data.data["getSelecUpdat"][0].birthDate);
        this.form.get("dep_nac").setValue(data.data["getSelecUpdat"][0].dep_nac);
        this.form.get("ciu_nac").setValue(data.data["getSelecUpdat"][0].ciu_nac);
        this.form.get("are_tra").setValue(data.data["getSelecUpdat"][0].are_tra);
        this.form.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        this.form.get("eps").setValue(data.data["getSelecUpdat"][0].eps);
        this.form.get("pension").setValue(data.data["getSelecUpdat"][0].pension);
        this.form.get("obs_vac").setValue(data.data["getSelecUpdat"][0].obs_vac);
        this.form.get("matrizarp").setValue(data.data["getSelecUpdat"][0].matrizarp);
        this.form.get("idGender").setValue(data.data["getSelecUpdat"][0].idGender);
        this.form.get("ages").setValue(data.data["getSelecUpdat"][0].ages);
        this.form.get("etario").setValue(data.data["getSelecUpdat"][0].etario);
        this.form.get("pai_ext").setValue(data.data["getSelecUpdat"][0].pai_ext);
        this.form.get("ciu_ext").setValue(data.data["getSelecUpdat"][0].ciu_ext);
        this.form.get("pais_nac").setValue(data.data["getSelecUpdat"][0].pais_nac);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSubmitUpdate(){

    let body = {
        listas: this.form.value, 
        segui: this.formInsp.value,
        //  id: this.idTec
    }
    if (this.form.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idTec,body,{
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
  onSelect(idState){
        
    // this.loading.emit(true);
    // this.citieswork = this.citytBirth.filter(item => item.idState == idState);
    console.log('=>',idState);
    // for(let i = idState; i>='1'; i++ ){

    //   this.citieswork = this.citytBirth ;

    //  }
        // this.citieswork = this.citytBirth.filter(item => item.idState == idState);

      setTimeout(()=>{       
        this.citieswork = this.citytBirth.filter(item => item.idState == idState);
        //console.log(this.citieswork);
    },3); 
    
    if( this.citieswork ){
      this.form.get('ciu_nac').setValue(this.citieswork .ciu_nac);       
  }    
    }

  onSelectBirth(idState:any):void{
          setTimeout(()=>{       
            this.citieswork = this.citytBirth.filter(item => item.idState == idState);
            // console.log(this.citieswork);
        },3);   
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
  onSelectionAttributes(idet){
    console.log('cargo=>',idet)
    if(idet =='16/1'){
      this.matriz = true
    }else{
      this.matriz = false
  
    }
  }
  onSelectionCountry(idet){
    console.log('pais=>',idet)
        if(idet == '71/1'){
          this.birth = true;
         }else{
          this.birth = false
         }
      if(idet == '71/2'){
          this.extra = true;
       }else{
       this.extra = false;
       }
  }
  
  onSelectBirthDate(e:Required<number>){
    console.log('date=>',e);
          let convertAge = new Date(e);
          let timeDiff = Math.abs(Date.now() - convertAge.getTime());
  
          this.ages = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
         
      
  
  }
}

