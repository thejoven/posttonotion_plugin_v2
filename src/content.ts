import type { PlasmoCSConfig } from "plasmo";
import { Storage } from "@plasmohq/storage";

// import { API, log } from "./utils";

export {};

const storage = new Storage();

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"],
};



window.addEventListener("load", () => {
    const styleId = "custom-style";
    if (!document.getElementById(styleId)) {
        const styleString = `
  /* CSS */
  .button-85 {
    padding: 0.6em 2em;
    border: none;
    outline: none;
    color: rgb(255, 255, 255);
    background: #111;
    cursor: pointer;
    position: relative;
    z-index: 0;
    border-radius: 10px;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    text-decoration:none;
  }

  .button-85:before {
    content: "";
    background: linear-gradient(
      45deg,
      #ff0000,
      #ff7300,
      #fffb00,
      #48ff00,
      #00ffd5,
      #002bff,
      #7a00ff,
      #ff00c8,
      #ff0000
    );
    position: absolute;
    top: -2px;
    left: -2px;
    background-size: 400%;
    z-index: -1;
    filter: blur(5px);
    -webkit-filter: blur(5px);
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    animation: glowing-button-85 20s linear infinite;
    transition: opacity 0.3s ease-in-out;
    border-radius: 10px;
  }

  @keyframes glowing-button-85 {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: 400% 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  .button-85:after {
    z-index: -1;
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: #222;
    left: 0;
    top: 0;
    border-radius: 10px;
  }
`;
        const styleElement = document.createElement("style");
        styleElement.innerHTML = styleString;
        document.head.appendChild(styleElement);
    }
    console.log("Twitter Details Main");
    setInterval(listenTwitterDetailsMain, 3000);
  // document.body.style.background = "pink"
});

const listenTwitterDetailsMain = async () => {
    const tags: String = (await storage.get("tags")) ?? "";
    var currentUrl = window.location.href;
    var tweetRegex = /^https:\/\/x\.com\/[^/]+\/status\/\d+$/;
    var isTweetPage = tweetRegex.test(currentUrl);
    var postToNotionDiv = document.getElementById("posttonotion");
    var topLevelElement = document.querySelector('body > div');

    // 通过正则获取url的数字 https://x.com/YSI_crypto/status/1795029998426063257
    var tweetId: string = currentUrl.match(/\d+$/);
    if (tweetId) {
        tweetId = tweetId[0];
        console.log(tweetId)
    }

    console.log(isTweetPage)
    console.log(tags)

    if (isTweetPage && tags && tweetId) {
        // 根据tags生成按钮
        var tagsArray = tags.split(",");
        var buttonContainer = document.createElement("div");
        buttonContainer.id = "posttonotion";
        buttonContainer.style.display = "flex";
        buttonContainer.style.flexDirection = "column";
        buttonContainer.style.position = "fixed";
        buttonContainer.style.bottom = "20px";
        buttonContainer.style.left = "20px";
        buttonContainer.style.zIndex = "9999";
        buttonContainer.style.listStyle = "none";
        buttonContainer.style.transition = "all .3s ease 0s";

        buttonContainer.addEventListener("mousemove", () => {
          buttonContainer.style.bottom = "0";
          document.getElementById("posttonotion").style.opacity = "1";
        });
        if (!postToNotionDiv) {
            if (topLevelElement) {
                topLevelElement.appendChild(buttonContainer);
            } else {
                document.body.appendChild(buttonContainer);
            }
        }
        for (var i = 0; i < tagsArray.length; i++) {
            var button = document.createElement("li");
            button.style.marginBottom = "30px";
            var tag = tagsArray[i]; // 保存当前的 tagsArray[i] 的值
            button.innerHTML = `<a href="#" class="button-85">${tag}</a>`;
            button.addEventListener("click", (function (tag) {
                return function () {
                    var pageUrl = window.location.href;
                    copytonoion(pageUrl, tag, tweetId);
                };
            })(tag));
            buttonContainer.appendChild(button);
        }
        var bottom = tagsArray.length * 40
        buttonContainer.style.bottom = "-"+bottom+"px";
        buttonContainer.addEventListener("mouseout", () => {
          postToNotionDiv = document.getElementById("posttonotion");
          buttonContainer.style.bottom = "-"+bottom+"px";
          postToNotionDiv.style.opacity = ".4";
        });
        // 显示按钮
        if (postToNotionDiv) {
            postToNotionDiv.style.opacity = ".4";
        }
    } else {
        // 如果当前不再推特页面，隐藏按钮
        if (postToNotionDiv) {
            postToNotionDiv.style.opacity = "0";
        }
    }
};



const copytonoion = async (text, tags, tweetId) => {
  // 通过正则获取url的数字 https://x.com/YSI_crypto/status/1795029998426063257
  var currentUrl = window.location.href;
  var newTweetId: string = currentUrl.match(/\d+$/);
  if (newTweetId) {
    tweetId = newTweetId[0];
    console.log("new:newTweetId:"+tweetId)
  }

  console.log("ok")
  const apikey: String = (await storage.get("apikey")) ?? "";
  console.log(apikey)
  if(apikey == "") {
    showErrorNotification("Please set your API key in the extension options");
    return
  }
  // const url = `${baseUrl}?variables=${encodeURIComponent(JSON.stringify(params))}&features=${features}`;
  const getRequestHeaders = () => {
    return new Promise<{ [key: string]: string }>((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getRequestHeaders" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  };

  // Example usage
  getRequestHeaders().then((headers) => {
    console.log("Request Headers from Background:", headers);
    // 通过headers发送请求获取TweetDetail的数据 https://x.com/i/api/graphql/bFUhQzgl9zjo-teD0pAQZw/TweetDetail?variables=%7B%22focalTweetId%22%3A%22tweetId%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%7D
    var url = `https://x.com/i/api/graphql/bFUhQzgl9zjo-teD0pAQZw/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${tweetId}%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%7D`;
    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((res) => {
        console.log("TweetDetail Data:", res);
        // var tweetRow = ""
        // // 循环 data.threaded_conversation_with_injections_v2.instructions[0].entries 读取完整推文数据
        // var entries = res.data.threaded_conversation_with_injections_v2.instructions[0].entries;
        // console.log(entries.length)
        // for (var i = 0; i < entries.length; i++) {
        //   var entry = entries[i];
        //   console.log(entry.entryId)
        //   var entryId = entry.entryId.toString();
        //   // 判断 entry.entryId 字符串中是否含有 tweet 字样
        //   if (entryId.includes("tweet-")) {
        //     console.log(entry)
        //     var tweetData = entry.content.itemContent.tweet_results.result.note_tweet.note_tweet_results.result.text
        //     console.log("Tweet Data2:", tweetData);
        //     var tweetText = tweetData;
        //     tweetRow += tweetText + "\n";
        //   }
        // }
        // console.log(tweetRow)
        // 将res的内容通过post，header:x-api-key=123发送到http://localhost:3000/api/notion,需要解决跨域问题
        var data = {
          tag: tags,
          twtter_data: res
        };
        fetch("https://www.posttonotion.com/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apikey,
          },
          body: JSON.stringify(data),
        })
          .then((response) => {
            // 处理响应
            console.log(response);
            showSuccessNotification();  // 添加这一行来显示成功通知
          })
          .catch((error) => {
            // 处理错误
            console.error(error);
          });

        // 处理响应
        // console.log(response);
        showSuccessNotification();  // 添加这一行来显示成功通知
      })
      .catch((error) => {
        // 处理错误
        console.error(error);
      });
  }).catch((error) => {
    console.error("Error getting request headers:", error);
  });
  // // const apikey: String = (await storage.get("apikey")) ?? "";
  // console.log(tags);
  // var data = {
  //   twitter_url: text,
  //   tags: tags,
  // };
  //
  // fetch("https://api.posttonotion.com/notion/post", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     apikey: apikey,
  //   },
  //   body: JSON.stringify(data),
  // })
  //   .then((response) => {
  //     // 处理响应
  //     console.log(response);
  //     showSuccessNotification();  // 添加这一行来显示成功通知
  //   })
  //   .catch((error) => {
  //     // 处理错误
  //     console.error(error);
  //   });
};

// 新增函数：显示提交成功的通知
const showSuccessNotification = () => {
  // 创建一个 div 元素来作为通知
  const notificationDiv = document.createElement("div");
  notificationDiv.innerHTML = "Submission successful";
  notificationDiv.style.position = "fixed";
  notificationDiv.style.bottom = "20px";
  notificationDiv.style.left = "20px";
  notificationDiv.style.backgroundColor = "green";
  notificationDiv.style.color = "white";
  notificationDiv.style.padding = "10px";
  notificationDiv.style.borderRadius = "5px";
  notificationDiv.style.zIndex = "10000";

  // 将通知添加到页面上
  document.body.appendChild(notificationDiv);

  // 3秒后移除通知
  setTimeout(() => {
    document.body.removeChild(notificationDiv);
  }, 3000);
};

// 新增函数：显示提交成功的通知
const showErrorNotification = (msg) => {
  // 创建一个 div 元素来作为通知
  const notificationDiv = document.createElement("div");
  notificationDiv.innerHTML = msg;
  notificationDiv.style.position = "fixed";
  notificationDiv.style.bottom = "20px";
  notificationDiv.style.left = "20px";
  notificationDiv.style.backgroundColor = "red";
  notificationDiv.style.color = "white";
  notificationDiv.style.padding = "10px";
  notificationDiv.style.borderRadius = "5px";
  notificationDiv.style.zIndex = "10000";

  // 将通知添加到页面上
  document.body.appendChild(notificationDiv);

  // 3秒后移除通知
  setTimeout(() => {
    document.body.removeChild(notificationDiv);
  }, 3000);
};
