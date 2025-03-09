import { MissingEnvError } from '@common/errors/http-status.error';

const requiredEnvVariables: Record<string, string[]> = {
  common: [
    'NODE_ENV',
    'PORT',
    'IAM_SERVICE_URL',
    'IAM_SERVICE_API_KEY',
    'JWT_SECRET',
    'JWT_TOKEN_AUDIENCE',
    'JWT_TOKEN_ISSUER',
  ], // Required in all environments
  test: [], // Required only in test environment
  development: [], // Required in dev
  production: [], // Required in prod
};

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  const currentEnv = process.env.NODE_ENV || 'development';

  // Check if the variable is required in the current environment or in common
  const isRequired =
    requiredEnvVariables.common.includes(key) ||
    requiredEnvVariables[currentEnv]?.includes(key);

  // Throw an error only if the variable is required and truly undefined or null
  if (isRequired && (value === undefined || value === null)) {
    throw new MissingEnvError(key);
  }

  return value || '';
};

export default getEnvVariable;
