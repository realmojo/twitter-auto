const axios = require("axios");

const imageToBinary = async (url) => {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return Buffer.from(res.data, "binary").toString("base64");
};

module.exports = imageToBinary;
