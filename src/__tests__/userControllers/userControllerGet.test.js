/* eslint-disable no-underscore-dangle */
require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require("mongoose");
const request = require("supertest");
const app = require("../../server");
const connectDataBase = require("../../database");
const getUsers = require("../../server/controllers/usersController/userController");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const connectionMemoryString = mongoServer.getUri();
  await connectDataBase(connectionMemoryString);
});

describe("Given a /users endpoint", () => {
  describe("When it receives a GET request", () => {
    test("Then it should reply with a 200 status code", async () => {
      await request(app).get("/users/").expect(200);
    });
  });
  describe("When it receives a bad GET request", () => {
    test("Then it should reply with a 404 status code", async () => {
      await request(app).get("/user/").expect(404);
    });
    test("Then it should invoke next", async () => {
      const next = jest.fn();

      await getUsers(null, null, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
