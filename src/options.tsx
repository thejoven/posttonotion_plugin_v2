import React, { FC } from 'react';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { GithubOutlined, YoutubeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { Header, HeaderProps, SideBar } from '~components';
import {
	Content,
} from '~pages';

import './options.scss';
import 'antd/dist/reset.css';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const HeaderItems: HeaderProps[] = [
	{
		name: '官网',
		url: 'https://www.posttonotion.com/',
	},
];

const Options: FC = () => (
	<ConfigProvider
		theme={{
			token: {
				colorPrimary: '#860026',
				colorSuccess: '#52c41a',
				colorWarning: '#faad14',
				colorError: '#f5222d',
			},
		}}
		locale={zhCN}
	>
		<HashRouter>
			<Header items={HeaderItems}></Header>
			<SideBar></SideBar>
			<Content></Content>
		</HashRouter>
	</ConfigProvider>
);

export default Options;
