import LoginView from "~views/loginView"
import InfosView from "~views/infosView"

import { myStorage } from "~store"
import { useEffect, useState } from "react"
import { BaseViewProvider } from "~baseView"

function IndexOptions() {
  const [isLogin, setLogins] = useState(false)
  const myStor = myStorage()
  useEffect(() => {
      if(myStor.apiKey && myStor.userInfo){
        setLogins(true);
      }else{
        setLogins(false);
      }
    }
  )

  return (
    <BaseViewProvider>
        {isLogin? <InfosView/> : <LoginView />}        
    </BaseViewProvider>
  )
}

export default IndexOptions
