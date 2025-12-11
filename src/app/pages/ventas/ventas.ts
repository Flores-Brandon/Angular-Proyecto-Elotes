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

  cajaAbierta: boolean = false; 
  cargando: boolean = true;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.verificarCaja();
  }

  verificarCaja() {
    this.productoService.verificarTurno().subscribe({
      next: (resp) => {
        this.cajaAbierta = resp.abierto;
        this.cargando = false;
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
    // 🛠️ FIX 1: Aseguramos que el precio sea numérico al entrar al carrito
    const itemCarrito = {
      ...producto,
      precioVenta: Number(producto.precioVenta) // Forzamos conversión
    };
    this.carrito.push(itemCarrito);
    this.calcularTotal();
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    // 🛠️ FIX 2: Suma segura convirtiendo a número
    this.total = this.carrito.reduce((suma, item) => suma + Number(item.precioVenta), 0);
    this.calcularCambio();
  }

  calcularCambio() {
    // Aseguramos que pagoCon sea número
    const pago = Number(this.pagoCon);
    if (pago >= this.total) {
      this.cambio = pago - this.total;
    } else {
      this.cambio = 0;
    }
  }

  // --- LÓGICA DE COBRO ACTUALIZADA (IDs) ---
  cobrar(metodo: string) {
    if (this.carrito.length === 0) {
      Swal.fire('Carrito Vacío', 'Agrega productos antes de cobrar', 'warning');
      return;
    }

    // Variables para enviar IDs al Backend (Normalización)
    let idFormaPago = 1; // 1=Efectivo
    let idTipoVenta = 1; // 1=Normal

    if (metodo === 'Regalo') {
      idTipoVenta = 2; // 2=Regalo
      idFormaPago = 1; // (No importa, pero mandamos 1 por defecto)
      this.pagoCon = 0;
      this.cambio = 0;
    } 
    else if (metodo === 'Tarjeta') {
      idFormaPago = 2; // 2=Tarjeta
      this.pagoCon = this.total;
      this.cambio = 0;
    }
    else if (metodo === 'Efectivo') {
      idFormaPago = 1;
      if (Number(this.pagoCon) < this.total) {
        Swal.fire('Error', 'El pago en efectivo es insuficiente', 'error');
        return;
      }
    }

    const productosParaEnviar = this.carrito.map(item => ({
      idProducto: item.idProducto,
      nombre: item.nombre,
      cantidad: 1, 
      precio: item.precioVenta
    }));

    // Objeto listo para el nuevo Backend Normalizado
    const ventaModelo = {
      totalVenta: this.total,
      pagoRecibido: Number(this.pagoCon),
      cambioDado: this.cambio,
      idFormaPago: idFormaPago, // <--- ID
      idTipoVenta: idTipoVenta, // <--- ID
      productos: productosParaEnviar
    };

    this.productoService.registrarVenta(ventaModelo).subscribe({
      next: (resp) => {
        if(idTipoVenta === 2) {
          Swal.fire({
            icon: 'info',
            title: '🎁 Regalado',
            text: 'Se registró como merma/cortesía.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
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
          text: err.error || 'Error de conexión.'
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

  salir() { this.router.navigate(['/dashboard']); }
  irACaja() { this.router.navigate(['/caja']); }
}