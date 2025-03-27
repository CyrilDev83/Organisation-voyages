const params = new URLSearchParams(window.location.search);
let voyageId = params.get("id");
voyageId = +voyageId

const reponse = await fetch(`http://localhost:3001/api/voyage_${voyageId}`);
const voyage = await reponse.json();
console.log(voyage);



const titre = document.querySelector(".titre");
titre.innerHTML= `${voyage.titre}`;

const nbJours = voyage.duree
console.log(nbJours)


function creationJours(nb) {
    for (let i=1; i<=nb; i++) {
const jours = document.querySelector(".jours")
const jour = document.createElement("section")
jour.classList.add("jour")
const numJour = document.createElement("h3")
numJour.classList.add("num-jour")
numJour.innerText = `Day ${i}`
const fiches = document.createElement("div")
fiches.classList.add("fiches")


const add = document.createElement("button")
add.classList.add("addFiche")
add.innerText = "add"

jour.appendChild(numJour)
jour.appendChild(fiches)
jour.appendChild(add)
jours.appendChild(jour)





console.log(jour)
}}


creationJours(nbJours)