const { AsyncLocalStorage } = require('async_hooks');
let asyncLocalStorage;
 const userContextMiddleware = async (req, res, next) => {
  asyncLocalStorage = new AsyncLocalStorage();
  asyncLocalStorage.run({ user: { _id: res.locals.user._id } }, () => {
    next();
  });
};

 const getUserContext = () => {
  return asyncLocalStorage?.getStore()?.user;
};
const userContext = {
  userContextMiddleware,
  getUserContext
}
module.exports = userContext;