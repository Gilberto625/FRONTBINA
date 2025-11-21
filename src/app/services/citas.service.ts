import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  getCitas(): Observable<any[]> {
    return of([]);
  }
}
