var recentlyPost = document.getElementById("sidebar__recent-posts");
if (recentlyPost) {
  recentlyPost.remove();
}
var popularPost = document.getElementById("sidebar__popular-posts");
if (popularPost) {
  popularPost.remove();
}
var profiles = document.getElementById("sidebar__profile");
if (profiles) {
  profiles.remove();
}
var areaRelated = document.getElementById("area_related");
if (areaRelated) {
  areaRelated.remove();
}
var title = document.getElementsByTagName("title")[0].innerText;
var imgObjects = document.getElementsByTagName("img");

var alt = "";
var src = "";
var obj = "";
var imageInfo = [];

for (let i in imgObjects) {
  i = Number(i);
  if (!isNaN(i)) {
    obj = imgObjects[i];
    alt = obj.alt ? `${obj.alt}-${i}` : `${title}-${i}`;
    src = obj.currentSrc;
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

var div = document.createElement("div");

var doClose = () => {
  document.getElementById("img-crawl").remove();
};

var toDataURL = (src, callback) => {
  var image = new Image();
  image.crossOrigin = "anonymous";
  var img = new Image();
  img.crossOrigin = "anonymous";
  console.log(2);
  console.log(src);
  image.src = src;
  image.onload = function () {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    console.log(1);
    context.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    callback(dataURL);
  };
  console.log(4);
};
// const getBase64Image = (img) => {
//   console.log(img);
//   var canvas = document.createElement("canvas");

//   canvas.width = img.width;
//   canvas.height = img.height;
//   var ctx = canvas.getContext("2d");
//   ctx.drawImage(img, 0, 0);
//   console.log(canvas);
//   var dataURL = canvas.toDataURL("image/png");
//   return dataURL.replace(/^data:image\/?[A-z]*;base64,/);
// };

var imageURL =
  "https://blog.kakaocdn.net/dn/bAODTG/btrQOAwGEgA/ZFm62Nkm9bavBEybvYMSXk/img.jpg";

function startDownload() {
  let imageURL =
    "https://blog.kakaocdn.net/dn/bAODTG/btrQOAwGEgA/ZFm62Nkm9bavBEybvYMSXk/img.jpg";

  downloadedImg = new Image();
  downloadedImg.crossOrigin = "Anonymous";
  downloadedImg.addEventListener("load", imageReceived, false);
  downloadedImg.src = imageURL;
}

function imageReceived() {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");

  canvas.width = downloadedImg.width;
  canvas.height = downloadedImg.height;

  context.drawImage(downloadedImg, 0, 0);
  imageBox.appendChild(canvas);

  try {
    localStorage.setItem("saved-image-example", canvas.toDataURL("image/png"));
  } catch (err) {
    console.log("Error: " + err);
  }
}
startDownload();

downloadedImg = new Image();
downloadedImg.crossOrigin = "anonymous";
downloadedImg.src = imageURL;
downloadedImg.onload = function () {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.height = this.naturalHeight;
  canvas.width = this.naturalWidth;
  console.log(1);
  context.drawImage(this, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  console.log(dataURL);
};

https: var downloadURI = (t, e) => {
  let n = document.createElement("a");
  (n.download = e), (n.href = t), document.body.appendChild(n), n.click();
};

var doDownload = () => {
  for (const item of imageInfo) {
    // console.log(item.src);
    // const dataURL = getBase64Image(item.obj);
    // console.log(dataURL);
    toDataURL(item.src, (dataURL) => {
      downloadURI(dataURL, `${item.alt}.png`);
    });
  }
};

var html = "";
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
  <button style="padding: 10px;color: white;font-size: 20px;background: transparent;border: none;margin-top: -10px;" onClick="doClose()">???</button>
</div>
<div style="clear:both;"></div>
<div style="width: 100%; padding: 40px;">
  ${html}
</div>
`;

document.body.append(div);

setTimeout(() => {
  doDownload();
}, 500);
