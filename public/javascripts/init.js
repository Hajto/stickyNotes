function init(){
    syncPins();
    document.addEventListener("mousemove",mouseMoveHandler,false);
    tinymce.init({selector:'textarea'});
}