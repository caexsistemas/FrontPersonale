import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList, ViewEncapsulation  } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { global } from '../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FeedbackDialog } from '../../dialogs/feedback/feedback.dialog.component';
import { startOfMonth, startOfWeek, addDays, differenceInCalendarWeeks } from 'date-fns';

export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-rqcalidad',
  templateUrl: './rqcalidad.dialog.component.html',
  styleUrls: ['./rqcalidad.component.css']
})
export class RqcalidadDialog  {

  endpoint:      string = '/rqcalidad';
  maskDNI        = global.maskDNI;
  view:          string = null;
  diag:          string = null;
  title:         string = null;
  formProces:    FormGroup;
  formEscuch:    FormGroup;
  formProcesDialog:    FormGroup;
  dateMoni:      string;
  idPam:         number = null;
  displayedColumns:any  = [];
  historyMon:    any = [];
  dataCad:       any = []; 
  public clickedRows;
  lisTipogesCla: any = [];
  lisTiporedCla: any = [];
  lisCalifica:   any = [];
  istSinoclar:   any = [];
  listSinomr:    any = [];
  listEscala:    any = [];
  listipomatriz: any = [];
  ListtipificaMovil:  any = [];
  ListtipificaHogar:  any = [];
  ListtipificaTYT:  any = [];
  personalData:     any = [];
  Listipocampana:   any = [];
  ListipifiHogarDed: any = [];
  ListTipiConsHogar: any = [];
  ListTodoclaro:     any = [];
  supervisor:        any = [];
  formador :         any = [];
  ListTipDiag:       any = [];
  LisTipContrato:    any = [];
  numberOfDays: number = 0;


  //String Date
  dateStrinMoni: String = "";
 //Datos Generales
  conCumpleGen:     number = 0;
  conNoCumpGen:     number = 0;
  conNoACumGen:     number = 0;
  campGeneralAny:   any = [                   
                          'atn_ama_emp',
                          'tyt_ate_ama_emp',
                          'atn_gest_tim'
                          ];
  //Datos Procesos
  conCumplePro:     number = 0;
  conNoCumpPro:     number = 0;
  conNoACumPro:     number = 0;
  campProcesosAny:  any = [
                          'hab_dej_exp_rea_preg',
                          'tyt_hab_com_int_con_nes_cli',
                          'tyt_hab_com_esc_act_par_con_nec_cli',
                          'hab_esc_act_par_con_nec_cli'                                            
                          ];
  //Datos Criticos
  contCriticos:     number = 0;
  cammpCriticoAny:  any = [
                          'proc_brin_inf_corr_com_pro_ofer',
                          'hab_man_de_obj',
                          'proc_brin_inf_corr_com_pro_ofer',
                          'tyt_hab_com_man_obj',
                          'cri_rea_dev_lla',
                          'cie_cie_com'
                          ];
  //(A2)
  campAinfo:        any = [
                          'tyt_hab_com_met_pag',
                          'cri_val_tit',
                          'tyt_cie_rea_res_ges',
                          'proc_res_ben_tod_cla',
                          'cri_gui_tra_dat',
                          'proc_rea_res_ges',
                          'cie_ofr_adi',
                          'proc_rea_ofr_ven_cru',
                          'cri_fal_exp_mal_pra',
                          'cri_val_cor_cob'
                          ];

  //Observacion
  observAspect:     string = "";
  //Tipo Matriz
  tipMatriz:        string = "";
  component = "/callcenter/rqcalidad";
  oculcap: String = "conhidden";
  oculori: String = "";
  customer:boolean;
  contrato: any = [];
  weekNumber: number;
  
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null
  }
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @Output() loadingtwo = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();


  constructor(public dialogRef: MatDialogRef<RqcalidadDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog) { 

          this.view  = this.data.window;
          this.idPam = null;
          this.diag  = this.data.dialogo;
  
          switch (this.view) {
            case 'create':
                this.tipMatriz = this.data.tipoMat;
                this.initForms();
                //Calidad PQ Calidad
                if(this.diag == '141/1'){
                  this.view = "create";
                  if( this.tipMatriz  == '40/1' ){
                    this.title = "MATRIZ DE CALIDAD CLARO CONVERGENCIA (MOVIL)";
                  }else if( this.tipMatriz  == '40/2' ){
                    this.title = "MATRIZ DE CALIDAD CLARO CONVERGENCIA (HOGAR)";
                  }else{
                    this.title = "MATRIZ DE CALIDAD CLARO CONVERGENCIA (T&T)";
                  }
                }else{
                  //Calidad Customer
                  this.view = "createCus";
                  if( this.tipMatriz  == '40/1' ){
                    this.title = "MEDICION CUSTOMER CLARO CONVERGENCIA (MOVIL)";
                  }else if( this.tipMatriz  == '40/2' ){
                    this.title = "MEDICION CUSTOMER CLARO CONVERGENCIA (HOGAR)";
                  }else{
                    this.title = "MEDICION CUSTOMER CLARO CONVERGENCIA (T&T)";
                  }
                }

            break;
            case 'update':
                this.tipMatriz = this.data.tipoMat;
                this.idPam = this.data.codigo;
                this.initForms();
                //Calidad PQ Calidad
                if(this.diag == '141/1'){
                  this.view = "update";
                  this.title = "EDITAR MATRIZ DE CALIDAD CLARO CONVERGENCIA";
                  // console.log("update")
                  // console.log(this.diag)
                }else{
                  this.view = "updateCus";
                  this.title = "EDITAR MEDICION CUSTOMER CLARO CONVERGENCIA";
                }     
            break;
            case 'view':
                this.idPam = this.data.codigo;
                //Calidad PQ Calidad
                if(this.diag == '141/1'){
                  this.view = "view";
                }else{
                  this.view = "viewCus";
                }     
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.idPam, {
                  token: this.cuser.token,
                  idUser: this.cuser.iduser,
                  modulo: this.component,
                  role: this.cuser.role
                })
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.dataCad = data.data['getDatPer'][0];
                                
                                (this.dataCad.tipo_gestion === 'No Venta') ? this.customer = true : this.customer = false;
                                this.tipMatriz = this.dataCad.matrizarp_cod;
                                this.generateTable(data.data['getDatHistory']);   
                                this.loading.emit(false);
                            } else {
                                this.handler.handlerError(data);
                                this.closeDialog(); 
                                this.loading.emit(false);
                            }
                        },
                        error => {
                            this.handler.showError('Se produjo un error '+error);
                            this.loading.emit(false);
                        }
                    );
            break;
            case 'updatesub':   
                this.idPam = this.data.codigo;  
                this.tipMatriz = this.data.tipoMat;
                this.title = "Crear Retroalimentación: ";       
                this.getdataIniRetro(this.idPam);
                this.initFormsRetro();              
            break;
            case 'viewsub':   
                this.idPam = this.data.codigo; 
                this.tipMatriz = this.data.tipoMat;
                this.title = "Detalle Retroalimentación";       
                this.getdataIniRetro(this.idPam);                                           
            break;
            case 'refutar':   
                this.idPam = this.data.codigo; 
                this.tipMatriz = this.data.tipoMat;
                this.title = "Detalle Retroalimentación";    
                this.loading.emit(false);
        // this.dialogRef.close();


                // this.getdataIniRetro(this.idPam);                                           
            break;
          }
  }
  /*
    Formulario Retroalimentacion
  */

  initViewRetro(){


  }

  initFormsRetro(){
    let date = new Date();
    this.dateStrinMoni = date.getFullYear()+'-'+String(date.getMonth() + 1).padStart(2, '0')+'-'+String(date.getDate()).padStart(2, '0');

    this.formProcesDialog = new FormGroup({
      descri_pda: new FormControl(""),
      compr_ases: new FormControl(""),
      creatRetro: new FormControl(this.cuser.iduser),
      fecha_pda: new FormControl(this.dateStrinMoni),
      retro_call: new FormControl(''),
      refute: new FormControl(''),

    });
  }

  getdataIniRetro(id){

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint + '/' + id, {
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      role: this.cuser.role
    })
        .subscribe(
            data => {
                if (data.success == true) {
                    this.dataCad = data.data['getDatPer'][0];

                    this.loading.emit(false);
                } else {
                    this.handler.handlerError(data);
                    this.closeDialog(); 
                    this.loading.emit(false);
                }
            },
            error => {
                this.handler.showError('Se produjo un error '+error);
                this.loading.emit(false);
            }
        );
  }

  onSubmitUpdateSub(){

    let body = {
        salud: this.formProcesDialog.value  
    }
    if (this.formProcesDialog.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idPam,body,{
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
        role: this.cuser.role
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
              this.handler.showError(error);
              this.loading.emit(false);
          }
      );
    }else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
    }
  }

  initForms(){  

    this.getDataInit();
    this.formProces = new FormGroup({
      createUser: new FormControl(this.cuser.iduser),
      matrizarp: new FormControl(this.tipMatriz),
      tip_dialog: new FormControl(this.diag),
      tipo_gestion: new FormControl(""),
      tipo_red: new FormControl(""),
      document: new FormControl(""),
      login: new FormControl(""), 
      name: new FormControl(""), 
      coordinator: new FormControl(""), 
      campana: new FormControl(""),
      tmo: new FormControl(""), 
      call_id: new FormControl(""), 
      min_bill: new FormControl(""), 
      week: new FormControl(""), 
      analyst: new FormControl(this.cuser.user), 
      offer: new FormControl(""), 
      monitoring_date: new FormControl(this.dateStrinMoni), 
      call_date: new FormControl(""), 
      all_clear_offer: new FormControl(""), 
      final_note: new FormControl(""), 
      creation_date: new FormControl(""), 
      //Atencion
      atn_sal: new FormControl(""),
      atn_cont_ini: new FormControl(""), 
      atn_ama_emp: new FormControl(""), 
      atn_gest_tim: new FormControl(""), 
      tyt_ate_con_ini: new FormControl(""),
      tyt_ate_ama_emp: new FormControl(""),
      //Habilidad Comercial
      hab_dej_exp_rea_preg: new FormControl(""), 
      hab_esc_act_par_con_nec_cli: new FormControl(""), 
      hab_man_de_obj: new FormControl(""),
      tyt_hab_com_int_con_nes_cli: new FormControl(""),
      tyt_hab_com_met_pag: new FormControl(""),
      tyt_hab_com_esc_act_par_con_nec_cli: new FormControl(""),
      tyt_hab_com_man_obj: new FormControl(""),
      //Proceso De Venta
      proc_brin_inf_corr_com_pro_ofer: new FormControl(""), 
      proc_brin_inf_corr_cam_vig: new FormControl(""), 
      proc_brin_inf_corr_tar: new FormControl(""), 
      proc_brin_inf_corr_fac: new FormControl(""), 
      proc_brin_inf_corr_com_port: new FormControl(""), 
      proc_brin_inf_corr_tie_ent_act_ac: new FormControl(""), 
      proc_brin_inf_com_corr_otr_sol: new FormControl(""), 
      proc_brin_inf_otr_pro: new FormControl(""), 
      proc_res_ben_tod_cla: new FormControl(""), 
      proc_rea_ofr_ven_cru: new FormControl(""), 
      proc_rea_res_ges: new FormControl(""), 
      hogar_pro_ven_bri_inf_cor_tie_ins_apr: new FormControl(""),
      tyt_pro_ven_bri_inf_cor_ben_ban_vig: new FormControl(""),
      tyt_pro_ven_bri_inf_cor_ent_equ: new FormControl(""),
      //Cierre
      cie_cie_com: new FormControl(""), 
      cie_ofr_adi: new FormControl(""), 
      cie_des: new FormControl(""), 
      tyt_cie_cod: new FormControl(""),
      tyt_cie_rea_res_ges:new FormControl(""),
      //Criticos
      cri_ama: new FormControl(""),
      cri_uso_corr_tod_cla: new FormControl(""), 
      cri_aba_lla: new FormControl(""), 
      cri_rea_dev_lla: new FormControl(""), 
      cri_gui_tra_dat: new FormControl(""), 
      cri_val_tit: new FormControl(""), 
      cri_val_cor_cob: new FormControl(""), 
      cri_fal_exp_mal_pra: new FormControl(""), 
      tyt_cri_fra_com_seg_pol_fra:new FormControl(""),
      //Fomularios sino Movil
      ns_pre: new FormControl(""), 
      ns_tod_cla: new FormControl(""), 
      ns_pow: new FormControl(""), 
      ns_sim_adq: new FormControl(""), 
      ns_afi_tod_cla: new FormControl(""), 
      ns_val_ide: new FormControl(""), 
      ns_esc_sal: new FormControl(""), 
      ns_esc_ama: new FormControl(""), 
      ns_esc_des: new FormControl(""), 
      ns_lec_con: new FormControl(""), 
      ns_cla_per: new FormControl(""), 
      ns_ofr_esc: new FormControl(""), 
      //Formulario sino Hogar
      hogar_vent_tec: new FormControl(""),
      hogar_tod_cla: new FormControl(""),
      hogar_tv: new FormControl(""),
      hogar_tel: new FormControl(""),
      hogar_int: new FormControl(""),
      hogar_val_ide: new FormControl(""),
      hogar_esc_sal: new FormControl(""),
      hogar_esc_ama: new FormControl(""),
      hogar_esc_des: new FormControl(""),
      hogar_can_pre: new FormControl(""),
      hogar_ult_wif: new FormControl(""),
      hogar_ofr_esc: new FormControl(""),
      //Formulario sino TYT
      tyt_ven_tec: new FormControl(""),
      tyt_tod_cla: new FormControl(""),
      tyt_tv: new FormControl(""),
      tyt_tel: new FormControl(""),
      tyt_int: new FormControl(""),
      tyt_val_ide: new FormControl(""),
      tyt_esc_sal: new FormControl(""),
      tyt_esc_ama: new FormControl(""),
      tyt_esc_des: new FormControl(""),
      tyt_cla_up: new FormControl(""),
      tyt_ult_wif: new FormControl(""),
      //Tpipificacion
      tip_reg_min: new FormControl(""), 
      tip_correcta: new FormControl(""), 
      tip_correctamente: new FormControl(""), 
      //Observaciones
      obs_obs: new FormControl(""), 
      obs_asp_pos: new FormControl(""),
      //Aspectps Positivos
      asp_pos_sal: new FormControl(false), 
      asp_pos_des: new FormControl(false), 
      asp_pos_eti_tel: new FormControl(false), 
      asp_pos_cre_emp_con_cli: new FormControl(false),
      asp_pos_fel: new FormControl(false),
      asp_pos_rea_cie_cor: new FormControl(false),
      asp_pos_per_man_cor: new FormControl(false),
      asp_pos_men_ben_ofe_tod_cla: new FormControl(false),
      asp_pos_sol_reg_dat_tit: new FormControl(false),
      asp_pos_es_tol: new FormControl(false),
      asp_pos_bue_ton_voz: new FormControl(false),
      asp_pos_man_obj_cli_gen_cie: new FormControl(false),
      asp_pos_man_con_seg_lla: new FormControl(false), 
      asp_pos_bri_inf_cor_ser_ofe: new FormControl(false),
      asp_pos_rea_lec_cor_con: new FormControl(false),
      asp_pos_apl_lin_mod_gana: new FormControl(false),
      //Nuevo Campos
      reciente: new FormControl(""),
      moti_afect: new FormControl(""),
      nom_base: new FormControl(""),
      id_venta: new FormControl(""),
      mancorrven: new FormControl(""),
      postucall: new FormControl(""),
      retro_call: new FormControl(""),
      //campos supervisor y formadores 
      supervisor: new FormControl(""),
      formador: new FormControl(""),
      formador_tw: new FormControl(""),
      phone: new FormControl(""),
      tip_solicitud: new FormControl(""),
      obs_customer: new FormControl(""),
      tip_contrato: new FormControl(""),
      voz_cliente:new FormControl(""),
      refute: new FormControl(""),


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

  //Acording
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

  getDataInit(){

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamPrew',
        tipMat: this.tipMatriz,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
    })
    .subscribe(
       
        data => {
            if (data.success == true) {
                //DataInfo
                this.lisTipogesCla = data.data['tipgescla']; //32
                this.lisTiporedCla = data.data['tipredcla']; //33
                this.lisCalifica   = data.data['califclaro']; //34
                this.istSinoclar   = data.data['snclaro']; // 35
                this.listSinomr    = data.data['sntipica']; //17
                this.listEscala    = data.data['escalaclaro']; //36
                this.listipomatriz = data.data['tipmatriz']; //40
                this.ListtipificaMovil  = data.data['tipificaMovil']; //41   
                this.ListtipificaHogar = data.data['tipificaHogar'];  //42
                this.ListtipificaTYT = data.data['tipificaTYT'];  //43
                this.Listipocampana = data.data['tipicampana'];  //44
                this.ListipifiHogarDed = data.data['tipificaHogarDed'];  //45
                this.ListTodoclaro = data.data['ofertodcla'];  //45
                this.personalData = data.data['getDataPersonal'];  //Data Personal
                this.supervisor = data.data['getSupervisor'];//Data Supervisor 
                this.formador = data.data['getFomacion']; //Data Formacion 
                this.ListTipDiag = data.data['gessClar']; //gestion escucha
                this.LisTipContrato = data.data['tipcontrato']; //Tipo Contrato
                this.contrato = data.data['contrato']; //Tipo Contrato
                //Fecha
                let date = new Date();
                this.dateStrinMoni = date.getFullYear()+'-'+String(date.getMonth() + 1).padStart(2, '0')+'-'+String(date.getDate()).padStart(2, '0');
                this.formProces.get('monitoring_date').setValue(this.dateStrinMoni);
    
              if (this.view == 'update' || this.view == 'updateCus') {
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

  closeDialog() {
    this.dialogRef.close();
  }

  validcheked(){
  
    //Valor (G)
    let sum_G   = 0.1;
    let sum_AU  = 0.125;
    let sum_N   = 0.0875;
    let sum_AD  = 0.029;
    let sum_ADT = 0.04;
    //Total Informacion
    let total_G   = 0;
    let total_AU  = 0;
    let total_N   = 0;
    let total_AD  = 0;
    let total_ADT = 0;
    //Contador
    let cump_G   = 0;
    let noap_G   = 0;
    let cump_AU  = 0;
    let noap_AU  = 0;
    let cump_N   = 0;
    let noap_N   = 0;
    let cump_AD = 0;
    let noap_AD = 0;
    let cump_ADT = 0;
    let noap_ADT = 0;
    //Nueva Sumatoria
    let val_G   = 2;
    let val_AU  = 2;
    let val_N   = 4;
    let val_AD  = 7;
    let val_ADT = 5;


    let Total    = 0;

    for (const field in this.formProces.controls) { 

      //(G)
      if( this.campGeneralAny.indexOf(field) !== -1 ){
        if( this.formProces.controls[field].value == '34/1' ){cump_G++;} else 
        if( this.formProces.controls[field].value == '34/3' ){noap_G++;}    
      }
      //(A1)
      if( this.campProcesosAny.indexOf(field) !== -1 ){
        if( this.formProces.controls[field].value == '34/1' ){cump_AU++;} else 
        if( this.formProces.controls[field].value == '34/3' ){noap_AU++;}    
      }
      //(N)
      if( this.cammpCriticoAny.indexOf(field) !== -1 ){
        if( this.formProces.controls[field].value == '34/1' ){cump_N++;} else 
        if( this.formProces.controls[field].value == '34/3' ){noap_N++;}    
      }
      //(A2) 
      if( this.campAinfo.indexOf(field) !== -1 && this.tipMatriz != '40/3' ){
        if( this.formProces.controls[field].value == '34/1' ){cump_AD++;} else 
        if( this.formProces.controls[field].value == '34/3' ){noap_AD++;}    
      }
      //(A2) (TYT)
      if( this.campAinfo.indexOf(field) !== -1 && this.tipMatriz == '40/3' ){
        if( this.formProces.controls[field].value == '34/1' ){cump_ADT++;} else 
        if( this.formProces.controls[field].value == '34/3' ){noap_ADT++;} 
      }

    }

    //Sumatoria valores 
    /*total_G   = (sum_G * cump_G) + (sum_G * noap_G);
    total_AU  = (sum_AU * cump_AU) + (sum_AU * noap_AU);
    total_N   = (sum_N * cump_N) + (sum_N * noap_N);
    total_AD  = (sum_AD * cump_AD) + (sum_AD * noap_AD);
    total_ADT = (sum_ADT * cump_ADT) + (sum_ADT * noap_ADT);*/

    total_G   = 20/(val_G-noap_G)*cump_G;
    if( isNaN(total_G) ){
      total_G = 0;
    }
    total_AU  = 25/(val_AU-noap_AU)*cump_AU;
    if( isNaN(total_AU) ){
      total_AU = 0;
    }
    total_N   = 35/(val_N-noap_N)*cump_N;
    if( isNaN(total_N) ){
      total_N = 0;
    }
    total_AD  = 20/(val_AD-noap_AD)*cump_AD;
    if( isNaN(total_AD) ){
      total_AD = 0;
    }
    total_ADT = 20/(val_ADT-noap_ADT)*cump_ADT;
    if( isNaN(total_ADT) ){
      total_ADT = 0;
    }
    //Malas practicas y Espectativas
    if( this.formProces.value.cri_fal_exp_mal_pra == "34/2" || this.formProces.value.cri_val_cor_cob == "34/2" ){
      this.oculori = "conhidden";
      this.oculcap = "convisual";
    }else{
      this.oculori = "convisual";
      this.oculcap = "conhidden";
    }

    Total = total_G + total_AU + total_N + total_AD + total_ADT;
    this.formProces.get('final_note').setValue(Math.round(Total));

    
  }

  onSelectLabor(){

    if( this.formProces.value.tip_reg_min == this.formProces.value.tip_correcta ){
      this.formProces.get('tip_correctamente').setValue('17/1');
    }else{
      this.formProces.get('tip_correctamente').setValue('17/0');
    }
  }

  validAsPect(){
    this.observAspect = "";
    if(this.formProces.value.asp_pos_sal == true){
      this.observAspect = this.observAspect + "Realiza saludo de manera correcta. * ";
    }
    if(this.formProces.value.asp_pos_des == true){
      this.observAspect = this.observAspect + "Se despide siguiendo los lineaminetos de la campaña * ";
    }
    if(this.formProces.value.asp_pos_eti_tel == true){
      this.observAspect = this.observAspect + "Hace uso adecuado de etiqueta telefónica y es cortes con el cliente. * ";
    }
    if(this.formProces.value.asp_pos_cre_emp_con_cli == true){
      this.observAspect = this.observAspect + "Crea empatía con el cliente en el trascurso de la llamada. * ";
    }
    if(this.formProces.value.asp_pos_fel == true){
      this.observAspect = this.observAspect + "Felicitaciones por tu buena gestión. * ";
    }
    if(this.formProces.value.asp_pos_rea_cie_cor == true){
      this.observAspect = this.observAspect + "Maneja cierres/precierres comerciales de manera adecuada. * ";
    }
    if(this.formProces.value.asp_pos_per_man_cor == true){
      this.observAspect = this.observAspect + "Perfila de manera correcta al cliente, realizando preguntas filtro que identifique la necesidad * ";
    }
    if(this.formProces.value.asp_pos_men_ben_ofe_tod_cla == true){
      this.observAspect = this.observAspect + "Menciona beneficios de la oferta Todo Claro. * ";
    }
    if(this.formProces.value.asp_pos_sol_reg_dat_tit == true){
      this.observAspect = this.observAspect + "Solicita y registra los datos del titular de manera adecuada. * ";
    }
    if(this.formProces.value.asp_pos_es_tol == true){
      this.observAspect = this.observAspect + "Es tolerante con el cliente en todo momento. * ";
    }
    if(this.formProces.value.asp_pos_bue_ton_voz == true){
      this.observAspect = this.observAspect + "Mantiene un buen tono de voz. * ";
    }
    if(this.formProces.value.asp_pos_man_obj_cli_gen_cie == true){
      this.observAspect = this.observAspect + "Maneja objeciones informando los beneficios y ventajas de los servicios ofertados. * ";
    }
    if(this.formProces.value.asp_pos_man_con_seg_lla == true){
      this.observAspect = this.observAspect + "El asesor mantiene concentración y seguridad en la llamada. * ";
    }
    if(this.formProces.value.asp_pos_bri_inf_cor_ser_ofe == true){
      this.observAspect = this.observAspect + "Suministra información correcta durante la llamada. * ";
    }
    if(this.formProces.value.asp_pos_rea_lec_cor_con == true){
      this.observAspect = this.observAspect + "Realiza la lectura correcta del contrato, sin omitir, abreviar o agregar partes. * ";
    }
    if(this.formProces.value.asp_pos_apl_lin_mod_gana == true){
      this.observAspect = this.observAspect + "Aplica los lineamientos del modelo G.A.N.A. * ";
    }

    this.formProces.get('obs_asp_pos').setValue(this.observAspect);
  }

  onSubmi(){
      if (this.formProces.valid) {
        this.loading.emit(true);
        let body = {
            pqcalidad: this.formProces.value             
        }
        this.handler.showLoadin("Guardando Registro", "Por favor espere...");
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
            );
      }else {
          this.handler.showError('Complete la informacion necesaria' + this.formProces.valid);
          this.loading.emit(false);
      }
  }

  getDataUpdate(){
    
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamUpdateSet',
        id: this.idPam,
        tipMat: this.tipMatriz,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
    })
    .subscribe(
        data => {

          this.formProces.get('matrizarp').setValue(data.data['getDataUpda'][0].matrizarp);
          //this.tipMatriz = data.data['getDataUpda'][0].matrizarp_cod;
          this.formProces.get('tipo_gestion').setValue(data.data['getDataUpda'][0].tipo_gestion);
          this.formProces.get('tipo_red').setValue(data.data['getDataUpda'][0].tipo_red);
          this.formProces.get('document').setValue(data.data['getDataUpda'][0].document);
          this.formProces.get('login').setValue(data.data['getDataUpda'][0].login);
          //this.formProces.get('name').setValue(data.data['getDataUpda'][0].name);
          //this.formProces.get('coordinator').setValue(data.data['getDataUpda'][0].coordinator);
          this.formProces.get('campana').setValue(data.data['getDataUpda'][0].campana);
          this.formProces.get('tmo').setValue(data.data['getDataUpda'][0].tmo);
          this.formProces.get('call_id').setValue(data.data['getDataUpda'][0].call_id);
          this.formProces.get('min_bill').setValue(data.data['getDataUpda'][0].min_bill);
          //this.formProces.get('week').setValue(data.data['getDataUpda'][0].week);
          this.formProces.get('analyst').setValue(data.data['getDataUpda'][0].analyst);
          this.formProces.get('offer').setValue(data.data['getDataUpda'][0].offer);
          this.formProces.get('monitoring_date').setValue(data.data['getDataUpda'][0].monitoring_date);
          this.formProces.get('call_date').setValue(data.data['getDataUpda'][0].call_date);
          this.formProces.get('all_clear_offer').setValue(data.data['getDataUpda'][0].all_clear_offer);
          this.formProces.get('final_note').setValue(data.data['getDataUpda'][0].final_note);
          this.formProces.get('creation_date').setValue(data.data['getDataUpda'][0].creation_date);
          //Atencion
          this.formProces.get('atn_sal').setValue(data.data['getDataUpda'][0].atn_sal);
          this.formProces.get('atn_cont_ini').setValue(data.data['getDataUpda'][0].atn_cont_ini);
          this.formProces.get('atn_ama_emp').setValue(data.data['getDataUpda'][0].atn_ama_emp);
          this.formProces.get('atn_gest_tim').setValue(data.data['getDataUpda'][0].atn_gest_tim);
          this.formProces.get('tyt_ate_con_ini').setValue(data.data['getDataUpda'][0].tyt_ate_con_ini);
          this.formProces.get('tyt_ate_ama_emp').setValue(data.data['getDataUpda'][0].tyt_ate_ama_emp);
          //Habilidad Comercial
          this.formProces.get('hab_dej_exp_rea_preg').setValue(data.data['getDataUpda'][0].hab_dej_exp_rea_preg);
          this.formProces.get('hab_esc_act_par_con_nec_cli').setValue(data.data['getDataUpda'][0].hab_esc_act_par_con_nec_cli);
          this.formProces.get('hab_man_de_obj').setValue(data.data['getDataUpda'][0].hab_man_de_obj);
          this.formProces.get('tyt_hab_com_int_con_nes_cli').setValue(data.data['getDataUpda'][0].tyt_hab_com_int_con_nes_cli);
          this.formProces.get('tyt_hab_com_met_pag').setValue(data.data['getDataUpda'][0].tyt_hab_com_met_pag);
          this.formProces.get('tyt_hab_com_esc_act_par_con_nec_cli').setValue(data.data['getDataUpda'][0].tyt_hab_com_esc_act_par_con_nec_cli);
          this.formProces.get('tyt_hab_com_man_obj').setValue(data.data['getDataUpda'][0].tyt_hab_com_man_obj);
          //Proceso De Venta
          this.formProces.get('proc_brin_inf_corr_com_pro_ofer').setValue(data.data['getDataUpda'][0].proc_brin_inf_corr_com_pro_ofer);
          this.formProces.get('proc_brin_inf_corr_cam_vig').setValue(data.data['getDataUpda'][0].proc_brin_inf_corr_cam_vig);
          this.formProces.get('proc_brin_inf_corr_tar').setValue(data.data['getDataUpda'][0].proc_brin_inf_corr_tar);
          this.formProces.get('proc_brin_inf_corr_fac').setValue(data.data['getDataUpda'][0].proc_brin_inf_corr_fac);
          this.formProces.get('proc_brin_inf_corr_com_port').setValue(data.data['getDataUpda'][0].proc_brin_inf_corr_com_port);
          this.formProces.get('proc_brin_inf_corr_tie_ent_act_ac').setValue(data.data['getDataUpda'][0].proc_brin_inf_corr_tie_ent_act_ac);
          this.formProces.get('proc_brin_inf_com_corr_otr_sol').setValue(data.data['getDataUpda'][0].proc_brin_inf_com_corr_otr_sol);
          this.formProces.get('proc_brin_inf_otr_pro').setValue(data.data['getDataUpda'][0].proc_brin_inf_otr_pro);
          this.formProces.get('proc_res_ben_tod_cla').setValue(data.data['getDataUpda'][0].proc_res_ben_tod_cla);
          this.formProces.get('proc_rea_ofr_ven_cru').setValue(data.data['getDataUpda'][0].proc_rea_ofr_ven_cru);
          this.formProces.get('proc_rea_res_ges').setValue(data.data['getDataUpda'][0].proc_rea_res_ges);
          this.formProces.get('hogar_pro_ven_bri_inf_cor_tie_ins_apr').setValue(data.data['getDataUpda'][0].hogar_pro_ven_bri_inf_cor_tie_ins_apr);
          this.formProces.get('tyt_pro_ven_bri_inf_cor_ben_ban_vig').setValue(data.data['getDataUpda'][0].tyt_pro_ven_bri_inf_cor_ben_ban_vig);
          this.formProces.get('tyt_pro_ven_bri_inf_cor_ent_equ').setValue(data.data['getDataUpda'][0].tyt_pro_ven_bri_inf_cor_ent_equ);         
          //Cierre
          this.formProces.get('cie_cie_com').setValue(data.data['getDataUpda'][0].cie_cie_com);
          this.formProces.get('cie_ofr_adi').setValue(data.data['getDataUpda'][0].cie_ofr_adi);
          this.formProces.get('cie_des').setValue(data.data['getDataUpda'][0].cie_des);
          this.formProces.get('tyt_cie_cod').setValue(data.data['getDataUpda'][0].tyt_cie_cod);
          this.formProces.get('tyt_cie_rea_res_ges').setValue(data.data['getDataUpda'][0].tyt_cie_rea_res_ges);          
          //Criticos
          this.formProces.get('cri_ama').setValue(data.data['getDataUpda'][0].cri_ama);
          this.formProces.get('cri_uso_corr_tod_cla').setValue(data.data['getDataUpda'][0].cri_uso_corr_tod_cla);
          this.formProces.get('cri_aba_lla').setValue(data.data['getDataUpda'][0].cri_aba_lla);
          this.formProces.get('cri_rea_dev_lla').setValue(data.data['getDataUpda'][0].cri_rea_dev_lla);
          this.formProces.get('cri_gui_tra_dat').setValue(data.data['getDataUpda'][0].cri_gui_tra_dat);
          this.formProces.get('cri_val_tit').setValue(data.data['getDataUpda'][0].cri_val_tit);
          this.formProces.get('cri_val_cor_cob').setValue(data.data['getDataUpda'][0].cri_val_cor_cob);
          this.formProces.get('cri_fal_exp_mal_pra').setValue(data.data['getDataUpda'][0].cri_fal_exp_mal_pra);
          this.formProces.get('tyt_cri_fra_com_seg_pol_fra').setValue(data.data['getDataUpda'][0].tyt_cri_fra_com_seg_pol_fra);          
          //Fomularios sino Movil
          this.formProces.get('ns_pre').setValue(data.data['getDataUpda'][0].ns_pre);
          this.formProces.get('ns_tod_cla').setValue(data.data['getDataUpda'][0].ns_tod_cla);
          this.formProces.get('ns_pow').setValue(data.data['getDataUpda'][0].ns_pow);
          this.formProces.get('ns_sim_adq').setValue(data.data['getDataUpda'][0].ns_sim_adq);
          this.formProces.get('ns_afi_tod_cla').setValue(data.data['getDataUpda'][0].ns_afi_tod_cla);
          this.formProces.get('ns_val_ide').setValue(data.data['getDataUpda'][0].ns_val_ide);
          this.formProces.get('ns_esc_sal').setValue(data.data['getDataUpda'][0].ns_esc_sal);
          this.formProces.get('ns_esc_ama').setValue(data.data['getDataUpda'][0].ns_esc_ama);
          this.formProces.get('ns_esc_des').setValue(data.data['getDataUpda'][0].ns_esc_des);
          this.formProces.get('ns_lec_con').setValue(data.data['getDataUpda'][0].ns_lec_con);
          this.formProces.get('ns_cla_per').setValue(data.data['getDataUpda'][0].ns_cla_per);
          this.formProces.get('ns_ofr_esc').setValue(data.data['getDataUpda'][0].ns_ofr_esc);
          //Formulario Sino Hogar
          this.formProces.get('hogar_vent_tec').setValue(data.data['getDataUpda'][0].hogar_vent_tec);
          this.formProces.get('hogar_tod_cla').setValue(data.data['getDataUpda'][0].hogar_tod_cla);
          this.formProces.get('hogar_tv').setValue(data.data['getDataUpda'][0].hogar_tv);
          this.formProces.get('hogar_tel').setValue(data.data['getDataUpda'][0].hogar_tel);
          this.formProces.get('hogar_int').setValue(data.data['getDataUpda'][0].hogar_int);
          this.formProces.get('hogar_val_ide').setValue(data.data['getDataUpda'][0].hogar_val_ide);
          this.formProces.get('hogar_esc_sal').setValue(data.data['getDataUpda'][0].hogar_esc_sal);
          this.formProces.get('hogar_esc_ama').setValue(data.data['getDataUpda'][0].hogar_esc_ama);
          this.formProces.get('hogar_esc_des').setValue(data.data['getDataUpda'][0].hogar_esc_des);
          this.formProces.get('hogar_can_pre').setValue(data.data['getDataUpda'][0].hogar_can_pre);
          this.formProces.get('hogar_ult_wif').setValue(data.data['getDataUpda'][0].hogar_ult_wif);
          this.formProces.get('hogar_ofr_esc').setValue(data.data['getDataUpda'][0].hogar_ofr_esc);
          //Formulario sino TYT
          this.formProces.get('tyt_ven_tec').setValue(data.data['getDataUpda'][0].tyt_ven_tec);
          this.formProces.get('tyt_tod_cla').setValue(data.data['getDataUpda'][0].tyt_tod_cla);
          this.formProces.get('tyt_tv').setValue(data.data['getDataUpda'][0].tyt_tv);
          this.formProces.get('tyt_tel').setValue(data.data['getDataUpda'][0].tyt_tel);
          this.formProces.get('tyt_int').setValue(data.data['getDataUpda'][0].tyt_int);
          this.formProces.get('tyt_val_ide').setValue(data.data['getDataUpda'][0].tyt_val_ide);
          this.formProces.get('tyt_esc_sal').setValue(data.data['getDataUpda'][0].tyt_esc_sal);
          this.formProces.get('tyt_esc_ama').setValue(data.data['getDataUpda'][0].tyt_esc_ama);
          this.formProces.get('tyt_esc_des').setValue(data.data['getDataUpda'][0].tyt_esc_des);
          this.formProces.get('tyt_cla_up').setValue(data.data['getDataUpda'][0].tyt_cla_up);
          this.formProces.get('tyt_ult_wif').setValue(data.data['getDataUpda'][0].tyt_ult_wif);
          //Tpipificacion
          this.formProces.get('tip_reg_min').setValue(data.data['getDataUpda'][0].tip_reg_min);
          this.formProces.get('tip_correcta').setValue(data.data['getDataUpda'][0].tip_correcta);
          this.formProces.get('tip_correctamente').setValue(data.data['getDataUpda'][0].tip_correctamente);
          //Observaciones
          this.formProces.get('obs_obs').setValue(data.data['getDataUpda'][0].obs_obs);
          this.formProces.get('obs_asp_pos').setValue(data.data['getDataUpda'][0].obs_asp_pos);
          //Aspectps Positivos
          this.formProces.get('asp_pos_sal').setValue(data.data['getDataUpda'][0].asp_pos_sal);
          this.formProces.get('asp_pos_des').setValue(data.data['getDataUpda'][0].asp_pos_des);
          this.formProces.get('asp_pos_eti_tel').setValue(data.data['getDataUpda'][0].asp_pos_eti_tel);
          this.formProces.get('asp_pos_cre_emp_con_cli').setValue(data.data['getDataUpda'][0].asp_pos_cre_emp_con_cli);
          this.formProces.get('asp_pos_fel').setValue(data.data['getDataUpda'][0].asp_pos_fel);
          this.formProces.get('asp_pos_rea_cie_cor').setValue(data.data['getDataUpda'][0].asp_pos_rea_cie_cor);
          this.formProces.get('asp_pos_per_man_cor').setValue(data.data['getDataUpda'][0].asp_pos_per_man_cor);
          this.formProces.get('asp_pos_men_ben_ofe_tod_cla').setValue(data.data['getDataUpda'][0].asp_pos_men_ben_ofe_tod_cla);
          this.formProces.get('asp_pos_sol_reg_dat_tit').setValue(data.data['getDataUpda'][0].asp_pos_sol_reg_dat_tit);
          this.formProces.get('asp_pos_es_tol').setValue(data.data['getDataUpda'][0].asp_pos_es_tol);
          this.formProces.get('asp_pos_bue_ton_voz').setValue(data.data['getDataUpda'][0].asp_pos_bue_ton_voz);
          this.formProces.get('asp_pos_man_obj_cli_gen_cie').setValue(data.data['getDataUpda'][0].asp_pos_man_obj_cli_gen_cie);
          this.formProces.get('asp_pos_man_con_seg_lla').setValue(data.data['getDataUpda'][0].asp_pos_man_con_seg_lla);
          this.formProces.get('asp_pos_bri_inf_cor_ser_ofe').setValue(data.data['getDataUpda'][0].asp_pos_bri_inf_cor_ser_ofe);
          this.formProces.get('asp_pos_rea_lec_cor_con').setValue(data.data['getDataUpda'][0].asp_pos_rea_lec_cor_con);
          this.formProces.get('asp_pos_apl_lin_mod_gana').setValue(data.data['getDataUpda'][0].asp_pos_apl_lin_mod_gana);
          this.formProces.get('retro_call').setValue(data.data['getDataUpda'][0].retro_call);
          //Otros Campos
          this.formProces.get('reciente').setValue(data.data['getDataUpda'][0].reciente);
          this.formProces.get('moti_afect').setValue(data.data['getDataUpda'][0].moti_afect);
          this.formProces.get('nom_base').setValue(data.data['getDataUpda'][0].nom_base);
          this.formProces.get('id_venta').setValue(data.data['getDataUpda'][0].id_venta);
          this.formProces.get('mancorrven').setValue(data.data['getDataUpda'][0].mancorrven);
          this.formProces.get('postucall').setValue(data.data['getDataUpda'][0].postucall);
          //Customer
          this.formProces.get('phone').setValue(data.data['getDataUpda'][0].phone);
          this.formProces.get('tip_solicitud').setValue(data.data['getDataUpda'][0].tip_solicitud);
          this.formProces.get('obs_customer').setValue(data.data['getDataUpda'][0].obs_customer);
          this.formProces.get('tip_contrato').setValue(data.data['getDataUpda'][0].tip_contrato);         
          this.formProces.get('voz_cliente').setValue(data.data['getDataUpda'][0].voz_cliente);         

          //Malas practicas y Espectativas
          if( data.data['getDataUpda'][0].cri_fal_exp_mal_pra == "34/2" || data.data['getDataUpda'][0].cri_val_cor_cob == "34/2" ){
            this.oculori = "conhidden";
            this.oculcap = "convisual";
          }else{
            this.oculori = "convisual";
            this.oculcap = "conhidden";
          }
          
        },
        error => {
            this.handler.showError();
            this.loading.emit(false);
        }
    );

  }

  labelMatriz(event){
    this.tipMatriz = event;
  }

  onSubmitUpdate(){

    let body = {
        salud: this.formProces.value  
    }
    if (this.formProces.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idPam,body,{
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
              this.handler.showError(error);
              this.loading.emit(false);
          }
      );
    }else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
    }
  }

  onSelectionChange(event){
    if(event !== null && event !== ""){
      let pruse: string = event.toString();
      let exitsPersonal = this.personalData.find(element => element.document == pruse);
      let contDocu = pruse.length;
      // console.log('pruse', pruse)
      // console.log('exists', exitsPersonal)
      // console.log('contdocu', contDocu)
      if( exitsPersonal && contDocu >= 5 ){
          this.formProces.get('name').setValue(exitsPersonal.idPersonale);
          this.formProces.get('coordinator').setValue(exitsPersonal.jef_idPersonale);
          if(exitsPersonal.supervisor == null ){ this.handler.showError("Falta Supervisor");return;}
          if(exitsPersonal.formador == null ){ this.handler.showError("Falta Formador 1");return;} 
          this.formProces.get('supervisor').setValue(exitsPersonal.supervisor);
          this.formProces.get('formador').setValue(exitsPersonal.formador);
          this.formProces.get('formador_tw').setValue(exitsPersonal.formador_tw); 
          // if(this.tipMatriz != '40/3' ){
          // if(exitsPersonal.formador_tw == null ){ this.handler.showError("Falta Formador 2");return;}
          // this.formProces.get('formador_tw').setValue(exitsPersonal.formador_tw); 
          // } 
        } 
    }
  }
  
  //Numero de semanas
  getWeekNr(event){

    const currentDate = new Date(event); // Obtener la fecha actual
    const startOfMonthDate = startOfMonth(currentDate); // Obtener el primer día del mes actual
    const currentDay = currentDate.getDate(); // Obtener el día del mes actual

    // Calcular el inicio de la semana y el fin del mes
    const startWeekOfMonth = startOfWeek(startOfMonthDate); // Inicio de la primera semana del mes
    const endOfMonthDate = new Date(startOfMonthDate.getFullYear(), startOfMonthDate.getMonth() + 1, 0); // Último día del mes actual

    // Calcular la diferencia en semanas entre el inicio del mes y la fecha actual
    const weeksDifference = differenceInCalendarWeeks(currentDate, startOfMonthDate);

    // Calcular la semana del mes actual
    this.weekNumber = weeksDifference + 1;
      
        //var currentdate  = new Date(event);
        var now = new Date(event),i=0,f,sem=(new Date(now.getFullYear(), 0,1).getDay()>0)?1:0;
        // console.log('2', now);
        
        while( (f=new Date(now.getFullYear(), 0, ++i)) < now ){
          if(!f.getDay()){
            sem++;
          }
        }
        /*var Year = this.takeYear(today);
        var Month = today.getMonth();
        var Day = today.getDate();
        var now = Date.UTC(Year,Month,Day,0,0,0);
        var Firstday = new Date();
        Firstday.setFullYear(Year);
        Firstday.setMonth(0);
        Firstday.setDate(1);
        var then = Date.UTC(Year,0,1,0,0,0);
        var Compensation = Firstday.getDay();
        if (Compensation > 3) Compensation -= 4;
        else Compensation += 3;
        var NumberOfWeek =  Math.round((((now-then)/86400000)+Compensation)/7);*/
        // this.formProces.get('week').setValue("Semana: "+(sem-1));
        this.formProces.get('week').setValue("Semana: "+(this.weekNumber));
  }

 takeYear(theDate){
        var x = theDate.getYear();
        var y = x % 100;
        y += (y < 38) ? 2000 : 1900;
        return y;
  } 

  onKey(event: KeyboardEvent) {
    event.preventDefault();
    if (event.key === "Tab") {
       // console.log('ole... tab');
       
    }

  }

  campaHogarDedi(event){

   // console.log(this.tipMatriz +" / "+ event);
    if( this.tipMatriz == '40/2' && event == '44/7' ){

      this.ListTipiConsHogar = this.ListipifiHogarDed;
    }else{

      this.ListTipiConsHogar = this.ListtipificaHogar;
    }

  }
  
// comrpomisoC(action, codigo=null, titlelist=null){

//   var dialogRef;

//   switch(action){

//       case 'view':
//           this.loading.emit(true);
//           dialogRef = this.dialog.open(RqcalidadComponent,{
//           data: {
//               window: 'view',
//               codigo,
//               titlelist
//           }
//           });
//           this.loading.emit(false); 

//       break;

//       case 'createsub':
//           this.loading.emit(true);
//           dialogRef = this.dialog.open(RqcalidadComponent,{
//           data: {
//               window: 'createsub',
//               codigo,
//               titlelist
//           }
//           });
//           this.loading.emit(false);
//           this.closeDialog();
//       break;

//    }
//  }

selectRetrocall(event){
  //if( event == '17/1' && (this.view == 'create' || this.view == 'createCus') ){
    this.optionOtr('createRetro');
  //}     
}

optionOtr(action, codigo=null){
  var dialogRef;
  this.loadingtwo.emit(true);
  switch(action){
      case 'createRetro':
          dialogRef = this.dialog.open(FeedbackDialog,{
            data: {
              window: 'create',
              codigo,
              tipoMat: this.tipMatriz
            }
          });
          dialogRef.disableClose = true;
      break;
  }
  this.loadingtwo.emit(false);
}
contrato_type:boolean;
getCustomer(event){

if ((this.view === 'create' || this.view === 'update') && (this.tipMatriz === '40/1' || this.tipMatriz === '40/2')) {
  
      if(event === '32/2'){
        this.customer = true;
        this.contrato_type = false;
        this.formProces.get('voz_cliente').setValidators([Validators.required]);
        this.formProces.get('ns_lec_con').clearValidators();
    
    
      }else if(event == '32/1'){
        this.customer = false;
        this.contrato_type = true;
    
        this.formProces.get('voz_cliente').clearValidators();
        this.formProces.get('ns_lec_con').setValidators([Validators.required]);
    
    
      }
      this.formProces.get('voz_cliente').updateValueAndValidity();
      this.formProces.get('ns_lec_con').updateValueAndValidity();
    
    }else if(this.tipMatriz == '40/3' ){
        if(event === '32/2'){
          this.customer = true;
          this.formProces.get('voz_cliente').setValidators([Validators.required]);
      
      
        }else if(event == '32/1'){
          this.customer = false;
      
          this.formProces.get('voz_cliente').clearValidators();
      
      
        }
        this.formProces.get('voz_cliente').updateValueAndValidity();
    // }else if(this.view == 'createCus' && this.tipMatriz == '40/1'  || this.view == 'createCus' && this.tipMatriz == '40/2'){
    }else if((this.view === 'createCus' || this.view === 'updateCus') && (this.tipMatriz === '40/1' || this.tipMatriz === '40/2')){
      if(event === '32/2'){
        this.customer = true;
        this.formProces.get('voz_cliente').setValidators([Validators.required]);

      }else if(event == '32/1'){
        this.customer = false;
        this.formProces.get('voz_cliente').clearValidators();

      }
    }
    this.formProces.get('voz_cliente').updateValueAndValidity();

  }
  
}
