import React, { useState } from 'react';
import { Button, message, Form, Input, Card } from 'antd';
import logoImage from "data-base64:~/assets/icon.png"
import apikeyImage from "data-base64:~/assets/apikey.png"
import '~views/loginView.scss';
import Footer from '~/views/components/footer'
import { callAPI_getSetting } from "~api"
import { KeyOutlined } from '@ant-design/icons';
import { myStorage } from "~store"

function LoginView() {
  const [loadings, setLoadings] = useState<boolean>(false);
  //const [messageApi, contextHolder] = message.useMessage();
  //const mystorage = myStorage();

  // 增加一个方法让 login_reg 进行创建新的窗口进行注册
    const register = () => {
          window.open('https://www.posttonotion.com/login');
        }


  const {
    setUserInfo,
    setApiKey
  } = myStorage();

  const onFinish = async(values: any) => {
    setLoadings(true);

    const data = await callAPI_getSetting(values.ApiKey);
    if(!data['error']){
      setApiKey(values.ApiKey);
      if(data['user']){
        setUserInfo({
          avatar: data['user']['avatar'],
          username: data['user']['username'],
          email: data['user']['email']
        });
      }

    }else{
      message.error(data['error']);
    }

    setTimeout(() => {
      setLoadings(false);
    }, 500);

  };

  return (
    <div className="container">
      <div>

        <div>
          <div className="login-container">
            <span className="login-logo"><img alt="logo" src={logoImage} /></span>
            <span className="login-title">Post to Notion</span>
          </div>
          <div className="login-sub">{chrome.i18n.getMessage("login_subtitle")}</div>
        </div>
        <Card className="container-card">
        <Form
          name="login"
          initialValues={{ remember: true }}
          style={{ maxWidth: 400 }}
          onFinish={onFinish}
        >
          <Form.Item
            name="ApiKey"
            rules={[{ required: true, message: chrome.i18n.getMessage("login_apikey") }]}
          >
            <Input size="large" prefix={<KeyOutlined/>} placeholder={chrome.i18n.getMessage("login_apikey")} />
          </Form.Item>

          <Form.Item>
            <Button size="large" block type="primary" htmlType="submit" loading={loadings}>{chrome.i18n.getMessage("login_login")}</Button>
          </Form.Item>
          <Button size="large" block type="" onClick={register}>{chrome.i18n.getMessage("login_reg")}</Button>
        </Form>
        <Footer />
        </Card>

      </div>

    </div>
  );
}

export default LoginView
