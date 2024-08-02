import React, { ReactNode, useMemo } from 'react';
import { Card, Typography, Divider } from 'antd';
import { Route, Routes, useLocation } from 'react-router-dom';

import { MainSetting, Register, UserSetting } from '~pages';

import './Content.scss';

const { Title } = Typography;

const cardStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	borderRadius: '10px',
	boxShadow: '0px 2px 8px 0px rgba(99, 99, 99, 0.1)',
};

const cardBodyStyle: React.CSSProperties = {
	padding: '20px 25px',
};

interface routerIndex {
	key: string,
	isIndex?: boolean,
	isShow?: boolean,
	label?: ReactNode,
	url?: string,
	render: ReactNode,
}

export const routerConfig: routerIndex[] = [
	{
		key: 'main-setting',
		label: 'Setting',
		render: <MainSetting />,
		isShow: true
	},
	// {
	// 	key: 'user-setting',
	// 	label: '个人账号',
	// 	render: <UserSetting />,
	// 	isShow: true
	// },
	// {
	// 	key: 'user-register',
	// 	label: '注册账号',
	// 	render: <Register />,
	// 	isShow: false
	// },
	{
		key: '*',
		render: <MainSetting />,
	},
];

export const Content: React.FC = () => {
	const { pathname } = useLocation();
	const title = useMemo(() => {
		const formatPath = pathname.slice(1);
		if (formatPath === '') {
			return routerConfig[0].label;
		}
		return (routerConfig.find(item => item.key === formatPath))?.label ?? 'NotFind';
	}, [pathname]);
	return (
		<div className='option-content'>
			<div className='option-card'>
				<Card style={cardStyle} bodyStyle={cardBodyStyle}>
					<Title level={2} >{title}</Title>
					<Divider />
					<Routes>
						{
							routerConfig.map(item => (
								<Route
									key={item.key}
									index={item.isIndex ?? false}
									element={item.render}
									path={!item.isIndex ? `${item.key !== '*' ? '/' : ''}${item.key}` : undefined}
								/>
							))
						}
					</Routes>
				</Card>
			</div>
		</div>
	);
};
