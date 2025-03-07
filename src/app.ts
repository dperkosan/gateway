import 'dotenv/config';
import logger from '@common/log/app.log';
import { createApp } from 'src/createApp';
import getEnvVariable from '@common/utils/env.util';

const app = createApp();

(async () => {
  try {
    // Start Express server
    const PORT = parseInt(getEnvVariable('PORT'), 10);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error during initialization:', error);
    process.emit('SIGINT');
  }
})();
