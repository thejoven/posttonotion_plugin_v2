import React, { useEffect, useState  } from 'react';
import { myStorage } from "~store"
import { callAPI_getSetting } from "~api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, Settings, Headphones, LogOut } from "lucide-react"
import { showAlertAbove } from '~showAlert';

function InfosView() {
  const {
    userInfo,
    apiKey,
    tags,
    setUserInfo,
    setApiKey,
    setTags
  } = myStorage();
  const onLogout = async (values: any) => {
    setApiKey(null);
    setUserInfo(null);
    setTags(null);
  };
  
  const [surl, setSurl] = useState('');  

  useEffect(() => {
    async function init() {
      if(!apiKey){
        return;
      }
      let isSetting = true;
      const data = await callAPI_getSetting(apiKey);
      if(!data['error']){
        if(data['user']){
            setUserInfo({
              avatar: data['user']['avatar'],
              username: data['user']['username'],
              email: data['user']['email']
            });
        }
        if(data['setting'] && data['setting']['user_tag_list']){
          setTags(data['setting']['user_tag_list']);
        }else{
          setTags(null);
          isSetting = false;
        }
        if(!data['notion_raw']){
          isSetting = false;
        }
        if(!isSetting){
          showAlertAbove('btn_setting', chrome.i18n.getMessage("tip_setting"));
          setSurl('?tutorial=1');
        }else{
          setSurl('');
        }
      }      
    }
    init()
  }, [apiKey])
  
  return (
        <Card  className="w-full max-w-md p-6">
          <CardContent className="p-0 space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userInfo?userInfo.avatar:""} alt={userInfo?userInfo.username:""} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{`${chrome.i18n.getMessage("welcome")} ${userInfo?userInfo.username:""}`}</h2>
              <p className="text-sm text-gray-500">Email: {userInfo?userInfo.email:""}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" onClick={() => window.open('https://www.posttonotion.com/dashboard/home', '_blank') }>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_dashboard")}
                </Button>
                <Button id="btn_setting" variant="outline" className="w-full" onClick={() => window.open('https://www.posttonotion.com/dashboard/setting'+surl, '_blank')}>
                  <Settings className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_setting")}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.open('https://cooperative-sea-1e8.notion.site/tutorial-bd524f23d46546179291f9741a402f5a', '_blank') }>
                  <Headphones className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_tutorial")}
                </Button>
                <Button variant="outline" className="w-full" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_logout")}
                </Button>
            </div>
          </CardContent>
        </Card>   
  );
}

export default InfosView
