import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://localhost:7123/api'; // Apuntamos a la base de la API

  constructor(private http: HttpClient) { }

  // --- OBTENER PRODUCTOS ---
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`, { withCredentials: true });
  }

  // --- CREAR PRODUCTO ---
  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productos`, producto, { withCredentials: true });
  }

  // --- ¡NUEVO! ACTUALIZAR (PUT) ---
  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/productos/${id}`, producto, { withCredentials: true });
  }

  // --- ¡NUEVO! ELIMINAR (DELETE) ---
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${id}`, { withCredentials: true });
  }

  // --- ¡NUEVO! INICIAR SESIÓN ---
  login(credenciales: any): Observable<any> {
    // Enviamos usuario y contraseña a /api/login
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales, { withCredentials: true });
  }

// 👥 EMPLEADOS
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { withCredentials: true });
  }

  crearEmpleado(empleado: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, empleado, { withCredentials: true });
  }
  
  // ...
  
  actualizarEmpleado(id: number, empleado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, empleado, { withCredentials: true });
  }

  bajaEmpleado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, { withCredentials: true });
  }

  // ==========================================
  // 🌽 MÓDULO DE INSUMOS
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

  // 💰 REGISTRAR VENTA (MySQL)
  registrarVenta(venta: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ventas`, venta, { withCredentials: true });
  }

 // 📜 OBTENER HISTORIAL (CON FILTROS)
  // Los signos '?' significan que los datos son opcionales. Si no mandas nada, trae todo.
  getVentas(inicio?: string, fin?: string): Observable<any[]> {
    let url = `${this.apiUrl}/ventas`;
    
    // Si hay fechas, las agregamos a la URL
    if (inicio || fin) {
      url += '?';
      if (inicio) url += `inicio=${inicio}&`;
      if (fin) url += `fin=${fin}`;
    }

    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // 🔐 CONTROL DE CAJA
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

  inicializarInventario(items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/inicializar`, items, { withCredentials: true });
  }

  restarInventario(nombre: string, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/restar`, { nombre, cantidad }, { withCredentials: true });
  }

  obtenerVentasHoy() {
    // Llama directamente al endpoint que ya sabe la hora de México
    return this.http.get(`${this.apiUrl}/ventas/hoy`); 
  }
}