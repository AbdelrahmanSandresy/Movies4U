describe("Test 12", () => {
  it("returns to the login page after logging out", () => {
    cy.intercept("GET", "/api/v1/user/", {
      statusCode: 200,
      body: { email: "moviefan@example.com" },
    });

    cy.intercept("POST", "/api/v1/user/logout/", {
      statusCode: 200,
      body: {},
    });

    cy.visit("/home", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "test-token");
      },
    });

    cy.contains("button", "Log Out").click();

    cy.location("pathname").should("equal", "/");
    cy.get("h1").should("have.text", "Welcome to Movies4U");
  });
});
