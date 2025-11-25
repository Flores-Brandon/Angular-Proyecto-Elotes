import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Insumos } from './pages/insumos/insumos'; 
import { Ventas } from './pages/ventas/ventas';
import { HistorialVentas } from './pages/historial-ventas/historial-ventas';
import { Empleados } from './pages/empleados/empleados';
import { ControlCaja } from './pages/control-caja/control-caja';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'insumos', component: Insumos }, // Usamos el nombre corto 'Insumos'
    { path: 'ventas', component: Ventas }, // Asegúrate de importar el componente Ventas
    { path: 'historial', component: HistorialVentas }, // Nueva ruta para Historial de Venta
    { path: 'empleados', component: Empleados },
    { path: 'caja', component: ControlCaja }
    
];