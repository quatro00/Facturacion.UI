import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({ providedIn: 'root' })
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  error(message: string, duration = 6000) {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  info(message: string, duration = 3000) {
    this.snackBar.open(message, undefined, {
      duration,
      panelClass: ['snackbar-info'],
    });
  }
}