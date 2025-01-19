import type { PlasmoMessaging } from "@plasmohq/messaging"
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const message = "await querySomeApi(req.body.id)"
    chrome.cookies.getAll({ domain: ".posttonotion.com" }, (cookies) => {
        let isExist = false
        if (cookies.length > 0) {
            for (let cookie of cookies) {
                if(cookie.name == "__Secure-next-auth.session-token"){
                    isExist = true
                    res.send(cookie.name + "= " + cookie.value)
                }
            }
        }
        if(!isExist){
            res.send(null)
        }
    })
  }
   
  export default handler

  /*
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("a77a")
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCookie") {
    chrome.cookies.get({ url: "https://www.posttonotion.com", name: request.cookieName }, (cookie) => {
      res.send(cookie ? cookie.value : null);
    })
    return true; // 保持消息通道打开，以便异步响应
  }else if (request.action === "getAllCookies") {
    chrome.cookies.getAll({ domain: ".posttonotion.com" }, (cookies) => {
      res.send(cookies);
    })
    return true;
  }/*else if (request.action === "getStorage") {
    getCookie(request.storageKey).then((value) => {
      sendResponse(value)
    })
    return true // 保持消息通道打开，以便异步响应
  }*
})

}

export default handler*/
