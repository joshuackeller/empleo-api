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
    res.json({ user });
  } catch (error) {
    res.send(error?.toString() || "error");
  }
  res.send("hello there");
});
// app.use("/admin/auth", adminAuth);

// app.use((err: CustomError, req: Request, res: Response) => {
//   console.log("HANDLING ERROR");
//   return res.status(err.status || 500).send("Something went wrong");
// });

export default app;
