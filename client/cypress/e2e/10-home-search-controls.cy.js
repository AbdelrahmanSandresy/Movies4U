describe("Test 10", () => {
  it("displays the search icon and input", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get(".search img")
      .should("be.visible")
      .and("have.attr", "alt", "search");

    cy.get(".search input")
      .should("be.visible")
      .and("have.attr", "type", "text");
  });
});
