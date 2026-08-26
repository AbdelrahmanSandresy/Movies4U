describe("Test 3", () => {
  it("allows the user to enter an email and password", () => {
    cy.clearLocalStorage();
    cy.visit("/");

    cy.get("input[type='email']")
      .type("moviefan@example.com")
      .should("have.value", "moviefan@example.com");

    cy.get("input[type='password']")
      .type("password123")
      .should("have.value", "password123");
  });
});
