import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  
  listaProductos: any[] = [];
  carrito: any[] = [];
  
  total: number = 0;
  pagoCon: number = 0;
  cambio: number = 0;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (datos) => this.listaProductos = datos,
      error: () => this.router.navigate(['/login'])
    });
  }

  agregarAlCarrito(producto: any) {
    this.carrito.push(producto);
    this.calcularTotal();
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.total = this.carrito.reduce((suma, item) => suma + item.precioVenta, 0);
    this.calcularCambio();
  }

  calcularCambio() {
    // Solo calculamos cambio si paga con más del total
    if (this.pagoCon >= this.total) {
      this.cambio = this.pagoCon - this.total;
    } else {
      this.cambio = 0;
    }
  }

  // 👇 ESTA ES LA FUNCIÓN ACTUALIZADA
  cobrar(metodo: string) {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    let esRegalo = false;

    // Lógica según el botón presionado
    if (metodo === 'Regalo') {
      esRegalo = true;
      this.pagoCon = 0;
      this.cambio = 0;
    } 
    else if (metodo === 'Tarjeta') {
      this.pagoCon = this.total; // En tarjeta se cobra exacto
      this.cambio = 0;
    }
    else if (metodo === 'Efectivo') {
      if (this.pagoCon < this.total) {
        alert('El pago en efectivo es insuficiente');
        return;
      }
    }

    // Preparamos el objeto para el Backend
    const ventaModelo = {
      totalVenta: this.total,
      pagoRecibido: this.pagoCon,
      cambioDado: this.cambio,
      esRegalado: esRegalo,
      metodoPago: metodo, // <--- Aquí mandamos 'Efectivo', 'Tarjeta' o 'Regalo'
    };

    this.productoService.registrarVenta(ventaModelo).subscribe({
      next: (resp) => {
        if(esRegalo) alert('🎁 Producto regalado registrado.');
        else alert(`¡Venta Exitosa (${metodo})!\nCambio: $${this.cambio}`);
        
        this.limpiarTodo();
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar la venta. Revisa que la caja esté abierta.');
      }
    });
  }

  limpiarTodo() {
    this.carrito = [];
    this.total = 0;
    this.pagoCon = 0;
    this.cambio = 0;
  }

  salir() {
    this.router.navigate(['/dashboard']);
  }
}