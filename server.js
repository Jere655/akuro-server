const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🌍 CORS (pour GitHub Pages)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

let transactions = [];

// 💰 ajouter transaction
app.post("/transaction", (req, res) => {
  const { player, action } = req.body;

  const entry = {
    time: new Date(),
    player,
    action
  };

  transactions.push(entry);

  console.log(entry);

  res.json({ success: true });
});

// 📜 lire transactions
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// 🟢 test serveur
app.get("/", (req, res) => {
  res.send("Akuro backend is running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
