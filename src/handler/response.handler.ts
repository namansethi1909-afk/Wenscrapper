/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Response } from "express";

export class ApiResponse<T> {
  public message: string;
  public statusCode: number;
  public data: T;
  public metadata: undefined;
  public success: boolean;
  public errors?: any;
  constructor(
    message: string,
    statusCode: number,
    data: T,
    metadata?: undefined,
    errors?: any,
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.metadata = metadata;
    this.errors = errors;
  }

  static success(
    res: Response,
    message: string,
    statusCode: number,
    data?: unknown,
  ) {
    return res
      .status(statusCode)
      .json(new ApiResponse(message, statusCode, data));
  }

  static error(
    res: Response,
    message: string,
    statusCode: number,
    errors: any,
  ) {
    return res
      .status(statusCode)
      .json(new ApiResponse(message, statusCode, null, errors));
  }
}

// if we have not-found , validation , server error
