var x;
var y;

var colors ={
    one: "#eeeeee",
    two: "#ff00ff"
};

var config = {
    minimalChange: {
        posLeft: 5,
        posTop: 5,
        width: 5,
        height: 5
    }
};

var aidee = 1; //id nastepnej karteczki (max + 1)
var przebieg;
var number = 0;
var deleted;
var fridge;

var currentPins = [];


function addBtn() {
    currentPins.push(new _memo(200, 150, (window.innerWidth - 200) / 2, (Math.floor(window.innerHeight - 150) / 2), "<p>word</p>", "Example" ,colors.one, Math.PI/30));
    var temp;
    temp = document.getElementsByClassName("sticker");
    for (var i = 0; i < currentPins.length; i++) {
        if (currentPins[i] != undefined)
            currentPins[i].isLast = false;
    }
    for (var j = 0; j < temp.length; j++) {
        temp[j].style.backgroundColor = "#FFFFAA";
    }
    temp[temp.length - 1].style.backgroundColor = "#FFDDAA";
    currentPins[currentPins.length - 1].isLast = true;

}

function mouseMoveHandler(e) {
    x = e.clientX;
    y = e.clientY;
}
function _memo(_szer, _wys, _posLeft, _posTop, _tresc, _title ,_bg, _rot , _bson) {
    //Data that will be stored in db
    this.id = aidee;
    this.width = _szer;
    this.height = _wys;
    this.posLeft = _posLeft;
    this.posTop = _posTop;

    this.content = _tresc;
    this.title = _title;

    this.background = _bg;
    this.rotation = _rot;

    this.BSONId = _bson;

    //Interval helper variables
    this.interval = null;
    this.movement = null;

    //pomocnicze (movement itd)
    this.offsetX = 0;
    this.offsetY = 0;
    this.isLast = false;
    this.isMoving = false;

    this.setHeight = function (height) {
        ref.height = height;
    };
    this.setWidth = function (width) {
        ref.width = width;
    };

    this.getJSONData = function () {
        return {
            width: this.width,
            height: this.height,
            posLeft: this.posLeft,
            posTop: this.posTop,
            content: this.content,
            title: this.title,
            bg: this.background,
            rotation: this.rotation
        }
    };
    this.sendUpdate = function () {
        var temp = {};
        var keys = Object.keys(previousValues);
        for (var i = 0; i < keys.length; i++)
            if (Math.abs(previousValues[keys[i]] - ref[keys[i]]) > config.minimalChange[keys[i]])
                temp[keys[i]] = ref[keys[i]];

        if (Object.keys(temp).length) {
            temp._id = ref.BSONId;
            update(temp)
        }
    };

    //Refential helper
    var ref = this;
    //Local helpers
    var previousValues = {
        width: _szer,
        height: _wys,
        posTop: _posTop,
        posLeft: _posLeft
    };

    var div = createMainContainer();
    var bottomDiv = createBottomResize();
    var rightDiv = createRightResize();
    var bottomRightDiv = createMainResize();

    var textDiv = document.createElement("div");
    textDiv.style.width = this.width - 10 + "px";
    textDiv.style.height = this.height - 30 + "px";
    textDiv.innerHTML = this.content;
    textDiv.className = "textDisplay";

    document.body.appendChild(div);
    div.appendChild(textDiv);
    div.appendChild(bottomDiv);
    div.appendChild(rightDiv);
    div.appendChild(bottomRightDiv);

    this.startEditing = function () {
        fridge = ref;
        tinyMCE.activeEditor.setContent(this.content);
        document.getElementById("iTitle").value = ref.title;

        document.getElementById("formContainer").style.display = "block";
        document.getElementById("blackout").style.display = "block";
    };
    this.finishEditing = function () {
        var newValue = tinyMCE.activeEditor.getContent();
        var newTitle = document.getElementById("iTitle").value;
        if(newValue != ref.content || newTitle != ref.title){
            ref.content = newValue;
            ref.title = newTitle;
            textDiv.innerHTML = newValue;
            ref.titleDiv.innerHTML = newTitle;

            update({content: newValue, title: newTitle , _id: ref.BSONId})
        }

        document.getElementById("formContainer").style.display = "none";
        document.getElementById("blackout").style.display = "none";
    };

    aidee++;
    number++;

    init();

    function init() {
        var writeIcon = document.createElement("i");
        writeIcon.className = "fa fa-2x fa-pencil icon";
        writeIcon.style.left = "5px";
        var pin = document.createElement("div");
        pin.className = "pin";
        var deleteIcon = document.createElement("i");
        deleteIcon.className = "fa fa-2x fa-trash-o icon";
        deleteIcon.style.left = "35px";
        deleteIcon.addEventListener('mousedown', function () {
            document.body.removeChild(div);
            div.appendChild(deleteIcon);
            div.appendChild(writeIcon);
            number--;
            deleted++;

            deletePin(ref);

            if (number == 0) {
                aidee = 1;
                currentPins = [];
            }
        }, true);
        writeIcon.addEventListener('mousedown', function () {
            removeIntervals();
            ref.startEditing();
        });
        ref.titleDiv = document.createElement("span");
        ref.titleDiv.className = "title";
        ref.titleDiv.innerHTML = ref.title;

        div.appendChild(ref.titleDiv);
        div.appendChild(deleteIcon);
        div.appendChild(pin);
        div.appendChild(writeIcon);

        document.body.addEventListener('mouseup', function () {
            removeIntervals();
            ref.zmieniam = false;

        });

        if (ref.BSONId == undefined)
            createPin(ref);
    }

    function createMainContainer() {
        var div = document.createElement("div");
        div.id = ref.id;
        div.style.left = ref.posLeft + "px";
        div.style.top = ref.posTop + "px";
        div.style.height = ref.height + "px";
        div.style.width = ref.width + "px";
        div.style.zIndex = ref.id;
        div.style.backgroundColor = ref.background;
        div.style.transform = "rotate("+ (ref.rotation*(180/Math.PI))+"deg)";
        div.className = "sticker";


        div.addEventListener('mousedown', function () {
            var temp;
            temp = document.getElementsByClassName("sticker");
            for (var i = 0; i < currentPins.length; i++) {
                if (currentPins[i] != undefined)
                    currentPins[i].isLast = false;
            }
            for (var j = 0; j < temp.length; j++) {
                if (temp[j].style.zIndex > div.style.zIndex) {
                    temp[j].style.zIndex -= 1;
                }
                if (!temp[j].getAttribute("is-selected"))
                    temp[j].style.borderColor = "black";
            }
            div.style.zIndex = temp.length;
            div.setAttribute("isSelected",true);
            div.style.border = "1px solid red";
            ref.isLast = true;

            clearInterval(ref.interval);

            ref.offsetX = x - ref.posLeft;
            ref.offsetY = y - ref.posTop;

            previousValues.posLeft = ref.posLeft;
            previousValues.posTop = ref.posTop;

            ref.interval = setInterval(function () {
                console.log("Interval leci");
                ref.posLeft = x - ref.offsetX;
                ref.posTop = y - ref.offsetY;
                if (currentPins[ref.id - 1] != undefined) {
                    currentPins[ref.id - 1].posLeft = ref.posLeft;
                    currentPins[ref.id - 1].posTop = ref.posTop;
                }
                div.style.left = ref.posLeft + "px";
                div.style.top = ref.posTop + "px";
            }, 16)
        }, true);
        div.addEventListener("mousedown", function () {
            //TODO
            ref.isMoving = false;
        }, false);
        div.addEventListener("mousemove", function () {
            ref.isMoving = true;
        }, false);
        document.addEventListener("mouseup", function () {
            removeIntervals();
            ref.sendUpdate(ref)
        }, false);

        return div;
    }

    function createMainResize() {
        var bottomRightDiv = document.createElement("div");
        bottomRightDiv.className = "thing resize";

        bottomRightDiv.addEventListener('mousedown', function () {
            ref.zmieniam = true;
            clearInterval(ref.interval);
            clearInterval(ref.movement);
            ref.movement = setInterval(function () {
                ref.setWidth(x - ref.posLeft);
                ref.setHeight(y - ref.posTop);
                //ref.width = ;
                //ref.height = ;
                if (ref.width < 100 && ref.height < 50) {
                    ref.width = 100;
                    ref.height = 50;
                } else if (ref.height < 50) {
                    ref.height = 50;
                } else if (ref.width < 100) {
                    ref.width = 100;
                }
                currentPins[ref.id - 1].width = ref.width;
                currentPins[ref.id - 1].height = ref.height;
                div.style.height = ref.height + "px";
                div.style.width = ref.width + "px";
                textDiv.style.height = ref.height - 30 + "px";
                textDiv.style.width = ref.width - 10 + "px";
            }, 16);
        }, true);

        return bottomRightDiv
    }

    function createBottomResize() {
        var bottomDiv = document.createElement("div");
        bottomDiv.className = "thing bottomResize";

        bottomDiv.addEventListener('mousedown', function () {
            clearInterval(ref.interval);
            clearInterval(ref.movement);

            ref.zmieniam = true;

            ref.movement = setInterval(function () {
                ref.setHeight(y - ref.posTop);
                //ref.height = ;
                if (ref.height < 50)
                    ref.height = 50;

                currentPins[ref.id - 1].height = ref.height;
                div.style.height = ref.height + "px";
                textDiv.style.height = ref.height - 30 + "px";
            }, 16);
        });

        return bottomDiv
    }

    function createRightResize() {
        var rightDiv = document.createElement("div");
        rightDiv.className = "thing rightResize";

        rightDiv.addEventListener('mousedown', function () {
            clearInterval(ref.interval);
            clearInterval(ref.movement);

            ref.zmieniam = true;

            ref.movement = setInterval(function () {
                ref.setWidth(x - ref.posLeft);
                //ref.width = ;
                if (ref.width < 100)
                    ref.width = 100;

                currentPins[ref.id - 1].width = ref.width;
                div.style.width = ref.width + "px";
                textDiv.style.width = ref.width - 10 + "px";
            }, 16);
        });

        return rightDiv;
    }

    function removeIntervals() {
        clearInterval(ref.interval);
        clearInterval(ref.movement)
    }
}