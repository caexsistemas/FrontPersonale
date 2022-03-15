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

  endpoint:      string = '/procesald';
  maskDNI        = global.maskDNI;
  view:          string = null;
  title:         string = null;
  formProces:    FormGroup;
  idPam:         number = null;
  displayedColumns:any  = [];
  historyMon: any = [];
  dataCad:     any = []; 
  public clickedRows;

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
      obs_asp_pos: new FormControl(""),
      //Aspectps Positivos
      asp_pos_sal: new FormControl(""), 
      asp_pos_des: new FormControl(""), 
      asp_pos_eti_tel: new FormControl(""), 
      asp_pos_cre_emp_con_cli: new FormControl(""), 
      asp_pos_fel: new FormControl(""),
      asp_pos_rea_cie_cor: new FormControl(""), 
      asp_pos_per_man_cor: new FormControl(""),
      asp_pos_men_ben_ofe_tod_cla: new FormControl(""), 
      asp_pos_sol_reg_dat_tit: new FormControl(""), 
      asp_pos_es_tol: new FormControl(""), 
      asp_pos_bue_ton_voz: new FormControl(""), 
      asp_pos_man_obj_cli_gen_cie: new FormControl(""), 
      asp_pos_man_con_seg_lla: new FormControl(""), 
      asp_pos_bri_inf_cor_ser_ofe: new FormControl(""), 
      asp_pos_rea_lec_cor_con: new FormControl(""), 
      asp_pos_apl_lin_mod_gana: new FormControl("")
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
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamView',
    })
    .subscribe(
       
        data => {
            if (data.success == true) {
                //DataInfo

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

}
