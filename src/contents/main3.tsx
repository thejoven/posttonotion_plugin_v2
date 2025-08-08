import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"
import styleText from "data-text:~style.css"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, CircleX  } from 'lucide-react'
import React, { useState, useEffect, useRef  } from 'react';
import logoImage from "data-base64:~/assets/icon.png"
import "~style.css"
import { SquareUserRound } from "lucide-react"
import { sendToBackground } from "@plasmohq/messaging"
import { 
  authService, 
  apiService, 
  notificationService,
  SendStatus,
  type AuthState,
  type PostToNotionData,
  isTweetPage,
  getCurrentUrl,
  getUserLanguage,
  extractTweetId,
  generateSearchText,
  UI_CONFIG
} from "~services"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"],
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
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: null,
    userInfo: null,
    tags: null,
    authMethod: null
  });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadAuthState = async () => {
      const state = await authService.getAuthState();
      if (mounted) {
        setAuthState(state);
        
        if (state.isAuthenticated && state.tags) {
          setItems(state.tags.split(','));
        } else if (state.isAuthenticated) {
          await refreshTags();
        } else {
          setItems(undefined);
        }
      }
    };

    const handleAuthStateChange = (newState: AuthState) => {
      if (mounted) {
        setAuthState(newState);
        
        if (newState.isAuthenticated && newState.tags) {
          setItems(newState.tags.split(','));
        } else {
          setItems(undefined);
        }
      }
    };

    setSentStates({});
    loadAuthState();
    authService.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  const refreshTags = async () => {
    if (!authState.apiKey) return;
    
    try {
      const refreshed = await authService.refreshAuth();
      if (refreshed) {
        const updatedState = await authService.getAuthState();
        if (updatedState.tags) {
          setItems(updatedState.tags.split(','));
        }
      }
    } catch (error) {
      console.error('Failed to refresh tags:', error);
    }
  };

  const expandTransition = UI_CONFIG.ANIMATION.SPRING;
  
  const handlePress = () => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 100)
  }
  
  const tagOnClick = (tag: string, index: number) => {
    const currentUrl = getCurrentUrl();
    const isValidTweet = isTweetPage(currentUrl);
    
    if (!isValidTweet) {
      notificationService.error(chrome.i18n.getMessage("sub_err") || "Please visit a tweet page");
      return;
    }
    
    postToNotion(tag, index);
  };

  const postToNotion = async (tag: string, index: number) => {
    if (!authState.apiKey) {
      notificationService.error(chrome.i18n.getMessage("key") || "Please login first");
      return;
    }

    setSentStates(prevState => ({
      ...prevState,
      [index]: SendStatus.Sending
    }));

    try {
      const currentUrl = getCurrentUrl();
      const tweetId = extractTweetId(currentUrl);
      
      if (!tweetId) {
        changeSendState(index, SendStatus.Failed);
        notificationService.error("Could not extract tweet ID");
        return;
      }

      const twitterData = await getTweetData();
      
      if (!twitterData) {
        changeSendState(index, SendStatus.Failed);
        notificationService.error("Could not fetch tweet data");
        return;
      }

      const postData: PostToNotionData = {
        tag: tag,
        twtter_data: twitterData,
        language_str: getUserLanguage()
      };

      const result = await apiService.postToNotion(postData, authState.apiKey);
      
      if (result.error) {
        changeSendState(index, SendStatus.Failed);
        notificationService.error(result.error);
      } else {
        changeSendState(index, SendStatus.Success);
        notificationService.success(chrome.i18n.getMessage("sub_successful") || "Successfully posted to Notion!");
      }
    } catch (error) {
      changeSendState(index, SendStatus.Failed);
      notificationService.error("Failed to post to Notion");
      console.error("Post to Notion error:", error);
    }
  };

  const getTweetData = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getRequestHeaders" }, (headers) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        chrome.runtime.sendMessage({ action: "getLatestTweetDetailUrl" }, (response) => {
          if (!response) {
            reject(new Error("No TweetDetail URL found"));
            return;
          }

          fetch(response.toString(), {
            method: "GET",
            headers: headers,
          })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => reject(error));
        });
      });
    });
  };

  const changeSendState = (index: number, status: SendStatus) => {
    setSentStates(prevState => ({
      ...prevState,
      [index]: status
    }));
    
    setTimeout(() => {
      setSentStates(prevState => {
        const newState = { ...prevState };
        if (newState[index]) {
          delete newState[index];
        }
        return newState;
      });
    }, 1500);
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
          { !authState.isAuthenticated ? 
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
                    {chrome.i18n.getMessage("login_login") || "Login"}
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
          ) : (
            <>
              <li>
                <motion.button 
                  className={`w-full h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center overflow-hidden ${
                    isExpanded ? 'justify-between px-3' : 'justify-center'
                  }`}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={()=>tagOnClick("auto_ai_posttonotion",-1)}
                  disabled={!!sentStates[-1]}
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
                      ✨{chrome.i18n.getMessage("tag_ai") || "AI Tag"}
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
                      ✨{generateSearchText(chrome.i18n.getMessage("tag_ai") || "AI")}
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

              {items?.map((item, index) => (           
                  <li key={index}>
                    <motion.button 
                      className={`w-full h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center overflow-hidden ${
                        isExpanded ? 'justify-between px-3' : 'justify-center'
                      }`}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={()=>tagOnClick(item,index)}
                      disabled={!!sentStates[index]}
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
            </>
          )}
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