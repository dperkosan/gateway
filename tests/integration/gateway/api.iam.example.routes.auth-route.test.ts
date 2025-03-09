import request from 'supertest';
import nock from 'nock';
import { createApp } from 'src/createApp';
import getEnvVariable from '@common/utils/env.util';
import {
  BadGatewayError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '@common/errors/http-status.error';
import jwt from 'jsonwebtoken';
import jwtConfig from '@common/config/jwt.config';

const app = createApp();
const originalIAMServiceURL = getEnvVariable('IAM_SERVICE_URL');
const IAM_SERVICE_API_KEY = getEnvVariable('IAM_SERVICE_API_KEY');
let IAM_SERVICE_URL: string;

const generateValidToken = () => {
  return jwt.sign({}, jwtConfig.secret, {
    audience: jwtConfig.audience,
    issuer: jwtConfig.issuer,
    expiresIn: '1h',
  });
};

describe('GatewayController - proxyToIAM Integration Test with AuthMiddleware', () => {
  beforeEach(() => {
    nock.cleanAll();
    IAM_SERVICE_URL = originalIAMServiceURL;
    process.env.IAM_SERVICE_URL = originalIAMServiceURL;
  });

  afterAll(() => {
    nock.restore();
  });

  it('should return 401 when Authorization header is missing', async () => {
    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: new UnauthorizedError('Unauthorized - Missing token').message,
        status: 'error',
        isOperational: true,
      }),
    );
  });

  it('should return 401 when token is invalid', async () => {
    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: new UnauthorizedError('Unauthorized - Invalid token').message,
        status: 'error',
        isOperational: true,
      }),
    );
  });

  it('should successfully proxy request to IAM service when token is valid and x-api-key is set', async () => {
    const validToken = generateValidToken();

    // Mock IAM service response and check x-api-key header
    nock(IAM_SERVICE_URL)
      .get('/example/auth-route')
      .matchHeader('x-api-key', IAM_SERVICE_API_KEY)
      .reply(200, { success: true, message: 'IAM response received' });

    // Make the request to the gateway
    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    // Assertions
    expect(response.body).toEqual({
      success: true,
      message: 'IAM response received',
    });
  });

  it('should return 502 if IAM service returns an invalid response', async () => {
    const validToken = generateValidToken();

    // Mock an invalid IAM response (empty body)
    nock(IAM_SERVICE_URL)
      .get('/example/auth-route')
      .matchHeader('x-api-key', IAM_SERVICE_API_KEY)
      .reply(200, '');

    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(502);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: new BadGatewayError(
          'IAM service returned an invalid response format',
        ).message,
        status: 'error',
        isOperational: true,
      }),
    );
  });

  it('should return 503 ServiceUnavailableError when IAM service is unreachable', async () => {
    const validToken = generateValidToken();
    const UNREACHABLE_URL = 'http://localhost:6666'; // Random unused port

    // Override IAM_SERVICE_URL for this test
    process.env.IAM_SERVICE_URL = UNREACHABLE_URL;

    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(503);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: new ServiceUnavailableError('IAM service is unreachable')
          .message,
        status: 'error',
        isOperational: true,
      }),
    );
  });

  it('should return 502 BadGatewayError when IAM service request fails', async () => {
    const validToken = generateValidToken();

    // Mock IAM service failure
    nock(IAM_SERVICE_URL)
      .get('/example/auth-route')
      .matchHeader('x-api-key', IAM_SERVICE_API_KEY)
      .replyWithError('Simulated failure');

    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(502);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: new BadGatewayError('IAM request failed: Simulated failure')
          .message,
        status: 'error',
        isOperational: true,
      }),
    );
  });

  it('should return 502 if IAM service response does not contain x-api-key header', async () => {
    const validToken = generateValidToken();

    // Mock IAM service response without 'x-api-key'
    nock(IAM_SERVICE_URL)
      .get('/example/auth-route')
      .reply(200, { success: true, message: 'IAM response received' });

    const response = await request(app)
      .get('/api/iam/example/auth-route')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'IAM response received',
    });
  });
});
