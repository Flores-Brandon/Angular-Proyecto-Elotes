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

  // 👇 VARIABLE DE CONTROL
  cajaAbierta: boolean = false; 
  cargando: boolean = true; // Para que no parpadee feo al inicio

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.verificarCaja();
  }

  // 👇 PRIMERO VERIFICAMOS LA CAJA
  verificarCaja() {
    this.productoService.verificarTurno().subscribe({
      next: (resp) => {
        this.cajaAbierta = resp.abierto;
        this.cargando = false;
        
        // Solo si está abierta cargamos los productos
        if (this.cajaAbierta) {
          this.cargarProductos();
        }
      },
      error: () => {
        this.cajaAbierta = false;
        this.cargando = false;
      }
    });
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
    if (this.pagoCon >= this.total) {
      this.cambio = this.pagoCon - this.total;
    } else {
      this.cambio = 0;
    }
  }

  cobrar(metodo: string) {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    let esRegalo = false;

    if (metodo === 'Regalo') {
      esRegalo = true;
      this.pagoCon = 0;
      this.cambio = 0;
    } 
    else if (metodo === 'Tarjeta') {
      this.pagoCon = this.total;
      this.cambio = 0;
    }
    else if (metodo === 'Efectivo') {
      if (this.pagoCon < this.total) {
        alert('El pago en efectivo es insuficiente');
        return;
      }
    }

    const ventaModelo = {
      totalVenta: this.total,
      pagoRecibido: this.pagoCon,
      cambioDado: this.cambio,
      esRegalado: esRegalo,
      metodoPago: metodo,
    };

    this.productoService.registrarVenta(ventaModelo).subscribe({
      next: (resp) => {
        if(esRegalo) alert('🎁 Producto regalado registrado.');
        else alert(`¡Venta Exitosa (${metodo})!\nCambio: $${this.cambio}`);
        
        this.limpiarTodo();
      },
      error: (err) => {
        console.error(err);
        // Si el backend rechaza por caja cerrada, aquí atrapamos el error también
        alert('⛔ ERROR: ' + (err.error || 'No se pudo registrar la venta.'));
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
  
  irACaja() {
    this.router.navigate(['/caja']);
  }
}