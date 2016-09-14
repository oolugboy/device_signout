function adminHide(elementId, admin)
{
    console.log(" The admin got called with the admin = " + admin);
    if(admin == false)
    {
        console.log(" Hiding the admin button now ");
        document.getElementById(elementId).style.display = "none";   
    }
}
