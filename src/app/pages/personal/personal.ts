import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal.html'
})
export class Personal implements OnInit {
  
  listaPersonal: any[] = [];
  listaPuestos: any[] = [];
  
  // Modelo para el formulario
  empleado: any = { nombre: '', apellido: '', idPuesto: 0 };
  esEdicion: boolean = false;

  constructor(private service: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargar();
    this.cargarPuestos();
  }

  cargar() {
    this.service.getPersonalCompleto().subscribe(data => this.listaPersonal = data);
  }

  cargarPuestos() {
    this.service.getPuestos().subscribe(data => this.listaPuestos = data);
  }

  guardar() {
    // 🛠️ CORRECCIÓN: Separamos la alerta del retorno para cumplir con TypeScript
    if (!this.empleado.nombre || this.empleado.idPuesto == 0) {
      Swal.fire('Error', 'Nombre y Puesto son obligatorios', 'warning');
      return; // Detenemos la función sin devolver un valor
    }

    if (this.esEdicion) {
      this.service.actualizarPersonal(this.empleado.idEmpleado, this.empleado).subscribe(() => {
        Swal.fire('Éxito', 'Empleado actualizado', 'success');
        this.limpiar();
        this.cargar();
      });
    } else {
      this.service.crearPersonal(this.empleado).subscribe(() => {
        Swal.fire('Éxito', 'Empleado contratado', 'success');
        this.limpiar();
        this.cargar();
      });
    }
  }

  editar(item: any) {
    this.empleado = { 
      idEmpleado: item.idEmpleado, 
      nombre: item.nombre, 
      apellido: item.apellido, 
      idPuesto: item.idPuesto 
    };
    this.esEdicion = true;
    window.scrollTo(0,0);
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Dar de baja?',
      text: "El empleado quedará inactivo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarPersonal(id).subscribe(() => {
          Swal.fire('Baja procesada', '', 'success');
          this.cargar();
        });
      }
    });
  }

  limpiar() {
    this.empleado = { nombre: '', apellido: '', idPuesto: 0 };
    this.esEdicion = false;
  }

  volver() { this.router.navigate(['/dashboard']); }
}