import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  
  // Objeto para el formulario
  nuevoInsumo = {
    idInsumo: 0,
    nombre: '',
    unidadMedida: '',
    stock: 0,
    requiereConteo: false // 🟢 IMPORTANTE: Inicializar en false
  };

  esEdicion: boolean = false;

  constructor(private service: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarInsumos();
  }

  cargarInsumos() {
    this.service.getInsumos().subscribe({
      next: (datos: any) => this.listaInsumos = datos,
      error: (err) => console.error('Error cargando insumos', err)
    });
  }

  guardar() {
    // Validaciones básicas
    if (!this.nuevoInsumo.nombre || !this.nuevoInsumo.unidadMedida) {
      Swal.fire('Atención', 'Nombre y Unidad son obligatorios', 'warning');
      return;
    }

    if (this.esEdicion) {
      // ACTUALIZAR
      this.service.actualizarInsumo(this.nuevoInsumo.idInsumo, this.nuevoInsumo).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El insumo se actualizó correctamente', 'success');
          this.limpiarFormulario();
          this.cargarInsumos();
        },
        error: (err) => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
    } else {
      // CREAR NUEVO
      // Nos aseguramos de mandar el id en 0 para que la BD lo genere
      const insumoParaGuardar = { ...this.nuevoInsumo, idInsumo: 0 };
      
      this.service.crearInsumo(insumoParaGuardar).subscribe({
        next: () => {
          Swal.fire('Creado', 'Nuevo insumo agregado', 'success');
          this.limpiarFormulario();
          this.cargarInsumos();
        },
        error: (err) => Swal.fire('Error', 'No se pudo crear el insumo', 'error')
      });
    }
  }

  editar(item: any) {
    this.esEdicion = true;
    // Copiamos el objeto para no modificar la tabla en vivo hasta guardar
    // Esto copia también el estado de 'requiereConteo'
    this.nuevoInsumo = { ...item }; 
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarInsumo(id).subscribe({
          next: () => {
            Swal.fire('Borrado', 'El insumo ha sido eliminado.', 'success');
            this.cargarInsumos();
          },
          error: (err) => Swal.fire('Error', 'No se puede borrar (quizás tiene recetas asociadas)', 'error')
        });
      }
    });
  }

  limpiarFormulario() {
    this.esEdicion = false;
    this.nuevoInsumo = {
      idInsumo: 0,
      nombre: '',
      unidadMedida: '',
      stock: 0,
      requiereConteo: false // 🟢 Resetear a false
    };
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}