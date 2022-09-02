import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { global } from '../../../services/global';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
    selector: 'app-report',
    templateUrl: './reports-ingreso.component.html',
    styleUrls: ['./reports-ingreso.component.css']
  })

  export class ReportIngresoComponent implements OnInit {

  ndpoint: string = '/novnomi';
  formDownoadIngreso: FormGroup;
  loading_: boolean = false;
  //History
  historyMon: any = [];
  displayedColumns:any  = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  component = "/nomi/ingreso";

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
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
                this.WebApiService.getRequest(this.ndpoint, {
                    action: 'downloadFiles',
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