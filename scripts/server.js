var resonseLength = 0;
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
            console.log(fileURL);
            var statusID = "receiving_status"+i;
            var writeHTML = new Promise(()=>{
              outToScreenHTML +="<p class='downloader'>"+file+"<br><span class='receiving_status' id='"+statusID+"'></span><span class='downloadLink'><a href='"+fileURL+"' download='"+file+`'>Download!</a><button class="saveFileBTN" onclick="saveFiles('${file}','${statusID}')">⯆</button></span></p>`;
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
      document.getElementById("heading").innerHTML = "<h2>Ready To Recieve Files!</h2>"
      //document.getElementById("status").innerHTML = "<a href='"+fileURL+"' download='"+this.responseText+"'>Debug Download</a>"
      //fetchFiles(this.responseText)
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
function saveFiles(file_name,statusID) {
  console.log("Receivng.......");

  var requestFileHTTP;
  var fileURL = "http://192.168.43.1:8080/" +file_name
  if (window.XMLHttpRequest) {
    // code for modern browsers
    requestFileHTTP = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    requestFileHTTP = new ActiveXObject("Microsoft.XMLHTTP");
  }
  requestFileHTTP.open("GET", fileURL, true)
  requestFileHTTP.send();
  requestFileHTTP.responseType = "blob"
  requestFileHTTP.onprogress = function(event){
    var file_size = event.total
    var received_data = event.loaded
    var receivedPercent = Math.round((received_data/file_size)*100)
    if (receivedPercent == 100) {
      document.getElementById(statusID).innerHTML = "<b>Processing...</b>"
    }
    else {
      document.getElementById(statusID).innerHTML = "<b>Received</b> "+ receivedPercent + "%"
    }
  }
  requestFileHTTP.onreadystatechange = function(data) {
    if (this.readyState == 4 && this.status == 200) {
      console.log("File Recieved!")
      document.getElementById(statusID).innerHTML ="<span id='saved'>SAVED</span>"
      var blob = new Blob([this.response]);
      const fileStream = streamSaver.createWriteStream(file_name, {
        size: blob.size // Makes the procentage visiable in the download
      })
      const readableStream = blob.stream();
      if (window.WritableStream && readableStream.pipeTo) {
        return readableStream.pipeTo(fileStream)
          .then(() => console.log('done writing'))
      }
      window.writer = fileStream.getWriter()

        const reader = readableStream.getReader()
        const pump = () => reader.read()
          .then(res => res.done
            ? writer.close()
            : writer.write(res.value).then(pump))

        pump()
    }
    else if(this.status != 200) {
      document.getElementById("status").innerHTML = "Connection Lost"
    }
  }
}