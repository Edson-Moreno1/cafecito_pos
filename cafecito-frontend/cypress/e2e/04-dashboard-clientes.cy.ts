describe('Dashboard — Clientes', () => {

  // Sufijo único por corrida para evitar colisiones de unique index
  const uid = Date.now().toString().slice(-6);

  const testClients = {
    full: { name: `CypressFull ${uid}`, email: `full${uid}@cy.test`, phone: `449${uid}1` },
    phone: { name: `CypressPhone ${uid}`, phone: `449${uid}2` },
    email: { name: `CypressEmail ${uid}`, email: `email${uid}@cy.test` },
    edited: { name: `CypressEditado ${uid}` }
  };

  beforeEach(() => {
    cy.loginAs('admin');
    cy.visit('/dashboard');
    cy.get('.nav-tabs').contains('Clientes').click();
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
    cy.get('table tbody tr').first().should('contain', '%');
  });

  // ==========================================
  // CREAR CLIENTE
  // ==========================================

  it('debe crear cliente con email y teléfono', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal').should('be.visible');
    cy.get('.modal-title').should('contain', 'Nuevo Cliente');

    cy.get('.modal input[placeholder="Nombre completo"]').type(testClients.full.name);
    cy.get('.modal input[placeholder="correo@ejemplo.com"]').type(testClients.full.email);
    cy.get('.modal input[placeholder="Ej: 4491234567"]').type(testClients.full.phone);

    cy.get('.modal button').contains('Crear Cliente').click();
    cy.get('.modal').should('not.exist');
    cy.contains(testClients.full.name).should('be.visible');
  });

  it('debe crear cliente solo con teléfono', () => {
    cy.contains('button', 'Nuevo Cliente').click();

    cy.get('.modal input[placeholder="Nombre completo"]').type(testClients.phone.name);
    cy.get('.modal input[placeholder="Ej: 4491234567"]').type(testClients.phone.phone);

    cy.get('.modal button').contains('Crear Cliente').should('not.be.disabled');
    cy.get('.modal button').contains('Crear Cliente').click();
    cy.get('.modal').should('not.exist');
    cy.contains(testClients.phone.name).should('be.visible');
  });

  it('debe crear cliente solo con email', () => {
    cy.contains('button', 'Nuevo Cliente').click();

    cy.get('.modal input[placeholder="Nombre completo"]').type(testClients.email.name);
    cy.get('.modal input[placeholder="correo@ejemplo.com"]').type(testClients.email.email);

    cy.get('.modal button').contains('Crear Cliente').should('not.be.disabled');
    cy.get('.modal button').contains('Crear Cliente').click();
    cy.get('.modal').should('not.exist');
    cy.contains(testClients.email.name).should('be.visible');
  });

  it('no debe crear cliente sin nombre', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal input[placeholder="correo@ejemplo.com"]').type('test@test.com');

    cy.get('.modal button').contains('Crear Cliente').should('be.disabled');
    cy.get('.modal button').contains('Cancelar').click();
  });

  it('no debe crear cliente sin contacto (ni email ni teléfono)', () => {
    cy.contains('button', 'Nuevo Cliente').click();
    cy.get('.modal input[placeholder="Nombre completo"]').type('Sin Contacto');

    cy.get('.modal button').contains('Crear Cliente').should('be.disabled');
    cy.get('.modal button').contains('Cancelar').click();
  });

  // ==========================================
  // EDITAR CLIENTE
  // ==========================================

  it('debe editar un cliente existente', () => {
    cy.contains(testClients.full.name).parents('tr').within(() => {
      cy.get('button[title="Editar"]').click();
    });

    cy.get('.modal').should('be.visible');
    cy.get('.modal-title').should('contain', 'Editar Cliente');

    cy.get('.modal input[placeholder="Nombre completo"]').clear().type(testClients.edited.name);
    cy.get('.modal button').contains('Guardar Cambios').click();

    cy.get('.modal').should('not.exist');
    cy.contains(testClients.edited.name).should('be.visible');
  });

  // ==========================================
  // ELIMINAR CLIENTE (cleanup de datos de prueba)
  // ==========================================

  it('debe eliminar clientes de prueba', () => {
    const namesToDelete = [
      testClients.edited.name,
      testClients.phone.name,
      testClients.email.name
    ];

    namesToDelete.forEach((name) => {
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