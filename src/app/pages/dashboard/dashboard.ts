import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2'; 

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
  
  // 👇 DOS VARIABLES DE CONTROL AHORA
  esJefe: boolean = false;
  esGerente: boolean = false;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    // 1. LEEMOS EL ROL AL INICIAR
    const rolGuardado = localStorage.getItem('miRol');
    console.log('Rol detectado en Dashboard:', rolGuardado);

    // 2. EVALUACIÓN DE ROLES
    this.esJefe = (rolGuardado === 'Jefe'); 
    this.esGerente = (rolGuardado === 'Gerente'); 

    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (datos: any) => this.listaProductos = datos,
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  guardar() {
    // 🔒 PERMISO: JEFE O GERENTE PUEDEN EDITAR EL MENÚ
    if (!this.esJefe && !this.esGerente) {
      Swal.fire('Acceso denegado', 'No tienes permisos para modificar el menú.', 'error');
      return; 
    }

    if (!this.nuevoProducto.nombre || this.nuevoProducto.precioVenta <= 0) {
      Swal.fire('Faltan datos', 'Por favor ingresa un nombre y precio válido.', 'warning');
      return;
    }

    if (this.esEdicion) {
      this.productoService.actualizarProducto(this.nuevoProducto.idProducto, this.nuevoProducto).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'El producto se modificó correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar el producto.', 'error')
      });
    } else {
      this.nuevoProducto.idProducto = 0; 
      this.productoService.crearProducto(this.nuevoProducto).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'Nuevo producto agregado al menú.',
            timer: 2000,
            showConfirmButton: false
          });
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: () => Swal.fire('Error', 'No se pudo guardar el producto.', 'error')
      });
    }
  }

  editar(item: any) {
    // JEFE O GERENTE pueden activar edición
    if (!this.esJefe && !this.esGerente) return;

    this.nuevoProducto = { ...item }; 
    this.esEdicion = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number) {
    // 🔒 CANDADO ESTRICTO: SOLO EL JEFE PUEDE BORRAR
    if (!this.esJefe) {
      Swal.fire('Permiso Insuficiente', 'Solo el Dueño puede eliminar productos.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Eliminarás este producto del menú permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El producto ha sido borrado.', 'success');
            this.cargarProductos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  limpiarFormulario() {
    this.nuevoProducto = { idProducto: 0, nombre: '', precioVenta: 0 };
    this.esEdicion = false;
  }

  // --- NAVEGACIÓN CON PERMISOS ---

  irAInsumos() { 
    // Jefe o Gerente entran
    if(this.esJefe || this.esGerente) this.router.navigate(['/insumos']); 
  }

  irAHistorial() { 
    // Jefe o Gerente entran
    if(this.esJefe || this.esGerente) this.router.navigate(['/historial']); 
  }

  irAEmpleados() { 
    // SOLO JEFE entra
    if(this.esJefe) {
      this.router.navigate(['/empleados']); 
    } else {
      Swal.fire('Acceso Restringido', 'Solo el Dueño puede gestionar personal.', 'warning');
    }
  }

  irACaja() { this.router.navigate(['/caja']); } 
  irAVentas() { this.router.navigate(['/ventas']); }

  salir() {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}