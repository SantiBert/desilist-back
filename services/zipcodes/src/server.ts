import App from '@/app';
import HealthRoute from '@/routes/health.route';
import ZipcodesRoutes from '@/routes/zipcodes.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new ZipcodesRoutes(), new HealthRoute()]);

app.listen();
