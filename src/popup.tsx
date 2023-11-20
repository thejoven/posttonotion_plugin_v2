import React from 'react';
import { ConfigProvider, Tabs } from 'antd';
import dayjs from 'dayjs';
import zhCN from 'antd/locale/zh_CN';

import { PopupFooter } from './components';

import './popup.scss';
import 'antd/dist/reset.css';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

function Popup() {
	console.log('popup');
	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: '#fb7299',
					colorSuccess: '#52c41a',
					colorWarning: '#faad14',
					colorError: '#f5222d',
				},
			}}
			locale={zhCN}
		>
			<div className='main'>
				<div className='main_text'>
					<h1>post to notion v1.0</h1>
				</div>
				<PopupFooter></PopupFooter>
			</div>
		</ConfigProvider>
	);
}

export default Popup;
