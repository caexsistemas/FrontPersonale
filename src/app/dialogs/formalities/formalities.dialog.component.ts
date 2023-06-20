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
  // managemenProcess: any = []
  // responsibleProcess:any = [];
  // sigProcess:any = [];
  // logProcess:any = [];
  // contactProcess:any = [];
  // comProcess:any = [];
  // comunProcess:any = [];
  // adminProcess:any = [];
  // talentProcess:any = [];
  // tecnoProcess:any = [];
  // fecPro:any = [];
  // fecEje:any =[];
  // typeNo:any = []
  // typeejc:any = []
  // typimp:any = []
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
        console.log(this.data);
        console.log(this.cuser);
        
        
      break;
      case "update":
        // console.log('===>',this.cuser);
        this.rol = this.cuser.role;
        // if(this.rol == 1 || this.rol == 4 || this.rol == 20){
        //   this.check = true;
        // }else if(this.rol == 7){
        //         this.checkTh = true;
        // }
        this.idSig = this.data.codigo;       
        this.initForms();
        this.title = "Actualizar Reporte de no conformidades";
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
              this.viewTh = this.verification.filter(guia => guia.list_id === 103);
              this.viewNom = this.verification.filter(guia => guia.list_id === 104);
              this.viewCont = this.verification.filter(guia => guia.list_id === 105);
              this.viewSig = this.verification.filter(guia => guia.list_id === 106);
              this.viewElem = this.verification.filter(guia => guia.list_id === 107);
              console.log(this.viewTecno);
              

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
      idPosition: new FormControl("", [Validators.required]),
      pro_res: new FormControl("",[Validators.required]),
      immediateBoss: new FormControl("",[Validators.required]),
      create_User: new FormControl(this.cuser.iduser),
    });
    // this.formGuia = new FormGroup({
    //   list_id:new FormControl(""),
    //   state:new FormControl(""),
    //   rol_id:new FormControl(""),
    //   form_id:new FormControl(""),
    //   ls_codvalue:new FormControl("")
    // })
    this.formGuia = this.fb.group({
      guias: this.fb.array([]) , // FormArray para almacenar los registros de guía
      tecno:this.fb.array([]),
      th: this.fb.array([]),
      nom: this.fb.array([]),
      cont: this.fb.array([]),
      sig: this.fb.array([]),
      elemt: this.fb.array([])
    });
    // this.formGuiaTecno = this.tc.group({
    //   tecno: this.tc.array([])
    // });
    // this.formGuiaTh = this.fb.group({
    //   th: this.fb.array([])
    // });
    // this.formGuiaNo = this.fb.group({
    //   nom: this.fb.array([])
    // });
    // this.formGuiaCon = this.fb.group({
    //   cont: this.fb.array([])
    // });
    // this.formGuiaSig = this.fb.group({
    //   sig: this.fb.array([])
    // });
  
    // this.guiaTecno.forEach(registro => {
    //   // Crear un nuevo FormGroup para cada registro utilizando el list_id como clave
    //   const registroFormGroup = new FormGroup({
    //     state: new FormControl(registro.state),
    //     rol_id: new FormControl(registro.rol_id),
    //     form_id: new FormControl(registro.form_id)
    //   });
    
    //   // Agregar el FormGroup del registro al FormGroup principal utilizando el list_id como clave
    //   this.formGroupRegistros.addControl(registro.list_id.toString(), registroFormGroup);
    // });
    
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      // idSel: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
        
          this.PersonaleInfo = data.data['getDataPersonale']; 
          // console.log('personal =>', this.PersonaleInfo);
          this.area = data.data["getArea"];
          this.idPosition = data.data["getPosition"];

          
        
          // this.typeRequisition = data.data["getRequisition"];sigProcess
          // this.typeMatriz      = data.data["getMatriz"].slice(0, 3);getFactorstateConf
          // this.state         = data.data['getCancel'].slice(5);

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
      // this.loading.emit(true);
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
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {

        this.formSelec.get('idPersonale').setValue(data.data['getPersonGuia'][0].idPersonale);
        this.formSelec.get('document').setValue(data.data['getPersonGuia'][0].document);
        this.formSelec.get('fec_ret').setValue(data.data['getPersonGuia'][0].fec_ret);
        this.formSelec.get('idPosition').setValue(data.data['getPersonGuia'][0].idPosition);
        this.formSelec.get('pro_res').setValue(data.data['getPersonGuia'][0].pro_res);
        this.formSelec.get('immediateBoss').setValue(data.data['getPersonGuia'][0].immediateBoss);

        this.processAct = data.data['getPersonGuia'][0].area;
        // data.data["getSelecUpdat"].forEach(element => {
              console.log('====>', this.processAct );
              
        //     this.formGuia.get("list_id").setValue(element.list_id);
        //     this.formGuia.get("state").setValue(element.state);
        //     this.formGuia.get("rol_id").setValue(element.rol_id);
        //     this.formGuia.get("ls_codvalue").setValue(element.ls_codvalue);
        // this.formGuia.get('list_id').setValue(data.data['getSelecUpdat'][0].list_id);
        //     });
           
        // prueba-----------------------------------------
        const list = data.data["getSelecUpdat"];

        const guiasArray = this.formGuia.get('guias') as FormArray;
        guiasArray.clear();
        // const guiasArray = this.formGuia.get('guias') as FormArray;

      list.forEach(element => {
        // Crear un FormGroup para cada registro de guía
        // console.log(element);
        
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
        // console.log('update => ',data.data["getSelecUpdat"]);
        this.rol
        // const rol_id = "[41,1]";
        // const numbers = rol_id.slice(1, -1).split(",").map(Number);

        // console.log(numbers); // [41, 1]

        this.guiaTecno = list.filter(guia => guia.list_id === 102);
        // const numbers = this.guiaTecno.rol_id.slice(1, -1).split(",").map(Number);
        // console.log(numbers);
        
        // console.log(this.guiaTecno);
        const nuevoArreglo = this.guiaTecno.map(obj => {
          const numbers = obj.rol_id.slice(1, -1).split(",").map(Number);
          // console.log( this.rol);
          // console.log( numbers);
          let exitsRol = numbers.find(element => element == this.rol);
          if(exitsRol){
            this.rolTecno = true;
          }
          return { ...obj, rol_id: numbers };
        });
        
        // console.log(nuevoArreglo);

        for (const item of this.guiaTecno) {
          if (item.state !== '39/1') {
            this.colorTecno = false;
            break;
          }else{
            this.colorTecno = true;
          }
        }
        const tecnoArray = this.formGuia.get('tecno') as FormArray;

        this.guiaTecno.forEach(element =>{   
            const tecnoGuia = this.tc.group({
              id_guide: new FormControl(element.id_guide),
              list_id: new FormControl(element.list_id),
              state: new FormControl(element.state),
              rol_id: new FormControl(element.rol_id),
              ls_codvalue: new FormControl(element.val),
              form_id: new FormControl(element.form_id)

            });
            tecnoArray.push(tecnoGuia);
            // console.log(tecnoArray);
            
        });
        //-----------------------------------------------------------------

        // ----------------------------------th---------------------------
       
        this.guiaTaHm = list.filter(guia => guia.list_id === 103);
        const nuevoArregloTH = this.guiaTecno.map(obj => {
          const numbersTH = obj.rol_id.slice(1, -1).split(",").map(Number);
        
          let exitsRol = numbersTH.find(element => element == this.rol);
          if(exitsRol){
            this.rolTH = true;
          }
          return { ...obj, rol_id: numbersTH };
        });


        // style color
        for (const itemTh of this.guiaTaHm) {
          if (itemTh.state !== '39/1') {
            this.colorTH = false;
            break;
          }else{
            this.colorTH = true;
          }
        }
        const thArray = this.formGuia.get('th') as FormArray;

        this.guiaTaHm.forEach(element =>{
            const thGuia = this.tc.group({
              id_guide: new FormControl(element.id_guide),
              list_id: new FormControl(element.list_id),
              state: new FormControl(element.state),
              rol_id: new FormControl(element.rol_id),
              ls_codvalue: new FormControl(element.val),
              form_id: new FormControl(element.form_id)

            });
            thArray.push(thGuia);
        });
        //-----------------------------------------------------------------

         // ----------------------------------Nomina---------------------------
         this.guiaNom = list.filter(guia => guia.list_id === 104);
         const nuevoArregloNom = this.guiaTecno.map(obj => {
          const numberNom = obj.rol_id.slice(1, -1).split(",").map(Number);
        
          let exitsRol = numberNom.find(element => element == this.rol);
          if(exitsRol){
            this.rolNom = true;
          }
          return { ...obj, rol_id: numberNom };
        });

          for (const itemNom of this.guiaNom) {
            if (itemNom.state !== '39/1') {
              this.colorNom = false;
              break;
            }else{
              this.colorNom = true;
            }
          }
         const nomArray = this.formGuia.get('nom') as FormArray;
 
         this.guiaNom.forEach(element =>{
             const nomGuia = this.tc.group({
               id_guide: new FormControl(element.id_guide),
               list_id: new FormControl(element.list_id),
               state: new FormControl(element.state),
               rol_id: new FormControl(element.rol_id),
               ls_codvalue: new FormControl(element.val),
               form_id: new FormControl(element.form_id)

             });
             nomArray.push(nomGuia);
         });
         //-----------------------------------------------------------------
         
          // ----------------------------------Nomina---------------------------
          this.guiaCont = list.filter(guia => guia.list_id === 105);
          const nuevoArregloCont = this.guiaTecno.map(obj => {
            const numberCont = obj.rol_id.slice(1, -1).split(",").map(Number);
          
            let exitsRol = numberCont.find(element => element == this.rol);
            if(exitsRol){
              this.rolCont = true;
            }
            return { ...obj, rol_id: numberCont };
          });

          for (const itemCont of this.guiaCont) {
            if (itemCont.state !== '39/1') {
              this.colorCont = false;
              break;
            }else{
              this.colorCont = true;
            }
          }
          const contArray = this.formGuia.get('cont') as FormArray;
  
          this.guiaCont.forEach(element =>{
              const contGuia = this.tc.group({
                id_guide: new FormControl(element.id_guide),
                list_id: new FormControl(element.list_id),
                state: new FormControl(element.state),
                rol_id: new FormControl(element.rol_id),
                ls_codvalue: new FormControl(element.val),
                form_id: new FormControl(element.form_id)

              });
              contArray.push(contGuia);
          });
          //-----------------------------------------------------------------
          
           // ----------------------------------SIG---------------------------
           this.guiaSig = list.filter(guia => guia.list_id === 106);
           const nuevoArregloSig = this.guiaTecno.map(obj => {
            const numberSig = obj.rol_id.slice(1, -1).split(",").map(Number);
          
            let exitsRol = numberSig.find(element => element == this.rol);
            if(exitsRol){
              this.rolSig = true;
            }
            return { ...obj, rol_id: numberSig };
          });

            for(const itemSig of this.guiaSig){
                if(itemSig.state !== '39/1'){
                    this.colorSig = false;
                }else{
                  this.colorSig = true;
                }
            }
           const sigArray = this.formGuia.get('sig') as FormArray;
   
           this.guiaSig.forEach(element =>{
               const sigGuia = this.tc.group({
                 id_guide: new FormControl(element.id_guide),
                 list_id: new FormControl(element.list_id),
                 state: new FormControl(element.state),
                 rol_id: new FormControl(element.rol_id),
                 ls_codvalue: new FormControl(element.val),
                 form_id: new FormControl(element.form_id)

               });
               sigArray.push(sigGuia);
           });
           //-----------------------------------------------------------------
           
            // -----------------------------ENTREGA ELEMENTOS---------------------------

            this.guiaElemt = list.filter(guia => guia.list_id === 107);
            console.log('***',this.guiaElemt);
            
            const nuevoArregloElem = this.guiaTecno.map(obj => {
             const numberElem = obj.rol_id.slice(1, -1).split(",").map(Number);
           
             let exitsRol = numberElem.find(element => element == this.rol);
             if(exitsRol){
               this.rolSig = true;
             }
             return { ...obj, rol_id: numberElem };
           });
 
             for(const itemElem of this.guiaElemt){
                 if(itemElem.state !== '39/1'){
                     this.colorElem = false;
                 }else{
                   this.colorElem = true;
                 }
             }
            const elemArray = this.formGuia.get('elemt') as FormArray;
    
            this.guiaElemt.forEach(element =>{
                const elemGuia = this.tc.group({
                  id_guide: new FormControl(element.id_guide),
                  list_id: new FormControl(element.list_id),
                  state: new FormControl(element.state),
                  rol_id: new FormControl(element.rol_id),
                  ls_codvalue: new FormControl(element.val),
                  form_id: new FormControl(element.form_id)
                });
                elemArray.push(elemGuia);
            });
            //-----------------------------------------------------------------
    
 

        // console.log('tecno => ',this.guiaTecno);
        // this.guiaTecno.forEach(element => {
        //   console.log(element.ls_codvalue);
        //   if(element.ls_codvalue ==='102/1' || element.ls_codvalue === '102/2' || element.ls_codvalue === '102/3' ){
        //     // this.formGuia.get("state").setValue(data.data["getSelecUpdat"][0].state);
            // this.formGuia.get("list_id").setValue(data.data["getSelecUpdat"][0].list_id);
            // this.formGuia.get("state").setValue(data.data["getSelecUpdat"][0].state);
            // this.formGuia.get("rol_id").setValue(data.data["getSelecUpdat"][0].rol_id);
            // this.formGuia.get("ls_codvalue").setValue(data.data["getSelecUpdat"][0].ls_codvalue);
        //   }

          
        // });
        // this.guiaTaHm = list.filter(guia => guia.list_id === 103);
        // console.log('th =>', this.guiaTaHm);
        
        // this.guiaNom = list.filter(guia => guia.list_id === 104);
        // this.guiaCont = list.filter(guia => guia.list_id === 105);
        // this.guiaSig = list.filter(guia => guia.list_id === 106);
        this.afirm = data.data["afirmative"];
        
        // this.formGuia.get("list_id").setValue(data.data["getSelecUpdat"][0].list_id);
        // this.formGuia.get("state").setValue(data.data["getSelecUpdat"][0].state);
        // this.formGuia.get("rol_id").setValue(data.data["getSelecUpdat"][0].rol_id);
        // this.formGuia.get("ls_codvalue").setValue(data.data["getDataUpda"][0].ls_codvalue);
        
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  formGuias: { id_guide: number, state: string, form_id:string }[] = [];
  openDialog(id_guide: number, state: string, form_id:string){
    console.log(id_guide,'=>', state, '**', form_id);
     this.formGuias.push({id_guide: id_guide,state: state, form_id:form_id })
    

  }
  onSubmitUpdate(){

    let body = {
      listas: this.formGuias
      
    }
    
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

  // }
  
  // onSelectionAttributes(event){
  //  // gerencia 14/17
  //  //sig 14/5
   
  //  if(event == '14/17'){
  //       this.responsibleProcess =  this.managemenProcess;
  //     }else if(event == '14/5'){
  //       this.responsibleProcess = this.sigProcess;
  //       }else if(event == '14/22'){
  //         this.responsibleProcess = this.logProcess;
  //         }else if (event == '14/23'){
  //           this.responsibleProcess = this.comProcess;
  //          }else if(event == '14/24'){
  //           this.responsibleProcess = this.comunProcess;
  //           }else if(event == '14/25'){
  //             this.responsibleProcess = this.adminProcess;
  //            }else if (event == '14/4'){
  //             this.responsibleProcess = this.tecnoProcess;
  //             }else if ( event == '14/6'){
  //               this.responsibleProcess = this.talentProcess;
  //               }else if(event == '14/1'){
  //                 this.responsibleProcess = this.contactProcess;
                
  //             }else{
  //               this.responsibleProcess = null;
  //             }
    
  
  // }
  // onSelectionImplement(event){
  //   this.fecPro = event
  //   this.onSelectionClosing(this.fecPro,this.fecEje);
    

  // }
  // onSelectionEjecc(event){
  //   this.fecEje = event;
  //  this.onSelectionClosing(this.fecPro,this.fecEje);

  // }
  
  // onSelectionClosing(imp,ejec){
  //   this.typeejc = new Date(ejec)
  //   this.typimp = new Date(imp)
   

  //   if(this.typeejc <=  this.typimp){
  //         this.typeNo = 'Oportuno';
  //         this.formSelec.get('opo_cier').setValue( this.typeNo);
          
  //   }else if ( this.typeejc > this.typimp){
  //         this.typeNo = 'Inoportuno';
  //         this.formSelec.get('opo_cier').setValue( this.typeNo);

  //   }else{
  //     this.cierr = null;
  //   }
    

  // }
  // onSelectionPerson(event){
  //   let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
  //   if( exitsPersonal ){
  //       this.formTraining.get('idPersonale').setValue(exitsPersonal.idPersonale);       
  //   }        
  // }
  getDocuInvalid(){
      //  return this.formSelec.get('car_sol').invalid && this.formSelec.get('car_sol').touched;
  }
  getTypeInvalid(){
    // return this.formSelec.get('tip_req').invalid && this.formSelec.get('tip_req').touched;
}
  getSalaryInvalid(){
    // return this.formSelec.get('salary').invalid && this.formSelec.get('salary').touched;
  }
  getNumInvalid(){
    // return this.formSelec.get('num_vac').invalid && this.formSelec.get('num_vac').touched;
}
  getJustInvalid(){
    // return this.formSelec.get('justification').invalid && this.formSelec.get('justification').touched;
  }


}
