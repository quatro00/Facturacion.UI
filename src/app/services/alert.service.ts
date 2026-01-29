import { Injectable } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private _fuseConfirmationService: FuseConfirmationService) {}

  showSuccess(title: string, message: string, autoCloseMs = 3000): void {
  const ref = this._fuseConfirmationService.open({
    title,
    message,
    icon: {
      show: true,
      name: 'heroicons_outline:check-circle',
      color: 'success',
    },
    actions: { confirm: { show: false }, cancel: { show: false } },
    dismissible: true,
  });

  setTimeout(() => ref.close(), autoCloseMs);
}

  showError(title: string, message: string): void {
   const ref = this._fuseConfirmationService.open({
    title,
    message,
    icon: {
      show: true,
      name: 'heroicons_outline:exclamation-circle',
        color: 'warn',
    },
    actions: { confirm: { show: false }, cancel: { show: false } },
    dismissible: true,
  });
  }

  showInfo(title: string, message: string): void {
    this._fuseConfirmationService.open({
      title: title,
      message: message,
      icon: {
        show: true,
        name: 'heroicons_outline:information-circle',
        color: 'info',
      },
      actions: {
        confirm: { show: false },
        cancel: { show: false },
      },
      dismissible: true,
    });
  }
}
