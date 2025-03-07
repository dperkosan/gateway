import { Router } from 'express';
import { handleRouteErrors } from '@middleware/error.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import GatewayController from '@modules/gateway/controllers/gateway.controller';

const router = Router();

// Forward IAM-related requests (proxy)
router.get(
  '/iam/example/public-route',
  handleRouteErrors(GatewayController.proxyToIAM),
);

router.get(
  '/iam/example/auth-route',
  handleRouteErrors(authMiddleware),
  handleRouteErrors(GatewayController.proxyToIAM),
);

router.get(
  '/iam/example/auth-route-admin-only',
  handleRouteErrors(authMiddleware),
  handleRouteErrors(GatewayController.proxyToIAM),
);

export default router;
