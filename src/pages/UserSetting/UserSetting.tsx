import React, { useEffect, useState } from 'react';
import { useStorage } from '@plasmohq/storage/hook';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

import './UserSetting.scss';

export const UserSetting: React.FC = () => {
	const [form] = Form.useForm();
	const [getFktToken, setfktToken] = useStorage('fktToken');
	const [getApiKey, setApikey] = useStorage('apikey');
	const [loading, setLoading] = useState(false);
	const [userInfo, setUserInfo] = useState<any>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const handleLogin = async (values: any) => {
		setLoading(true);
		try {
			const response = await axios.post('https://api.posttonotion.com/login', {
				username: values.username,
				password: values.password,
			});
			const { code, token } = response.data;
			if (code === 200) {
				setfktToken(token);
				setIsLoggedIn(true);
				message.success('Login successful');
				window.location.reload()
			} else {
				message.error('Login failed');
			}
		} catch (error) {
			message.error('Login failed');
		}
		setLoading(false);
	};

	const fetchUserInfo = async () => {
		try {
			if (userInfo) {
				setIsLoggedIn(true);
				return;
			}

			const response = await axios.get('https://api.posttonotion.com/system/user/profile', {
				headers: {
					Authorization: `Bearer ${getFktToken}`,
				},
			});
			if(response.code == 200){
				setUserInfo(response.data);
				setIsLoggedIn(true);
			}
		} catch (error) {
			message.error('Failed to fetch user information');
		}
	};

	useEffect(() => {
		form.setFieldsValue({ username: '', password: '' });
		if (getFktToken) {
			fetchUserInfo();
		}
	}, [getFktToken]);

	const handleLogout = () => {
		setfktToken('');
		setUserInfo('');
		setIsLoggedIn(false);
	};

	const handleBindNotion = async () => {
		try {
			const response = await axios.get('https://api.posttonotion.com/notion/bind', {
				headers: {
					Authorization: `Bearer ${getFktToken}`,
				},
			});
			const { msg } = response.data;
			window.open(msg, '_blank');
		} catch (error) {
			message.error('Failed to bind Notion');
		}
	};

	if (isLoggedIn) {
		return (
			<div className="user-setting">
				<h2>User Profile</h2>
				<p>账号: {userInfo.data.nickName}</p>
				<p>Apikey: {userInfo.data.apiKey}</p>
				<p>登陆日期: {userInfo.data.loginDate}</p>
				<p>
					<Button type="primary" onClick={handleBindNotion}>
						绑定 Notion
					</Button>
				</p>
				<p>
					<Button type="primary" onClick={handleLogout}>
						Logout
					</Button>
				</p>
			</div>
		);
	}

	return (
		<div className="user-setting">
			<Form form={form} onFinish={handleLogin}>
				<Form.Item
					name="username"
					label="账号"
					rules={[{ required: true, message: 'Please enter your username' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="password"
					label="密码"
					rules={[{ required: true, message: 'Please enter your password' }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" loading={loading}>
						登陆
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};
