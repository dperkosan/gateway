export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class MissingEnvError extends AppError {
  constructor(variableName: string) {
    super(
      `Environment variable "${variableName}" is missing or undefined`,
      500,
      true,
    );
  }
}

export class BadGatewayError extends AppError {
  constructor(
    message: string = 'Bad Gateway - Received an invalid response from upstream service',
  ) {
    super(message, 502, true);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = 'Service Unavailable - Upstream service is unreachable',
  ) {
    super(message, 503, true);
  }
}
