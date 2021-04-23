document.addEventListener("DOMContentLoaded", () => {
    const model = document.querySelector("a-entity");
    const xIncBtn = document.getElementById("xIncBtn");
    const yIncBtn = document.getElementById("yIncBtn");
    const zIncBtn = document.getElementById("zIncBtn");
    const xDecBtn = document.getElementById("xDecBtn");
    const yDecBtn = document.getElementById("yDecBtn");
    const zDecBtn = document.getElementById("zDecBtn");
    const deltaValueInput = document.getElementById("deltaValueInput");
    let delta = 1;
    deltaValueInput.value = delta;
    deltaValueInput.oninput = () => {
        delta = Number(deltaValueInput.value);
    }

    xIncBtn.onclick = () => {
        model.getObject3D("mesh").geometry.translate(delta, 0, 0);
        model.getObject3D("mesh").geometry.computeBoundingBox();
        console.log(model.getObject3D("mesh").geometry.boundingBox)
    }
    yIncBtn.onclick = () => {
        model.getObject3D("mesh").geometry.translate(0, delta, 0);
        model.getObject3D("mesh").geometry.computeBoundingBox();
        console.log(model.getObject3D("mesh").geometry.boundingBox)
    }
    zIncBtn.onclick = () => {
        model.getObject3D("mesh").geometry.translate(0, 0, delta);
        model.getObject3D("mesh").geometry.computeBoundingBox();
        console.log(model.getObject3D("mesh").geometry.boundingBox)
    }
    xDecBtn.onclick = () => {
        model.getObject3D("mesh").geometry.translate(-delta, 0, 0);
        model.getObject3D("mesh").geometry.computeBoundingBox();
        console.log(model.getObject3D("mesh").geometry.boundingBox)
    }
    yDecBtn.onclick = () => {
        model.getObject3D("mesh").geometry.translate(0, -delta, 0);
        model.getObject3D("mesh").geometry.computeBoundingBox();
        console.log(model.getObject3D("mesh").geometry.boundingBox)
    }
    zDecBtn.onclick = () => {
        model.getObject3D("mesh").geometry.translate(0, 0, -delta);
        model.getObject3D("mesh").geometry.computeBoundingBox();
        console.log(model.getObject3D("mesh").geometry.boundingBox)
    }
});

