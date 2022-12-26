var head = document.getElementsByTagName("head")[0];
var aScript = document.createElement("script");
(aScript.type = "text/javascript"),
  (aScript.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"),
  head.appendChild(aScript);
const downloadURI = (t, e) => {
  let n = document.createElement("a");
  (n.download = e), (n.href = t), document.body.appendChild(n), n.click();
};
const replaceAlld = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};
const result = (t) => {
  let d = t.toDataURL();
  d = d.replace("data:image/png;base64,", "");
  return d;
};

const upload = async (title, base64image_urls, textContent) => {
  j$.ajax({
    url: "https://twitter-auto.herokuapp.com/upload",
    method: "post",
    data: { title, base64image_urls, textContent },
  }).done((res) => {
    console.log(`done: ${res.data.text}`);
  });
};
setTimeout(async () => {
  console.log("start");
  const title = await j$(".pann-title > h3").text().trim();
  const contentP = j$(".content")[0];
  const content = j$(contentP).text();
  let contentSplit = content.split("\n");
  contentSplit = contentSplit.filter((item) => {
    return item;
  });
  const realContent = contentSplit.map((item) => {
    const replaceItem = replaceAlld(item, "\t", "");
    if (!replaceItem.length) {
      return "";
    } else {
      return `<p style="background-color: #262626; margin-top:-1px; padding: 6px 10px;font-size: 16px; line-height: 1.6em;color: #d7d7d7; border: 1px color #262626">${replaceItem}</p>`;
    }
  });

  const textContent = contentSplit.map((item) => {
    return item;
  });

  realContent.pop();
  console.log(realContent);

  let j = 1;
  for (let i in realContent) {
    i = Number(i);
    if (i % 10 === 0) {
      j$("body").append("<div id='n-content-" + j + "'></div>");
    }
    if (i === 0) {
      j$("#n-content-" + j).append(j$(".pann-title")[0]);
      j$("#n-content-" + j + " > .pann-title > .writer > .con_info").remove();
    }

    if (!isNaN(i)) {
      j$("#n-content-" + j).append(realContent[i]);
    }
    if (i % 10 === 9) {
      j++;
    }
  }

  const base64image_urls = [];
  for (let i = 1; i <= j; i++) {
    console.log(`${i}번째 이미지 생성중...`);
    const contentCanvas = await html2canvas(j$("#n-content-" + i)[0]);
    const contentBase64Url = result(contentCanvas);
    base64image_urls.push(contentBase64Url);
  }
  upload(title, base64image_urls, textContent);
}, 1000);
