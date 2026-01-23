/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

//menus para el admin
export const defaultNavigation_admin: FuseNavigationItem[] = [
    {
        id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : '/admin/home'
    },
    {
        id   : 'organizaciones',
        title: 'Organizaciones',
        type : 'basic',
        icon : 'heroicons_outline:building-office',
        link : '/admin/organizaciones'
    },
    {
        id   : 'area',
        title: 'Area',
        type : 'basic',
        icon : 'heroicons_outline:rectangle-stack',
        link : '/admin/areas'
    },
    {
        id   : 'subarea',
        title: 'Sub area',
        type : 'basic',
        icon : 'heroicons_outline:squares-2x2',
        link : '/admin/subareas'
    },
    {
        id   : 'equiposDeTrabajo',
        title: 'Equipos de trabajo',
        type : 'basic',
        icon : 'heroicons_outline:wrench',
        link : '/admin/equipos-de-trabajo'
    },
    {
        id   : 'ticketsAbiertos',
        title: 'Tickets abiertos',
        type : 'basic',
        icon : 'heroicons_outline:ticket',
        link : '/admin/tickets-abiertos'
    },

    {
        id   : 'ticketDetalle',
        title: 'Ticket detalle',
        type : 'basic',
        icon : 'heroicons_outline:ticket',
        link : '/admin/ticket-detalle'
    },


    {
        id   : 'nuevo-ticket',
        title: 'Nuevo ticket',
        type : 'basic',
        icon : 'heroicons_outline:plus-circle',
        link : '/admin/nuevo-ticket'
    },
    {
        id   : 'usuarios',
        title: 'Usuarios',
        type : 'basic',
        icon : 'heroicons_outline:users',
        link : '/admin/usuarios'
    },
    {
        id   : 'configuracion',
        title: 'Configuracion',
        type : 'basic',
        icon : 'heroicons_outline:cog-6-tooth',
        link : '/admin/configuracion'
    }
];
export const compactNavigation_admin: FuseNavigationItem[] = [
    {
       id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/admin/home'
    },
    {
        id   : 'organizaciones',
        title: 'Organizaciones',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/admin/organizaciones'
    }
];
export const futuristicNavigation_admin: FuseNavigationItem[] = [
    {
       id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/admin/home'
    },
    {
        id   : 'organizaciones',
        title: 'Organizaciones',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/admin/organizaciones'
    }
];
export const horizontalNavigation_admin: FuseNavigationItem[] = [
    {
       id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/admin/home'
    },
    {
        id   : 'organizaciones',
        title: 'Organizaciones',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/admin/organizaciones'
    }
];

//menus para el responsable
export const defaultNavigation_responsable: FuseNavigationItem[] = [
    {
        id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : '/responsable/home'
    },
    {
        id   : 'nuevo-ticket',
        title: 'Nuevo ticket',
        type : 'basic',
        icon : 'heroicons_outline:plus-circle',
        link : '/responsable/nuevo-ticket'
    },
    {
        id   : 'ticketsAbiertos',
        title: 'Mis tickets abiertos',
        type : 'basic',
        icon : 'heroicons_outline:ticket',
        link : '/responsable/tickets-abiertos'
    },
];
export const compactNavigation_responsable: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example super',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation_responsable: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example super',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation_responsable: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example super',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];

//menus para el supervisor
export const defaultNavigation_supervisor: FuseNavigationItem[] = [
   {
        id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : '/supervisor/home'
    },
    {
        id   : 'TicketsPorAsignar',
        title: 'Tickets por asignar',
        type : 'basic',
        icon : 'heroicons_outline:ticket',
        link : '/supervisor/tickets-por-asignar'
    },
    {
        id   : 'ticketsAsignados',
        title: 'Tickets asignados',
        type : 'basic',
        icon : 'heroicons_outline:ticket',
        link : '/supervisor/tickets-asignados'
    },
];
export const compactNavigation_supervisor: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example super',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation_supervisor: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example super',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation_supervisor: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example super',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];

//-----------------
export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
