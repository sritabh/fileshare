var resonseLength = 0;
var fileStatus = `<i id="icons" class="material-icons">file_download</i>`
var fileStatusDone = `<i style="color:white;font-weight:900;"class="material-icons">done</i>`
var bodyContent;
var fileReceivingStatus =new Object();
var fileStatusReceived = "Received"
var fileStatusCanceled = "Canceled"
var fileStatusReceiving = "Receiving"
var receivedFile = 0; //receiving files using receive all button act as id
var totalFileToBeReceived;
var fileListToBeReceived;
var isReceiving = false;
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
  xhttp.open("GET", "http://192.168.43.1:6942", true)
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
          totalFileToBeReceived = Object.keys(files).length //total files receiving
          fileListToBeReceived = files;
          for (file in files) {
            var fileURL = "http://192.168.43.1:6942/" +file
            var fileSize = files[file]["file_size"]
            var fileSizeForNerd = fileSizetoReadable(fileSize);
            var currFileStatus = FileReceivedBeforeStatus(file,i); //check if file received before or not
            outToScreenHTML +=`<div class="downloadContainer" id="downloadContaier${i}"><div class='downloader'><div class='fileDetail'>`+file+`<div class="fileSize">Size - ${fileSizeForNerd}</div></div><div class='fileBTN'><button class="saveFileBTN" id="saveFileBTN${i}" onclick="accessFile('${file}','${i}','${fileSize}')"><i class='receiving_status' id="statusID${i}">${currFileStatus}</i></button></div></div><div class="downloadProgressBar" id="downloadProgressBar${i}"><div class="progressBar" id="progressBar${i}"></div></div></div>`;
            i++;
          }
        }
        res(outToScreenHTML)
      });
      getFiles.then((all_files)=>{
        document.getElementById("body").innerHTML = all_files;
        var receiveAllBTN = document.getElementById("receiveAllBTN");
        if (!isReceiving) {
          if (receiveAllBTN.value == "true") {
            fetchAllFiles(0); //start from beginning make sure all files exists
          }
        }
      })
    }
  }
}
function accessFile(file_name,id,file_size) {
  console.log(fileReceivingStatus[file_name] + " receiving status")
  if (fileReceivingStatus[file_name] == fileStatusReceiving) {
    console.log("receiving")
    var error = "Receiving...";
    var msg = "File is already being received!";
    showPopUp(error,msg);
  }
  else if(fileReceivingStatus[file_name] == fileStatusReceived) {
    console.log("already receive")
    //file is already received show confirmation pop
    var title = "Already Received"
    var msg = `<p style="word-wrap: break-word;">${file_name}</p>Do you want to receive this file again?`
    var confirmBTN = document.getElementById("confirmPOP");
    confirmBTN.style.display = "inline";
      confirmBTN.onclick = function(){
        //Allow Receiving file and close the pop
        closeErrorPop();
        saveFiles(file_name,id,file_size);
      }
      showPopUp(title,msg)
  }
  else {
    //just receive the file
    saveFiles(file_name,id,file_size);
    
  }
}
async function saveFiles(file_name,id,file_size) {
  var receiveAllBTN = document.getElementById("receiveAllBTN");
  fileReceivingStatus[file_name] = fileStatusReceiving
  var fileURL = "http://192.168.43.1:6942/" +file_name
  let receivedData = 0
  const fileStream = streamSaver.createWriteStream(file_name, {
    size: file_size
  })
  fetch(fileURL).then(async (resolve,reject)=>{
    isReceiving = true;
    window.writer = fileStream.getWriter()
    const fileReader = resolve.body.getReader()
    while (true) {
      const {done, value} = await fileReader.read()
      if (done) {
        writer.close()
        fileReceivingStatus[file_name] = fileStatusReceived
        isReceiving = false;
        if (receiveAllBTN.value == "true") {
          if (receivedFile < totalFileToBeReceived-1) {
            fetchAllFiles(receivedFile);
            break;
          }
          else if (receivedFile >= totalFileToBeReceived-1) {
            if ((totalFileToBeReceived - Object.keys(fileReceivingStatus).length) > 1) {
              receivedFile = 0;
              fetchAllFiles(receivedFile);
            }
            else {
              fetchAllFiles(receivedFile);
            }
          }
        }
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
    isReceiving = false;
    receiveAllBTN.value = "false";
    receiveAllBTN.innerText = "Resume"
    console.log("err in connection "+err.message)
    fileReceivingStatus[file_name] = fileStatusCanceled
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
    if (document.getElementById(progressBar).style.display != "block" && document.getElementById(downloadProgressBar).style.display != "flex") {
      document.getElementById(progressBar).style.display = "block";
      document.getElementById(downloadProgressBar).style.display = "flex"
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
  //make receiveall button stop
  if (isReceiving) {
    var type = "Cannot Refresh";
    var msg = "Cannot refresh while receiving the file"
    showPopUp(type,msg);
  }
  else {
    var receiveAllBTN = document.getElementById("receiveAllBTN");
    receiveAllBTN.value = "false";
    document.getElementById("receiveAllBTN").innerText = "Receive All";
    loadContent();
    document.getElementById("connectionStatus").innerHTML = "Checking Connection.."
    document.getElementById("refreshBTN").style.animation = "spin 1s linear infinite";

  }
}

///clicking all buttons one by one ez...
function receiveAll() {
  var type = "Experimental Feature!";
  var msg = "This button is highly experimental and will require permission like<br>-Show Pop-Ups<br>-Download Multiple Files<br>And More..<br>I would have touched this only if I knew what the above things are!";
  var confirmBTN = document.getElementById("confirmPOP");
  var receiveAllBTN = document.getElementById("receiveAllBTN");
  confirmBTN.style.display = "inline";
  if (receiveAllBTN.value == "false") {
    //User requesting to receive all
    //warn him
    confirmBTN.onclick = function(){
      receiveAllBTN.value = "true";
      document.getElementById("receiveAllBTN").innerText = "Pause";
      closeErrorPop();
      loadContent();
    }
    showPopUp(type,msg)
  }
  else {
    //User trying to pause the will pause the next receive
    receiveAllBTN.value = "false";
    document.getElementById("receiveAllBTN").innerText = "Resume";
  }
}
//download the file by clicking on respective button
function fetchAllFiles(id) {
  var fileName = Object.keys(fileListToBeReceived)[id]
  var saveBTNId = `saveFileBTN${id}`;
  var fileClickedBefore = fileName in fileReceivingStatus
  var receiveAllBTN = document.getElementById("receiveAllBTN");
  if (!isReceiving) {
    if (receiveAllBTN.value == "true") {
      if (id < totalFileToBeReceived) {
        if (!fileClickedBefore) {
          //download if not touched before
          //doesnt exists in receiving object
          receivedFile++;
          document.getElementById(saveBTNId).click();
        }
        else if (fileReceivingStatus[fileName] != fileStatusReceived || fileReceivingStatus[fileName] == fileStatusCanceled) {
          receivedFile++;
          document.getElementById(saveBTNId).click();
        }
        else if (fileReceivingStatus[fileName] == fileStatusReceived) {
          receivedFile++;
          var downloadContainer = `downloadContaier${id}`
          document.getElementById(downloadContainer).style.boxShadow ="none";
          fetchAllFiles(receivedFile) //jump to next file
        }
      }
      else {
        //all file received change the resume button value
        var receiveAllBTN = document.getElementById("receiveAllBTN");
        receiveAllBTN.value = "false";
        document.getElementById("receiveAllBTN").innerText = "Done!";
      }
    }
  }
}
//connection status
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
//check if file saved before or not
function FileReceivedBeforeStatus(fileName,id) {
  var fileReceivedBefore = fileName in fileReceivingStatus
  if (!fileReceivedBefore) {
    return fileStatus
  }
  else {
    if (fileReceivingStatus[fileName]==fileStatusReceived) {
      return fileStatusDone
    }
    else {
      return fileStatus
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
  document.getElementById("confirmPOP").style.display = "none"
}
function showPopUp(type,message) {
  document.getElementById("popHeading").innerHTML = type;
  document.getElementById("popContent").innerHTML = message;
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      document.getElementById("confirmPOP").style.display = "none"
    }
  }
}
function byAccident() {
  var type = "Accident??"
  var msg = `There are no accidents!<br>-Grand Master Oogway`
  showPopUp(type,msg);
}