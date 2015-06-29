module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'localhost',
  AUTH_HEADER: 'Satellizer',
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  USER_MODEL: 'User'
};
