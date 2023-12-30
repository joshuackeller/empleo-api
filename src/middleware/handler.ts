import { NextFunction, Request, Response } from "express";

const handler =
  (controller: (req: Request, res: Response) => any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res);
    } catch (error) {
      next(error);
    }
  };

export default handler;
