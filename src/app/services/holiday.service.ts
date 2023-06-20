import { Injectable } from '@angular/core';
import { WebApiService } from "../services/web-api.service";

import * as moment from 'moment';
import { HandlerAppService } from './handler-app.service';
import { addDays, differenceInWeeks, isSunday, startOfWeek } from 'date-fns';
@Injectable({
  providedIn: 'root'
})

export class calculateDays {
  // arrFor: any = [];

  endpoint: string = "/validation";
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  component = "/selfManagement/holiday";
  permissions: any = null;
  loading: boolean = false;
  getHoliday: any = [];
  day_sun: any = [];
  date_fin:any = [];
  // sundaySus: any = [];
    constructor(
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    ) {
    }
    
    holiday(f1, f2){
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint,{
        action: "getHoliday",
        // idUser: this.cuser.iduser,
        // token: this.cuser.token,
        // modulo: this.component,
      }).subscribe(data =>{
        this.permissions = this.handler.getPermissions(this.component);
        
          if(data.success == true){
              this.getHoliday = data.data["getHoliday"];
              this.loading = false;
          }else{
              this.handler.handlerError(data);
              this.loading = false;
          }
      }, (error)=>{
          this.handler.showError("Se produce un error");
          this.loading = false;
      });
   
      if(f1 && f2 && this.getHoliday){
       
        const arrFor = [];
        this.getHoliday.forEach(element => {
            arrFor.push([element.day_hol, element.month]);
            
        });
          
            var ini2 = (f1);
            var diff = f2;
            // --------------------------------------
            var prueba = new Date(ini2)
            this.date_fin = this.calculateEndDate(prueba,f2,arrFor)
            // ------------------------------------------------
            var arrFecha = ini2.split('-');
            var fecha = new Date(arrFecha[0], arrFecha[1] - 1, arrFecha[2]);
            var sundaySus = this.getInterleavedSundays(fecha,f2);

            for (var i = 0; i < diff; i++) {
             
             var diaInvalido = false;
              fecha.setDate(fecha.getDate() + 1); // Sumamos de dia en dia
                for (var j = 0; j < arrFor.length; j++) { // Verificamos si el dia + 1 es festivo
                  var mesDia =arrFor[j];
                                                               //ejemplo
                  if (fecha.getMonth() +1 == mesDia[1] && fecha.getDate() == mesDia[0]) {
                        //   console.log(fecha.getDate() + ' es dia festivo (Sumamos un dia)');
                          diaInvalido = true;
                          break;
                      } 
                    };
                  
                  if( fecha.getDay() == 0) { // Verificamos si es domingo
                        // console.log(fecha.getDate() + ' es  domingo (Sumamos un dia)');
                            // console.log(this.day_sun);
                            diaInvalido = true;
                      }
                    if (diaInvalido){
                      diff++; // Si es fin de semana o festivo le sumamos un dia
                    }
                   
          }
         
      const final_date = new Date(this.date_fin);
      const year = final_date.getFullYear();
      const month = String(final_date.getMonth() + 1).padStart(2, '0');
      const day = String(final_date.getDate()).padStart(2, '0');
      const fec_fin = `${year}-${month}-${day}`;    
    //  var fec_fin = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() - 1).toString().padStart(2,'0' );
      var sumTotalMen = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() ).toString().padStart(2,'0' );

        return [fec_fin, sumTotalMen, sundaySus];
      }else{
        false;
      }   
    }

  calculateEndDate(startDate: Date, days: number,festivos:any): Date {

    let esFestivo = false;
    const endDate = new Date(startDate.getTime());
    let remainingDays = days;
    let daysToAdd = 0;
    let daysFestivos = festivos;    

    while (remainingDays > 0) {
      endDate.setDate(endDate.getDate() + 1);
      if (endDate.getDay() !== 0) { // No es domingo
        remainingDays--;
       
      } 
      const mes = endDate.getMonth() + 1; 
      const dia = endDate.getDate();
      festivos.forEach(festivo => {
        const festivoDia = festivo[0];
        const festivoMes = festivo[1];

        if (festivoDia === dia && festivoMes === mes) {
          esFestivo = true;
          remainingDays++;
          return; 
        }
      });
      // else {
      //   daysToAdd++;
      //   console.log('daysToAdd',daysToAdd);
        
      // }
    }
    endDate.setDate(endDate.getDate() + daysToAdd);

    return endDate;
      
    }
      
    getInterleavedSundays(startDate: Date, days: number): Date[] {
      const sundays: Date[] = [];
    
      // Validar si es un rango de 2 días o menos
      if (days < 1) {
        // Si la fecha inicial es domingo, agregarla a la lista de domingos
        if (startDate.getDay() === 0) {
          sundays.push(new Date(startDate.getTime()));
        }
    
        // Si la fecha final está en la misma semana que la fecha inicial y es un domingo, agregarla a la lista de domingos
        const endDate = new Date(startDate.getTime() + (days ) * 24 * 60 * 60 * 1000);
        if (endDate.getDay() === 0 && endDate.getTime() - startDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
          sundays.push(new Date(endDate.getTime()));
        }
    
        return sundays;
      }
    
      // Calcular la fecha final
      const endDate = new Date(startDate.getTime() + (days ) * 24 * 60 * 60 * 1000);
    
      // Calcular la cantidad de días restantes después de la fecha final
      const daysRemaining = (7 - endDate.getDay()) % 7;
    
      // Recorrer los días entre la fecha inicial y la fecha final
      let currentDate = new Date(startDate.getTime());
      while (currentDate <= endDate) {
        if (currentDate.getDay() === 0) {
          sundays.push(new Date(currentDate.getTime()));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    
      // Agregar el siguiente domingo si la fecha final no es un domingo
      if (daysRemaining > 0) {
        const nextSunday = new Date(endDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
        sundays.push(nextSunday);
      }
    
      return sundays;
    }
    
    
    
    
    
  
  }


