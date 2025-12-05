import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

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

  // Variable de control para bloqueo de pantalla
  cajaAbierta: boolean = false; 
  cargando: boolean = true;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.verificarCaja();
  }

  // 1. Verificamos si la caja está abierta al entrar
  verificarCaja() {
    this.productoService.verificarTurno().subscribe({
      next: (resp) => {
        this.cajaAbierta = resp.abierto;
        this.cargando = false;
        
        // Solo si está abierta cargamos el menú
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
    // 1. Validaciones
    if (this.carrito.length === 0) {
      Swal.fire('Carrito Vacío', 'Agrega productos antes de cobrar', 'warning');
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
        Swal.fire('Error', 'El pago en efectivo es insuficiente', 'error');
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

    // 2. Registrar Venta (Sin inventario extra)
    this.productoService.registrarVenta(ventaModelo).subscribe({
      next: (resp) => {
        if(esRegalo) {
          Swal.fire({
            icon: 'info',
            title: '🎁 Regalado',
            text: 'Se registró como merma/cortesía.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          // Ventana de Éxito
          Swal.fire({
            icon: 'success',
            title: '¡Venta Exitosa!',
            html: `<p style="font-size: 18px">Método: <b>${metodo}</b></p>
                   <h3>Su Cambio:</h3>
                   <b style="font-size: 50px; color: #27ae60;">$${this.cambio.toFixed(2)}</b>`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#27ae60'
          });
        }
        
        this.limpiarTodo();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo vender',
          text: err.error || 'Verifique que la caja esté abierta.'
        });
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