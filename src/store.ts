import { useStorage } from '@plasmohq/storage/hook';


export const myStorage = () => {
  const [isLoading, setIsLoading] = useStorage('loading');
  const [isLogin, setLogin] = useStorage('loading');
  const [userInfo, setUserInfo] = useStorage('userinfo');
  const [apiKey, setApiKey] = useStorage('apikey');
  const [tags, setTags] = useStorage('tags');

  return {
    isLoading,
    userInfo,
    apiKey,
    tags,
    isLogin,
    setIsLoading,
    setUserInfo,
    setApiKey,
    setTags,
    setLogin
  };
};