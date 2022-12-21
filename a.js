javascript: var head = document.getElementsByTagName("head")[0],
  aScript = document.createElement("script");
(aScript.type = "text/javascript"),
  (aScript.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"),
  head.appendChild(aScript);
const downloadURI = (t, e) => {
    let n = document.createElement("a");
    (n.download = e), (n.href = t), document.body.appendChild(n), n.click();
  },
  result = (t, e, n) => {
    j$("#p-" + e).html(t);
    let d = t.toDataURL();
    console.log(d);
    downloadURI(d, e + ".png");
  };
setTimeout(async () => {
  j$("body").append("<div id='p-title'>title</div>"),
    j$("body").append("<div id='p-content'>content</div>"),
    j$("body").append("<div id='p-updown'>updown</div>"),
    j$("body").append("<div id='p-best'>best</div>"),
    j$("body").append("<div id='p-comment'>comment</div>"),
    html2canvas(j$(".pann-title")[0]).then(function (t) {
      result(t, "title", 1);
    }),
    html2canvas(j$(".content")[0]).then(function (t) {
      result(t, "content", 2);
    });
}, 1e3);
