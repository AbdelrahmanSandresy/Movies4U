describe("Test 17", () => {
  it("displays a saved movie", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.intercept("GET", "/api/v1/watchlist/", [
      {
        id: 272,
        title: "Batman Begins",
        status: "want_to_watch",
        personal_rating: null,
        notes: "",
      },
    ]);

    cy.visit("/watchlist", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get(".watchlist-entry").should("have.length", 1);

    cy.get(".watchlist-entry img")
      .should("have.attr", "alt", "Batman Begins");

    cy.contains("button", "Save Changes").should("be.visible");
    cy.contains("button", "Remove").should("be.visible");
  });
});
