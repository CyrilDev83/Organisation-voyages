const reponse = await fetch(`http://localhost:3001/api/voyages`);
const voyages = await reponse.json();
// console.log(voyages);

function afficherVoyage() {
  for (let i = 0; i < voyages.length; i++) {
    const liste = document.querySelector(".liste");
    const carte = document.createElement("article");
    carte.id = `${voyages[i].id}`;
    carte.classList.add("carte");
    // console.log(carte);

    const aref = document.createElement("a");
    aref.setAttribute("href", `./voyage.html?id= ${voyages[i].id}`);
    aref.setAttribute("target", "_blank");
    liste.appendChild(carte);
    // console.log(aref)
    const article = document.createElement("article");
    article.classList.add("card-voyage");

    const titre = document.createElement("h3");
    titre.innerText = `${voyages[i].titre}`;
    const lieu = document.createElement("p");
    lieu.innerText = `${voyages[i].lieu}`;
    const date = document.createElement("p");
    date.innerText = `${voyages[i].date}`;
    const duree = document.createElement("p");
    duree.innerText = `${voyages[i].duree} jours`;

    const btnSupprimer = document.createElement("button");
    btnSupprimer.classList.add("btn-supprimer");
    btnSupprimer.innerText = "X";
    btnSupprimer.addEventListener("click", (event) => {
      const id = event.target.closest(".carte").id;
      supprimerVoyage(id);
    });

    article.appendChild(titre);
    article.appendChild(lieu);
    article.appendChild(date);
    article.appendChild(duree);

    aref.appendChild(article);
    carte.appendChild(aref);
    carte.appendChild(btnSupprimer);
  }
}

afficherVoyage();

// Gestion de la Modale

const modal = document.getElementById("modal");
const btnNouveauVoyage = document.getElementById("btn-nouveau-voyage");
const closeModal = document.querySelector(".close");
const formVoyage = document.getElementById("form-voyage");

// Ouvrir la modale
btnNouveauVoyage.addEventListener("click", () => {
  modal.style.display = "block";
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

// Envoyer les données au backend
formVoyage.addEventListener("submit", (event) => {
  event.preventDefault(); // Empêche le rechargement de la page

  const nouveauVoyage = {
    id: Date.now().toString(), // Générer un ID unique
    titre: document.getElementById("titre").value,
    lieu: document.getElementById("lieu").value,
    date: document.getElementById("date").value,
    duree: document.getElementById("duree").value,
  };

  fetch("http://localhost:3001/api/voyages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nouveauVoyage),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Voyage ajouté :", data);
      modal.style.display = "none"; // Fermer la modale
      location.reload(); // Recharger la page pour voir le nouveau voyage
    })
    .catch((error) =>
      console.error("Erreur lors de l'ajout du voyage :", error)
    );
});

function supprimerVoyage(id) {
  fetch(`http://localhost:3001/api/voyages/${id}`, {
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

// const btnTest = document.querySelector(".test")
// btnTest.addEventListener("click", () => {
//   console.log("coucou")
//   supprimerVoyage("1")
// })
