const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3001;
const DATA_FILE = "data/voyages.json";

app.use(cors()); // Autorise les requêtes depuis le frontend
app.use(express.json()); // Permet de lire le JSON dans les requêtes

// app.get("/", (req, res) => {
//     res.send("Le serveur fonctionne !");
// });

// Lire tous les voyages
app.get("/api/voyages", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Erreur de lecture du fichier" });
    res.json(JSON.parse(data));
  });
});

// Lire un voyage spécifique
app.get("/api/voyages/:id", (req, res) => {
  console.log("Requête GET reçue pour l'ID :", req.params.id);
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Erreur de lecture du fichier" });

    const voyages = JSON.parse(data);
    const voyage = voyages.find((v) => v.id === req.params.id);
    if (!voyage) return res.status(404).json({ error: "Voyage non trouvé" });

    res.json(voyage);
  });
});

app.post("/api/voyages", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Erreur de lecture du fichier" });

    let voyages = JSON.parse(data); // Récupère les voyages existants
    const nouveauVoyage = req.body; // Récupère le voyage envoyé en POST

    // Vérifie si l'ID existe déjà
    if (voyages.find((v) => v.id === nouveauVoyage.id)) {
      return res.status(400).json({ error: "ID déjà utilisé" });
    }

    voyages.push(nouveauVoyage); // Ajoute le nouveau voyage
    fs.writeFile(DATA_FILE, JSON.stringify(voyages, null, 2), "utf8", (err) => {
      if (err)
        return res.status(500).json({ error: "Erreur d'écriture du fichier" });

      res.status(201).json(nouveauVoyage); // Renvoie le voyage ajouté
    });
  });
});



app.delete("/api/voyages/:id", (req, res) => {
  console.log("Requête DELETE reçue pour l'ID :", req.params.id);
  const id = req.params.id;

  // Lire le fichier JSON
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture du fichier :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    let voyages = JSON.parse(data);
    const voyageIndex = voyages.findIndex((v) => v.id === id);

    if (voyageIndex === -1) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    // Supprimer le voyage
    voyages.splice(voyageIndex, 1);

    // Réécrire le fichier JSON après suppression
    fs.writeFile(DATA_FILE, JSON.stringify(voyages, null, 2), (err) => {
      if (err) {
        console.error("Erreur d'écriture dans le fichier :", err);
        return res
          .status(500)
          .json({ error: "Impossible de supprimer le voyage" });
      }

      res.json({ message: "Voyage supprimé avec succès" });
    });
  });
});

// Démarrer le serveur
app.listen(PORT, () =>
  console.log(`Serveur en ligne sur http://localhost:${PORT}`)
);
