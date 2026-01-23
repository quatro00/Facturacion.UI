import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'example' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'example' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes') },
        ]
    },
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/admin/home/home.route') },
            { path: 'organizaciones', loadChildren: () => import('app/modules/admin/organizaciones/organizaciones.route') },
            { path: 'areas', loadChildren: () => import('app/modules/admin/areas/areas.route') },
            { path: 'usuarios', loadChildren: () => import('app/modules/admin/usuarios/usuarios.route') },
            { path: 'subareas', loadChildren: () => import('app/modules/admin/subareas/subareas.route') },
            { path: 'nuevo-ticket', loadChildren: () => import('app/modules/admin/nuevo-ticket/nuevo-ticket.route') },
            { path: 'tickets-abiertos', loadChildren: () => import('app/modules/admin/tickets/tickets.route') },
            { path: 'ticket-detalle/:id', loadChildren: () => import('app/modules/admin/ticket-detalle/ticket-detalle.route') },
            { path: 'equipos-de-trabajo', loadChildren: () => import('app/modules/admin/equipos-de-trabajo/equipos-de-trabajo.route') },
        ]
    },
    {
        path: 'responsable',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/responsable/home/home.route')},
            { path: 'nuevo-ticket', loadChildren: () => import('app/modules/responsable/registrar-ticket/registrar-ticket.route')},
            { path: 'tickets-abiertos', loadChildren: () => import('app/modules/responsable/tickets-abiertos/tickets-abiertos.route')},
            { path: 'ticket-detalle/:id', loadChildren: () => import('app/modules/responsable/ticket-detalle/ticket-detalle.route') },
        ]
    },
    {
        path: 'supervisor',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/supervisor/home/home.route')},
            { path: 'tickets-por-asignar', loadChildren: () => import('app/modules/supervisor/tickets-por-asignar/tickets-por-asignar.route')},
            { path: 'tickets-asignados', loadChildren: () => import('app/modules/supervisor/tickets-asignados/tickets-asignados.route')},
            { path: 'ticket-detalle/:id', loadChildren: () => import('app/modules/supervisor/ticket-detalle/ticket-detalle.route') },
        ]
    },
];
