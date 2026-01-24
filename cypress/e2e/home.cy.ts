describe('Home page', () => {
  it('loads and shows Entities header', () => {
    cy.visit('/')
    cy.contains('Entities')
    // Add button moved into the table header; check by title
    cy.get('button[title="Add"]').should('exist')
  })
})
