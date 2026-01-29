import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { EmisorService, EmisorLite } from 'app/core/emisor/emisor.service';

import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NgClass,
        MatDividerModule,
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NgClass,
        MatDividerModule,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    emisores: EmisorLite[] = [];
    selectedEmisorId: string | null = null;
    loadingEmisores = false;
    user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _clientePerfil: Cliente_Perfil,
        private _emisorService: EmisorService
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.selectedEmisorId = this._emisorService.emisorId;

        this.loadingEmisores = true;
        this._clientePerfil.GetRazonesSociales().subscribe({
            next: (list: EmisorLite[]) => {
                this.emisores = (list || []).filter(x => x.activo !== false);

                // Si no hay emisor seleccionado aún, usa default o el primero
                if (!this.selectedEmisorId) {
                    const def = this.emisores.find(x => x.esDefault) || this.emisores[0];
                    if (def?.id) {
                        this.selectedEmisorId = def.id;
                        this._emisorService.setEmisorId(def.id);
                    }
                }

                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this._changeDetectorRef.markForCheck();
            },
            complete: () => {
                this.loadingEmisores = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    changeEmisor(id: string): void {
        this.selectedEmisorId = id;
        this._emisorService.setEmisorId(id);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void {
        // Return if user is not available
        if (!this.user) {
            return;
        }

        // Update the user
        this._userService
            .update({
                ...this.user,
                status,
            })
            .subscribe();
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._router.navigate(['/sign-out']);
    }
}
