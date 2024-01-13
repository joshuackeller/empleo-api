import prisma from "../../../src/utilities/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import SecretToken from "../../../src/utilities/SecretToken";
import { ClientError } from "../../../src/utilities/errors";
import nano_id from "../../../src/utilities/nano_id";
import jwt from "jsonwebtoken";
import express from "express";
import handler from "../../../src/middleware/handler";
// test

const resend = new Resend(process.env.RESEND_KEY);

const SALT_ROUNDS = 13;
const router = express.Router();

router.post(
  "/create_account",
  handler(async (req, res) => {
    const { email, first_name, last_name, password } = z
      .object({
        email: z.string().email(),
        first_name: z.string(),
        last_name: z.string(),
        password: z.string().min(8, "Password must be 8 characters or more "),
      })
      .parse(req.body);
    let admin = await prisma.admin.findUnique({
      where: { email, self_created: true },
    });
    if (!!admin) {
      throw new ClientError("Email already in use");
    } else {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      admin = await prisma.admin.upsert({
        where: {
          email,
        },
        update: {
          first_name,
          last_name,
          email_confirmed: false,
          self_created: true,
          password: {
            create: {
              id: nano_id(),
              hash,
            },
          },
        },
        create: {
          id: nano_id(),
          email,
          first_name,
          last_name,
          email_confirmed: false,
          self_created: true,
          password: {
            create: {
              id: nano_id(),
              hash,
            },
          },
        },
      });

      const token = jwt.sign(
        { admin_id: admin.id },
        SecretToken.confirm_account
      );
      try {
        const response = await resend.emails.send({
          from: "Empleo <no-reply@mail.empleo.work>",
          to: [email],
          subject: "Confirm Email",
          html: `
            <div>
                <p>Click the following link to confirm your email:  <a href="${process.env.API_URL}/admin/auth/confirm?token=${token}"> ${process.env.API_URL}/admin/auth/confirm?token=${token}</a></p>
            </div>
            `,
          text: `<p>Click the following link to confirm your email: ${process.env.API_URL}/admin/auth/confirm?token=${token}`,
        });
        console.log(response);
      } catch (error) {
        console.error(error);
      }
      res.json({
        message:
          "Account created successfully. Confirm email before signing in.",
      });
    }
  })
);

router.get(
  "/confirm",
  handler(async (req, res) => {
    const { token } = z
      .object({
        token: z.string(),
      })
      .parse(req.query);

    try {
      const { admin_id } = jwt.verify(
        token,
        SecretToken.confirm_account
      ) as any;

      await prisma.admin.update({
        where: {
          id: admin_id,
        },
        data: {
          email_confirmed: true,
        },
      });

      res.redirect(`${process.env.WEBSITE_URL}/auth/sign_in`);
    } catch (error) {
      res.json({
        error:
          (error as any)?.message || "Something went wrong. Please try again.",
      });
    }
  })
);

router.post(
  "/resend",
  handler(async (req, res) => {
    const { email } = z
      .object({
        email: z.string().email(),
      })
      .parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: {
        email,
        self_created: true,
      },
    });
    if (!!admin) {
      if (admin.email_confirmed === true) {
        throw new ClientError("Email already confirmed");
      }
      const token = jwt.sign(
        { admin_id: admin.id },
        SecretToken.confirm_account
      );
      try {
        await resend.emails.send({
          from: "Empleo <no-reply@mail.empleo.work>",
          to: [email],
          subject: "Confirm Email",
          html: `
            <div>
                <p>Click the following link to confirm your email:  <a href="${process.env.API_URL}/admin/auth/confirm?token=${token}"> ${process.env.API_URL}/admin/auth/confirm?token=${token}</a></p>
            </div>
            `,
          text: `Click the following link to confirm your email: ${process.env.API_URL}/admin/auth/confirm?token=${token}`,
        });
      } catch (error) {
        console.error(error);
      }
      res.json({
        message: "Email sent successfully",
      });
    } else {
      throw new ClientError(
        "No account with this email was found. Please create a new account",
        400
      );
    }
  })
);

router.post(
  "/sign_in",
  handler(async (req, res) => {
    const { email, password } = z
      .object({
        email: z.string(),
        password: z.string(),
      })
      .parse(req.body);

    let admin;
    try {
      admin = await prisma.admin.findUniqueOrThrow({
        where: {
          email,
          self_created: true,
        },
        include: {
          password: true,
        },
      });
    } catch {
      throw new ClientError("Could not find an account with this email");
    }
    if (!admin.email_confirmed) {
      throw new ClientError("Please confirm email before signing in");
    }

    // Missing code
    if (!admin.password) {
      throw new ClientError("Please reset password");
    }

    const valid = await bcrypt.compare(password, admin.password.hash);

    if (valid === true) {
      const token = jwt.sign({ admin_id: admin.id }, SecretToken.auth);
      res.json({ token });
    } else {
      throw new ClientError("Incorrect email or password", 403);
    }
  })
);

router.post(
  "/reset_password/request",
  handler(async (req, res) => {
    const { email } = z
      .object({
        email: z.string(),
      })
      .parse(req.body);

    let admin;
    try {
      admin = await prisma.admin.findUniqueOrThrow({
        where: {
          email,
          self_created: true,
        },
      });
    } catch {
      throw new ClientError("Could not find an account with this email", 403);
    }

    const token = jwt.sign(
      { admin_id: admin.id, email },
      SecretToken.reset_password,
      {
        expiresIn: "1hr",
      }
    );
    const link = `${process.env.WEBSITE_URL}/auth/reset_password?token=${token}`;
    try {
      await resend.emails.send({
        from: "Empleo <no-reply@mail.empleo.work>",
        to: [email],
        subject: "Reset Password",
        html: `
        <div>
            <p>Click the following link to reset your password:  <a href="${link}">${link}</a></p>
        </div>
        `,
        text: `Click the following link to confirm your email: ${link}`,
      });
    } catch (error) {
      console.error(error);
    }
    res.json({
      message: "Email sent successfully",
    });
  })
);

router.post(
  "/reset_password",
  handler(async (req, res) => {
    const { token, password } = z
      .object({
        token: z.string(),
        password: z.string(),
      })
      .parse(req.body);

    try {
      const { admin_id } = jwt.verify(token, SecretToken.reset_password) as any;

      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      let admin = await prisma.admin.update({
        where: {
          id: admin_id,
        },
        data: {
          email_confirmed: true,
          password: {
            update: {
              hash,
            },
          },
        },
      });

      res.json(admin);
    } catch (error) {
      let message =
        (error as any).message || "Could not reset password. Please try again.";
      if (message === "jwt expired") {
        message = "Link expired";
      }
      throw new ClientError(message);
    }
  })
);

export default router;
