import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Sales } from './pages/sales/sales';

export const routes: Routes = [
    { path: 'login',component: Login},
    {path: 'sales',component: Sales},
    {path: '',redirectTo:'login',pathMatch:'full'},
    {path:'**',redirectTo:'login'}
];
