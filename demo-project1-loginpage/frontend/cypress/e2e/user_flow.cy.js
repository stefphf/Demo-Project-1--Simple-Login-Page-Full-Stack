describe("Demo Project E2E Tests", () => {
  const username = "testuser123";
  const password = "Password123";

  beforeEach(() => {
    // Ловим все важные API-запросы
    cy.intercept("POST", "http://localhost:8080/api/register").as(
      "registerRequest",
    );
    cy.intercept("POST", "http://localhost:8080/api/login").as("loginRequest");
    cy.intercept("DELETE", "http://localhost:8080/api/delete").as(
      "deleteRequest",
    );
  });

  it("Регистрация нового пользователя", () => {
    cy.visit("http://localhost:3000/register");

    cy.contains("Username:").parent().find("input").type(username);
    cy.contains("Password:").parent().find("input").type(password);
    cy.get('button[type="submit"]').contains("Register").click();

    // Ждём ответа сервера и редиректа на /login
    cy.wait("@registerRequest");
    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("Логин пользователя", () => {
    cy.visit("http://localhost:3000/login");

    cy.contains("Username:").parent().find("input").type(username);
    cy.contains("Password:").parent().find("input").type(password);
    cy.get('button[type="submit"]').contains("Login").click();

    cy.wait("@loginRequest");
    cy.url({ timeout: 10000 }).should("include", "/profile");
    cy.contains("Profile").should("be.visible");
    cy.contains(`Username: ${username}`).should("be.visible");
  });

  it("Ошибка при неверном логине", () => {
    cy.visit("http://localhost:3000/login");

    cy.contains("Username:").parent().find("input").type("wronguser");
    cy.contains("Password:").parent().find("input").type("wrongpassword");
    cy.get('button[type="submit"]').contains("Login").click();

    cy.contains("Invalid username or password").should("be.visible");
  });

  it("Профиль — отображение пользователя", () => {
    // Входим в систему
    cy.visit("http://localhost:3000/login");

    cy.contains("Username:").parent().find("input").type(username);
    cy.contains("Password:").parent().find("input").type(password);
    cy.get('button[type="submit"]').contains("Login").click();

    cy.wait("@loginRequest");
    cy.url({ timeout: 10000 }).should("include", "/profile");

    // Проверяем, что профиль показывает данные пользователя
    cy.contains("Profile").should("be.visible");
    cy.contains(`Username: ${username}`).should("be.visible");
    cy.get("button").contains("Delete My Account").should("be.visible");
  });

  it("Удаление аккаунта", () => {
    // Входим в систему
    cy.visit("http://localhost:3000/login");

    cy.contains("Username:").parent().find("input").type(username);
    cy.contains("Password:").parent().find("input").type(password);
    cy.get('button[type="submit"]').contains("Login").click();

    cy.wait("@loginRequest");
    cy.url({ timeout: 10000 }).should("include", "/profile");

    // Удаляем пользователя
    cy.get("button").contains("Delete My Account").click();

    // Ждём ответ сервера и редиректа на /login
    cy.wait("@deleteRequest");
    cy.url({ timeout: 10000 }).should("include", "/login");
  });
});
