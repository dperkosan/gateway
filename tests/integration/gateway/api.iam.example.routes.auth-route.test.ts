import request from 'supertest';
import nock from 'nock';
import { createApp } from 'src/createApp';
import getEnvVariable from '@common/utils/env.util';
import {
  BadGatewayError,
  ServiceUnavailableError,
} from '@common/errors/http-status.error';

const app = createApp();
const originalIAMServiceURL = getEnvVariable('IAM_SERVICE_URL');
let IAM_SERVICE_URL: string;

describe('GatewayController - proxyToIAM Integration Test', () => {
  beforeEach(() => {
    nock.cleanAll();
    IAM_SERVICE_URL = originalIAMServiceURL;
    process.env.IAM_SERVICE_URL = originalIAMServiceURL;
  });

  afterAll(() => {
    nock.restore();
  });

  it('should successfully proxy request to IAM service', async () => {
    // Mock IAM service response
    nock(IAM_SERVICE_URL)
      .get('/example/public-route')
      .reply(200, { success: true, message: 'IAM response received' });

    // Make the request to the gateway
    const response = await request(app)
      .get('/api/iam/example/public-route')
      .expect(200);

    // Assertions
    expect(response.body).toEqual({
      success: true,
      message: 'IAM response received',
    });
  });

  it('should return 502 if IAM service returns an invalid response', async () => {
    // Mock an invalid IAM response (empty body)
    nock(IAM_SERVICE_URL).get('/example/public-route').reply(200, '');

    const response = await request(app)
      .get('/api/iam/example/public-route')
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
    const UNREACHABLE_URL = 'http://localhost:6666'; // Random unused port

    // Override IAM_SERVICE_URL for this test
    process.env.IAM_SERVICE_URL = UNREACHABLE_URL;

    const response = await request(app).get('/api/iam/example/public-route');

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
    // Mock IAM service failure
    nock(IAM_SERVICE_URL)
      .get('/example/public-route')
      .replyWithError('Simulated failure');

    const response = await request(app).get('/api/iam/example/public-route');

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
});
