import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BarberoService {
  private apiUrl = environment.apiUrl;
  private csrfToken: string = '';

  constructor(private http: HttpClient) {
    this.obtenerCsrfToken();
  }

  private async obtenerCsrfToken(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(environment.apiUrl + '/usuarios/csrf/')
      );
      this.csrfToken = response.csrf_token || '';
    } catch (error) {
      console.error('Error al obtener CSRF token:', error);
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.csrfToken
    });
  }

  // Resolver barbero_id desde usuario_id (endpoint público)
  async obtenerMiBarberoId(usuarioId: number): Promise<number | null> {
    try {
      const resp: any = await firstValueFrom(this.http.get(`${this.apiUrl}/barberos/`));
      const barberos = resp?.datos?.barberos || [];
      const match = barberos.find((b: any) => b.usuario_id === usuarioId);
      return match?.id ?? null;
    } catch {
      return null;
    }
  }

  // Endpoints barbero autenticado (backend)
  misCitas(filtros?: { fecha_inicio?: string; fecha_fin?: string; estado?: string }): Observable<any> {
    let url = `${this.apiUrl}/barberos/mis-citas/`;
    const params: string[] = [];
    if (filtros?.fecha_inicio) params.push(`fecha_inicio=${encodeURIComponent(filtros.fecha_inicio)}`);
    if (filtros?.fecha_fin) params.push(`fecha_fin=${encodeURIComponent(filtros.fecha_fin)}`);
    if (filtros?.estado) params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  misServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberos/mis-servicios/`);
  }

  actualizarDuracion(servicioId: number, duracion_minutos: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/barberos/mis-servicios/${servicioId}/duracion/`,
      { duracion_minutos },
      { headers: this.getHeaders() }
    );
  }
}

