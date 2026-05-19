export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const formatMongooseValidationErrors = (error) =>
  Object.values(error.errors || {}).map((item) => ({
    field: item.path,
    message: item.message
  }));

const formatDuplicateKeyError = (error) =>
  Object.keys(error.keyValue || {}).map((field) => ({
    field,
    message: `${field} already exists`
  }));

const normalizeError = (error) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Internal server error";
  let errors = error.errors;
  let code = error.code || "INTERNAL_ERROR";

  if (error.name === "ValidationError") {
    statusCode = 422;
    message = "Validation failed";
    errors = formatMongooseValidationErrors(error);
    code = "MONGOOSE_VALIDATION_ERROR";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path || "identifier"}`;
    errors = [{ field: error.path || "id", message }];
    code = "MONGOOSE_CAST_ERROR";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists";
    errors = formatDuplicateKeyError(error);
    code = "MONGOOSE_DUPLICATE_KEY";
  }

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
    code = "JWT_INVALID";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired";
    code = "JWT_EXPIRED";
  }

  if (error.name === "NotBeforeError") {
    statusCode = 401;
    message = "Authentication token is not active yet";
    code = "JWT_NOT_ACTIVE";
  }

  if (error.isAxiosError) {
    statusCode = error.response?.status || (error.code === "ECONNABORTED" ? 504 : 502);
    message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      (error.code === "ECONNABORTED" ? "AI API request timed out" : "AI API request failed");
    code = "AI_API_ERROR";
    errors = [
      {
        field: "ai",
        message
      }
    ];
  }

  return {
    statusCode,
    body: {
      success: false,
      message,
      code,
      errors: errors || undefined,
      timestamp: new Date().toISOString()
    }
  };
};

export const errorHandler = (error, _req, res, _next) => {
  const normalized = normalizeError(error);

  if (process.env.NODE_ENV !== "production") {
    normalized.body.stack = error.stack;
  }

  res.status(normalized.statusCode).json(normalized.body);
};
