describe('Hitting the real API', () => {
  const terms = require('../fixtures/terms')

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: terms.initialTerm,
        page: '0',
        hitsPerPage: '100'
      }
    }).as('getStories')

    cy.visit('/')
    cy.wait('@getStories')
  })

  it('shows 100 stories, then the next 100 after clicking "More"', () => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: terms.initialTerm,
        page: '1',
        hitsPerPage: '100'
      }
    }).as('getNextStories')

    cy.get('.table-row')
      .should('have.length', 100)

    cy.contains('More')
      .should('be.visible')
      .click()

    cy.wait('@getNextStories')

    cy.get('.table-row')
      .should('have.length', 200)
  })

  it('shows one less story after dimissing the first one', () => {
    cy.get('.table-row')
      .should('have.length', 100)

    cy.get('.button-inline:contains(Dismiss)')
      .first()
      .should('be.visible')
      .click()

    cy.get('.table-row')
      .should('have.length', 99)
  })
})
