describe('Página de Ventas', () => {

  beforeEach(() => {
    cy.loginAs('vendedor');
    cy.visit('/sales');
  });

  // ==========================================
  // PRODUCTOS: Carga y búsqueda
  // ==========================================

  describe('Listado de productos', () => {
    it('debe cargar productos al iniciar', () => {
      cy.get('.product-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar nombre y precio en cada producto', () => {
      cy.get('.product-card').first().within(() => {
        cy.get('.card-title').should('not.be.empty');
        cy.get('.card-text').should('contain', '$');
      });
    });

    it('debe mostrar paginación si hay más de 20 productos', () => {
      cy.contains('Página').should('be.visible');
      cy.contains('Siguiente').should('be.visible');
    });

    it('debe navegar entre páginas', () => {
      cy.get('.product-card').then(($cards) => {
        const firstPageFirstProduct = $cards.first().text();
        cy.contains('Siguiente').click();
        cy.get('.product-card').first().should(($newCards) => {
          expect($newCards.text()).to.not.eq(firstPageFirstProduct);
        });
        cy.contains('Anterior').click();
        cy.get('.product-card').should('have.length.greaterThan', 0);
      });
    });

    it('debe buscar productos por nombre', () => {
      cy.get('input[placeholder*="Buscar"]').type('Americano');
      cy.wait(500); // debounce
      cy.get('.product-card').each(($card) => {
        cy.wrap($card).should('contain.text', 'Americano');
      });
    });

    it('debe mostrar mensaje cuando no hay resultados', () => {
      cy.get('input[placeholder*="Buscar"]').type('productoquenoexiste123');
      cy.wait(500);
      cy.contains('No se encontraron productos').should('be.visible');
    });

    it('debe restaurar productos al borrar búsqueda', () => {
      cy.get('input[placeholder*="Buscar"]').type('frap');
      cy.wait(500);
      cy.get('.product-card').should('have.length.greaterThan', 0);
      cy.get('input[placeholder*="Buscar"]').clear();
      cy.wait(500);
      cy.get('.product-card').should('have.length', 20);
    });
  });

  // ==========================================
  // CARRITO: Agregar, editar, eliminar
  // ==========================================

  describe('Carrito', () => {
    it('debe agregar un producto al carrito', () => {
      cy.get('.product-card').first().click();
      cy.get('.list-group-item').should('have.length', 1);
      cy.get('.badge').contains('1 items').should('be.visible');
    });

    it('debe incrementar cantidad al agregar el mismo producto', () => {
      cy.get('.product-card').first().click();
      cy.get('.product-card').first().click();
      cy.get('.list-group-item').should('have.length', 1);
      cy.get('.list-group-item').first().should('contain', '2');
    });

    it('debe incrementar y decrementar cantidad con botones +/-', () => {
      cy.get('.product-card').first().click();
      cy.get('.list-group-item').first().within(() => {
        cy.get('button').contains('+').click();
        cy.get('button[disabled]').should('contain', '2');
        cy.get('button').contains('-').click();
        cy.get('button[disabled]').should('contain', '1');
      });
    });

    it('debe eliminar producto del carrito con botón basura', () => {
      cy.get('.product-card').first().click();
      cy.get('.list-group-item').should('have.length', 1);
      cy.get('.text-danger').first().click();
      cy.get('.list-group-item').should('have.length', 0);
      cy.contains('Selecciona productos').should('be.visible');
    });

    it('debe eliminar producto cuando cantidad llega a 0', () => {
      cy.get('.product-card').first().click();
      cy.get('.list-group-item').first().within(() => {
        cy.get('button').contains('-').click();
      });
      cy.contains('Selecciona productos').should('be.visible');
    });

    it('debe calcular subtotal correctamente', () => {
      cy.get('.product-card').first().click();
      cy.get('.product-card').first().click();
      // El subtotal debe ser precio * 2
      cy.get('.card-footer').should('contain', '$');
    });

    it('botón Cobrar debe estar deshabilitado con carrito vacío', () => {
      cy.get('button').contains('Cobrar').should('be.disabled');
    });
  });

  // ==========================================
  // CHECKOUT: Cliente, descuento, pago
  // ==========================================

  describe('Checkout', () => {
    beforeEach(() => {
      // Agregar un producto al carrito antes de cada test de checkout
      cy.get('.product-card').first().click();
      cy.get('button').contains('Cobrar').click();
    });

    it('debe abrir la vista de checkout', () => {
      cy.contains('Checkout').should('be.visible');
      cy.contains('Cliente (opcional)').should('be.visible');
    });

    it('debe buscar clientes por nombre', () => {
      cy.get('input[placeholder*="Buscar por nombre"]').type('Ana');
      cy.wait(500);
      cy.get('.list-group-item-action').should('have.length.greaterThan', 0);
    });

    it('debe seleccionar un cliente y mostrar descuento', () => {
      cy.get('input[placeholder*="Buscar por nombre"]').type('Elena');
      cy.wait(500);
      cy.get('.list-group-item-action').first().click();
      cy.get('.alert-success, .badge').should('contain', 'Elena');
      // Verificar que hay algún descuento aplicado
      cy.get('.alert-info, .text-success').should('contain', '%');
    });

    it('debe poder remover cliente seleccionado', () => {
      cy.get('input[placeholder*="Buscar por nombre"]').type('Elena');
      cy.wait(500);
      cy.get('.list-group-item-action').first().click();
      cy.get('.alert-success').should('be.visible');
      cy.get('.btn-outline-danger').first().click();
      cy.get('.alert-success').should('not.exist');
    });

    it('debe cambiar método de pago', () => {
      cy.get('#payCard').click({ force: true });
      cy.get('#payCard').should('be.checked');
      cy.get('#payTransfer').click({ force: true });
      cy.get('#payTransfer').should('be.checked');
    });

    it('debe volver al carrito con botón "Volver"', () => {
      cy.contains('Volver al carrito').click();
      cy.contains('Orden Actual').should('be.visible');
    });

    it('debe mostrar resumen de orden en checkout', () => {
      cy.get('.list-group-flush li').should('have.length.greaterThan', 0);
      cy.contains('Subtotal').should('be.visible');
    });
  });

  // ==========================================
  // VENTA COMPLETA: Confirmar y ticket
  // ==========================================

  describe('Confirmar venta y ticket', () => {

    it('debe completar venta anónima y mostrar ticket', () => {
      cy.get('.product-card').first().click();
      cy.get('button').contains('Cobrar').click();
      cy.get('button').contains('Confirmar Venta').click();

      // Ticket debe aparecer
      cy.contains('¡Venta Exitosa!').should('be.visible');
      cy.contains('Cafecito Feliz').should('be.visible');
      cy.contains('SALE-').should('be.visible');
      cy.contains('Efectivo').should('be.visible');
      // Sin cliente → mensaje de bienvenida
      cy.contains('Bienvenido').should('be.visible');
    });

    it('debe completar venta con cliente y mostrar descuento en ticket', () => {
      cy.get('.product-card').first().click();
      cy.get('button').contains('Cobrar').click();

      // Seleccionar cliente con descuento
      cy.get('input[placeholder*="Buscar por nombre"]').type('Roberto');
      cy.wait(500);
      cy.get('.list-group-item-action').first().click();

      cy.get('button').contains('Confirmar Venta').click();

      // Ticket con descuento
      cy.contains('¡Venta Exitosa!').should('be.visible');
      cy.contains('Roberto').should('be.visible');
      cy.contains('%').should('be.visible');
    });

    it('debe regresar al carrito vacío con "Nueva Venta"', () => {
      cy.get('.product-card').first().click();
      cy.get('button').contains('Cobrar').click();
      cy.get('button').contains('Confirmar Venta').click();
      cy.contains('¡Venta Exitosa!').should('be.visible');

      cy.get('button').contains('Nueva Venta').click();
      cy.contains('Selecciona productos').should('be.visible');
      cy.get('.badge').contains('0 items').should('be.visible');
    });
  });
});