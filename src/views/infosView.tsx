import React, { useEffect } from 'react';
import { Button, message, Form, Input, Card, Avatar } from 'antd';
import logoImage from "data-base64:~/assets/icon.png"
import '~views/infosView.scss';
import Footer from '~/views/components/footer'
import { callAPI } from "~api"
import {CustomerServiceFilled, DashboardOutlined, LogoutOutlined, UngroupOutlined} from '@ant-design/icons';
import { myStorage } from "~store"
import { callAPI_getSetting } from "~api"

function InfosView() {
  const {
    userInfo,
    apiKey,
    setUserInfo,
    setApiKey,
    setTags
  } = myStorage();
  const onLogout = async (values: any) => {
    setApiKey("");
    setUserInfo(null);
    setTags("");
  };

  useEffect(() => {
    async function init() {
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
        }



      }
    }
    init()
  }, [apiKey])



  const actions: React.ReactNode[] = [
    <Button type="text" onClick={() => window.open('https://www.posttonotion.com/dashboard/home', '_blank') }><DashboardOutlined /> {chrome.i18n.getMessage("info_dashboard")}</Button>,
    <Button type="text" onClick={() => window.open('https://www.posttonotion.com/dashboard/setting', '_blank') }><UngroupOutlined /> {chrome.i18n.getMessage("info_setting")}</Button>
  ];

  return (
    <div className="container">
      <div>

        <div>
          <div className="info-container">
            <span className="info-logo"><img alt="logo" src={logoImage} /></span>
            <span className="info-title">Post to Notion</span>
          </div>
          <div className="info-sub">{chrome.i18n.getMessage("login_subtitle")}</div>
        </div>
        <Card className="container-card">


          <Card actions={actions} style={{ minWidth: 300, border: 'none' }}>
            <Card.Meta
              avatar={<Avatar src={userInfo?userInfo.avatar:""} />}
              title={`${chrome.i18n.getMessage("welcome")} ${userInfo?userInfo.username:""}`}
              description={
                <>
                  <p>Email: {userInfo?userInfo.email:""}</p>
                </>
              }
            />
          </Card>
          <div className="info-button">
            <Button type="text" onClick={() => window.open('https://cooperative-sea-1e8.notion.site/tutorial-bd524f23d46546179291f9741a402f5a', '_blank') }><CustomerServiceFilled></CustomerServiceFilled> {chrome.i18n.getMessage("info_tutorial")}</Button>
            <Button type="text" onClick={onLogout}><LogoutOutlined />{chrome.i18n.getMessage("info_logout")}</Button>
          </div>
          <Footer />

        </Card>
      </div>

    </div>
  );
}

export default InfosView
