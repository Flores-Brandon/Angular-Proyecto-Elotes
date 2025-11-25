import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para la tabla (*ngFor)
import { FormsModule } from '@angular/forms';   // Importante para el formulario (ngModel)
import { Router } from '@angular/router';       // Para el botón de "Volver"
import { ProductoService } from '../../services/producto.service'; // Nuestro mesero

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule], // ¡No olvides estos imports!
  templateUrl: './insumos.html',        // Asegúrate que este nombre coincida con tu archivo
  styleUrl: './insumos.css',
})
export class Insumos implements OnInit {
  
  // Variables para guardar datos
  listaInsumos: any[] = [];
  nuevoInsumo: any = { idInsumo: 0, nombre: '', unidadMedida: '', costo: 0 };
  esEdicion: boolean = false;

  // Inyectamos el servicio y el router
  constructor(private productoService: ProductoService, private router: Router) {}

  // Al iniciar, cargamos la lista
  ngOnInit() {
    this.cargarInsumos();
  }

  cargarInsumos() {
    this.productoService.getInsumos().subscribe({
      next: (datos) => {
        this.listaInsumos = datos;
        console.log('Insumos cargados:', datos);
      },
      error: (error) => {
        console.error('Error:', error);
        // Si falla (ej. no hay sesión), mandamos al login
        this.router.navigate(['/login']);
      }
    });
  }

  guardar() {
    // Validación simple
    if (!this.nuevoInsumo.nombre || this.nuevoInsumo.costo <= 0) {
      alert('Por favor completa los datos correctamente.');
      return;
    }

    if (this.esEdicion) {
      // EDITAR
      this.productoService.actualizarInsumo(this.nuevoInsumo.idInsumo, this.nuevoInsumo).subscribe({
        next: () => {
          alert('Insumo actualizado');
          this.limpiarFormulario();
          this.cargarInsumos();
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      // CREAR
      this.productoService.crearInsumo(this.nuevoInsumo).subscribe({
        next: () => {
          alert('Insumo creado');
          this.limpiarFormulario();
          this.cargarInsumos();
        },
        error: () => alert('Error al crear')
      });
    }
  }

  // Prepara el formulario para editar
  editar(item: any) {
    this.nuevoInsumo = { ...item }; // Copia el objeto para no alterar la tabla visualmente
    this.esEdicion = true;
  }

  // Elimina el insumo
  eliminar(id: number) {
    if (confirm('¿Seguro que quieres borrar este insumo?')) {
      this.productoService.eliminarInsumo(id).subscribe({
        next: () => this.cargarInsumos(),
        error: () => alert('Error al eliminar')
      });
    }
  }

  limpiarFormulario() {
    this.nuevoInsumo = { idInsumo: 0, nombre: '', unidadMedida: '', costo: 0 };
    this.esEdicion = false;
  }

  irAProductos() {
    this.router.navigate(['/dashboard']);
  }
}