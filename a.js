var head = document.getElementsByTagName("head")[0];
var aScript = document.createElement("script");
(aScript.type = "text/javascript"),
  (aScript.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"),
  head.appendChild(aScript);

var bScript = document.createElement("script");
(bScript.type = "text/javascript"),
  (bScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"),
  head.appendChild(bScript);

const replaceAlld = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};

const result = (t) => {
  let d = t.toDataURL();
  d = d.replace("data:image/png;base64,", "");
  return d;
};

const upload = async (title, base64image_urls, textContent) => {
  $.ajax({
    url: "https://twitter-auto.herokuapp.com/upload",
    method: "post",
    data: { title, base64image_urls, textContent },
  }).done((res) => {
    console.log(`done: ${res.data.text}`);
  });
};

const getHost = () => {
  const url = location.host;
  if (url.indexOf("teamblind") !== -1) {
    return "teamblind";
  } else if (url.indexOf("pann") !== -1) {
    return "pann";
  }
};

const getTeamblind = async () => {
  const title = await $(".article-view-head > h2").text();

  let contentP = $("#contentArea");
  let content = "";
  let contentSplit = [];
  content = contentP[0].innerText;
  contentSplit = content.split("\n");
  contentSplit = contentSplit.filter((item) => {
    return item;
  });

  const textContent = [];
  const realContent = contentSplit.map((item) => {
    const replaceItem = replaceAlld(item, "\t", "");
    if (!replaceItem.length) {
      return "";
    } else {
      textContent.push(replaceItem);
      return `<p style="margin-top:-1px; padding: 6px 10px;font-size: 16px; line-height: 1.6em;">${replaceItem}</p>`;
    }
  });

  let j = 0;
  for (let i in realContent) {
    i = Number(i);
    if (i % 10 === 0) {
      $("body").append("<div id='n-content-" + j + "'></div>");
    }
    if (i === 0) {
      $("#n-content-" + j).append($(".article-view-head")[0]);
    }

    if (!isNaN(i)) {
      $("#n-content-" + j).append(realContent[i]);
    }
    if (i % 10 === 9) {
      j++;
    }
  }

  const base64image_urls = [];
  for (let i = 0; i < j; i++) {
    console.log(`${i + 1}번째 이미지 생성중...`);
    const contentCanvas = await html2canvas($("#n-content-" + i)[0]);
    const contentBase64Url = result(contentCanvas);
    base64image_urls.push(contentBase64Url);
  }

  return {
    title,
    base64image_urls,
    textContent,
  };
};

const getNatePann = async () => {
  const title = await j$(".pann-title > h3").text().trim();

  let contentP = j$(".content > p");
  let content = "";
  let contentSplit = [];
  if (contentP.length > 3) {
    contentP = j$(".content > p");
    for (let i in contentP) {
      i = Number(i);
      if (!isNaN(i)) {
        contentSplit.push(j$(contentP[i]).text());
      }
    }
  } else {
    contentP = j$(".content");
    content = contentP[0].innerText;
    contentSplit = content.split("\n");
  }
  contentSplit = contentSplit.filter((item) => {
    return item;
  });

  const textContent = [];
  const realContent = contentSplit.map((item) => {
    const replaceItem = replaceAlld(item, "\t", "");
    if (!replaceItem.length) {
      return "";
    } else {
      textContent.push(replaceItem);
      return `<p style="background-color: #262626; margin-top:-1px; padding: 6px 10px;font-size: 16px; line-height: 1.6em;color: #d7d7d7; border: 1px color #262626">${replaceItem}</p>`;
    }
  });

  let j = 0;
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
  for (let i = 0; i < j; i++) {
    console.log(`${i + 1}번째 이미지 생성중...`);
    const contentCanvas = await html2canvas(j$("#n-content-" + i)[0]);
    const contentBase64Url = result(contentCanvas);
    base64image_urls.push(contentBase64Url);
  }

  return {
    title,
    base64image_urls,
    textContent,
  };
};

setTimeout(async () => {
  console.log("start");

  let title = "";
  let base64image_urls = [];
  let textContent = [];
  if (getHost() === "pann") {
    const d = await getNatePann();
    title = d.title;
    base64image_urls = d.base64image_urls;
    textContent = d.textContent;
  } else if (getHost() === "teamblind") {
    const d = await getTeamblind();
    title = d.title;
    base64image_urls = d.base64image_urls;
    textContent = d.textContent;
  }

  console.log(title);
  console.log(base64image_urls);
  console.log(textContent);

  console.log("업로딩 중...");
  upload(title, base64image_urls, textContent);
}, 1000);
