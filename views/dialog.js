/** Javascript file that pertains to all the dialogues **/
function getDeviceName(inputId, formId, op) {
    // Make sure that the user actually entered the device name or id 
    if (document.getElementById(inputId).checkValidity() == true) {
        /** Either the device name or the device Id 
         * depending on the operation **/
        var devId = document.getElementById(inputId).value;

        $.ajax({
            url: "/nameQuery",
            type: "POST",
            data: {
                deviceId: devId,
                op : op
            },
            success: function(data, textStatus, jqXHR) {
                console.log(" We successfully gotten the name ");
                if (typeof data !== 'undefined') {
                    var deviceName = JSON.parse(data);

                    if (deviceName == 'Does Not Exist')
                    {
                        if(op == 'checkout' || op == 'return')
                            confirm.render(null, "invalidId", null, inputId, formId);
                        else
                            confirm.render(null, "invalidDeviceName", null, inputId. fomrId);
                    }
                    else
                    {
                        if(op == 'checkOut')
                        {
                            confirm.render(null, "checkOutDevice", deviceName, inputId, formId);
                        }
                        else if(op == 'return') 
                        {
                            customSubmit(inputId,"return");
                        }
                        else if(op == 'remove')
                        {
                            confirm.render(null, "removeDevice", deviceName, inputId, formId);
                        }
                        else if (op == 'modify')
                        {
                            confirm.render(null, "modifyDevice", null, null, formId);
                        }
                    }                            
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });
    }
    else
    {
        confirm.render(null, "incomplete", null, null, null);
    }
}
function loadDetails(inputId)
{
    if(document.getElementById(inputId).checkValidity() == true)
    {
        var deviceName = document.getElementById(inputId).value;
        $.ajax({
            url: "/loadDetails",
            type: "POST",
            data: {deviceName: deviceName },
    
            success: function(data, textStatus, jqXHR) 
            {
                var details = JSON.parse(data);
                document.getElementById("t_deviceName").innerHTML = details.deviceName;
                document.getElementById("t_operatingSystem").innerHTML = details.operatingSystem;
                document.getElementById("t_visualDescription").innerHTML = details.visualDescription;
                document.getElementById("t_resolution").innerHTML = details.resolution;
                document.getElementById("t_aspectRatio").innerHTML = details.aspectRatio;
                document.getElementById("t_additionalDetails").innerHTML = details.additionalDetails;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });   
    }
    else 
    {
        confirm.render(null, 'incomplete', null, null, null);
    }

}


/** Submit function that perains to the administrator operations **/
function adminSubmit(formId, op)
{
    // alert(" called at all ");
    if(document.getElementById(formId).checkValidity() == true || op == "modifyDevice" )
    {
        // alert("Valid document");
        var deviceId, deviceName, deviceCategory, operatingSystem, visualDescription, resolution;
        var aspectRatio, additionalDetails;
        if(op == "addDevice")
        {
            deviceId = document.getElementById("deviceId").value;
            deviceName = document.getElementById("deviceName").value;
            deviceCategory = document.getElementById("deviceCategory").value;
            operatingSystem = document.getElementById("operatingSystem").value;
            visualDescription = document.getElementById("visualDescription").value;
            resolution = document.getElementById("resolution").value;
            aspectRatio = document.getElementById("aspectRatio").value;
            additionalDetails = document.getElementById("additionalDetails").value;

            $.ajax({ 
                url: '/addDevice',
                type: "POST",
                data: {
                    deviceId : deviceId,
                deviceName : deviceName,
                deviceCategory : deviceCategory,
                operatingSystem : operatingSystem,
                visualDescription : visualDescription,
                resolution : resolution,
                aspectRatio : aspectRatio,
                additionalDetails : additionalDetails
                },
                success: function(data, textStatus, jqXHR){
                    if(typeof data !== 'undefined'){
                        var deviceName = JSON.parse(data);
                        confirm.render(null,"addAlert",deviceName,null, null);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(textStatus, errorThrown);
                }
            })
        }
        if(op == 'removeDevice')
        {
            deviceName = document.getElementById('deviceName').value;
            $.ajax({
                url: '/removeDevice',
                type: 'POST',
                data: {
                    deviceName : deviceName
                },
                success: function(data, textStatus, jqXHR)
            {
                console.log(" it was a success ");
                if(typeof data !== 'undefined'){
                    console.log(" The data is defined " + data);
                    var deviceName = JSON.parse(data);
                    console.log(" The device name loc " + deviceName);
                    confirm.render(null, "removeAlert", deviceName, null, null);
                }
            },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(textStatus, errorThrown);
                }
            })
        }
        if(op == 'modifyDevice')
        {
            $.ajax({
                url: '/modifyDevice',
                type: 'POST',
                data: {                
                    deviceName : document.getElementById('deviceName').value,
                    operatingSystem : document.getElementById('operatingSystem').value,
                    visualDescription : document.getElementById('visualDescription').value,
                    resolution : document.getElementById('resolution').value,
                    aspectRatio : document.getElementById('aspectRatio').value,
                    additionalDetails : document.getElementById('additionalDetails').value
            },
            success: function(data, textStatus, jqXHR)
            {
                console.log(" it was a success ");
                confirm.render(null, "modifyAlert", deviceName, null, null);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
            })
        }
    }
    else
    {
        confirm.render(null, "incomplete" , null, null, null);
    }
}
/** Sumbit function for the dialogues concerning the checkout and 
 * return operations **/
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
            document.getElementById('dialogboxfoot').innerHTML = 
                '<button class="dialOption" onclick="confirm.yes(\'' + op + '\',\'' + inputId + '\',\'' + null + '\')">Yes</button> <button class="dialOption" onclick="confirm.no()">No</button>';
        } else if (op == 'checkOutAlert') {
            document.getElementById('dialogboxhead').innerHTML = " You have just checked out the " + deviceName + " !";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';
        } else if (op == 'invalidId') {
            document.getElementById('dialogboxhead').innerHTML = " There does not exist a device with the specified ID ";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';
        }
        else if(op == 'returnAlert')
        {
            document.getElementById('dialogboxhead').innerHTML = " You have just returned the " + deviceName + " !";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';                
        }
        else if(op == 'addAlert')
        {
            document.getElementById('dialogboxhead').innerHTML = " You have just added the " + deviceName + " !";
            document.getElementById('dialogboxfoot').innerHTML ='<button class ="dialOption" onclick="confirm.okay()">Okay</button>';
        }
        else if (op == 'removeDevice') {
            document.getElementById('dialogboxhead').innerHTML = " Are you sure you want to remove the " + deviceName + " ?";
            document.getElementById('dialogboxfoot').innerHTML = 
                '<button class="dialOption" onclick="confirm.yes(\'' + op + '\',\'' + null + '\', \'' + formId + '\')">Yes</button> <button class="dialOption" onclick="confirm.no()">No</button>';
        }
        else if(op == 'removeAlert'){
            document.getElementById('dialogboxhead').innerHTML = " You have just removed the " + deviceName + " !";
            document.getElementById('dialogboxfoot').innerHTML ='<button class ="dialOption" onclick="confirm.okay()">Okay</button>';
        }
        else if(op == 'invalidDeviceName'){
            document.getElementById('dialogboxhead').innerHTML = " There does not exist a device with the entered device name ";
            document.getElementById('dialogboxfoot').innerHTML = '<button class="dialOption" onclick="confirm.okay()">Okay</button>';
        }
        else if (op == 'modifyDevice') {
            document.getElementById('dialogboxhead').innerHTML = " Are you sure you want to save the changes ?";
            document.getElementById('dialogboxfoot').innerHTML = 
                '<button class="dialOption" onclick="confirm.yes(\'' + op + '\',\'' + null + '\', \'' + formId + '\')">Yes</button> <button class="dialOption" onclick="confirm.no()">No</button>';
        }
        else if(op == 'modifyAlert'){
            document.getElementById('dialogboxhead').innerHTML = " Your changes have been successfully saved ";
            document.getElementById('dialogboxfoot').innerHTML ='<button class ="dialOption" onclick="confirm.okay()">Okay</button>';
        }
        else if(op == 'incomplete')
        {
            document.getElementById('dialogboxhead').innerHTML = " Please make sure that you have filled all the asterisk marked fields ";
            document.getElementById('dialogboxfoot').innerHTML ='<button class ="dialOption" onclick="confirm.okay()">Okay</button>';
        }
    }


    this.no = function() {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
    }
    this.yes = function(op, inputId, formId) {
        if (op == "checkOutDevice") {
            customSubmit(inputId, "checkOut");
        }
        else if(op == "removeDevice"){
            adminSubmit(formId,'removeDevice');
        }
        else if(op == 'modifyDevice'){
            adminSubmit(formId, 'modifyDevice');
        }
        confirm.clearDialogBox();
    }
    this.okay = function() {
        confirm.clearDialogBox();
    }
    this.clearDialogBox = function() {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
    }
}
var confirm = new CustomConfirm();
