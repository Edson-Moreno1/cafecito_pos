import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, SaleRequest, SaleResponse } from '../../models/sale.interface';
import { PaginatedResponse } from '../../models/paginatedResponse.interface';
@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private apiUrl = 'http://localhost:3000/api/sales';

  constructor(private http: HttpClient) {}

  getSales(page= 1, limit = 20, q= ''): Observable<PaginatedResponse<Sale>> {
    let params = new HttpParams()
      .set('page',page)
      .set('limit',limit);

      if(q.trim()) {
        params = params.set('q',q.trim());
      }
      return this.http.get<PaginatedResponse<Sale>>(this.apiUrl, { params });
  }

  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  createSale(saleData: SaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.apiUrl, saleData);
  }
}