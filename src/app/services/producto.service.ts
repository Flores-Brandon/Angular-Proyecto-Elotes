import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://localhost:7123/api'; // Apuntamos a la base de la API

  constructor(private http: HttpClient) { }

  // ==========================================
  // 🌽 MÓDULO DE PRODUCTOS
  // ==========================================

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`, { withCredentials: true });
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productos`, producto, { withCredentials: true });
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/productos/${id}`, producto, { withCredentials: true });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${id}`, { withCredentials: true });
  }

  // ==========================================
  // 🔐 AUTENTICACIÓN
  // ==========================================

  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales, { withCredentials: true });
  }

  // ==========================================
  // 👥 EMPLEADOS / USUARIOS (LOGIN)
  // ==========================================

  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { withCredentials: true });
  }

  crearEmpleado(empleado: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, empleado, { withCredentials: true });
  }
  
  actualizarEmpleado(id: number, empleado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, empleado, { withCredentials: true });
  }

  bajaEmpleado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, { withCredentials: true });
  }

  // ==========================================
  // 📦 MÓDULO DE INSUMOS
  // ==========================================

  getInsumos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/insumos`, { withCredentials: true });
  }

  crearInsumo(insumo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insumos`, insumo, { withCredentials: true });
  }

  actualizarInsumo(id: number, insumo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/insumos/${id}`, insumo, { withCredentials: true });
  }

  eliminarInsumo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/insumos/${id}`, { withCredentials: true });
  }

  // ==========================================
  // 💰 VENTAS Y HISTORIAL
  // ==========================================

  // Registrar venta nueva (MySQL)
  registrarVenta(venta: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ventas`, venta, { withCredentials: true });
  }

  // 📜 OBTENER HISTORIAL (OPTIMIZADO CON PAGINACIÓN)
  // 👇 CAMBIO IMPORTANTE: Agregamos 'pagina' y cambiamos el tipo de retorno a 'any'
  getVentas(inicio?: string, fin?: string, exportar: boolean = false, pagina: number = 1): Observable<any> {
    let params = [];

    // Si hay fechas, las agregamos al array de parámetros
    if (inicio) params.push(`inicio=${inicio}`);
    if (fin) params.push(`fin=${fin}`);
    
    // Agregamos el parámetro exportar (true o false)
    params.push(`exportar=${exportar}`);

    // 👇 Si NO es exportación, enviamos los datos de paginación
    if (!exportar) {
        params.push(`pagina=${pagina}`);
        params.push(`cantidad=10`); 
    }

    // Construimos la Query String (?inicio=...&fin=...&exportar=true&pagina=1)
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';

    return this.http.get<any>(`${this.apiUrl}/ventas${queryString}`, { withCredentials: true });
  }

  // Endpoint rápido para el total del día
  obtenerVentasHoy() {
    return this.http.get(`${this.apiUrl}/ventas/hoy`); 
  }

  // ==========================================
  // 🔐 CONTROL DE CAJA (TURNOS)
  // ==========================================

  verificarTurno(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/turnos/estado`, { withCredentials: true });
  }

  abrirTurno(datos: any): Observable<any> {
    // datos debe ser { saldoInicial, username, password }
    return this.http.post<any>(`${this.apiUrl}/turnos/abrir`, datos, { withCredentials: true });
  }

  cerrarTurno(datos: any): Observable<any> {
    // datos debe ser { username, password }
    return this.http.post<any>(`${this.apiUrl}/turnos/cerrar`, datos, { withCredentials: true });
  }
  
  obtenerResumenTurno(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/turnos/resumen`, { withCredentials: true });
  }

  // ==========================================
  // 📦 INVENTARIO (AJUSTES)
  // ==========================================

  inicializarInventario(items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/inicializar`, items, { withCredentials: true });
  }

  restarInventario(nombre: string, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/restar`, { nombre, cantidad }, { withCredentials: true });
  }

  // ==========================================
  // ✨ NUEVOS MÓDULOS (CRUD COMPLETO)
  // ==========================================

  // --- 👔 PERSONAL (RRHH) ---
  
  // Obtener lista completa (JOIN)
  getPersonalCompleto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personal`, { withCredentials: true });
  }

  // Obtener lista de puestos para el dropdown
  getPuestos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personal/puestos`, { withCredentials: true });
  }

  // Crear Empleado
  crearPersonal(empleado: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal`, empleado, { withCredentials: true });
  }

  // Editar Empleado
  actualizarPersonal(id: number, empleado: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/personal/${id}`, empleado, { withCredentials: true });
  }

  // Eliminar Empleado (Soft Delete)
  eliminarPersonal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/personal/${id}`, { withCredentials: true });
  }

  // --- 🚚 PROVEEDORES (COMPRAS) ---

  // Obtener lista
  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores`, { withCredentials: true });
  }

  // Crear Proveedor
  crearProveedor(prov: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proveedores`, prov, { withCredentials: true });
  }

  // Editar Proveedor
  actualizarProveedor(id: number, prov: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/proveedores/${id}`, prov, { withCredentials: true });
  }

  // Eliminar Proveedor (Soft Delete)
  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proveedores/${id}`, { withCredentials: true });
  }

}