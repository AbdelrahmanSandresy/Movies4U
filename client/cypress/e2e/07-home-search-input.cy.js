describe("Test 7", () => {
  it("allows the user to enter and clear a movie search", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get(".search input")
      .type("Batman")
      .should("have.value", "Batman");

    cy.get(".search input")
      .clear()
      .should("have.value", "");

    cy.get(".all-movies ul").should("not.exist");
  });
});
