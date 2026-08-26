describe("Test 13", () => {
  it("displays the empty Watchlist page", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.intercept("GET", "/api/v1/watchlist/", []);

    cy.visit("/watchlist", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get("main.watchlist-page").should("exist");
    cy.get("h1").should("have.text", "My Watchlist");
    cy.get(".empty-watchlist h2")
      .should("have.text", "Your watchlist is empty");
    cy.contains("button", "Find Movies").should("be.visible");
  });
});
