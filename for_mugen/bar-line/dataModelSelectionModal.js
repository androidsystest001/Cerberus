angular.module('sic.controllers')
.controller("dataModelSelectionModal", ['$scope', '$routeParams', 'PDService', '$modalInstance', 'selectedDataModelId', 'dmFolderList', 'dmViewList', function($scope, $routeParams, PDService, $modalInstance, selectedDataModelId, dmFolderList, dmViewList) {
		
		$scope.dmFolderList = dmFolderList;
		$scope.dmViewList = dmViewList;
		$scope.selectedDataModelId = selectedDataModelId;
		
	    $scope.currentFolderId = '/';
	    $scope.changeFolder = function(folderId, event){

	    	$scope.currentFolderId = folderId;
	    };
	    $scope.changeFolderToParent = function(currentFolderId, event){

	    	var currentFolder = _.find($scope.dmFolderList, function(elm){
	    		return elm.folderId == currentFolderId;
	    	});

	    	$scope.currentFolderId = currentFolder.folderParentId;
	    };
	    
		$scope.cancelSelection = function(){
			$modalInstance.dismiss();
		};

		$scope.selectDataModel = function(dm){
			
			if($scope.selectedDataModelId == dm.dataModelId) {
				$scope.cancelSelection();
				return;
			}
			var result = {};
			
			result.dataModelId = dm.dataModelId;
			result.dataModelName = dm.dataModelName;
			
			$modalInstance.close(result);
			
			/*
			// フィールドリストの表示用にフィールド情報を取得して、タイプ毎にグルーピングする
			PDService.getData("getDataModelFields", true , "get", { dataModelId: dm.dataModelId }).then(function(data){
				result.fields = data;
				result.dmId = dm.dataModelId;
				result.dmName = dm.dataModelName;
				
				$modalInstance.close(result);
			});
			*/
        };

	}]);