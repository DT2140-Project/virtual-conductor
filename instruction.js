function toggleInstructions() {
    var instructionsContainer = document.getElementById("instructionsContainer");
    var toggleInstructionsButton = document.getElementById("toggleInstructionsButton")
    if (instructionsContainer.style.display === "none") {
        instructionsContainer.style.display = "grid";
        toggleInstructionsButton.innerHTML = "Hide"
    } else {
        instructionsContainer.style.display = "none";
        toggleInstructionsButton.innerHTML = "Instructions"
    }
}