const { v4 } = require("uuid");
const crypto = require("crypto");
const dotenv = require("dotenv");
const axios = require("axios");
const FormData = require("form-data");
// const { base64Data } = require("./base64");
const imageToBinary = require("./imageToBinary");

dotenv.config();

const oauth_timestamp = Math.floor(+new Date() / 1000);
const oauth_nonce = v4();
const oauth_consumer_key = process.env.TWITTER_API_KEY;
const oauth_consumer_secret = process.env.TWITTER_API_SECRET_KEY;
const oauth_token = process.env.TWITTER_ACCESS_TOKEN;
const oauth_token_secret = process.env.TWITTER_ACEESS_TOKEN_SECRET;

const parameters = {
  oauth_consumer_key,
  oauth_nonce,
  oauth_signature_method: "HMAC-SHA1",
  oauth_timestamp,
  oauth_version: "1.0",
  oauth_token,
};

function encodeValue(text) {
  const encodedText = encodeURIComponent(text).replace(
    /[_!'()*]/g,
    function (c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    }
  );
  return encodedText;
}

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
console.log("1. ", oauth_consumer_secret);
console.log("2. ", oauth_token_secret);
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
console.log("3. ", oauth_signature);
console.log("4. ", encoded_oauth_signature);
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
// const header = `OAuth oauth_consumer_key="${parameters.oauth_consumer_key}",oauth_token="${parameters.oauth_token}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${parameters.oauth_timestamp}",oauth_nonce="${parameters.oauth_nonce}",oauth_version="1.0"`;
// const header = `OAuth oauth_consumer_key="${parameters.oauth_consumer_key}",
// oauth_nonce="${parameters.oauth_nonce}",
// oauth_signature="${encoded_oauth_signature}",
// oauth_signature_method="HMAC-SHA1",
// oauth_timestamp="${parameters.oauth_timestamp}",
// oauth_token="${parameters.oauth_token}",
// oauth_version="1.0"`;
console.log(header);

// OAuth oauth_consumer_key="NtQY75UIYEOVfojptuujo3Odj",oauth_nonce="558c896c-7a2c-4f22-a45a-47ad5460edb9",oauth_signature="V9GFi3kVFy0MCOdDunBhfE9mYzU%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1671643253",      oauth_token="1282222177874350081-9M80ITzTGsiITCjBv7tKuY94Rd25ru",oauth_version="1.0"
// OAuth oauth_consumer_key="CONSUMER_API_KEY",         oauth_nonce="OAUTH_NONCE",                         oauth_signature="OAUTH_SIGNATURE",               oauth_signature_method="HMAC-SHA1",oauth_timestamp="OAUTH_TIMESTAMP", oauth_token="ACCESS_TOKEN",                                      oauth_version="1.0"' \

const run = async () => {
  try {
    const d = await imageToBinary(
      "https://f5game.s3.ap-northeast-2.amazonaws.com/match.png"
    );
    const formData = new FormData();
    formData.append("media_data", d);

    const imageUploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
    const res = await axios.post(imageUploadUrl, formData, {
      headers: {
        Authorization: headerBase64,
        "content-type": "multipart/form-data",
      },
    });

    console.log(res.data);

    const result = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text: "Hello world!",
        // "media": {"media_ids": ["1455952740635586573"]}
        media: {
          media_ids: [res.data.media_id_string],
        },
      },
      {
        headers: {
          Authorization: header,
        },
      }
    );
    console.log(result.data);
  } catch (e) {
    console.log(e.response.data);
    console.log("error");
  }
  // console.log(res);
};

run();
