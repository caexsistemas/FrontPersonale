import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tools } from '../Tools/tools.page';

import { global } from './global';

@Injectable({
    providedIn: 'root'
})

export class NovedadesnominaServices {

    public url: string;


    constructor(public _http: HttpClient,){
        this.url = global.url;
    }

    onUpload(file):Observable<any>{
        const fd= new FormData;
        fd.append('file',file,file.name);
        return   this._http.post(this.url+'novnomi/setArchive',fd); 
    }

}