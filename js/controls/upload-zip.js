$.ready(() => {

    /*
     * conversion
     */
    const API_BASE_URL = "https://api.pricedemo.tk/";
    
    
    // long-polling to query progress of conversion
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
                conversionBarInside.style.width = data.value + "%";
            } else {
                showMessage("Success");
                indicator.style.display = 'none';
                conversionBar.style.display = 'none';
                console.log("Successfully loaded conversion result")
                const entity = document.querySelector("a-entity");
                entity.setAttribute("stl-model", { src: API_BASE_URL + "asset/convertedModel.stl" });
                indicator.style.display = 'none';
                conversionBar.style.display = 'none';
                const downloadBtn = document.getElementById("stlDownload");
                downloadBtn.style.display = "";
                downloadBtn.setAttribute("href", API_BASE_URL + "asset/convertedModel.stl");
            }
        }
    }

    function onSuccess() {

    }
    
    // upload file and do the conversion
    const form = document.getElementById("convertForm");
    const conversionBar = document.getElementById("conversionBar");
    const conversionBarInside = document.getElementById("conversionBarInside");
    const indicator = document.getElementById("indicator");
    
    form.addEventListener('submit', evt => {
        console.log('form submit')
        evt.preventDefault();
    
    
        let file = document.getElementById("myFile").files[0];
        let data = new FormData();
        data.append('zip', file, file.name)
    
        let xhr = new XMLHttpRequest();
        xhr.open("POST", API_BASE_URL + "convert/", true);
    
        xhr.upload.addEventListener('progress', function (evt) {
            let percent_completed = (evt.loaded / evt.total) * 100;
            // console.log(percent_completed);
            indicator.innerText = "Uploading..." + percent_completed.toFixed(2) + '%'
            conversionBarInside.style.width = percent_completed.toFixed(2) + '%';
        });
    
        xhr.onload = function (evt) {
            if (xhr.status == 200) {
                console.log(xhr);
                console.log(typeof xhr.response);
                queryProgress();
            } else {
                showMessage("Fail");
                console.log(evt);
            }
        };
    
        indicator.style.display = '';
        conversionBar.style.display = '';
        xhr.send(data);
    
    });
});