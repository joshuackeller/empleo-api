const SecretToken = {
  auth: process.env.JWT_SECRET + "",
  confirm_account: process.env.JWT_SECRET + "confirm_account",
  reset_password: process.env.JWT_SECRET + "reset_password",
};

export default SecretToken;
