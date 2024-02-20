const SecretToken = {
  auth: process.env.JWT_SECRET + "",
  confirm_account: process.env.JWT_SECRET + "confirm_account",
  reset_password: process.env.JWT_SECRET + "reset_password",
  clientAuth: process.env.JWT_SECRET + "client_auth",
  clientRequestLink: process.env.JWT_SECRET + "request_link",
};

export default SecretToken;
