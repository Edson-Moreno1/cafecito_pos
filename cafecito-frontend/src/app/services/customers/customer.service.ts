import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Customer} from '../../models/customer.interface'
import { PaginatedResponse } from '../../models/paginatedResponse.interface';
@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'http://localhost:3000/api/customers';

  constructor(private http: HttpClient) {}

  getCustomers(page= 1, limit = 20, q= ''): Observable<PaginatedResponse<Customer>> {
    let params = new HttpParams()
      .set('page',page)
      .set('limit',limit);

      if(q.trim()) {
        params = params.set('q',q.trim());
      }
      return this.http.get<PaginatedResponse<Customer>>(this.apiUrl, { params });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customerData: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customerData);
  }

  updateCustomer(id: string, customerData: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customerData);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}