import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../models/product.interface';
import { CartItem } from '../../models/sale.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  // Estado reactivo con signals
  cartItems = signal<CartItem[]>([]);

  // Computados: se recalculan cuando cartItems cambia
  subtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  total = computed(() => this.subtotal());

  itemCount = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  addToCart(product: Product) {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product._id === product._id);

    if (existingItem) {
      this.updateQuantity(existingItem.product._id!, existingItem.quantity + 1);
    } else {
      this.cartItems.update(items => [
        ...items,
        { product, quantity: 1 }
      ]);
    }
  }

  removeFromCart(productId: string) {
    this.cartItems.update(items => items.filter(item => item.product._id !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item => {
        if (item.product._id === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}