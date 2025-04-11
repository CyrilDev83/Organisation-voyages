const params = new URLSearchParams(window.location.search);
let voyageId = params.get("id");
voyageId = +voyageId;

const reponse = await fetch(`http://localhost:3001/api/voyage_${voyageId}`);
let voyage = await reponse.json();

const titre = document.querySelector(".titre");
titre.innerText = `${voyage.titre}`;

const nbJours = voyage.duree;

creationJours(nbJours);
affichageActivites();

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
    const add = document.createElement("button");
    add.classList.add("addFiche");
    add.setAttribute("type", "button");
    add.innerText = "add";
    const fiche = document.createElement("article");
    fiche.classList.add("fiche");
    jour.appendChild(numJour);
    jour.appendChild(fiches);
    jour.appendChild(add);
    jours.appendChild(jour);
  }
}

function ajouterActivite(jourId, dataFiche) {
  fetch(
    `http://localhost:3001/api/voyage_${voyageId}/jours/jour${jourId}/activites`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataFiche),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("✅ Activité ajoutée :", data);

      // Ajouter l'activité seulement au jour sélectionné
    })
    .catch((error) => console.error("Erreur :", error));
}

async function affichageActivites() {
  // S'assurer que le conteneur principal existe
  const joursContainer = document.querySelector(".jours");

  // Parcours des jours du voyage
  for (let e = 0; e < voyage.jours.length; e++) {
    // Récupérer le bon conteneur de jour
    const jourdiv = document.getElementById(e + 1); // IDs des jours commencent à 1

    if (!jourdiv) continue; // Sécurité si le jour n'existe pas

    const fichesContainer = jourdiv.querySelector(".fiches"); // Récupérer le conteneur d'activités

    // Vider le conteneur avant de l'afficher (évite les doublons)
    fichesContainer.innerHTML = "";

    // Ajouter les activités du jour
    for (let i = 0; i < voyage.jours[e].activites.length; i++) {
      const fiche = document.createElement("article");
      fiche.classList.add("fiche");
      fiche.innerText = voyage.jours[e].activites[i].titre;
      fiche.id = voyage.jours[e].activites[i].id;
      fichesContainer.appendChild(fiche);
    }
  }
}

// Gestion de la modal
let jourId = 0;
const modal = document.getElementById("modal");

const closeModal = document.querySelector(".close");
const formActivite = document.getElementById("form-activite");

// Ouvrir la modale
const addFiche = document.querySelectorAll(".addFiche");
addFiche.forEach((element) => {
  element.addEventListener("click", (event) => {
    const parent = event.target.parentNode;
    jourId = +parent.id;

    modal.style.display = "block";
    return jourId;
  });
});

// Fermer la modale
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});
// Fermer si on clique en dehors
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

formActivite.addEventListener("submit", (e) => {
  e.preventDefault();
  const dataFiche = {
    id: Date.now().toString(),
    titre: document.getElementById("titre").value,
    lieu: document.getElementById("lieu").value,
    type: document.getElementById("type").value,
    duree: document.getElementById("duree").value,
  };

  ajouterActivite(jourId, dataFiche);
});

const ficheActivite = document.querySelectorAll(".fiche");
console.log(ficheActivite);
ficheActivite.forEach((element) => {
  element.addEventListener("click", (e) => {
    const activiteId = e.target.id;
    for (const jour of voyage.jours) {
      const activite = jour.activites.find((act) => act.id === activiteId);
      if (activite) {
        creerFiche(activite);
      }
    }
  });
});

function creerFiche(activite) {
  const titreFiche = document.querySelector(".titre-fiche");
  const fichePrincipale = document.querySelector(".fiche-principale");
  titreFiche.innerText = activite.titre;
  fichePrincipale.innerText = activite.lieu;
}
