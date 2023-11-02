const HttpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");
const userContext = require("./usercontext.middleware");

const userContextMiddleware = userContext.userContextMiddleware;
const getUserContext = userContext.getUserContext;

/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 * const
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const userAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      let bearerToken =
        req.header("Authorization") ||
        (req.cookies.tokens && `Bearer ${req.cookies.tokens}`);
   

      //  if(!bearerToken){

      // bearerToken =   req.cookies.token.startsWith('Bearer') ? req.cookies.token : `Bearer ${req.cookies.token}`;

      //   }

      if (!bearerToken) {
        // return res.send({Message:"Authorization token is required"});
       return res.render("pages/login", { message: "" });
      }

      bearerToken = bearerToken.split(" ")[1];

      // console.log(bearerToken)

      const user = jwt.verify(bearerToken, "collegeInformation");
      // console.log(user)

      const userid = user.userid;

      if (!userid) {
        // res.send({Message:"Invalid token"});
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          code: HttpStatus.UNAUTHORIZED,
          message: "Invalid token",
        });
      }
      // if (allowedRoles) {

      if (!allowedRoles.includes(user.role)) {
      return  res.render("pages/login", { message: "" });

        // res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        //   code: HttpStatus.UNAUTHORIZED,
        //    message: "Unauthorized"
        // });
        // code: HttpStatus.UNAUTHORIZED,
        // res.send({Message:"Unauthorized"});
        //  }
      } else {
        if (user.role === "user" && allowedRoles.includes("user")) {
          res.locals.user = user;
          res.locals.token = bearerToken;
          return userContextMiddleware(req, res, next);
        } else if (allowedRoles.includes("admin")) {
          res.locals.user = user;
          res.locals.token = bearerToken;

          return userContextMiddleware(req, res, next);
        } else if (allowedRoles.includes("sub admin")) {
          res.locals.user = user;
          res.locals.token = bearerToken;
          // console.log(user);
          return userContextMiddleware(req, res, next);
        } else if (allowedRoles.includes("user")) {
          res.locals.user = user;
          res.locals.token = bearerToken;
          // console.log(user);
          return userContextMiddleware(req, res, next);
        }
      }
    } catch (error) {
    
      return res.redirect("/admin/login");
      // next(error);
    }
  };
};

module.exports = userAuth;
