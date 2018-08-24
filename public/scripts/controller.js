var app = angular.module("myApp", []);
app.controller("myController", function($scope) {
    $scope.title = '';
    $scope.description = '';
    $scope.files = [
        {id: 1, title: 'example', description: "this is a file"}
    ];
    $scope.edit = true;
    $scope.error = false;
    $scope.hideform = true;
    $scope.editUser = function (id) {
        $scope.hideform = false;
        if (id == 'new') {
            $scope.edit = true;
            $scope.title = '';
            $scope.description = '';
        } else {
            $scope.edit = false;
            $scope.title = $scope.files[id - 1].title;
            $scope.description = $scope.files[id - 1].description;
        }
    };
    $scope.toggleAppInfo = function toggleAppInfo() {
        var node = document.getElementById('appinfo');
        node.style.display = node.style.display == 'none' ? '' : 'none';
    };
});
