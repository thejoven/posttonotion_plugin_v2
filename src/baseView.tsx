import type { ReactNode } from "react"
import logoImage from "data-base64:~/assets/icon.png"
import "~style.css"
import { Toaster } from "@/components/ui/toaster"
import '~baseView.scss'

export const BaseViewProvider = ({ children = null as ReactNode }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    <div className="space-y-3">
      <div className="flex items-center justify-center space-x-4">
        <img src={logoImage} alt="Post to Notion Logo" width={48} height={48} className="w-12 h-12"/>
        <h2 className="text-3xl font-bold">Post to Notion</h2>
      </div>
      <p className="text-center mt-2 text-sm text-gray-600">{chrome.i18n.getMessage("login_subtitle")}</p>
    </div>
    
      {children}
  
  </div>
  <div className="mt-2">
    <div className="footer text-center text-sm text-gray-500">
      <a href="https://www.posttonotion.com" target="_blank">Posttonotion.com</a>
    </div>
  </div>
  <Toaster/>
</div>
)