describe("Test 1", () => {
  it("will test the structure of the authentication form", () => {
    cy.clearLocalStorage();
    cy.visit("/");

    cy.get("form.auth-form").should("exist");

    cy.get("form.auth-form input[type='email']")
      .should("have.attr", "placeholder", "Enter email")
      .and("have.attr", "required");

    cy.get("form.auth-form input[type='password']")
      .should("have.attr", "placeholder", "Password")
      .and("have.attr", "required");

    cy.get("form.auth-form input[type='checkbox']")
      .should("be.checked");

    cy.get("form.auth-form label")
      .contains("CREATE ACCOUNT")
      .should("be.visible");

    cy.get("form.auth-form button[type='submit']")
      .should("have.text", "CREATE ACCOUNT");
  });
});
