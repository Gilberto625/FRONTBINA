import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css'
})
export class GlobalLoaderComponent {
  loading$ = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}
}

