describe('Home page', () => {
  it('loads and shows Cars header', () => {
    cy.visit('/')
    cy.contains('Cars')
    // Add button moved into the table header; check by title
    cy.get('button[title="Add"]').should('exist')
  })
})
