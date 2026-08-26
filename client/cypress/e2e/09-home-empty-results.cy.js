describe("Test 9", () => {
  it("does not display movie cards before a search", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get(".search input").should("have.value", "");
    cy.get(".movie-card-container").should("not.exist");
    cy.get(".all-movies ul").should("not.exist");
  });
});
