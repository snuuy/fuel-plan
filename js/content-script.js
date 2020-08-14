$(document).ready(function() {
  var fuelPrice = "";
  var mileage = "";
  
  chrome.storage.local.get(['gasPrice'], function(result){
    fuelPrice = result.gasPrice;
  });
  chrome.storage.local.get(['gasMileage'], function(result){
    mileage = result.gasMileage;
  });

  var oldFuelPrice = "";
  var oldMileage = "";
  setInterval(function() {
    chrome.storage.local.get(['gasPrice'], function(result){
      fuelPrice = result.gasPrice;
      if (oldFuelPrice != fuelPrice) calculateTripCost();
      oldFuelPrice = fuelPrice;
    });
    chrome.storage.local.get(['gasMileage'], function(result){
      mileage = result.gasMileage;
      if (oldMileage != mileage) calculateTripCost();
      oldMileage = mileage;
    });
  }, 500);

  var lastUrl = "";
  setInterval(function() {
    var newUrl = window.location.href
    if(newUrl != lastUrl && ~newUrl.indexOf("dir")) calculateTripCost();
    lastUrl = window.location.href
  }, 100);

  function getTotalPrice(fp,d,e) {
    return ((parseFloat(e)*parseFloat(d) / 100)*parseFloat(fp)).toFixed(2);
  }
  
  function calculateTripCost() {
    if(mileage != undefined && fuelPrice != undefined) {
      $(".section-directions-trip-distance").each(function(i,obj) {
        distance = $(obj).find("div").html();
        distance = distance.slice(0,-3);
        $(".tripCost"+i).remove();
        iconsrc = "data:image/png;base64,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";
        $('<div style="margin-top: 10px;"class="tripCost'+i+'"><b>$'+getTotalPrice(fuelPrice,distance.replace(/,/g, ''),mileage)+'</b><img style="max-width: 15px;margin-left:6px;vertical-align:middle;margin-bottom:3px;" src="'+iconsrc+'"/></div>').appendTo(obj);
      });
    }
  }
});