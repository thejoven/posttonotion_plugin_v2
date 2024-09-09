import LoginView from "~views/loginView"
import InfosView from "~views/infosView"

import { ThemeProvider } from "~theme"
import { myStorage } from "~store"
import { useEffect, useState } from "react"

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
    <ThemeProvider>
        {isLogin? <InfosView/> : <LoginView />}        
    </ThemeProvider>
  )
}

export default IndexOptions
