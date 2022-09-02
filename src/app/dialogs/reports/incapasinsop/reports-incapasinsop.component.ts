import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { global } from '../../../services/global';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-report',
    templateUrl: './reports-incapasinsop.component.html',
    styleUrls: ['./reports-incapasinsop.component.css']
  })

  export class ReportIncapasinsopComponent implements OnInit {

  ndpoint: string = '/inability';
  formDownoadIngreso: FormGroup;
  loading_: boolean = false;
  ListEstGes: any = [];
  //History
  historyMon: any = [];
  displayedColumns:any  = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  component = "/incapacidades/gestion";

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
  ) { }

    ngOnInit(): void {
        this.dataIni();
        this.formDownoadIngreso = new FormGroup({
            fi: new FormControl(''),
            ff: new FormControl(''),
            role: new FormControl(this.cuser.role),
            iduser: new FormControl(this.cuser.iduser),
            sopor: new FormControl('17/0'),
            tipogesti: new FormControl('')
          });
    }

    dataIni(){
        this.loading.emit(true);
        this.WebApiService.getRequest(this.ndpoint, {
            action: 'getParExporInfo',
            role: this.cuser.role,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
            .subscribe(
                data => {
                    if (data.success == true) {
                        this.ListEstGes = data.data['stadgestion'];
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
                            this.handler.handlerError(data.data);
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