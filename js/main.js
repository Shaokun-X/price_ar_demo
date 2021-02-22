document.addEventListener("DOMContentLoaded", (evt) => {
    document.addEventListener("markerFound", () => {
        console.log("👀found marker");
    });

    document.addEventListener("markerLost", () => {
        console.log("😖lost marker");
    });
    
    const loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.style.display = '';
    const progressBar = document.getElementById("progressBar");
    
    const heartAssetItem = document.getElementById("heart");
    heartAssetItem.addEventListener("progress", (evt) => {
        // progressBar.
        progressBar.max = evt.detail.xhr.total;
        progressBar.value = evt.detail.xhr.loaded;
        console.log(evt.detail.xhr);
    });

    heartAssetItem.addEventListener("loaded", (evt) => {
        loadingScreen.classList.add("hide");
        loadingScreen.classList.remove("show");
        loadingScreen.style.display = 'none';
    });

});