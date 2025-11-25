import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- Esto arregla el *ngIf
import { FormsModule } from '@angular/forms';   // <--- Esto arregla el [(ngModel)]
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // 👇 ¡ESTA LÍNEA ES VITAL! Sin ella, el HTML no entiende los formularios
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // 👇 Estas son las variables que el HTML estaba buscando y no encontraba
  usuario = { username: '', password: '' };
  mensajeError = '';

  constructor(private productoService: ProductoService, private router: Router) {}

  // 👇 Esta es la función que el botón quiere usar
 entrar() {
    this.productoService.login(this.usuario).subscribe({
      next: (respuesta: any) => {
        console.log('Login exitoso:', respuesta);
        
        
        // Guardamos el rol en la memoria local para consultarlo en otras pantallas
        localStorage.setItem('miRol', respuesta.rol); 

        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        
      }
    });
  }
}