var app = angular.module("myApp", []);
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
});
