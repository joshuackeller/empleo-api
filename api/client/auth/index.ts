import prisma from "../../../src/utilities/prisma";
import { z } from "zod";
import { Resend } from "resend";
import SecretToken from "../../../src/utilities/SecretToken";
import nano_id from "../../../src/utilities/nano_id";
import jwt from "jsonwebtoken";
import express from "express";
import handler from "../../../src/middleware/handler";
import { ClientRequest } from "../../../src/utilities/interfaces";
import { OrganizationSelect, UserSelect } from "../../../src/select/client";
import OrgMiddleware from "../../../src/middleware/client/OrgMiddleware";
const resend = new Resend(process.env.RESEND_KEY);

const router = express.Router();

router.get(
  "/confirm_account",
  handler(async (req, res) => {
    let organization;
    try {
      const { token, returnRoute } = z
        .object({
          token: z.string(),
          returnRoute: z.string(),
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
        `https://${organization.slug}.empleo.work/token?token=${newToken}&returnRoute=${returnRoute}`,
      );
    } catch {
      if (!!organization && !!organization.slug) {
        res.redirect(`https://${organization.slug}.empleo.work/auth_error`);
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

router.use(OrgMiddleware);

router.post(
  "/request_link",
  handler(async (req: ClientRequest, res) => {
    const { email, returnRoute } = z
      .object({
        email: z.string().email().toLowerCase(),
        // cloudflareToken: z.string({
        //   required_error: "No Cloudflare Token Provided",
        // }),
        returnRoute: z.string().optional(),
      })
      .parse(req.body);

    // const formData = new FormData();
    // formData.append("secret", process.env.CAPTCHA_SECRET_KEY!);
    // formData.append("response", cloudflareToken);
    // formData.append("remoteip", req.ip!);
    // const { data: response } = await axios.post(
    //   "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    //   formData,
    // );
    // if (response.success !== true) {
    //   throw new ClientError("Invalid token. Refresh page.");
    // }
    console.log("SLUG", req.slug);

    const [organization, user] = await prisma.$transaction([
      prisma.organization.findUniqueOrThrow({
        where: {
          slug: req.slug,
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
              slug: req.slug,
            },
          },
        },
        create: {
          id: nano_id(),
          email,
          emailConfirmed: false,
          organizations: {
            connect: {
              slug: req.slug,
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
                    <a href="https://api.empleo.work/client/auth/confirm_account?token=${token}&returnRoute=${returnRoute}">https://api.empleo.work/client/auth/confirm_account?token=${token}&returnRoute=${returnRoute}</a>
                </p>
            </div>
            `,
        text: `Click the following link to continue to ${organization.title}: https://api.empleo.work/client/auth/confirm_account?token=${token}&returnRoute=${returnRoute}`,
      });
    } catch (error) {
      console.error("Could not send email", error);
    }
    res.json({
      message: "Account created successfully. Check email for sign link.",
    });
  }),
);

export default router;
