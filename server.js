import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =======================
   CONNEXION MONGODB
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

/* =======================
   MODEL PLAYER
======================= */
const playerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  balance: { type: Number, default: 0 }
});

const Player = mongoose.model("Player", playerSchema);

/* =======================
   ROUTE TEST
======================= */
app.get("/", (req, res) => {
  res.json({ message: "Akuro backend is running" });
});

/* =======================
   GET PLAYER
======================= */
app.get("/player/:name", async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();

    let player = await Player.findOne({ name });

    if (!player) {
      // auto-create player si pas existant
      player = await Player.create({
        name,
        balance: 0
      });
    }

    res.json(player);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   TRANSACTION (BANQUE)
======================= */
app.post("/transaction", async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const sender = await Player.findOne({ name: from.toLowerCase() });
    const receiver = await Player.findOne({ name: to.toLowerCase() });

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: "Not enough money" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.json({
      message: "Transaction successful",
      from: sender,
      to: receiver
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
