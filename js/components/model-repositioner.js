/* global AFRAME, THREE */

AFRAME.registerComponent("model-repositioner", {
    schema: {
        x: { default: 0 },
        y: { default: 0 },
        z: { default: 0 },
    },

    init: function () {
        this.el.addEventListener("stl-loaded", (evt) => {
            let geo = this.el.getObject3D("mesh").geometry;
            geo.computeBoundingBox();
            // console.log(geo.boundingBox)
            // expected max (x,y,z) of bounding box
            let expectedY = 5.0;
            let expectedX = (geo.boundingBox.max.x - geo.boundingBox.min.x) / 2;
            let expectedZ = (geo.boundingBox.max.z - geo.boundingBox.min.z) / 2;
            geo.translate(
                expectedX - geo.boundingBox.max.x + this.data.x,
                expectedY - geo.boundingBox.max.y + this.data.y,
                expectedZ - geo.boundingBox.max.z + this.data.z
            );
            geo.computeBoundingBox();
            // console.log(geo.boundingBox)
        });
    },

    update: function () {
        
    },

    remove: function () {

    },

});