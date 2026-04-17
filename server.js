const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🌍 CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// 🔗 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

// 👤 MODEL
const Player = mongoose.model("Player", {
  name: String,
  password: String,
  balance: Number,
  transactions: Array
});

// 🔐 REGISTER
app.post("/register", async (req, res) => {
  const { name, password } = req.body;

  const existing = await Player.findOne({ name });
  if (existing) return res.json({ error: "User already exists" });

  const hash = await bcrypt.hash(password, 10);

  const player = new Player({
    name,
    password: hash,
    balance: 1000,
    transactions: []
  });

  await player.save();

  res.json({ success: true });
});

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  const { name, password } = req.body;

  const player = await Player.findOne({ name });
  if (!player) return res.json({ error: "User not found" });

  const valid = await bcrypt.compare(password, player.password);
  if (!valid) return res.json({ error: "Wrong password" });

  const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET);

  res.json({ token });
});

// 🔒 AUTH
function auth(req, res, next) {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// 👤 PROFILE
app.get("/me", auth, async (req, res) => {
  const player = await Player.findById(req.user.id);
  res.json(player);
});

// 💰 TRANSACTION (SITE)
app.post("/transaction", auth, async (req, res) => {
  const { action, amount } = req.body;

  const player = await Player.findById(req.user.id);

  player.balance += amount;

  player.transactions.push({
    action,
    amount,
    time: new Date()
  });

  await player.save();

  res.json(player);
});

// 🎮 TRANSACTION MINECRAFT (SANS TOKEN)
app.post("/mc/transaction", async (req, res) => {
  const { name, action, amount } = req.body;

  const player = await Player.findOne({ name });
  if (!player) return res.json({ error: "Player not found" });

  player.balance += amount;

  player.transactions.push({
    action,
    amount,
    time: new Date()
  });

  await player.save();

  res.json(player);
});

app.listen(PORT, () => {
  console.log("Secure backend running");
});
