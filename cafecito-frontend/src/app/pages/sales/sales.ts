import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { ProductService } from '../../services/products/product.service';
import { CartService } from '../../services/cart/cart';
import { SaleService } from '../../services/sales/sale.service';
import { CustomerService } from '../../services/customers/customer.service';
import { Product } from '../../models/product.interface';
import { Customer } from '../../models/customer.interface';
import { SaleRequest, SaleItemRequest, PaymentMethod, Ticket } from '../../models/sale.interface';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [Navbar, CurrencyPipe, FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class Sales implements OnInit {
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private saleService = inject(SaleService);
  private customerService = inject(CustomerService);

  // --- Productos + Paginación (COMMIT 1) ---
  products: Product[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  currentPage = 1;
  totalProducts = 0;
  limit = 20;
  private searchTimeout: any = null;
  private customerSearchTimeout: any = null;

  processing: boolean = false;

  // --- Checkout ---
  showCheckout: boolean = false;
  customerSearch: string = '';
  filteredCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  showCustomerResults: boolean = false;
  discountPercent: number = 0;
  selectedPaymentMethod: PaymentMethod = 'cash';

  // --- COMMIT 3: Ticket post-venta ---
  showTicket: boolean = false;
  currentTicket: Ticket | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  // ==========================================
  // COMMIT 1: Carga de productos con paginación
  // ==========================================

  loadProducts() {
    this.loading = true;
    this.productService.getProducts(this.currentPage, this.limit, this.searchTerm).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalProducts = response.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    // Debounce: espera 300ms después de que el usuario deja de teclear
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 300);
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.limit);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  // =====================
  // CHECKOUT FLOW
  // (se corregirá en commits 2-4)
  // =====================

  openCheckout() {
    if (this.cartService.cartItems().length === 0) return;
    this.showCheckout = true;
  }

  closeCheckout() {
    this.showCheckout = false;
    this.resetCheckout();
  }

  private resetCheckout() {
    this.customerSearch = '';
    this.filteredCustomers = [];
    this.selectedCustomer = null;
    this.showCustomerResults = false;
    this.discountPercent = 0;
    this.selectedPaymentMethod = 'cash';
  }

  // --- COMMIT 2: Búsqueda de clientes con debounce en backend ---
  onCustomerSearchChange() {
    const term = this.customerSearch.trim();

    if (term.length < 2) {
      this.filteredCustomers = [];
      this.showCustomerResults = false;
      return;
    }

    // Debounce: espera 300ms después de que el usuario deja de teclear
    clearTimeout(this.customerSearchTimeout);
    this.customerSearchTimeout = setTimeout(() => {
      this.customerService.getCustomers(1, 10, term).subscribe({
        next: (response) => {
          this.filteredCustomers = response.data;
          this.showCustomerResults = this.filteredCustomers.length > 0 || term.length >= 2;
        },
        error: (err) => {
          console.error('Error al buscar clientes:', err);
          this.filteredCustomers = [];
          this.showCustomerResults = false;
        }
      });
    }, 300);
  }

  closeCustomerDropdown() {
    // Pequeño delay para permitir que el click en un resultado se registre
    setTimeout(() => {
      this.showCustomerResults = false;
    }, 200);
  }

  selectCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    this.customerSearch = '';
    this.showCustomerResults = false;
    this.discountPercent = this.calculateDiscount(customer.purchasesCount);
  }

  removeCustomer() {
    this.selectedCustomer = null;
    this.discountPercent = 0;
  }

  // --- Discount (mirrors backend discountService.js) ---
  calculateDiscount(purchasesCount: number): number {
    if (purchasesCount >= 8) return 15;
    if (purchasesCount >= 4) return 10;
    if (purchasesCount >= 1) return 5;
    return 0;
  }

  getDiscountLabel(): string {
    if (this.discountPercent >= 15) return '🥇 Gold';
    if (this.discountPercent >= 10) return '🥈 Silver';
    if (this.discountPercent >= 5) return '🥉 Basic';
    return '';
  }

  get discountAmount(): number {
    return (this.cartService.subtotal() * this.discountPercent) / 100;
  }

  get finalTotal(): number {
    return this.cartService.subtotal() - this.discountAmount;
  }

  // --- COMMIT 3: Confirmar venta y mostrar ticket ---
  confirmSale() {
    if (this.cartService.cartItems().length === 0) return;

    this.processing = true;

    const saleItems: SaleItemRequest[] = this.cartService.cartItems().map(item => ({
      product: item.product._id!,
      quantity: item.quantity
    }));

    const saleData: SaleRequest = {
      customerId: this.selectedCustomer?._id,
      items: saleItems,
      paymentMethod: this.selectedPaymentMethod
    };

    this.saleService.createSale(saleData).subscribe({
      next: (response) => {
        // Guardar ticket y mostrar vista
        this.currentTicket = response.ticket;
        this.cartService.clearCart();
        this.showCheckout = false;
        this.showTicket = true;
        this.resetCheckout();
        this.processing = false;
      },
      error: (err) => {
        console.error('Error al procesar venta:', err);
        const message = err.error?.message || 'Error al procesar la venta. Inténtalo de nuevo.';
        alert(message);
        this.processing = false;
      }
    });
  }

  closeTicket() {
    this.showTicket = false;
    this.currentTicket = null;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia'
    };
    return labels[method] || method;
  }
}