import express from "express";

const app = express();

// enable JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello there");
});

app.listen(8000, () =>
  console.log("🚀 Server ready at: http://localhost:8000")
);
