import { StyleProvider } from "@ant-design/cssinjs"
import Typography  from "antd/es/typography"
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"
import logoImage from "data-base64:~/assets/icon.png"
import React, { useState, useEffect, useRef } from 'react';
const { Link } = Typography;
import styleText from "data-text:./main3.css"
import * as style from "./main3.css"
import { myStorage } from "~store"
import { callAPI_getSetting } from "~api"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"],
  //world: "MAIN"
}


const HOST_ID = "react-root"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

/*
window.addEventListener("load", () => {
  setInterval(function() {
    var currentUrl = window.location.href;
    var tweetRegex = /^https:\/\/x\.com\/[^/]+\/status\/\d+$/;
    var isTweetPage = tweetRegex.test(currentUrl);
    //document.getElementById("posttonotion").style.opacity = "0";
  }, 3000);
});*/


const MainOverlay = () => {

  const [items, setItems] = useState<string[]>();
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const tweetRegex = /^https:\/\/x\.com\/[^/]+\/status\/\d+$/;

  const {
    apiKey,
    setTags,
    tags
  } = myStorage();

  useEffect(() => {
    if(!items && tags && tags){
      setItems(tags.split(','))
    }
  }, [tags]);


  const handleExpands = async() => {
    if (!isExpanded) {
      /*if(!items && !tags){
        setItems(tags.split(','));
      }*/
      if(!apiKey){
          setIsExpanded(false);
          setTags("");
          showErrorNotification(chrome.i18n.getMessage("key"));
          return
      }
      setIsExpanded(true);
      const data = await callAPI_getSetting(apiKey);
      if(!data['error']){
        if(data['setting'] && data['setting']['user_tag_list']){
          setTags(data['setting']['user_tag_list']);
          setItems(data['setting']['user_tag_list'].split(','));
        }
      }
    }
  };

  const handleCloses = () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const tagOnClick  = (tag:string) => {
      handleCloses();
      var currentUrl = window.location.href;
      var isTweetPage = tweetRegex.test(currentUrl);
      if(!isTweetPage){
        showErrorNotification(chrome.i18n.getMessage("sub_err"));
        return
      }
      copytonoion(tag);
  }


const copytonoion = async (tags:string) => {
  var currentUrl = window.location.href;
  var newTweetId = currentUrl.match(/\d+$/);
  var tweetId = "";
  if (newTweetId) {
    tweetId = newTweetId[0];
  }
  const apikey: String = apiKey ?? "";
  if(apikey == "") {
    showErrorNotification(chrome.i18n.getMessage("key"));
    return
  }
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
    var url = `https://x.com/i/api/graphql/bFUhQzgl9zjo-teD0pAQZw/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${tweetId}%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%7D`;
    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((res) => {

        // 获取当前浏览器使用的语言：chrome.i18n.getUILanguage()
        var user_post_lange = chrome.i18n.getUILanguage();
        var data = {
          tag: tags,
          twtter_data: res,
          language_str: user_post_lange
        };
        fetch("https://www.posttonotion.com/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apikey
          },
          body: JSON.stringify(data),
        })
          .then((response) => {
            var result = response.json()
            result.then((result) => {
              if(result['error']){
                showErrorNotification(result['error']);
              }else{
                showSuccessNotification();
              }
            })
          })
          .catch((error) => {
            console.error(error);
          });
        // showSuccessNotification();  // 添加这一行来显示成功通知
      })
      .catch((error) => {
        // 处理错误
        console.error(error);
      });
  }).catch((error) => {
    console.error("Error getting request headers:", error);
  });

};


// 新增函数：显示提交成功的通知
const showSuccessNotification = () => {
  // 创建一个 div 元素来作为通知
  const notificationDiv = document.createElement("div");
  notificationDiv.innerHTML = chrome.i18n.getMessage("sub_successful");
  notificationDiv.style.position = "fixed";
  notificationDiv.style.bottom = "20px";
  notificationDiv.style.left = "64px";
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
  notificationDiv.style.left = "64px";
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


  return (
    <div id="posttonotion" className="floating-button-container" >
      <button ref={buttonRef}
        className={`floating-button ${isExpanded? 'expanded hovered' : 'breathing'}`}
        onMouseEnter={handleExpands}
      >
        <img src={logoImage} /> <div className="sp">Post to Notion</div>
      </button>
      {isExpanded && (

        <ul ref={menuRef} className="menu-items" onMouseLeave={handleCloses}>
          <li>
            <button onClick={() => tagOnClick("auto_ai_posttonotion")}>✨AI自动分类</button>
          </li>
          {items?.map((item, index) => (
              <li key={index}>
                <button onClick={() => tagOnClick(item)}>{item}</button>
            </li>
          ))}

          <li style={{height:'49px'}}></li>
        </ul>
      )}
    </div>
  );
};

export default MainOverlay





