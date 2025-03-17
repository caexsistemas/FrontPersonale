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

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
  ) { }

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;    
    this.formTipoReporte = this.fb.group({
      tipoReporte: [''],
      fi: ['', Validators.required],
      ff: ['', Validators.required]
    }, { validators: this.dateRangeValidator });

    this.formTipoReporte.valueChanges.subscribe(() => this.cdr.detectChanges());
  }


  onTipoReporteChange(event: any) {
    this.mostrarFechas = event.value === 'validacionIdentidad' || event.value === 'report-closing' ||  event.value === 'report-range';
    if (!this.mostrarFechas) {
      this.formTipoReporte.patchValue({
        fi: '',
        ff: ''
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
      fechaFin: fechaFin
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
}