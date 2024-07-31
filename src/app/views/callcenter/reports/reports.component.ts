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

  loading: boolean = false;
  formTipoReporte: FormGroup;
  mostrarFechas: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
  ) { }

  ngOnInit(): void {
    this.formTipoReporte = this.fb.group({
      tipoReporte: [''],
      fi: ['', Validators.required],
      ff: ['', Validators.required]
    }, { validators: this.dateRangeValidator });

    this.formTipoReporte.valueChanges.subscribe(() => this.cdr.detectChanges());
  }

  onTipoReporteChange(event: any) {
    this.mostrarFechas = event.value === 'validacionIdentidad';
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
    if (this.formTipoReporte.valid) {
      console.log('Descargar archivos');
    } else{
      return;
    }
  }
}
