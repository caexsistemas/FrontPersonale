import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ManagementComponent } from "./management.component";
import { CertificatesComponent } from "./certificates/certificates.component";
import { FormalitiesComponent } from "./formalities/formalities.component";
import { LiquidationFormalitiesComponent } from "./liquidation/liquidationFormalities.component";
import { CollaboratorsPermissionComponent } from "./collaboratorsPermission/collaboratorsPermission.component";

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Personal",
    },
    children: [
      {
        path: "",
        redirectTo: "gestion",
      },
      {
        path: "gestion",
        component: ManagementComponent,
        data: {
          title: "Gestion de personal",
        },
      },
      {
        path: "certificates",
        component: CertificatesComponent,
        data: {
          title: "Gestion de Certificados",
        },
      },
      {
        path: "formalities",
        component: FormalitiesComponent,
        data: {
          title: "Paz y Salvos",
        },
      },
      {
        path: "pazLiq",
        component: LiquidationFormalitiesComponent,
        data: {
          title: "Liquidación de paz y salvos",
        },
      },
      {
        path: "collaborators-permission",
        component: CollaboratorsPermissionComponent,
        data: {
          title: "Permisos Colaboradores"
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagementRoutingModule {}
