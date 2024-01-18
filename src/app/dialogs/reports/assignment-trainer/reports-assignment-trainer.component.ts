import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import { Component, OnInit, Output, EventEmitter, Inject } from "@angular/core";
import { WebApiService } from "../../../services/web-api.service";
import { HandlerAppService } from "../../../services/handler-app.service";
import { FormGroup, FormControl } from "@angular/forms";
import { MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-reports-assignment-trainer',
  templateUrl: './reports-assignment-trainer.component.html',
  styleUrls: ['./reports-assignment-trainer.component.css']
})
export class ReportsAssignmentTrainerComponent implements OnInit {

  
  ndpoint: string = '/Assignment';
  formDownoadIngreso: FormGroup;
  loading_: boolean = false;
  //History
  historyMon: any = [];
  displayedColumns:any  = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  component      = "/selection/assignment";

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any // se obtiene el id de la requisición para el excell por medio de this.data.idSel
  ) { }

  ngOnInit(): void {

    this.formDownoadIngreso = new FormGroup({
      fi: new FormControl(''),
      ff: new FormControl(''),
      role: new FormControl(this.cuser.role),
      iduser: new FormControl(this.cuser.iduser)
    });
  }

    descargarArchivos(){

        if (this.formDownoadIngreso.valid) {

            if( this.formDownoadIngreso.value['fi'] <= this.formDownoadIngreso.value['ff'] && this.formDownoadIngreso.value['fi'] != '' && this.formDownoadIngreso.value['ff'] != '' ){

                let body = {
                    valest: this.formDownoadIngreso.value,      
                }
                this.loading.emit(true);
                this.handler.showLoadin("Generando Reporte", "Por favor espere...");
                this.WebApiService.getRequest(this.ndpoint, {
                    action: 'downloadFiles',
                    idSel:this.data.idSel,
                    role: this.cuser.role,
                    report:  ""+JSON.stringify({body}),
                    token: this.cuser.token,
                    idUser: this.cuser.iduser,
                    modulo: this.component
                })
                .subscribe(
                    data => {
                        console.log(data);
                        if(data.success){
                            const link = document.createElement("a");
                            link.href = data.data.url;
                            link.download = data.data.file;
                            link.click();
                            this.handler.showSuccess(data.data.file);
                            this.loading.emit(false);
                        }else{
                            this.handler.handlerError(data);
                            this.loading.emit(false);
                        }          
                    },
                    error => {
                        this.handler.showError(error);
                        console.log(error);
                        this.loading.emit(false);
                    }
                );
            }else{
                this.handler.showError('Periodo de consulta invalido'); 
                this.loading.emit(false);
            }
        }else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }


}
