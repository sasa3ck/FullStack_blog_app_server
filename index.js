import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import { checkAuth, handleValidationErrors } from "./utils/index.js";
import * as controllers from "./controllers/index.js";
import {
  registerValidation,
  loginValidation,
  postValidation,
  postUpdateValidation,
} from "./validations.js";

mongoose
  .connect(
    // process.env.MONGO_URL
    "mongodb+srv://admin:326632663266@blockapp.780k2vk.mongodb.net/blogApp?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();

// Сохранение картинок
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Routs

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  controllers.register
);
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  controllers.login
);
app.get("/auth/me", checkAuth, controllers.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/tags", controllers.getLastTags);
app.get("/posts", controllers.getAll);
app.get("/posts/tags", controllers.getLastTags);
app.get("/post/:id", controllers.getOne);
app.post(
  "/posts",
  checkAuth,
  postValidation,
  handleValidationErrors,
  controllers.create
);
app.patch(
  "/post/:id",
  checkAuth,
  postUpdateValidation,
  handleValidationErrors,
  controllers.update
);
app.delete("/post/:id", checkAuth, controllers.remove);

//// //// //// //// //// //// //// //// //// //// //// //// ////

app.listen(process.env.PORT || 1819, (err) => {
  if (err) console.log(err);
  console.log("Server ok");
});
