// window.addEventListener("beforeunload", (event) => {
//     console.log("🚨 Attention, la page tente de se recharger !");
//     event.preventDefault();
//   });

const dataFiche = {
  date: "01 avril 2025",
  titre: "trajet",
  duree: "5 jours",
};
const params = new URLSearchParams(window.location.search);
let voyageId = params.get("id");
voyageId = +voyageId;
console.log(voyageId);

const reponse = await fetch(`http://localhost:3001/api/voyage_${voyageId}`);
let voyage = await reponse.json();
console.log(voyage);

const titre = document.querySelector(".titre");
titre.innerText = `${voyage.titre}`;

const nbJours = voyage.duree;
console.group(nbJours);

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
    jour.appendChild(numJour);
    jour.appendChild(fiches);
    jour.appendChild(add);
    jours.appendChild(jour);
  }
}
creationJours(nbJours);

const addFiche = document.querySelectorAll(".addFiche");
addFiche.forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

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
      const fiches = document.getElementById(jourId).querySelector(".fiches");
      const fiche = document.createElement("article");
      fiche.classList.add("fiche");
      fiche.innerText = data.titre; // Afficher le titre de l'activité
      fiches.appendChild(fiche);
    })
    .catch((error) => console.error("Erreur :", error));
}
// window.addEventListener("beforeunload", (event) => {
//     console.log("🚨 ATTENTION : Quelque chose recharge la page !");
//     console.trace(); // 🔍 Affiche la pile d'appels pour voir d'où ça vient
//     event.preventDefault();
//   });
