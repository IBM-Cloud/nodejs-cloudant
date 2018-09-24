var app = angular.module("app", []);
app.controller("myController", function($scope) {

        $scope.categories = ["Video", "BestPhoto", "Photo"];
        $scope.addCategory = function () {
            $scope.errortext = "";
            if (!$scope.addMe) {return;}
            if ($scope.categories.indexOf($scope.addMe) == -1) {
                $scope.categories.push($scope.addMe);
            } else {
                $scope.errortext = "This category is already exists.";
            }
        }
        $scope.removeCategory = function (x) {
            $scope.errortext = "";
            $scope.categories.splice(x, 1);
        }
    $scope.toggleAppInfo = function toggleAppInfo() {
        var node = document.getElementById('appinfo');
        node.style.display = node.style.display == 'none' ? '' : 'none';
    };

    $scope.files = [];
    $scope.upload=function(node) {

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

    };
});


function addNewRow(table) {
    var newRow = document.createElement('tr');
    table.appendChild(newRow);
    return table.lastChild;
}


app.directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind('change', function () {
                var values = [];
                angular.forEach(element[0].files, function (item) {
                    var value = {
                        // File Name
                        name: item.name,
                        //File Size
                        size: item.size,
                        //File URL to view
                        url: URL.createObjectURL(item),
                        // File Input Value
                        _file: item
                    };
                    values.push(value);
                });
                scope.$apply(function () {
                    if (isMultiple) {
                        modelSetter(scope, values);
                    } else {
                        modelSetter(scope, values[0]);
                    }
                });
            });
        }
    };
}]);