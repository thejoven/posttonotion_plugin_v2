import React, { useState } from 'react';
import { callAPI_getSetting } from "~api"
import { myStorage } from "~store"
import "~style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function LoginView() {
  const { toast } = useToast()
  const [loadings, setLoadings] = useState<boolean>(false);
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setkey(event.target.value);
  };

  
  return ( 
        <Card>
          <CardContent className="pt-8 mt-4 space-y-6">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input type="text" placeholder={chrome.i18n.getMessage("login_apikey")} className="pl-10" onChange={handleInputChange}/>
              </div>
              <Button className="w-full bg-black text-white hover:bg-gray-800" disabled={loadings}  onClick={onFinish}>
                {loadings && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                {chrome.i18n.getMessage("login_login")}                
              </Button>
              <Button variant="outline" className="w-full" onClick={register}>{chrome.i18n.getMessage("login_reg")}</Button>
          </CardContent>
        </Card>    
  );
  
}

export default LoginView
