import { validateEnv, config } from './config/env';
import { createApp } from './app';

// Validate environment before launching HTTP listener
validateEnv();

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚗 Car Dealership API running on http://localhost:${config.port}`);
});
