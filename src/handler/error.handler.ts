class ApiError extends Error {
  public statusCode: number;
  public errors?: [];
  public data?: undefined;
  constructor(
    message: string,
    statusCode: number,
    errors?: [],
    stack?: string | undefined,
    data?: undefined,
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.stack = stack;
    this.data = data;
  }
}

class NotFoundError extends ApiError {
  constructor(message = "not found") {
    super(message, 404);
  }
}

class ConflictError extends ApiError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message = "already exists", errors?: any) {
    super(message, 409, errors);
  }
}

class BadRequestError extends ApiError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message = "bad request", errors?: any) {
    super(message, 400, errors);
  }
}

export { ApiError, NotFoundError, ConflictError, BadRequestError };
