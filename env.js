const dotenv = require('dotenv');
const child_process = require('child_process');

const config = dotenv.config()
if (config.error) {
  throw config.error;
}

const DEV_SERVER_PORT = process.env.DEV_SERVER_PORT || 4200;

const child = child_process.exec(`ng serve --port=${DEV_SERVER_PORT}`);
child.stderr.on('data', err => console.error(err));
child.stdout.on('data', data => console.log(data));
