import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.html'
})
export class Proveedores implements OnInit {
  
  listaProveedores: any[] = [];
  nuevoProv: any = { empresa: '', contacto: '', telefono: '' };
  esEdicion: boolean = false;

  constructor(private service: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getProveedores().subscribe({
      next: (data: any) => this.listaProveedores = data,
      error: (e) => console.error(e)
    });
  }

  guardar() {
    // 🛠️ CORRECCIÓN: Separamos la alerta del return
    if (!this.nuevoProv.empresa) {
      Swal.fire('Error', 'Nombre de empresa requerido', 'warning');
      return; // Return vacío para que TypeScript no se queje
    }

    if (this.esEdicion) {
      this.service.actualizarProveedor(this.nuevoProv.idProveedor, this.nuevoProv).subscribe(() => {
        Swal.fire('Éxito', 'Proveedor actualizado', 'success');
        this.limpiar();
        this.cargar();
      });
    } else {
      this.service.crearProveedor(this.nuevoProv).subscribe(() => {
        Swal.fire('Éxito', 'Proveedor registrado', 'success');
        this.limpiar();
        this.cargar();
      });
    }
  }

  editar(item: any) {
    this.nuevoProv = { ...item }; // Clonar objeto
    this.esEdicion = true;
    window.scrollTo(0,0); // Subir para ver el formulario
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar Proveedor?',
      text: "No se borrará el historial, solo se desactivará.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarProveedor(id).subscribe(() => {
          Swal.fire('Eliminado', '', 'success');
          this.cargar();
        });
      }
    });
  }

  limpiar() {
    this.nuevoProv = { empresa: '', contacto: '', telefono: '' };
    this.esEdicion = false;
  }

  volver() { this.router.navigate(['/dashboard']); }
}