import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  listaProductos: any[] = [];
  nuevoProducto: any = { idProducto: 0, nombre: '', precioVenta: 0 };
  esEdicion: boolean = false;
  esJefe: boolean = false;

  constructor(private productoService: ProductoService, private router: Router) {}

ngOnInit() {
    // 👇 LEEMOS EL ROL AL INICIAR
    const rolGuardado = localStorage.getItem('miRol');
    
    // Si dice "Jefe", es verdadero. Si dice "Empleado", es falso.
    this.esJefe = (rolGuardado === 'Jefe'); 

    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (datos: any) => this.listaProductos = datos,
      error: () => this.router.navigate(['/login'])
    });
  }

  guardar() {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.precioVenta <= 0) {
      alert('Llena bien los datos');
      return;
    }

    if (this.esEdicion) {
      this.productoService.actualizarProducto(this.nuevoProducto.idProducto, this.nuevoProducto).subscribe({
        next: () => {
          alert('¡Producto actualizado!');
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: () => alert('Error al actualizar.')
      });
    } else {
      this.productoService.crearProducto(this.nuevoProducto).subscribe({
        next: () => {
          alert('¡Producto creado!');
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: () => alert('Error al guardar.')
      });
    }
  }

  editar(item: any) {
    this.nuevoProducto = { ...item }; 
    this.esEdicion = true;
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que quieres borrar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => this.cargarProductos(),
        error: () => alert('Error al eliminar.')
      });
    }
  }

  limpiarFormulario() {
    this.nuevoProducto = { idProducto: 0, nombre: '', precioVenta: 0 };
    this.esEdicion = false;
  }

  // --- NAVEGACIÓN ---

  irAInsumos() {
    this.router.navigate(['/insumos']);
  }

  irACaja() {
  this.router.navigate(['/caja']);
  } 

  irAVentas() {
    this.router.navigate(['/ventas']);
  }

  irAHistorial() {
    this.router.navigate(['/historial']);
  }

  salir() {
    this.router.navigate(['/login']);
  }

  irAEmpleados() {
  this.router.navigate(['/empleados']);
  
}

}