const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const USERNAME = process.env.DATABASE_USERNAME;
const PASSWORD = process.env.DATABASE_PASSWORD;
const HOST = process.env.DATABASE_HOST;
const PORT = process.env.DATABASE_PORT;
const NAME = process.env.DATABASE_NAME;

let database;
(async function () {
  const client = await MongoClient.connect(
    `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/?authSource=admin`,
    { useUnifiedTopology: true }
  );
  database = client.db(NAME);
})();

async function saveAnswer(userId, answer) {
  await database.collection("answers").insertOne({
    userId: userId,
    ...answer,
  });
}

async function isAlreadyAnswered(userId) {
  const result = await database.collection("answers").findOne({
    userId: userId,
  });

  return result != null;
}

module.exports = {
  saveAnswer,
  isAlreadyAnswered,
};
