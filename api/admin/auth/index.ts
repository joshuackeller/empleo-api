import prisma from "@src/utilities/prismaClient";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import SecretToken from "@src/utilities/SecretToken";
import { ClientError } from "@src/utilities/errors";
import nano_id from "@src/utilities/nano_id";
import { SignJWT } from "jose";
import express from "express";

const resend = new Resend(process.env.RESEND_KEY);

const SALT_ROUNDS = 15;

const router = express.Router();

router.post("/create_account", async (req, res) => {
  const { email, first_name, last_name, password } = z
    .object({
      email: z.string().email(),
      first_name: z.string(),
      last_name: z.string(),
      password: z.string().min(8, "Password must be 8 characters or more "),
    })
    .parse(req.body);
  let admin = await prisma.admin.findUnique({
    where: { email },
  });
  if (!!admin) {
    throw new ClientError("Email already in use");
  } else {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    admin = await prisma.admin.create({
      data: {
        id: nano_id(),
        email,
        first_name,
        last_name,
        email_confirmed: false,
        password: {
          create: {
            id: nano_id(),
            hash,
          },
        },
      },
    });
    // const token = sign({ admin_id: admin.id }, SecretToken.confirm_account);
    const secret = new TextEncoder().encode(SecretToken.confirm_account);
    const token = await new SignJWT({ admin_id: "blah" })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);
    try {
      const response = await resend.emails.send({
        from: "Empelo <no-reply@mail.joshkeller.info>",
        to: [email],
        subject: "Confirm Email",
        html: `
            <div>
                <p>Click the following link to confirm your email:  <a href="${process.env.ROUTER_URL}/auth/confirm?token=${token}"> ${process.env.ROUTER_URL}/auth/confirm?token=${token}</a></p>
            </div>
            `,
        text: `<p>Click the following link to confirm your email: ${process.env.ROUTER_URL}/auth/confirm?token=${token}`,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
    res.json({
      message: "Account created successfully. Confirm email before signing in.",
    });
  }
});

// router.get("/confirm", async (req, res) => {
//   const { token } = z
//     .object({
//       token: z.string(),
//     })
//     .parse(c.req.query());

//   try {
//     jwt.verify(token, SecretToken.confirm_account);
//     const { admin_id } = jwt.decode(token) as any;

//     await prisma.admin.update({
//       where: {
//         id: admin_id,
//       },
//       data: {
//         email_confirmed: true,
//       },
//     });

//     return c.redirect(
//       `${process.env.WEBSITE_URL}/recipes?authFlow=confirm_success`
//     );
//   } catch {
//     return c.redirect(
//       `${process.env.WEBSITE_URL}/recipes?authFlow=confirm_error`
//     );
//   }
// });

// router.post("/resend", async (req, res) => {
//   const { email } = await z
//     .object({
//       email: z.string().email(),
//     })
//     .parseAsync(await c.req.parseBody());

//   const admin = await prisma.admin.findUnique({
//     where: {
//       email,
//     },
//   });
//   if (!!admin) {
//     const token = jwt.sign({ admin_id: admin.id }, SecretToken.confirm_account);
//     try {
//       await resend.emails.send({
//         from: "Empleo <no-reply@mail.joshkeller.info>",
//         to: [email],
//         subject: "Confirm Email",
//         html: `
//             <div>
//                 <p>Click the following link to confirm your email:  <a href="${process.env.ROUTER_URL}/auth/confirm?token=${token}"> ${process.env.ROUTER_URL}/auth/confirm?token=${token}</a></p>
//             </div>
//             `,
//         text: `Click the following link to confirm your email: ${process.env.ROUTER_URL}/auth/confirm?token=${token}`,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//     return c.json({
//       message: "Email sent successfully",
//     });
//   } else {
//     throw new ClientError(
//       "No account with this email was found. Please create a new account",
//       400
//     );
//   }
// });

// router.post("/sign_in", async (req, res) => {
//   const { email, password } = await z
//     .object({
//       email: z.string(),
//       password: z.string(),
//     })
//     .parseAsync(await c.req.parseBody());

//   let admin;
//   try {
//     admin = await prisma.admin.findUniqueOrThrow({
//       where: {
//         email,
//       },
//       include: {
//         password: true,
//       },
//     });
//   } catch {
//     throw new ClientError("Could not find an account with this email");
//   }
//   if (!admin.email_confirmed) {
//     throw new ClientError("Please confirm email before signing in");
//   }

//   // Missing code
//   if (!admin.password) {
//     throw new ClientError("Please reset password");
//   }

//   const valid = await bcrypt.compare(password, admin.password.hash);

//   if (valid === true) {
//     const token = jwt.sign({ admin_id: admin.id }, SecretToken.auth);
//     setCookie(c, "token", token, {
//       path: "/",
//     });
//     return c.json({ token });
//   } else {
//     throw new ClientError("Incorrect email or password", 403);
//   }
// });

// router.post("/rest_password/request", async (req, res) => {
//   const { email } = await z
//     .object({
//       email: z.string(),
//     })
//     .parseAsync(await c.req.parseBody());

//   let admin;
//   try {
//     admin = await prisma.admin.findUniqueOrThrow({
//       where: {
//         email,
//       },
//     });
//   } catch {
//     throw new ClientError("Could not find an account with this email", 403);
//   }

//   const token = jwt.sign({ admin_id: admin.id }, SecretToken.reset_password);
//   const link = `${process.env.WEBSITE_URL}/recipes?authFlow=reset_password&token=${token}&email=${admin.email}`;
//   try {
//     await resend.emails.send({
//       from: "Empleo <no-reply@mail.joshkeller.info>",
//       to: [email],
//       subject: "Reset Password",
//       html: `
//         <div>
//             <p>Click the following link to reset your password:  <a href="${link}">${link}</a></p>
//         </div>
//         `,
//       text: `Click the following link to confirm your email: ${link}`,
//     });
//   } catch (error) {
//     console.error(error);
//   }
//   return c.json({
//     message: "Email sent successfully",
//   });
// });

// router.post("/reset_password", async (req, res) => {
//   const { token, password } = await z
//     .object({
//       token: z.string(),
//       password: z.string(),
//     })
//     .parseAsync(await c.req.parseBody());

//   try {
//     const { admin_id } = jwt.verify(token, SecretToken.reset_password);

//     const hash = await bcrypt.hash(password, SALT_ROUNDS);

//     let admin = await prisma.admin.update({
//       where: {
//         id: admin_id,
//       },
//       data: {
//         email_confirmed: true,
//         password: {
//           update: {
//             hash,
//           },
//         },
//       },
//     });

//     return c.json(admin);
//   } catch {
//     throw new ClientError("Could not reset password. Please try again.");
//   }
// });

export default router;
