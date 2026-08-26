describe("Test 4", () => {
  it("redirects unauthenticated users from the Home page to the login page", () => {
    cy.clearLocalStorage();
    cy.visit("/home");

    cy.location("pathname").should("equal", "/");

    cy.get("header.auth-header h1")
      .should("have.text", "Welcome to Movies4U");
  });
});
