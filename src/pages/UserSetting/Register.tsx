import React, { useEffect, useState } from 'react';
import { useStorage } from '@plasmohq/storage/hook';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

import './UserSetting.scss';

export const Register: React.FC = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const handleRegister = async (values: any) => {
		setLoading(true);
		try {
			await axios.post('https://api.posttonotion.com/register', {
				username: values.username,
				password: values.password,
				email: values.email,
			});
			message.success('Registration successful');
		} catch (error) {
			message.error('Registration failed');
		}
		setLoading(false);
	};

	return (
		<div className="register">
			<Form form={form} onFinish={handleRegister}>
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
				{/*<Form.Item*/}
				{/*	name="email"*/}
				{/*	label="Email"*/}
				{/*	rules={[{ required: true, message: 'Please enter your email' }]}*/}
				{/*>*/}
				{/*	<Input />*/}
				{/*</Form.Item>*/}
				<Form.Item>
					<Button type="primary" htmlType="submit" loading={loading}>
						注册
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};
