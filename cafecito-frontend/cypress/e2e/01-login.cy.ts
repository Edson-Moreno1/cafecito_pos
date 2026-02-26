describe('Login y Autenticación', () => {

  beforeEach(() => {
    cy.logout();
  });

  it('debe redirigir a /login si no hay sesión', () => {
    cy.visit('/sales');
    cy.url().should('include', '/login');
  });

  it('debe redirigir a /login desde rutas protegidas de admin', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('debe mostrar error con credenciales incorrectas', () => {
    cy.loginUI('fake@email.com', 'wrongpassword');
    cy.url().should('include', '/login');
    cy.get('.alert, .text-danger, .toast').should('be.visible');
  });

  it('debe iniciar sesión como admin y redirigir a /sales', () => {
    cy.loginUI(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
    cy.url({ timeout: 15000 }).should('include', '/sales');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null;
      const user = JSON.parse(win.localStorage.getItem('user')!);
      expect(user.role).to.eq('admin');
    });
  });

  it('debe iniciar sesión como vendedor y redirigir a /sales', () => {
    cy.loginUI(Cypress.env('vendedorEmail'), Cypress.env('vendedorPassword'));
    cy.url({ timeout: 15000 }).should('include', '/sales');
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user')!);
      expect(user.role).to.eq('vendedor');
    });
  });

  it('admin debe ver link a Dashboard en navbar', () => {
    cy.loginAs('admin');
    cy.visit('/sales');
    cy.contains('Dashboard').should('be.visible');
  });

  it('vendedor NO debe ver link a Dashboard en navbar', () => {
    cy.loginAs('vendedor');
    cy.visit('/sales');
    cy.contains('Dashboard').should('not.exist');
  });

  it('vendedor NO debe poder acceder a /dashboard', () => {
    cy.loginAs('vendedor');
    cy.visit('/dashboard');
    cy.url().should('include', '/sales');
  });

  it('debe cerrar sesión correctamente', () => {
    cy.loginAs('admin');
    cy.visit('/sales');
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});