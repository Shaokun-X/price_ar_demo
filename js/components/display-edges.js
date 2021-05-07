/* global AFRAME, THREE */

AFRAME.registerComponent("display-edges", {
    schema: {
        color: { default: "#00ffff" },
        linewidth: { default: 50 },
    },

    init: function () {
        this.el.getObject3D("mesh").material.transparent = true;
        this.el.getObject3D("mesh").material.opacity = 0;
        let geometry = new THREE.EdgesGeometry(this.el.getObject3D("mesh").geometry);
        let lines = new THREE.LineSegments(
            geometry,
            new THREE.LineBasicMaterial({
                color: this.data.color,
                linewidth: this.data.linewidth
            }))
        ;
        // console.log(lines)
        this.el.setObject3D("lines", lines);
    },

    update: function () {

    },

    remove: function () {

    },

});