describe('Dashboard — Clientes', () => {

  beforeEach(() => {
    cy.loginAs('admin');
    cy.visit('/dashboard');
    // CRITICAL: usar selector específico del tab, no la stat card
    cy.get('.nav-tabs').contains('Clientes').click();
    // Esperar que la tabla de clientes cargue
    cy.contains('Clientes Frecuentes').should('be.visible');
  });

  // ==========================================
  // CARGA INICIAL
  // ==========================================

  it('debe cargar clientes en la tabla', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('debe mostrar columnas correctas', () => {
    cy.get('table thead th').should('contain', '#');
    cy.get('table thead th').should('contain', 'Contacto');
    cy.get('table thead th').should('contain', 'Compras');
    cy.get('table thead th').should('contain', 'Nivel');
    cy.get('table thead th').should('contain', 'Descuento');
  });

  it('debe mostrar stat de clientes', () => {
    cy.get('.card').contains('Clientes').should('be.visible');
  });

  // ==========================================
  // NIVELES DE FIDELIZACIÓN
  // ==========================================

  it('debe mostrar niveles correctos según compras', () => {
    cy.get('table tbody').then(($tbody) => {
      const text = $tbody.text();
      const hasLevels = text.includes('Gold') || text.includes('Silver') ||
                        text.includes('Basic') || text.includes('Nuevo');
      expect(hasLevels).to.be.true;
    });
  });

  it('debe mostrar porcentajes de descuento', () => {
    // La columna de descuento tiene el texto X%
    cy.get('table tbody tr').first().should('contain', '%');
  });

  // ==========================================
  // CREAR CLIENTE
  // ==========================================

  it('debe crear cliente con email y teléfono', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal').should('be.visible');
    cy.get('.modal-title').should('contain', 'Nuevo Cliente');

    cy.get('.modal input[placeholder*="Nombre"]').type('Cliente Cypress Test');
    cy.get('.modal input[type="email"]').type('cypress@test.com');
    cy.get('.modal input[placeholder*="449"]').type('4491234567');

    cy.get('.modal button').contains('Crear Cliente').click();
    cy.get('.modal').should('not.exist');
    cy.contains('Cliente Cypress Test').should('be.visible');
  });

  it('debe crear cliente solo con teléfono', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal input[placeholder*="Nombre"]').type('Cliente Solo Phone');
    cy.get('.modal input[placeholder*="449"]').type('4499999999');

    cy.get('.modal button').contains('Crear Cliente').click();
    cy.get('.modal').should('not.exist');
    cy.contains('Cliente Solo Phone').should('be.visible');
  });

  it('debe crear cliente solo con email', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal input[placeholder*="Nombre"]').type('Cliente Solo Email');
    cy.get('.modal input[type="email"]').type('soloemail@test.com');

    cy.get('.modal button').contains('Crear Cliente').click();
    cy.get('.modal').should('not.exist');
    cy.contains('Cliente Solo Email').should('be.visible');
  });

  it('no debe crear cliente sin nombre', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal input[type="email"]').type('test@test.com');

    cy.get('.modal button').contains('Crear Cliente').should('be.disabled');
    cy.get('.modal button').contains('Cancelar').click();
  });

  it('no debe crear cliente sin contacto (ni email ni teléfono)', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal input[placeholder*="Nombre"]').type('Sin Contacto');

    cy.get('.modal button').contains('Crear Cliente').should('be.disabled');
    cy.get('.modal button').contains('Cancelar').click();
  });

  // ==========================================
  // EDITAR CLIENTE
  // ==========================================

  it('debe editar un cliente existente', () => {
    cy.contains('Cliente Cypress Test').parents('tr').within(() => {
      cy.get('button[title="Editar"]').click();
    });

    cy.get('.modal').should('be.visible');
    cy.get('.modal-title').should('contain', 'Editar Cliente');

    cy.get('.modal input[placeholder*="Nombre"]').clear().type('Cliente Cypress Editado');
    cy.get('.modal button').contains('Guardar Cambios').click();

    cy.get('.modal').should('not.exist');
    cy.contains('Cliente Cypress Editado').should('be.visible');
  });

  // ==========================================
  // ELIMINAR CLIENTE
  // ==========================================

  it('debe eliminar clientes de prueba', () => {
    const testClients = ['Cliente Cypress Editado', 'Cliente Solo Phone', 'Cliente Solo Email'];

    testClients.forEach((name) => {
      cy.on('window:confirm', () => true);
      cy.get('body').then(($body) => {
        if ($body.text().includes(name)) {
          cy.contains(name).parents('tr').within(() => {
            cy.get('button[title="Eliminar"]').click();
          });
          cy.wait(500);
        }
      });
    });
  });

  // ==========================================
  // MODAL
  // ==========================================

  it('debe cerrar modal con Cancelar', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal').should('be.visible');
    cy.get('.modal button').contains('Cancelar').click();
    cy.get('.modal').should('not.exist');
  });
});