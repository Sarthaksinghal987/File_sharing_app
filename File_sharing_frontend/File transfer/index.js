const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileinput");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");
const maxAllowedSize = 100 * 1024 * 1024;

const host = "http://localhost:5500";
const uploadURL = `${host}/api/files/`;
const emailURL = `${host}/api/files/send`;

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files =e.dataTransfer.files;
    if(files.length === 1)
    {
        console.log("dropped");
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener("change",()=>{
    uploadFile();
});

browseBtn.addEventListener("click", ()=>{
    fileInput.click();
});

copyBtn.addEventListener("click", ()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied");
});

const uploadFile = ()=>{
    console.log("file added uploading");
    if(fileInput.files.length > 1)
    {
        fileInput.value = "";
        showToast("Only upload 1 file!");
        return;
    }
    const file = fileInput.files[0];
    if(file.size > maxAllowedSize)
    {
        fileInput.value = "";
        showToast("File size limit exceed!");
        return;
    }
    progressContainer.style.display = "block";
    const formData = new FormData();
    formData.append("myfile",file);
    console.log(file);
    console.log(formData);
    const xhr =new XMLHttpRequest();
    
    xhr.upload.onerror = ()=>{
        fileInput.value = "";
        showToast(`Error in upload`);
        return;
    }

    xhr.upload.onprogress = updateProgress;

    

    xhr.onreadystatechange = ()=>{
        console.log(xhr.readyState);
        if(xhr.readyState== XMLHttpRequest.DONE){
            console.log(xhr.responseText.url);
            onUploadSuccess(xhr.responseText);
        }
    };



    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

const updateProgress = (e)=>{
    console.log("uploading");
    console.log(e);
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innertext= percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
};

const onUploadSuccess = (res)=>{
    fileInput.value="";
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    const {file: url} = JSON.parse(res);
    console.log(url);
    fileURLInput.value = url;
};

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const url = fileURLInput.value;
    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disabled", "true");

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((res)=>res.json())
        .then((data)=>{
        if(data.success) {
            sharingContainer.style.display="none";
            showToast("Email Sent");
        }
    });
});

let toastTimer;

const msg="";

const showToast = (msg)=>{
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.style.transform  = `translate(-50%,0)`;
    toastTimer = setTimeout(()=>{
        toast.style.transform  = `translate(-50%,60px)`;
    },2000);
}
