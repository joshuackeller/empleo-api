import { Request } from "express";

export type AdminJWTObject = {
  admin_id: string;
};

export interface EmpleoRequest extends Request {
  admin_id?: string;
}
