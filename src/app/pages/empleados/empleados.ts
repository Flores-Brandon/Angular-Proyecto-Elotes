import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css'
})
export class Empleados implements OnInit {
  
  listaEmpleados: any[] = [];
  
  // Objeto para el nuevo empleado
  nuevoEmpleado = { 
    nombreCompleto: '', 
    username: '', 
    passwordHash: '', // Aquí guardaremos la pass temporalmente 
    idRol: 2 // Por defecto creamos "Empleados" (Rol 2)
  };

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.productoService.getEmpleados().subscribe({
      next: (datos) => this.listaEmpleados = datos,
      error: () => alert('Error al cargar empleados')
    });
  }

  guardar() {
    // Validar datos
    if (!this.nuevoEmpleado.nombreCompleto || !this.nuevoEmpleado.username || !this.nuevoEmpleado.passwordHash) {
      alert('Por favor completa todos los campos.');
      return;
    }

    this.productoService.crearEmpleado(this.nuevoEmpleado).subscribe({
      next: () => {
        alert('¡Empleado creado correctamente!');
        // Limpiar formulario
        this.nuevoEmpleado = { nombreCompleto: '', username: '', passwordHash: '', idRol: 2 };
        this.cargarEmpleados();
      },
      error: (err) => {
        console.error(err);
        alert('Error: El usuario podría ya existir.');
      }
    });
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}