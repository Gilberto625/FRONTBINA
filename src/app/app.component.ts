import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './components/shared/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent],
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
