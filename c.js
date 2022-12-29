var request = require("request").defaults({ encoding: null });

request.get(
  "https://blog.kakaocdn.net/dn/bAODTG/btrQOAwGEgA/ZFm62Nkm9bavBEybvYMSXk/img.jpg",
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data =
        "data:" +
        response.headers["content-type"] +
        ";base64," +
        Buffer.from(body).toString("base64");
      console.log(data);
    }
  }
);
// var download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     console.log("content-type:", res.headers["content-type"]);
//     console.log("content-length:", res.headers["content-length"]);

//     request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
//   });
// };

// fs.mkdir(path.join(__dirname, "/images"), () => {
//   console.log("done");
// });

// download(
//   "https://blog.kakaocdn.net/dn/bAODTG/btrQOAwGEgA/ZFm62Nkm9bavBEybvYMSXk/img.jpg",
//   `${__dirname}/images/googdle.png`,
//   function () {
//     console.log("done");
//   }
// );
