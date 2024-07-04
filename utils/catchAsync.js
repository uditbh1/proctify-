// module.exports = function (fn) {
//   return function (req, res, next) {
//     fn(req, res, next).catch((err) => {console.log(err);next()});

//   };
// };

module.exports = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.log('Caught an error:', err); // Log error to the console
      next(err);
    });
  };
};