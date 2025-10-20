export const configuration = {
  app: {
    name: process.env.APP_NAME || 'learning-back-end',
    port: parseInt(process.env.APP_PORT || '3000'),
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'mysql://root:rootpass@localhost:3307/learning_db',
  },
  environment: process.env.NODE_ENV || 'development',
  authentication: {
    accessToken: process.env.ACCESS_TOKEN || 'access_token',
    refreshToken: process.env.REFRESH_TOKEN || 'refresh_token',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10'),
  },
};
