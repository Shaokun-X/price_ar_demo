document.addEventListener("DOMContentLoaded", () => {
    const expandBtn = document.querySelector(".control__expand-btn .icon-arrow svg");
    const expandBtnBlock = document.querySelector(".control__expand-btn .icon-arrow");
    const drawer = document.querySelector(".control");
    const drawerBody = document.querySelector(".control__body");
    
    expandBtn.onclick = (evt) => {
        drawerBody.classList.toggle("control__body--expanded");
        expandBtnBlock.classList.toggle("icon-arrow--reverse");
        drawer.classList.toggle("control--hover");
    }

    // close when click outside
    window.onclick = evt => {
        const target = evt.target;
        if (!drawer.contains(target)) {
            drawerBody.classList.remove("control__body--expanded");
            expandBtnBlock.classList.remove("icon-arrow--reverse");
            drawer.classList.remove("control--hover");
        }
    }
});

