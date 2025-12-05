import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css'
})
export class HistorialVentas implements OnInit {
  
  listaVentas: any[] = [];     // Todas las ventas encontradas
  ventasPaginadas: any[] = []; // Solo las 10 que se ven en pantalla
  totalVendido: number = 0;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    // CAMBIO IMPORTANTE: 
    // Ya no calculamos la fecha aquí con "new Date()" porque el navegador se confunde.
    // Llamamos directo a la función que pide "HOY" al servidor.
    this.cargarHoy();
  }

  // 👇 NUEVA FUNCIÓN: Carga ventas del día actual (Hora México)
  cargarHoy() {
    this.productoService.obtenerVentasHoy().subscribe({
      next: (datos: any) => {
        this.listaVentas = datos;
        this.procesarDatos(); // Recalcula totales y paginación
      },
      error: (err) => console.error('Error cargando ventas de hoy', err)
    });
  }

  // Búsqueda manual por rango de fechas
  buscar() {
    if (!this.fechaInicio || !this.fechaFin) {
      // Si no seleccionan fechas, recargamos "Hoy" por defecto
      this.cargarHoy(); 
      return;
    }

    this.productoService.getVentas(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos: any) => {
        this.listaVentas = datos;
        this.procesarDatos();
      },
      error: (err) => console.error('Error cargando ventas por filtro', err)
    });
  }

  // Función auxiliar para no repetir código
  procesarDatos() {
    this.calcularTotal();
    this.paginaActual = 1; // Volver a la página 1
    this.actualizarPaginacion();
  }

  // --- LÓGICA DE PAGINACIÓN ---
  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.listaVentas.length / this.itemsPorPagina) || 1;
    
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.ventasPaginadas = this.listaVentas.slice(inicio, fin);
  }

  cambiarPagina(delta: number) {
    this.paginaActual += delta;
    this.actualizarPaginacion();
  }

  // --- EXPORTAR A EXCEL (CSV) ---
  descargarExcel() {
    if (this.listaVentas.length === 0) {
      alert("No hay datos para descargar");
      return;
    }

    let csvContent = "ID,Fecha,Metodo Pago,Total,Cajero\n";

    this.listaVentas.forEach(v => {
      const fechaLimpia = new Date(v.fechaHora).toLocaleString().replace(',', '');
      const fila = `${v.idVenta},"${fechaLimpia}",${v.metodoPago},${v.totalVenta},${v.idUsuario}`;
      csvContent += fila + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Ventas_${this.fechaInicio || 'HOY'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  calcularTotal() {
    this.totalVendido = this.listaVentas.reduce((suma, venta) => suma + venta.totalVenta, 0);
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarHoy(); // Al limpiar, volvemos a mostrar "HOY"
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}