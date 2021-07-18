module.exports = (app) => {
  app.disable('x-powered-by');
  app.use((require, response, next) => {
    response.set('access-control-allow-origin', '*');
    response.set('access-control-allow-methods', '*');
    response.set('access-control-allow-headers', '*');
    next();
  });
};
