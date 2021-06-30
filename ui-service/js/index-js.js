const URL = `http://34.66.138.117:3000`;
// Updated 14:42
const users = {};

document.getElementById('username').addEventListener('focusout', checkUserExist);

async function checkUserExist(){
    try{
        const result = await fetch(`${URL}/getStocks`);
        const usersList = await result.json();

        Object.assign(users, usersList);
        const entry = $("#username").val();
        $("#usernameError").html("");
        if(String(entry).length > 0) {
            var found = Object.keys(usersList).filter(function(key) {
                return users[key]["Firstname"] === entry;
            });

            if(found.length === 0){
                $("#usernameError").html(`User ${entry} does not exist`);
            }
        }
    }
    catch(err){
        console.log(err);
        throw(err);
    }
}

function submitForm(username){
    try{
        const entry = $("#username").val();
        if(String(entry).length > 0) {
            // console.log(users);
            var found = Object.keys(users).filter(function(key) {
                return users[key]["Firstname"] === username;
            });

            if(found.length){
                window.location = `/userDetails?Firstname=${entry}`;
            }
            else{
                $("#usernameError").html(`User ${username} does not exist`);
            }
            event.preventDefault();
        }

    }
    catch (err) {
        console.log(err);
        throw(err);
    }
}
