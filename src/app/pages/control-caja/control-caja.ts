import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-control-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-caja.html'
})
export class ControlCaja implements OnInit {
  
  estadoCaja: any = null;
  resumen: any = null;
  montoInicial: number = 0;
  auth = { username: '', password: '' };

  constructor(private service: ProductoService, private router: Router) {}

  ngOnInit() {
    this.checarEstado();
  }

  checarEstado() {
    this.service.verificarTurno().subscribe({
      next: (resp) => {
        this.estadoCaja = resp;
        if (resp.abierto) this.cargarResumen();
      },
      error: (err) => console.error(err)
    });
  }

  cargarResumen() {
    this.service.obtenerResumenTurno().subscribe({
      next: (datos) => this.resumen = datos
    });
  }

  abrir() {
    if (this.montoInicial < 0 || !this.auth.username || !this.auth.password) {
      Swal.fire('Faltan datos', 'Ingresa monto, usuario y contraseña.', 'warning');
      return;
    }
    
    const datos = { saldoInicial: this.montoInicial, username: this.auth.username, password: this.auth.password };
    
    this.service.abrirTurno(datos).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Caja Abierta!',
          text: 'Turno iniciado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        this.limpiar();
        this.checarEstado();
      },
      error: (err) => Swal.fire('Error', err.error || 'Credenciales incorrectas', 'error')
    });
  }

  cerrar() {
    if (!this.auth.username || !this.auth.password) {
      Swal.fire('Espera', 'Firma el corte con usuario y contraseña.', 'info');
      return;
    }

    const totalEsperado = this.resumen ? this.resumen.dineroEnCaja : 0;

    Swal.fire({
      title: '¿Cerrar Turno?',
      html: `Se espera <b>$${totalEsperado}</b> en efectivo.<br>¿Confirmar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const datos = { username: this.auth.username, password: this.auth.password };
        this.service.cerrarTurno(datos).subscribe({
          next: () => {
            Swal.fire('¡Cerrado!', 'Turno finalizado.', 'success');
            this.limpiar();
            this.checarEstado();
          },
          error: (err) => Swal.fire('Error', err.error, 'error')
        });
      }
    });
  }

  limpiar() {
    this.montoInicial = 0;
    this.auth = { username: '', password: '' };
    this.resumen = null;
  }
  
  volver() { this.router.navigate(['/dashboard']); }
}