import { Request } from "express";

export type AdminJWTObject = {
  adminId: string;
};

export interface EmpleoRequest extends Request {
  adminId?: string;
  organizationId?: string;
  userId?: string;
}
