const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;

const DATA_PATH = path.join(__dirname, "data");
const VOYAGES_FILE = path.join(DATA_PATH, "voyages.json");

app.use(cors());
app.use(express.json());

// 📌 Fonction utilitaire pour lire un fichier JSON
const lireFichier = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

// 📌 Fonction utilitaire pour écrire dans un fichier JSON
const ecrireFichier = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

// ✅ 1. Récupérer la liste des voyages (infos principales)
app.get("/api/voyages", (req, res) => {
  if (!fs.existsSync(VOYAGES_FILE)) return res.json({ voyages: [] });
  res.json(lireFichier(VOYAGES_FILE));
});

// ✅ 2. Récupérer les détails d’un voyage
app.get("/api/voyages/:id", (req, res) => {
  const voyageId = req.params.id;
  const voyagePath = path.join(DATA_PATH, `voyage_${voyageId}.json`);

  if (!fs.existsSync(voyagePath)) {
    return res.status(404).json({ error: "Voyage non trouvé" });
  }

  res.json(lireFichier(voyagePath));
});

// ✅ 3. Ajouter un nouveau voyage
app.post("/api/voyages", (req, res) => {
  if (!fs.existsSync(VOYAGES_FILE))
    ecrireFichier(VOYAGES_FILE, { voyages: [] });

  let voyages = lireFichier(VOYAGES_FILE);
  const newVoyage = {
    id: Date.now().toString(),
    titre: req.body.titre,
    lieu: req.body.lieu,
    date: req.body.date,
    duree: req.body.duree,
  };

  voyages.voyages.push(newVoyage);
  ecrireFichier(VOYAGES_FILE, voyages);

  // Créer le fichier spécifique au voyage
  const voyagePath = path.join(DATA_PATH, `voyage_${newVoyage.id}.json`);
  ecrireFichier(voyagePath, {
    id: newVoyage.id,
    titre: newVoyage.titre,
    lieu: newVoyage.lieu,
    date: newVoyage.date,
    duree: newVoyage.duree,
  });

  res.status(201).json(newVoyage);
});

// ✅ 4. Supprimer un voyage
app.delete("/api/voyages/:id", (req, res) => {
  const voyageId = req.params.id;
  const voyagePath = path.join(DATA_PATH, `voyage_${voyageId}.json`);

  // Supprimer le fichier voyage_X.json
  if (fs.existsSync(voyagePath)) fs.unlinkSync(voyagePath);

  let voyages = lireFichier(VOYAGES_FILE);
  voyages.voyages = voyages.voyages.filter((v) => v.id !== voyageId);
  ecrireFichier(VOYAGES_FILE, voyages);

  res.json({ message: "Voyage supprimé avec succès" });
});

// ✅ 5. Récupérer les détails d’un voyage
app.get("/api/voyage_:id", (req, res) => {

  const voyageId = req.params.id;
  const voyagePath = path.join(DATA_PATH, `voyage_${voyageId}.json`);

  if (!fs.existsSync(voyagePath)) {
    return res.status(404).json({ error: "Voyage non trouvé" });
  }

  res.json(lireFichier(voyagePath));
});

// 🔥 Lancer le serveur
app.listen(PORT, () =>
  console.log(`Serveur en ligne sur http://localhost:${PORT}`)
);
