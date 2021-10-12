import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users';
import { global } from './global';

@Injectable()
export class LoginServices {
       public url: string;
    constructor(public _http: HttpClient) {
        this.url = global.url;
    }
    login(user):Observable<any>{
        let json =JSON.stringify(user);
        let headers= new HttpHeaders().set('Content-Type','application/json');
        return this._http.post(this.url+'User/Login',json,{headers:headers});

    }
}