import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontendAngular';

  ngOnInit(): void {
    console.log('🎯 AppComponent inicializado');
    console.log('📍 Ubicación actual:', window.location.href);
  }
}
