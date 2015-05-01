var config = {
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MONGOLAB_URI: process.env.MONGOLAB_URI,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  facebook: {
    secret: process.env.FACEBOOK_SECRET
  }
};

module.exports = config;
