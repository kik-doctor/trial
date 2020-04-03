import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';

import {AuthService} from '../../services/auth.service';
import {HttpRequestService} from '../../services/http-request.service';

interface Role {
    value: number;
    viewValue: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    displayedColumns: string[] = ['first_name', 'last_name', 'email', 'role', 'timestamp'];
    dataSource: any = new MatTableDataSource<any>();
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    currentUser: any;
    role = ['Doctor', 'Nurse', 'Admin'];

    constructor(
        private authService: AuthService,
        private router: Router,
        private httpRequestService: HttpRequestService,
        private dialog: MatDialog
    ) {
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    ngOnInit() {
        this.currentUser = this.authService.currentUserValue;
        this.httpRequestService.getUsers().subscribe(result => {
            this.dataSource = result;
        });
    }

    openCreateUserDialog(): void {
        const dialogRef = this.dialog.open(CreateUserDialog, {
            width: '50%'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            this.httpRequestService.getUsers().subscribe(result => {
                this.dataSource = result;
            })
        });
    }
}

@Component({
    selector: 'create-user-dialog',
    template: `<h2 mat-dialog-title>Create User </h2>
    <form [formGroup]="registerForm" (ngSubmit)="createUser()">
        <div mat-dialog-content>
            <div class="form-group">
                <mat-form-field class="full-width">
                    <input type="text" matInput placeholder="Enter your firstname" formControlName="firstName"
                           autofocus required>
                    <mat-error *ngIf="submitted && f.firstName.hasError('required')">FirstName is required
                    </mat-error>
                </mat-form-field>
            </div>
            <div class="form-group">
                <mat-form-field class="full-width">
                    <input type="text" matInput placeholder="Enter your lastname" formControlName="lastName"
                           required>
                    <mat-error *ngIf="submitted && f.lastName.hasError('required')">LastName is required</mat-error>
                </mat-form-field>
            </div>
            <div class="form-group">
                <mat-form-field class="full-width">
                    <input type="email" matInput placeholder="Enter your email" formControlName="email" required>
                    <mat-error *ngIf="submitted && f.email.hasError('required')">Email is required</mat-error>
                </mat-form-field>
            </div>
            <div class="form-group">
                <mat-form-field class="full-width">
                    <input type="password" matInput placeholder="Enter your password" formControlName="password"
                           required>
                    <mat-error *ngIf="submitted && f.password.hasError('required')">Password is required</mat-error>
                </mat-form-field>
            </div>
            <div class="form-group">
                <mat-form-field>
                    <mat-label>Select Role...</mat-label>
                    <mat-select [(value)]="selected">
                        <mat-option *ngFor="let role of roles" [value]="role.value">
                            {{role.viewValue}}
                        </mat-option>
                    </mat-select>
                </mat-form-field>
            </div>
            <div class="form-group">
                <button type="submit" mat-button  class="full-width btn-success">Register</button>
            </div>
            <div *ngIf="error" class="alert alert-danger">{{error}}</div>

        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()" class="full-width">Cancel</button>
        </div>
    </form>`
})

export class CreateUserDialog {

    submitted = false;
    registerForm: FormGroup;
    error = '';
    roles: Role[] = [
        {value: 0, viewValue: 'Doctor'},
        {value: 1, viewValue: 'Nurse'},
        {value: 2, viewValue: 'Admin'}
    ];
    selected = 0;

    constructor(
        public dialogRef: MatDialogRef<CreateUserDialog>,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    get f() {
        return this.registerForm.controls;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    createUser() {
        this.submitted = true;
        if (this.registerForm.invalid) {
            return;
        }
        this.authService.register(this.f.firstName.value, this.f.lastName.value, this.f.email.value, this.f.password.value, this.selected)
            .pipe(first())
            .subscribe(
                data => {
                    this.dialogRef.close(data);
                },
                error => {
                    this.error = error.error.message;
                });
    }


}
