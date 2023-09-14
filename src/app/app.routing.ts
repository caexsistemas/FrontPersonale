import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Import Containers
import { DefaultLayoutComponent } from "./containers";
import { LoginComponent } from "./views/login/login.component";
import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { P403Component } from "./views/error/403.component";
import { SelfManagementModule } from "./views/selfManagement/selfManagement.module";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "404",
    component: P404Component,
    data: {
      title: "Page 404",
    },
  },
  {
    path: "500",
    component: P500Component,
    data: {
      title: "Page 500",
    },
  },
  {
    path: "403",
    component: P403Component,
    data: {
      title: "Acceso denegado",
    },
  },
  {
    path: "login",
    component: LoginComponent,
    data: {
      title: "Login Page",
    },
  },
  {
    path: "logout/:sure",
    component: LoginComponent,
    data: {
      title: "Login Page",
    },
  },
  {
    path: "",
    component: DefaultLayoutComponent,
    data: {
      title: "Home",
    },
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("./views/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: "admin",
        loadChildren: () =>
          import("./views/administrator/administrator.module").then(
            (m) => m.AdministratorModule
          ),
      },
      {
        path: "management",
        loadChildren: () =>
          import("./views/management/management.module").then(
            (m) => m.ManagementModule
          ),
      },
      {
        path: "incapacidades",
        loadChildren: () =>
          import("./views/incapacidades/incapacidades.module").then(
            (m) => m.IncapacidadesModule
          ),
      },
      {
        path: "nomi",
        loadChildren: () =>
          import("./views/novedadesnomina/novedadesnomina.module").then(
            (m) => m.NovedadesnominaModule
          ),
      },
      {
        path: "procesalud",
        loadChildren: () =>
          import("./views/novedadesalud/novedadesalud.module").then(
            (m) => m.NovedadeSaludModule
          ),
      },
      {
        path: "incapasinsop",
        loadChildren: () =>
          import("./views/incapasinsop/incapasinsop.module").then(
            (m) => m.IncapasinsopModule
          ),
      },
      {
        path: "callcenter",
        loadChildren: () =>
          import("./views/callcenter/callcenter.module").then(
            (m) => m.CallcenterModule
          ),
      },
      {
        path: "inventory",
        loadChildren: () =>
          import("./views/inventory/inventory.module").then(
            (m) => m.InventoryModule
          ),
      },
      {
        path: "selection",
        loadChildren: () =>
          import("./views/selection/selection.module").then(
            (m) => m.SelectionModule
          ),
      },
      {
        path: "selfManagement",
        loadChildren: () =>
          import("./views/selfManagement/selfManagement.module").then(
            (m) => m.SelfManagementModule
          ),
      },
      {
        path: "sig",
        loadChildren: () =>
          import("./views/sig/sig.module").then((m) => m.SigModule),
      },
      {
        path: "applications",
        loadChildren: () =>
          import("./views/applications/applications.module").then(
            (m) => m.ApplicationsModule
          ),
      },
      {
        path: "process",
        loadChildren: () =>
          import("./views/process/process.module").then((m) => m.ProcessModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
