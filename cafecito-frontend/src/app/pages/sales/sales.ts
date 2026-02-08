import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { ProductService } from '../../services/products/product.service';
import { CartService } from '../../services/cart/cart'; // <--- 1. Importar
import { Product } from '../../models/product.interface';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [Navbar, CurrencyPipe],
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class Sales implements OnInit {
  private productService = inject(ProductService);
  public cartService = inject(CartService); // <--- 2. Public para usarlo en HTML

  products: Product[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // 3. Método real
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}