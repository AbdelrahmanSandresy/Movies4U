describe("Test 5", () => {
  it("requires both an email and password", () => {
    cy.clearLocalStorage();
    cy.visit("/");

    cy.get("button[type='submit']").click();

    cy.get("input[type='email']").then(($email) => {
      expect($email[0].checkValidity()).to.equal(false);
    });

    cy.get("input[type='password']").then(($password) => {
      expect($password[0].checkValidity()).to.equal(false);
    });

    cy.location("pathname").should("equal", "/");
  });
});
