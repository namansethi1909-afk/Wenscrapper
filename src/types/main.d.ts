export interface errorMiddleware {
  success: boolean;
  message: string;
  stack?: string | undefined;
}
