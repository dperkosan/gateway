import { Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import {
  BadGatewayError,
  ServiceUnavailableError,
} from '@common/errors/http-status.error';
import getEnvVariable from '@common/utils/env.util';

class GatewayController {
  public async proxyToIAM(req: Request, res: Response): Promise<void> {
    const iamServiceUrl = getEnvVariable('IAM_SERVICE_URL');
    const iamPath = req.originalUrl.replace(/^\/api\/iam/, ''); // Removes `/api/iam`
    const targetUrl = new URL(iamPath, iamServiceUrl).href;

    try {
      const headers: AxiosRequestConfig['headers'] = {
        ...req.headers,
        host: new URL(iamServiceUrl).host,
      };

      const config: AxiosRequestConfig = {
        method: req.method as AxiosRequestConfig['method'],
        url: targetUrl,
        headers,
        data: req.body ?? undefined,
        params: req.query,
        timeout: 5000,
        responseType: 'json',
        maxRedirects: 5,
        validateStatus: () => true,
      };

      const response = await axios(config);

      // ✅ Ensure IAM response is valid before forwarding
      if (!response.data || typeof response.data !== 'object') {
        throw new BadGatewayError(
          'IAM service returned an invalid response format',
        );
      }

      res.set(response.headers);
      res.status(response.status).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new ServiceUnavailableError('IAM service is unreachable');
        }
        throw new BadGatewayError(`IAM request failed: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new GatewayController();
