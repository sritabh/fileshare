function loadContent() {
    console.log("HEllo");
    var xhttp;
  if (window.XMLHttpRequest) {
    // code for modern browsers
    xhttp = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  xhttp.onreadystatechange = function() {
    console.log(xhttp.status);
    if (this.status == 200) {
      document.getElementById("body").innerHTML =
      this.responseText;
    }
  };
  xhttp.open("GET", "http://192.168.43.1:8080", true);
  xhttp.send();
}
