describe('Dashboard — Ventas', () => {

  beforeEach(() => {
    cy.loginAs('admin');
    cy.visit('/dashboard');
    cy.get('.nav-tabs').contains('Ventas').click();
  });

  // ==========================================
  // CARGA INICIAL
  // ==========================================

  it('debe mostrar el historial de ventas', () => {
    cy.contains('Historial de Ventas').should('be.visible');
    cy.contains('transacciones').should('be.visible');
  });

  it('debe cargar ventas en la tabla', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('debe mostrar columnas correctas', () => {
    cy.get('table thead th').should('contain', 'ID Venta');
    cy.get('table thead th').should('contain', 'Cliente');
    cy.get('table thead th').should('contain', 'Items');
    cy.get('table thead th').should('contain', 'Pago');
    cy.get('table thead th').should('contain', 'Subtotal');
    cy.get('table thead th').should('contain', 'Total');
    cy.get('table thead th').should('contain', 'Fecha');
  });

  it('debe mostrar IDs de venta con formato SALE-', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('code').should('contain', 'SALE-');
    });
  });

  // ==========================================
  // DETALLE EXPANDIBLE
  // ==========================================

  it('debe expandir detalle al hacer click en una venta', () => {
    cy.get('table tbody tr').first().click();
    cy.contains('Detalle de productos').should('be.visible');
    cy.get('table tbody tr.bg-light, table tbody tr td.bg-light').should('exist');
  });

  it('debe colapsar detalle al hacer click de nuevo', () => {
    cy.get('table tbody tr').first().click();
    cy.contains('Detalle de productos').should('be.visible');
    cy.get('table tbody tr').first().click();
    cy.contains('Detalle de productos').should('not.exist');
  });

  it('debe mostrar nombre de producto y cantidades en el detalle', () => {
    cy.get('table tbody tr').first().click();
    cy.get('td.bg-light ul li').should('have.length.greaterThan', 0);
    cy.get('td.bg-light ul li').first().invoke('text').should('match', /\d+\s*(×|x)\s*\$/i);
  });

  // ==========================================
  // DATOS DE VENTA
  // ==========================================

  it('debe mostrar cliente o "Público general"', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('td').eq(1).then(($td) => {
        const text = $td.text().trim();
        const isValid = text.includes('Público general') || text.length > 0;
        expect(isValid).to.be.true;
      });
    });
  });

  it('debe mostrar métodos de pago con icono', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('td').eq(3).find('i.bi').should('exist');
    });
  });

  it('debe mostrar descuento cuando aplica', () => {
    cy.get('table tbody').then(($tbody) => {
      const text = $tbody.text();
      // Puede haber ventas con y sin descuento
      const hasDiscount = text.includes('%') || text.includes('—');
      expect(hasDiscount).to.be.true;
    });
  });

  // ==========================================
  // STATS
  // ==========================================

  it('debe mostrar ingresos totales', () => {
    cy.contains('Ingresos Totales').should('be.visible');
    cy.contains('MX$').should('be.visible');
  });

  it('ingresos totales deben ser mayor a 0 si hay ventas', () => {
    cy.get('table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.contains('Ingresos Totales').parent().should('not.contain', 'MX$0');
      }
    });
  });
});