function init(){
    syncPins();
    document.addEventListener("mousemove",mouseMoveHandler,false);
    document.getElementById("addButton").addEventListener("click",addBtn,false);
    document.getElementById("submit").addEventListener("click",function(){
        fridge.finishEditing();
    },false);
    tinymce.init({selector:'textarea'});
}