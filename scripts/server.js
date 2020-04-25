var resonseLength = 0;
var fileStatus = `<i id="icons" class="material-icons">file_download</i>`
var fileStatusDone = `<i style="color:white;font-weight:900;"class="material-icons">done</i>`
var bodyContent;
async function loadContent() {
  var outToScreenHTML = "";
  var xhttp;
  if (window.XMLHttpRequest) {
    // code for modern browsers
    xhttp = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhttp.open("GET", "http://192.168.43.1:8080", true)
  xhttp.send();
  xhttp.onreadystatechange = async function() {
    bodyContent = document.getElementById("body").innerHTML;
    checkConnectionStatus(this.readyState,this.status);
    if (this.readyState==4 && this.status == 200) {
      //connection
      var files = JSON.parse(this.responseText);
      var getFiles = new Promise((res,rej)=>{
        var i=0;
        if (files !=null) {
          for (file in files) {
            var fileURL = "http://192.168.43.1:8080/" +file
            var fileSize = files[file]["file_size"]
            var fileSizeForNerd = fileSizetoReadable(fileSize);
            console.log(fileURL);
            var writeHTML = new Promise(()=>{
              outToScreenHTML +=`<div class="downloadContainer" id="downloadContaier${i}"><div class='downloader'><div class='fileDetail'>`+file+`<div class="fileSize">Size - ${fileSizeForNerd}</div></div><div class='fileBTN'><button class="saveFileBTN" id="saveFileBTN${i}" onclick="saveFiles('${file}','${i}','${fileSize}')"><i class='receiving_status' id="statusID${i}">${fileStatus}</i></button></div></div><div class="downloadProgressBar" id="downloadProgressBar${i}"><div class="progressBar" id="progressBar${i}"></div></div></div>`;
            })
            writeHTML.then(()=>{
              document.getElementById("saveFile").onclick = ()=>{
                console.log(file)
              }
            })
            i++;
          }
        }
        res(outToScreenHTML)
      });
      getFiles.then((all_files)=>{
        document.getElementById("body").innerHTML = all_files;
      })
    }
  };
};

function checkNewFiles(response) {
  if (response.length > responseLength) {
    var newFiles = response.slice(responseLength,response.length);
    resonseLength +=response.length;
    return newFiles;
  }
}
async function saveFiles(file_name,id,file_size) {
  console.log("Receivng.......");
  var fileURL = "http://192.168.43.1:8080/" +file_name
  let receivedData = 0
  const fileStream = streamSaver.createWriteStream(file_name, {
    size: file_size
  })
  //automatic download
  /*if (window.WritableStream && file.body.pipeTo) {
    console.log("hello")
    return file.body.pipeTo(fileStream)
        .then(() => console.log('done writing'))
  }*/
  //manual writing showing status on screen aswell
  fetch(fileURL).then(async (resolve,reject)=>{
    window.writer = fileStream.getWriter()
    const fileReader = resolve.body.getReader()
    while (true) {
      const {done, value} = await fileReader.read()
      if (done) {
        writer.close()
        break;
      }
      else {
        writer.write(value)
        receivedData +=value.length
      }
      var receivedPercent = Math.round((receivedData/file_size)*100);
      fileTransferStatus(receivedPercent,id);
    }
  }).catch((err)=>{
    console.log("err in connection "+err.message)
    var error = "Error";
    var msg = err.message +":<br>Connection Lost<br>Try refresh button or restarting the app";
    showPopUp(error,msg);
  })
}
function fileTransferStatus(progress,id) {
  var progressBar = `progressBar${id}`
  var downloadProgressBar = `downloadProgressBar${id}`
  var statusID = `statusID${id}`
  var downloadContainer = `downloadContaier${id}`
  var saveFileBTN = `saveFileBTN${id}`
  if (progress == 100) {
    //file received
    document.getElementById(progressBar).style.display = "none";
    document.getElementById(downloadProgressBar).style.display = "none";
    document.getElementById(statusID).innerHTML = fileStatusDone;
    document.getElementById(downloadContainer).style.boxShadow ="none";
    document.getElementById(saveFileBTN).style.animation = "none";
  }
  else {
    //file receving
    document.getElementById(statusID).innerHTML = progress+"%"
    if (document.getElementById(progressBar).style.display != "block" && document.getElementById(downloadProgressBar).style.display != "block") {
      document.getElementById(progressBar).style.display = "block";
      document.getElementById(downloadProgressBar).style.display = "block"
      document.getElementById(progressBar).style.width = progress + "%";
    }
    else {
      document.getElementById(progressBar).style.width = progress + "%";
    }
    if (document.getElementById(saveFileBTN).style.animation !="shadow-pulse 1s infinite") {
      document.getElementById(saveFileBTN).style.animation = "shadow-pulse 1s infinite";
    }
  }
}

function refresh() {
  loadContent();
  document.getElementById("connectionStatus").innerHTML = "Checking Connection.."
  document.getElementById("refreshBTN").style.animation = "spin 1s linear infinite";
}

function receiveAll() {
  console.log(document.getElementById("receiveAllBTN").innerText);
  var buttonValue = document.getElementById("receiveAllBTN").value;
  if (document.getElementById("receiveAllBTN").innerText != "Receive All") {
    document.getElementById("receiveAllBTN").innerText = "Receive All";
  }
  else {
    document.getElementById("receiveAllBTN").innerText = "Pause"
  }
}

function checkConnectionStatus(state,status) {
  if (document.getElementById("refreshBTN").style.animation != "none") {
    document.getElementById("refreshBTN").style.animation = "none"
  }
  if (state == 4 && status == 200) {
    //connected
    document.getElementById("connectionStatus").innerHTML = "Connected"
    if (document.getElementById("receiveAllBTN").style.display == "none") {
      document.getElementById("receiveAllBTN").style.display = "block"
    }
  }
  else if (state != 4) {
    //processing
    document.getElementById("connectionStatus").innerHTML = "Checking Connection.."
    if (document.getElementById("receiveAllBTN").style.display != "none") {
      document.getElementById("receiveAllBTN").style.display = "none"
    }
  }
  else {
    //failed
    document.getElementById("connectionStatus").innerHTML = "No Connection"
    document.getElementById("body").innerHTML = bodyContent;
    if (document.getElementById("receiveAllBTN").style.display != "none") {
      document.getElementById("receiveAllBTN").style.display = "none"
    }
  }
}

function fileSizetoReadable(size) {
  var file_size;
  if (size < 1024) {
    file_size = size+"B"
    return file_size
  }
  else if (size >=1024 && size < 1024*1024) {
    var x = size/1024;
    file_size = x.toFixed(2)+"KB"
    return file_size
  }
  else if (size >= 1024*1024 && size < 1024*1024*1024) {
    var x = size/(1024*1024);
    file_size = x.toFixed(2)+"MB";
    return file_size
  }
  else {
    var x = size/(1024*1024*1024);
    file_size = x.toFixed(2)+"GB";
    return file_size
  }
}
function closeErrorPop() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}
function showPopUp(type,message) {
  document.getElementById("popHeading").innerHTML = type;
  document.getElementById("popContent").innerHTML = message;
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
function byAccident() {
  var type = "Accident??"
  var msg = `<p style="padding-top:20px; margin-right:auto;margin-left:auto;">There are no accidents!<br>-Grand Master Oogway</p>`
  showPopUp(type,msg);
}