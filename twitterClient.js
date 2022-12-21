const { TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi({
  // v1
  // appKey: "1rUcmvtGVeV2q6MC2G3BjiEF2",
  // appSecret: "0TFsPiVOu2xzM3sm1wzEAANmZuVtKZO4ur9viucM7tlJAWNHPV",
  // accessToken: "1282222177874350081-9un8dKBt6gmUiLPeHW3jhW6Efr69oZ",
  // accessSecret: "hvCt4H0UGwFJyutMQ3DnbF7vNuyhIxYo2xRcrTqhqBQJ1",
  // v2
  appKey: "NtQY75UIYEOVfojptuujo3Odj",
  appSecret: "Ofu1DhSGpAwzjYtWo9YjdqfFmR62wjj9WEHn4yVGlsSdTQioT9",
  accessToken: "1282222177874350081-9M80ITzTGsiITCjBv7tKuY94Rd25ru",
  accessSecret: "GzkvYy7GY621O4PMyB8Va435FrdRgwk7uKWa8NxY14p6P",
});

const twitterClient = client.readWrite;

module.exports = twitterClient;
