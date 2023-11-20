import React, { useEffect } from 'react';
import { useStorage } from '@plasmohq/storage/hook';
import { Form, Input, Switch } from 'antd';

export const MainSetting: React.FC = () => {
	const [isFloatRow, setIsFloatRow] = useStorage('isFloatRow', true);
	const [getApiKey, setApikey] = useStorage('apikey');
	const [getTags, setTags] = useStorage('tags');
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue({
			tags: getTags,
		});
		form.setFieldsValue({
			apikey: getApiKey,
		});
	}, [getTags,getApiKey, form]);

	return (
		<>
			<Form
				form={form}
				labelCol={{
					style: {
						minWidth: '250px',
					},
				}}
				labelWrap
				labelAlign={'left'}
				size={'middle'}
			>
				<Form.Item
					label={'悬浮窗开关'}
					name={'isFloatRow'}
				>
					<Switch
						checked={isFloatRow}
						onClick={(checked) => {
							setIsFloatRow(checked);
						}}
					></Switch>
				</Form.Item>
				<Form.Item
					label={'Apikey'}
					name={'apikey'}
					extra={<span style={{ fontSize: '8px' }}>请输入登陆后的APIKEY,一般为fkt为开头</span>}
				>
					<Input
						placeholder={'请输入您的 Apikey'}
						value={getApiKey}
						onChange={(e) => {
							setApikey(e.target.value);
						}}
					/>
				</Form.Item>
				<Form.Item
					label={'常用标签'}
					name={'tags'}
					extra={<span style={{ fontSize: '8px' }}>使用逗号,分隔</span>}
				>
					<Input.TextArea
						placeholder={'请输入您常用的标签'}
						value={getTags}
						onChange={(e) => {
							const value = e.target.value.replace(/，/g, ',');
							setTags(value);
						}}
					/>
				</Form.Item>
			</Form>
		</>
	);
};