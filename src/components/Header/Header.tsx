import React, { HTMLAttributeAnchorTarget, ReactNode } from 'react';

import logo from 'data-base64:~assets/icon512.png';

import './Header.scss';

export interface HeaderProps {
	name: string,
	url: string,
	icon?: ReactNode,
	target?: HTMLAttributeAnchorTarget,
}

export const Header: React.FC<{items: HeaderProps[]}> = ({ items }) => (
	<div className='header'>
		<div className='logo'>
			{/*<img className='img' src={logo} alt="tuntun-logo" />*/}
			<div className='title'>Post to notion</div>
		</div>
		<div className='content'>
			{
				items.map(item => (
					<a key={item.name} rel='noreferrer' target={item.target ?? '_blank'} className='item' href={item.url}>
						<div className='text'>{item.name}</div>
						{ item.icon ?
							<div className='icon' >
								{ item.icon }
							</div> : null }
					</a>
				))
			}
		</div>
	</div>
);
