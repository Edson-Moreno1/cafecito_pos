describe('Dashboard — Inventario', () => {

  beforeEach(() => {
    cy.loginAs('admin');
    cy.visit('/dashboard');
    // Asegurar que estamos en el tab de inventario
    cy.contains('Inventario').click();
  });

  // ==========================================
  // CARGA INICIAL
  // ==========================================

  it('debe cargar productos en la tabla', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('debe mostrar stats de productos y stock bajo', () => {
    cy.contains('Productos').should('be.visible');
    cy.contains('Stock Bajo').should('be.visible');
  });

  it('debe mostrar columnas correctas en la tabla', () => {
    cy.get('table thead th').should('contain', 'Producto');
    cy.get('table thead th').should('contain', 'Precio');
    cy.get('table thead th').should('contain', 'Stock');
    cy.get('table thead th').should('contain', 'Estado');
    cy.get('table thead th').should('contain', 'Acciones');
  });

  // ==========================================
  // CREAR PRODUCTO
  // ==========================================

  it('debe crear un nuevo producto', () => {
    cy.contains('Nuevo Producto').click();

    // Modal debe abrirse
    cy.get('.modal').should('be.visible');
    cy.get('.modal-title').should('contain', 'Nuevo Producto');

    // Llenar formulario
    cy.get('.modal input[placeholder*="Café"]').clear().type('Cypress Test Coffee');
    cy.get('.modal input[type="number"]').first().clear().type('99');
    cy.get('.modal input[type="number"]').last().clear().type('50');
    cy.get('.modal textarea').type('Producto creado por Cypress');

    // Guardar
    cy.get('.modal button').contains('Crear Producto').click();

    // Modal debe cerrarse y producto aparecer
    cy.get('.modal').should('not.exist');
    cy.contains('Cypress Test Coffee').should('be.visible');
  });

  it('no debe crear producto sin nombre', () => {
    cy.contains('Nuevo Producto').click();
    cy.get('.modal input[type="number"]').first().clear().type('50');
    cy.get('.modal input[type="number"]').last().clear().type('10');

    // Botón debe estar deshabilitado
    cy.get('.modal button').contains('Crear Producto').should('be.disabled');
    cy.get('.modal button').contains('Cancelar').click();
  });

  it('no debe crear producto con precio 0', () => {
    cy.contains('Nuevo Producto').click();
    cy.get('.modal input[placeholder*="Café"]').type('Test');
    cy.get('.modal input[type="number"]').first().clear().type('0');
    cy.get('.modal input[type="number"]').last().clear().type('10');

    cy.get('.modal button').contains('Crear Producto').should('be.disabled');
    cy.get('.modal button').contains('Cancelar').click();
  });

  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

  it('debe editar un producto existente', () => {
    // Click en lápiz del primer producto
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[title="Editar"]').click();
    });

    // Modal de edición
    cy.get('.modal').should('be.visible');
    cy.get('.modal-title').should('contain', 'Editar Producto');

    // Cambiar precio
    cy.get('.modal input[type="number"]').first().clear().type('999');
    cy.get('.modal button').contains('Guardar Cambios').click();

    // Modal debe cerrarse
    cy.get('.modal').should('not.exist');
    // Precio actualizado (verificar que $999 aparece)
    cy.contains('$999').should('be.visible');
  });

  // ==========================================
  // TOGGLE ACTIVO/INACTIVO
  // ==========================================

  it('debe desactivar un producto (toggle ojo)', () => {
    // Buscar un producto activo
    cy.get('table tbody tr').contains('Activo').parents('tr').first().within(() => {
      cy.get('button[title="Desactivar"]').click();
    });

    // Debe aparecer como Inactivo
    cy.get('table tbody tr.table-secondary').should('have.length.greaterThan', 0);
    cy.contains('Inactivo').should('be.visible');
  });

  it('debe reactivar un producto inactivo', () => {
    // Primero verificar que hay un producto inactivo
    cy.get('table tbody tr').contains('Inactivo').parents('tr').first().within(() => {
      cy.get('button[title="Activar"]').click();
    });

    // La tabla se recarga
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  it('debe eliminar producto con confirmación', () => {
    // Registrar handler ANTES del click
    cy.on('window:confirm', () => true);

    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      // Eliminar el producto de test (Cypress Test Coffee)
      cy.contains('Cypress Test Coffee').parents('tr').within(() => {
        cy.get('button[title="Eliminar"]').click();
      });

      // Esperar que la tabla se recargue
      cy.wait(1000);
      cy.get('table tbody tr').should('have.length.lessThan', initialCount);
    });
  });

  it('debe cancelar eliminación si se rechaza el confirm', () => {
    cy.on('window:confirm', () => false);

    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Eliminar"]').click();
      });

      cy.get('table tbody tr').should('have.length', initialCount);
    });
  });

  // ==========================================
  // CERRAR MODAL
  // ==========================================

  it('debe cerrar modal con botón Cancelar', () => {
    cy.contains('Nuevo Producto').click();
    cy.get('.modal').should('be.visible');
    cy.get('.modal button').contains('Cancelar').click();
    cy.get('.modal').should('not.exist');
  });

  it('debe cerrar modal con botón X', () => {
    cy.contains('Nuevo Producto').click();
    cy.get('.modal').should('be.visible');
    cy.get('.modal .btn-close').click();
    cy.get('.modal').should('not.exist');
  });
});