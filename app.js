const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
const { v4 } = require("uuid");
const crypto = require("crypto");
const dotenv = require("dotenv");
const axios = require("axios");
const FormData = require("form-data");
// const { base64Data } = require("./base64");
const WPAPI = require("wpapi");
// const imageToBinary = require("./imageToBinary");
const request = require("request");
const { google } = require("googleapis");

dotenv.config();

const oauth_timestamp = Math.floor(+new Date() / 1000);
const oauth_nonce = v4();
const oauth_consumer_key = process.env.TWITTER_API_KEY;
const oauth_consumer_secret = process.env.TWITTER_API_SECRET_KEY;
const oauth_token = process.env.TWITTER_ACCESS_TOKEN;
const oauth_token_secret = process.env.TWITTER_ACEESS_TOKEN_SECRET;
const port = process.env.PORT || 3000;

const wp = new WPAPI({
  endpoint: "https://techupbox.com/wp-json",
  username: process.env.WP_ID,
  password: process.env.WP_PASS,
});

const jwtClient = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY,
  ["https://www.googleapis.com/auth/indexing"],
  null
);

const googleIndexing = (res) => {
  const wpUrl = `https://techupbox.com/story/${res.id}`;

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }
    let options = {
      url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      auth: { bearer: tokens.access_token },
      json: {
        url: wpUrl,
        type: "URL_UPDATED",
      },
    };
    request(options, function (error, response, body) {
      console.log(body);
      console.log(`${wpUrl} google indexing success.`);
    });
  });
};

const base64toImage = (title, url) => {
  return `<img alt="${title}" src="data:image/png;base64,${url}" />`;
};

server.setTimeout(500000);

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.get("/", async (req, res) => {
  console.log("hello world");

  res.send("ok");
});
const encodeValue = (text) => {
  const encodedText = encodeURIComponent(text).replace(
    /[_!'()*]/g,
    function (c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    }
  );
  return encodedText;
};
app.post("/upload", async (req, res) => {
  const { title, base64image_urls } = req.body;

  const parameters = {
    oauth_consumer_key,
    oauth_nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp,
    oauth_version: "1.0",
    oauth_token,
  };

  let ordered = {};
  Object.keys(parameters)
    .sort()
    .forEach(function (key) {
      ordered[key] = parameters[key];
    });
  //key 알파벳 순으로 정렬한다

  let encodedParameters = "";

  for (let key in ordered) {
    const encodedValue = encodeValue(ordered[key]);
    const encodedKey = encodeURIComponent(key);
    if (encodedParameters === "") {
      encodedParameters += `${encodedKey}=${encodedValue}`;
    } else {
      encodedParameters += `&${encodedKey}=${encodedValue}`;
    }
  }
  //키와 밸류를 퍼센트 인코딩

  const method = "POST";
  const url = "https://api.twitter.com/2/tweets";
  const base64url = "https://upload.twitter.com/1.1/media/upload.json";
  const encodedUrl = encodeURIComponent(url);
  const base64encodedUrl = encodeURIComponent(base64url);
  encodedParameters = encodeURIComponent(encodedParameters);

  //base string으로 합치기
  const signature_base_string = `${method}&${encodedUrl}&${encodedParameters}`;
  const signature_base64_string = `${method}&${base64encodedUrl}&${encodedParameters}`;

  //consumer secret과 oauth scret을 &로 연결
  const signing_key = `${encodeURIComponent(
    oauth_consumer_secret
  )}&${encodeURIComponent(oauth_token_secret)}`;

  console.log(signing_key);
  //서명 키로 base string을 sha1로 암호화
  const oauth_signature = crypto
    .createHmac("sha1", signing_key)
    .update(signature_base_string)
    .digest("base64");
  //서명 키로 base string을 sha1로 암호화
  const oauth_signature_base64 = crypto
    .createHmac("sha1", signing_key)
    .update(signature_base64_string)
    .digest("base64");

  const encoded_oauth_signature = encodeURIComponent(oauth_signature);
  const encoded_oauth_signature_base64 = encodeURIComponent(
    oauth_signature_base64
  );
  // const encoded_oauth_signature = oauth_signature;

  const header = `OAuth oauth_consumer_key="${
    parameters.oauth_consumer_key
  }",oauth_nonce="${
    parameters.oauth_nonce
  }",oauth_signature="${encoded_oauth_signature}",oauth_signature_method="${
    parameters.oauth_signature_method
  }",oauth_timestamp="${
    parameters.oauth_timestamp
  }",oauth_token="${encodeURIComponent(
    parameters.oauth_token
  )}",oauth_version="1.0"`;
  const headerBase64 = `OAuth oauth_consumer_key="${
    parameters.oauth_consumer_key
  }",oauth_nonce="${
    parameters.oauth_nonce
  }",oauth_signature="${encoded_oauth_signature_base64}",oauth_signature_method="${
    parameters.oauth_signature_method
  }",oauth_timestamp="${
    parameters.oauth_timestamp
  }",oauth_token="${encodeURIComponent(
    parameters.oauth_token
  )}",oauth_version="1.0"`;
  console.log(header);

  try {
    const imageUploadUrl = "https://upload.twitter.com/1.1/media/upload.json";

    const media_ids = [];
    let i = 0;
    for (const base64image_url of base64image_urls) {
      console.log(`${++i} upload start`);
      if (i <= 4) {
        const formData = new FormData();
        formData.append("media_data", base64image_url);
        const res = await axios.post(imageUploadUrl, formData, {
          headers: {
            Authorization: headerBase64,
            "content-type": "multipart/form-data",
          },
        });
        if (res.data && res.data.media_id_string) {
          media_ids.push(res.data.media_id_string);
        }
        console.log(`${i} upload end`);
      }
    }

    // 워드프레스 포스팅
    const wpRes = await wp.posts().create({
      title,
      content: base64toImage(title, base64image_urls),
      categories: [41],
      tags: [42, 43, 44, 45],
      status: "publish",
    });
    googleIndexing(wpRes);

    const result = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text:
          `${title}\n
          👉 https://techupbox.com/story/${wpRes.id}` || "Hello world!",
        media: {
          media_ids,
        },
      },
      {
        headers: {
          Authorization: header,
        },
      }
    );

    return res.status(200).send(result.data);
  } catch (e) {
    return res.status(500).send({ status: "error", message: e.response.data });
  }
});

server.listen(port, () => {
  console.log(`Twtitter auto upload Server Open Port: ${port}`);
});
