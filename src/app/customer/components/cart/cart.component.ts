import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {

  cartItems: any[] = [];
  order: any;

  couponForm !: FormGroup;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ){}

  ngOnInit(): void{
    this.couponForm = this.fb.group({
      code: [null, [Validators.required]]
    });
    this.getCart();
  }

  // applyCoupon(){
  //   this.customerService.applyCoupon(this.couponForm.get(['code']))!.subscribe(
  //     (res) =>{
  //       this.snackBar.open('Coupon Applied Successfully', 'Close', {duration:5000});
  //       this.getCart();
  //     }, (error) =>{
  //       this.snackBar.open(error.error, 'Close', {duration:5000});
  //     }
  //   )
  // }

  applyCoupon() {
    if (this.couponForm.invalid) {
      this.snackBar.open('Please enter a valid coupon code', 'Close', { duration: 5000 });
      return;
    }

    const couponCode = this.couponForm.get('code')?.value;

    this.customerService.applyCoupon(couponCode).pipe(
      catchError((error) => {
        this.snackBar.open(error.error || 'An error occurred', 'Close', { duration: 5000 });
        return of(null); // Returns a safe observable to complete the subscription
      })
    ).subscribe((res) => {
      if (res) {
        this.snackBar.open('Coupon Applied Successfully', 'Close', { duration: 5000 });
        this.getCart();
      }
    });
  }

  getCart(){
    this.cartItems = [];
    this.customerService.getCartByUserId().subscribe(res =>{
      this.order = res;
      res.cartItems.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
        this.cartItems.push(element);
      });
    })
  }

  increaseQuantity(productId: any){
    this.customerService.increaseProductQuantity(productId).subscribe(
      res =>{
        this.snackBar.open('Product quantity increased', 'Close', {duration: 5000});
        this.getCart();
      }
    )
  }

  decreaseQuantity(productId: any){
    this.customerService.decreaseProductQuantity(productId).subscribe(
      res =>{
        this.snackBar.open('Product quantity decreased', 'Close', {duration: 5000});
        this.getCart();
      }
    )
  }
}
