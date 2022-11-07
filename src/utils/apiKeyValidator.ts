
const apiKeys = (process.env.API_KEYS || '').split('|');

const validateApiKey = (apikey:string) =>
{
  return apiKeys.includes(apikey);
}

export default validateApiKey;