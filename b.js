var head = document.getElementsByTagName("head")[0];
var aScript = document.createElement("script");
(aScript.type = "text/javascript"),
  (aScript.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"),
  head.appendChild(aScript);
const downloadURI = (t, e) => {
  let n = document.createElement("a");
  (n.download = e), (n.href = t), document.body.appendChild(n), n.click();
};
const result = (t, e) => {
  j$("#p-" + e).html(t);
  let d = t.toDataURL();
  d = d.replace("data:image/png;base64,", "");

  return d;
};

const upload = async (title, base64image_urls) => {
  j$.ajax({
    url: "https://twitter-auto.herokuapp.com/upload",
    method: "post",
    data: {
      title,
      base64image_urls,
    },
  }).done((res) => {
    console.log(`done: ${res.data.text}`);
  });
};
setTimeout(async () => {
  console.log("start");
  j$("body").append("<div id='p-title'>title</div>");
  j$("body").append("<div id='p-content'>content</div>");

  const title = await j$(".pann-title > h3").text().trim();
  const titleCanvas = await html2canvas(j$(".pann-title")[0]);
  const titleBase64Url = result(titleCanvas);
  const contentCanvas = await html2canvas(j$(".content")[0]);
  const contentBase64Url = result(contentCanvas);

  console.log(title);

  base64image_urls = [titleBase64Url, contentBase64Url];

  upload(title, base64image_urls);
}, 1000);
