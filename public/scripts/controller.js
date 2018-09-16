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

app.directive("imgUpload",function($http,$compile){
    return {
        restrict : 'AE',
        scope : {
            url : "@",
            method : "@"
        },
        template : 	'<input class="fileUpload" type="file" multiple />'+
        '<div class="dropzone">'+
        '<p class="msg">Click or Drag and Drop files to upload</p>'+
        '</div>'+
        '<div class="preview clearfix">'+
        '<div class="previewData clearfix" ng-repeat="data in previewData track by $index">'+
        '<img src={{data.src}}></img>'+
        '<div class="previewDetails">'+
        '<div class="detail"><b>Name : </b>{{data.name}}</div>'+
        '<div class="detail"><b>Type : </b>{{data.type}}</div>'+
        '<div class="detail"><b>Size : </b> {{data.size}}</div>'+
        '</div>'+
        '<div class="previewControls">'+
        '<span ng-click="upload(data)" class="circle upload">'+
        '<i class="fa fa-check"></i>'+
        '</span>'+
        '<span ng-click="remove(data)" class="circle remove">'+
        '<i class="fa fa-close"></i>'+
        '</span>'+
        '</div>'+
        '</div>'+
        '</div>',
        link : function(scope,elem,attrs){
            var formData = new FormData();
            scope.previewData = [];

            function previewFile(file){
                var reader = new FileReader();
                var obj = new FormData().append('file',file);
                reader.onload=function(data){
                    var src = data.target.result;
                    var size = ((file.size/(1024*1024)) > 1)? (file.size/(1024*1024)) + ' mB' : (file.size/		1024)+' kB';
                    scope.$apply(function(){
                        scope.previewData.push({'name':file.name,'size':size,'type':file.type,
                            'src':src,'data':obj});
                    });
                    console.log(scope.previewData);
                }
                reader.readAsDataURL(file);
            }

            function uploadFile(e,type){
                e.preventDefault();
                var files = "";
                if(type == "formControl"){
                    files = e.target.files;
                } else if(type === "drop"){
                    files = e.originalEvent.dataTransfer.files;
                }
                for(var i=0;i<files.length;i++){
                    var file = files[i];
                    if(file.type.indexOf("image") !== -1){
                        previewFile(file);
                    } else {
                        alert(file.name + " is not supported");
                    }
                }
            }
            elem.find('.fileUpload').bind('change',function(e){
                uploadFile(e,'formControl');
            });

            elem.find('.dropzone').bind("click",function(e){
                $compile(elem.find('.fileUpload'))(scope).trigger('click');
            });

            elem.find('.dropzone').bind("dragover",function(e){
                e.preventDefault();
            });

            elem.find('.dropzone').bind("drop",function(e){
                uploadFile(e,'drop');
            });
            scope.upload=function(obj){
                $http({method:scope.method,url:scope.url,data: obj.data,
                    headers: {'Content-Type': undefined},transformRequest: angular.identity
                }).success(function(data){

                });
            }

            scope.remove=function(data){
                var index= scope.previewData.indexOf(data);
                scope.previewData.splice(index,1);
            }
        }
    }
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

function startProgressIndicator(row) {
    row.innerHTML = "<td class='content'>Uploading file... <img height=\"50\" width=\"50\" src=\"images/loading.gif\"></img></td>";
}