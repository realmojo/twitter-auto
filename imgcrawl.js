var head = document.getElementsByTagName("head")[0];
var bScript = document.createElement("script");
(bScript.type = "text/javascript"),
  (bScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"),
  head.appendChild(bScript);

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
var areaRelated = document.getElementsByClassName("area_related")[0];
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
      });
    }
  }
}

var div = document.createElement("div");

var doClose = () => {
  document.getElementById("img-crawl").remove();
};

var downloadURI = (t, e) => {
  let n = document.createElement("a");
  (n.download = e), (n.href = t), document.body.appendChild(n), n.click();
};

var doDownload = () => {
  console.log("downloading ...");
  for (const info of imageInfo) {
    $.ajax({
      url: "https://twitter-auto.herokuapp.com/download",
      method: "post",
      data: { src: info.src, alt: info.alt },
    }).done((res) => {
      console.log(`${res.alt} 이미지가 다운로드 완료되었습니다.`);
      downloadURI(res.src, res.alt);
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
  <button style="padding: 10px;color: white;font-size: 20px;background: transparent;border: none;margin-top: -10px;" onClick="doClose()">✕</button>
</div>
<div style="clear:both;"></div>
<div style="width: 100%; padding: 40px;">
  ${html}
</div>
`;

document.body.append(div);

// setTimeout(() => {
//   doDownload();
// }, 500);
