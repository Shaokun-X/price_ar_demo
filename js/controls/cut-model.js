
// import CSG from "../lib/three-csg.js";

// document.addEventListener("DOMContentLoaded",
$.ready(
    ()=>{
    const cutBtn = document.getElementById("cutBtn");
    const cutSwitch = document.getElementById("cutSwitch");
    const mainModel = document.getElementById("mainModel");
    const cutBox = document.getElementById("cutBox");

    // initialize cut box geometry
    
    // let lines = new THREE.LineSegments(new THREE.EdgesGeometry(cutBox.object3D.geometry));


    cutSwitch.oninput = (evt) => {
        if (cutSwitch.checked) {
            cutBtn.style.display = "";
            mainModel.getAttribute("gesture-handler").enabled = false;
            cutBox.setAttribute("visible", true);
            cutBox.getAttribute("gesture-handler").enabled = true;

        } else {
            cutBtn.style.display = "none";
            mainModel.getAttribute("gesture-handler").enabled = true;
            cutBox.setAttribute("visible", false);
            cutBox.getAttribute("gesture-handler").enabled = false;
        }
    };

    function CSGintersect(a, b) {
        let bspA = CSG.fromMesh(a);
        let bspB = CSG.fromMesh(b);
        let bspC = bspA['intersect'](bspB);
        let result = CSG.toMesh(bspC, a.matrix);
        return result;
    }

    cutBtn.onclick = (evt) => {
        showMessage("Cutting, please wait...");
        // the result of boolean operation
        let result = CSGintersect(mainModel.getObject3D("mesh"), cutBox.getObject3D("mesh"));
        mainModel.setObject3D("mesh", result);
        console.log(result)
    };
});
