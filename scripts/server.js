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
  //xhttp.responseType = 'blob';
  xhttp.onreadystatechange = async function(data) {
    console.log("ready state",this.readyState)
    console.log(data)
    if (this.status == 200) {
      document.getElementById("body").innerHTML = this.responseText;
      var myblob = new Blob([stringTobufferArray(this.response)])
      await myblob;
      console.log("response:-"+this.responseText.slice(0,80))
      console.log("blob type "+myblob.type+"blob size "+myblob.size)
      var getUrl = new Promise((res,rej)=>{
        var url = window.URL.createObjectURL(myblob)
        res(url)
      });
      getUrl.then((url)=>{
        console.log("I got the url "+url)
        document.getElementById("status").innerHTML = "<a href='"+url+"' download='merafile.pdf'>Got file</a><br>size:-"+myblob.size/(1024*1024)
        document.getElementById("status").onclick = function (ev) {
          setTimeout(()=>{
            window.URL.revokeObjectURL(url);
          },5000);
        }
      })
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
};
function stringTobufferArray(string) {
  console.log("Processing file....");
  var buf = new ArrayBuffer(string.length);
  var bufView = new Uint8Array(buf);
  for (var i=0,strLen = string.length;i<strLen;i++) {
    bufView[i] = string.charCodeAt(i);
  };
  console.log(bufView.length)
  return buf;
}
function stringToUint(string) {
  var uInt8Array = new Uint8Array(string);
    var i = uInt8Array.length;
    var binaryString = new Array(i);
    while (i--)
    {
      binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    var data = binaryString.join('');
    console.log(data.length)
  return data;
}