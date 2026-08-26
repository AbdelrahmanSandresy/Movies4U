describe("Test 16", () => {
  it("redirects unauthenticated users to the login page", () => {
    cy.clearLocalStorage();
    cy.visit("/watchlist");

    cy.location("pathname").should("equal", "/");

    cy.get("h1")
      .should("have.text", "Welcome to Movies4U");
  });
});
