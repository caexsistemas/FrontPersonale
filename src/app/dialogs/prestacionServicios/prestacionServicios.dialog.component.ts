import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { WebApiService } from '../../services/web-api.service';
import { HandlerAppService } from '../../services/handler-app.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import * as moment from "moment";



@Component({
  selector: 'app-prestacion-servicios.dialog',
  templateUrl: './prestacionServicios.dialog.component.html',
  styleUrls: ['./prestacionServicios.dialog.component.css']
})
export class PrestacionServiciosDialog implements OnInit {
  ciudades: string[] = ['CALI', 'BOGOTA'];
  view: string = null;
  title: string = null;
  component = "/prestacion-servicios/contratistas";
  endpoint: string = '/prestacion-servicios';
  selectedFileNames: any = {};
  formCreate: FormGroup;
  nuevoArchivo = {
    file_cv: null,
    file_bancario: null,
    file_cc: null,
    file_eps: null,
    file_pension: null
  };
  idContratista: number = null;
  contratista: any;
  states: any[] = [];
  cities: any[] = [];
  filteredCities: any[] = [];
  filteredExpCities: any[] = [];
  holidays: any[] = [];
  showObservaciones = false;
  private initialFormValue: any;

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  @Output() loading = new EventEmitter<boolean>();
  @Output() reload = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<PrestacionServiciosDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
  ) { 
    this.idContratista = null;
    this.view = this.data.window;
    if (this.view === "create") {
      this.title = "Crear Nuevo Contratista";
      this.initForm();
      this.getFestivosAndUpdateValidators();
      this.getCities();
    } else if(this.view === "update"){
      this.idContratista = this.data.codigo;
      this.title = "Actualizar contratista"
      this.initFormUpdate();
      this.getCities();
      this.getDataContratista();
    } else if(this.view=== "view"){
      this.idContratista = this.data.codigo;
      this.title = "Información contratista"
      this.getDataContratista();
      }  
    }

    ngOnInit(): void { }

    private async getFestivosAndUpdateValidators(): Promise<void> {
      try {
        await this.getFestivos(); // Carga los festivos
        this.updateValidators(); // Actualiza los validadores del formulario después de cargar los festivos
      } catch (error) {
        console.error('Error al cargar los días festivos:', error);
      }
    }
    
    private updateValidators(): void {
      // Actualiza los validadores del formulario después de cargar los festivos
      this.formCreate.get('fec_ingreso').setValidators([Validators.required, this.validarFecIngreso.bind(this)]);
      this.formCreate.get('fec_ingreso').updateValueAndValidity();
    }

  initForm() {
    this.formCreate = new FormGroup({
      nombres: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]), // Solo letras y espacios
      apellidos: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]), // Solo letras y espacios
      doc_ident: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$')]), // Solo números
      fecha_nac: new FormControl("", [Validators.required, this.futureDateValidator]),
      fecha_exp: new FormControl("", [Validators.required, this.futureDateValidator]),
      // fec_ingreso: new FormControl("", [Validators.required, this.validarFecIngreso]),
      fec_ingreso: new FormControl(""),
      depa_naci: new FormControl("", Validators.required), 
      ciudad_naci: new FormControl("", Validators.required), 
      depa_exp: new FormControl("", Validators.required), 
      ciudad_exp: new FormControl("", Validators.required), 
      ciudad_trabajo: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      file_cv: new FormControl("", [Validators.required, this.PDFValidator()]),
      file_bancario: new FormControl("", [Validators.required, this.PDFValidator()]),
      file_cc: new FormControl("", [Validators.required, this.PDFValidator()]),
      file_eps: new FormControl("", [Validators.required, this.PDFValidator()]),
      file_pension: new FormControl("", [Validators.required, this.PDFValidator()]),
    });
  }
  

  
  initFormUpdate() {
    this.formCreate = new FormGroup({
      nombres: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]), // Solo letras y espacios
      apellidos: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]), // Solo letras y espacios
      doc_ident: new FormControl("", [Validators.required, Validators.pattern('^[0-9]+$')]), // Solo números
      fecha_nac: new FormControl("", [Validators.required, this.futureDateValidator]),
      fecha_exp: new FormControl("", [Validators.required, this.futureDateValidator]),
      // fec_ingreso: new FormControl("", [Validators.required]),
      depa_naci: new FormControl("", Validators.required), 
      ciudad_naci: new FormControl("", Validators.required), 
      depa_exp: new FormControl("", Validators.required), 
      ciudad_exp: new FormControl("", Validators.required), 
      ciudad_trabajo: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      novedad_estado: new FormControl(""),
      observaciones: new FormControl("")
    });

    const estadoControl = this.formCreate.get('novedad_estado');
    if (estadoControl) {
      estadoControl.valueChanges.subscribe(value => {
        this.updateObservacionesValidators(value);
      });
    } else {
      console.error('El control "estado" no está definido en el formulario.');
    }
  } 

  getCities(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getCities",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      idContratista : this.idContratista,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.cities = data.data.cities;
          this.states = data.data.states;
          //console.log(this.cities)
          //console.log(this.states)

          if (this.contratista) {
            this.updateFilteredCities(this.contratista.depa_naci);
            this.updateFilteredExpCities(this.contratista.depa_exp)

          }
        }
      })
  }

  getDataContratista(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint + "/" + this.idContratista, {
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.contratista = data.data[0];
          //console.log(this.contratista)
          if(this.view === 'update'){
            const depaNaciId = this.states.find(state => state.name === this.contratista.depa_naci)?.idState;
            const ciudadNaciId = this.cities.find(city => city.name === this.contratista.ciudad_naci && city.idState === depaNaciId)?.idCity;
            const depaExpId = this.states.find(state => state.name === this.contratista.depa_exp)?.idState;
            const ciudadExpId = this.cities.find(city => city.name === this.contratista.ciudad_exp && city.idState === depaExpId)?.idCity;

            const adjustDate = (dateString: string) => {
              const date = new Date(dateString);
              // Ajustar la fecha para la zona horaria local
              date.setUTCHours(date.getUTCHours() + date.getTimezoneOffset() / 60);
              return date;
          };

            this.formCreate.patchValue({
                nombres: this.contratista.nombres,
                apellidos: this.contratista.apellidos,
                doc_ident: this.contratista.doc_ident,
                fecha_nac: adjustDate(this.contratista.fecha_nac),
                fecha_exp: adjustDate(this.contratista.fecha_exp),
                // fec_ingreso: adjustDate(this.contratista.fec_ingreso),
                depa_naci: depaNaciId,
                ciudad_naci: ciudadNaciId,
                depa_exp: depaExpId,
                ciudad_exp: ciudadExpId,
                ciudad_trabajo: this.contratista.ciudad_trabajo,
                ciudad: this.contratista.ciudad,
            });

            this.initialFormValue = this.formCreate.getRawValue();

            //console.log('Ciudad de expedición:', this.contratista.ciudad_exp);
            //console.log('Ciudad de expedición:', ciudadExpId);

            // this.selectedFileNames['file_cv'] = contratista.file_cv ? `${contratista.file_cv}` : '';
            // this.selectedFileNames['file_cert'] = contratista.file_bancario ? `${contratista.file_bancario}` : '';
            // this.selectedFileNames['file_cc'] = contratista.file_cedula ? `${contratista.file_cedula}` : '';
          
            this.selectedFileNames['file_cv'] = this.contratista.file_cv;
            this.selectedFileNames['file_bancario'] = this.contratista.file_bancario;
            this.selectedFileNames['file_cc'] = this.contratista.file_cedula;
            this.selectedFileNames['file_eps'] = this.contratista.file_cv;
            this.selectedFileNames['file_pension'] = this.contratista.file_pension;

            // Ajusta la validación basada en la existencia de archivos
            if (!this.selectedFileNames['file_cv']) {
              this.formCreate.controls['file_cv'].setValidators(Validators.required);
            }
            if (!this.selectedFileNames['file_bancario']) {
              this.formCreate.controls['file_bancario'].setValidators(Validators.required);
            }
            if (!this.selectedFileNames['file_cc']) {
              this.formCreate.controls['file_cc'].setValidators(Validators.required);
            }

            this.updateFilteredCities(depaNaciId);
            this.updateFilteredExpCities(depaExpId)
          }


          this.loading.emit(false);
        }

      },
      error => {
        console.error('Error al obtener los datos del contratista', error);
        this.loading.emit(false);
      }
    );
  }

  isFormChanged(): boolean {
    return JSON.stringify(this.formCreate.getRawValue()) !== JSON.stringify(this.initialFormValue);
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
  
      // Actualizar el objeto nuevoArchivo directamente en lugar de usar filter y push
      this.nuevoArchivo[tipoArchivo] = archivo;
    };
    reader.readAsBinaryString(file);
  }


  onSubmit() {
    //console.log('entra')
    if (this.formCreate.valid) {
        this.loading.emit(true);
        //console.log('Loading true emitted');
    

        // Calcular la fecha de ingreso
        // const fechaIngreso = this.calculateIngresoDate().format('YYYY-MM-DD');
        const fec_creacion = moment().format('YYYY-MM-DD');
        // Prepara los datos del formulario
        const formData = {
            nombres: this.formCreate.get('nombres').value,
            apellidos: this.formCreate.get('apellidos').value,
            doc_ident: this.formCreate.get('doc_ident').value,
            ciudad_trabajo: this.formCreate.get('ciudad_trabajo').value,
            fecha_nac: this.formCreate.get('fecha_nac').value.toISOString().split('T')[0],
            fecha_exp: this.formCreate.get('fecha_exp').value.toISOString().split('T')[0],
            fec_ingreso: this.formCreate.get('fec_ingreso').value.toISOString().split('T')[0],
            depa_naci: this.formCreate.get('depa_naci').value,
            ciudad_naci: this.formCreate.get('ciudad_naci').value,
            depa_exp: this.formCreate.get('depa_exp').value,
            ciudad_exp: this.formCreate.get('ciudad_exp').value,
            fec_creacion: fec_creacion,
            archivos: this.nuevoArchivo
          };

        //console.log(formData);

        this.handler.showLoadin("Guardando Registro", "Por favor espere...");

        this.WebApiService.postRequest(this.endpoint, formData, {
          idPersonale: this.cuser.idPersonale,
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          response => {
            //console.log('Respuesta del servidor:', response);
            this.handler.showSuccess('Registro guardado con éxito');
            this.loading.emit(false);
            this.closeDialog();
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

  onSubmitUpdate() {
    if (this.formCreate.valid) {
        
        const formData = {
          nombres: this.formCreate.get('nombres').value,
          apellidos: this.formCreate.get('apellidos').value,
          doc_ident: this.formCreate.get('doc_ident').value,
          ciudad_trabajo: this.formCreate.get('ciudad_trabajo').value,
          fecha_nac: this.formCreate.get('fecha_nac').value.toISOString().split('T')[0],
          fecha_exp: this.formCreate.get('fecha_exp').value.toISOString().split('T')[0],
          // fec_ingreso: this.formCreate.get('fec_ingreso').value.toISOString().split('T')[0],
          depa_naci: this.formCreate.get('depa_naci').value,
          ciudad_naci: this.formCreate.get('ciudad_naci').value,  
          depa_exp: this.formCreate.get('depa_exp').value,
          ciudad_exp: this.formCreate.get('ciudad_exp').value,  
          novedad_estado: this.formCreate.get('novedad_estado').value,
          observaciones: this.formCreate.get('observaciones').value
          // archivos: this.nuevoArchivo
          // archivos: {
          //   file_cv: this.nuevoArchivo['file_cv'] || null,
          //   file_cert: this.nuevoArchivo['file_cert'] || null,
          //   file_cc: this.nuevoArchivo['file_cc'] || null
          // }
          
        };


        //console.log(formData)

        this.handler.showLoadin("Actualizando Registro", "Por favor espere...");

        // Llamar al servicio para enviar el formulario
        this.WebApiService.putRequest(this.endpoint + "/" + this.idContratista, formData, {
            action: "updateRecord",
            idPersonale: this.cuser.idPersonale,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component,
        }).subscribe(
            response => {
                if (response.success) {
                  //console.log('Respuesta del servidor:', response);
                  this.handler.showSuccess('Registro actualizado con éxito');
                  this.loading.emit(false);
                  this.closeDialog();
                } else {
                    this.handler.showError('Error al actualizar el registro');
                }

                this.loading.emit(false);

            },
            error => {
                console.error('Error al actualizar el registro:', error);
                this.handler.showError('Error al actualizar el registro');
                this.loading.emit(false);

            }
          );
      } else {
        const errors = this.getFormErrors();
        this.handler.showError(errors.join(' '));
      }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // VALIDATORS
  getFormErrors() {
    const errors = [];
    const formControls = this.formCreate.controls;

    for (const name in formControls) {
        if (formControls[name].invalid) {
            if (formControls[name].errors.required) {
                errors.push(`El campo ${name} es obligatorio.`);
            }
            if (formControls[name].errors.pattern) {
                if (name === 'nombres' || name === 'apellidos') {
                    errors.push(`El campo ${name} solo puede contener letras y espacios.`);
                }
                if (name === 'documento') {
                    errors.push(`El campo ${name} solo puede contener números.`);
                }
            }
            if (formControls[name].errors.dateInFuture) {
                errors.push(`Los campos de fecha no pueden ser una fecha futura.`);
            }
            if (formControls[name].errors.invalidFileType) {
                errors.push(`Los archivos deben subirse en formato PDF y deben pesar menos de 2MB`);
            }
            
        }
    }

    return errors;
  }



  futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const date = new Date(control.value);
    // //console.log("hoy", today)
    // //console.log("fecha", date)
    return date > today ? { dateInFuture: true } : null;
  };

  PDFValidator(): ValidatorFn {
    
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value instanceof File) {
        const file = control.value as File;
        
        // Extrae la extensión del nombre del archivo
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
  
        // Verifica si la extensión es pdf
        const validMimeType = fileExtension === 'pdf';
  
        // Verifica si el tamaño del archivo es menor a 2MB
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB en bytes
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
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB en bytes
  
      // Verifica si la extensión es pdf
      if (fileExtension !== 'pdf') {
        this.handler.showError('Los archivos deben subirse en formato PDF');
        this.clearFileInput(input, formControlName);
        return;
      }
  
      // Verifica si el tamaño del archivo es menor a 2MB
      if (file.size > maxSizeInBytes) {
        this.handler.showError('El archivo no debe superar los 2MB');
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
  
  onExpStateChange(event: MatSelectChange): void {
    const stateId = event.value;
    this.loading.emit(true); // Indicar que se está cargando
  
    setTimeout(() => {
      this.updateFilteredExpCities(stateId);
      this.formCreate.get('ciudad_exp')?.reset(); 
      this.loading.emit(false); 
    }, 0); 
  
    //console.log('Departamento de expedición seleccionado:', stateId);
  }
  
  onStateChange(event: MatSelectChange): void {
    const stateId = event.value;
    this.loading.emit(true); // Indicar que se está cargando
  
    setTimeout(() => {
      this.updateFilteredCities(stateId);
      this.formCreate.get('ciudad_naci')?.reset(); 
      this.loading.emit(false); 
    }, 0); 
  }
  
  updateFilteredCities(stateId: number): void {
    if (this.cities && this.cities.length > 0) {
      this.filteredCities = this.cities.filter(city => city.idState === stateId);
    }
  }
  
  updateFilteredExpCities(stateId: number): void {
    if (this.cities && this.cities.length > 0) {
      this.filteredExpCities = this.cities.filter(city => city.idState === stateId);
    }
  }
  


//  CALCULOS PARA LA FECHA DE INGRESO


  submitPrueba() {
    this.getFestivos().then(() => {
      const ingresoDate = this.calculateIngresoDate();
      //console.log("Fecha de ingreso:", ingresoDate.format('YYYY-MM-DD')); // Cambia el formato según tus necesidades
    });
  }
  
 
  
  calculateIngresoDate(): moment.Moment {
    // const now = moment('2024-07-06 11:00:00'); // Puedes ajustar esta fecha para pruebas
    const now = moment(); 
    const cutOffTime = moment(now).set({ hour: 14, minute: 0, second: 0, millisecond: 0 }); // 2 PM en la misma fecha
    const cutOffTimeSaturday = moment(now).set({ hour: 10, minute: 0, second: 0, millisecond: 0 }); // 10 AM en la misma fecha
  
    // console.log("now", now.format('YYYY-MM-DD HH:mm:ss'));
    // console.log("cutOffTime", cutOffTime.format('YYYY-MM-DD HH:mm:ss'));
    // console.log("cutOffTimeSaturday", cutOffTimeSaturday.format('YYYY-MM-DD HH:mm:ss'));
  
    let ingresoDate: moment.Moment;
  
    // Si `now` es un sábado
    if (now.isoWeekday() === 6) {
      // Antes de las 10 AM en sábado: La fecha de ingreso es el siguiente día hábil
      if (now.isBefore(cutOffTimeSaturday)) {
        ingresoDate = this.getNextBusinessDay(now);
        console.log("Ingreso antes de las 10 AM en sábado:", ingresoDate.format('YYYY-MM-DD'));
      } else {
        // Después de las 10 AM en sábado: La fecha de ingreso es dentro de los siguientes 2 días hábiles
        ingresoDate = this.getNextBusinessDay(now);
        ingresoDate = this.getNextBusinessDay(ingresoDate); // Sumar otro día hábil
        console.log("Ingreso después de las 10 AM en sábado:", ingresoDate.format('YYYY-MM-DD'));
      }
      // now es otro dia diferente a sábado
    } else if (now.isBefore(cutOffTime)) {
      // Antes de las 2 PM en días hábiles: La fecha de ingreso es el siguiente día hábil
      ingresoDate = this.getNextBusinessDay(now);
      console.log("Ingreso antes de las 2 PM:", ingresoDate.format('YYYY-MM-DD'));
    } else {
      // Después de las 2 PM en días hábiles: La fecha de ingreso es dentro de los siguientes 2 días hábiles
      ingresoDate = this.getNextBusinessDay(now);
      ingresoDate = this.getNextBusinessDay(ingresoDate); // Sumar otro día hábil
      console.log("Ingreso después de las 2 PM:", ingresoDate.format('YYYY-MM-DD'));
    }
  
    // Verifica si la fecha de ingreso es el día 31 del mes
    if (ingresoDate.date() === 31) {
      ingresoDate = this.getNextBusinessDay(ingresoDate); // Ajustar al siguiente día hábil
      console.log("Ingreso ajustado al siguiente día hábil:", ingresoDate.format('YYYY-MM-DD'));
    }
  
    return ingresoDate;
  }
  
  validarFecIngreso(control: AbstractControl): ValidationErrors | null {
    const now = moment(); 
    const cutOffTime = moment(now).set({ hour: 14, minute: 0, second: 0, millisecond: 0 }); // 2 PM en la misma fecha
    const cutOffTimeSaturday = moment(now).set({ hour: 10, minute: 0, second: 0, millisecond: 0 }); // 10 AM en la misma fecha
    
    // Verificar si el control tiene valor
    if (!control.value) {
        return null;
    }

    const selectedDate = moment(control.value);

    // Calcular la fecha mínima permitida en función de la hora actual y el día de la semana
    let ingresoDate: moment.Moment;
    
    // Si `now` es un sábado
    if (now.isoWeekday() === 6) {
        if (now.isBefore(cutOffTimeSaturday)) {
            ingresoDate = this.getNextBusinessDay(now);
        } else {
            ingresoDate = this.getNextBusinessDay(now);
            ingresoDate = this.getNextBusinessDay(ingresoDate); // Sumar otro día hábil
        }
    } else {
        if (now.isBefore(cutOffTime)) {
            ingresoDate = this.getNextBusinessDay(now);
        } else {
            ingresoDate = this.getNextBusinessDay(now);
            ingresoDate = this.getNextBusinessDay(ingresoDate); // Sumar otro día hábil
        }
    }

    // Ajustar si la fecha mínima permitida es el 31 del mes
    if (ingresoDate.date() === 31) {
        ingresoDate = this.getNextBusinessDay(ingresoDate); // Ajustar al siguiente día hábil
    }

    // Verificar si la fecha seleccionada es anterior a la fecha mínima permitida
    if (selectedDate.isBefore(ingresoDate, 'day')) {
        return { 'fechaIngresoInvalida': true };
    }

    // Verificar si la fecha seleccionada es domingo o festivo
    if (selectedDate.isoWeekday() === 7 || this.holidays.includes(selectedDate.format('YYYY-MM-DD'))) {
        return { 'fechaIngresoDomingoFestivo': true };
    }

    // Verificar si la fecha seleccionada es el día 31 del mes
    if (selectedDate.date() === 31) {
        return { 'fechaIngresoDia31': true };
    }

    return null;
}


  

  async getFestivos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.WebApiService.getRequest(this.endpoint, {
        action: "getHolidays",
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        idContratista: this.idContratista,
        modulo: this.component,
      }).subscribe(
        (data) => {
          if (data.success) {
            this.loading.emit(false);
            // Convierte los días festivos a formato YYYY-MM-DD
            this.holidays = data.data.holidays.map((hol) => {
              return moment().month(hol.month - 1).date(hol.day_hol).format('YYYY-MM-DD');
            });
            console.log(this.holidays);
            resolve();
          } else {
            reject('No se pudieron obtener los días festivos.');
          }
        },
        (error) => reject(error)
      );
    });
  }
  
  getNextBusinessDay(date: moment.Moment): moment.Moment {
    let nextDay = date.clone().add(1, 'day');
  
    // Recorre los días hasta encontrar un día hábil
    while (nextDay.isoWeekday() === 7 || this.holidays.includes(nextDay.format('YYYY-MM-DD'))) { // 7 es domingo
      nextDay = nextDay.add(1, 'day');
    }
  
    return nextDay;
  }

  updateObservacionesValidators(estado: string) {
    const observacionesControl = this.formCreate.get('observaciones');
    if (estado === 'NO ACTIVADO') {
      // Establece validación requerida para 'observaciones' cuando 'estado' sea 'NO ACTIVADO'
      observacionesControl.setValidators(Validators.required);
      this.showObservaciones = true;
    } else {
      // Elimina la validación requerida para 'observaciones' cuando 'estado' no sea 'NO ACTIVADO'
      observacionesControl.clearValidators();
      this.showObservaciones = false;
    }
    observacionesControl.updateValueAndValidity(); // Actualiza la validez del campo
  }
}
