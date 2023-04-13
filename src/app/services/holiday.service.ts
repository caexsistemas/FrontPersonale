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
        // console.log(this.permissions);
        // console.log(data.success);
          if(data.success == true){
              this.getHoliday = data.data["getHoliday"];
              this.loading = false;
              // console.log("prueba de service=>",this.getHoliday);
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
          
            // var ini = moment(f1);
            var ini2 = (f1);
            // console.log('fec_inicial',ini)
            
        
            var diff = f2;
            // console.log('dias_solicitar',diff);
        
            var arrFecha = ini2.split('-');
            var fecha = new Date(arrFecha[0], arrFecha[1] - 1, arrFecha[2]);
            // console.log(fecha)
            var sundaySus = this.getInterleavedSundays(fecha,f2);

        
            for (var i = 0; i < diff; i++) {
        // console.log("fesServicefor2=>",this.arrFor);
             
             var diaInvalido = false;
              fecha.setDate(fecha.getDate() + 1); // Sumamos de dia en dia
                for (var j = 0; j < arrFor.length; j++) { // Verificamos si el dia + 1 es festivo
                  var mesDia =arrFor[j];
                  // console.log(mesDia[1])
                  // console.log(mesDia)
        
                  // var ite= festivos[mes][j]                                                  //ejemplo
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
                            // this.cuentaFindes(f1)
                            // (diaInvalido) ? day_sun++ : '';
        
                      } 
        
                    if (diaInvalido){
                    diff++; // Si es fin de semana o festivo le sumamos un dia
                    }
          }
        //   console.log('dias',fecha.getDate());

     var fec_fin = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() - 1).toString().padStart(2,'0' );

    // this.fec_fin = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() ).toString().padStart(2,'0' );
    // this.sumTotalMen = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + fecha.getDate().toString().padStart(2,'0' );
    var sumTotalMen = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() ).toString().padStart(2,'0' );

    // console.log('fin',fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() - 1).toString().padStart(2,'0' ));
    // console.log('reint',fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + fecha.getDate().toString().padStart(2,'0' ));
  
        return [fec_fin, sumTotalMen, sundaySus];
      }else{
        false;
      }
        
    }
    // fechasDomingos: Date[] = [];
    // getInterleavedSundays(startDate: Date, days: number): Date[] {
    //   const sundays: Date[] = [];
    
    //   // Validar si es un rango de 3 días o menos
    //   console.log('dias =>',days);
    //   console.log('***=>',startDate.getDay() === 0);
      
    //   if (days < 3) {

    //     if (startDate.getDay() === 0) {
          
    //       sundays.push(new Date(startDate.getTime()));
    //     }
    //     console.log('menos',sundays);
        
    //     return sundays;
    //   }
    
    //   // Calcular la fecha final
    //   const endDate = new Date(startDate.getTime() + (days ) * 24 * 60 * 60 * 1000);
    //   console.log('fin =>',endDate);
      
    //   // Calcular la cantidad de días restantes después de la fecha final
    //   const daysRemaining = (7 - endDate.getDay()) % 7;
    
    //   // Recorrer los días entre la fecha inicial y la fecha final
    //   let currentDate = new Date(startDate.getTime());
    //   while (currentDate <= endDate) {
    //     if (currentDate.getDay() === 0) {
    //       sundays.push(new Date(currentDate.getTime()));
    //     }
    //     currentDate.setDate(currentDate.getDate() + 1);
    //   }
    
    //   // Agregar el siguiente domingo si la fecha final no es un domingo
    //   if (daysRemaining > 0) {
    //     const nextSunday = new Date(endDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    //     sundays.push(nextSunday);
    //   }
    // console.log('mas => ',sundays);
    
    //   return sundays;
    // }
    
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


