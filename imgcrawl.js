const title = document.getElementsByTagName("title")[0].innerText;
const imgObjects = document.getElementsByTagName("img");

let alt = "";
let src = "";
let obj = "";
const imageInfo = [];

for (let i in imgObjects) {
  i = Number(i);
  if (!isNaN(i)) {
    obj = imgObjects[i];
    alt = obj.alt ? `${obj.alt}-${i}` : `${title}-${i}`;
    src = obj.attributes[0].value;
    if (
      src.startsWith("http") &&
      obj.clientHeight > 100 &&
      obj.clientWidth > 100
    ) {
      imageInfo.push({
        alt,
        src,
        obj,
      });
    }
  }
}

let div = document.createElement("div");

const doClose = () => {
  document.getElementById("img-crawl").remove();
};

const toDataURL = (src, callback) => {
  var image = new Image();
  image.crossOrigin = "Anonymous";
  image.onload = function () {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    context.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    callback(dataURL);
  };
  image.src = src;
};

const downloadURI = (t, e) => {
  let n = document.createElement("a");
  (n.download = e), (n.href = t), document.body.appendChild(n), n.click();
};

const doDownload = () => {
  for (const item of imageInfo) {
    toDataURL(item.src, (dataURL) => {
      downloadURI(dataURL, `${item.alt}.png`);
    });
  }
};

let html = "";
for (const item of imageInfo) {
  html += '<div style="width: 300px; padding: 20px; display: inline-block">';
  html += `<img src="${item.src}" alt="${item.alt}" style="width: 100%;" />`;
  html += `<input style="width: 280px; padding: 10px; height: 20px;" value="${item.alt}" />`;
  html += "</div>";
}

div.id = "img-crawl";
div.style =
  "position: fixed; overflow: auto; top: 0; background: black; width: 100%; height: 100%; z-index: 9999;";
div.innerHTML = `
<div style="float: right; padding-top: 8px; padding-right: 8px;">
  <button onClick="doDownload();" style="font-size: 16px; line-height: 22px; border-radius: 15px; height: 40px; padding: 7px 20px 8px; background-color: #fce4c0; color: #815104; font-weight: normal; border: none; box-shadow: 0 2px 0 0 #cc8b24; margin-bottom: 8px; cursor: pointer; transition: all 0.2s;">
    <span style="font-weight: normal; font-size: 18px; line-height: 24px; color: #815104;">Download</span>
  </button>
  <button style="padding: 10px; color: white; font-size: 20px; " onClick="doClose()">✕</button>
</div>
<div style="clear:both;"></div>
<div style="width: 100%; padding: 40px;">
  ${html}
</div>
`;

document.body.append(div);
