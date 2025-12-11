import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
// 👇 Importaciones necesarias para PDF y Alertas
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2'; 

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
  totalVendido: number = 0;    // Inicializado en 0 para evitar errores

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  // 👇 Nueva variable para el Select de Exportación
  formatoExportacion: string = 'csv'; 

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarHoy();
  }

  cargarHoy() {
    const now = new Date();
    // Ajuste de zona horaria manual simple para evitar problemas de UTC
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const fechaStr = `${year}-${month}-${day}`; 
    
    this.fechaInicio = fechaStr;
    this.fechaFin = fechaStr;

    this.buscar(); 
  }

  buscar() {
    this.productoService.getVentas(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos: any) => {
        if (Array.isArray(datos)) {
          this.listaVentas = datos;
        } else {
          this.listaVentas = [];
        }
        this.procesarDatos();
      },
      error: (err) => {
        console.error('Error cargando ventas', err);
        this.listaVentas = []; 
        this.procesarDatos();
      }
    });
  }

  procesarDatos() {
    this.calcularTotal();
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    if (!this.listaVentas) this.listaVentas = [];
    this.totalPaginas = Math.ceil(this.listaVentas.length / this.itemsPorPagina) || 1;
    
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.ventasPaginadas = this.listaVentas.slice(inicio, fin);
  }

  cambiarPagina(delta: number) {
    this.paginaActual += delta;
    this.actualizarPaginacion();
  }

  calcularTotal() {
    // 1. Validación de seguridad
    if (!this.listaVentas || !Array.isArray(this.listaVentas)) {
      this.totalVendido = 0;
      return;
    }

    // 2. Suma forzando la conversión a Número
    this.totalVendido = this.listaVentas.reduce((suma, venta) => {
      // Convertimos el texto "140.00" a número 140.00 antes de sumar
      // Buscamos 'totalVenta' (minúscula) o 'TotalVenta' (mayúscula) por seguridad
      const valor = venta.totalVenta || venta.TotalVenta || 0;
      const monto = Number(valor); 
      return suma + (isNaN(monto) ? 0 : monto);
    }, 0);
  }

  // --- FUNCIONES PARA TRADUCIR IDs A TEXTO ---

 getDescripcionVenta(v: any, soloTexto: boolean = false): string {
    const idTipo = Number(v.idTipoVenta || v.IdTipoVenta || 0);
    const idPago = Number(v.idFormaPago || v.IdFormaPago || 0);

    if (idTipo === 2) {
      // Si es para exportar (PDF/CSV), mandamos solo texto. Si es para pantalla, con emoji.
      return soloTexto ? 'Cortesía / Regalo' : '🎁 Cortesía / Regalo';
    }
    
    if (idPago === 1) {
      return soloTexto ? 'Efectivo' : '💵 Efectivo';
    }
    
    return soloTexto ? 'Tarjeta / Transf.' : '💳 Tarjeta / Transf.';
  }

  getColorVenta(v: any): string {
    const idTipo = Number(v.idTipoVenta || v.IdTipoVenta || 0);
    const idPago = Number(v.idFormaPago || v.IdFormaPago || 0);

    if (idTipo === 2) return '#e67e22'; // Naranja (Regalo)
    if (idPago === 1) return 'green';   // Verde (Efectivo)
    return '#2980b9';                   // Azul (Tarjeta)
  }

  // --- LÓGICA MAESTRA DE EXPORTACIÓN (CSV, JSON, PDF) ---
  
  exportarArchivo() {
    if (!this.listaVentas || this.listaVentas.length === 0) {
      Swal.fire('Atención', 'No hay datos para exportar', 'warning');
      return;
    }

    // Mensaje de carga si son muchos datos (ej. 100,000)
    if (this.listaVentas.length > 5000) {
      Swal.fire({
        title: 'Generando archivo...',
        text: `Procesando ${this.listaVentas.length} registros. Espere un momento.`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    }

    // Timeout para que la UI se actualice antes de procesar
    setTimeout(() => {
      switch (this.formatoExportacion) {
        case 'csv': this.generarCSV(); break;
        case 'json': this.generarJSON(); break;
        case 'pdf': this.generarPDF(); break;
      }
      if (this.listaVentas.length > 5000) Swal.close();
    }, 100);
  }

  // 1. CSV (Optimizado para Big Data)
  generarCSV() {
    const filas = [];
    filas.push("ID,Fecha,Metodo Pago,Total,Cajero");

    this.listaVentas.forEach(v => {
      const fechaLimpia = new Date(v.fechaHora).toLocaleString().replace(',', '');
      
      // 👇 PASAMOS 'true' PARA OBTENER SOLO TEXTO LIMPIO
      const metodoTexto = this.getDescripcionVenta(v, true); 
      
      filas.push(`${v.idVenta},"${fechaLimpia}","${metodoTexto}",${v.totalVenta},${v.idUsuario}`);
    });

    const csvContent = filas.join("\n");
    
    // 👇 AQUÍ ESTÁ EL TRUCO PARA EXCEL: "\uFEFF" (Byte Order Mark)
    this.descargarBlob("\uFEFF" + csvContent, 'text/csv', 'csv');
  }

  // 2. JSON
 generarJSON() {
    const datosLimpios = this.listaVentas.map(v => ({
      Id: v.idVenta,
      Fecha: v.fechaHora,
      // 👇 Texto limpio también en JSON
      Metodo: this.getDescripcionVenta(v, true), 
      Total: v.totalVenta,
      Cajero: v.idUsuario
    }));

    const jsonContent = JSON.stringify(datosLimpios, null, 2);
    this.descargarBlob(jsonContent, 'application/json', 'json');
  }

  // 3. PDF (Con límite de seguridad para no tronar el navegador)
  generarPDF() {
    const LIMITE_PDF = 3000;
    let datosParaPDF = this.listaVentas;
    let notaAlPie = "";

    if (this.listaVentas.length > LIMITE_PDF) {
      datosParaPDF = this.listaVentas.slice(0, LIMITE_PDF);
      notaAlPie = `NOTA: Se muestran solo los primeros ${LIMITE_PDF} registros...`;
      Swal.fire('Aviso', 'PDF limitado por seguridad de memoria.', 'info');
    }

const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte de Historial de Ventas', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Vendido: $${this.totalVendido.toFixed(2)}`, 14, 35);

    const cuerpoTabla = datosParaPDF.map(v => [
      v.idVenta,
      new Date(v.fechaHora).toLocaleString(),
      
      // 👇 PASAMOS 'true' PARA QUE EL PDF NO INTENTE PINTAR EMOJIS
      this.getDescripcionVenta(v, true), 
      
      `$${Number(v.totalVenta).toFixed(2)}`,
      v.idUsuario
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Fecha', 'Método', 'Total', 'Cajero']],
      body: cuerpoTabla,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] }
    });

    if (notaAlPie) {
      doc.setTextColor(200, 0, 0);
      doc.text(notaAlPie, 14, (doc as any).lastAutoTable.finalY + 10);
    }

    doc.save(`Reporte_Ventas_${this.fechaInicio}.pdf`);
  }

  

  // --- HELPER DE DESCARGA ---
  descargarBlob(contenido: string, tipoMime: string, extension: string) {
    const blob = new Blob([contenido], { type: `${tipoMime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Ventas_${this.fechaInicio || 'General'}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarHoy(); 
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}