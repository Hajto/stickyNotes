function createPin(pin) {
    var data = pin.getJSONData();
    var connection = new _haitoRequest(
        "create",
        "POST",
        data,
        function (response) {
            var parsed = JSON.parse(response);
            if (parsed.success) {
                pin.BSONId = parsed._id
            }
        }, function (response) {
            alert(response)
        }
    );
    console.log(connection + "connection");

    ajaxAPI(connection)
}

function syncPins() {
    currentPins = [];
    var connection = new _haitoRequest(
        "all",
        "GET",
        {},
        function (response) {
            parseFeed(JSON.parse(response))
        },
        function (response) {
            alert(response)
        }
    );
    ajaxAPI(connection)
}

function deletePin(pin) {
    console.log({_id: pin.BSONId});
    var connection = new _haitoRequest(
        "remove",
        "Post",
        {_id: pin.BSONId},
        function (response) {
            alert("Usuwanie zakończono pomyślnie")
        }, function (response) {
            alert(response)
        }
    );

    ajaxAPI(connection)
}

function update(data) {
    var connection = new _haitoRequest(
        "update",
        "POST",
        data,
        function (response) {

        }, function (response) {
            alert(response)
        }
    );

    ajaxAPI(connection)
}

function parseFeed(array) {
    for (var i = 0; i < array.length; i++) {
        var object = array[i];
        currentPins.push(new _memo(object.id, object.width, object.height, object.posLeft, object.posTop, object.content, object._id.$oid))
    }
}