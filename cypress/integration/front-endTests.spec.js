describe('Mocking the API', () => {
  const terms = require('../fixtures/terms')
  const { hits } = require('../fixtures/stories')

  context('Stories', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${terms.initialTerm}&page=0&hitsPerPage=100`,
        { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getStories')
    })

    context('List of stories', () => {
      it('shows the right data for all rendered stories', () => {
        cy.get('.table-row')
          .first()
          .should('be.visible')
          .should('contain', hits[0].title)
          .and('contain', hits[0].author)
          .and('contain', hits[0].num_comments)
          .and('contain', hits[0].points)
        cy.get(`.table-row a:contains(${hits[0].title})`)
          .should('have.attr', 'href', hits[0].url)

        cy.get('.table-row')
          .last()
          .should('be.visible')
          .should('contain', hits[1].title)
          .and('contain', hits[1].author)
          .and('contain', hits[1].num_comments)
          .and('contain', hits[1].points)
        cy.get(`.table-row a:contains(${hits[1].title})`)
          .should('have.attr', 'href', hits[1].url)
      })

      it('shows one less story after dimissing the first one', () => {
        cy.get('.button-inline:contains(Dismiss)')
          .first()
          .should('be.visible')
          .click()

        cy.get('.table-row')
          .should('have.length', hits.length - 1)
      })
    })

    context('Order by', () => {
      it('orders by title', () => {
        cy.get('.button-inline:contains(Title)')
          .as('titleHeader')
          .should('be.visible')
          .and('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[0].title)
        cy.get(`.table-row a:contains(${hits[0].title})`)
          .should('have.attr', 'href', hits[0].url)

        cy.get('@titleHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[1].title)
        cy.get(`.table-row a:contains(${hits[1].title})`)
          .should('have.attr', 'href', hits[1].url)
      })

      it('orders by author', () => {
        cy.get('.button-inline:contains(Author)')
          .as('authorHeader')
          .should('be.visible')
          .and('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[0].author)

        cy.get('@authorHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[1].author)
      })

      it('orders by comments', () => {
        cy.get('.button-inline:contains(Comments)')
          .as('commentsHeader')
          .should('be.visible')
          .and('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[1].num_comments)

        cy.get('@commentsHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[0].num_comments)
      })

      it('orders by points', () => {
        cy.get('.button-inline:contains(Points)')
          .as('pointsHeader')
          .should('be.visible')
          .and('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[1].points)

        cy.get('@pointsHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('be.visible')
          .and('contain', hits[0].points)
      })
    })
  })

  context('Search', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${terms.initialTerm}&page=0&hitsPerPage=100`,
        { fixture: 'empty' }
      ).as('getEmptyStories')

      cy.intercept(
        'GET',
        `**/search?query=${terms.newTerm}&page=0&hitsPerPage=100`,
        { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getEmptyStories')

      cy.get('input[type="text"]')
        .should('be.visible')
        .clear()
    })

    it('shows no story when none is returned', () => {
      cy.get('.table-row').should('not.exist')
    })

    it('types and hits ENTER', () => {
      cy.search(terms.newTerm)
      cy.wait('@getStories')

      cy.get('.table-row').should('have.length', hits.length)
    })

    it('types and clicks the submit button', () => {
      cy.get('input[type="text"]')
        .should('be.visible')
        .type(terms.newTerm)
      cy.contains('Search')
        .should('be.visible')
        .click()
      cy.wait('@getStories')

      cy.get('.table-row')
        .should('have.length', hits.length)
    })

    it('require the API only on the first search for a term', () => {
      let count = 0

      cy.intercept(`**/search?query=${terms.cacheTerm}**`, req => {
        count += 1
        req.reply({ fixture: 'empty' })
      }).as('requestCounter')

      cy.search(terms.cacheTerm).then(() => {
        expect(count).to.equal(1)
      })
      cy.wait('@requestCounter')

      cy.search(terms.newTerm)
      cy.wait('@getStories')

      cy.search(terms.cacheTerm).then(() => {
        expect(count).to.equal(1)
      })
    })
  })

  context('Errors', () => {
    it('shows "Something went wrong ..." in case of a server error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { statusCode: 500 }
      ).as('getServerFailure')

      cy.visit('/')
      cy.wait('@getServerFailure')

      cy.get('p:contains(Something went wrong.)')
        .should('be.visible')
    })

    it('shows "Something went wrong ..." in case of a network error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { forceNetworkError: true }
      ).as('getNetworkFailure')

      cy.visit('/')
      cy.wait('@getNetworkFailure')

      cy.get('p:contains(Something went wrong.)')
        .should('be.visible')
    })
  })

  it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        delay: 1000,
        fixture: 'stories'
      }
    ).as('getDelayedStories')

    cy.visit('/')

    cy.assertLoadingIsShownAndHidden()
    cy.wait('@getDelayedStories')

    cy.get('.table-row').should('have.length', hits.length)
  })
})
