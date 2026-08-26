describe("Test 6", () => {
  it("will test the basic structure of the Home page", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get("header.home-header").should("exist");

    cy.get("header.home-header img.site-logo")
      .should("be.visible")
      .and("have.attr", "alt", "Movies4U");

    cy.contains("button", "My Watchlist").should("be.visible");
    cy.contains("button", "Log Out").should("be.visible");

    cy.get(".search input")
      .should("have.attr", "placeholder", "Search through thousands of movies");

    cy.get(".all-movies h2").should("have.text", "Search Results");
  });
});
