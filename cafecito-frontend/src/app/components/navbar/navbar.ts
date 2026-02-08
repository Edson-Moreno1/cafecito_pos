import { Component,inject } from '@angular/core';
import{Router,RouterLink,RouterLinkActive} from '@angular/router';
import { AuthResponse } from '../../models/auth.interface';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router=inject(Router);

  logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}
