import { Routes } from '@angular/router';

// Importación de Componentes
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Insumos } from './pages/insumos/insumos'; 
import { Ventas } from './pages/ventas/ventas';
import { HistorialVentas } from './pages/historial-ventas/historial-ventas';
import { Empleados } from './pages/empleados/empleados'; 
import { ControlCaja } from './pages/control-caja/control-caja';
import { Personal } from './pages/personal/personal';

// 👇 1. IMPORTAR EL COMPONENTE PROVEEDORES
import { Proveedores } from './pages/proveedores/proveedores';

export const routes: Routes = [
    // Redirección inicial
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Rutas Generales
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'insumos', component: Insumos },
    { path: 'ventas', component: Ventas },
    { path: 'historial-ventas', component: HistorialVentas }, 
    { path: 'empleados', component: Empleados },
    { path: 'caja', component: ControlCaja },
    { path: 'personal', component: Personal },

    // 👇 2. AGREGAR LA RUTA AQUÍ
    { path: 'proveedores', component: Proveedores },

    // Comodín: Si no encuentra la ruta, manda al login (Por esto te regresaba)
    { path: '**', redirectTo: 'login' }
];