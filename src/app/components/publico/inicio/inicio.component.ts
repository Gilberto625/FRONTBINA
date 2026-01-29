import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ServicioService } from '../../../services/servicio.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements OnInit {
  private servicioService = inject(ServicioService);
  private authService = inject(AuthService);
  
  serviciosDestacados = this.servicioService.servicios().slice(0, 4);
  isLoggedIn = false;

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();
    this.isLoggedIn = !!usuario;
  }
}
