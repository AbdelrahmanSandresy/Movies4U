describe("Test 15", () => {
  it("navigates to Home when Find Movies is clicked", () => {
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

    cy.contains("button", "Find Movies").click();

    cy.location("pathname").should("equal", "/home");
  });
});
