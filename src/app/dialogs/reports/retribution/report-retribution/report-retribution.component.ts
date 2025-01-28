import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WebApiService } from '../../../../services/web-api.service';
import { HandlerAppService } from '../../../../services/handler-app.service';

@Component({
  selector: 'app-report-retribution',
  templateUrl: './report-retribution.component.html',
  styleUrls: ['./report-retribution.component.css']
})
export class ReportRetributionComponent implements OnInit {
  
  loading: boolean = false;
  endpoint: string = "/retribution";
  component = "/nomi/retribution";
  filterForm!: FormGroup;
  periods: string[] = [];
  reportTypes = [
    { value: 'excel'},
    { value: 'pdf'},
  ];
  disablePdf: boolean = false; 

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService
  ) {}

  ngOnInit(): void {
    this.filterForm = new FormGroup({
      periods: new FormControl([], Validators.required), 
      reportType: new FormControl(null, Validators.required), 
    });
    this.loadPeriods();
  }

  loadPeriods(): void {
    this.WebApiService.getRequest(this.endpoint + "/" , {
      action: "getPeriods",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      idPersonale: this.cuser.idPersonale,
    }).subscribe(
      (data) => {
        this.periods = data.map((item: any) => ({
          id: item.ls_codvalue,
          description: item.description,
        }));
      },
      (error) => {
        console.error("Error al cargar los períodos:", error);
      }
    ); 
  }

  downloadReport(): void {
    if (this.filterForm.invalid) return;

    const body = {
      reportType: this.filterForm.get('reportType').value,
      periods: this.filterForm.get('periods').value,
    };

    this.loading = true;

    this.WebApiService.postRequest(this.endpoint + "/report-retribution" , body, {
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      idPersonale: this.cuser.idPersonale
    }).subscribe(
      response => {
        this.loading = false;

        if (body.reportType === 'excel') {
          const link = document.createElement("a");
          link.href = response.data.url;
          link.download = response.data.file;
          link.click();
          this.handler.showSuccess('El archivo ha sido descargado con éxito. <br>' + response.data.file);
        } else if(body.reportType === 'pdf'){
          const link = document.createElement("a");
          link.href = response.url;
          link.target = "_blank"; // Abrir en nueva pestaña
          link.click();
          this.handler.showSuccess('El archivo PDF ha sido abierto con éxito: ' + response.file);
        
        } else{
          this.handler.handlerError(response);
        }
      },
      (error) => {
        this.loading = false;
        // Extraer el mensaje del error recibido
        const errorMessage = error?.error?.message || 'Tu sesión se ha cerrado o el módulo presenta alguna novedad.';
        this.handler.showError(errorMessage);
      }
    );
  }

  onPeriodChange(event: any): void {
    const selectedPeriods = this.filterForm.value.periods || [];

    if (selectedPeriods.length >= 2) {
        this.filterForm.get('reportType')?.disable();
        this.filterForm.patchValue({
            reportType: 'excel', 
        });
    } else {
      this.filterForm.get('reportType')?.enable();
    }
}


  onReportTypeChange(event: any): void {
      // Validar si "Todos" está seleccionado, forzar a Excel
      if (this.filterForm.value.periods.includes('Todos') && event.value === 'pdf') {
          alert('El período "Todos" solo está disponible para descargar en Excel.');
          this.filterForm.patchValue({
              reportType: 'excel',
          });
      }
  }

}
