import React, { useState } from 'react';
import { callAPI_getSetting,callAPI_getUserInfo } from "~api"
import { myStorage } from "~store"
import "~style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendToBackground } from "@plasmohq/messaging"
import { showAlertAbove } from '~showAlert';

function LoginView() {
  const { toast } = useToast()
  const [loadings, setLoadings] = useState<boolean>(false);
  const [loadingsKey, setLoadingsKey] = useState<boolean>(false);
  const [key, setkey] = useState('');  
  const {
    setUserInfo,
    setApiKey
  } = myStorage();

  const onFinish = async() => {
    if(!key){
      toast({description: chrome.i18n.getMessage("login_apikey"),variant: "destructive"});
      return;
    }
    setLoadings(true);
    const data = await callAPI_getSetting(key);
    if(!data['error']){
      setApiKey(key);
      if(data['user']){
        setUserInfo({
          avatar: data['user']['avatar'],
          username: data['user']['username'],
          email: data['user']['email']
        });
      }
    }else{
      toast({description: data['error'],variant: "destructive"});
    }
    setTimeout(() => {
      setLoadings(false);
    }, 500);

  };

  const register = () => {
    window.open('https://www.posttonotion.com/login');
  }

  const getApikey = async () => {    
    setLoadingsKey(true);
    const resp = await sendToBackground({
      name: "ping",
    })
    if (resp) {
      const data = await callAPI_getUserInfo(resp);
      if(data['user']){
        console.log(data['user']['apiKey']);
        setkey(data['user']['apiKey']);
      }
    }else{
   
      showAlertAbove('btn_reg', chrome.i18n.getMessage("tip_login"));
      toast({description:chrome.i18n.getMessage("get_key_err") ,variant: "destructive"});
    }
    setLoadingsKey(false);
   
  }




  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setkey(event.target.value);
  };

  
  return ( 
        <Card>
          <CardContent className="pt-8 mt-4 space-y-6">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="text" placeholder={chrome.i18n.getMessage("login_apikey")} value={key}  onChange={handleInputChange}/>
              <Button variant="outline" onClick={getApikey}>
                {loadingsKey && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                {chrome.i18n.getMessage("get_key")} </Button>
            </div>
            <Button className="w-full bg-black text-white hover:bg-gray-800" disabled={loadings}  onClick={onFinish}>
              {loadings && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
              {chrome.i18n.getMessage("login_login")}              
            </Button>
            <Button id="btn_reg" variant="outline" className="w-full" onClick={register}>{chrome.i18n.getMessage("login_reg")}</Button>
          </CardContent>
        </Card>    
  );
  
}

export default LoginView
