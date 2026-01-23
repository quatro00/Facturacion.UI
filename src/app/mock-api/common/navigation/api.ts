import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { AuthService } from 'app/core/auth/auth.service';
import { items } from 'app/mock-api/apps/file-manager/data';
import {
    compactNavigation_admin,
    defaultNavigation_admin,
    futuristicNavigation_admin,
    horizontalNavigation_admin,

    compactNavigation_responsable,
    defaultNavigation_responsable,
    futuristicNavigation_responsable,
    horizontalNavigation_responsable,

   

    compactNavigation,
    defaultNavigation,
    futuristicNavigation,
    horizontalNavigation,
    compactNavigation_supervisor,
    defaultNavigation_supervisor,
    futuristicNavigation_supervisor,
    horizontalNavigation_supervisor,
} from 'app/mock-api/common/navigation/data';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {

    private _compactNavigation: FuseNavigationItem[];

    private _defaultNavigation: FuseNavigationItem[];

    private _futuristicNavigation: FuseNavigationItem[];

    private _horizontalNavigation: FuseNavigationItem[];

    /*
    private readonly _compactNavigation: FuseNavigationItem[] =
        compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] =
        defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] =
        futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] =
        horizontalNavigation;
        */

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService,
        private _authService: AuthService
    ) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        //buscamos el rol

        const userData = localStorage.getItem('user');
        var roles: any[];
        var rol = '';
        if (userData) {
            roles = JSON.parse(userData).roles;
        }
        console.log(roles);
        if (roles != null) {
            if (roles.indexOf('Administrador') != -1 && rol == '') { rol = 'Administrador' }
            if (roles.indexOf('Supervisor') != -1 && rol == '') { rol = 'Supervisor' }
            if (roles.indexOf('Responsable de area') != -1 && rol == '') { rol = 'Responsable de area' }
        }

        if (rol == 'Administrador') {
            this._compactNavigation = compactNavigation_admin;
            this._defaultNavigation = defaultNavigation_admin;
            this._futuristicNavigation = futuristicNavigation_admin;
            this._horizontalNavigation = horizontalNavigation_admin;
        }

        if (rol == 'Responsable de area') {
            this._compactNavigation = compactNavigation_responsable;
            this._defaultNavigation = defaultNavigation_responsable;
            this._futuristicNavigation = futuristicNavigation_responsable;
            this._horizontalNavigation = horizontalNavigation_responsable;
        }

        if (rol == 'Supervisor') {
            this._compactNavigation = compactNavigation_supervisor;
            this._defaultNavigation = defaultNavigation_supervisor;
            this._futuristicNavigation = futuristicNavigation_supervisor;
            this._horizontalNavigation = horizontalNavigation_supervisor;
        }
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            // Fill compact navigation children using the default navigation
            this._compactNavigation.forEach((compactNavItem) => {
                this._defaultNavigation.forEach((defaultNavItem) => {
                    if (defaultNavItem.id === compactNavItem.id) {
                        compactNavItem.children = cloneDeep(
                            defaultNavItem.children
                        );
                    }
                });
            });

            // Fill futuristic navigation children using the default navigation
            this._futuristicNavigation.forEach((futuristicNavItem) => {
                this._defaultNavigation.forEach((defaultNavItem) => {
                    if (defaultNavItem.id === futuristicNavItem.id) {
                        futuristicNavItem.children = cloneDeep(
                            defaultNavItem.children
                        );
                    }
                });
            });

            // Fill horizontal navigation children using the default navigation
            this._horizontalNavigation.forEach((horizontalNavItem) => {
                this._defaultNavigation.forEach((defaultNavItem) => {
                    if (defaultNavItem.id === horizontalNavItem.id) {
                        horizontalNavItem.children = cloneDeep(
                            defaultNavItem.children
                        );
                    }
                });
            });

            // Return the response
            return [
                200,
                {
                    compact: cloneDeep(this._compactNavigation),
                    default: cloneDeep(this._defaultNavigation),
                    futuristic: cloneDeep(this._futuristicNavigation),
                    horizontal: cloneDeep(this._horizontalNavigation),
                },
            ];
        });
    }
}
