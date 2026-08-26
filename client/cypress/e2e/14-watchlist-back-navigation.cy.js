describe("Test 14", () => {
  it("navigates from the Watchlist back to the Home page", () => {
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

    cy.contains("button", "Back to Search").click();

    cy.location("pathname").should("equal", "/home");
  });
});
