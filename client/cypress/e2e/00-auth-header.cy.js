describe("Test 0", () => {
  it("will test the basic structure of the authentication header", () => {
    cy.clearLocalStorage();
    cy.visit("/");

    cy.get("header.auth-header").should("exist");

    cy.get("header.auth-header img")
      .should("be.visible")
      .and("have.attr", "alt", "Movies4U");

    cy.get("header.auth-header h1")
      .should("have.text", "Welcome to Movies4U");
  });
});
