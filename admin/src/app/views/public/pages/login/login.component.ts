import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
declare let $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  destory$: Subject<boolean> = new Subject<boolean>();
  formControl: any = new FormControl();
  submitted: boolean = false;
  hidePassword: boolean = true;
  loginForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$'),
      ],
    ],
    password: ['', Validators.required],
  });

  get form() {
    return this.loginForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public router: Router
  ) {}

  ngOnInit(): void {
    //checking session
    // if (this.api.getSession()) this.router.navigate(['home']);
  }

  //on form submit
  onSubmit() {
    if (this.loginForm.valid) {
      this.api
        .POST('admin/login', this.loginForm.value)
        .pipe(takeUntil(this.destory$))
        .subscribe((response: any) => {
          if (response.error) {
            this.api.errorAlert(response.message);
          } else {
            this.api.setSession(response.data);
            this.api.successAlert(response.message);
            this.router.navigate(['overview']);
          }
        });
    }
  }

  togglePasswordType() {
    this.hidePassword = !this.hidePassword;
  }

  ngOnDestory() {
    this.destory$.next(true);
    this.destory$.unsubscribe();
  }
}
