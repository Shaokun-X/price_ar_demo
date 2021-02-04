const control = {
    "bind": (sceneEl) => {
        let isMarkerVisible;

        sceneEl.addEventListener("markerFound", (e) => {
            isMarkerVisible = true;
        });

        sceneEl.addEventListener("markerLost", (e) => {
            isMarkerVisible = false;
        });

        function handleRotation(event) {
            if (isMarkerVisible) {
                el.object3D.rotation.y +=
                    event.detail.positionChange.x * rotationFactor;

                el.object3D.rotation.x +=
                    event.detail.positionChange.y * rotationFactor;
            }
        }

        function handleScale(event) {
            if (isMarkerVisible) {
                this.scaleFactor *=
                    1 + event.detail.spreadChange / event.detail.startSpread;

                this.scaleFactor = Math.min(
                    Math.max(this.scaleFactor, this.data.minScale),
                    this.data.maxScale
                );

                el.object3D.scale.x = scaleFactor * initialScale.x;
                el.object3D.scale.y = scaleFactor * initialScale.y;
                el.object3D.scale.z = scaleFactor * initialScale.z;
            }
        }
        sceneEl.addEventListener("onefingermove", handleRotation);
        sceneEl.addEventListener("twofingermove", handleScale);
    }    
}