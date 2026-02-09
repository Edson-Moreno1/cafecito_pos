import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { ProductService } from '../../services/products/product.service';
import { CustomerService } from '../../services/customers/customer.service';
import { SaleService } from '../../services/sales/sale.service';
import { UserService } from '../../services/user/user'
import { Product } from '../../models/product.interface';
import { Customer } from '../../models/customer.interface';
import { Sale } from '../../models/sale.interface';
import { User } from '../../models/user.interface';
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
  private userService = inject(UserService);

  // ========== Tab Control ==========
  activeTab: 'inventory' | 'customers' | 'users' | 'sales' = 'inventory';

  // ========== INVENTARIO ==========
  products: Product[] = [];
  loadingProducts = true;
  showProductModal = false;
  editingProductId: string | null = null;
  productForm = {
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: 'Bebidas calientes',
    images: ''
  };
  categories: string[] = [
    'Bebidas calientes', 'Frappucino', 'Bebidas frias',
    'Bebidas Base Té', 'Cold Brew', 'Alimentos', 'Cafe en grano'
  ];

  // ========== CLIENTES ==========
  customers: Customer[] = [];
  loadingCustomers = true;
  showCustomerModal = false;
  editingCustomerId: string | null = null;
  customerForm = { name: '', email: '', phone: '' };

  // ========== USUARIOS ==========
  users: User[] = [];
  loadingUsers = true;
  showUserModal = false;
  editingUserId: string | null = null;
  userForm = { name: '', email: '', password: '', role: 'cajero' as string };

  // ========== VENTAS ==========
  sales: Sale[] = [];
  loadingSales = true;
  selectedSale: Sale | null = null;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
    this.loadUsers();
    this.loadSales();
  }

  // =============================================
  //  INVENTARIO (Productos)
  // =============================================

  loadProducts() {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (data) => { this.products = data; this.loadingProducts = false; },
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
        description: product.description || '',
        category: product.category || 'Bebidas calientes',
        images: product.images?.join(', ') || ''
      };
    } else {
      this.editingProductId = null;
      this.productForm = { name: '', price: 0, stock: 0, description: '', category: 'Bebidas calientes', images: '' };
    }
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.editingProductId = null;
  }

  saveProduct() {
    const payload: any = {
      name: this.productForm.name,
      price: this.productForm.price,
      stock: this.productForm.stock,
      description: this.productForm.description,
      category: this.productForm.category,
      images: this.productForm.images.split(',').map(s => s.trim()).filter(s => s)
    };

    if (this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, payload).subscribe({
        next: () => { this.loadProducts(); this.closeProductModal(); },
        error: (err) => alert('Error al actualizar: ' + (err.error?.message || err.message))
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => { this.loadProducts(); this.closeProductModal(); },
        error: (err) => alert('Error al crear: ' + (err.error?.message || err.message))
      });
    }
  }

  toggleProductActive(product: Product) {
    const newStatus = !product.isActive;
    this.productService.updateProduct(product._id!, { isActive: newStatus } as any).subscribe({
      next: () => this.loadProducts(),
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }

  // =============================================
  //  CLIENTES (Fidelización)
  // =============================================

  loadCustomers() {
    this.loadingCustomers = true;
    this.customerService.getAllCustomers().subscribe({
      next: (data) => { this.customers = data; this.loadingCustomers = false; },
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
        email: customer.email,
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
    if (this.editingCustomerId) {
      this.customerService.updateCustomer(this.editingCustomerId, this.customerForm as any).subscribe({
        next: () => { this.loadCustomers(); this.closeCustomerModal(); },
        error: (err) => alert('Error: ' + (err.error?.message || err.message))
      });
    } else {
      this.customerService.createCustomer(this.customerForm as any).subscribe({
        next: () => { this.loadCustomers(); this.closeCustomerModal(); },
        error: (err) => alert('Error: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteCustomer(customer: Customer) {
    if (!confirm(`¿Eliminar a ${customer.name}?`)) return;
    this.customerService.deleteCustomer(customer._id!).subscribe({
      next: () => this.loadCustomers(),
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }

  // =============================================
  //  USUARIOS (Personal)
  // =============================================

  loadUsers() {
    this.loadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => { this.users = data; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; }
    });
  }

  openUserModal(user?: User) {
    if (user) {
      this.editingUserId = user._id!;
      this.userForm = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      };
    } else {
      this.editingUserId = null;
      this.userForm = { name: '', email: '', password: '', role: 'cajero' };
    }
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.editingUserId = null;
  }

  saveUser() {
    if (this.editingUserId) {
      const payload: any = {
        name: this.userForm.name,
        email: this.userForm.email,
        role: this.userForm.role
      };
      // Solo enviar password si se escribió uno nuevo
      if (this.userForm.password.trim() !== '') {
        payload.password = this.userForm.password;
      }
      this.userService.updateUser(this.editingUserId, payload).subscribe({
        next: () => { this.loadUsers(); this.closeUserModal(); },
        error: (err) => alert('Error: ' + (err.error?.message || err.message))
      });
    } else {
      if (!this.userForm.password || this.userForm.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      this.userService.createUser(this.userForm).subscribe({
        next: () => { this.loadUsers(); this.closeUserModal(); },
        error: (err) => alert('Error: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteUser(user: User) {
    if (!confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    this.userService.deleteUser(user._id!).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }

  // =============================================
  //  VENTAS (Monitor)
  // =============================================

  loadSales() {
    this.loadingSales = true;
    this.saleService.getSales().subscribe({
      next: (data) => { this.sales = data; this.loadingSales = false; },
      error: () => { this.loadingSales = false; }
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
    return this.sales.reduce((sum, s) => sum + s.total, 0);
  }

  get lowStockCount(): number {
    return this.products.filter(p => p.stock <= 10 && p.isActive !== false).length;
  }

  get topCustomer(): Customer | null {
    return this.customers.length > 0 ? this.customers[0] : null;
  }
}