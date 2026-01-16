import request from "supertest";
import app from "../src/index";

describe("Bookings", () => {
  const userDetails = {
    username: "bookinguser" + Math.random().toString(36).substring(2, 15),
    password: "testpassword",
  };
  let authToken: string;
  let createdBookingId: number;

  // Setup: Create user and get auth token
  beforeAll(async () => {
    // Sign up
    await request(app).post("/api/v1/users/signup").send(userDetails);
    // Sign in to get token
    const loginResponse = await request(app).post("/api/v1/users/signin").send(userDetails);
    authToken = loginResponse.body.data.token;
  });

  describe("Create Booking", () => {
    it("should return 201 and create a new booking", async () => {
      const bookingDetails = {
        carName: "Toyota Camry",
        days: 5,
        rentPerDay: 50,
      };
      const response = await request(app)
        .post("/api/v1/bookings")
        .set("Cookie", `token=${authToken}`)
        .send(bookingDetails);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Booking created successfully");
      expect(response.body.data.bookingId).toBeDefined();
      expect(response.body.data.totalCost).toBe(250);

      createdBookingId = response.body.data.bookingId;
    });

    it("should return 400 for invalid booking data", async () => {
      const invalidBooking = {
        carName: "",
        days: 0,
        rentPerDay: -10,
      };
      const response = await request(app)
        .post("/api/v1/bookings")
        .set("Cookie", `token=${authToken}`)
        .send(invalidBooking);

      expect(response.statusCode).toBe(400);
    });

    it("should return 401 without auth token", async () => {
      const bookingDetails = {
        carName: "Honda Civic",
        days: 3,
        rentPerDay: 40,
      };
      const response = await request(app)
        .post("/api/v1/bookings")
        .send(bookingDetails);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Get Bookings", () => {
    it("should return 200 and list all bookings", async () => {
      const response = await request(app)
        .get("/api/v1/bookings")
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 200 and get a single booking by id", async () => {
      const response = await request(app)
        .get(`/api/v1/bookings?bookingId=${createdBookingId}`)
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].id).toBe(createdBookingId);
    });

    it("should return 200 and get booking summary", async () => {
      const response = await request(app)
        .get("/api/v1/bookings?summary=true")
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBookings).toBeDefined();
      expect(response.body.data.totalAmountSpent).toBeDefined();
    });

    it("should return 404 for non-existent booking", async () => {
      const response = await request(app)
        .get("/api/v1/bookings?bookingId=999999")
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Update Booking", () => {
    it("should return 200 and update booking", async () => {
      const updateData = {
        carName: "BMW X5",
        days: 7,
      };
      const response = await request(app)
        .put(`/api/v1/bookings/${createdBookingId}`)
        .set("Cookie", `token=${authToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Booking updated successfully");
      expect(response.body.data.booking.car_name).toBe("BMW X5");
      expect(response.body.data.booking.days).toBe(7);
    });

    it("should return 400 for empty update data", async () => {
      const response = await request(app)
        .put(`/api/v1/bookings/${createdBookingId}`)
        .set("Cookie", `token=${authToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 for non-existent booking", async () => {
      const response = await request(app)
        .put("/api/v1/bookings/999999")
        .set("Cookie", `token=${authToken}`)
        .send({ carName: "Test Car" });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Delete Booking", () => {
    it("should return 404 for non-existent booking", async () => {
      const response = await request(app)
        .delete("/api/v1/bookings/999999")
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("should return 200 and delete booking", async () => {
      const response = await request(app)
        .delete(`/api/v1/bookings/${createdBookingId}`)
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Booking deleted successfully");
    });

    it("should return 404 when trying to get deleted booking", async () => {
      const response = await request(app)
        .get(`/api/v1/bookings?bookingId=${createdBookingId}`)
        .set("Cookie", `token=${authToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});
