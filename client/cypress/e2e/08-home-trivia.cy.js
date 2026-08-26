describe("Test 8", () => {
  it("displays the movie trivia section", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.get(".trivia-card").should("exist");

    cy.get(".trivia-label")
      .should("have.text", "Movie Trivia · True or False");

    cy.get(".trivia-attribution")
      .should("have.attr", "href", "https://opentdb.com/");
  });
});
