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
  nuevoProducto: any = { nombre: '', precioVenta: 0 };
  esEdicion: boolean = false;

  // Roles
  esJefe: boolean = false;
  esGerente: boolean = false;
  rolActual: string = '';

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.verificarRol();
    this.cargarProductos();
  }

  verificarRol() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.rolActual = usuario.rol;
      
      console.log("Rol detectado en Dashboard:", this.rolActual);

      if (this.rolActual === 'Jefe') this.esJefe = true;
      if (this.rolActual === 'Gerente') this.esGerente = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (datos) => this.listaProductos = datos,
      error: (e) => console.error(e)
    });
  }

  guardar() {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.precioVenta <= 0) {
      Swal.fire('Error', 'Llena los datos correctamente', 'warning');
      return;
    }

    if (this.esEdicion) {
      this.productoService.actualizarProducto(this.nuevoProducto.idProducto, this.nuevoProducto).subscribe(() => {
        Swal.fire('Actualizado', 'Producto modificado con éxito', 'success');
        this.limpiarFormulario();
        this.cargarProductos();
      });
    } else {
      this.productoService.crearProducto(this.nuevoProducto).subscribe(() => {
        Swal.fire('Creado', 'Producto agregado al menú', 'success');
        this.limpiarFormulario();
        this.cargarProductos();
      });
    }
  }

  editar(item: any) {
    this.nuevoProducto = { ...item }; 
    this.esEdicion = true;
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(id).subscribe(() => {
          Swal.fire('Eliminado', 'El producto ha sido borrado.', 'success');
          this.cargarProductos();
        });
      }
    });
  }

  limpiarFormulario() {
    this.nuevoProducto = { nombre: '', precioVenta: 0 };
    this.esEdicion = false;
  }

  // ==========================================
  // 🧭 SISTEMA DE NAVEGACIÓN
  // ==========================================

  irAVentas() {
    this.router.navigate(['/ventas']);
  }

  irAInsumos() {
    this.router.navigate(['/insumos']);
  }

  irAHistorial() {
    this.router.navigate(['/historial-ventas']);
  }

  irAEmpleados() {
    // Este botón lleva a la gestión de USUARIOS (Login)
    this.router.navigate(['/empleados']);
  }

  irAPersonal() {
    // Este botón lleva a la gestión de PERSONAL (RRHH - Puestos y Salarios)
    this.router.navigate(['/personal']);
  }

  // 👇 AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA 👇
  irAProveedores() {
    this.router.navigate(['/proveedores']);
  }

  irACaja() {
    this.router.navigate(['/caja']);
  }

  salir() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}