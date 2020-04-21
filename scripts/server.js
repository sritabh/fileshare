async function loadContent() {
  var bodyContent = document.getElementById("body").innerHTML
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
    if (this.status == 200) {
      var fileURL = "http://192.168.43.1:8080/" +this.responseText
      document.getElementById("body").innerHTML = this.responseText
      document.getElementById("status").innerHTML = "<a href='"+fileURL+"' download='"+this.responseText+"'>GET FILE</a>"
    }
    else {
      document.getElementById("body").innerHTML = bodyContent;
      console.log("No Connetcion");
    }
  };
};

function GetFile() {
  var file_name = document.getElementById("body").innerHTML;
  console.log("Fetching file.. "+file_name)
  var requestFileHTTP;
  var fileURL = "http://192.168.43.1:8080/" +file_name
  console.log(fileURL)
  var a = document.createElement('a')
  a.href = fileURL;
  a.download = file_name;
  document.body.append(a);
  a.click;
  a.remove();
}
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
  requestFileHTTP.onreadystatechange = function(data) {
    if (this.status == 200) {
      var file_size = this.getResponseHeader("Content-Length");
      var blob = new Blob([this.response]);
      console.log("File size is"+file_size+"And blob is"+blob.size)
      document.getElementById("status").innerHTML = "<b>RECEIVED</b> "+((blob.size/file_size)*100) + "%"
      var getUrl = new Promise((res,rej)=>{
        var url = window.URL.createObjectURL(blob)
        res(url)
      });

      getUrl.then((url)=>{
        var a = document.createElement('a')
        a.href = url;
        a.download = file_name;
        document.body.append(a);
        a.click;
        a.remove();
        window.URL.revokeObjectURL(url);
      })
    }
    else {
      document.getElementById("body").innerHTML = bodyContent;
      document.getElementById("status").innerHTML = "Connection Lost"
      console.log("No Connetcion");
    }
  }
}