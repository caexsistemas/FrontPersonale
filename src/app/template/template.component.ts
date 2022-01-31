import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WebApiService } from '../services/web-api.service';
import { HandlerAppService } from '../services/handler-app.service';
import { global } from '../services/global';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

  endpoint: string = '/novnomi';
  formDownoadIngreso: FormGroup;
  loading_: boolean = false;

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
  ) { }

  ngOnInit(): void {

    this.formDownoadIngreso = new FormGroup({
      fi: new FormControl('', [Validators.required]),
      ff: new FormControl('', Validators.required)
    });
  }

  generateReport() {
    if (this.formDownoadIngreso.valid) {
      this.loading.emit(true)
      let body = {
        report: this.formDownoadIngreso.value
      }
      // this.downloadReport(body)
      this.WebApiService.postRequest(this.endpoint+"?action=downloadreport", body, {})
        .subscribe(
          data => {
            console.log(data)
            window.open('http://127.0.0.1:8000/imagenes/reporte_de_excel.xlsx');
            // if (data.success) {
            //   console.log(data)
            //   this.handler.showSuccess(data.message);
            //   this.reload.emit();
            // } else {
            //   this.handler.handlerError(data);
            //   this.loading.emit(false);
            // }
          }
        )
    } else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
    }
  }

  downloadReport(body) {
    let urlBackend = global.url;
    let blob = new Blob()
    fetch(urlBackend + this.endpoint + "?action=downloadreport", {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(body),
      headers: {
        // 'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization': this.WebApiService.token
      }
    }).then(res => this.downLoadFile(res));
    // .catch(error =>{
    //   console.log(error)
    //   this.loading_ = false;
    // })
    // .then( response => {
    //   console.log(blob)
    //   this.loading_ = false;
    //   var objectURL = URL.createObjectURL(blob);
    //   let anchor = document.createElement('a');
    //   anchor.href = objectURL;
    //   let d = new Date();
    //   anchor.download = "Reporte-Indicador-de-gestion.xlsx";
    //   anchor.target = '_blank';
    //   anchor.classList.add('noview');
    //   document.getElementsByTagName('body')[0].appendChild(anchor);
    //   anchor.click();
    // });

  }




  downLoadFile(data: any) {
    let blob = new Blob([data], { type: 'application/ms-excel' });
    let objectURL = window.URL.createObjectURL(blob);
    let anchor = document.createElement('a');
    anchor.href = objectURL;
    let d = new Date();
    // anchor.download = "Reporte-"+view+d.getTime()+".xls";
    anchor.download = "Reporte.xlsx";
    anchor.target = '_blank';
    anchor.classList.add('noview');
    document.getElementsByTagName('body')[0].appendChild(anchor);
    anchor.click();
  }





}
