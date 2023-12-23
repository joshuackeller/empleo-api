import express, { Request, Response } from "express";
import cors from "cors";
import adminAuth from "./admin/auth";
import { CustomError } from "@src/utilities/errors";
import jwt from "jsonwebtoken";

const app = express();

// enable JSON body parser
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  const token = jwt.sign({ hello: "there" }, "secret");
  console.log(token);
  res.send(`hello there, ${token}`);
});
app.use("/admin/auth", adminAuth);

app.use((err: CustomError, req: Request, res: Response) => {
  console.log("HANDLING ERROR");
  return res.status(err.status || 500).send("Something went wrong");
});

export default app;
