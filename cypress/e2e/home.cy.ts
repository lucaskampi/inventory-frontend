describe('Home page', () => {
  it('loads and shows Entities header', () => {
    cy.visit('/')
    cy.contains('Entities')
    cy.get('button[aria-label="Add New Item"]').should('exist')
  })
})
