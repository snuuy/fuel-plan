$.ajaxSetup({
    headers : {
      'Accept' : "application/json, text/plain, */*"
    }
  });
  
  $(document).ready(function() {
      loadYears(false);
      $("#select").change(clearSavedSelections);
      $("#year").change(loadMakes);
      $("#make").change(loadModels);
      $("#model").change(loadTrims);
      $("#options").change(getMileage);
      $("#fuelPrice").keyup(function() {
        chrome.storage.local.set({gasPrice: $("#fuelPrice").val()}, function() {
            console.log('Value is set to ' + $("#fuelPrice").val());
        });
        chrome.storage.local.set({userSetPrice: false}, function() {
            console.log('Value is set to ' + false);
        });
      });
      chrome.storage.local.get(['gasPrice'], function(result){
        if(result.gasPrice != undefined) $("#fuelPrice").val(result.gasPrice);
      });
      chrome.storage.local.get(['year'], function(result){
        if(result.year != undefined) {
            console.log("test");
            loadYears(true);

        }
      });
  });

  function clearSavedSelections() {
    chrome.storage.local.set({year: undefined}, function(){});
    chrome.storage.local.set({make: undefined}, function(){});
    chrome.storage.local.set({model: undefined}, function(){});
    chrome.storage.local.set({trim: undefined}, function(){});
  }

  function converttoCADL(FuelPrice) {
      return (FuelPrice * 1.32) / 3.785
  }
  
  function converttoKML(Mpg) {
      return 235.215/Mpg;
  }
  
  function loadYears(autoLoad=false) {
      let dropdown = $('#year');
      url = "https://fueleconomy.gov/ws/rest/vehicle/menu/year"
      $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          $.each(data, function(key, entry) {
              if (data.menuItem.text == undefined) {
                      $.each(data.menuItem, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              } else {
                      $.each(data, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              }
          });
          chrome.storage.local.get(['year'], function(result){
          if(autoLoad==true) { 
            $("#year").val(result.year);
            console.log(result.year);
            console.log($("#year").val());
            loadMakes(true);
          }
          });
      },
      type: 'GET'
      });
  }
  
  function loadMakes(autoLoad=false) {
      let dropdown = $('#make');
      dropdown.html('<option value="" disabled selected>Make</option>');
      $("#options").html('<option value="" disabled selected>Trim</option>');
      $("#make").html('<option value="" disabled selected>Make</option>');
      $("#model").html('<option value="" disabled selected>Model</option>');
      let year = $("#year").val();
      url = "https://fueleconomy.gov/ws/rest/vehicle/menu/make?year="+year
      $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          $.each(data, function(key, entry) {
              if (data.menuItem.text == undefined) {
                      $.each(data.menuItem, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              } else {
                      $.each(data, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              }
          });
          chrome.storage.local.get(['make'], function(result){
          if(autoLoad==true) { 
            $("#make").val(result.make);
            console.log(result.make);
            console.log($("#make").val());
            loadModels(true);
          }
          });
      },
      type: 'GET'
      });
  }
  
  function loadModels(autoLoad=false) {
      let dropdown = $('#model');
      dropdown.html('<option value="" disabled selected>Model</option>');
      $("#options").html('<option value="" disabled selected>Trim</option>');
      $("#model").html('<option value="" disabled selected>Model</option>');
      let year = $("#year").val();
      let make = $("#make").val();
      url = "https://fueleconomy.gov/ws/rest/vehicle/menu/modelNoPhev?year="+year+"&make="+make
      $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          $.each(data, function(key, entry) {
              if (data.menuItem.text == undefined) {
                      $.each(data.menuItem, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              } else {
                      $.each(data, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              }
          });
          chrome.storage.local.get(['model'], function(result){
          if(autoLoad==true) { 
            $("#model").val(result.model);
            console.log(result.model);
            console.log($("#model").val());
            loadTrims(true);
          }
          });
      },
      type: 'GET'
      });
  }
  
  function loadTrims(autoLoad=false) {
      let dropdown = $('#options');
      dropdown.html('<option value="" disabled selected>Trim</option>');
      $("#options").html('<option value="" disabled selected>Trim</option>');
      let year = $("#year").val();
      let make = $("#make").val();
      let model = $("#model").val();
      url = "https://fueleconomy.gov/ws/rest/vehicle/menu/options?year="+year+"&make="+make+"&model="+model
      $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
          $.each(data, function(key, entry) {
              if (data.menuItem.text == undefined) {
                      $.each(data.menuItem, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              } else {
                      $.each(data, function(key, entry) {
                      dropdown.append($('<option></option>').attr('value', entry.value).text(entry.text));
                  })
              }
          });
          chrome.storage.local.get(['trim'], function(result){
          if(autoLoad==true) { 
            $("#options").val(result.trim);
            console.log(result.trim);
            console.log($("#options").val());
            getMileage();
          }
          });
      },
      type: 'GET'
      });
  }
    
  function getFuelPrice(fuelType) {
      url = "https://fueleconomy.gov/ws/rest/fuelprices"
      $.ajax({
          url: url,
          dataType: 'json',
          success: function(data) {
              if(fuelType == 'Electricity') fuelType = 'electric';
              var fuelPrice = converttoCADL(data[fuelType.toLowerCase()]).toFixed(2);
              chrome.storage.local.get(['userSetPrice'], function(result){
                if(result.userSetPrice != true) {
                    chrome.storage.local.get(['gasPrice'], function(result){
                        $("#fuelPrice").val(fuelPrice);
                        chrome.storage.local.set({gasPrice: fuelPrice}, function() {
                            console.log('Value is set to ' + fuelPrice);
                        });
                    });
                }
              });
          },
          type: 'GET'
      });
  }

  function getMileage() {
      let dropdown = $('#options');
      let id = $("#options").val();
      url = "https://fueleconomy.gov/ws/rest/v2/"+id
      $.ajax({
          url: url,
          dataType: 'json',
          success: function(data) {
              let mileage = converttoKML(data.comb08).toFixed();
              $("#mileage").html(mileage +" L/100km")
              getFuelPrice(data.fuelType);
              chrome.storage.local.set({gasMileage: mileage}, function() {});
              if(mileage < 9) {
                $("#ratingText").html("Your vehicle has good fuel economy.");
                $(".rating").css("color","#2e9b00");
              } else if(mileage < 14) {
                $("#ratingText").html("Your vehicle has average fuel economy.");
                $(".rating").css("color","grey");
              }
              else {
                $("#ratingText").html("Your vehicle has poor fuel economy.");
                $(".rating").css("color","#db9a18");
              }
              chrome.storage.local.set({year: $("#year").val()}, function() {});
              chrome.storage.local.set({make: $("#make").val()}, function() {});
              chrome.storage.local.set({model: $("#model").val()}, function() {});
              chrome.storage.local.set({trim: $("#options").val()}, function() {});
          },
          type: 'GET'
      });
  }