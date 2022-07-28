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
    name: 'TH 360',
    url: '/dashboard',
    icon: 'icon-speedometer',
  },
  {
    title: true,
    name: ''
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
    icon: 'icon-user'
    
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
        name: 'Ingreso-Retiro Trabajador',
        url: '/nomi/ingreso',
        icon: 'icon-calculator'
      }
    ]

  },

  {
    name: 'Gestion Incapacidades Sin Soporte',
    url: '/incapasinsop/gestion',
    icon: 'icon-docs'
    
  },
  
  
];
