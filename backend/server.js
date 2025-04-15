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

  // Générer les jours en fonction de la durée
  const jours = Array.from(
    { length: parseInt(newVoyage.duree, 10) },
    (_, i) => ({
      jour: `${i + 1}`,
      activites: [],
    })
  );

  // Créer le fichier spécifique au voyage
  const voyagePath = path.join(DATA_PATH, `voyage_${newVoyage.id}.json`);
  ecrireFichier(voyagePath, {
    id: newVoyage.id,
    titre: newVoyage.titre,
    lieu: newVoyage.lieu,
    date: newVoyage.date,
    duree: newVoyage.duree,
    jours: jours,
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

// 6. Ecrire sur le fichier JSON du voyage
app.post("/api/voyage_:id/jours/jour:jourId/activites", (req, res) => {
  console.log("requete post pour activite");
  const voyageId = req.params.id;

  let jour = req.params.jourId - 1;

  const voyagePath = path.join(DATA_PATH, `voyage_${voyageId}.json`);

  if (!fs.existsSync(voyagePath)) {
    return res.status(404).json({ error: "Voyage non trouvé" });
  }

  let ceVoyage = JSON.parse(fs.readFileSync(voyagePath, "utf8"));

  if (jour === -1) return res.status(404).json({ error: "Jour non trouvé" });

  // Ajouter l'activité

  const nouvelleActivite = req.body;
  jour = +jour;

  ceVoyage.jours[jour].activites.push(nouvelleActivite);

  // Sauvegarde du fichier
  fs.writeFile(voyagePath, JSON.stringify(ceVoyage, null, 2), "utf8", (err) => {
    if (err)
      return res.status(500).json({ error: "Erreur d'écriture du fichier" });
    console.log("Activité ajoutée côté serveur :", nouvelleActivite);
    res.status(201).json(nouvelleActivite);
  });
});

// Route GET pour récupérer une activité par ID
app.get("/activite/:id", (req, res) => {
  const activiteId = req.params.id;

  // Recherche de l'activité dans tous les jours
  for (const jour of voyage.jours) {
    const activite = jour.activites.find((act) => act.id === activiteId);
    if (activite) {
      return res.json(activite);
    }
  }

  // Si l'activité n'est pas trouvée
  res.status(404).json({ message: "Activité non trouvée" });
});

// Supprimer une activité
app.delete("/api/voyage_:id/:activiteId", (req, res) => {
  console.log("Requête DELETE activité");

  const voyageId = req.params.id;
  const activiteId = req.params.activiteId;

  const voyagePath = path.join(DATA_PATH, `voyage_${voyageId}.json`);

  if (!fs.existsSync(voyagePath)) {
    return res.status(404).json({ error: "Voyage non trouvé" });
  }

  let ceVoyage = JSON.parse(fs.readFileSync(voyagePath, "utf8"));
  let activiteTrouvee = null;

  // Boucle sur chaque jour pour chercher et supprimer l'activité
  for (const jour of ceVoyage.jours) {
    const index = jour.activites.findIndex((act) => act.id === activiteId);
    if (index !== -1) {
      activiteTrouvee = jour.activites[index];
      jour.activites.splice(index, 1); // Suppression de l'activité
      break;
    }
  }

  if (!activiteTrouvee) {
    return res.status(404).json({ message: "Activité non trouvée" });
  }

  // Sauvegarde du voyage modifié
  fs.writeFileSync(voyagePath, JSON.stringify(ceVoyage, null, 2), "utf8");

  res.json({ message: "Activité supprimée avec succès", activite: activiteTrouvee });
});
// 🔥 Lancer le serveur
app.listen(PORT, () =>
  console.log(`Serveur en ligne sur http://localhost:${PORT}`)
);

// Modifier une activité

app.put("/api/voyage_:id/:activiteId", (req, res) => {
  console.log("requête de modification");

  const voyageId = req.params.id;
  const activiteId = req.params.activiteId;
  const updatedActivity = req.body;
  const voyagePath = path.join(DATA_PATH, `voyage_${voyageId}.json`);

  if (!fs.existsSync(voyagePath)) {
    return res.status(404).json({ error: "Voyage non trouvé" });
  }

  fs.readFile(voyagePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur de lecture du fichier" });

    let voyage = JSON.parse(data);
    let activiteTrouvee = null;

    // Parcours des jours pour trouver l’activité
    for (let jour of voyage.jours) {
      const index = jour.activites.findIndex(act => act.id === activiteId);
      if (index !== -1) {
        // Activité trouvée : mise à jour
        jour.activites[index] = { ...jour.activites[index], ...updatedActivity };
        activiteTrouvee = jour.activites[index];
        break;
      }
    }

    if (!activiteTrouvee) {
      return res.status(404).json({ error: "Activité non trouvée" });
    }

    fs.writeFile(voyagePath, JSON.stringify(voyage, null, 2), err => {
      if (err) return res.status(500).json({ error: "Erreur d'écriture du fichier" });
      res.json(activiteTrouvee);
    });
  });
});