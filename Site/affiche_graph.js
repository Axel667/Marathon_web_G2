function afficherGraphique() {
    // Récupérer l'élément contenant le graphique
    var graphiqueContent = document.getElementById("graphiqueContent");

    // Effacer le contenu actuel du conteneur
    graphiqueContent.innerHTML = '';

    // Créer un élément script pour charger le script graphique.js
    var scriptElement = document.createElement("script");
    scriptElement.src = "graphique.js";

    // Ajouter l'élément script au conteneur
    graphiqueContent.appendChild(scriptElement);
}