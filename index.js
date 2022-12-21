const twitterClient = require("./twitterClient");
const { download } = require("./utilities");

const tweet = async () => {
  // const uri = "https://i.imgur.com/Zl2GLjnh.jpg";
  // const filename = "image.png";

  const arr = ["title", "content"];

  // download(uri, filename, async function () {
  try {
    const media_ids = [];
    for (let i = 0; i < arr.length; i++) {
      const mediaId = await twitterClient.v1.uploadMedia(`./${arr[i]}.png`);
      media_ids.push(mediaId);
      console.log(`${i + 1}번째 이미지 업로드 완료`);
    }
    await twitterClient.v2.tweet({
      text: "여친과 살짝 다투었어요 PC카톡 vs 핸드폰카톡",
      media: {
        media_ids,
      },
    });
    console.log("done");
  } catch (e) {
    console.log(e);
  }
  // });
};

tweet();
