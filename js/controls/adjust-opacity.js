$.ready( () => {
    const opacityRange = document.getElementById("opacityRange");
    const opacityText = document.getElementById("opacityText");
    const model = document.querySelector("a-entity");

    // enable opacity
    // TODO use components `material`
    model.addEventListener("stl-loaded", (evt) => {
        model.getObject3D("mesh").material.transparent = true;
        opacityRange.oninput = (evt) => {
            opacityText.innerText = opacityRange.value + "%";
            model.getObject3D("mesh").material.opacity = Number(opacityRange.value) / 100;
        }
    });
});