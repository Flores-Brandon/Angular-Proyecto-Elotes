import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule], // Solo necesitamos CommonModule para la tabla
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css'
})
export class HistorialVentas implements OnInit {
  
  listaVentas: any[] = [];
  totalVendido: number = 0;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarVentas();
  }

  cargarVentas() {
    this.productoService.getVentas().subscribe({
      next: (datos) => {
        this.listaVentas = datos;
        this.calcularTotal();
      },
      error: (err) => console.error('Error cargando ventas', err)
    });
  }

  calcularTotal() {
    // Sumamos todo el dinero de la columna 'totalVenta'
    this.totalVendido = this.listaVentas.reduce((suma, venta) => suma + venta.totalVenta, 0);
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}