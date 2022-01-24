/**
    * @description      : 
    * @author           : Maricel Jimenez
    * @group            : 
    * @created          : 25/06/2021 - 15:08:57
    *
**/
import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
  },
  {
    title: true,
    name: 'Administrador'
  },
  {
    title: true,
    name: 'Novedades Nomina'
  },

  {
    name: 'Administrador',
    url: '/admin',
    icon: 'icon-settings',
    children: [
      {
        name: 'Usuarios',
        url: '/admin/users',
        icon: 'icon-user'
      },
      {
        name: 'Listas',
        url: '/admin/lists',
        icon: 'icon-list '
      },
      {
        name: 'Departamentos',
        url: '/admin/state',
        icon: 'icon-location-pin'
      }
    ]
  },

  {
    name: 'Gestion personal',
    url: '/management/gestion',
    icon: 'icon-settings'
    
  },

  {
    name: 'Gestion Incapacidades',
    url: '/incapacidades/gestion',
    icon: 'icon-docs'
    
  },
  
  {

    name: 'Novedades Nomina',
    url: '/nomi',
    icon: 'icon-equalizer',
    children: [
      {
        name: 'Ingreso Trabajador',
        url: '/nomi/ingreso',
        icon: 'icon-calculator'
      }
    ]

  }
  
];
