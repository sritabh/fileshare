var resonseLength = 0;
var fileStatus = `<i id="icons" class="material-icons">file_download</i>`
var fileStatusDone = `<i style="color:white;font-weight:900;"class="material-icons">done</i>`
async function loadContent() {
  var bodyContent = document.getElementById("body").innerHTML
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
    if (this.readyState==4 && this.status == 200) {
      var files = JSON.parse(this.responseText);
      var getFiles = new Promise((res,rej)=>{
        var i=0;
        if (files !=null) {
          for (file in files) {
            var fileURL = "http://192.168.43.1:8080/" +file
            var fileSize = files[file]["file_size"]
            console.log(fileURL);
            var statusID = "receiving_status"+i;
            var writeHTML = new Promise(()=>{
              outToScreenHTML +=`<div class="downloadContainer" id="downloadContaier${i}"><div class='downloader'><div class='fileDetail'>`+file+`</div><div class='fileBTN'><div class="loader"><button class="saveFileBTN" id="saveFileBTN${i}" onclick="saveFiles('${file}','${i}','${fileSize}')"><i class='receiving_status' id="statusID${i}">${fileStatus}</i></button></div></div></div><div class="downloadProgressBar" id="downloadProgressBar${i}"><div class="progressBar" id="progressBar${i}"></div></div></div>`;
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
      document.getElementById("heading").innerHTML = "<h6>Ready To Recieve Files!</h6>"
    }
    else {
      document.getElementById("body").innerHTML = bodyContent;
      console.log("No Connetcion");
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
        document.getElementById(statusID).innerHTML = "<span id='saved'>SAVED</span>"
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
    console.log("err in connection "+err)
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