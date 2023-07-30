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
  selector: 'app-formalities.dialog',
  templateUrl: './formalities.dialog.component.html',
  styleUrls: ['./formalities.dialog.component.css']
})
export class FormalitiesDialog  {
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  formSelec: FormGroup;
  formGuia:FormGroup;
  formGuiaTecno:FormGroup;
  formGuiaTh:FormGroup;
  formGuiaNo:FormGroup;
  formGuiaCon:FormGroup;
  formGuiaSig:FormGroup;
  formGroupRegistros: FormGroup ;
  permissions: any = null;
  // component = "/management/formalities";
  component = "/management/formalities";
  dataSource: any = [];
  endpoint: string = '/formalities';
  idSig:number = null;
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: boolean = false;
  displayedColumns: any = [];
  selection:any = [];
  
  PersonaleInfo:any = [];
  area:any = [];
  idPosition: any = [];
  guiaTecno: any = [];
  guiaTaHm: any = [];
  guiaNom:any = [];
  guiaCont:any = [];
  guiaSig:any = [];
  guiaElemt:any = [];
  afirm:any = [];
  afirm_fin:any = [];
  rol:any = [];
  checkTh: boolean = false;
  checkCont: boolean = false;
  checkNom:boolean = false;
  checkSig: boolean = false
  verification: any = [];
  viewTecno: any = [];
  viewTh:any = [];
  viewNom:any = [];
  viewCont:any = [];
  viewSig:any = [];
  viewElem:any = [];
  colorTecno: boolean= false;
  colorTH: boolean = false;
  colorNom: boolean = false;
  colorCont: boolean = false;
  colorSig: boolean = false;
  colorElem: boolean = false;
  rolTecno: boolean = false
  rolTH: boolean = false
  rolNom: boolean = false
  rolCont: boolean = false
  rolSig: boolean = false;
  processAct: any [];
  lisTecno: any = [];
  lisTh: any = [];
  listNom: any = [];
  listTeso: any = [];
  listSig: any = [];
  status: boolean = false;
  fec_block:boolean = false;
  user_sesion: any = [];
  jef_inm: any = [];
  check_proc: boolean = false;
  motivoRenuncia: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<FormalitiesDialog>,
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
        this.idSig = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSig, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              this.verification = data.data["getSelecUpdat"];
              this.viewTecno = this.verification.filter(guia => guia.list_id === 102);
              this.getColorTecno(this.viewTecno);
                this.viewTecno.forEach(element => {
                  (element.sta == null) ? element.updated_at = '': element.updated_at;
                });
              
              this.viewTh = this.verification.filter(guia => guia.list_id === 103);
              this.getColorTH( this.viewTh);
                this.viewTh.forEach(element => {
                  (element.sta == null) ? element.updated_at = '': element.updated_at;
                });
              this.viewNom = this.verification.filter(guia => guia.list_id === 104);
              this.getColorNom(this.viewNom);
                this.viewNom.forEach(element => {
                  (element.sta == null) ? element.updated_at = '': element.updated_at;
                });
              this.viewCont = this.verification.filter(guia => guia.list_id === 105);
              this.getColorCont(this.viewCont);
                this.viewCont.forEach(element => {
                  (element.sta == null) ? element.updated_at = '': element.updated_at;
                });
              this.viewSig = this.verification.filter(guia => guia.list_id === 106);
              this.getColorSig(this.viewSig);
                this.viewSig.forEach(element => {
                  (element.sta == null) ? element.updated_at = '': element.updated_at;
                });
              this.viewElem = this.verification.filter(guia => guia.list_id === 107);
              this.getColorElement(this.viewElem);
                this.viewElem.forEach(element => {
                  (element.sta == null) ? element.updated_at = '': element.updated_at;
                });

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
      document: new FormControl("",[Validators.required]),
      idPersonale: new FormControl("", [Validators.required]),
      fec_ret: new FormControl("", [Validators.required]),
      reason: new FormControl("",),
      idPosition: new FormControl("", [Validators.required]),
      pro_res: new FormControl("",[Validators.required]),
      immediateBoss: new FormControl("",[Validators.required]),
      create_User: new FormControl(this.cuser.iduser),
    });
    
    this.formGuia = this.fb.group({
      guias: this.fb.array([]) , // FormArray para almacenar los registros de guía
      tecno:this.fb.array([]),
      th: this.fb.array([]),
      nom: this.fb.array([]),
      cont: this.fb.array([]),
      sig: this.fb.array([]),
      elemt: this.fb.array([])
    });
    
    
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.PersonaleInfo = data.data['getDataPersonale']; 
          this.area = data.data["getArea"];
          this.idPosition = data.data["getPosition"];
          this.motivoRenuncia = data.data['motivoRenuncia'];
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
  onSelectionChange(event){
        
    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
    if( exitsPersonal ){
        this.formSelec.get('idPersonale').setValue(exitsPersonal.idPersonale);
        this.formSelec.get('immediateBoss').setValue(exitsPersonal.jef_idPersonale);
        this.formSelec.get('pro_res').setValue(exitsPersonal.idArea);
        this.formSelec.get('idPosition').setValue(exitsPersonal.idPosition);     
       (exitsPersonal.status == '13/1')? this.status = true : this.status = false;

       if(exitsPersonal.status == '13/2'){
          
            const fec_format =  moment(exitsPersonal.withdrawalDate,"DD/MM/YYYY")
            const fec_real = fec_format.format("YYYY-MM-DD")          
            this.formSelec.get('fec_ret').setValue(fec_real);  
            this.fec_block = true;
          }else{
            this.formSelec.get('fec_ret').setValue("");     
            this.fec_block = false;
          }
    }        
}

onSelectionJFChange(event){
    
    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
    if( exitsPersonal ){
        this.formSelec.get('directboss_nc').setValue(exitsPersonal.idPersonale);
    }        
}
  getDataUpdate() {

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSet",
      id: this.idSig,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {

        this.formSelec.get('idPersonale').setValue(data.data['getPersonGuia'][0].idPersonale);
        this.formSelec.get('document').setValue(data.data['getPersonGuia'][0].document);
        if(data.data['getPersonGuia'][0].fec_ret){
            const fec_format =  moment(data.data['getPersonGuia'][0].fec_ret,"DD/MM/YYYY")
            const fec_real = fec_format.format("YYYY-MM-DD")     
            this.formSelec.get('fec_ret').setValue(fec_real);
         }
        this.formSelec.get('idPosition').setValue(data.data['getPersonGuia'][0].idPosition);
        this.formSelec.get('pro_res').setValue(data.data['getPersonGuia'][0].pro_res);
        this.formSelec.get('immediateBoss').setValue(data.data['getPersonGuia'][0].immediateBoss);
        this.user_sesion = this.cuser.idPersonale;
        this.processAct = data.data['getPersonGuia'][0].area;
        this.jef_inm = data.data['getPersonGuia'][0].immediateBoss;
        (this.user_sesion == this.jef_inm || this.rol == 1 || this.rol == 5 ) ? this.check_proc = true : this.check_proc = false;

      //-------------------listas-------------------
        this.lisTecno = data.data['listTecno'];
        this.lisTh = data.data['listTH'];
        this.listNom = data.data['listNom'];
        this.listTeso = data.data['listTes'];
        this.listSig = data.data['listSig'];
        // prueba-----------------------------------------
        const list = data.data["getSelecUpdat"];

        const guiasArray = this.formGuia.get('guias') as FormArray;
        guiasArray.clear();

        list.forEach(element => {
          // Crear un FormGroup para cada registro de guía
          const guiaGroup = this.fb.group({
            id_guide: new FormControl(element.id_guide),
            list_id: new FormControl(element.list_id),
            state: new FormControl(element.state),
            rol_id: new FormControl(element.rol_id),
            ls_codvalue: new FormControl(element.val)
          });

          guiasArray.push(guiaGroup); // Agregar el FormGroup al FormArray
        });
// ----------------------------------tecno---------------------------
        this.rol
        this.guiaTecno = list.filter(guia => guia.list_id === 102);
        this.afirm = data.data["afirmative"];
        
        const nuevoArreglo = this.lisTecno.map(obj => {
          const numbers = obj.complemento.slice(1, -1).split(",").map(Number);
          let exitsRolTecno = numbers.find(element => element == this.rol);
          
          if(exitsRolTecno){
            this.rolTecno = true;
            }
          // return { ...obj, rol_id: numbers };
          });
        this.getColorTecno(this.guiaTecno);
        // for (const item of this.guiaTecno) {
        //   // if (item.state !== '39/1') {
        //   //   this.colorTecno = false;
        //   //   break;
        //   // }else{
        //   //   this.colorTecno = true;
        //   // }
        //   if (!item.state) {
        //     this.colorTecno = false;
        //     break;
        //   }else{
        //     this.colorTecno = true;
        //   }
        // }
        const tecnoArray = this.formGuia.get('tecno') as FormArray;

        this.guiaTecno.forEach(element =>{   
         
            const tecnoGuia = this.tc.group({
              id_guide: new FormControl(element.id_guide),
              list_id: new FormControl(element.list_id),
              state: new FormControl(element.state),
              rol_id: new FormControl(element.rol_id),
              ls_codvalue: new FormControl(element.val),
              form_id: new FormControl(element.form_id),
              obs_guia: new FormControl(element.obs_guia)
            });
            tecnoArray.push(tecnoGuia);
        });
        //-----------------------------------------------------------------

        // ----------------------------------th---------------------------
       
        this.guiaTaHm = list.filter(guia => guia.list_id === 103);
        
          const nuevoArregloTH = this.lisTh.map(obj => {
          const numbersTH = obj.complemento.slice(1, -1).split(",").map(Number);
          let exitsRolTH = numbersTH.find(element => element == this.rol);

          if(exitsRolTH){
            this.rolTH = true;
          }
          return { ...obj, rol_id: numbersTH };
        });
        // style color
        this.getColorTH(this.guiaTaHm);
        // for (const itemTh of this.guiaTaHm) {
        //   // if (itemTh.state !== '39/1') {
        //   //   this.colorTH = false;
        //   //   break;
        //   // }else{
        //   //   this.colorTH = true;
        //   // }
        //   if (!itemTh.state) {
        //     this.colorTH = false;
        //     break;
        //   }else{
        //     this.colorTH = true;
        //   }
        // }
        const thArray = this.formGuia.get('th') as FormArray;

        this.guiaTaHm.forEach(element =>{
            const thGuia = this.tc.group({
              id_guide: new FormControl(element.id_guide),
              list_id: new FormControl(element.list_id),
              state: new FormControl(element.state),
              rol_id: new FormControl(element.rol_id),
              ls_codvalue: new FormControl(element.val),
              form_id: new FormControl(element.form_id),
              obs_guia: new FormControl(element.obs_guia)
            });
            thArray.push(thGuia);
        });
        //-----------------------------------------------------------------

         // ----------------------------------Nomina---------------------------
         this.guiaNom = list.filter(guia => guia.list_id === 104);
          const nuevoArregloNom = this.listNom.map(obj => {
          const numberNom = obj.complemento.slice(1, -1).split(",").map(Number);
          let exitsRolNom = numberNom.find(element => element == this.rol);

          if(exitsRolNom){
            this.rolNom = true;
          }
          return { ...obj, rol_id: numberNom };
         });
            this.getColorNom(this.guiaNom);
            // for (const itemNom of this.guiaNom) {
            //   // if (itemNom.state !== '39/1') {
            //   //   this.colorNom = false;
            //   //   break;
            //   // }else{
            //   //   this.colorNom = true;
            //   // }
            //   if (!itemNom.state) {
            //     this.colorNom = false;
            //     break;
            //   }else{
            //     this.colorNom = true;
            //   }
            // }
          const nomArray = this.formGuia.get('nom') as FormArray;
  
          this.guiaNom.forEach(element =>{
              const nomGuia = this.tc.group({
                id_guide: new FormControl(element.id_guide),
                list_id: new FormControl(element.list_id),
                state: new FormControl(element.state),
                rol_id: new FormControl(element.rol_id),
                ls_codvalue: new FormControl(element.val),
                form_id: new FormControl(element.form_id),
                obs_guia: new FormControl(element.obs_guia)


              });
              nomArray.push(nomGuia);
          });
         //-----------------------------------------------------------------
         
          // ----------------------------------Contabilidad---------------------------
          this.guiaCont = list.filter(guia => guia.list_id === 105);
            const nuevoArregloCont = this.listTeso.map(obj => {
            const numberCont = obj.complemento.slice(1, -1).split(",").map(Number);
            let exitsRolCont = numberCont.find(element => element == this.rol);

            if(exitsRolCont){
              this.rolCont = true;
            }
            return { ...obj, rol_id: numberCont };
          });
          this.getColorCont(this.guiaCont);
          // for (const itemCont of this.guiaCont) {
          //   // if (itemCont.state !== '39/1') {
          //   //   this.colorCont = false;
          //   //   break;
          //   // }else{
          //   //   this.colorCont = true;
          //   // }
          //   if (!itemCont.state) {
          //     this.colorCont = false;
          //     break;
          //   }else{
          //     this.colorCont = true;
          //   }
          // }
          const contArray = this.formGuia.get('cont') as FormArray;
  
          this.guiaCont.forEach(element =>{
              const contGuia = this.tc.group({
                id_guide: new FormControl(element.id_guide),
                list_id: new FormControl(element.list_id),
                state: new FormControl(element.state),
                rol_id: new FormControl(element.rol_id),
                ls_codvalue: new FormControl(element.val),
                form_id: new FormControl(element.form_id),
                obs_guia: new FormControl(element.obs_guia)
              });
              contArray.push(contGuia);
          });
          //-----------------------------------------------------------------
          
           // ----------------------------------SIG---------------------------
           this.guiaSig = list.filter(guia => guia.list_id === 106);
            const nuevoArregloSig = this.listSig.map(obj => {
            const numberSig = obj.complemento.slice(1, -1).split(",").map(Number);
            let exitsRolSig = numberSig.find(element => element == this.rol);

            if(exitsRolSig){
              this.rolSig = true;
            }
            return { ...obj, rol_id: numberSig };
          });
          this.getColorSig(this.guiaSig);
            // for(const itemSig of this.guiaSig){
            //     // if(itemSig.state !== '39/1'){
            //     //     this.colorSig = false;
            //     // }else{
            //     //   this.colorSig = true;
            //     // }
            //     if(!itemSig.state){
            //       this.colorSig = false;
            //   }else{
            //     this.colorSig = true;
            //   }
            // }
           const sigArray = this.formGuia.get('sig') as FormArray;
   
           this.guiaSig.forEach(element =>{
               const sigGuia = this.tc.group({
                 id_guide: new FormControl(element.id_guide),
                 list_id: new FormControl(element.list_id),
                 state: new FormControl(element.state),
                 rol_id: new FormControl(element.rol_id),
                 ls_codvalue: new FormControl(element.val),
                 form_id: new FormControl(element.form_id),
                 obs_guia: new FormControl(element.obs_guia)
               });
               sigArray.push(sigGuia);
           });
           //-----------------------------------------------------------------
           
            // -----------------------------ENTREGA ELEMENTOS---------------------------

            this.guiaElemt = list.filter(guia => guia.list_id === 107);
            this.getColorElement(this.guiaElemt);
            //  for(const itemElem of this.guiaElemt){
            //     //  if(itemElem.state !== '39/1'){
            //     //      this.colorElem = false;
            //     //  }else{
            //     //    this.colorElem = true;
            //     //  }
            //     if(!itemElem.state){
            //       this.colorElem = false;
            //   }else{
            //     this.colorElem = true;
            //   }
            //  }
            const elemArray = this.formGuia.get('elemt') as FormArray;
    
            this.guiaElemt.forEach(element =>{
                const elemGuia = this.tc.group({
                  id_guide: new FormControl(element.id_guide),
                  list_id: new FormControl(element.list_id),
                  state: new FormControl(element.state),
                  rol_id: new FormControl(element.rol_id),
                  ls_codvalue: new FormControl(element.val),
                  form_id: new FormControl(element.form_id),
                  obs_guia: new FormControl(element.obs_guia)
                });
                elemArray.push(elemGuia);
            });
            //-----------------------------------------------------------------
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
 
  
  onSubmitUpdate(){
    // this.formGuias.push(this.observa)
    // this.formGuias.forEach(element => {
    //   element.obs_guia = this.observa
      
    // });
    // console.log(this.formGuias.values['obs_guia'] = this.observa);
    
    let body = {
      tecno: this.formGuia.get('tecno').value,
      th:   this.formGuia.get('th').value,
      nom:  this.formGuia.get('nom').value,
      cont: this.formGuia.get('cont').value,
      sig:  this.formGuia.get('sig').value,
      elemt: this.formGuia.get('elemt').value,
      listas: [this.formSelec.value]
      
    }
    // console.log(body);
    
    
    if (this.formGuia.valid) {

      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idSig,body,{
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
  // mat:boolean= false;
  mat =RequiredValidator;
  // onSelectMat(e){
  //   this.mat = e

  
  getColorTecno(guiaTecno){
    for (const item of guiaTecno) {
     
      if (!item.state) {
        this.colorTecno = false;
        break;
      }else{
        this.colorTecno = true;
      }
    }
  }
  getColorTH(guiaTaHm){
    for (const itemTh of guiaTaHm) {
     
      if (!itemTh.state) {
        this.colorTH = false;
        break;
      }else{
        this.colorTH = true;
      }
    }
}
  getColorNom(guiaNom){
    for (const itemNom of guiaNom) {
      
      if (!itemNom.state) {
        this.colorNom = false;
        break;
      }else{
        this.colorNom = true;
      }
    }
  }
  getColorCont(guiaCont){
    for (const itemCont of guiaCont) {
    
      if (!itemCont.state) {
        this.colorCont = false;
        break;
      }else{
        this.colorCont = true;
      }
    }
}
  getColorSig(guiaSig){
    for(const itemSig of guiaSig){
     
      if(!itemSig.state){
        this.colorSig = false;
    }else{
      this.colorSig = true;
    }
  }
  }
  getColorElement(guiaElemt){
    for(const itemElem of guiaElemt){
      
      if(!itemElem.state){
        this.colorElem = false;
    }else{
      this.colorElem = true;
    }
   }
  }
  // getObservacion(index: number) {
  //   const thArray = this.formGuia.get('th') as FormArray;
  //   const thFormGroup = thArray.at(index) as FormGroup;
  //   const obsControl = thFormGroup.get('obs_guia');
  //   return obsControl.invalid && obsControl.touched;
  // }
  

}
