import { Routes } from '@angular/router';
import { ExampleComponent } from 'app/modules/admin/example/example.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from 'app/layout/layout.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ClienteRegistroComponent } from './cliente-registro/cliente-registro.component';
import { ClienteComponent } from './cliente/cliente.component';
import { ClienteFacturarComponent } from './cliente-facturar/cliente-facturar.component';

export default [
    {
        path: '',
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'perfil', component: PerfilComponent },
            { path: 'clientes', component: ClientesComponent },
            { path: 'clientes/nuevo', component: ClienteRegistroComponent },
            { path: 'consultar-cliente/:id', component: ClienteRegistroComponent },
            { path: 'clientes/cliente/:id', component: ClienteComponent },
            { path: 'clientes/cliente/:id/facturar', component: ClienteFacturarComponent },
        ]
    },
] as Routes;