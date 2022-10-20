const boom = require('@hapi/boom')
const fs = require('fs');

function validatorHandler(schema, property) { // DYNAMIC MIDDLEWARE
  return (req, res, next) => {
    const data = req[property]; // req.body, req.params, req.query AND OTHER ONES! THATS WHY IT IS DYNAMIC
    const { error } = schema.validate(data, { abortEarly: false });// THIS IS error DUE TO RESTRUCTURING
    if(error) next(boom.badRequest(error));
    next();
  }
}

function imageValidatorHandler() {
  return (req, res, next) => {
    const valid_extensions = ['png', 'jpg', 'jpeg', 'gif'];
    const fileReq = req.files;
    let file_path = fileReq.image.path;
    let file_name = file_path.split('\\')[2];
    let file_ext = file_name.split('.')[1];
    if(!valid_extensions.includes(file_ext)) {
      fs.unlink(file_path, (err) => {
        next(boom.badData("EXTENSION INVALIDA"));
      })
      next(boom.badData("EXTENSION INVALIDA"));
    }
    next();
  }
}

module.exports = { validatorHandler, imageValidatorHandler };