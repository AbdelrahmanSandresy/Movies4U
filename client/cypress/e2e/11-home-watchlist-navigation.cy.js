describe("Test 11", () => {
  it("navigates to the Watchlist page", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.intercept("GET", "/api/v1/watchlist/", []);

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.contains("button", "My Watchlist").click();

    cy.location("pathname").should("equal", "/watchlist");
  });
});
