// ***********************************************
// Comandos personalizados para Cafecito POS
// ***********************************************

// Comando: login programático (sin UI)
Cypress.Commands.add('loginAs', (role: 'admin' | 'vendedor') => {
  const email = role === 'admin'
    ? Cypress.env('adminEmail')
    : Cypress.env('vendedorEmail');
  const password = role === 'admin'
    ? Cypress.env('adminPassword')
    : Cypress.env('vendedorPassword');

  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
    email,
    password
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Comando: login via UI
Cypress.Commands.add('loginUI', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').contains('Ingresar').click();
});

// Comando: limpiar sesión
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
});

// Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'admin' | 'vendedor'): Chainable<void>;
      loginUI(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

export {};