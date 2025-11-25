import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-control-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-caja.html'
})
export class ControlCaja implements OnInit {
  
  estadoCaja: any = null;
  resumen: any = null; // <--- Aquí guardaremos los números
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
        
        // 👇 SI ESTÁ ABIERTA, CARGAMOS EL RESUMEN INMEDIATAMENTE
        if (resp.abierto) {
          this.cargarResumen();
        }
      },
      error: (err) => console.error(err)
    });
  }

  cargarResumen() {
    this.service.obtenerResumenTurno().subscribe({
      next: (datos) => this.resumen = datos,
      error: (err) => console.error("Error al cargar resumen", err)
    });
  }

  abrir() {
    // ... (Tu código de abrir igual que antes) ...
    if (this.montoInicial < 0 || !this.auth.username || !this.auth.password) {
      alert("Ingresa monto, usuario y contraseña."); return;
    }
    const datos = { saldoInicial: this.montoInicial, username: this.auth.username, password: this.auth.password };
    this.service.abrirTurno(datos).subscribe({
      next: () => { alert("¡Caja Abierta!"); this.limpiar(); this.checarEstado(); },
      error: (err) => alert("Error: " + (err.error || "Credenciales incorrectas"))
    });
  }

  cerrar() {
    if (!this.auth.username || !this.auth.password) {
      alert("Ingresa usuario y contraseña para confirmar corte."); return;
    }

    // Mostramos el total esperado en el mensaje de confirmación
    const totalEsperado = this.resumen ? this.resumen.dineroEnCaja : 0;

    if (confirm(`El sistema espera $${totalEsperado} en efectivo.\n¿Confirmar cierre?`)) {
      const datos = { username: this.auth.username, password: this.auth.password };
      this.service.cerrarTurno(datos).subscribe({
        next: () => { alert("Turno Cerrado Correctamente."); this.limpiar(); this.checarEstado(); },
        error: (err) => alert("Error: " + (err.error || "Credenciales incorrectas"))
      });
    }
  }

  limpiar() {
    this.montoInicial = 0;
    this.auth = { username: '', password: '' };
    this.resumen = null;
  }
  
  volver() { this.router.navigate(['/dashboard']); }
}