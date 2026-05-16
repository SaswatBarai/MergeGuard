import Conf from 'conf';

interface Config {
  apiKey?: string;
  apiUrl: string;
}

const schema: any = {
  apiKey: {
    type: 'string',
  },
  apiUrl: {
    type: 'string',
    default: process.env.MERGEGUARD_API_URL || 'http://localhost:3000',
  },
};

const config = new Conf<Config>({
  projectName: 'mergeguard',
  schema,
});

export const getApiKey = () => config.get('apiKey');
export const setApiKey = (key: string) => config.set('apiKey', key);

export const getApiUrl = () => config.get('apiUrl');
export const setApiUrl = (url: string) => config.set('apiUrl', url);

export const clearConfig = () => config.clear();
