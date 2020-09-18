const dotenv = require("dotenv");

dotenv.config();

const configFtp = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  username: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
};

const bdConfigVe = {
  user: process.env.USER_VE,
  password: process.env.PASSWORD_VE,
  connectString: process.env.CONNECT_STRING_VE
};

const bdConfigCo = {
  user: process.env.USER_CO,
  password: process.env.PASSWORD_CO,
  connectString: process.env.CONNECT_STRING_CO
};

module.exports = {
  configFtp,
  bdConfigVe,
  bdConfigCo
};
