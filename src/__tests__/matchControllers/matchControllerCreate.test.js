/* eslint-disable no-underscore-dangle */
require("dotenv").config();
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require("mongoose");
const connectDataBase = require("../../database");
const User = require("../../database/models/User");
const {
  createNewMatch,
} = require("../../server/controllers/matchController/matchController");
const app = require("../../server");
const Match = require("../../database/models/Match");

let mongoServer;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const connectionMemoryString = mongoServer.getUri();
  await connectDataBase(connectionMemoryString);

  await User.create({
    name: "Jamey Stagmeier",
    username: "jmayer",
    password: "$2b$10$DZkKzznjB.9YFZZsNHGI5.mSoL1MZ0fXngzjbL497rMl1PGnS3Xh.",
    matches: [],
    boardgames: [],
  });

  const { body } = await request(app).post("/users/login").send({
    username: "jmayer",
    password: "123456789",
  });

  userToken = body.token;
});

afterEach(async () => {
  await Match.deleteMany({});
  jest.restoreAllMocks();
});

describe("Given a my-matches/new-match endpoint", () => {
  describe("When it receives a POST request", () => {
    test("Then it should reply with a 201 status code", async () => {
      const newMatch = {
        gameTitle: "Blood Rage",
        image: "",
        creator: "622a4dc955c15b820edc9a45",
        date: "2022-04-01",
        maxPlayers: 4,
        location: "Barcelona",
        id: "622a4dc955c15b820edc9a45",
      };

      const mockUser = {
        name: "Jamey Stagmeier",
        username: "jmayer",
        password:
          "$2b$10$DZkKzznjB.9YFZZsNHGI5.mSoL1MZ0fXngzjbL497rMl1PGnS3Xh.",
        matches: [],
        boardgames: [],
        save: () => {},
      };
      Match.create = jest
        .fn()
        .mockResolvedValue({ id: "622a4dc955c15b820edc9a45" });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      await request(app)
        .post(`/my-matches/new-match`)
        .send(newMatch)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(201);
    });
  });
  describe("When it receives a POST bad request", () => {
    test("Then it should invoke next", async () => {
      const next = jest.fn();

      await createNewMatch(null, null, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
