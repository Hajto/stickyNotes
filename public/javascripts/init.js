function init(){
    syncPins();
    document.addEventListener("mousemove",mouseMoveHandler,false);
    document.getElementById("addButton").addEventListener("click",addBtn,false);
    document.getElementById("submit").addEventListener("click",function(){
        fridge.finishEditing();
    },false);
    tinymce.init({selector:'textarea'});

    deleted = currentStats.deleted != undefined ? currentStats.deleted : 0;
    everCreated = currentStats.created != undefined ? currentStats.created : 0;
    syncStats();
}

function syncStats(){
    document.getElementById("created").innerHTML = "Utworzono "+everCreated;
    document.getElementById("deleted").innerHTML = "Usunięto "+deleted;
    document.getElementById("currentCount").innerHTML = "Obecnie " + currentPins.length;
}