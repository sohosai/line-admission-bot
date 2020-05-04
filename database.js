const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const USERNAME = process.env.DATABASE_USERNAME;
const PASSWORD = process.env.DATABASE_PASSWORD;
const HOST = process.env.DATABASE_HOST;
const PORT = process.env.DATABASE_PORT;
const NAME = process.env.DATABASE_NAME;

async function saveAnswer(userId, answer) {
  const client = await MongoClient.connect(
    `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}`,
    { useUnifiedTopology: true }
  );

  const database = client.db(NAME);
  await database.collection("answers").insertOne({
    userId: userId,
    ...answer,
  });
}

module.exports.saveAnswer = saveAnswer;
