import { validateEnv, config } from './config/env';
import { createApp } from './app';

// Validate environment before launching HTTP listener
validateEnv();

const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚗 Car Dealership API running on http://0.0.0.0:${config.port}`);
});
