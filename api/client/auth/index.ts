// import { Hono } from "hono";
// import { setCookie } from "hono/cookie";
// import prisma from "@src/utilities/prismaClient";
// import { z } from "zod";
// import bcrypt from "bcryptjs";
// const jwt = require("jsonwebtoken");
// import { Resend } from "resend";
// import SecretToken from "@src/utilities/SecretToken";
// import { ClientError } from "@src/utilities/errors";
// import { handle } from "hono/vercel";
// import nano_id from "@src/utilities/nano_id";
// import { cors } from "hono/cors";

// export const config = {
//   runtime: "edge",
// };

// const resend = new Resend(process.env.RESEND_KEY);

// const SALT_ROUNDS = 15;

// const api = new Hono().basePath("/api");

// api.use("*", cors());

// api.get("/confirm", async (c) => {
//   const { token } = z
//     .object({
//       token: z.string(),
//     })
//     .parse(c.req.query());

//   try {
//     jwt.verify(token, SecretToken.confirm_account);
//     const { userId } = jwt.decode(token) as any;

//     await prisma.user.update({
//       where: {
//         id: userId,
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

// api.post("/resend", async (c) => {
//   const { email } = await z
//     .object({
//       email: z.string().email(),
//     })
//     .parseAsync(await c.req.parseBody());

//   const user = await prisma.user.findUnique({
//     where: {
//       email,
//     },
//   });
//   if (!!user) {
//     const token = jwt.sign({ userId: user.id }, SecretToken.confirm_account);
//     try {
//       await resend.emails.send({
//         from: "Empleo <no-reply@mail.joshkeller.info>",
//         to: [email],
//         subject: "Confirm Email",
//         html: `
//             <div>
//                 <p>Click the following link to confirm your email:  <a href="${process.env.API_URL}/auth/confirm?token=${token}"> ${process.env.API_URL}/auth/confirm?token=${token}</a></p>
//             </div>
//             `,
//         text: `Click the following link to confirm your email: ${process.env.API_URL}/auth/confirm?token=${token}`,
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

// api.post("/create_account", async (c) => {
//   const { email, first_name, last_name, password } = await z
//     .object({
//       email: z.string().email(),
//       first_name: z.string(),
//       last_name: z.string(),
//       password: z.string().min(8, "Password must be 8 characters or more "),
//     })
//     .parseAsync(await c.req.parseBody());

//   let user = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (!!user) {
//     throw new ClientError("Email already in use");
//   } else {
//     const hash = await bcrypt.hash(password, SALT_ROUNDS);

//     user = await prisma.user.create({
//       data: {
//         id: nano_id(),
//         email,
//         first_name,
//         last_name,
//         email_confirmed: false,
//         password: {
//           create: {
//             id: nano_id(),
//             hash,
//           },
//         },
//       },
//     });

//     const token = jwt.sign({ userId: user.id }, SecretToken.confirm_account);
//     try {
//       await resend.emails.send({
//         from: "Empleo <no-reply@mail.joshkeller.info>",
//         to: [email],
//         subject: "Confirm Email",
//         html: `
//             <div>
//                 <p>Click the following link to confirm your email:  <a href="${process.env.API_URL}/auth/confirm?token=${token}"> ${process.env.API_URL}/auth/confirm?token=${token}</a></p>
//             </div>
//             `,
//         text: `<p>Click the following link to confirm your email: ${process.env.API_URL}/auth/confirm?token=${token}`,
//       });
//     } catch (error) {
//       console.error(error);
//     }

//     return c.json({
//       message: "Account created successfully. Confirm email before signing in.",
//     });
//   }
// });

// api.post("/sign_in", async (c) => {
//   const { email, password } = await z
//     .object({
//       email: z.string(),
//       password: z.string(),
//     })
//     .parseAsync(await c.req.parseBody());

//   let user;
//   try {
//     user = await prisma.user.findUniqueOrThrow({
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
//   if (!user.email_confirmed) {
//     throw new ClientError("Please confirm email before signing in");
//   }

//   // Missing code
//   if (!user.password) {
//     throw new ClientError("Please reset password");
//   }

//   const valid = await bcrypt.compare(password, user.password.hash);

//   if (valid === true) {
//     const token = jwt.sign({ userId: user.id }, SecretToken.auth);
//     setCookie(c, "token", token, {
//       path: "/",
//     });
//     return c.json({ token });
//   } else {
//     throw new ClientError("Incorrect email or password", 403);
//   }
// });

// api.post("/rest_password/request", async (c) => {
//   const { email } = await z
//     .object({
//       email: z.string(),
//     })
//     .parseAsync(await c.req.parseBody());

//   let user;
//   try {
//     user = await prisma.user.findUniqueOrThrow({
//       where: {
//         email,
//       },
//     });
//   } catch {
//     throw new ClientError("Could not find an account with this email", 403);
//   }

//   const token = jwt.sign({ userId: user.id }, SecretToken.reset_password);
//   const link = `${process.env.WEBSITE_URL}/recipes?authFlow=reset_password&token=${token}&email=${user.email}`;
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

// api.post("/reset_password", async (c) => {
//   const { token, password } = await z
//     .object({
//       token: z.string(),
//       password: z.string(),
//     })
//     .parseAsync(await c.req.parseBody());

//   try {
//     const { userId } = jwt.verify(token, SecretToken.reset_password);

//     const hash = await bcrypt.hash(password, SALT_ROUNDS);

//     let user = await prisma.user.update({
//       where: {
//         id: userId,
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

//     return c.json(user);
//   } catch {
//     throw new ClientError("Could not reset password. Please try again.");
//   }
// });

// export default handle(api);
