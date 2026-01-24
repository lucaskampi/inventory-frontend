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

    // auto-confirm JS confirm dialog
    cy.on('window:confirm', () => true)

    // click first delete button
    cy.get('[title="Delete"]').first().click()
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
