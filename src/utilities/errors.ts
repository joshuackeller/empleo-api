export class CustomError<TData = unknown> extends Error {
  status: number;

  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.status = status;
  }

  log() {
    console.error(
      JSON.stringify(
        {
          status: this.status,
          message: this.message,
        },
        null,
        2
      )
    );
  }
}

export class ClientError<TData = unknown> extends CustomError<TData> {
  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, !status ? 400 : status, options);
  }
}

export class ServerError<TData = unknown> extends CustomError<TData> {
  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, !status ? 500 : status, options);
  }
}
