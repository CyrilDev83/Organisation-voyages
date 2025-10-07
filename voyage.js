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
  constructor(jour, activites = []) {
    this.jour = jour;
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
voyage.jours = voyage.jours.map((jour) => new Jour(jour.jour, jour.activites));

const titre = document.querySelector(".titre");
titre.innerText = `${voyage.titre}`;
const modal = document.getElementById("formulaireActivite");

creationJours(voyage.jours.length);
affichageActivites();

// déatil des jours
// document.querySelectorAll(".num-jour").forEach((jour) => {
//   jour.addEventListener("click", (event) => {
//     affichageJour(event)
//   })
// })

// Bouton Add
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
  for (let i = 0; i < voyage.jours.length; i++) {
    const jour = voyage.jours[i];
    jour.trierActivitesParHeure(); // Tri des activités

    const jourdiv = document.getElementById(i + 1);
    if (!jourdiv) continue;

    const fichesContainer = jourdiv.querySelector(".fiches");
    fichesContainer.innerHTML = "";

    for (let activite of jour.activites) {
      const fiche = document.createElement("article");
      fiche.classList.add("fiche");
      fiche.innerText = activite.titre;
      fiche.id = activite.id;
      fiche.addEventListener("click", () => {
        creerFiche(activite);
        console.log("fonction: affichageActivite");
      });
      fichesContainer.appendChild(fiche);
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

  const btnEnregistrerNewActivité = document.querySelector(
    ".enregistrerNewActivite"
  );
  btnEnregistrerNewActivité.addEventListener("click", () => {
    enregistrerNewActivite();
  });
  const btnEnregistrerModifications = document.querySelector(
    ".enregistrerModification"
  );
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
  console.log("fonction: fermetureFicheActivite");
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
  modifierChampsActivite();
  document.querySelector(".modifierActivite").style.display = "none";
  document.querySelector(".enregistrerModification").style.display = "block";
  document.querySelector(".deleteActivite").style.display = "none";
  document.querySelector(".fermerActivite").style.display = "none";
  // document.querySelector(".fermerActivite").innerText = "Annuler";

  console.log("fonction: affichageModifierActivite");
  console.log("pret pour modification");
}

function affichageEnregistrerNewActivite() {
  document.querySelector(".enregistrerNewActivite").style.display = "block";
  document.querySelector(".deleteActivite").style.display = "none";
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
  modifierChampsActivite();
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

function modifierChampsActivite() {
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = !el.disabled;
    el.classList.add("modifier");
    console.log("fonction: modifierChampsActivite");
  });
}

// function affichageJour(e) {
//   recupJourId(e)
// }

// function recupJourId(event) {
//    const parent = event.target.parentNode;
//   jourId = +parent.id;
//   console.log(jourId)
// }

function genererAgenda(dateDepartStr, duree) {
  const agenda = document.querySelector("#agenda");
  agenda.innerText = "";

  const dateDepart = new Date(dateDepartStr);

  for (let i = 0; i < duree; i++) {
    let date = new Date(dateDepart + i);
    const jour = date.getDate().toString().padStart(2, "0");
    let numJour = i+1
    const mois = (date.getMonth() + 1).toString().padStart(2, "0");
    const annee = date.getFullYear();
    date.setDate(date.getDate() + i);
    const jourDiv = document.createElement("div");
    jourDiv.classList.add("jourAgenda");
    const titreJour = document.createElement("div");
    titreJour.classList.add("titreJour");
    titreJour.innerText = `Jour ${i + 1} le ${jour}/${mois}/${annee}`;
    jourDiv.appendChild(titreJour);
    const ctnHeure = document.createElement("div");
    ctnHeure.classList.add("ctnHeure");

    for (let h = 0; h < 24; h++) {
      const heureDiv = document.createElement("div");
      heureDiv.classList.add("heureAgenda");
      heureDiv.id = `heureDiv${numJour}-${h}:00`;
      heureDiv.innerText = `${h.toString().padStart(2, "0")}:00`;
      ctnHeure.appendChild(heureDiv);
      jourDiv.appendChild(ctnHeure);
    }
    agenda.appendChild(jourDiv);
  }
  const scrollContainer = document.querySelector(".agenda-scroll");

  scrollContainer.addEventListener("wheel", function (evt) {
    if (evt.deltaY !== 0) {
      evt.preventDefault();
      scrollContainer.scrollLeft += evt.deltaY;
    }
  });
}

genererAgenda(voyage.date, voyage.duree);

function importActivitesAgenda(jours) {
  const jour = jours[0].jour
  console.log(jour)
  for (let i = 0; i < jours[0].activites.length; i++) {
    const activite = jours[0].activites[i];
    console.log(activite);
    const heureDebut = activite.heure;
    console.log(heureDebut);
    const duree = activite.duree;
    console.log(duree);
    const idHeure = `heureDiv${jour}-${heureDebut}`
    console.log(idHeure)
   const blabla = document.getElementById(`${idHeure}`)
   console.log(blabla)
    
  }
}

importActivitesAgenda(voyage.jours);
