/**
 * Validadores de contraseñas para formularios Angular
 * Alineados con la política de seguridad del backend
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  /**
   * Validador de longitud mínima
   */
  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      return control.value.length >= min
        ? null
        : { minLength: { required: min, actual: control.value.length } };
    };
  }

  /**
   * Validador de complejidad de contraseña
   * Requiere: minúscula, mayúscula, número y carácter especial
   */
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value as string;
      const errors: ValidationErrors = {};

      // Verificar minúscula
      if (!/[a-z]/.test(password)) {
        errors['lowercase'] = true;
      }

      // Verificar mayúscula
      if (!/[A-Z]/.test(password)) {
        errors['uppercase'] = true;
      }

      // Verificar número
      if (!/[0-9]/.test(password)) {
        errors['number'] = true;
      }

      // Verificar carácter especial
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors['special'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validador de contraseñas comunes
   */
  static notCommon(): ValidatorFn {
    const commonPasswords = [
      'password', '12345678', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', '123123'
    ];

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value.toLowerCase();
      return commonPasswords.includes(password)
        ? { common: true }
        : null;
    };
  }

  /**
   * Validador de coincidencia de contraseñas
   * Usar en el campo de confirmación
   */
  static match(passwordFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent || !control.value) {
        return null;
      }

      const password = control.parent.get(passwordFieldName);
      if (!password) {
        return null;
      }

      return password.value === control.value
        ? null
        : { passwordMismatch: true };
    };
  }

  /**
   * Validador completo que combina todos los requisitos
   */
  static complete(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const errors: ValidationErrors = {};

      // Longitud mínima
      const minLengthResult = PasswordValidators.minLength(8)(control);
      if (minLengthResult) {
        Object.assign(errors, minLengthResult);
      }

      // Complejidad
      const strongResult = PasswordValidators.strong()(control);
      if (strongResult) {
        Object.assign(errors, strongResult);
      }

      // No común
      const notCommonResult = PasswordValidators.notCommon()(control);
      if (notCommonResult) {
        Object.assign(errors, notCommonResult);
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Obtener mensajes de error amigables
   */
  static getErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    const messages: string[] = [];

    if (errors['minLength']) {
      messages.push(`La contraseña debe tener al menos ${errors['minLength'].required} caracteres`);
    }

    if (errors['lowercase']) {
      messages.push('Debe contener al menos una letra minúscula');
    }

    if (errors['uppercase']) {
      messages.push('Debe contener al menos una letra mayúscula');
    }

    if (errors['number']) {
      messages.push('Debe contener al menos un número');
    }

    if (errors['special']) {
      messages.push('Debe contener al menos un carácter especial');
    }

    if (errors['common']) {
      messages.push('Esta contraseña es demasiado común');
    }

    if (errors['passwordMismatch']) {
      messages.push('Las contraseñas no coinciden');
    }

    return messages.join('. ');
  }
}
