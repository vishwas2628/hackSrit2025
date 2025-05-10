import express from "express";

const app = express();
const PORT = 3000;

//middleware
app.use(express.json());

//root api testing
app.get("/", (req, res) => {
  res.send("Api is working");
});

//api endpoints
app.use("/api/user", userRouter.js);

//server Listning
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
