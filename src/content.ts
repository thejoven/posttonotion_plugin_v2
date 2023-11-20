import type { PlasmoCSConfig } from "plasmo";
import { Storage } from "@plasmohq/storage";

// import { API, log } from "./utils";

export {};

const storage = new Storage();

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"],
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
    setInterval(listenTwitterDetailsMain, 3000);
  // document.body.style.background = "pink"
});

const listenTwitterDetailsMain = async () => {
    const isFloatRow: Boolean = (await storage.get("isFloatRow")) ?? false;
    const tags: String = (await storage.get("tags")) ?? "";
    const apikey: String = (await storage.get("apikey")) ?? "";
    var currentUrl = window.location.href;
    var tweetRegex = /^https:\/\/twitter\.com\/[^/]+\/status\/\d+$/;
    var isTweetPage = tweetRegex.test(currentUrl);
    var postToNotionDiv = document.getElementById("posttonotion");
    var topLevelElement = document.querySelector('body > div');

    if (isTweetPage && isFloatRow && tags) {
        // 根据tags生成按钮
        var tagsArray = tags.split(",");
        var buttonContainer = document.createElement("div");

        buttonContainer.addEventListener("mouseover", () => {
          buttonContainer.style.bottom = "0";
          postToNotionDiv.style.opacity = ".4";
        });
        buttonContainer.id = "posttonotion";
        buttonContainer.style.display = "flex";
        buttonContainer.style.flexDirection = "column";
        buttonContainer.style.position = "fixed";
        buttonContainer.style.bottom = "20px";
        buttonContainer.style.left = "20px";
        buttonContainer.style.zIndex = "9999";
        buttonContainer.style.listStyle = "none";
        buttonContainer.style.transition = "all .3s ease 0s";
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
                    copytonoion(apikey, pageUrl, tag);
                };
            })(tag));
            buttonContainer.appendChild(button);
        }
        var bottom = tagsArray.length * 40
        buttonContainer.style.bottom = "-"+bottom+"px";
        buttonContainer.addEventListener("mouseout", () => {
          buttonContainer.style.bottom = "-"+bottom+"px";
          postToNotionDiv.style.opacity = "1";
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



const copytonoion = async (apikey, text, tags) => {
  // const apikey: String = (await storage.get("apikey")) ?? "";
  console.log(tags);
  var data = {
    twitter_url: text,
    tags: tags,
  };

  fetch("https://api.posttonotion.com/notion/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apikey,
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
};

// 新增函数：显示提交成功的通知
const showSuccessNotification = () => {
  // 创建一个 div 元素来作为通知
  const notificationDiv = document.createElement("div");
  notificationDiv.innerHTML = "提交成功";
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
