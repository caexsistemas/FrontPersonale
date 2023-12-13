import { Injectable } from '@angular/core';
import { Point } from 'chart.js';
const SignaturePad = require('signature_pad');
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignatureService {
    private signaturePad: any;  // Cambiado a 'any' para adaptarse a 'require'
    private signaturePointsSubject = new BehaviorSubject<Point[]>([]);
    signaturePoints$: Observable<Point[]> = this.signaturePointsSubject.asObservable();
  
    initialize(canvas: HTMLCanvasElement): void {
      const SignaturePad = require('signature_pad');
      this.signaturePad = new SignaturePad(canvas);
      this.signaturePad.onEnd = () => {
        this.signaturePointsSubject.next(this.signaturePad.toData());
      };
    }
  
    clear(): void {
      this.signaturePad.clear();
      this.signaturePointsSubject.next([]);
    }
  
    toDataURL(): string {
      return this.signaturePad.toDataURL();
    }
}
