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
      //document.getElementById("body").innerHTML = this.responseText;
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

let socket = new WebSocket("ws://192.168.43.1:8080");

socket.onopen = function(e) {
  console.log("[open] Connection established");
  console.log("Sending to server");
  //socket.send("My name is John");
};

socket.onmessage = function(event) {
  console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.log(`[error] ${error.message}`);
};
socket.onmessage = function(event) {
  console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.log(`[error] ${error.message}`);
};