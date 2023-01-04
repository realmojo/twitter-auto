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
// const iageToBinary = require("./imageToBinary");
// const request = require("request");
const fs = require("fs");
const { google } = require("googleapis");
const { moreImage } = require("./moreImage");
const request = require("request").defaults({ encoding: null });

dotenv.config();

const oauth_timestamp = Math.floor(+new Date() / 1000);
const oauth_nonce = v4();
const oauth_consumer_key = process.env.TWITTER_API_KEY;
const oauth_consumer_secret = process.env.TWITTER_API_SECRET_KEY;
const oauth_token = process.env.TWITTER_ACCESS_TOKEN;
const oauth_token_secret = process.env.TWITTER_ACEESS_TOKEN_SECRET;
const port = process.env.PORT || 3000;

const getTrends = async () => {
  try {
    const { data } = await axios.get("http://115.85.182.17/trends");
    return data;
  } catch (e) {
    console.log(e);
  }
};

const wp = new WPAPI({
  endpoint: "https://techupbox.com/wp-json",
  username: process.env.WP_ID,
  password: process.env.WP_PASS,
});

const jwtClient = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDlTDdF67BsUBW\nELE602vJGi8My+DsKGevWP8gIyiDhANABsLx/syDEeCRkOJTEZujCS5oK9cSqliN\nfBXwN0nL1E+RHyWHIdcz5fEbxo2ADiUOmvrtGkDI98+IP12Fv7Q5jRSxtSekk3tn\nQkvE3T3iYjEwaSGd5N2ANsPKxBEHeV5/VMFwVeO/McItr/jCtRwtIOS+UV8LQ4dX\neAcNOFj02at1b0db8YEj9wU96VzYPwtMSc3kn5WbiqlZ83hoOqXVmpVFZEAdgob5\nwHZDAAR+EG57wDIU/18C6V8qSZ+jIvZSA6+iIldOoEudVzNADHxfpa8pa3b1Tkxu\nbzoMvHLtAgMBAAECggEAJEMqDyQP87ugeRSZN5XxexTOummmp0KKjtlKXDQIk/HL\nBHj8dg/O7VJIN9UMEWjHWYAfSZMvSjepOXpTOvmVRiR0KC0FMTvWAbpVbNfwblix\nCDc15PYkIt7HbLSK63xytuTwfE5hLkNl8uw4ziRTEAEyq44ifHrtkpMU1ChsG91S\n3KIsSDscdcyBlqICdB+PB4Bs4Ar0ibGtou9b34JDu/4Sltbiy/swZZLCscRw/Jmo\nBlkv8HHax7dTDxURw38GzFmxUZfbdJUFtydEVlPwcI+52INy97N6b7bfqavIH4y5\nOvI02VAvWxQDgTxxUqKuNE8cI1iHwT1pNgvmyz+hxQKBgQDo0seLeCqpr3RByCaP\njPaBRLIGLl8s3jLZrCaJFfOLk2ky9OuDCHFDYrGfY5mB26AKhM5vEA4zB4lgXlG0\n1e+2aNFMQ6Fxvgr5GrVip93fa5+n3W8nZWk7u9y9mpWQO/3ts+bLq1q5ydrTewMI\nJBlR0FUVak9fwdcrsqAKeI/y8wKBgQDXDWFkBBszTOxOlqJam1s5G6Puq2wwmnJi\nx6JVunaEpc9OvyP6M08aJ5icmRT0LvtPkwR/WKuGp+7wfOH7r286xy3/jpksn3ZT\ncgP8wWiUrlIiUsfgoWtTA5p5ux2YYauPFP3cfrCt0eT0OH5gmYmYxJb651CckVeE\nGlGqK/C6nwKBgEVgsfecelIQJ3uGsf7qyXXhy47N+Kx9FfgJNX56HRXFen6lvxxP\nwriKy1Usr8yjboBT7NPpm+GW6FfgI0bYzVK0z1GDgbNMJybtz4kzbokqH+w8rue1\nb3NOWsvhKZpOVi+kAS1FxYZBYUTNjiy53RWlGAWGpVpqf7zUwJ3+KR8DAoGBAJok\nph0pcFG6HltKT38AgkeRz1QgnUDNQ5YYH/yw1YjIzKpWCTSqmFVX8mS0uTc5gbsM\n1xlsdi3jqznHWbesjN6lrAvUq2g3uHmhbMg73XlM5eRiT5BsQ2BSYeRFQbZas7yw\nQDJOwNcmbqS65aLaCq1spAedy8MdzowKzWRbcIZjAoGAI8Iy6jvwUNE0TDgdUlb0\nblgGLaVp3FWbrDOFYk3aMsm9zAro+Rct/2u04j/T+2Oi9H0FBar0f8ZfC9nLdf0t\nlOpP4kwfDSgb260BoCnfruHtXJpOx3TeKErcmLq+z507AMGaucoCdI/Xhghv0pHT\n/QtN5hScvXcLipYKeT/RG9s=\n-----END PRIVATE KEY-----\n",
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
      fs.writeFile("./log.txt", JSON.stringify(body), () => {
        console.log("writed...");
      });
    });
  });
};

const googleIndexingByStorypickup = (url) => {
  const jwcli = new google.auth.JWT(
    process.env.CLIENT_STORYPICKUP_EMAIL,
    null,
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC87boSLBxQ19a1\n6Nv0rc8Zepvfo+F/XOTKLYdmHd7WIk090eI8KBFSdRCacDcd6Ov72l4tIw7WMOQK\nZKRQ/D+kOZqT/1Qywgg9LZR0sHuCV7pfA8dcKk+X8VQ66o6PAe3cgw33LQRc7TSS\nrMEXj+xLYlXuwEplDhNo0/5II1TjXtwuDSwGLUAtZNl/aG1HA32OhRN7wqV7mG8L\nFD1UgE/ll9lHA2G5HLqipy9kdFSHDJmVu/gTlruAMZ2chGDTADdK9fJkOhwpmj9e\nHwlHKU33EnrINwTigIFuG06nrvu7/7q68Q9elUfOVsd756s9hdjg2CbdGYLmdOEp\nPH+QwEztAgMBAAECggEAEZrpeuYHYXUredoQHRXRNaOaQNXJno+udjSV6GsiJ7wc\njIUxWr+1FYT5HhsU18Grs9Veb0BUEpuNtHY6ZZ2L5KbFg8MIOo6gK+tCaTlE2RmJ\nsW7tteXvcs43NiJDVIouexzvQTg9rtcfzgcxGxv7Pe8U6OGcTRxprJwMlvZL47/7\nKcOc9IJp+9yxqA6axw8X5i0hQREjbO1kF/yfzaKK2WwK4efOcyZ4Xkfl/u1hSCSW\nHHrap1vMfds2FNlwTb1iQQcT/rSxEQ2tx84KCCVgJa9+ERMZ86u1uHaYJDwfXtfh\nawt/PFeWI6Ez5DIy3u9TsSYFHq92kfOb6vUVh4/oVQKBgQDktnOrDA3NmsosHv05\nb2O9YTJx5NGDxjwUIkTI77AslyymhqRUiIT0UGgI3ihJQeWYmTlcuOzuADeial46\nkBEo+WYDER9gyCAPE7SIa8BShDnRXq7a5/qvC1bZ7k5U4fnUdlviOICVSfkqEjZQ\nX1Zir6xkuWfyuFDvTA/UbjZtmwKBgQDTeCdpadJhKifBVy+EQdo6x3VHv6u8IrxD\n4UbZXbbXJAsF5nJnO99ZzZp7CnPGSpDBTvduB9qlD/soVxmRO0aVUqNiZtHNX+/c\nzzkr4RgQ6Jy6UuN2cthCo09ERdZgjgNflb3eOMjC+3GL6nbquou9xR2UFSpHjxeA\nEl6oV1acFwKBgCzZBhdtVquRhcFfFkKT8BfrnkutFdRkI9XC3oAUWBR2VGAXGNQm\nrQOHXM8YWQf8bvwcV54x+Ou2iTJE71NGesbxGKrTSbbdp0OtloIFtwG3QesnSNxO\nDt8SNyamzx9f7HBYAS576+LaTYyNY68g8ryJPCHIJXT35Y72+EeskOmvAoGBALMM\n70Hf6dN/X/3iFkeDgoV2UKUZcw1u070dx2FQafmrePHb903Vcf2VipFXfkOM6xfi\nBrpRSB2udFfpt6oyaEcSm2g76rRb4LozcxLmGfxnGBzjBdlK0DVMFVeXUjaax9xs\n60B3D/WX9MIlGd8RaDSb67lwWkYQsDMuWptqp9itAoGBAKzVyRBBQImqcQSRlT2K\nRfoe4MM1ZVijppEg8Y5K9QGdGV/ADuUNyIFOiD3IpYQJj758e5Fk6F6cxGVAAk0L\npNYYMr/cydALM8L957a9GKXaaYoxVFqeekRzcW6qloToJwoq7o2FQa0usfXvoYhP\nm2+tfQM6WVSSqbc5AxFU99GY\n-----END PRIVATE KEY-----\n",
    ["https://www.googleapis.com/auth/indexing"],
    null
  );

  jwcli.authorize(function (err, tokens) {
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
        url: url,
        type: "URL_UPDATED",
      },
    };
    request(options, function (error, response, body) {
      if (error) {
        return res.status(500).send(error);
      } else {
        return res.status(200).send(body);
      }
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
  html += `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1963334904140891"
     data-ad-slot="5622325360"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
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

app.get("/trends", async (req, res) => {
  const data = await getTrends();
  res.status(200).send(data);
});

app.get("/env", async (req, res) => {
  res.status(200).send(process.env);
});

app.get("/google", async (req, res) => {
  res.status(200).send(jwtClient);
});

app.get("/indexingtest", async (req, res) => {
  const wpUrl = `https://techupbox.com/story/2381`;

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
      if (error) {
        return res.status(500).send(error);
      } else {
        return res.status(200).send(body);
      }
      // console.log(body);
      // console.log(`${wpUrl} google indexing success.`);
      // fs.writeFile("./log.txt", JSON.stringify(body), () => {
      //   console.log("writed...");
      // });
    });
  });
});

app.get("/sp_indexingtest", async (req, res) => {
  const url = `https://storypickup.com/humor/%EB%82%B4-%EC%96%BC%EA%B5%B4%EC%9D%B4-%EC%9C%A0%EB%A8%B8/`;

  const jwcli = new google.auth.JWT(
    process.env.CLIENT_STORYPICKUP_EMAIL,
    null,
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC87boSLBxQ19a1\n6Nv0rc8Zepvfo+F/XOTKLYdmHd7WIk090eI8KBFSdRCacDcd6Ov72l4tIw7WMOQK\nZKRQ/D+kOZqT/1Qywgg9LZR0sHuCV7pfA8dcKk+X8VQ66o6PAe3cgw33LQRc7TSS\nrMEXj+xLYlXuwEplDhNo0/5II1TjXtwuDSwGLUAtZNl/aG1HA32OhRN7wqV7mG8L\nFD1UgE/ll9lHA2G5HLqipy9kdFSHDJmVu/gTlruAMZ2chGDTADdK9fJkOhwpmj9e\nHwlHKU33EnrINwTigIFuG06nrvu7/7q68Q9elUfOVsd756s9hdjg2CbdGYLmdOEp\nPH+QwEztAgMBAAECggEAEZrpeuYHYXUredoQHRXRNaOaQNXJno+udjSV6GsiJ7wc\njIUxWr+1FYT5HhsU18Grs9Veb0BUEpuNtHY6ZZ2L5KbFg8MIOo6gK+tCaTlE2RmJ\nsW7tteXvcs43NiJDVIouexzvQTg9rtcfzgcxGxv7Pe8U6OGcTRxprJwMlvZL47/7\nKcOc9IJp+9yxqA6axw8X5i0hQREjbO1kF/yfzaKK2WwK4efOcyZ4Xkfl/u1hSCSW\nHHrap1vMfds2FNlwTb1iQQcT/rSxEQ2tx84KCCVgJa9+ERMZ86u1uHaYJDwfXtfh\nawt/PFeWI6Ez5DIy3u9TsSYFHq92kfOb6vUVh4/oVQKBgQDktnOrDA3NmsosHv05\nb2O9YTJx5NGDxjwUIkTI77AslyymhqRUiIT0UGgI3ihJQeWYmTlcuOzuADeial46\nkBEo+WYDER9gyCAPE7SIa8BShDnRXq7a5/qvC1bZ7k5U4fnUdlviOICVSfkqEjZQ\nX1Zir6xkuWfyuFDvTA/UbjZtmwKBgQDTeCdpadJhKifBVy+EQdo6x3VHv6u8IrxD\n4UbZXbbXJAsF5nJnO99ZzZp7CnPGSpDBTvduB9qlD/soVxmRO0aVUqNiZtHNX+/c\nzzkr4RgQ6Jy6UuN2cthCo09ERdZgjgNflb3eOMjC+3GL6nbquou9xR2UFSpHjxeA\nEl6oV1acFwKBgCzZBhdtVquRhcFfFkKT8BfrnkutFdRkI9XC3oAUWBR2VGAXGNQm\nrQOHXM8YWQf8bvwcV54x+Ou2iTJE71NGesbxGKrTSbbdp0OtloIFtwG3QesnSNxO\nDt8SNyamzx9f7HBYAS576+LaTYyNY68g8ryJPCHIJXT35Y72+EeskOmvAoGBALMM\n70Hf6dN/X/3iFkeDgoV2UKUZcw1u070dx2FQafmrePHb903Vcf2VipFXfkOM6xfi\nBrpRSB2udFfpt6oyaEcSm2g76rRb4LozcxLmGfxnGBzjBdlK0DVMFVeXUjaax9xs\n60B3D/WX9MIlGd8RaDSb67lwWkYQsDMuWptqp9itAoGBAKzVyRBBQImqcQSRlT2K\nRfoe4MM1ZVijppEg8Y5K9QGdGV/ADuUNyIFOiD3IpYQJj758e5Fk6F6cxGVAAk0L\npNYYMr/cydALM8L957a9GKXaaYoxVFqeekRzcW6qloToJwoq7o2FQa0usfXvoYhP\nm2+tfQM6WVSSqbc5AxFU99GY\n-----END PRIVATE KEY-----\n",
    ["https://www.googleapis.com/auth/indexing"],
    null
  );

  jwcli.authorize(function (err, tokens) {
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
        url: url,
        type: "URL_UPDATED",
      },
    };
    request(options, function (error, response, body) {
      if (error) {
        return res.status(500).send(error);
      } else {
        return res.status(200).send(body);
      }
      // console.log(body);
      // console.log(`${wpUrl} google indexing success.`);
      // fs.writeFile("./log.txt", JSON.stringify(body), () => {
      //   console.log("writed...");
      // });
    });
  });
});

app.get("/", async (req, res) => {
  console.log("hello world");
  res.send("ok");
});

const imageDownload = async (uri, filename, callback) => {
  request.head(uri, function (err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        let data =
          "data:" +
          res.headers["content-type"] +
          ";base64," +
          Buffer.from(body).toString("base64");
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
}

app.post("/download", async (req, res) => {
  const { src, alt } = req.body;

  // const d = [];
  // for (const info of imageInfo) {
  const data = await doRequest(src);
  // }
  return res.status(200).send({ src: data, alt });
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
app.post("/story_upload", async (req, res) => {
  const { title, textContent } = req.body;
  let { bo_table } = req.body;
  if (!bo_table) {
    bo_table = "worry";
  }

  // 스토리픽업 포스팅
  const spFormData = new FormData();
  spFormData.append("bo_table", bo_table);
  // spFormData.append("html", "html1");
  spFormData.append("wr_subject", title);
  spFormData.append("wr_content", textContent.join("<br/>"));

  const rrr = await axios.post(
    "https://storypickup.com/bbs/write_auto.php",
    spFormData
  );

  let returnUrl = rrr.data;

  res.status(200).send(returnUrl);
});

app.post("/upload", async (req, res) => {
  const { title, base64image_urls, textContent } = req.body;
  let { bo_table } = req.body;
  if (!bo_table) {
    bo_table = "worry";
  }

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
    const trendWords = await getTrends();
    const imageUploadUrl = "https://upload.twitter.com/1.1/media/upload.json";

    const media_ids = [];
    let i = 0;

    // 트위터 메인이랑 더보기 이미지 추가
    for (let j = 0; j < 2; j++) {
      const formData = new FormData();
      if (j === 0) {
        formData.append("media_data", base64image_urls[0]);
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
      } else if (j === 1) {
        formData.append("media_data", moreImage);
        const res = await axios.post(imageUploadUrl, formData, {
          headers: {
            Authorization: headerBase64,
            "content-type": "multipart/form-data",
          },
        });
        if (res.data && res.data.media_id_string) {
          media_ids.push(res.data.media_id_string);
        }
        console.log(`${i} the more upload end`);
      }
    }

    // 스토리픽업 포스팅
    const spFormData = new FormData();
    spFormData.append("bo_table", bo_table);
    // spFormData.append("html", "html1");
    spFormData.append("wr_subject", title);
    spFormData.append("wr_content", textContent.join("<br/>"));

    const rrr = await axios.post(
      "https://storypickup.com/bbs/write_auto.php",
      spFormData
    );

    let returnUrl = rrr.data;

    // 워드프레스 포스팅
    // const wpRes = await wp.posts().create({
    //   title,
    //   content: getContent(title, base64image_urls, textContent),
    //   categories: [41],
    //   tags: [42, 43, 44, 45],
    //   status: "publish",
    // });
    googleIndexingByStorypickup(returnUrl);

    // 트위터 포스팅
    const result = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text:
          `${title}\n👉 ${returnUrl} ${trendWords[1]} ${trendWords[2]} ${trendWords[3]} ${trendWords[4]}` ||
          "Hello world!",
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
    console.log(e);
    return res.status(500).send({ status: "error", message: e });
  }
});

server.listen(port, () => {
  console.log(`Twtitter auto upload Server Open Port: ${port}`);
});
