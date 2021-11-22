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
        icon: 'icon-list'
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
    
  }
  
];
