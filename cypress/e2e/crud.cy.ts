describe('CRUD flows (mocked)', () => {
  beforeEach(() => {
    // initial list - match any host/path that ends with /entities
    cy.intercept('GET', '**/entities', { fixture: 'entities.json' }).as('getEntities')
    // delete stub
    cy.intercept('DELETE', '**/entities/*', { statusCode: 200 }).as('deleteEntity')
  })

  it('lists entities and deletes one item', () => {
    cy.visit('/')
    cy.wait('@getEntities')

    // ensure list contains fixtures
    cy.contains('Test A')
    cy.contains('Test B')

    // click delete button for the row containing 'Test A' to ensure correct target
    cy.contains('Test A').closest('tr').find('[title="Delete"]').click()
    // confirm dialog should appear; click the Confirm button inside it
    cy.get('[data-testid="confirm-dialog"]').should('be.visible')
    // click the confirm button by test id to avoid ambiguous queries in headless
    cy.get('[data-testid="confirm-confirm"]').should('be.visible').click({ force: true })
    cy.wait('@deleteEntity')

    // after deletion the UI removes the item (Home updates state)
    cy.contains('Test A').should('not.exist')
  })

  it('refresh button triggers fetch', () => {
    cy.visit('/')
    cy.wait('@getEntities')
    cy.get('button[title="Refresh"]').click()
    cy.wait('@getEntities')
  })
})
