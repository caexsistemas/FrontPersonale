import { Injectable } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class Tools {

    public identity;
    public token;
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

    getIdentity() {
        let identity = JSON.parse(localStorage.getItem('identity'));
        console.log('->'+identity);
        if (identity && identity != "undefined") {
            this.identity = identity[0];
        } else {
            this.identity = null;
        }
        return this.identity;
    }
    getToken() {
        let token = JSON.parse(localStorage.getItem('token'));
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
        return String(str).replace('&ntilde;', 'ñ')
            .replace('&Ntilde;', 'Ñ')
            .replace('&amp;', '&')
            .replace('&Ntilde;', 'Ñ')
            .replace('&ntilde;', 'ñ')
            .replace('&Ntilde;', 'Ñ')
            .replace('&Agrave;', 'À')
            .replace('&Aacute;', 'Á')
            .replace('&Acirc;', 'Â')
            .replace('&Atilde;', 'Ã')
            .replace('&Auml;', 'Ä')
            .replace('&Aring;', 'Å')
            .replace('&AElig;', 'Æ')
            .replace('&Ccedil;', 'Ç')
            .replace('&Egrave;', 'È')
            .replace('&Eacute;', 'É')
            .replace('&Ecirc;', 'Ê')
            .replace('&Euml;', 'Ë')
            .replace('&Igrave;', 'Ì')
            .replace('&Iacute;', 'Í')
            .replace('&Icirc;', 'Î')
            .replace('&Iuml;', 'Ï')
            .replace('&ETH;', 'Ð')
            .replace('&Ntilde;', 'Ñ')
            .replace('&Ograve;', 'Ò')
            .replace('&Oacute;', 'Ó')
            .replace('&Ocirc;', 'Ô')
            .replace('&Otilde;', 'Õ')
            .replace('&Ouml;', 'Ö')
            .replace('&Oslash;', 'Ø')
            .replace('&Ugrave;', 'Ù')
            .replace('&Uacute;', 'Ú')
            .replace('&Ucirc;', 'Û')
            .replace('&Uuml;', 'Ü')
            .replace('&Yacute;', 'Ý')
            .replace('&THORN;', 'Þ')
            .replace('&szlig;', 'ß')
            .replace('&agrave;', 'à')
            .replace('&aacute;', 'á')
            .replace('&acirc;', 'â')
            .replace('&atilde;', 'ã')
            .replace('&auml;', 'ä')
            .replace('&aring;', 'å')
            .replace('&aelig;', 'æ')
            .replace('&ccedil;', 'ç')
            .replace('&egrave;', 'è')
            .replace('&eacute;', 'é')
            .replace('&ecirc;', 'ê')
            .replace('&euml;', 'ë')
            .replace('&igrave;', 'ì')
            .replace('&iacute;', 'í')
            .replace('&icirc;', 'î')
            .replace('&iuml;', 'ï')
            .replace('&eth;', 'ð')
            .replace('&ntilde;', 'ñ')
            .replace('&ograve;', 'ò')
            .replace('&oacute;', 'ó')
            .replace('&ocirc;', 'ô')
            .replace('&otilde;', 'õ')
            .replace('&ouml;', 'ö')
            .replace('&oslash;', 'ø')
            .replace('&ugrave;', 'ù')
            .replace('&uacute;', 'ú')
            .replace('&ucirc;', 'û')
            .replace('&uuml;', 'ü')
            .replace('&yacute;', 'ý')
            .replace('&thorn;', 'þ')
            .replace('&yuml;', 'ÿ')
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