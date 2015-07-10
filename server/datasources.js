module.exports = {
  divesites: {
    "url": process.env.MONGOLAB_URI,
    "username": process.env.MONGOLAB_USERNAME || '',
    "password": process.env.MONGOLAB_PASSWORD || ''
  }
};
