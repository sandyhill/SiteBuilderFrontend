var fetchReq;

function initFetchContent() {
  fetchReq = new XMLHttpRequest();
  
  fetchReq.addEventListener("load", onFetchComplete);
  fetchReq.addEventListener("error", onFetchError);
  
  fetchReq.open("GET", "../posts/launch.html");
  fetchReq.send();
}

function onFetchComplete(e) {
  var containerElement;//get element to contain page content
  
  containerElement.innerHtml = e.eventTarget.response;
}

function onFetchError(e) {
  
}