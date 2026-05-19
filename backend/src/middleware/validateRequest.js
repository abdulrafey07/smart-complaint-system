import { validationResult } from "express-validator";

const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const error = new Error("Validation failed");
  error.statusCode = 422;
  error.code = "REQUEST_VALIDATION_ERROR";
  error.errors = result.array().map((item) => ({
    field: item.path,
    message: item.msg
  }));
  return next(error);
};

export default validateRequest;
