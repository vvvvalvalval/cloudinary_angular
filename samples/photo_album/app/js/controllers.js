'use strict';
(function () {

  /* Controllers */

  var photoAlbumControllers = angular.module('photoAlbumControllers', ['angularFileUpload','photoAlbumCloudinaryConfig']);

  photoAlbumControllers.controller('photoUploadCtrlJQuery', ['$scope', '$rootScope', '$routeParams', '$location','CLOUD_NAME','UPLOAD_PRESET',
    /* Uploading with jQuery File Upload */
    function ($scope, $rootScope, $routeParams, $location, CLOUD_NAME, UPLOAD_PRESET) {

      $scope.updateTitle = function () {
        var uploadParams = $scope.widget.fileupload('option', 'formData');
        uploadParams["context"] = "photo=" + $scope.title;
        $scope.widget.fileupload('option', 'formData', uploadParams);
      };

      $scope.widget = $(".cloudinary_fileupload")
        .unsigned_cloudinary_upload(UPLOAD_PRESET, {tags: 'myphotoalbum', context: 'photo='}, {
          // Uncomment the following lines to enable client side image resizing and valiation.
          // Make sure cloudinary/processing is included the js file
          //disableImageResize: false,
          //imageMaxWidth: 800,
          //imageMaxHeight: 600,
          //acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|ico)$/i,
          //maxFileSize: 20000000, // 20MB
          dropZone: "#direct_upload",
          start: function (e) {
            $scope.status = "Starting upload...";
            $scope.$apply();
          },
          fail: function (e, data) {
            $scope.status = "Upload failed";
            $scope.$apply();
          }
        })
        .on("cloudinaryprogressall", function (e, data) {
          $scope.progress = Math.round((data.loaded * 100.0) / data.total);
          $scope.status = "Uploading... " + $scope.progress + "%";
          $scope.$apply();
        })
        .on("cloudinarydone", function (e, data) {
          $rootScope.photos = $rootScope.photos || [];
          data.result.context = {custom: {photo: $scope.title}};
          $scope.result = data.result;
          $rootScope.photos.push(data.result);
          $scope.$apply();
        });
    }])

    .controller('photoUploadCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$upload','CLOUD_NAME','UPLOAD_PRESET',
      /* Uploading with Angular File Upload */
      function ($scope, $rootScope, $routeParams, $location, $upload,CLOUD_NAME, UPLOAD_PRESET) {
        $scope.onFileSelect = function ($files) {
          var file = $files[0]; // we're not interested in multiple file uploads here
          $scope.upload = $upload.upload({
            url: "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/upload",
            data: {upload_preset: UPLOAD_PRESET, tags: 'myphotoalbum', context: 'photo=' + $scope.title},
            file: file
          }).progress(function (e) {
            $scope.progress = Math.round((e.loaded * 100.0) / e.total);
            $scope.status = "Uploading... " + $scope.progress + "%";
            $scope.$apply();
          }).success(function (data, status, headers, config) {
            $rootScope.photos = $rootScope.photos || [];
            data.context = {custom: {photo: $scope.title}};
            $scope.result = data;
            $rootScope.photos.push(data);
            $scope.$apply();
          });
        };

        /* Modify the look and fill of the dropzone when files are being dragged over it */
        $scope.dragOverClass = function ($event) {
          var items = $event.dataTransfer.items;
          var hasFile = false;
          if (items != null) {
            for (var i = 0; i < items.length; i++) {
              if (items[i].kind == 'file') {
                hasFile = true;
                break;
              }
            }
          } else {
            hasFile = true;
          }
          return hasFile ? "dragover" : "dragover-err";
        };
      }]);

}());