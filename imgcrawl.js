const title = document.getElementsByTagName("title")[0].innerText;
const imgObjects = document.getElementsByTagName("img");
console.log(imgObjects);

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
      });
    }
  }
}

let div = document.createElement("div");

const doClose = () => {
  document.getElementById("img-crawl").remove();
};

div.id = "img-crawl";
div.style =
  "position: fixed; top: 0; background: black; opacity: 0.4; width: 100%; height: 100%; z-index: 9999;";

div.innerHTML = `
<div style="float: right; padding-top: 8px; padding-right: 8px;">
  <button style="padding: 10px; color: white; font-size: 20px; " onClick="doClose()">\00d7</button>
</div>
`;

document.body.append(div);

console.log(imageInfo);
