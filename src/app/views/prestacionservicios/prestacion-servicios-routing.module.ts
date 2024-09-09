import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContratistasComponent } from './contratistas/contratistas.component';
import { GestionContratistasComponent } from './gestion-contratistas/gestion-contratistas.component';
import { RetiroContratistasComponent } from './retiro-contratistas/retiro-contratistas.component';
import { NoSeguridadComponent } from './no-seguridad/no-seguridad.component';

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Prestación Servicios",
    },
    children: [
      {
        path: "contratistas",
        component: ContratistasComponent,
        data: {
          title: "Contratistas",
        },
      },
      {
        path: "gestion",
        component: GestionContratistasComponent,
        data: {
          title: "Gestión contratistas",
        },
      },
      {
        path: "retiro",
        component: RetiroContratistasComponent,
        data: {
          title: "Retiro contratistas"
        }
      },    
      {
        path: "sin-seguridad",
        component: NoSeguridadComponent,
        data: {
          title: "Contratistas sin seguridad social"
        }
      },    
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrestacionServiciosRoutingModule { }
