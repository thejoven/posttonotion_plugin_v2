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
    // 获取最新的 TweetDetail URL
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getLatestTweetDetailUrl" }, (response) => {
        if (response) {
          // 从 URL 中提取 tweetId
          const urlParams = new URLSearchParams(response.split('?')[1]);
          const variables = JSON.parse(decodeURIComponent(urlParams.get('variables') || '{}'));
          const tweetId = variables.focalTweetId;

          // 使用获取到的 URL 发送请求
          fetch(response.toString(), {
            method: "GET",
            headers: headers,
          })
            .then((response) => response.json())
            .then((data) => {
              resolve(data);
            })
            .catch((error) => {
              ChangStates(index, SendStatus.Failed);
              console.error(error);
              reject(error);
            });
        } else {
          reject(new Error("No TweetDetail URL found"));
        }
      });
    });
  })
  .then((data) => {
    // 处理成功响应
    ChangStates(index, SendStatus.Success);
  })
  .catch((error) => {
    ChangStates(index, SendStatus.Failed);
    console.error("Error:", error);
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

