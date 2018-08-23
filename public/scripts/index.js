// index.js

var REST_DATA = 'api/favorites';
var KEY_ENTER = 13;
var defaultItems = [

];

function encodeUriAndQuotes(untrustedStr) {
    return encodeURI(String(untrustedStr)).replace(/'/g, '%27').replace(')', '%29');
}

function loadItems() {
    xhrGet(REST_DATA, function(data) {

        //stop showing loading message
        stopLoadingMessage();

        var receivedItems = data || [];
        var items = [];
        var i;
        // Make sure the received items have correct format
        for (i = 0; i < receivedItems.length; ++i) {
            var item = receivedItems[i];
            if (item && 'id' in item) {
                items.push(item);
            }
        }
        var hasItems = items.length;
        if (!hasItems) {
            items = defaultItems;
        }
        for (i = 0; i < items.length; ++i) {
            addItem(items[i], !hasItems);
        }
        if (!hasItems) {
            var table = document.getElementById('notes');
            var nodes = [];
            for (i = 0; i < table.rows.length; ++i) {
                nodes.push(table.rows[i].firstChild.firstChild);
            }

            function save() {
                if (nodes.length) {
                    saveChange(nodes.shift(), save);
                }
            }
            save();
        }
    }, function(err) {
        console.error(err);
    });
}

function startProgressIndicator(row) {
    row.innerHTML = "<td class='content'>Uploading file... <img height=\"50\" width=\"50\" src=\"images/loading.gif\"></img></td>";
}

function removeProgressIndicator(row) {
    row.innerHTML = "<td class='content'>uploaded...</td>";
}

function addNewRow(table) {
    var newRow = document.createElement('tr');
    table.appendChild(newRow);
    return table.lastChild;
}

function uploadFile(node) {

    var file = node.previousSibling.files[0];

    //if file not selected, throw error
    if (!file) {
        alert("File not selected for upload... \t\t\t\t \n\n - Choose a file to upload. \n - Then click on Upload button.");
        return;
    }

    var row = node.parentNode.parentNode.parentNode;

    var form = new FormData();
    form.append("file", file);

    var id = row.getAttribute('data-id');

    var queryParams = "id=" + (id == null ? -1 : id);
    queryParams += "&name=" + row.firstChild.firstChild.value;
    queryParams += "&value=" + row.firstChild.nextSibling.firstChild.value;


    var table = row.firstChild.nextSibling.firstChild;
    var newRow = addNewRow(table);

    startProgressIndicator(newRow);

    xhrAttach(REST_DATA + "/attach?" + queryParams, form, function(item) {
        console.log('Item id - ' + item.id);
        console.log('attached: ', item);
        row.setAttribute('data-id', item.id);
        removeProgressIndicator(row);
        setRowContent(item, row);
    }, function(err) {
        console.error(err);
    });

}

var attachButton = "<br><div class='uploadBox'><input type=\"file\" name=\"file\" id=\"upload_file\"><input width=\"100\" type=\"submit\" value=\"Upload\" onClick='uploadFile(this)'></div>";



function onKey(evt) {

    if (evt.keyCode == KEY_ENTER && !evt.shiftKey) {

        evt.stopPropagation();
        evt.preventDefault();
        var nameV, valueV;
        var row;

        if (evt.target.id == "nameText") {
            row = evt.target.parentNode.parentNode;
            nameV = evt.target.value;
            valueV = row.firstChild.nextSibling.firstChild.value;

        } else {
            row = evt.target.parentNode.parentNode;
            nameV = row.firstChild.firstChild.value;
            valueV = evt.target.value;
        }

        var data = {
            name: nameV,
            value: valueV
        };

        if (row.isNew) {
            delete row.isNew;
            xhrPost(REST_DATA, data, function(item) {
                row.setAttribute('data-id', item.id);
            }, function(err) {
                console.error(err);
            });
        } else {
            data.id = row.getAttribute('data-id');
            xhrPut(REST_DATA, data, function() {
                console.log('updated: ', data);
            }, function(err) {
                console.error(err);
            });
        }


        if (row.nextSibling) {
            row.nextSibling.firstChild.firstChild.focus();
        } else {
            addItem();
        }
    }
}

function saveChange(contentNode, callback) {
    var row = contentNode.parentNode.parentNode;

    var data = {
        name: row.firstChild.firstChild.value,
        value: row.firstChild.nextSibling.firstChild.value
    };

    if (row.isNew) {
        delete row.isNew;
        xhrPost(REST_DATA, data, function(item) {
            row.setAttribute('data-id', item.id);
            callback && callback();
        }, function(err) {
            console.error(err);
        });
    } else {
        data.id = row.getAttribute('data-id');
        xhrPut(REST_DATA, data, function() {
            console.log('updated: ', data);
        }, function(err) {
            console.error(err);
        });
    }
}

function toggleServiceInfo() {
    var node = document.getElementById('vcapservices');
    node.style.display = node.style.display == 'none' ? '' : 'none';
}

function showLoadingMessage() {
    document.getElementById('loadingImage').innerHTML = "Loading data " + "<img height=\"100\" width=\"100\" src=\"images/loading.gif\"></img>";
}

function stopLoadingMessage() {
    document.getElementById('loadingImage').innerHTML = "";
}

showLoadingMessage();
//updateServiceInfo();
loadItems();
