/*
 * type: primary, secondary, success, danger, warning, info, light, dark
 */
function showMessage(msg, type) {
   let alert = document.querySelector(".message .alert");
   if (!type) {
       type = "light";
   }
   alert.innerHTML = msg;
   alert.style.display = "";
   alert.style.opacity = 1;
    alert.classList.add("alert-" + type);
   let fadeTimeMs = 1000;
   setTimeout(()=>{
       alert.style.transition = `opacity ${fadeTimeMs}ms`;
       alert.style.opacity = 0;
       setTimeout(()=>{
           alert.innerHTML = "";
            alert.style.display = "none";
            alert.classList.remove("alert-" + type);
       }, fadeTimeMs)
   }, 2000)
}

$.ready(() => {
});