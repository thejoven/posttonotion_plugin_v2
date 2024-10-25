  import type { PlasmoMessaging } from "@plasmohq/messaging"
  
  const handler: PlasmoMessaging.MessageHandler = async (req) => {
    chrome.tabs.create({ url: 'options.html' });
  }
  export default handler  