describe("Test 2", () => {
  it("can switch between create-account and login modes", () => {
    cy.clearLocalStorage();
    cy.visit("/");

    cy.get("input[type='checkbox']").should("be.checked");
    cy.get("button[type='submit']").should("have.text", "CREATE ACCOUNT");

    cy.get("input[type='checkbox']").uncheck();

    cy.get("input[type='checkbox']").should("not.be.checked");
    cy.get("button[type='submit']").should("have.text", "LOG IN");

    cy.get("input[type='checkbox']").check();

    cy.get("button[type='submit']").should("have.text", "CREATE ACCOUNT");
  });
});
