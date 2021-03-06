import { Injectable } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class Tools {

    public identity;
    public token;
    public cuser : any;
    isLogged : boolean = false;
    // toastr
    private toasterService: ToasterService;

    public toasterconfig: ToasterConfig =
        new ToasterConfig({
            tapToDismiss: true,
            timeout: 5000
        });

    constructor(toasterService: ToasterService, private _router: Router,
        private _route: ActivatedRoute,
    ) {
        this.toasterService = toasterService;
    }

    public showNotify(type, title, message) {
        this.toasterService.pop(type, title, message)
    }
    getLogout(){
  

    }
    getIdentity() {
        // let identity = JSON.parse(localStorage.getItem('identity'));
        // console.log('->'+identity);
        // identity = 'sdasd64654asda';
        // if (identity && identity != "undefined") {
        //     this.identity = identity[0];
        // } else {
        //     this.identity = null;
        // }
        this.identity = JSON.parse(localStorage.getItem('currentUser'));
        return this.identity;
    }
    getToken() {
        let token = JSON.parse(localStorage.getItem('token'));
        token = 'sdasd64654asda';
        console.log(token);
        if (token && token != "undefined") {
            this.token = token;
        } else {
            this.token = null;
          
            
        }
        return this.token;
    }
    // convert string to integer
    public toInt(num: string) {
        return +num;
    }
    // formater date
    public getDate(regDate: string) {
        const date = new Date(regDate);
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit', hour12: true, hour: '2-digit', minute: "2-digit" });
    }
    goToPage(page) {
        console.log(page)
        this._router.navigate(['./' + page]);

    }
    //formatter txt to html
    public htmlEntities(str) {
        return String(str).replace('&ntilde;', '??')
            .replace('&Ntilde;', '??')
            .replace('&amp;', '&')
            .replace('&Ntilde;', '??')
            .replace('&ntilde;', '??')
            .replace('&Ntilde;', '??')
            .replace('&Agrave;', '??')
            .replace('&Aacute;', '??')
            .replace('&Acirc;', '??')
            .replace('&Atilde;', '??')
            .replace('&Auml;', '??')
            .replace('&Aring;', '??')
            .replace('&AElig;', '??')
            .replace('&Ccedil;', '??')
            .replace('&Egrave;', '??')
            .replace('&Eacute;', '??')
            .replace('&Ecirc;', '??')
            .replace('&Euml;', '??')
            .replace('&Igrave;', '??')
            .replace('&Iacute;', '??')
            .replace('&Icirc;', '??')
            .replace('&Iuml;', '??')
            .replace('&ETH;', '??')
            .replace('&Ntilde;', '??')
            .replace('&Ograve;', '??')
            .replace('&Oacute;', '??')
            .replace('&Ocirc;', '??')
            .replace('&Otilde;', '??')
            .replace('&Ouml;', '??')
            .replace('&Oslash;', '??')
            .replace('&Ugrave;', '??')
            .replace('&Uacute;', '??')
            .replace('&Ucirc;', '??')
            .replace('&Uuml;', '??')
            .replace('&Yacute;', '??')
            .replace('&THORN;', '??')
            .replace('&szlig;', '??')
            .replace('&agrave;', '??')
            .replace('&aacute;', '??')
            .replace('&acirc;', '??')
            .replace('&atilde;', '??')
            .replace('&auml;', '??')
            .replace('&aring;', '??')
            .replace('&aelig;', '??')
            .replace('&ccedil;', '??')
            .replace('&egrave;', '??')
            .replace('&eacute;', '??')
            .replace('&ecirc;', '??')
            .replace('&euml;', '??')
            .replace('&igrave;', '??')
            .replace('&iacute;', '??')
            .replace('&icirc;', '??')
            .replace('&iuml;', '??')
            .replace('&eth;', '??')
            .replace('&ntilde;', '??')
            .replace('&ograve;', '??')
            .replace('&oacute;', '??')
            .replace('&ocirc;', '??')
            .replace('&otilde;', '??')
            .replace('&ouml;', '??')
            .replace('&oslash;', '??')
            .replace('&ugrave;', '??')
            .replace('&uacute;', '??')
            .replace('&ucirc;', '??')
            .replace('&uuml;', '??')
            .replace('&yacute;', '??')
            .replace('&thorn;', '??')
            .replace('&yuml;', '??')
            .replace('&nbsp', '')
            .replace('nbsp', '')
            .replace('&', '');
    }
    public CalculateAge(age) {
        if (age) {
            var timestamp = Date.parse(age);
            if (isNaN(timestamp) == false) {
                const convertAge = new Date(timestamp);
                const timeDiff = Math.abs(Date.now() - convertAge.getTime());               
                return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
            }

        } else {
            return 0;
        }
    }
    public monthDate(idate) {
        let week = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
        let month = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const myArr = idate.split("-");
        let date = new Date(idate);

        var fechaNum = myArr[2];      
        var mes_date= myArr[1] - 1
        return [{week:week[date.getDay()],month:month[mes_date],year:date.getFullYear(),date:week[date.getDay()] + " " + fechaNum + " de " + month[mes_date] + " de " + date.getFullYear()}]


    }
}