import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModal from "../models/User.js";

export const register = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const Hash = await bcrypt.hash(req.body.password, salt);

    const doc = new UserModal({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: Hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "userInfo",
      {
        expiresIn: "18d",
      }
    );

    const { passwordHash, ...UserData } = user._doc;
    res.json({
      ...UserData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModal.findOne({ email: req.body.email });
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!user || !isValidPass) {
      return res.status(404).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "userInfo",
      {
        expiresIn: "18d",
      }
    );

    const { passwordHash, ...UserData } = user._doc;
    res.json({
      ...UserData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModal.findById(req.userId);

    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    const { passwordHash, ...UserData } = user._doc;
    res.json(UserData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
