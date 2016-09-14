/** Javascript file that pertains to all the dialogues 
 * for all the pages **/   


/* This function is used to get the name of the device
 * that the user is going to checkout, return or remove
 * **/
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
/* This to get the full name of the employee that the user
 * is trying to add as an adminsitrator **/ 
function getUserName(inputId, formId, op) {
    // Make sure that the user actually entered the device name or id 
    if (document.getElementById(inputId).checkValidity() == true) {
        var username = document.getElementById(inputId).value;

        $.ajax({
            url: "/userNameQuery",
            type: "POST",
            data: {
                username: username,
                op : op
            },
            success: function(data, textStatus, jqXHR) {
                if (typeof data !== 'undefined') {
                    var firstName = (JSON.parse(data)).firstName;
                    var lastName = (JSON.parse(data)).lastName;
                    var wholeName = "";
                    wholeName += (firstName + " " + lastName); 
                    if (firstName == 'Does Not Exist')
                    {
                        confirm.render(null, "invalidUserName", null, inputId, formId);
                    }
                    else
                    {
                        if(op == 'addAdmin')
                        {
                            confirm.render2(null, "addAdmin", wholeName, inputId, formId);
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

/* This function is used to display the details of the 
 * device that the user is trying to modify on the modify device 
 * page **/
function loadDetails(inputId)
{
    console.log("Load detials got called ");
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
                if(data == '"Does not exist"')
                {
                    confirm.render(null, "invalidDeviceName", null, null, null);
                }
                else 
                {
                    document.getElementById("t_deviceId").innerHTML = details.deviceId;
                    document.getElementById("t_deviceName").innerHTML = details.deviceName;
                    document.getElementById("t_operatingSystem").innerHTML = details.operatingSystem;
                    document.getElementById("t_visualDescription").innerHTML = details.visualDescription;
                    document.getElementById("t_resolution").innerHTML = details.resolution;
                    document.getElementById("t_aspectRatio").innerHTML = details.aspectRatio;
                    document.getElementById("t_additionalDetails").innerHTML = details.additionalDetails;
                }
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


/* This is the function is called when the adminstrator
 * has verified that they want to make the admninstrative changes.
 * In other words, any of the post server request made by this 
 * function modifies the database in some way **/
function adminSubmit(formId, op)
{
    if(document.getElementById(formId).checkValidity() == true || op == "modifyDevice" )
    {
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
                    deviceId : document.getElementById('deviceId').value,
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
        if(op == 'addAdmin')
        {
            $.ajax({
                url: '/addAdmin',
                type: 'POST',
                data: { 
                   username  : document.getElementById('username').value,
            },
            success: function(data, textStatus, jqXHR)
            {
                console.log(" it was a success ");
                confirm.render2(null, "alertAddAdmin", JSON.parse(data), null, null);
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
/* This function is similar to that of the adminSubmit function
 * but this one pertains to non adminstrative operation
 * like checking out and returning devices **/
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
                console.log(" custom submit succeeded with data " + data);
                if (typeof data !== 'undefined') {
                    var deviceName = JSON.parse(data);
                    if(checkOut == true)                            	
            confirm.render(null, "checkOutAlert", deviceName, inputId, null);
                    else
            confirm.render(null,"returnAlert",deviceName,inputId,null);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });
    }
}

function CustomConfirm() {
    /* This render methods pertains to the dialogues that
     * have have to do with the device **/
    this.render = function(dialog, op, deviceName, inputId, formId) {

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
    /* This render method pertains to the dialogues that 
     * have to do with users **/
    this.render2 = function(dialog, op, wholeName , inputId, formId) {

        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');
        dialogoverlay.style.display = "block";
        dialogoverlay.style.height = winH + "px";
        dialogbox.style.left = (winW / 2) - (550 * .5) + "px";
        dialogbox.style.top = "100px";
        dialogbox.style.display = "block";
        dialogbox.style.width = "600px";

        if(op == 'invalidUserName')
        {
            document.getElementById('dialogboxhead').innerHTML  = " There does not exist a user with that username ";
            document.getElementById('dialogboxfoot').innerHTML  = '<button class ="dialOption" onclick="confirm.okay()">Okay</button>'; 
        }
        else if(op == 'addAdmin')
        {
            document.getElementById('dialogboxhead').innerHTML = " Are you sure you want to add " + wholeName + " as an admin ?";
            document.getElementById('dialogboxfoot').innerHTML = 
                '<button class="dialOption" onclick="confirm.yes(\'' + op + '\',\'' + null + '\', \'' + formId + '\')">Yes</button> <button class="dialOption" onclick="confirm.no()">No</button>';
        }
        else if(op == 'alertAddAdmin')// Note: in this case, the whole name would just be the username
        {
            document.getElementById('dialogboxhead').innerHTML = " You have just added " + wholeName + " as an admin!";
            document.getElementById('dialogboxfoot').innerHTML ='<button class ="dialOption" onclick="confirm.okay()">Okay</button>';
        }

    }


    this.no = function() {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
    }
    /** These call the submit functions if the user says yes
     * to the dialogues **/
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
        else if(op == 'addAdmin'){
            adminSubmit(formId, 'addAdmin');
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
/** Object used to access all of the Custom Confirm methods **/
var confirm = new CustomConfirm();
