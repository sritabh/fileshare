var firebaseConfig = {
    apiKey: "AIzaSyAJuXTp79HwCPaxG8jyAnyDinddDymTDDg",
    authDomain: "fileshare-sobydamn.firebaseapp.com",
    databaseURL: "https://fileshare-sobydamn.firebaseio.com",
    projectId: "fileshare-sobydamn",
    storageBucket: "fileshare-sobydamn.appspot.com",
    messagingSenderId: "747667697798",
    appId: "1:747667697798:web:fb762a56f17c2c14926107",
    measurementId: "G-XQWZ12VEXZ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

function showMoreAboutNew(element){
    if(element.children[1].style.display != "block"){
        element.children[1].style.display = "block";
        element.children[0].innerText = "keyboard_arrow_down";
        //element.children[0].style.maxHeight = "500px";
    }
    else {
        element.children[1].style.display = "none";
        element.children[0].innerText = "keyboard_arrow_right";
        //element.children[0].style.maxHeight= "0px";
    }
}

const appName = "FileShare_v1.0.0.apk"
const appURL = `https://github.com/SobyDamn/fileshare/releases/download/1.1.0/FileShare_v1.1.0.apk`
function DownloadApp(){
    const a = document.createElement('a')
    a.href = appURL
    document.body.appendChild(a)
    a.click() //download the file
    document.body.removeChild(a)
    //Display join pop to user
    const joiningStatus = localStorage.getItem("FileShare_joiningStatus")
    console.log(joiningStatus)
    if(joiningStatus==null){
        const popup = document.getElementById("myModal");
        popup.style.display = "block";
    }
}
function joinFileShare(button){
    const email = document.getElementById("joinUserEmail");
    const status = document.getElementById("popupStatus");
    if(email.value == ""){
        alert("Email field is required")
        return
    }
    button.disabled = true;
    firebase.auth().createUserWithEmailAndPassword(email.value, "password")
        .then((userCredential) => {
            // Signed in 
            status.style.display = "block";
            status.innerText = "Successfully Joined"
            localStorage.setItem("FileShare_joiningStatus", "Joined");
            setTimeout(()=>{
                closePop();
            },1000)
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            status.style.display = "block";
            var errorMessage = error.message;
            status.innerText = "Error: "+errorMessage;
            button.disabled = false;
            // ..
        });
}

function closePop(){
    const popup = document.getElementById("myModal");
    const status = document.getElementById("popupStatus");
    popup.style.display = "none";
    status.style.display = "none";
    localStorage.setItem("FileShare_joiningStatus", "Not Joined");
}