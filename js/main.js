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
        // console.log(evt.detail.xhr);
    });
    
    heartAssetItem.addEventListener("loaded", (evt) => {
        loadingScreen.classList.add("hide");
        loadingScreen.classList.remove("show");
        loadingScreen.style.display = 'none';
    });
    
    
    const API_BASE_URL = "https://api.pricedemo.tk/";
    // const API_BASE_URL = "http://localhost:9087/";

    // long-polling
    async function queryProgress() {
        let response = await fetch(API_BASE_URL + 'progress');
        indicator.style.display = '';
        conversionBar.style.display = '';
        if (response.status == 502) {
            // Status 502 is a connection timeout error,
            // may happen when the connection was pending for too long,
            // and the remote server or a proxy closed it
            // let's reconnect
            indicator.innerText = "Connection timeout";
            await queryProgress();
        } else if (response.status != 200) {
            // An error - let's show it
            console.log(response.statusText);
            // Reconnect in one second
            indicator.innerText = "Error";
            await new Promise(resolve => setTimeout(resolve, 500));
            await queryProgress();
        } else {
            // Get and show the message
            let message = await response.text();
            console.log(message);
            const data = JSON.parse(message)
            // If not finished continue to query
            if (data.value < 100) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await queryProgress();
                // console.log(percent_completed);
                indicator.innerText = "Converting..." + data.value + '%'
                conversionBar.max = 100;
                conversionBar.value = data.value;
            } else {
                console.log("Successfully loaded model")
                const entity = document.querySelector("a-entity");
                entity.setAttribute("stl-model", { src: API_BASE_URL + "asset/convertedModel.stl" });
                indicator.style.display = 'none';
                conversionBar.style.display = 'none';
            }
        }
    }

    // upload file and do the conversion
    const form = document.getElementById("convertForm");
    const conversionBar = document.getElementById("conversionBar");
    const indicator = document.getElementById("indicator");

    form.addEventListener('submit', evt => {
        console.log('form')
        evt.preventDefault();


        let file = document.getElementById("myFile").files[0];
        let data = new FormData();
        data.append('zip', file, file.name)

        let xhr = new XMLHttpRequest();
        xhr.open("POST", API_BASE_URL + "convert/", true);

        xhr.upload.addEventListener('progress', function(evt) {
            let percent_completed = (evt.loaded / evt.total) * 100;
            // console.log(percent_completed);
            indicator.innerText = "Uploading..." + percent_completed.toFixed(2) + '%'
            conversionBar.max = evt.total;
            conversionBar.value = evt.loaded;
        });

        xhr.onload = function (evt) {
            if (xhr.status == 200) {
                alert('success');
                console.log(xhr);
                console.log(typeof xhr.response);
                indicator.style.display = 'none';
                conversionBar.style.display = 'none';
                queryProgress();
            } else {
                alert('fail');
                console.log(evt);
            }
        };

        indicator.style.display = '';
        conversionBar.style.display = '';
        xhr.send(data);


    })

});