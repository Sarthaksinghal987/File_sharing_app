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

// above lines select elements of a particular class or id using query selector

const maxAllowedSize = 100 * 1024 * 1024;

// this line set maximum allowd size of uploaded file to 100 mb

const host = "http://localhost:5500";
const uploadURL = `${host}/api/files/`;
const emailURL = `${host}/api/files/send`;

//These lines define URLs for uploading files and sending emails. The host variable specifies the base URL, and the other two variables concatenate it with specific endpoints for file upload and email sending.

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
});

//When a drag operation occurs over the drop zone, this event handler prevents the default behavior and adds a "dragged" class to the dropZone element if it doesn't already have it. 

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged");
});

//When the drag operation leaves the drop zone, it removes the "dragged" class from the dropZone element.

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

//When a file is dropped onto the drop zone, it prevents the default behavior, removes the "dragged" class, and checks if there's exactly one file dropped. If so, it assigns the dropped file to the fileInput element and calls the uploadFile() function to start the file upload process.

fileInput.addEventListener("change",()=>{
    uploadFile();
});

//When a file is selected using the file input element (through the file dialog), it calls the uploadFile() function to start the file upload process.

browseBtn.addEventListener("click", ()=>{
    fileInput.click();
});

//When the "Browse" button is clicked, it programmatically triggers a click event on the fileInput element, which opens the file dialog for selecting files.

copyBtn.addEventListener("click", ()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied");
});

//When the "Copy" button is clicked, it selects the text inside the fileURLInput (presumably an input field containing a file URL), copies it to the clipboard using document.execCommand("copy"), and then displays a toast message indicating that the link has been copied.

const uploadFile = ()=>{
    console.log("file added uploading");
    if(fileInput.files.length > 1)              //It first checks if more than one file has been selected, and if so, it displays a toast message and clears the file input.
    {
        fileInput.value = "";
        showToast("Only upload 1 file!");
        return;
    }
    const file = fileInput.files[0];
    if(file.size > maxAllowedSize)              //It also checks if the selected file's size exceeds the maximum allowed size (maxAllowedSize). If it does, it displays a toast message and clears the file input.
    {
        fileInput.value = "";
        showToast("File size limit exceed!");
        return;
    }
    progressContainer.style.display = "block";  //If the file is within the allowed size, it displays a progress bar and creates a FormData object to prepare the file for upload.
    const formData = new FormData();
    formData.append("myfile",file);
    const xhr =new XMLHttpRequest();            //An XMLHttpRequest (xhr) is used to make an HTTP POST request to the uploadURL endpoint with the file data.
    
    xhr.upload.onerror = ()=>{                  //xhr.upload.onerror (to handle errors)
        fileInput.value = "";
        showToast(`Error in upload`);
        return;
    }

    xhr.upload.onprogress = updateProgress;     //xhr.upload.onprogress (to track upload progress using the updateProgress function)

    xhr.onreadystatechange = ()=>{              //xhr.onreadystatechange (to handle the completion of the request and call onUploadSuccess).
        console.log(xhr.readyState);
        if(xhr.readyState== XMLHttpRequest.DONE){
            onUploadSuccess(xhr.responseText);
        }
    };

    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

//This function handles the file upload process when a file is selected or dropped.

const updateProgress = (e)=>{
    console.log("uploading");
    console.log(e);                             //It calculates the upload progress percentage based on the number of bytes loaded and the total file size.
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log(percent);                       //It updates the UI by adjusting the width of the bgProgress element, the innertext of the percentDiv, and the transform property of the progressBar.
    bgProgress.style.width = `${percent}%`;
    percentDiv.innertext= percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
};

//This function is called to update the upload progress as the file is being uploaded.

const onUploadSuccess = (res)=>{
    fileInput.value="";                         //It clears the file input, removes the "disabled" attribute from the third element in the emailForm, hides the progress container, and displays the sharing container.
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    const {file: url} = JSON.parse(res);        //It extracts the file URL from the JSON response (res) and assigns it to the fileURLInput element.
    console.log(url);
    fileURLInput.value = url;
};

//This function is called when the file upload is successful.

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();                         //When the form is submitted, it prevents the default form submission behavior (which would cause a page refresh).
    const url = fileURLInput.value;
    const formData = {                          //It extracts the file's UUID from the URL, collects email addresses and form data, disables the third element in the form, and sends a POST request to emailURL to send an email with the file link.
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
        if(data.success) {                     //If the email is sent successfully (based on the response), it hides the sharing container and displays a toast message indicating that the email has been sent.
            sharingContainer.style.display="none";
            showToast("Email Sent");
        }
    });
});

//This code adds a "submit" event listener to the emailForm element.

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

// The code defines a showToast() function that displays a toast message. It sets a timeout to hide the toast message after 2 seconds. The toastTimer variable is used to manage the timeout.
