const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🌍 CORS (GitHub Pages)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// 🧠 DATABASE EN MÉMOIRE
let players = {};

// 🔐 créer / récupérer joueur
function getPlayer(name) {
  if (!players[name]) {
    players[name] = {
      name,
      balance: 1000, // argent de départ
      transactions: [],
      stats: {
        actions: 0,
        houses: 0,
        cars: 0
      }
    };
  }
  return players[name];
}

// 💰 transaction
app.post("/transaction", (req, res) => {
  const { player, action, amount } = req.body;

  const p = getPlayer(player);

  const entry = {
    time: new Date(),
    action,
    amount: amount || 0
  };

  p.transactions.push(entry);
  p.stats.actions++;

  // 💸 gestion argent simple
  if (amount) {
    p.balance += amount;
  }

  console.log(p);

  res.json({ success: true, player: p });
});

// 👤 info joueur
app.get("/player/:name", (req, res) => {
  const player = getPlayer(req.params.name);
  res.json(player);
});

// 📜 toutes les transactions globales (optionnel)
app.get("/players", (req, res) => {
  res.json(players);
});

app.listen(PORT, () => {
  console.log("Akuro backend running on port " + PORT);
});
