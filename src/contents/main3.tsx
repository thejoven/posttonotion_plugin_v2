import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"
import styleText from "data-text:~style.css"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, CircleX  } from 'lucide-react'
import React, { useState, useEffect, useRef  } from 'react';
import logoImage from "data-base64:~/assets/icon.png"
import { callAPI_getSetting } from "~api"
import { myStorage } from "~store"
import "~style.css"
import { SquareUserRound } from "lucide-react"
import { sendToBackground } from "@plasmohq/messaging"


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

const MainOverlay = () => {
  const [items, setItems] = useState<string[]>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPressed, setIsPressed] = useState(false)
  const [sentStates, setSentStates] = useState<{ [key: number]: SendStatus }>({});
  const [isFullyExpanded, setIsFullyExpanded] = useState(false)
  enum SendStatus {
    Idle = 0,
    Sending = 1,
    Success = 2,
    Failed = 3
  }
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const tweetRegex = /^https:\/\/x\.com\/[^/]+\/status\/\d+$/;

  const {
    apiKey,
    setTags,
    tags
  } = myStorage();

  useEffect(() => {
    setSentStates({})
    if(apiKey || tags){
       getTags();
    }else{
      setItems(null)
    }
  }, [apiKey,tags]);

    
  const getTags = async() => {
      if(!apiKey){
          return
      }
      const data = await callAPI_getSetting(apiKey);
      if(!data['error']){
        if(data['setting'] && data['setting']['user_tag_list']){
          setTags(data['setting']['user_tag_list']);
          setItems(data['setting']['user_tag_list'].split(','));
        }
      }
  };

  const expandTransition = {
    type: "spring",
    stiffness: 500,
    damping: 40,
    mass: 0.8
  }
  
  const handlePress = () => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 100)
  }
  
  const tagOnClick  = (tag:string, index:number) => {
      var currentUrl = window.location.href;
      var isTweetPage = tweetRegex.test(currentUrl);
      if(!isTweetPage){
        showErrorNotification(chrome.i18n.getMessage("sub_err"));
        return
      }
      copytToNoion(tag,index);
  }
      

const copytToNoion = async (tag:string, index:number) => {


  setSentStates(prevState => ({
    ...prevState,
    [index]: SendStatus.Sending
  }));

  
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
                ChangStates(index,SendStatus.Failed);
                showErrorNotification(result['error']);
              }else{
                ChangStates(index,SendStatus.Success);
                showSuccessNotification();
              }
            })
          })
          .catch((error) => {
            ChangStates(index,SendStatus.Failed);
            console.error("Error getting request:", error);
          });
        // showSuccessNotification();  // 添加这一行来显示成功通知
      })
      .catch((error) => {
        // 处理错误
        ChangStates(index,SendStatus.Failed);
        console.error(error);
      });
  }).catch((error) => {
    ChangStates(index,SendStatus.Failed);
    console.error("Error getting request headers:", error);
  });

};

const ChangStates = (i:number,v:SendStatus) => {
  setSentStates(prevState => ({
    ...prevState,
    [i]: v
  }));
  setTimeout(() => {
    setSentStates(prevState => {
      const newState = { ...prevState };
      if(!newState[i])
        return newState;
      
      delete newState[i];
      return newState;
    });
  }, 1500);
}

const generateSearchText = (item): string => {
  // 使用首字母作为检索文字
  return item.charAt(0);
}
// 新增函数：显示提交成功的通知
const showSuccessNotification = () => {
  // 创建一个 div 元素来作为通知
  const notificationDiv = document.createElement("div");
  notificationDiv.innerHTML = chrome.i18n.getMessage("sub_successful");
  notificationDiv.style.position = "fixed";
  notificationDiv.style.bottom = "20px";
  notificationDiv.style.left = "40px";
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
  notificationDiv.style.left = "40px";
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
  <div className=" flex items-center justify-start min-h-screen">
    <motion.nav 
      className={`fixed bottom-20 left-10  bg-white shadow-lg p-2 transition-all duration-200 ease-in-out rounded-2xl flex flex-col ${
          isPressed ? 'scale-95 shadow-md' : 'scale-100 shadow-lg'
      }`}
      initial={false}
      animate={{
        width: isExpanded ? '240px' : '60px',
      }}
      transition={expandTransition}
      onMouseDown={handlePress}
      onTouchStart={handlePress}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false)
        setIsFullyExpanded(false)
      }}
      onAnimationComplete={() => {
        if (isExpanded) {
          setIsFullyExpanded(true)
        }
      }}
      style={{  width:'60px' }} 
    >
      <ul className="flex flex-col space-y-2 flex-grow">
        { !apiKey ? 
        (
          <li>
            <motion.button 
              className={`w-full h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center overflow-hidden ${
                isExpanded ? 'justify-between px-3' : 'justify-center'
              }`}
              whileHover={{ backgroundColor: "#f3f4f6" }}
              onClick={()=>sendToBackground({name: "nav"})}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isFullyExpanded ? (
                  <motion.span
                  key="full"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.1 }}
                  className="text-gray-600 font-semibold text-sm whitespace-nowrap"
                >
                  {chrome.i18n.getMessage("login_login")}
                </motion.span>
              ) : (
                <motion.span
                  key="letter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-gray-600 font-semibold text-sm"
                >
                  <SquareUserRound />
                </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </li>
        ) :(
          <li>
          <motion.button 
            className={`w-full h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center overflow-hidden ${
              isExpanded ? 'justify-between px-3' : 'justify-center'
            }`}
            whileHover={{ backgroundColor: "#f3f4f6" }}
            onClick={()=>tagOnClick("auto_ai_posttonotion",-1)}
            disabled={sentStates[-1]?true:false}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isFullyExpanded ? (
                <motion.span
                key="full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.1 }}
                className="text-gray-600 font-semibold text-sm whitespace-nowrap"
              >
                ✨{chrome.i18n.getMessage("tag_ai")}
              </motion.span>
            ) : (
              <motion.span
                key="letter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="text-gray-600 font-semibold text-sm"
              >
                ✨{generateSearchText(chrome.i18n.getMessage("tag_ai"))}
              </motion.span>
              )}
            </AnimatePresence>
            {isFullyExpanded && sentStates[-1] && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="pointer-events-none"
                  >
                     {sentStates[-1] === SendStatus.Sending &&  <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> || 
                      sentStates[-1] === SendStatus.Success && <CheckCircle2 className="w-5 h-5 text-green-500" /> || 
                      sentStates[-1] === SendStatus.Failed &&  <CircleX className="w-5 h-5 text-red-500" />}   
                  </motion.span>
              )}
          </motion.button>
        </li>
        )}
        



        
        {items?.map((item, index) => (           
            <li key={index}>
              <motion.button 
                className={`w-full h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center overflow-hidden ${
                  isExpanded ? 'justify-between px-3' : 'justify-center'
                }`}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={()=>tagOnClick(item,index)}
                disabled={sentStates[index]?true:false}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isFullyExpanded ? (
                    <motion.span
                    key="full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.1 }}
                    className="text-gray-600 font-semibold text-sm whitespace-nowrap"
                  >
                    {item}
                  </motion.span>
                ) : (
                  <motion.span
                    key="letter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-gray-600 font-semibold text-sm"
                  >
                    {generateSearchText(item)}
                  </motion.span>
                  )}
                </AnimatePresence>
                
                {isFullyExpanded && sentStates[index] && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="pointer-events-none"
                  >
                     {sentStates[index] === SendStatus.Sending &&  <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> || 
                      sentStates[index] === SendStatus.Success && <CheckCircle2 className="w-5 h-5 text-green-500" /> || 
                      sentStates[index] === SendStatus.Failed &&  <CircleX className="w-5 h-5 text-red-500" />}   
                  </motion.span>
                )}
              </motion.button>
            </li>
          ))}
      </ul>
      <motion.div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center" style={{ height: '40px' }} >
        <AnimatePresence mode="wait">
            <motion.div key="logo" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex text-gray-600 font-semibold text-sm space-x-3">
              <img src={logoImage} alt="PostToNotion Logo" width={20} height={20}  className="w-6 h-6"/>
              {isFullyExpanded && <span className="truncate">Post to notion</span>}
            </motion.div>         
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  </div>
  );
};

export default MainOverlay

