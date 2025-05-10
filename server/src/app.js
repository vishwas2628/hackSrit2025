import express from "express";
import cookieParser from "cookie-parser";
import cors from cors


const app = express();


//middleware

app.use(cors({
  origin: process.env.CLIENT_URL,
  Credential: true
}))


app.use(express.json({
  limit: "100kb"
}))

app.use(cookieParser())

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
