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
import { Observable } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

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
  title:         string = null;
  formProces:    FormGroup;
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
  //Datos Generales
  conCumpleGen:     number = 0;
  conNoCumpGen:     number = 0;
  conNoACumGen:     number = 0;
  campGeneralAny:   any = [
                          'atn_cont_ini',
                          'atn_gest_tim',
                          'hab_dej_exp_rea_preg',
                          'hab_esc_act_par_con_nec_cli',
                          'hab_man_de_obj',
                          'proc_rea_ofr_ven_cru',
                          'tyt_hab_com_met_pag',
                          'tyt_cie_cod',
                          'tyt_ate_ama_emp' 
                      
                          ];
  //Datos Procesos
  conCumplePro:     number = 0;
  conNoCumpPro:     number = 0;
  conNoACumPro:     number = 0;
  campProcesosAny:  any = [
                          'proc_brin_inf_corr_com_pro_ofer',
                          'proc_brin_inf_corr_cam_vig',
                          'proc_brin_inf_corr_tar',
                          'proc_brin_inf_corr_fac',
                          'proc_brin_inf_corr_com_port',
                          'proc_brin_inf_corr_tie_ent_act_ac',
                          'proc_brin_inf_com_corr_otr_sol',
                          'proc_brin_inf_otr_pro',
                          'proc_res_ben_tod_cla',
                          'proc_rea_res_ges',
                          'cie_cie_com',
                          'cie_ofr_adi',
                          'hogar_pro_ven_bri_inf_cor_tie_ins_apr',
                          'tyt_hab_com_int_con_nes_cli',
                          'tyt_pro_ven_bri_inf_cor_ben_ban_vig',
                          'tyt_pro_ven_bri_inf_cor_ent_equ',
                          'tyt_cie_rea_res_ges',
                          'tyt_hab_com_esc_act_par_con_nec_cli',
                          'tyt_hab_com_man_obj'
                          
                          ];
  //Datos Criticos
  contCriticos:     number = 0;
  cammpCriticoAny:  any = [
                          'cri_ama',
                          'cri_uso_corr_tod_cla',
                          'cri_aba_lla',
                          'cri_rea_dev_lla',
                          'cri_gui_tra_dat',
                          'cri_val_tit',
                          'cri_val_cor_cob',
                          'cri_fal_exp_mal_pra',
                          'tyt_cri_fra_com_seg_pol_fra'
                          ];
  //Observacion
  observAspect:     string = "";
  //Tipo Matriz
  tipMatriz:        string = "";

  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null
  }
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();


  constructor(public dialogRef: MatDialogRef<RqcalidadDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog) { 

          this.view = this.data.window;
          this.idPam = null;
  
          switch (this.view) {
            case 'create':
                this.initForms();
                this.title = "MATRIZ DE CALIDAD CLARO CONVERGENCIA ";
            break;
            case 'update':
                this.initForms();
                this.title = "Actualizar Novedad Medica";
                this.idPam = this.data.codigo;
            break;
            case 'view':
                this.idPam = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.idPam, {})
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.dataCad = data.data['getDatPer'][0];
                                //this.generateTable(data.data['getDatHistory']);   
                                this.loading.emit(false);
                            } else {
                                this.handler.handlerError(data);
                                this.closeDialog(); 
                                this.loading.emit(false);
                            }
                        },
                        error => {
                            this.handler.showError('Se produjo un error');
                            this.loading.emit(false);
                        }
                    );
            break;
          }
  }

  initForms(){

    this.getDataInit();
    this.formProces = new FormGroup({
      createUser: new FormControl(this.cuser.iduser),
      matrizarp: new FormControl(""),
      tipo_gestion: new FormControl(""),
      tipo_red: new FormControl(""),
      document: new FormControl(""),
      login: new FormControl(""), 
      name: new FormControl(""), 
      coordinator: new FormControl(""), 
      tmo: new FormControl(""), 
      call_id: new FormControl(""), 
      min_bill: new FormControl(""), 
      week: new FormControl(""), 
      analyst: new FormControl(""), 
      offer: new FormControl(""), 
      monitoring_date: new FormControl(""), 
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
      asp_pos_apl_lin_mod_gana: new FormControl(false)
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
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamPrew',
    })
    .subscribe(
       
        data => {
            if (data.success == true) {
                //DataInfo
                this.lisTipogesCla = data.data['tipgescla'];
                this.lisTiporedCla = data.data['tipredcla'];
                this.lisCalifica   = data.data['califclaro'];
                this.istSinoclar   = data.data['snclaro'];
                this.listSinomr    = data.data['sntipica'];
                this.listEscala    = data.data['escalaclaro'];
                this.listipomatriz = data.data['tipmatriz'];
                this.ListtipificaMovil  = data.data['tipificaMovil'];   
                this.ListtipificaHogar= data.data['tipificaHogar'];  
                this.ListtipificaTYT = data.data['tipificaTYT'];  
                
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

  closeDialog() {
    this.dialogRef.close();
  }

  validcheked(){
    //General
    this.conCumpleGen = 0;
    this.conNoCumpGen = 0;
    this.conNoACumGen = 0;
    //Procesos
    this.conCumplePro = 0;
    this.conNoCumpPro = 0;
    this.conNoACumPro = 0;
    //Criticos
    this.contCriticos = 0;

    for (const field in this.formProces.controls) { 
        
      //Contador General
      if( this.campGeneralAny.indexOf(field) !== -1 ){

        if( this.formProces.controls[field].value == '34/1'){
          this.conCumpleGen = this.conCumpleGen + 1;
        }
        if( this.formProces.controls[field].value == '34/2'){
          this.conNoCumpGen = this.conNoCumpGen + 1;
        }
        if( this.formProces.controls[field].value == '34/3'){
          this.conNoACumGen = this.conNoACumGen + 1;
        }
      }

      //Contador Procesos
      if( this.campProcesosAny.indexOf(field) !== -1 ){

        if( this.formProces.controls[field].value == '34/1'){
          this.conCumplePro = this.conCumplePro + 1;
        }
        if( this.formProces.controls[field].value == '34/2'){
          this.conNoCumpPro = this.conNoCumpPro + 1;
        }
        if( this.formProces.controls[field].value == '34/3'){
          this.conNoACumPro = this.conNoACumPro + 1;
        }
      }

      //Contador Criticos
      if( this.cammpCriticoAny.indexOf(field) !== -1 ){

        if( this.formProces.controls[field].value == '34/2'){
          this.contCriticos = this.contCriticos + 1;
        }
      }
        
    }
    //General
    let totaltrein;
    let totalfinaGen;
    totaltrein = this.conCumpleGen / (this.conCumpleGen + this.conNoCumpGen);
    //Procesos
    let totaltreproc;
    let totalfinProc
    totaltreproc = this.conCumplePro / (this.conCumplePro + this.conNoCumpPro);
    //Total Puntaje
    totalfinaGen = totaltrein * 30;
    totalfinProc = totaltreproc * 70;

    if( this.contCriticos >= 1 ){
      this.formProces.get('final_note').setValue(Math.round(0));
    }else if( totalfinaGen >= 0 && totalfinProc >= 0 ){
      let TotalPuntaj = totalfinaGen + totalfinProc;
      this.formProces.get('final_note').setValue(Math.round(TotalPuntaj));
    }else if( totalfinaGen >= 0 ){
      this.formProces.get('final_note').setValue(Math.round(totalfinaGen));
    }else if(totalfinProc >= 0){
      this.formProces.get('final_note').setValue(Math.round(totalfinProc));
    }else{
      this.formProces.get('final_note').setValue(Math.round(0));
    }      

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
        this.WebApiService.postRequest(this.endpoint, body, {})
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
          this.handler.showError('Complete la informacion necesaria');
          this.loading.emit(false);
      }
  }

  getDataUpdate(){
    
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamUpdateSet',
        id: this.idPam
    })
    .subscribe(
        data => {

          this.formProces.get('matrizarp').setValue(data.data['getDataUpda'][0].matrizarp);
          this.formProces.get('tipo_gestion').setValue(data.data['getDataUpda'][0].tipo_gestion);
          this.formProces.get('tipo_red').setValue(data.data['getDataUpda'][0].tipo_red);
          this.formProces.get('document').setValue(data.data['getDataUpda'][0].document);
          this.formProces.get('login').setValue(data.data['getDataUpda'][0].login);
          this.formProces.get('name').setValue(data.data['getDataUpda'][0].name);
          this.formProces.get('coordinator').setValue(data.data['getDataUpda'][0].coordinator);
          this.formProces.get('tmo').setValue(data.data['getDataUpda'][0].tmo);
          this.formProces.get('call_id').setValue(data.data['getDataUpda'][0].call_id);
          this.formProces.get('min_bill').setValue(data.data['getDataUpda'][0].min_bill);
          this.formProces.get('week').setValue(data.data['getDataUpda'][0].week);
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
          this.formProces.get('tyt_cla_up').setValue(data.data['getDataUpda'][0].tyt_cla_up);
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

    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+this.idPam,body,{})
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
  }

}
