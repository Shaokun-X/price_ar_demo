$.ready( () => {
    const loadingWrapper = document.querySelector(".loading-screen");

    // const loadingBar = document.getElementById("loadingBar");
    const loadingBarInside = document.getElementById("loadingBarInside");

    const heartAssetItem = document.getElementById("heart");
    heartAssetItem.addEventListener("progress", (evt) => {
        let percent_completed = (evt.detail.loadedBytes / evt.detail.totalBytes) * 100;
        loadingBarInside.style.width = percent_completed.toFixed(2) + '%'
        // console.log(evt)
        // console.log(percent_completed)
    });

    heartAssetItem.addEventListener("loaded", (evt) => {
        loadingWrapper.classList.add("hide");
        // loadingWrapper.classList.remove("show");
        // loadingWrapper.style.display = 'none';
        setTimeout(()=>{
            loadingWrapper.remove();
            // show control panel after loading
            setTimeout(() => {
                const expandBtnBlock = document.querySelector(".control__expand-btn .icon-arrow");
                const drawer = document.querySelector(".control");
                const drawerBody = document.querySelector(".control__body");
                drawerBody.classList.toggle("control__body--expanded");
                expandBtnBlock.classList.toggle("icon-arrow--reverse");
                drawer.classList.toggle("control--hover");
            }, 500);
        }, 500);
    });
});