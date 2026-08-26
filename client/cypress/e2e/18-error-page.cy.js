describe("Test 18", () => {
  it("displays the error page for an invalid URL", () => {
    cy.clearLocalStorage();
    cy.visit("/page-that-does-not-exist");

    cy.get("h1").should("have.text", "Something went wrong");

    cy.contains("a", "Back to the Login Page")
      .should("have.attr", "href", "/");
  });
});
