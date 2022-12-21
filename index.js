const twitterClient = require("./twitterClient");
const { download } = require("./utilities");

const tweet = async () => {
  const uri = "https://i.imgur.com/Zl2GLjnh.jpg";
  const filename = "image.png";

  download(uri, filename, async function () {
    try {
      const media_ids = [];
      for (let i = 0; i < 4; i++) {
        const mediaId = await twitterClient.v1.uploadMedia("./image.png");
        media_ids.push(mediaId);
        console.log(`${i + 1}번째 이미지 업로드 완료`);
      }
      await twitterClient.v2.tweet({
        text: "Hello world! This is an image in Ukraine!",
        media: {
          media_ids,
        },
      });
      console.log("done");
    } catch (e) {
      console.log(e);
    }
  });
};

tweet();
