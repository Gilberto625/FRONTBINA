import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CitaService, Cita, Servicio, Barbero, Disponibilidad } from './cita.service';
import { environment } from '../../environments/environment';

describe('CitaService', () => {
  let service: CitaService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/citas';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CitaService]
    });
    service = TestBed.inject(CitaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarServicios', () => {
    it('should fetch services list', (done) => {
      const mockServices: Servicio[] = [
        {
          id: 1,
          nombre: 'Corte de cabello',
          descripcion: 'Corte básico',
          precio_base: 100,
          duracion_minutos: 30,
          categoria: 'corte',
          categoria_display: 'Corte'
        }
      ];

      service.listarServicios().subscribe({
        next: (services) => {
          expect(services).toEqual(mockServices);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/servicios/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockServices);
    });
  });

  describe('listarBarberos', () => {
    it('should fetch barbers list', (done) => {
      const mockBarbers: Barbero[] = [
        {
          id: 1,
          usuario_id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          especialidades: 'Cortes modernos'
        }
      ];

      service.listarBarberos().subscribe({
        next: (barbers) => {
          expect(barbers).toEqual(mockBarbers);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/barberos/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBarbers);
    });
  });

  describe('consultarDisponibilidad', () => {
    it('should fetch availability for a date', (done) => {
      const fecha = '2026-01-30';
      const barberoId = 1;
      const mockDisponibilidad: Disponibilidad = {
        fecha: fecha,
        horarios: ['09:00', '10:00', '11:00'],
        total: 3
      };

      service.consultarDisponibilidad(fecha, barberoId).subscribe({
        next: (disponibilidad) => {
          expect(disponibilidad).toEqual(mockDisponibilidad);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(
        `${apiUrl}/disponibilidad/?fecha=${fecha}&barbero_id=${barberoId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDisponibilidad);
    });
  });

  describe('crearCita', () => {
    it('should create a new appointment', (done) => {
      const citaData = {
        fecha_hora: '2026-01-30T10:00:00',
        servicio_id: 1,
        barbero_id: 1,
        silla_id: 1,
        notas: 'Test appointment'
      };

      const mockCita: Cita = {
        id: 1,
        fecha_hora: citaData.fecha_hora,
        servicio: 1,
        barbero: 1,
        silla: 1,
        estado: 'pendiente',
        precio_total: 100,
        anticipo_pagado: 0,
        anticipo_requerido: 50,
        duracion_minutos: 30
      };

      service.crearCita(citaData).subscribe({
        next: (cita) => {
          expect(cita).toEqual(mockCita);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/crear/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(citaData);
      req.flush(mockCita);
    });
  });

  describe('misCitas', () => {
    it('should fetch user appointments', (done) => {
      const mockCitas: Cita[] = [
        {
          id: 1,
          fecha_hora: '2026-01-30T10:00:00',
          servicio: 1,
          barbero: 1,
          silla: 1,
          estado: 'pendiente',
          precio_total: 100,
          anticipo_pagado: 0,
          anticipo_requerido: 50,
          duracion_minutos: 30
        }
      ];

      service.misCitas().subscribe({
        next: (citas) => {
          expect(citas).toEqual(mockCitas);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/mis-citas/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCitas);
    });
  });

  describe('cancelarCita', () => {
    it('should cancel an appointment', (done) => {
      const citaId = 1;
      const mockResponse = { message: 'Cita cancelada exitosamente' };

      service.cancelarCita(citaId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/${citaId}/cancelar/`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });
});
