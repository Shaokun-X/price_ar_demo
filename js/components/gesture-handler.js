/* global AFRAME, THREE */

AFRAME.registerComponent("gesture-handler", {
    schema: {
        enabled: { default: true },
        rotationFactor: { default: 5 },
        minScale: { default: 0.3 },
        maxScale: { default: 8 },
    },

    init: function () {
        this.handleScale = this.handleScale.bind(this);
        this.handleRotation = this.handleRotation.bind(this);

        this.isVisible = false;
        this.initialScale = this.el.object3D.scale.clone();
        this.scaleFactor = 1;

        this.el.sceneEl.addEventListener("markerFound", (e) => {
            this.isVisible = true;
        });

        this.el.sceneEl.addEventListener("markerLost", (e) => {
            this.isVisible = false;
        });
    },

    update: function () {
        // if (this.data.enabled) {
        this.el.sceneEl.addEventListener("onefingermove", this.handleRotation);
        this.el.sceneEl.addEventListener("twofingermove", this.handleScale);
        // } else {
        //     this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
        //     this.el.sceneEl.removeEventListener("twofingermove", this.handleScale);
        // }
    },

    remove: function () {
        this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
        this.el.sceneEl.removeEventListener("twofingermove", this.handleScale);
    },

    handleRotation: function (event) {
        if (!this.data.enabled){
            return;
        }
        if (this.isVisible) {
            this.el.object3D.rotation.y +=
                event.detail.positionChange.x * this.data.rotationFactor;
            this.el.object3D.rotation.x +=
                event.detail.positionChange.y * this.data.rotationFactor;
        }
    },

    handleScale: function (event) {
        if (!this.data.enabled) {
            return;
        }
        if (this.isVisible) {
            this.scaleFactor *=
                1 + event.detail.spreadChange / event.detail.startSpread;

            this.scaleFactor = Math.min(
                Math.max(this.scaleFactor, this.data.minScale),
                this.data.maxScale
            );

            this.el.object3D.scale.x = this.scaleFactor * this.initialScale.x;
            this.el.object3D.scale.y = this.scaleFactor * this.initialScale.y;
            this.el.object3D.scale.z = this.scaleFactor * this.initialScale.z;
        }
    },

    raycastDetect() {
        let camera = document.querySelector("a-scene").camera;
        let mouse3D = new THREE.Vector2(
            (evt.clientX / window.innerWidth) * 2 - 1,
            -(evt.clientY / window.innerHeight) * 2 + 1
        );
        // console.log(mouse3D)
        // console.log(camera.position)
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse3D, camera);
        let objects = Array.from(document.querySelectorAll("a-marker a-entity"));
        objects = objects.map((e, i) => { return e.object3D })
        // console.log(objects)
        let intersects = raycaster.intersectObjects(objects, true);
        // console.log(intersects)
        if (intersects.length > 0) {
            return true;
        }
        return false;
    },
    
});