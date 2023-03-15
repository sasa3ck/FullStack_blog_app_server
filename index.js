import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { checkAuth, handleValidationErrors } from "./utils/index.js";
import * as controllers from "./controllers/index.js";
import {
  registerValidation,
  loginValidation,
  postValidation,
} from "./validations.js";

mongoose
  .connect(
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

app.get("/posts", controllers.getAll);
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
  postValidation,
  handleValidationErrors,
  controllers.update
);
app.delete("/post/:id", checkAuth, controllers.remove);

//// //// //// //// //// //// //// //// //// //// //// //// ////

app.listen(1819, (err) => {
  if (err) console.log(err);
  console.log("Server ok");
});
