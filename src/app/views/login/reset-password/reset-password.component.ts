import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WebApiService } from '../../../services/web-api.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HandlerAppService } from '../../../services/handler-app.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  backgroundImageUrl: string;

  username: string = '';
  token: string = '';
  isForBoss: boolean;

  constructor(
    private fb: FormBuilder,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const url = window.location.href;
    const queryString = url.split('?')[1]; // extrae la parte después del ?
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      this.username = params.get('username') || '';
      this.token = params.get('token') || '';
      const bossParam = params.get('boss') || '0';
      
      this.isForBoss = bossParam === '1' || bossParam.toLowerCase() === 'true';

      if (this.isForBoss) {
        this.authorizeResetPassword();
      }
    }

    this.backgroundImageUrl = '360/assets/img/brand/sistema.JPG';
    this.resetForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      const password = this.resetForm.value.password;
  
      const token = this.token; 
      const username = this.username;
  
      this.handler.showLoadin("Cambiando Contraseña", "Por favor espere");

      const body = {
        username: username,
        token: token,
        password: password
      };
  
      this.WebApiService.postRequest("/reset-password", body, {}).subscribe({
        next: (response) => {
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: response.message || 'Tu contraseña fue actualizada correctamente',
            confirmButtonColor: '#3085d6'
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          Swal.close();
          if (error.error?.code === 'TOKEN_EXPIRED') {
            Swal.fire({
              icon: 'error',
              title: 'Token expirado',
              text: error.error.message || 'El token ha expirado.',
              confirmButtonColor: '#d33'
            }).then(() => {
              this.router.navigate(['/login']); // Redirige al login
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error?.message || 'Ocurrió un error al actualizar la contraseña',
              confirmButtonColor: '#d33'
            });
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor llena los campos correctamente',
        confirmButtonColor: '#f0ad4e'
      });
    }
  }

  authorizeResetPassword(): void {
    const body = {
      username: this.username,
      token: this.token,
      isForBoss: true
    };
  
    this.WebApiService.postRequest('/authorize-reset-password', body, {}).subscribe({
      next: (response: any) => {
        Swal.fire('Éxito', response.message, 'success');
      },
      error: (error) => {
        console.error('Error al autorizar:', error);
  
        // Si el backend responde con un mensaje personalizado
        const errorMessage = error?.error?.message || 'No se pudo autorizar el cambio.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });

    this.router.navigate(['/login']);

  }
  
  
}
