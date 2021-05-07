const $ = {};
$.ready = (f) => { document.addEventListener("DOMContentLoaded", f)};
$.ready(() => {

    /*
     * custom scroll bar
     */
    window.Scrollbar.init(document.querySelector('.control__body'), {
        damping: 0.7,
        renderByPixels: true,
    });

    /*
     * marker debug info
     */
    document.addEventListener("markerFound", () => {
        console.log("👀found marker");
    });

    document.addEventListener("markerLost", () => {
        console.log("😖lost marker");
    });
    
    /*
     * initialize file input plugin
     */
    bsCustomFileInput.init()



});