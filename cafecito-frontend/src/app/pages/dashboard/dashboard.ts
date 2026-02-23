import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { ProductService } from '../../services/products/product.service';
import { CustomerService } from '../../services/customers/customer.service';
import { SaleService } from '../../services/sales/sale.service';
import { Product } from '../../models/product.interface';
import { Customer } from '../../models/customer.interface';
import { Sale } from '../../models/sale.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private saleService = inject(SaleService);

  // ========== Tab Control ==========
  activeTab: 'inventory' | 'customers' | 'sales' = 'inventory';

  // ========== INVENTARIO ==========
  products: Product[] = [];
  loadingProducts = true;
  showProductModal = false;
  editingProductId: string | null = null;
  productForm = {
    name: '',
    price: 0,
    stock: 0,
    description: ''
  };

  // ========== CLIENTES ==========
  customers: Customer[] = [];
  loadingCustomers = true;
  showCustomerModal = false;
  editingCustomerId: string | null = null;
  customerForm = { name: '', email: '', phone: '' };

  // ========== VENTAS ==========
  sales: Sale[] = [];
  loadingSales = true;
  selectedSale: Sale | null = null;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
    this.loadSales();
  }

  // =============================================
  //  INVENTARIO (Productos)
  // =============================================

  loadProducts() {
    this.loadingProducts = true;
    this.productService.getProducts(1, 100).subscribe({
      next: (response) => {
        this.products = response.data;
        this.loadingProducts = false;
      },
      error: () => { this.loadingProducts = false; }
    });
  }

  getStockClass(stock: number): string {
    if (stock <= 0) return 'text-white bg-danger';
    if (stock <= 10) return 'text-dark bg-warning';
    return 'text-white bg-success';
  }

  getStockLabel(stock: number): string {
    if (stock <= 0) return 'Agotado';
    if (stock <= 10) return 'Stock bajo';
    return 'OK';
  }

  openProductModal(product?: Product) {
    if (product) {
      this.editingProductId = product._id!;
      this.productForm = {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || ''
      };
    } else {
      this.editingProductId = null;
      this.productForm = { name: '', price: 0, stock: 0, description: '' };
    }
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.editingProductId = null;
  }

  saveProduct() {
    const payload = {
      name: this.productForm.name,
      price: this.productForm.price,
      stock: this.productForm.stock,
      description: this.productForm.description
    };

    if (this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, payload).subscribe({
        next: () => { this.loadProducts(); this.closeProductModal(); },
        error: (err: any) => alert('Error al actualizar: ' + (err.error?.message || err.message))
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => { this.loadProducts(); this.closeProductModal(); },
        error: (err: any) => alert('Error al crear: ' + (err.error?.message || err.message))
      });
    }
  }

  toggleProductActive(product: Product) {
    const newStatus = !product.isActive;
    this.productService.updateProduct(product._id!, { isActive: newStatus }).subscribe({
      next: () => this.loadProducts(),
      error: (err: any) => alert('Error: ' + (err.error?.message || err.message))
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    this.productService.deleteProduct(product._id!).subscribe({
      next: () => this.loadProducts(),
      error: (err: any) => alert('Error: ' + (err.error?.message || err.message))
    });
  }

  // =============================================
  //  CLIENTES (Fidelización)
  // =============================================

  loadCustomers() {
    this.loadingCustomers = true;
    this.customerService.getCustomers(1, 100).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.loadingCustomers = false;
      },
      error: () => { this.loadingCustomers = false; }
    });
  }

  getCustomerTier(count: number): { label: string; badge: string } {
    if (count >= 8) return { label: '🥇 Gold', badge: 'bg-warning text-dark' };
    if (count >= 4) return { label: '🥈 Silver', badge: 'bg-secondary' };
    if (count >= 1) return { label: '🥉 Basic', badge: 'bg-info' };
    return { label: 'Nuevo', badge: 'bg-light text-dark' };
  }

  getDiscountForCount(count: number): number {
    if (count >= 8) return 15;
    if (count >= 4) return 10;
    if (count >= 1) return 5;
    return 0;
  }

  openCustomerModal(customer?: Customer) {
    if (customer) {
      this.editingCustomerId = customer._id!;
      this.customerForm = {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || ''
      };
    } else {
      this.editingCustomerId = null;
      this.customerForm = { name: '', email: '', phone: '' };
    }
    this.showCustomerModal = true;
  }

  closeCustomerModal() {
    this.showCustomerModal = false;
    this.editingCustomerId = null;
  }

  saveCustomer() {
    // Construir payload solo con campos no vacíos
    const payload: Record<string, string> = { name: this.customerForm.name };
    if (this.customerForm.email.trim()) payload['email'] = this.customerForm.email.trim();
    if (this.customerForm.phone.trim()) payload['phone'] = this.customerForm.phone.trim();

    if (this.editingCustomerId) {
      this.customerService.updateCustomer(this.editingCustomerId, payload).subscribe({
        next: () => { this.loadCustomers(); this.closeCustomerModal(); },
        error: (err: any) => alert('Error: ' + (err.error?.message || err.error?.details?.[0]?.message || err.message))
      });
    } else {
      this.customerService.createCustomer(payload).subscribe({
        next: () => { this.loadCustomers(); this.closeCustomerModal(); },
        error: () =>{this.customers = []; this.loadingCustomers = false; }
    }
  }

  deleteCustomer(customer: Customer) {
    if (!confirm(`¿Eliminar a ${customer.name}?`)) return;
    this.customerService.deleteCustomer(customer._id!).subscribe({
      next: () => this.loadCustomers(),
      error: (err: any) => { this.customers = []; this.loadingCustomers = false; }
    });
  }

  // =============================================
  //  VENTAS (Monitor)
  // =============================================

  loadSales() {
    this.loadingSales = true;
    this.saleService.getSales(1, 100).subscribe({
      next: (response) => {
        this.sales = response.data;
        this.loadingSales = false;
      },
      error: () => { this.sales = []; this.loadingSales = false; }
    });
  }

  toggleSaleDetail(sale: Sale) {
    this.selectedSale = this.selectedSale?._id === sale._id ? null : sale;
  }

  getPaymentIcon(method: string): string {
    switch (method) {
      case 'cash': return 'bi-cash';
      case 'card': return 'bi-credit-card';
      case 'transfer': return 'bi-bank';
      default: return 'bi-question-circle';
    }
  }

  getPaymentLabel(method: string): string {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  }

  // ========== Stats rápidas ==========
  get totalRevenue(): number {
    return (this.sales || []).reduce((sum, s)=> sum + s.total,0);
  }

  get lowStockCount(): number {
    return (this.products || []).filter(p => p.stock <= 10 && p.isActive !== false).length;
  }

  get topCustomer(): Customer | null {
    return this.customers?.length > 0 ? this.customers[0] : null;
  }
}