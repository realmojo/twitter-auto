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

const getTrends = async () => {
  const url =
    "https://api.twitter.com/2/guide.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&include_ext_is_blue_verified=1&include_ext_verified_type=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=false&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&candidate_source=trends&include_page_configuration=false&entity_tokens=false&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CbirdwatchPivot%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl%2Ccollab_control%2Cvibe";

  const res = await axios.get(url, {
    headers: {
      Authorization:
        "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
      "x-twitter-client-language": "ko",
      "x-csrf-token":
        "72844c9645cad01055f164fd64810e13b448199512d5fd369711ff71d59539864c883fc9eb52f503dbd89bb814669819730ad8e0b855ac701c1b0fa40b54fc67a6c559765b6f0bd2b98083d43216caa0",
    },
  });
  return res.data;
};

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

const getContent = (title, urls, textContent) => {
  const length = textContent.length;
  let html = "";
  html += `<h2>${title}</h2>`;
  if (textContent.length > 1) {
    html += `<p>${textContent[0]}. ${textContent[1]}.</p>`;
  }
  html += base64toImage(title, urls);
  for (let i = 2; i < length; i++) {
    html += `<p>${textContent[i]}</p>`;
  }
  return html;
};

const base64toImage = (title, urls) => {
  let html = "";
  for (const url of urls) {
    html += `<img alt="${title}" src="data:image/png;base64,${url}" />`;
  }
  return html;
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
  const { title, base64image_urls, textContent } = req.body;

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

  try {
    const {
      timeline: { instructions },
    } = await getTrends();
    const trendItems =
      instructions[1].addEntries.entries[1].content.timelineModule.items;

    const trendWords = trendItems.map((item) => {
      return item.item.content.trend.name;
    });

    const imageUploadUrl = "https://upload.twitter.com/1.1/media/upload.json";

    const media_ids = [];
    let i = 0;
    for (const base64image_url of base64image_urls) {
      console.log(`${++i} upload start`);
      if (i <= 1) {
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
      content: getContent(title, base64image_urls, textContent),
      categories: [41],
      tags: [42, 43, 44, 45],
      status: "publish",
    });
    googleIndexing(wpRes);

    const result = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text:
          // `${title}\n👉 https://techupbox.com/story/${wpRes.id}\n#${trendWords[0]} #${trendWords[1]} #${trendWords[2]}` ||
          `${title}` || "Hello world!",
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
