// ip.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class IpService {
  constructor(private http: HttpClient) {}

  getIpInfo() {
    return this.http.get('https://ipinfo.io/json'); 
  }
}
