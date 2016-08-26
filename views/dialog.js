function getDeviceName(inputId, formId,checkOut) {
    // alert(" Try checkout was called " + inputId);
    // Make sure that the user actually entered something 
    if (document.getElementById(inputId).checkValidity() == true) {
        var devId = document.getElementById(inputId).value;
        //  alert(" The value " + devId + " was valid ");

        $.ajax({
            url: "/nameQuery",
            type: "POST",
            data: {
                deviceId: devId
            },
            success: function(data, textStatus, jqXHR) {
                // alert(" I succeeded " + data);
                if (typeof data !== 'undefined') {
                    var deviceName = JSON.parse(data);

                    if (deviceName == 'Does Not Exist')
            confirm.render(null, "invalidId", null, inputId, formId);
                    else
        {

            if(checkOut == 'true')
        {
            confirm.render(null, "checkOutDevice", deviceName, inputId, formId);
        }
            else // The user just wants to return the device 
            {
                //alert(" The checkout is " + checkOut);
                customSubmit(inputId,false);
            }
        }                            
                }
                //alert(" The device name is " + deviceName);  
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });
    }
}

function customSubmit(inputId, checkOut) {
    if (document.getElementById(inputId).checkValidity() == true) {
        var devId = document.getElementById(inputId).value;
        $.ajax({
            url: "/",
            type: "POST",
            data: {
                checkOutId: devId,
            checkOut: checkOut
            },
            success: function(data, textStatus, jqXHR) {
                //alert(" I succeeded " + data);
                if (typeof data !== 'undefined') {
                    var deviceName = JSON.parse(data);
                    if(checkOut == true)                            	
            confirm.render(null, "checkOutAlert", deviceName, inputId, null);
                    else
            confirm.render(null,"returnAlert",deviceName,inputId,null);
                }
                //alert(" The device name is " + deviceName);  
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });
    }
}

function CustomConfirm() {
    // console.log(" At least its getting created ");
    this.render = function(dialog, op, deviceName, inputId, formId) {
        // alert(" We are to render " + deviceName);

        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');
        dialogoverlay.style.display = "block";
        dialogoverlay.style.height = winH + "px";
        dialogbox.style.left = (winW / 2) - (550 * .5) + "px";
        dialogbox.style.top = "100px";
        dialogbox.style.display = "block";

        if (op == 'checkOutDevice') {
            document.getElementById('dialogboxhead').innerHTML = "Are you sure you want to check out the " + deviceName + " ?";
            //   document.getElementById('dialogboxbody').innerHTML = dialog;
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.yes(\'' + op + '\',\'' + inputId + '\')">Yes</button> <button class="dialOption" onclick="confirm.no()">No</button>';
        } else if (op == 'checkOutAlert') {
            document.getElementById('dialogboxhead').innerHTML = " You have just checked out the " + deviceName + " !";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';
        } else if (op == 'invalidId') {
            document.getElementById('dialogboxhead').innerHTML = " There does not exist a device with the specified ID ";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';
        }
        else if(op == 'returnAlert')
        {
            document.getElementById('dialogboxhead').innerHTML = " You have just retunred the " + deviceName + " !";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';                
        }
    }

    this.no = function() {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
    }
    this.yes = function(op, inputId) {
        if (op == "checkOutDevice") {
            customSubmit(inputId, true);
        }
        confirm.clearDialogBox();
    }
    this.okay = function() {
        confirm.clearDialogBox();
    }
    this.clearDialogBox = function(inputId) {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
        //document.getElementById(inputId).value="";
    }
}
var confirm = new CustomConfirm();
