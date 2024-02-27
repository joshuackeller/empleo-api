import { Request } from "express";

export type AdminJWTObject = {
  adminId: string;
};

export interface AdminRequest extends Request {
  adminId?: string;
  organizationId?: string;
}

export type ClientJWTObject = {
  userId: string;
};

export interface ClientRequest extends Request {
  userId?: string;
  slug?: string;
}
