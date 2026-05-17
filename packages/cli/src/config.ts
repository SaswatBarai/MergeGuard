import Conf from 'conf';

interface Schema {
  apiKey?: string;
  apiUrl: string;
  githubToken?: string;
}

const config = new Conf<Schema>({
  projectName: 'mergeguard',
  schema: {
    apiKey:      { type: 'string' },
    githubToken: { type: 'string' },
    apiUrl:      { type: 'string', default: process.env.MERGEGUARD_API_URL ?? 'http://localhost:3000' },
  } as any,
});

export const getApiKey      = ()             => config.get('apiKey');
export const setApiKey      = (key: string)  => config.set('apiKey', key);
export const getApiUrl      = ()             => config.get('apiUrl');
export const setApiUrl      = (url: string)  => config.set('apiUrl', url);
export const getGithubToken = ()             => config.get('githubToken');
export const setGithubToken = (tok: string)  => config.set('githubToken', tok);
export const clearConfig    = ()             => config.clear();
