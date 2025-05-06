import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  endpoint: string = '/callcenter/reports/';
  component = "/callcenter/reports";
  loading: boolean = false;
  formTipoReporte: FormGroup;
  mostrarFechas: boolean = false;

  contaClick:  number = 0;
  permissions: any = null;
  reports: any = [];
  matriz: any = [];
  mesCarga: any = [];
  minDate: string = '';
  maxDate: string = '';

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
  ) { }

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;    
    this.formTipoReporte = this.fb.group({
      tipoReporte: [''],
      fi: ['', Validators.required],
      ff: ['', Validators.required],
      matriz: '',
      month: ''
    }, { validators: this.dateRangeValidator });

    this.formTipoReporte.get('month')?.valueChanges.subscribe((event: string) => {
      // console.log('mes escogido => ', event);
  
      if (event) {
        const partes = event.split('/');
        const mes = Number(partes[1]);
        const anio = 2025; // o puedes usar new Date().getFullYear();
  
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0);
  
        this.minDate = this.formatDate(fechaInicio);
        this.maxDate = this.formatDate(fechaFin);
  
        this.formTipoReporte.patchValue({
          fi: '',
          ff: ''
        });
      }
    });
    this.formTipoReporte.valueChanges.subscribe(() => this.cdr.detectChanges());
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getReports",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    }).subscribe(
      (data) => {
        
        if (data.success == true) {
          this.permissions = this.handler.getPermissions(this.component);
          this.reports = data.data["reports"];
          this.matriz = data.data["matriz"];
          this.mesCarga = data.data["mesCarga"];
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (mistake) => {
        let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
  checMatriz: boolean;
  checkBase: boolean;
  
  onTipoReporteChange(event) {
    // console.log(event);
    
   
    if(event == 'report-management' || event == 'report-records'){
      this.checkBase = true;
      this.checMatriz = true;

    }else if(event == 'report-range' || event == 'report-closing' || event == 'validacionIdentidad'){
      this.formTipoReporte.get('month').setValue('');
      this.checkBase = false;
      this.checMatriz = false;
      this.minDate = '';
      this.maxDate = '' ;
    } else{
      this.checMatriz = false;
      // this.checkBase = false;

    }
    
    this.mostrarFechas = event;
    if (!this.mostrarFechas) {
      this.formTipoReporte.patchValue({
        fi: '',
        ff: '',
        matriz: '',
        month: ''
      }, { emitEvent: false });
      this.formTipoReporte.updateValueAndValidity(); 
    }
  }
  

  dateRangeValidator(form: FormGroup) {
    const start = form.get('fi')?.value;
    const end = form.get('ff')?.value;
    if (start && end && new Date(end) < new Date(start)) {
      form.get('ff')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    form.get('ff')?.setErrors(null);
    return null;
  }

  descargarArchivos() {
    if (this.formTipoReporte.invalid) return;

    const tipoReporte = this.formTipoReporte.get('tipoReporte')?.value;
    const fechaInicio = this.formTipoReporte.get('fi')?.value;
    const fechaFin = this.formTipoReporte.get('ff')?.value;
    const matriz = this.formTipoReporte.get('matriz')?.value;
    const month = this.formTipoReporte.get('month')?.value;

    if (!tipoReporte || !fechaInicio || !fechaFin) {
      this.handler.showError('Por favor, llene los datos para descargar el reporte.');
      return;
    }

    this.handler.showLoadin("Generando Reporte", "Por favor espere...");

    //El tipo de reporte que esta en el select, debe ser el mismo que en la ruta
    this.WebApiService.getRequest(this.endpoint + tipoReporte, {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      action: "downloadFiles",
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      matriz: matriz,
      month: month
    })
    .subscribe(
      response => {
        if(response.success){
          this.loading = false;

          const link = document.createElement("a");
          link.href = response.data.url;
          link.download = response.data.file;
          link.click();
          this.handler.showSuccess('El archivo ha sido descargado con éxito. <br>' + response.data.file);
        }else{
          this.loading = false;
          console.log('error')
          this.handler.handlerError(response);
        } 
      },
      (error) => {
        this.handler.showError('Error al descargar el archivo.');
        this.loading = false;
      }
    );
  }
  onMonth(event){
    // if(event){
    this.formTipoReporte.get('month')?.valueChanges.subscribe((event: string) => {
      // console.log('mes escogido => ',event);;
      
      if (event) {
        // Obtener el mes desde el valor "172/3"
        const partes = event.split('/');
        const mes = Number(partes[1]); // "3"
        
        const anio = 2025; // o puedes usar new Date().getFullYear();
    
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0); // Último día del mes
    
        this.minDate = this.formatDate(fechaInicio);
        this.maxDate = this.formatDate(fechaFin);
    
        // Limpiar los campos de fecha si ya tenían valores
        this.formTipoReporte.patchValue({
          fi: '',
          ff: ''
        });
      }
    });
  // }

  }
  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  
}