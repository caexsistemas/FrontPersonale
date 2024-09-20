import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WebApiService } from '../../services/web-api.service';
import { HandlerAppService } from '../../services/handler-app.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';


@Component({
  selector: 'app-gestion-contratistas.dialog',
  templateUrl: './gestion-contratistas.dialog.component.html',
  styleUrls: ['./gestion-contratistas.dialog.component.css']
})
export class GestionContratistasDialog implements OnInit {
  view: string = null;
  title: string = null;
  component = "/prestacion-servicios/gestion";
  endpoint: string = '/prestacion-servicios';
  selectedFileNames: any = {};
  formCreate: FormGroup;
  nuevoArchivo = {
    file_afi_eps: null,
    file_arl: null,
    file_contrato: null,
    file_carta_termina: null
  };
  historico: any[] = [];
  planillas: any[] = [];
  cuentas_cobro: any[] = [];
  doc_ident: number = null;
  fec_creacion: any = null;
  idContratista: number = null;
  contratista: any;
  months = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value:8 },
    { name: 'Septiembre', value:9 },
    { name: 'Octubre', value:10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }
  ];

  years
    // Inicialización de variables
  selectedPlanillaYear: number | null = null;
  selectedPlanillaMonth: number | null = null;
  selectedCobroYear: number | null = null;
  selectedCobroMonth: number | null = null;

  // Disponibilidad de años y meses para cada tipo de documento
  availablePlanillaYears: number[] = [];
  availablePlanillaMonths: { value: number, name: string }[] = [];
  availableCobroYears: number[] = [];
  availableCobroMonths: { value: number, name: string }[] = [];

  // Filtrar planillas y cuentas de cobro por año y mes seleccionados
  filteredPlanillas: any[] = [];
  filteredCobros: any[] = [];
  
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  @Output() loading = new EventEmitter<boolean>();
  @Output() reload = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<GestionContratistasDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
  ) { 
    this.idContratista = null;
    this.view = this.data.window;
    if(this.view === "update"){
      this.idContratista = this.data.codigo;
      this.title = "Subir documentos"
      this.initForm();
      this.getDocumentos();
      // this.getDataContratista();
    } else if(this.view=== "view"){
      this.idContratista = this.data.codigo;
      this.title = "Información contratista"
      this.getDataContratista();
    } else if(this.view=== "retirar"){
      this.component = "/prestacion-servicios/retiro";
      this.idContratista = this.data.codigo;
      this.title = "Retirar contratista"
      this.initFormRetiro();
      this.getDataContratista();
    } 
    else if(this.view=== "updateSocial"){
      this.idContratista = this.data.codigo;
      this.title = "Subir Planilla Seguridad Social"
      this.initFormPlanilla();
      this.getDataContratista();
    }
    else if(this.view=== "updateCobro"){
      this.idContratista = this.data.codigo;
      this.title = "Subir Cuenta de cobro"
      this.initFormCobro();
      this.getDataContratista();
    }
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear, currentYear - 1];

    if(this.view === "update"){
      this.formCreate.get('file_afi_eps').valueChanges.subscribe(() => {
        this.checkFilesStatus();
      });
      
      this.formCreate.get('file_arl').valueChanges.subscribe(() => {
        this.checkFilesStatus();
      });
      
      this.formCreate.get('file_contrato').valueChanges.subscribe(() => {
        this.checkFilesStatus();
      });
    }
  }

  initForm(){
    this.getDataContratista();
    this.formCreate = new FormGroup({
      file_afi_eps: new FormControl("", [this.PDFValidator()]),
      file_arl: new FormControl("", [this.PDFValidator()]),
      file_contrato: new FormControl("", [this.PDFValidator()]),
      activarContratista: new FormControl({ value: false, disabled: true })
    });
  }

  displayedColumns: string[] = ['currentm_user', 'date_move', 'type_move'];

  getDataContratista(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint + "/" + this.idContratista, {
      // action: "getContratista",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.contratista = data.data[0];
          this.fec_creacion = data.data[0].fec_creacion;

          this.planillas = data.planillas.filter(p => p.file === 'planilla');
          this.cuentas_cobro = data.planillas.filter(p => p.file === 'ccobro');
          this.historico = data.historico;
          if(this.view === 'update'){
            // console.log(this.contratista)
            this.selectedFileNames['file_afi_eps'] = this.contratista.file_afi_eps
            this.selectedFileNames['file_arl'] = this.contratista.file_arl
            this.selectedFileNames['file_contrato'] = this.contratista.file_contrato
            this.checkFilesStatus(); 
          }

          // console.log('Planillas:', this.planillas);
          // console.log('Cuentas de cobro:', this.cuentas_cobro);
          // console.log('Historico de procesos:', this.historico);

          this.extractYearsAndMonths();
            
        }
        this.loading.emit(false);
      },
      error => {
        console.error('Error al obtener los datos del contratista', error);
        this.loading.emit(false);
      }
    );
  } 

  checkFilesStatus() {
    // Verificar si los archivos ya existen en la base de datos
    const fileEpsInDb = !!this.selectedFileNames['file_afi_eps'];
    const fileArlInDb = !!this.selectedFileNames['file_arl'];
    const fileContratoInDb = !!this.selectedFileNames['file_contrato'];
  
    // Verificar si los archivos han sido seleccionados en el formulario
    const fileEpsInForm = !!this.formCreate.get('file_afi_eps').value;
    const fileArlInForm = !!this.formCreate.get('file_arl').value;
    const fileContratoInForm = !!this.formCreate.get('file_contrato').value;
  
    // Validar si entre los archivos de la base de datos y los seleccionados suman los tres documentos
    const hasAllFiles = (fileEpsInDb || fileEpsInForm) && (fileArlInDb || fileArlInForm) && (fileContratoInDb || fileContratoInForm);
  
    // console.log('EPS:', fileEpsInDb || fileEpsInForm);
    // console.log('ARL:', fileArlInDb || fileArlInForm);
    // console.log('Contrato:', fileContratoInDb || fileContratoInForm);
    // console.log('Has all files:', hasAllFiles);
    // console.log('Archivos escogidos:', this.nuevoArchivo );
  
    // Habilitar o deshabilitar el checklist según si están presentes los tres archivos
    if (hasAllFiles) {
      this.formCreate.get('activarContratista').enable();  // Habilitar el checklist
      // console.log('Activar Contratista Habilitado');
    } else {
      this.formCreate.get('activarContratista').disable();  // Deshabilitar el checklist
      // console.log('Activar Contratista Deshabilitado');
    }
  }
  
  

  extractYearsAndMonths() {
    // Planillas
    const planillaYears = new Set(this.planillas.map(p => p.year));
    this.availablePlanillaYears = Array.from(planillaYears);
    
    if (this.selectedPlanillaYear) {
      const planillaMonths = new Set(this.planillas
        .filter(p => p.year === this.selectedPlanillaYear)
        .map(p => p.month));

      // Filtrar `months` para incluir solo los meses que están en `planillaMonths`
      this.availablePlanillaMonths = this.months
        .filter(month => planillaMonths.has(month.value))
        .sort((a, b) => a.value - b.value);
      // console.log('availablePlanillaMonths', this.availablePlanillaMonths)
    }
  
    // Cuentas de cobro
    const cobroYears = new Set(this.cuentas_cobro.map(p => p.year));
    this.availableCobroYears = Array.from(cobroYears);
  
    if (this.selectedCobroYear) {
      const cobroMonths = new Set(this.cuentas_cobro
        .filter(p => p.year === this.selectedCobroYear)
        .map(p => p.month));
      this.availableCobroMonths = this.months
        .filter(month => cobroMonths.has(month.value))
        .sort((a, b) => a.value - b.value);
      // console.log('availableCobroMonths ', this.availableCobroMonths )
    }
  
    // Filtrar los documentos
    this.filterPlanillas();
    this.filterCobros();
  }
  
  // Manejar cambios en el selector de año para planillas
  onPlanillaYearChange(year: number) {
    this.selectedPlanillaYear = year;
    this.extractYearsAndMonths();
  }
  
  // Manejar cambios en el selector de mes para planillas
  onPlanillaMonthChange(month: number) {
    this.selectedPlanillaMonth = month;
    this.filterPlanillas();
  }
  
  // Manejar cambios en el selector de año para cuentas de cobro
  onCobroYearChange(year: number) {
    this.selectedCobroYear = year;
    this.extractYearsAndMonths();
  }
  
  // Manejar cambios en el selector de mes para cuentas de cobro
  onCobroMonthChange(month: number) {
    this.selectedCobroMonth = month;
    this.filterCobros();
  }
  
  // Filtrar planillas según el año y mes seleccionados
  filterPlanillas() {
    if (this.selectedPlanillaYear && this.selectedPlanillaMonth) {
      this.filteredPlanillas = this.planillas.filter(p =>
        p.year === this.selectedPlanillaYear &&
        p.month === this.selectedPlanillaMonth
      );
    } else {
      this.filteredPlanillas = [];
    }
  }
  
  // Filtrar cuentas de cobro según el año y mes seleccionados
  filterCobros() {
    if (this.selectedCobroYear && this.selectedCobroMonth) {
      this.filteredCobros = this.cuentas_cobro.filter(p =>
        p.year === this.selectedCobroYear &&
        p.month === this.selectedCobroMonth
      );
    } else {
      this.filteredCobros = [];
    }
  }

  // Función para obtener el nombre del mes
  convertMonthName(value: number): string {
    const month = this.months.find(m => m.value === value);
    return month ? month.name : '';
}


  getDocumentos(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDocumentos",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      idContratista : this.idContratista,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          const documento = data.data.contratista[0];
          //console.log(documento)
          this.doc_ident = documento.doc_ident;
          this.fec_creacion = documento.fec_creacion;
          //console.log(this.doc_ident)
          //console.log(this.fec_creacion)
        }
        this.loading.emit(false);
      },
      error => {
        console.error('Error al obtener los docuemntos del contratista', error);
        this.loading.emit(false);
      }
    );
  }
  
  onSubmit() {
    if (this.formCreate.valid) {
        this.loading.emit(true);
        
        const formData = {
            archivos: this.nuevoArchivo,
            activar: this.formCreate.get('activarContratista').value
          };

        this.handler.showLoadin("Subiendo Documentos", "Por favor espere...");

        this.WebApiService.putRequest(this.endpoint + "/" + this.idContratista, formData, {
          action: "uploadDocuments",
          doc_ident: this.doc_ident,
          idPersonale: this.cuser.idPersonale,
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          fec_creacion: this.fec_creacion,
          modulo: this.component,
        }).subscribe(
          response => {
            this.handler.showSuccess('Registro guardado con éxito');
            this.loading.emit(false);
            this.closeDialog('success');
          },
          error => {
            console.error('Error al guardar el registro:', error);
            this.handler.showError('Error al guardar el registro');
            this.loading.emit(false);
          }
        )
    } else {
      const errors = this.getFormErrors();
      this.handler.showError(errors.join(' '));
    }
  }

  selectedFiles: File[] = [];
  
  seleccionarArchivo(event, tipoArchivo) {
    const file = event.target.files[0];
  
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const archivo = {
        nombreArchivo: file.name,
        base64textString: btoa(readerEvent.target.result.toString()),
      };
  
      this.nuevoArchivo[tipoArchivo] = archivo;

    };
    reader.readAsBinaryString(file);
  }

  closeDialog(result: string = 'cancel') {
    this.dialogRef.close(result);
  }

  PDFValidator(): ValidatorFn {
    
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value instanceof File) {
        const file = control.value as File;
        
        // Extrae la extensión del nombre del archivo
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
  
        // Verifica si la extensión es pdf
        const validMimeType = fileExtension === 'pdf';
  
        // Verifica si el tamaño del archivo es menor a 5MB
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB en bytes
        const validFileSize = file.size <= maxSizeInBytes;

        if (!validMimeType) {
          return { 'invalidFileType': { value: control.value } };
        }

        if (!validFileSize) {
          return { 'invalidFileSize': { value: control.value } };
        }
      }
      return null;
    };
  }

  onFileChange(event: Event, formControlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB en bytes
  
      // Verifica si la extensión es pdf
      if (fileExtension !== 'pdf') {
        this.handler.showError('Los archivos deben subirse en formato PDF');
        this.clearFileInput(input, formControlName);
        return;
      }
  
      // Verifica si el tamaño del archivo es menor a 5MB
      if (file.size > maxSizeInBytes) {
        this.handler.showError('El archivo no debe superar los 5MB');
        this.clearFileInput(input, formControlName);
        return;
      }
  
      // Si el archivo es válido, establece el archivo en el FormControl
      this.formCreate.get(formControlName)?.patchValue(file);
    }
  }

  clearFileInput(input: HTMLInputElement, formControlName: string) {
    this.formCreate.get(formControlName)?.patchValue(null);
    input.value = '';
  }

  initFormRetiro(){
    this.formCreate = new FormGroup({
      fec_retiro: new FormControl("", [Validators.required, this.maxDateValidator]),
      file_carta_termina: new FormControl("", [Validators.required, this.PDFValidator()]),
    });
  }

  maxDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Configura la hora para comparar solo fechas
  
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() - 10); // 10 días antes de hoy
  
    const selectedDate = control.value ? new Date(control.value) : null;
  
    // Asegúrate de comparar solo la parte de la fecha, sin la hora
    if (selectedDate && selectedDate < maxDate) {
      return { maxDate: true };
    }
  
    return null;
  };
  
  
  
  initFormPlanilla(){
    this.formCreate = new FormGroup({
      mes: new FormControl("", [Validators.required]),
      ano: new FormControl("", [Validators.required]),
      file_planilla: new FormControl("", [Validators.required, this.PDFValidator()])
    });
  }
  
  initFormCobro(){
    this.formCreate = new FormGroup({
      mes: new FormControl("", [Validators.required]),
      ano: new FormControl("", [Validators.required]),
      quincena: new FormControl("", [Validators.required]),
      file_cobro: new FormControl("", [Validators.required, this.PDFValidator()])
    });
  }

  onSubmitRetirar(){
    if (this.formCreate.valid) {

      const formData = {
        fec_retiro: this.formCreate.get('fec_retiro').value,
        archivos: this.nuevoArchivo
      }

      //console.log(formData);
      //console.log(this.fec_creacion)
      
      // const fec_registro = moment().format('YYYY-MM-DD');


      Swal.fire({
        title: "¿Estás seguro de retirar a " + this.contratista.nombres.toLowerCase() + " " + this.contratista.apellidos.toLowerCase() + "?",
        text: "¡No podrás revertir esta acción!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5650EB",
        cancelButtonColor: "#d33",
        confirmButtonText: "¡Si, retirarlo!",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.handler.showLoadin("Realizando proceso de retiro", "Por favor espere...");
  
          this.WebApiService.putRequest(this.endpoint + "/" + this.idContratista, formData, {
            action: "retirarContratista",
            doc_ident: this.contratista.doc_ident,
            idPersonale: this.cuser.idPersonale,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component,          
            fec_creacion: this.fec_creacion,

          }).subscribe(
            response => {
              //console.log('Respuesta del servidor:', response);
              this.handler.showSuccess('Registro guardado con éxito');
              this.loading.emit(false);
              this.closeDialog('success');
            },
            error => {
              console.error('Error al guardar el registro:', error);
              this.handler.showError('Error al guardar el registro');
              this.loading.emit(false);
            }
          )
        }
      });
    } else {
      const errors = this.getFormErrors();
      this.handler.showError(errors.join(' '));
    }
  }

  onSubmitDoc(){

    if (this.formCreate.valid) {

      const formData: { mes: any; ano: any; archivos: any; quincena?: any } = {
        mes: this.formCreate.get('mes').value,
        ano: this.formCreate.get('ano').value,
        archivos: this.nuevoArchivo
      };
      
      // Agregar quincena solo si la vista es 'updateCobro'
      if (this.view === 'updateCobro') {
        (formData as any).quincena = this.formCreate.get('quincena').value;
      }

      // console.log(formData);
      // console.log(this.fec_creacion)

      

      this.WebApiService.postRequest(this.endpoint, formData, {
        action: "uploadPlanilla",
        idContratista:  this.idContratista,
        doc_ident: this.contratista.doc_ident,
        fec_creacion : this.fec_creacion,
        idPersonale: this.cuser.idPersonale,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component        

      }).subscribe(
        response => {
          // console.log('Respuesta del servidor:', response);
          this.handler.showSuccess(response.success);
          this.loading.emit(false);
          this.closeDialog('success');
        },
        error => {
          // console.error('Error al guardar el registro:', error);
          this.handler.showError(error.error.error);
          this.loading.emit(false);

        }
      )

    } else {
      const errors = this.getFormErrors();
      this.handler.showError(errors.join(' '));
    }
  }


   //Creador de errores
  getFormErrors() {
    const errors = [];
    const formControls = this.formCreate.controls;
  
    for (const name in formControls) {
      if (formControls[name].invalid) {
        const controlErrors = formControls[name].errors;

        
        if (controlErrors) {
          if (controlErrors.required) {
            errors.push(`El campo ${name} es obligatorio.`);
          }
          
          if (controlErrors.maxDate) {
            errors.push(`La fecha en ${name} no puede ser mayor a 10 días antes de la fecha actual`);
          }
          
          if (controlErrors.invalidFileType) {
            errors.push(`Los archivos deben subirse en formato PDF`);
          }
        }
      }
    }
  
    return errors;
  }
  

}
