/* 管理線つきLINEチャート（複数フィールド版）
*  SingleDimensionTwoMeasureJSに管理線の制御部分を加えたもの
*	Created by M.Ikeuchi
*	Create date 2016.09.05
*/

angular.module('sic.controllers')
	.controller('TripleDataModelChartConfigCtrl', [ '$scope', 'logService','$timeout', '$http', '$attrs', '$rootScope', '$modal', '$filter', 'PDService', 'UtilService', '$q',
													function ($scope, logService, $timeout, $http, $attrs, $rootScope, $modal, $filter, PDService, UtilService, $q) {
		
		//Edit case
		if ($scope.$parent.isEditCase) {

			$scope.$parent.widgetCreationObj.chart.config = angular.copy($scope.$parent.data.widgetInfo.widgetConfig);
			$scope.widgetCreationObj.chart.widgetFilters = angular.copy($scope.$parent.data.widgetInfo.widgetFilters);
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig = angular.copy($scope.$parent.data.widgetInfo.facetMergeConfig.measureRowInfos);

			var facetMergeConfigLength = $scope.$parent.widgetCreationObj.chart.facetMergeConfig.length;
			
			for(var i = 0 ; i < (7 - facetMergeConfigLength ); i++) {

				facetMergeMeasureConfig = {};
				facetMergeMeasureConfig.expression = "";
				facetMergeMeasureConfig.display = "";
				facetMergeMeasureConfig.fields = [];
				facetMergeMeasureConfig.fields.push({
								"aggFunction"	: 	"",
								"value"			: 	"",
								"dataModelId"	: 	"",
								"fieldId"		: 	"",
								"operator"		: 	"none"
				});
				$scope.$parent.widgetCreationObj.chart.facetMergeConfig.push(facetMergeMeasureConfig);
			}


			if ($scope.$parent.data.widgetInfo.dimensionHierarchy !=undefined || $scope.$parent.data.widgetInfo.dimensionHierarchy != null) {
				$scope.$parent.widgetCreationObj.chart.dimensionHierarchy['0'] = angular.copy($scope.$parent.data.widgetInfo.dimensionHierarchy);
			}
			$scope.$parent.widgetCreationObj.chart.widgetTitle =  angular.copy($scope.$parent.data.widgetInfo.widgetTitle);
			$scope.$parent.dimensionSort[0] = _.findKey(PDService.getSortMap(),  [$scope.$parent.data.widgetInfo.widgetConfig.dimensionSort[0].sortBy,
			                                                    $scope.$parent.data.widgetInfo.widgetConfig.dimensionSort[0].sortOrder]);
			$scope.$parent.widgetCreationObj.chart.widgetId = $scope.$parent.data.widgetInfo.widgetId;
			$scope.$parent.widgetCreationObj.chart.widgetDescription = $scope.$parent.data.widgetInfo.widgetDescription;
			$scope.$parent.selectDataChainPage($scope.$parent.data.widgetInfo.widgetConfig.dimension[0].targetPage);

			if ($scope.$parent.widgetCreationObj.chart.widgetDescription != "") {
				$scope.$parent.toggleDescription(true);
			}

			if ($scope.$parent.data.widgetInfo.widgetConfig.dimension[0].targetPage != "") {
				$scope.$parent.toggleDataChain(true);
			}

			var dimensionHierarchyLength = $scope.$parent.widgetCreationObj.chart.dimensionHierarchy['0'].length;
			if (dimensionHierarchyLength < 2) {

				for(var i = dimensionHierarchyLength; i < 2; i++) {
					$scope.$parent.widgetCreationObj.chart.dimensionHierarchy['0'].push({
						"dataModelFieldId": null,
						"dataModelDispVal": null,
						"fieldDefaultAction": "drilldown",
						'targetDMId'		: "",
						"count": null,
						"targetPage": "",
						"dataType": null
					});
				}
			} else {
				if (!($scope.$parent.widgetCreationObj.chart.dimensionHierarchy['0'][0].dataModelFieldId == null)) {
					$scope.$parent.toggleHierarchy(true);
				}
			}
			
			var extraConfigYAxis = $scope.$parent.widgetCreationObj.chart.config.extraConfigYAxis;
			var extraConfigYAxisLength = extraConfigYAxis.length;
			for(var i = 0 ; i < (2 - extraConfigYAxisLength ); i++) {
				extraConfigYAxis.push({
					dataModelDispVal: "",
					percentDisplay: i === 0 ? false : true,
					min_value: null,
					max_value: null
				});
			}
			
			var extraConfigFields = $scope.$parent.widgetCreationObj.chart.config.extraConfigFields;
			var extraConfigFieldsLength = extraConfigFields.length;			
			for(var i = 0 ; i < (7 - extraConfigFieldsLength ); i++) {
				extraConfigFields.push({
					"lineType" : i < 3 ? "column" : "line",
					"roundType": "",
					"decimalPlaces": 0,
					"yAxis": i < 3 ? 0 : 1,
					"dataModelId": "",
					"dataModelName": "----"
				});
			}
			
			var extraConfigDimensions = $scope.$parent.widgetCreationObj.chart.config.extraConfigDimensions;
			var extraConfigDimensionsLength = extraConfigDimensions.length;			
			for(var i = 0 ; i < (1 - extraConfigDimensionsLength ); i++) {
				extraConfigDimensions.push({
					"dataModelId": "",
					"dataModelName": "----"
				});
			}
			
			$scope.$parent.setEditModeOff();
		} else {
			//new widget creation case

			var chartObj = $scope.$parent.widgetCreationObj.chart;
			var dimensionLength = chartObj.config.dimension.length;
			var measureLenth = chartObj.config.measure.length;
			var dimensionHierarchyLength = chartObj.dimensionHierarchy['0'].length;

			if (dimensionLength < 1) {
				for(var i = dimensionLength; i < 1; i++) {
					chartObj.config.dimension.push({
						'dataModelFieldId'	: null,
						'dataModelDispVal'	: null,
						'fieldDefaultAction': "drilldown",
						'count'				: null,
						'targetPage'		: "",
						'targetDMId'		: "",
						'dataType'			: null
					});
					chartObj.config.dimensionSort.push({
						'sortFieldId' 	: null,
						'sortBy'		: null,
						'sortOrder'		: null
					});
				}
			} else if (dimensionLength > 1) {
				chartObj.config.dimension = chartObj.config.dimension.splice(0,1);
				chartObj.config.dimensionSort = chartObj.config.dimensionSort.splice(0,1);
			}
			if (measureLenth < 1) {
				for(var i = measureLenth; i < 1; i++) {
					chartObj.config.measure.push({
						'dataModelFieldId'		: "",
						'dataModelFieldDispVal'	: "",
						'aggFunction'			: ""
					});
				}
			} else {
				chartObj.config.measure = chartObj.config.measure.splice(0,1);
			}
			if (dimensionHierarchyLength < 2) {

				for(var i = dimensionHierarchyLength; i < 2; i++) {
					chartObj.dimensionHierarchy['0'].push({
						"dataModelFieldId": null,
						"dataModelDispVal": null,
						"fieldDefaultAction": "drilldown",
						'targetDMId'		: "",
						"count": null,
						"targetPage": "",
						"dataType": null
					});
				}
			}


			var facetMergeConfigLength;
			if (typeof chartObj.facetMergeConfig == "undefined") {
				chartObj.facetMergeConfig = [];
				facetMergeConfig = [];
				facetMergeMeasureConfig = {};
				facetMergeMeasureConfig.fields = [];
				facetMergeMeasureConfig.expression = "";
				facetMergeMeasureConfig.display = "";
				facetMergeConfigLength = 0;
			} else {
				facetMergeConfigLength = chartObj.facetMergeConfig.length;
			}
		
			chartObj.config.extraConfigFields = [];
			
			if(facetMergeConfigLength < 7) {

				for(var i = facetMergeConfigLength; i < 7; i++) {

					facetMergeMeasureConfig = {};
					facetMergeMeasureConfig.fields = [];
					
					facetMergeMeasureConfig.fields.push({
						"dataModelId"	: 	"",
						"fieldId"		: 	"",
						"aggFunction"	: 	"",
						"operator"		: 	"none",
						"value"			: 	""
					});
						
					facetMergeMeasureConfig.expression = "";
					facetMergeMeasureConfig.display = "Count";
					chartObj.facetMergeConfig.push(facetMergeMeasureConfig);

				}
			}
			
			var extraConfigYAxisLength;
			if (typeof chartObj.config.extraConfigYAxis == "undefined") {
				chartObj.config.extraConfigYAxis = [];
				extraConfigYAxisLength = 0;
			} else {
				extraConfigYAxisLength = chartObj.config.extraConfigYAxis.length;
			}
			
			for(var i = extraConfigYAxisLength; i < 2; i++) {
				chartObj.config.extraConfigYAxis.push({
					dataModelDispVal: "",
					percentDisplay: i === 0 ? false : true,
					min_value: null,
					max_value: null
				});
			}
			
			var extraConfigFieldsLength;
			if (typeof chartObj.config.extraConfigFields == "undefined") {
				chartObj.config.extraConfigFields = [];
				extraConfigFieldsLength = 0;
			} else {
				extraConfigFieldsLength = chartObj.config.extraConfigFields.length;
			}
			
			for(var i = extraConfigFieldsLength; i < 7; i++) {
				chartObj.config.extraConfigFields.push({
					"lineType" : i < 3 ? "column" : "line",
					"roundType": "",
					"decimalPlaces": 0,
					"yAxis": i < 3 ? 0 : 1,
					"dataModelId": "",
					"dataModelName": "----"
				});
			}
			
			var extraConfigDimensionsLength;
			if (typeof chartObj.config.extraConfigDimensions == "undefined") {
				chartObj.config.extraConfigDimensions = [];
				extraConfigDimensionsLength = 0;
			} else {
				extraConfigDimensionsLength = chartObj.config.extraConfigDimensions.length;
			}
			
			for(var i = extraConfigDimensionsLength; i < 1; i++) {
				chartObj.config.extraConfigDimensions.push({
					"dataModelId": "",
					"dataModelName": "----"
				});
			}

		}

		$scope.$parent.lineTypeMap = UtilService.getLineTypeMap();
		$scope.$parent.roundTypeMap = UtilService.getRoundMap();
		$scope.$parent.yAxisMap   = UtilService.getYAxisMap();
				
		// Field Selector追加対応
		var dataModelIdInitList = [
			$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.config.measure[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig[1].fields[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig[2].fields[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig[3].fields[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig[4].fields[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig[5].fields[0].dataModelId,
			$scope.$parent.widgetCreationObj.chart.facetMergeConfig[6].fields[0].dataModelId
		];
		var getDataModelFieldsPromises = _.map(dataModelIdInitList, function(dataModelId) {
			return PDService.getData("getDataModelFields", true , "get", { dataModelId: dataModelId});
		});
		
		$q.all(getDataModelFieldsPromises).then(function(data){
			var indexData = 0;
			$scope.$parent.dimFieldName[0] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelFieldId);
		
			// FRMフィールド存在確認
			if($scope.$parent.data.pageDataModelId != $scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelId
					&& $scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelFieldId != null)
			{
				$scope.isFrmField( $scope.$parent.data.pageDataModelId,
									$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelId,
									$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelFieldId,
									$scope.$parent.dimFieldName[0],
									1 );
			}
			
			$scope.$parent.msrFieldName[0] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.config.measure[0].dataModelFieldId);
			
			$scope.$parent.msrFieldName[1] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId);
			$scope.$parent.msrFieldName[2] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.facetMergeConfig[2].fields[0].fieldId);
			$scope.$parent.msrFieldName[3] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.facetMergeConfig[3].fields[0].fieldId);
			$scope.$parent.msrFieldName[4] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.facetMergeConfig[4].fields[0].fieldId);
			$scope.$parent.msrFieldName[5] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.facetMergeConfig[5].fields[0].fieldId);
			$scope.$parent.msrFieldName[6] = PDService.getFieldDisplayName(data[indexData++], $scope.$parent.widgetCreationObj.chart.facetMergeConfig[6].fields[0].fieldId);
		});

		$scope.$parent.openModalDataModel = function(fieldType, idx, size) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'dataModelSelection.html',
				controller: 'dataModelSelectionModal',
				size: size,
				resolve: {
					selectedDataModelId: function() {
						var selectedDataModelId = null;
						var chartObj = $scope.$parent.widgetCreationObj.chart;
						var extraConfigFields = chartObj.config.extraConfigFields;
						var extraConfigDimensions = chartObj.config.extraConfigDimensions;
						
						if(fieldType=='DIM'){
							selectedDataModelId = extraConfigDimensions[0].dataModelId;
						}else if(fieldType=='MSR1'){
							selectedDataModelId = extraConfigFields[0].dataModelId;
						}else if(fieldType=='MSR2'){
							selectedDataModelId = extraConfigFields[1].dataModelId;
						}else if(fieldType=='MSR3'){
							selectedDataModelId = extraConfigFields[2].dataModelId;
						}else if(fieldType=='MSR4'){
							selectedDataModelId = extraConfigFields[3].dataModelId;
						}else if(fieldType=='MSR5'){
							selectedDataModelId = extraConfigFields[4].dataModelId;
						}else if(fieldType=='MSR6'){
							selectedDataModelId = extraConfigFields[5].dataModelId;
						}else if(fieldType=='MSR7'){
							selectedDataModelId = extraConfigFields[6].dataModelId;
						}
						return selectedDataModelId;
					},
					dmFolderList: function() {
						return $scope.$parent.dmFolderList;
					},
					dmViewList: function() {
						return $scope.$parent.dmViewList;
					}
				}
			});

			modalInstance.result.then(function(data) {
				if (data.dataModelId !== undefined && data.dataModelId !== null && data.dataModelId.length > 0) {

					var chartObj = $scope.$parent.widgetCreationObj.chart;
					var extraConfigFields = chartObj.config.extraConfigFields;
					var extraConfigDimensions = chartObj.config.extraConfigDimensions;
					
					var facetMergeConfig = chartObj.facetMergeConfig;
					
					if(fieldType=='DIM'){
						extraConfigDimensions[0].dataModelId = data.dataModelId;
						extraConfigDimensions[0].dataModelName = data.dataModelName;
						
						$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelId = extraConfigDimensions[0].dataModelId;
						$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelFieldId = "";
						$scope.$parent.dimFieldName[0] = "----";
					}else if(fieldType=='MSR1'){
						extraConfigFields[0].dataModelId = data.dataModelId;
						extraConfigFields[0].dataModelName = data.dataModelName;
						
						facetMergeConfig[0].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[0].fields[0].fieldId = "";
						$scope.$parent.widgetCreationObj.chart.config.measure[0].dataModelId = data.dataModelId;
						$scope.$parent.widgetCreationObj.chart.config.measure[0].dataModelFieldId = "";
						$scope.$parent.msrFieldName[0] = "----";
					}else if(fieldType=='MSR2'){
						extraConfigFields[1].dataModelId = data.dataModelId;
						extraConfigFields[1].dataModelName = data.dataModelName;

						facetMergeConfig[1].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[1].fields[0].fieldId = "";
						$scope.$parent.msrFieldName[1] = "----";
					}else if(fieldType=='MSR3'){
						extraConfigFields[2].dataModelId = data.dataModelId;
						extraConfigFields[2].dataModelName = data.dataModelName;

						facetMergeConfig[2].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[2].fields[0].fieldId = "";
						$scope.$parent.msrFieldName[2] = "----";
					}else if(fieldType=='MSR4'){
						extraConfigFields[3].dataModelId = data.dataModelId;
						extraConfigFields[3].dataModelName = data.dataModelName;

						facetMergeConfig[3].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[3].fields[0].fieldId = "";
						$scope.$parent.msrFieldName[3] = "----";
					}else if(fieldType=='MSR5'){
						extraConfigFields[4].dataModelId = data.dataModelId;
						extraConfigFields[4].dataModelName = data.dataModelName;

						facetMergeConfig[4].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[4].fields[0].fieldId = "";
						$scope.$parent.msrFieldName[4] = "----";
					}else if(fieldType=='MSR6'){
						extraConfigFields[5].dataModelId = data.dataModelId;
						extraConfigFields[5].dataModelName = data.dataModelName;

						facetMergeConfig[5].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[5].fields[0].fieldId = "";
						$scope.$parent.msrFieldName[5] = "----";
					}else if(fieldType=='MSR7'){
						extraConfigFields[6].dataModelId = data.dataModelId;
						extraConfigFields[6].dataModelName = data.dataModelName;

						facetMergeConfig[6].fields[0].dataModelId = data.dataModelId;
						facetMergeConfig[6].fields[0].fieldId = "";
						$scope.$parent.msrFieldName[6] = "----";
					}
				}
			}, function() {
				// console.log('ModalDataModel clicked cancel');
			});
		};
		
		$scope.lastDataModelFields = [];
		
		$scope.$parent.openModalField = function(fieldType, idx, size) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'fieldSelection.html',
				controller: 'fieldSelectionModal',
				size: size,
				resolve: {
					multiSelectable: function() {
						if(fieldType == "DIM1SELECT")
							return true;
						else
							return false;
					},
					forModal: function() {
						return true;
					},
					existingSelection: function() {
						var selectedFields = [];
						var dataModelId = "";
						var chartObj = $scope.$parent.widgetCreationObj.chart;
						var extraConfigFields = chartObj.config.extraConfigFields;
						var extraConfigDimensions = chartObj.config.extraConfigDimensions;
						
						if(fieldType=='DIM'){
							dataModelId = extraConfigDimensions[0].dataModelId;
							
							selectedFields.push($scope.$parent.widgetCreationObj.chart.config.dimension[0]);
						}else if(fieldType=='MSR1'){
							dataModelId = extraConfigFields[0].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.config.measure[0].dataModelFieldId;
							selectedFields.push(selectField);
						}else if(fieldType=='MSR2'){
							dataModelId = extraConfigFields[1].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId;
							selectedFields.push(selectField);
						}else if(fieldType=='MSR3'){
							dataModelId = extraConfigFields[2].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.facetMergeConfig[2].fields[0].fieldId;
							selectedFields.push(selectField);
						}else if(fieldType=='MSR4'){
							dataModelId = extraConfigFields[3].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.facetMergeConfig[3].fields[0].fieldId;
							selectedFields.push(selectField);
						}else if(fieldType=='MSR5'){
							dataModelId = extraConfigFields[4].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.facetMergeConfig[4].fields[0].fieldId;
							selectedFields.push(selectField);
						}else if(fieldType=='MSR6'){
							dataModelId = extraConfigFields[5].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.facetMergeConfig[5].fields[0].fieldId;
							selectedFields.push(selectField);
						}else if(fieldType=='MSR7'){
							dataModelId = extraConfigFields[6].dataModelId;
							
							var selectField = {};
							selectField.dataModelFieldId = $scope.$parent.widgetCreationObj.chart.facetMergeConfig[6].fields[0].fieldId;
							selectedFields.push(selectField);
						}

						var selectedInfo = null;
						if(selectedFields.length > 0 && selectedFields[0].dataModelFieldId != null && selectedFields[0].dataModelFieldId != ''){

							selectedInfo = {};
							selectedInfo.dmId = dataModelId;
							selectedInfo.selectedFields = selectedFields;
						}

						return selectedInfo;
					},
					fields: function() {
						var defer = $q.defer();

						var chartObj = $scope.$parent.widgetCreationObj.chart;
						var extraConfigFields = chartObj.config.extraConfigFields;
						var extraConfigDimensions = chartObj.config.extraConfigDimensions;
						
						var dataModelId = "";
						var dataModelName = "";
						if(fieldType=='DIM'){
							dataModelId = extraConfigDimensions[0].dataModelId;
							dataModelName = extraConfigDimensions[0].dataModelName;
						}else if(fieldType=='MSR1'){
							dataModelId = extraConfigFields[0].dataModelId;
							dataModelName = extraConfigFields[0].dataModelName;
						}else if(fieldType=='MSR2'){
							dataModelId = extraConfigFields[1].dataModelId;
							dataModelName = extraConfigFields[1].dataModelName;
						}else if(fieldType=='MSR3'){
							dataModelId = extraConfigFields[2].dataModelId;
							dataModelName = extraConfigFields[2].dataModelName;
						}else if(fieldType=='MSR4'){
							dataModelId = extraConfigFields[3].dataModelId;
							dataModelName = extraConfigFields[3].dataModelName;
						}else if(fieldType=='MSR5'){
							dataModelId = extraConfigFields[4].dataModelId;
							dataModelName = extraConfigFields[4].dataModelName;
						}else if(fieldType=='MSR6'){
							dataModelId = extraConfigFields[5].dataModelId;
							dataModelName = extraConfigFields[5].dataModelName;
						}else if(fieldType=='MSR7'){
							dataModelId = extraConfigFields[6].dataModelId;
							dataModelName = extraConfigFields[6].dataModelName;
						}
						
						$scope.lastDataModelFields = [];
						
						PDService.getData("getDataModelFields", true , "get", { dataModelId: dataModelId }).then(function(data){
							var fields = data;
							
							if(fieldType=='DIM' || fieldType=='HRCY')
								fields = $filter('dimensionFieldFilter')(fields);
							else if(fieldType=='MSR1' || fieldType=='MSR2' || fieldType=='MSR3' || fieldType=='MSR4' || fieldType=='MSR5' || fieldType=='MSR6' || fieldType=='MSR7')
								fields = $filter('numericFilter')(fields);
							
							var fieldInfo = {};
							fieldInfo.dmId = dataModelId;
							fieldInfo.dmName = dataModelName;
							fieldInfo.fields = fields;
							
							var fieldInfoList = [];
							fieldInfoList.push(fieldInfo);
							
							$scope.lastDataModelFields = angular.copy(fields);
							
							defer.resolve(fieldInfoList);
						});
						
						return defer.promise;
					}
				}
			});

			modalInstance.result.then(function(data) {
				if (data.fields.length > 0) {

					var $parentSelectDamaModelBasedFieldList = angular.copy($scope.$parent.selectDamaModelBasedFieldList);
					$scope.$parent.changeSelectDamaModelBasedFieldList($scope.lastDataModelFields);

					if(fieldType=='DIM'){
						
						$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelFieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.setDimensionField(data.fields[0].dataModelFieldId, 0);
						$scope.$parent.dimFieldName[0] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);

						// FRMフィールド存在確認
						if($scope.$parent.data.pageDataModelId != $scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelId){
							$scope.isFrmField( $scope.$parent.data.pageDataModelId,
												$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelId,
												$scope.$parent.widgetCreationObj.chart.config.dimension[0].dataModelFieldId,
												$scope.$parent.dimFieldName[0],
												1 );
						}

					}else if(fieldType=='MSR1'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[0].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[0] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 0);
					}else if(fieldType=='MSR2'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[1] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 1);
					}else if(fieldType=='MSR3'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[2].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[2] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 2);
					}else if(fieldType=='MSR4'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[3].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[3] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 3);
					}else if(fieldType=='MSR5'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[4].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[4] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 4);
					}else if(fieldType=='MSR6'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[5].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[5] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 5);
					}else if(fieldType=='MSR7'){

						$scope.$parent.widgetCreationObj.chart.facetMergeConfig[6].fields[0].fieldId = data.fields[0].dataModelFieldId;
						$scope.$parent.msrFieldName[6] = PDService.getFieldDisplayName($scope.$parent.selectDamaModelBasedFieldList, data.fields[0].dataModelFieldId);
						$scope.$parent.changeMuitiFieldFacetMergeFieldId(data.fields[0].dataModelFieldId, 6);
					}
					
					$scope.$parent.changeSelectDamaModelBasedFieldList($parentSelectDamaModelBasedFieldList);
				}
			}, function() {
				console.log('clicked cancel');
			});
		};
		// Field Selector追加対応

		// Auto resize text-area
		$timeout(function(){
			var textareaNodes = $("textarea");
			for (var i = 0; i < textareaNodes.length; i++) {
				var node = textareaNodes[i];
				var lines = node.value.match(/\r\n|\r|\n/g);
				var rows = lines == null ? 1 : lines.length + 1;
				if (1 < rows) {
					node.style.height = "inherit";
					node.setAttribute("rows", rows);
				} else {
					node.style.height = "30px";
				}
			}
		});

		// error initialize
		$scope.$parent.initialError = function(idx){
		};
		
// 管理線の制御（ここまで）
}]);