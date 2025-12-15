import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2'; // Opcional: Para alertas bonitas

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  
  usuario = { username: '', password: '' };
  mensajeError = '';

  constructor(private productoService: ProductoService, private router: Router) {}

 entrar() {
    this.productoService.login(this.usuario).subscribe({
      next: (respuesta: any) => {
        console.log('Login exitoso:', respuesta);
        
        // 🛠️ CORRECCIÓN CLAVE:
        // Guardamos todo el objeto respuesta como 'usuario' (string)
        // Esto es lo que busca el Dashboard para dejarte pasar.
        localStorage.setItem('usuario', JSON.stringify(respuesta)); 
        
        // (Opcional) También puedes dejar esto si lo usas en otros lados
        localStorage.setItem('miRol', respuesta.rol); 

        // Redirigir
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        console.error(error);
        this.mensajeError = 'Usuario o contraseña incorrectos';
        
        // Si tienes SweetAlert instalado, se ve mejor así:
        Swal.fire('Error', 'Credenciales incorrectas', 'error');
      }
    });
  }
}