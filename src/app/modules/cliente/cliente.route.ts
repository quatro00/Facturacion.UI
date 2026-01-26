import { Routes } from '@angular/router';
import { ExampleComponent } from 'app/modules/admin/example/example.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from 'app/layout/layout.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ClienteRegistroComponent } from './cliente-registro/cliente-registro.component';

export default [
    {
        path: '',
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'perfil', component: PerfilComponent },
            { path: 'clientes', component: ClientesComponent },
            { path: 'clientes/nuevo', component: ClienteRegistroComponent },
            { path: 'consultar-cliente/:id', component: ClienteRegistroComponent },
        ]
    },
] as Routes;