function toggleInstructions() {
    var instructionsContainer = document.getElementById("instructionsContainer");
    var toggleInstructionsButton = document.getElementById("toggleInstructionsButton")
    if (window.getComputedStyle(instructionsContainer).display === "none") {
        instructionsContainer.style.display = "grid";
        toggleInstructionsButton.innerHTML = "Hide"
    } else {
        console.log("test is some")
        instructionsContainer.style.display = "none";
        toggleInstructionsButton.innerHTML = "Instructions"
    }
}