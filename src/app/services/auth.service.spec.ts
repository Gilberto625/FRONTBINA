import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, Usuario, RegisterData, LoginData } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/usuarios';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    // Limpiar localStorage
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store user data', (done) => {
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        usuario: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          rol: 'cliente'
        } as Usuario,
        csrf_token: 'mock-csrf-token'
      };

      service.login(loginData.email, loginData.password).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(localStorage.getItem('usuario')).toBeTruthy();
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/login/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });

    it('should handle login errors', (done) => {
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(loginData.email, loginData.password).subscribe({
        next: () => done.fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login/`);
      req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', (done) => {
      const registerData: RegisterData = {
        nombre: 'Test',
        apellidopaterno: 'User',
        apellidomaterno: 'Test',
        username: 'testuser',
        correo: 'test@example.com',
        contrasena: 'password123',
        telefono: '1234567890',
        preguntasecreta: 'What is your favorite color?',
        respuestasecreta: 'Blue'
      };

      const mockResponse = {
        message: 'Usuario registrado exitosamente',
        usuario_id: 1
      };

      service.register(registerData).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/registro/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear user data and call logout endpoint', (done) => {
      // Simular usuario logueado
      localStorage.setItem('usuario', JSON.stringify({ id: 1, email: 'test@example.com' }));

      service.logout().subscribe({
        next: () => {
          expect(localStorage.getItem('usuario')).toBeNull();
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/logout/`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from localStorage', () => {
      const mockUser: Usuario = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        rol: 'cliente'
      };
      localStorage.setItem('usuario', JSON.stringify(mockUser));

      const user = service.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
      localStorage.removeItem('usuario');
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user exists', () => {
      localStorage.setItem('usuario', JSON.stringify({ id: 1, email: 'test@example.com' }));
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if no user', () => {
      localStorage.removeItem('usuario');
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
