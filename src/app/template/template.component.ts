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

  endpoint: string = '/reporteingreso';
  formDownoadIngreso: FormGroup;
  loading_:boolean = false;

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
      this.downloadReport(body)
      // this.WebApiService.postRequest(this.endpoint, body, {})
      //   .subscribe(
      //     data => {
      //       if (data.success) {
      //         console.log(data)
      //         this.handler.showSuccess(data.message);
      //         this.reload.emit();
      //       } else {
      //         this.handler.handlerError(data);
      //         this.loading.emit(false);
      //       }
      //     }
      //   )
    } else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
    }
  }

  downloadReport(body) {
    let urlBackend = global.url;
    var binaryData = [];
    fetch(urlBackend + this.endpoint,{
      method: 'POST',
      mode : 'no-cors',
      body: JSON.stringify(body),
      headers: {
        // 'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization': this.WebApiService.token
      }
    })
    // .then(response => {
    //     console.log(response)
    // });
    .then(res => { return res.blob() })
        .catch(error => {
        console.log(error)
        console.log('1_')
        this.loading_ = false;
      })
      .then(response => {
        console.log('2_')
        binaryData.push(response);
        this.loading_ = false;
        console.log('----');
        console.log(binaryData);
        // var objectURL = URL.createObjectURL(response[0]);
        var objectURL = window.URL.createObjectURL(new Blob(binaryData,{type:"aplication/zip"}))
        console.log(objectURL)



        let anchor = document.createElement('a');
        anchor.href = objectURL;
        let d = new Date();
        // anchor.download = "Reporte-"+view+d.getTime()+".xls";
        anchor.download = "Reporte-" + d.getTime() + ".xlsx";
        anchor.target = '_blank';
        anchor.classList.add('noview');
        document.getElementsByTagName('body')[0].appendChild(anchor);
        anchor.click();

        // window.open(objectURL);
      });

  }





}
