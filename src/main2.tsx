import { StyleProvider } from "@ant-design/cssinjs"
import Button from "antd/es/button"
import Avatar from "antd/es/avatar"
import Drawer from "antd/es/Drawer"
import antdResetCssText from "data-text:antd/dist/reset.css"
import type { PlasmoCSConfig,   PlasmoGetInlineAnchorList } from "plasmo"
import logoImage from "data-base64:~/assets/icon2.png"
import { ThemeProvider } from "~theme"
import { useState } from 'react';

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"],
}



// Idea for an UI API, for popup, notification badge, or mounting UI
// Idea for static mount
// Idea for styling injection support (inline or with custom emotion cache)
/*
export const getRootContainer = () => {
  return document.querySelector("#feature")
}*/

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll('div[class="css-175oi2r r-18u37iz r-1h0z5md r-1wron08"]')

/*
export const getShadowHostId: PlasmoGetShadowHostId = ({ element }) =>
  element.getAttribute("data-custom-id") + `-pollax-iv`*/

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = antdResetCssText
  return style
}

const main2Overlay = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  
  const onClose = () => {
    setOpen(false);
  };


  return (
    <ThemeProvider>
     <a href="#" target="_blank">
        Post
      </a>
    </ThemeProvider>
  )
}

export default main2Overlay





