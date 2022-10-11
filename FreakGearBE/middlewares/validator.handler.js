const boom = require('@hapi/boom')

function validatorHandler(schema, property) { // DYNAMIC MIDDLEWARE
  return (req, res, next) => {
    const data = req[property]; // req.body, req.params, req.query AND OTHER ONES! THATS WHY IT IS DYNAMIC
    const { error } = schema.validate(data, { abortEarly: false });// THIS IS error DUE TO RESTRUCTURING
    if(error) next(boom.badRequest(error));
    next();
  }
}

module.exports = validatorHandler;