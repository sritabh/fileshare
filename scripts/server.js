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
    if (this.readyState == 4 && this.status == 200) {
      var files = JSON.parse(this.responseText);
      var getFiles = new Promise((res,rej)=>{
        var i=0;
        if (files !=null) {
          for (file in files) {
            var fileURL = "http://192.168.43.1:8080/" +file
            console.log(fileURL)
            outToScreenHTML +="<p>"+file+"<br><span id='receiving_status"+i+"'></span><span class='downloadLink'><a href='"+fileURL+"' download='"+file+"'>Download!</a></span></p>";
            i++;
          }
        }
        res(outToScreenHTML)
      });
      getFiles.then((all_files)=>{
        document.getElementById("body").innerHTML = all_files
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


function fetchFiles(file_name) {
  var requestFileHTTP;
  var fileURL = "http://192.168.43.1:8080/" +file_name
  console.log(fileURL)
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
      document.getElementById("receiving_status").innerHTML = "<b>Processing...</b>"
    }
    else {
      document.getElementById("receiving_status").innerHTML = "<b>Received</b> "+ receivedPercent + "%"
    }
  }
  requestFileHTTP.onreadystatechange = function(data) {
    if (this.readyState == 4 && this.status == 200) {
      console.log("File Recieved!")
      var blob = new Blob([this.response]);
      var getUrl = new Promise((res,rej)=>{
        var url = window.URL.createObjectURL(blob)
        res(url)
      });
      getUrl.then((url)=>{
        var a = document.createElement('a');
        a.href = url;
        a.download = file_name;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        document.getElementById("receiving_status").innerHTML ="<span id='saved'>SAVED</span>"
      }).catch((err)=>{console.log("err "+err)})
    }
    else if(this.status != 200) {
      document.getElementById("status").innerHTML = "Connection Lost"
    }
  }
}