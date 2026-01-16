import request from "supertest";
import app from "../src/index";

describe("Users", () => {
  const userDetails = {
    username: "testuser" + Math.random().toString(36).substring(2, 15),
    password: "testpassword",
  };

  describe("Sign Up", () => {
    it("should return 201 and create a new user", async () => {
      const response = await request(app).post("/api/v1/users/signup").send(userDetails);
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("User created successfully");
      expect(response.body.data.userId).toBeDefined();
    });
    it("should return 400 for invalid request body", async () => {
      const invalidDetails = { username: "", password: "" };
      const response = await request(app).post("/api/v1/users/signup").send(invalidDetails);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Sign In", () => {
    it("should return 200 and login a user", async () => {
      const response = await request(app).post("/api/v1/users/signin").send(userDetails);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Login successful");
      expect(response.body.data.token).toBeDefined();
    });
    it("should return 400 for invalid request body", async () => {
      const invalidDetails = { username: "", password: "" };
      const response = await request(app).post("/api/v1/users/signin").send(invalidDetails);
      expect(response.statusCode).toBe(400);
    });
  }); 
});
