import express, { Request, Response } from "express";
import cors from "cors";
// import adminAuth from "./admin/auth";
// import { CustomError } from "@src/utilities/errors";
import prisma from "../src/utilities/prismaClient";

const app = express();

// enable JSON body parser
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: "test",
      },
    });

    res.json(user);
    // res.json({ user });
  } catch (error) {
    console.error("--ERROR--", error);
    // res.send("fat error");
    // res.send(error?.toString() || "error");
  }
  // res.send("hello there");
});

app.get("/other", async (req, res) => {
  res.send("other");
});
// app.use("/admin/auth", adminAuth);

// app.use((err: CustomError, req: Request, res: Response) => {
//   console.log("HANDLING ERROR");
//   return res.status(err.status || 500).send("Something went wrong");
// });

export default app;
