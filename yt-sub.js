const axios = require("axios");

const getKey = (html) => {
  const startOf = html.indexOf("INNERTUBE_API_KEY");

  const t = html.substr(startOf, 100);
  const d = t.split('KEY":"');
  const a = d[1].split('","');

  return a[0];
};
const getParams = (html) => {
  const startOf = html.indexOf("getTranscriptEndpoint");

  const t = html.substr(startOf, 300);
  const d = t.split('"params":"');
  const a = d[1].split('"}}}}');

  return a[0];
};

const getScriptItems = (obj) => {
  const { actions } = obj;
  const scriptItems =
    actions[0].updateEngagementPanelAction.content.transcriptRenderer.content
      .transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer
      .initialSegments;

  const items = [];
  for (const item of scriptItems) {
    items.push({
      time: item.transcriptSegmentRenderer.startTimeText.simpleText,
      text: item.transcriptSegmentRenderer.snippet.runs[0].text,
    });
  }
  return items;
};

const getUrl = (key) => {
  return `https://www.youtube.com/youtubei/v1/get_transcript?key=${key}&prettyPrint=false`;
};

const run = async () => {
  try {
    const res = await axios.get("https://www.youtube.com/watch?v=d3iyDP3_AjU");
    const html = res.data;

    // console.log(html.length);
    const key = getKey(html);
    const params = getParams(html);

    console.log(key, params);

    const data = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20230103.01.00",
        },
      },
      params,
    };
    const response = await axios.post(getUrl(key), data);

    const scriptItems = getScriptItems(response.data);

    console.log(scriptItems);
  } catch (e) {
    console.log(e);
  }
};

run();
