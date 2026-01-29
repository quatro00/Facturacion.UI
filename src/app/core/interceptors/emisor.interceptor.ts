import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EmisorService } from 'app/core/emisor/emisor.service';

export const emisorInterceptor: HttpInterceptorFn = (req, next) => {
  // Si una request quiere ignorar el emisor (ej. CFDIs "Todos"), respétalo
  if (req.headers.has('X-Skip-Emisor')) {
    const cleaned = req.clone({
      headers: req.headers.delete('X-Skip-Emisor'),
    });
    return next(cleaned);
  }

  const emisorService = inject(EmisorService);
  const emisorId = emisorService.emisorId;

  if (!emisorId) return next(req);

  const cloned = req.clone({
    setHeaders: {
      'X-RazonSocial-Id': emisorId,
    },
  });

  return next(cloned);
};