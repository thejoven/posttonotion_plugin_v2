



export const callAPI_getSetting = async <T>(apikey: string, errorCallback?: (error: any) => void) => {
  return await callAPI('https://www.posttonotion.com/api/notion/setting', { method: 'GET' }, encodeURIComponent(apikey));
};
 


export const callAPI = async <T>( uri: string, opts: RequestInit, apikey: string) => {
  const headers = {
    'x-api-key' :  apikey,
    ...opts.headers
  };

  try {
    const response = await fetch(uri, {
      method: opts.method || 'GET',
      headers,
      ...opts
    });

    if (!response.ok && response.status !== 401) {
      const errorMessage = `Failed to fetch data: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json() as T;
  } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
  }
};