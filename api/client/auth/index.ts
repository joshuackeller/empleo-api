import prisma from "../../../src/utilities/prisma";
import { z } from "zod";
import { Resend } from "resend";
import SecretToken from "../../../src/utilities/SecretToken";
import { ClientError } from "../../../src/utilities/errors";
import nano_id from "../../../src/utilities/nano_id";
import jwt from "jsonwebtoken";
import express from "express";
import handler from "../../../src/middleware/handler";
import axios from "axios";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import { OrganizationSelect, UserSelect } from "../../../src/select/client";
const resend = new Resend(process.env.RESEND_KEY);

const router = express.Router();

router.post(
  "/request_link",
  handler(async (req: EmpleoRequest, res) => {
    const { email, cloudflareToken } = z
      .object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be 8 characters or more "),
        cloudflareToken: z.string({
          required_error: "No Cloudflare Token Provided",
        }),
      })
      .parse(req.body);

    const formData = new FormData();
    formData.append("secret", process.env.CAPTCHA_SECRET_KEY!);
    formData.append("response", cloudflareToken);
    formData.append("remoteip", req.ip!);

    const { data: response } = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      formData,
    );

    if (response.success !== true) {
      throw new ClientError("Invalid token. Refresh page.");
    }

    const [organization, user] = await prisma.$transaction([
      prisma.organization.findUniqueOrThrow({
        where: {
          id: req.organizationId,
        },
        select: OrganizationSelect,
      }),
      prisma.user.upsert({
        where: {
          email,
        },
        update: {
          email,
          organizations: {
            connect: {
              id: req.organizationId,
            },
          },
        },
        create: {
          id: nano_id(),
          email,
          emailConfirmed: false,
          organizations: {
            connect: {
              id: req.organizationId,
            },
          },
        },
        select: UserSelect,
      }),
    ]);

    const token = jwt.sign(
      { userId: user.id, organizationId: organization.id },
      SecretToken.clientRequestLink,
    );
    try {
      await resend.emails.send({
        from: `${organization.title} <no-reply@mail.empleo.work>`,
        to: [email],
        subject: `${organization.title} Link`,
        html: `
            <div>
                <p>Click the following link to continue to ${organization.title}:
                    <a href="https://api.empleo.work/confirm_account?token=${token}">https://api.empleo.work/confirm_account?token=${token}</a>
                </p>
            </div>
            `,
        text: `Click the following link to continue to ${organization.title}: https://api.empleo.work/confirm_account?token=${token}`,
      });
    } catch (error) {
      console.error("Could not send email", error);
    }
    res.json({
      message: "Account created successfully. Check email for sign link.",
    });
  }),
);

router.get(
  "/confirm_account",
  handler(async (req, res) => {
    let organization;
    try {
      const { token } = z
        .object({
          token: z.string(),
        })
        .parse(req.query);

      const { organizationId, userId } = jwt.verify(
        token,
        SecretToken.clientRequestLink,
      ) as { organizationId: string; userId: string };

      let user;
      [organization, user] = await prisma.$transaction([
        prisma.organization.findUniqueOrThrow({
          where: {
            id: organizationId,
          },
          select: OrganizationSelect,
        }),
        prisma.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
          select: UserSelect,
        }),
      ]);

      const newToken = jwt.sign(
        { userId: user.id, organizationId: organization.id },
        SecretToken.clientAuth,
      );

      res.redirect(
        `https://${organization.slug}.empleo.work/token?token=${newToken}`,
      );
    } catch {
      if (!!organization && !!organization.slug) {
        res.redirect(`https://${organization.slug}.empleo.work/token_error`);
      } else {
        res.send(`
            <div>
                <h2>Error</h2>
                <p>Link expired. Please request a new link</p>
            </div>
            `);
      }
    }
  }),
);

export default router;
