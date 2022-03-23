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
                          'proc_rea_ofr_ven_cru'
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
                          'cie_ofr_adi'
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
                          'cri_fal_exp_mal_pra'
                          ];
  //Observacion
  observAspect:     string = "";

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
                                this.generateTable(data.data['getDatHistory']);   
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
      //Habilidad Comercial
      hab_dej_exp_rea_preg: new FormControl(""), 
      hab_esc_act_par_con_nec_cli: new FormControl(""), 
      hab_man_de_obj: new FormControl(""),
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
      //Cierre
      cie_cie_com: new FormControl(""), 
      cie_ofr_adi: new FormControl(""), 
      cie_des: new FormControl(""), 
      //Criticos
      cri_ama: new FormControl(""),
      cri_uso_corr_tod_cla: new FormControl(""), 
      cri_aba_lla: new FormControl(""), 
      cri_rea_dev_lla: new FormControl(""), 
      cri_gui_tra_dat: new FormControl(""), 
      cri_val_tit: new FormControl(""), 
      cri_val_cor_cob: new FormControl(""), 
      cri_fal_exp_mal_pra: new FormControl(""), 
      //Fomularios sino
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
      //Tpipificacion
      tip_reg_min: new FormControl(""), 
      tip_correcta: new FormControl(""), 
      tip_correctamente: new FormControl(""), 
      //Observaciones
      obs_obs: new FormControl(""), 
      obs_asp_pos: new FormControl({value:"", disabled:true}),
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

                console.log(data.data);
              if (this.view == 'update') {
                //this.getDataUpdate();
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

}
