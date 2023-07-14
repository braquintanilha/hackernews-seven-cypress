Cypress.Commands.add("screenshotAfterEachInHeadless", () => {
  if (!Cypress.config("isInteractive")) {
    cy.screenshot();
  }
})

afterEach(() => {
  cy.screenshotAfterEachInHeadless();
})