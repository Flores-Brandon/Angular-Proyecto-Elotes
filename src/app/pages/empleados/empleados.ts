import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css'
})
export class Empleados implements OnInit {
  
  listaEmpleados: any[] = [];
  
  // Objeto del formulario
  empleadoForm = { 
    idUsuario: 0,
    nombreCompleto: '', 
    username: '', 
    passwordHash: '', 
    idRol: 2 // Por defecto "Empleado"
  };

  esEdicion: boolean = false;

  constructor(private service: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getEmpleados().subscribe({
      next: (datos) => this.listaEmpleados = datos,
      error: () => Swal.fire('Error', 'No se pudieron cargar los empleados', 'error')
    });
  }

  guardar() {
    // Validación básica
    if (!this.empleadoForm.nombreCompleto || !this.empleadoForm.username) {
      Swal.fire('Faltan Datos', 'Nombre y Usuario son obligatorios.', 'warning');
      return;
    }

    // Si es nuevo, la contraseña es obligatoria
    if (!this.esEdicion && !this.empleadoForm.passwordHash) {
      Swal.fire('Faltan Datos', 'Debes asignar una contraseña inicial.', 'warning');
      return;
    }

    if (this.esEdicion) {
      // --- MODO EDICIÓN ---
      this.service.actualizarEmpleado(this.empleadoForm.idUsuario, this.empleadoForm).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Datos del empleado modificados.', 'success');
          this.limpiar();
          this.cargar();
        },
        error: (err) => Swal.fire('Error', 'No se pudo actualizar.', 'error')
      });
    } else {
      // --- MODO CREACIÓN ---
      this.service.crearEmpleado(this.empleadoForm).subscribe({
        next: () => {
          Swal.fire('Creado', 'Empleado registrado correctamente.', 'success');
          this.limpiar();
          this.cargar();
        },
        error: (err) => Swal.fire('Error', 'El usuario podría ya existir.', 'error')
      });
    }
  }

  editar(item: any) {
    this.esEdicion = true;
    this.empleadoForm = {
      idUsuario: item.idUsuario,
      nombreCompleto: item.nombreCompleto,
      username: item.username,
      passwordHash: '', 
      idRol: item.idRol
    };
  }

  baja(id: number) {
    Swal.fire({
      title: '¿Dar de baja?',
      text: "El empleado desaparecerá de la lista, pero sus ventas se conservan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.bajaEmpleado(id).subscribe({
            next: () => {
                Swal.fire('Eliminado', 'El empleado ha sido dado de baja.', 'success');
                this.cargar();
            },
            error: () => Swal.fire('Error', 'No se pudo dar de baja.', 'error')
        });
      }
    });
  }

  limpiar() {
    // Al limpiar, volvemos a poner el Rol en 2 (Empleado) por defecto
    this.empleadoForm = { idUsuario: 0, nombreCompleto: '', username: '', passwordHash: '', idRol: 2 };
    this.esEdicion = false;
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}