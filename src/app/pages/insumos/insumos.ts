import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <--- Importante para navegar
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insumos.html',
  styleUrl: './insumos.css'
})
export class Insumos implements OnInit {
  
  listaInsumos: any[] = [];
  nuevoInsumo: any = { idInsumo: 0, nombre: '', unidadMedida: '', stock: 0, requiereConteo: false };
  esEdicion: boolean = false;

  // 👇 Asegúrate de que 'private router: Router' esté aquí
  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarInsumos();
  }

  cargarInsumos() {
    this.productoService.getInsumos().subscribe({
      next: (datos) => this.listaInsumos = datos,
      error: () => Swal.fire('Error', 'No se pudo cargar el inventario', 'error')
    });
  }

  guardar() {
    if (!this.nuevoInsumo.nombre || !this.nuevoInsumo.unidadMedida || this.nuevoInsumo.stock < 0) {
      Swal.fire('Cuidado', 'Llena todos los campos correctamente.', 'warning');
      return;
    }

    if (this.esEdicion) {
      this.productoService.actualizarInsumo(this.nuevoInsumo.idInsumo, this.nuevoInsumo).subscribe({
        next: () => {
          Swal.fire('Actualizado', `El insumo ${this.nuevoInsumo.nombre} se actualizó.`, 'success');
          this.limpiarFormulario();
          this.cargarInsumos();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar.', 'error')
      });
    } else {
      this.productoService.crearInsumo(this.nuevoInsumo).subscribe({
        next: () => {
          Swal.fire('Creado', `Insumo ${this.nuevoInsumo.nombre} agregado.`, 'success');
          this.limpiarFormulario();
          this.cargarInsumos();
        },
        error: () => Swal.fire('Error', 'No se pudo guardar.', 'error')
      });
    }
  }

  editar(item: any) {
    this.nuevoInsumo = { ...item };
    this.esEdicion = true;
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar Insumo?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarInsumo(id).subscribe({
          next: () => {
            Swal.fire('Borrado', 'El insumo ha sido eliminado.', 'success');
            this.cargarInsumos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

limpiarFormulario() {
  this.nuevoInsumo = { idInsumo: 0, nombre: '', unidadMedida: '', stock: 0, requiereConteo: false };
  this.esEdicion = false;
}

  // 👇 ESTA FUNCIÓN ES LA QUE HACE LA MAGIA DEL BOTÓN
  volver() {
    this.router.navigate(['/dashboard']);
  }
}