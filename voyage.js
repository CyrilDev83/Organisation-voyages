class Activite {
  constructor({ id, titre, lieu, type, prix, heure, duree, commentaire }) {
    this.id = id;
    this.titre = titre;
    this.lieu = lieu;
    this.type = type;
    this.prix = prix;
    this.heure = heure;
    this.duree = duree;
    this.commentaire = commentaire;
  }
}

class Jour {
  constructor(date, activites = []) {
    this.date = date;
    this.activites = activites.map((act) => new Activite(act));
  }

  ajouterActivite(activite) {
    this.activites.push(activite);
  }

  supprimerActivite(id) {
    this.activites = this.activites.filter((act) => act.id !== id);
  }

  // Trier les activités par heure croissante (utile pour l'affichage)
  trierActivitesParHeure() {
    this.activites.sort((a, b) => a.heure.localeCompare(b.heure));
  }
}

const params = new URLSearchParams(window.location.search);
let voyageId = +params.get("id");
let jourId = 0;

const reponse = await fetch(`http://localhost:3001/api/voyage_${voyageId}`);
let voyage = await reponse.json();

// Recréer les jours avec la classe Jour
voyage.jours = voyage.jours.map((jour) => new Jour(jour.date, jour.activites));

const titre = document.querySelector(".titre");
titre.innerText = `${voyage.titre}`;
const modal = document.getElementById("formulaireActivite");

creationJours(voyage.jours.length);
affichageActivites();

document.querySelectorAll(".addFiche").forEach((add) => {
  add.addEventListener("click", (event) => {
    nouvelleActivite(event);
  });
});

function creationJours(nb) {
  for (let i = 1; i <= nb; i++) {
    const jours = document.querySelector(".jours");
    const jour = document.createElement("section");
    jour.classList.add("jour");
    jour.id = i;
    const numJour = document.createElement("h3");
    numJour.classList.add("num-jour");
    numJour.innerText = `Day ${i}`;
    const fiches = document.createElement("div");
    fiches.classList.add("fiches");
    const add = document.createElement("div");
    add.classList.add("addFiche");
    add.innerText = "add";
    jour.appendChild(numJour);
    jour.appendChild(fiches);
    jour.appendChild(add);
    jours.appendChild(jour);
  }
}

function ajouterActivite(jourId, activite) {
  fetch(
    `http://localhost:3001/api/voyage_${voyageId}/jours/jour${jourId}/activites`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activite),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("✅ Activité ajoutée :", data);
      const activite = new Activite(data);
      voyage.jours[jourId - 1].ajouterActivite(activite);
      affichageActivites();
    })
    .catch((error) => console.error("Erreur :", error));
}

function affichageActivites() {
  // const joursContainer = document.querySelector(".jours");

  for (let e = 0; e < voyage.jours.length; e++) {
    const jour = voyage.jours[e];
    jour.trierActivitesParHeure(); // ← 🔥 ici on trie avant d'afficher

    for (let e = 0; e < voyage.jours.length; e++) {
      const jourdiv = document.getElementById(e + 1);
      if (!jourdiv) continue;

      const fichesContainer = jourdiv.querySelector(".fiches");
      fichesContainer.innerHTML = "";

      for (let i = 0; i < voyage.jours[e].activites.length; i++) {
        const fiche = document.createElement("article");
        fiche.classList.add("fiche");
        fiche.innerText = voyage.jours[e].activites[i].titre;
        fiche.id = voyage.jours[e].activites[i].id;
        fiche.addEventListener("click", () => {
          creerFiche(voyage.jours[e].activites[i]);
          console.log("fonction: affichageActivite");
        });
        fichesContainer.appendChild(fiche);
      }
    }
  }
}

function creerFiche(activite) {
  const titreFiche = document.querySelector("#titre");
  titreFiche.value = activite.titre;
  const lieu = document.querySelector("#lieu");
  lieu.value = activite.lieu;
  const type = document.querySelector("#type");
  type.value = activite.type;
  const heure = document.querySelector("#heure");
  heure.value = activite.heure;
  const duree = document.querySelector("#duree");
  duree.value = activite.duree;
  const prix = document.querySelector("#prix");
  prix.value = activite.prix;
  const commentaire = document.querySelector("#commentaire");
  commentaire.value = activite.commentaire;

  affichageFicheActivite();

  const btnFermeFicheActivite = document.querySelector(".fermerActivite");
  btnFermeFicheActivite.addEventListener("click", () => {
    fermetureFicheActivite();
  });

  const btnDelete = document.querySelector(".deleteActivite");
  btnDelete.addEventListener("click", (e) => {
    supprimerActivite(activite.id);
  });

  const btnModifier = document.querySelector(".modifierActivite");
  btnModifier.addEventListener("click", (e) => {
    affichageModifierActivite();
  });

  const btnEnregistrerNewActivité = document.querySelector(".enregistrerNewActivite");
  btnEnregistrerNewActivité.addEventListener("click", () => {
    enregistrerNewActivite();
  });
  const btnEnregistrerModifications = document.querySelector(".enregistrerModification");
  btnEnregistrerModifications.addEventListener("click", () => {
    enregistrerModification(activite.id);
  });

  recupPhoto(activite.lieu);


}

function recupPhoto(place) {
  if (place) {
    const image = document.getElementById("image-lieu");
    const accessKey = "Sl-xrjWtpOWmoPVqlnovMkM6-Hupaxr41AU2Q12gTNA";
    const url = `https://api.unsplash.com/search/photos?query=${place}&client_id=${accessKey}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          image.src = data.results[0].urls.regular;
        } else {
          photoLieu.src =
            "./ressource/luke-stackpoole-eWqOgJ-lfiI-unsplash.jpg";
        }
      })
      .catch((error) => console.error("Erreur de chargement d'image:", error));
  }
}

function affichageFicheActivite() {
  const modalActivite = document.querySelector(".modalActivite");
  modalActivite.style.display = "flex";
  console.log("fonction: affichageFicheActivite");
}

function fermetureFicheActivite() {
  const modalActivite = document.querySelector(".modalActivite");
  modalActivite.style.display = "none";
  // enregistrerActivite()
  // affichageEnregistrerActivite()
  console.log("fonction: fermetureFicheActivite")
}

function supprimerActivite(activiteId) {
  fetch(`http://localhost:3001/api/voyage_${voyageId}/${activiteId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => console.log("Réponse du serveur :", data))
    .catch((error) => console.error("Erreur lors de la suppression :", error));
}

function enregistrerModification(activiteId) {
  
  console.log(activiteId)
  // affichageModifierActivite();
  const activiteModifiee = {
    id: activiteId,
    titre: document.getElementById("titre").value,
    type: document.getElementById("type").value,
    lieu: document.getElementById("lieu").value,
    heure: document.getElementById("heure").value,
    prix: document.getElementById("prix").value,
    duree: document.getElementById("duree").value,
    commentaire: document.getElementById("commentaire").value,
  };

 fetch(`http://localhost:3001/api/voyage_${voyageId}/${activiteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activiteModifiee),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => console.log("Réponse du serveur :", data))
    .catch((error) => console.error("Erreur lors de la suppression :", error));
}

function affichageModifierActivite() {
  modifierChampsActivite()
  document.querySelector(".modifierActivite").style.display = "none";
  const btnEnregistrerModification = document.querySelector(".enregistrerModification");
  btnEnregistrerModification.style.display = "block";
  // btnEnregistrerModification.addEventListener("click", (e) => {
  //   affichageEnregistrerActivite();
  // });
  console.log("fonction: affichageModifierActivite")
  console.log("pret pour modification");
}

function affichageEnregistrerNewActivite() {
  const btnEnregistrerNewActivite = document.querySelector(".enregistrerNewActivite");
  btnEnregistrerNewActivite.style.display = "block";
  document.querySelector(".modifierActivite").style.display = "none";
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = true;
    el.classList.remove("modifier");
  });
}
function enregistrerNewActivite() {
  const dataFiche = {
    id: Date.now().toString(),
    titre: document.getElementById("titre").value,
    type: document.getElementById("type").value,
    lieu: document.getElementById("lieu").value,
    heure: document.getElementById("heure").value,
    prix: document.getElementById("prix").value,
    duree: document.getElementById("duree").value,
    commentaire: document.getElementById("commentaire").value,
  };
  console.log(dataFiche);
  ajouterActivite(jourId, dataFiche);
  console.log("activité enregistrer");
}

function nouvelleActivite(event) {
  const parent = event.target.parentNode;
  jourId = +parent.id;
  affichageEnregistrerNewActivite();
  modifierChampsActivite()
  console.log("fonction: nouvelleActivite");
  const nouvelleActivite = new Activite({
    id: 0,
    titre: "",
    lieu: "",
    type: "",
    prix: 0,
    heure: "",
    duree: 0,
    commentaire: "",
  });
  creerFiche(nouvelleActivite);
}

function modifierChampsActivite () {
    document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = !el.disabled;
    el.classList.add("modifier");
    console.log("fonction: modifierChampsActivite")
  });
}