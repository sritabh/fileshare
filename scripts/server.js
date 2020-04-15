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
  await xhttp.open("GET", "http://192.168.43.1:8080", true)
  await xhttp.send()
  xhttp.onreadystatechange = async function() {
    if (this.status == 200) {
      document.getElementById("body").innerHTML =
      this.responseText;
      console.log("COnnedcted");
    }
    else {
      document.getElementById("body").innerHTML = bodyContent;
      ///Keep asking for the connection till we recieve one
      setTimeout(()=>{
        loadContent();
      },5000);
      console.log("No Connetcion");
    }
  };
}
