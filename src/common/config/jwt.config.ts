import getEnvVariable from '@common/utils/env.util';

const jwtConfig = {
  secret: getEnvVariable('JWT_SECRET'),
  audience: getEnvVariable('JWT_TOKEN_AUDIENCE'),
  issuer: getEnvVariable('JWT_TOKEN_ISSUER'),
};

export default jwtConfig;
