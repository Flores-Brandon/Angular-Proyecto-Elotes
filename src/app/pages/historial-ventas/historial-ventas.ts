import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
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
  
  listaVentas: any[] = [];     // Aquí caen los 10 registros de la página
  totalVendido: number = 0;    // Suma de lo que se ve en pantalla

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  // Variables de Paginación Server-Side
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  totalRegistros: number = 0; // Total real en la BD

  formatoExportacion: string = 'csv'; 

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarHoy();
  }

  cargarHoy() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const fechaStr = `${year}-${month}-${day}`; 
    this.fechaInicio = fechaStr;
    this.fechaFin = fechaStr;

    // Iniciamos buscando la página 1
    this.buscar(1); 
  }

  // 🔎 BÚSQUEDA PAGINADA (Server-Side)
  buscar(pagina: number = 1) {
    this.paginaActual = pagina;

    // Llamamos al servicio (false = no exportar, pagina = número de página)
    this.productoService.getVentas(this.fechaInicio, this.fechaFin, false, this.paginaActual).subscribe({
      next: (respuesta: any) => {
        // El backend devuelve un objeto: { total: 120, datos: [...] }
        if (respuesta && respuesta.datos) {
            this.listaVentas = respuesta.datos;
            this.totalRegistros = respuesta.total;
            
            // Calculamos páginas totales
            this.totalPaginas = Math.ceil(this.totalRegistros / this.itemsPorPagina);
        } else {
            this.listaVentas = [];
            this.totalRegistros = 0;
            this.totalPaginas = 1;
        }

        this.calcularTotal(); // Sumamos lo que se ve en pantalla
      },
      error: (err) => {
        console.error('Error cargando ventas', err);
        this.listaVentas = [];
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
    });
  }

  // 🔄 CAMBIO DE PÁGINA (Vuelve a llamar al servidor)
  cambiarPagina(delta: number) {
    const nuevaPagina = this.paginaActual + delta;
    
    // Validamos que la página exista antes de pedirla
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.buscar(nuevaPagina); // ⚡ Pide el siguiente bloque a SQL Server
    }
  }

  // 📥 EXPORTACIÓN MASIVA (Corregida para leer objeto {Datos: ...})
  exportarArchivo() {
    Swal.fire({
      title: 'Descargando datos...',
      text: 'Obteniendo el historial completo. Por favor espere.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Pasamos 'true' para activar el modo exportación en el Backend
    this.productoService.getVentas(this.fechaInicio, this.fechaFin, true).subscribe({
      next: (respuesta: any) => {
        
        // 🛠️ CORRECCIÓN: Extraemos el array real desde la respuesta
        let datosCompletos = [];

        if (respuesta && Array.isArray(respuesta.datos)) {
            datosCompletos = respuesta.datos;
        } else if (respuesta && Array.isArray(respuesta.Datos)) {
            datosCompletos = respuesta.Datos;
        } else if (Array.isArray(respuesta)) {
            datosCompletos = respuesta;
        }

        // Validamos si obtuvimos datos
        if (datosCompletos.length === 0) {
          Swal.fire('Atención', 'No hay datos para exportar', 'warning');
          return;
        }

        // Guardamos temporalmente la lista pequeña y usamos la completa
        const listaRespaldo = this.listaVentas;
        this.listaVentas = datosCompletos;

        setTimeout(() => {
          try {
            switch (this.formatoExportacion) {
              case 'csv': this.generarCSV(); break;
              case 'json': this.generarJSON(); break;
              case 'pdf': this.generarPDF(); break;
            }
            
            Swal.fire({
              icon: 'success',
              title: '¡Descarga Lista!',
              text: `Se procesaron ${datosCompletos.length} registros.`,
              timer: 2000,
              showConfirmButton: false
            });
          } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Falló la generación del archivo', 'error');
          } finally {
            // Restauramos la lista paginada (los 10 registros)
            this.listaVentas = listaRespaldo;
          }
        }, 500);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el historial completo.', 'error')
    });
  }

  // --- CÁLCULOS Y FORMATOS ---

  calcularTotal() {
    if (!this.listaVentas) {
      this.totalVendido = 0;
      return;
    }
    // Suma solo de la página actual visible
    this.totalVendido = this.listaVentas.reduce((suma, venta) => {
      const valor = venta.totalVenta || venta.TotalVenta || 0;
      return suma + Number(valor);
    }, 0);
  }

  getDescripcionVenta(v: any, soloTexto: boolean = false): string {
    const idTipo = Number(v.idTipoVenta || v.IdTipoVenta || 0);
    const idPago = Number(v.idFormaPago || v.IdFormaPago || 0);

    if (idTipo === 2) return soloTexto ? 'Cortesía / Regalo' : '🎁 Cortesía / Regalo';
    if (idPago === 1) return soloTexto ? 'Efectivo' : '💵 Efectivo';
    return soloTexto ? 'Tarjeta / Transf.' : '💳 Tarjeta / Transf.';
  }

  getColorVenta(v: any): string {
    const idTipo = Number(v.idTipoVenta || v.IdTipoVenta || 0);
    const idPago = Number(v.idFormaPago || v.IdFormaPago || 0);
    if (idTipo === 2) return '#e67e22'; 
    if (idPago === 1) return 'green';   
    return '#2980b9';                   
  }

  // --- GENERADORES DE ARCHIVOS ---

  generarCSV() {
    const filas = [];
    filas.push("ID,Fecha,Metodo Pago,Total,Cajero");
    this.listaVentas.forEach(v => {
      const fechaLimpia = new Date(v.fechaHora).toLocaleString().replace(',', '');
      const metodoTexto = this.getDescripcionVenta(v, true); 
      filas.push(`${v.idVenta},"${fechaLimpia}","${metodoTexto}",${v.totalVenta},${v.idUsuario}`);
    });
    const csvContent = filas.join("\n");
    this.descargarBlob("\uFEFF" + csvContent, 'text/csv', 'csv');
  }

  generarJSON() {
    const datosLimpios = this.listaVentas.map(v => ({
      Id: v.idVenta,
      Fecha: v.fechaHora,
      Metodo: this.getDescripcionVenta(v, true), 
      Total: v.totalVenta,
      Cajero: v.idUsuario
    }));
    const jsonContent = JSON.stringify(datosLimpios, null, 2);
    this.descargarBlob(jsonContent, 'application/json', 'json');
  }

  generarPDF() {
    const LIMITE_PDF = 3000;
    let datosParaPDF = this.listaVentas;
    let notaAlPie = "";

    if (this.listaVentas.length > LIMITE_PDF) {
      datosParaPDF = this.listaVentas.slice(0, LIMITE_PDF);
      notaAlPie = `NOTA: Se muestran solo los primeros ${LIMITE_PDF} registros por seguridad.`;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Historial de Ventas', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);
    
    // Calculamos el total real de la lista completa (exportación)
    const totalExportacion = this.listaVentas.reduce((sum, v) => sum + Number(v.totalVenta || v.TotalVenta || 0), 0);
    doc.text(`Total del Periodo: $${totalExportacion.toFixed(2)}`, 14, 35);

    const cuerpoTabla = datosParaPDF.map(v => [
      v.idVenta,
      new Date(v.fechaHora).toLocaleString(),
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