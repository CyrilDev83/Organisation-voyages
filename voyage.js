const params = new URLSearchParams(window.location.search);
let voyageId = params.get("id");
voyageId = +voyageId

const reponse = await fetch(`http://localhost:3001/api/voyage_${voyageId}`);
const voyage = await reponse.json();
console.log(voyage);



const titre = document.querySelector(".titre");
console.log(titre);
titre.innerHTML= `${voyage.titre}`;
