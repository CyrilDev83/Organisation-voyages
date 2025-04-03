

const dataFiche = {
  date: "01 avril 2025",
  titre: "trajet",
  duree: "5 jours",
};
const params = new URLSearchParams(window.location.search);
let voyageId = params.get("id");
voyageId = +voyageId;


const reponse = await fetch(`http://localhost:3001/api/voyage_${voyageId}`);
let voyage = await reponse.json();

// const activites = voyage.jours[1].activites[5].titre
// console.log(activites)

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
    // fiches.appendChild(fiche);
  }
}

const addFiche = document.querySelectorAll(".addFiche");
addFiche.forEach((element) => {
  element.addEventListener("click", (event) => {
 
    const parent = event.target.parentNode;
    const jourId = +parent.id;

    ajouterActivite(jourId, dataFiche); // Ajoute l'activité sans recharger la page
  });
});

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

      fichesContainer.appendChild(fiche);
    }
  }
}

