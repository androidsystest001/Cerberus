angular.module('sic.controllers')
.controller("widgetCreationCtrl", ["$scope", "$http", "PromiseAjax", "DashboardCreation", "$routeParams", '$rootScope', "$modal", "PDService", 'WidgetService', 'UtilService', "$location", "PageJson", "$translate", 'urlLookup', '$compile',
									function($scope, $http, PromiseAjax, DashboardCreation, $routeParams, $rootScope, $modal, PDService, WidgetService, UtilService, $location, PageJson, $translate, urlLookup, $compile) {


	var swithctoedg = "";
	$translate("edg.confirmmsg").then(function(data) { 	swithctoedg = data; });
	$translate("oopssomethingwentwrong").then(function(data) { oopssomethingwentwrongMsg = data; });

	// データモデル選択リストの修正
	var rootFolderName = "";
	$translate("dataStudio.rootFolderName").then(function(data) { rootFolderName = data; });
	// データモデル選択リストの修正

	// FRMフィールド存在確認
	var nofrmWarninMsg_tmp;
	$translate("charts.dimension_no_frm_warning").then(function(data) { nofrmWarninMsg_tmp = data; });
	// FRMフィールド存在確認

	// 管理線を設定できるWidget
	var hasControlLineWidgets = [
		'MultiFieldLineChart',
		'MultiFieldLinewithInfoChart',
		'SampleLineChart',
		'ScatterPlot',
		'ScatterPlotWithPlot',
		'ScatterEllipseChart',
		'SingleLineChart',
		'TimeSeries',
		'GaussianChart',
		'BubbleChart'		//2019.06.05 ADD HUY-DHK
	];
	// 管理線を設定できるWidget

	$scope.showDescription = false;
	$scope.showHighlightConfig = false;
	$scope.showHierarchy = false;
	$scope.showDataChain = false;
	$scope.showRealTime = false;
	$scope.selectedDataChainModel = "";
	$scope.selectedDataChainPageId = "";
	$scope.isEditCase = false;
	$scope.isNewWidget = true;
	$scope.showAddDMBtn = true;
	$scope.isSearchIndexDataModelForWidget = false;

	/* defined in app file */
	$scope.countMap = CountMap;
	// This count map has been explicitly added for time series widget handling
	$scope.timeSeriesCountMap = angular.copy(CountMap);

	$scope.timeSeriesMonthCountMap = angular.copy(CountMap_MONTH);
	$scope.timeSeriesDayCountMap = angular.copy(CountMap_DAY);
	$scope.timeSeriesHourCountMap = angular.copy(CountMap_HOUR);
	$scope.timeSeriesMinuteCountMap = angular.copy(CountMap_MINUTE);
	$scope.timeSeriesSecondCountMap = angular.copy(CountMap_SECOND);

	$scope.sortMap = SortMap;
	$scope.primarySortMap = [];
	$scope.secondartSortMap = [];
	$scope.refreshIntervalMap = refreshIntervalMap;
	$scope.operatorMap = operatorMap;
	// TableForSS
	$scope.roundMap = UtilService.getRoundMap();

	$scope.refreshInterval = "";
	$scope.dimensionSort = ["", ""];
	$scope.primaryDataModelAggFunc = {};
	$scope.primaryDataModelField  = [];
	$scope.secondaryDataModelAggFunc = {};
	$scope.secondaryDataModelField  = [];
	$scope.secondaryDataModelId = "";
	// Field Selector追加対応
	$scope.secondaryDataModelName = "";
	$scope.secondaryFacetMerge = {};
	$scope.mergedAggFunc = {};
	
	// validation flags
	//2019.07.05 ADD START HAU-TV
	//AbcChart
	$scope.RankAMinMaxError = "";
	$scope.RankBMinMaxError = "";
	//2019.07.05 ADD END
	
	$scope.titleError = "";
	$scope.descriptionError = "";
	$scope.dimFldError = "";
	$scope.dimCountError = "";
	$scope.drawLineDirectionError = [];
	$scope.drawLineWidthError = []
	$scope.drawLineFirstXError = [];
	$scope.drawLineFirstYError = [];
	$scope.drawLineTypeError = [];
	$scope.dimSortError = "";
	$scope.DimFldNameError = "";
	$scope.textAreaError= "";
	$scope.colDimFldError= "";
	$scope.colDimCountError= "";
	$scope.colDimSortError= "";
	$scope.colDimFldNameError= "";
	$scope.refreshIntervalError = "";
	$scope.dataChainError = "";
	$scope.dimensionHierarchyIdError = "";
	$scope.dimensionHierarchyNameError = "";
	$scope.dimensionHierarchyDupError = "";
	$scope.seriesDispSort = "";
	$scope.dsrError = {};
	$scope.showDSRError = false;
	$scope.biningerrnospace = "";
	$scope.biningerrnomunber = "";
	$scope.biningerrmaxmin = "";
	$scope.biningerrsamevalue = "";
	$scope.biningerrtoolonglabel = "";
	$scope.biningerrduplicatelabel = "";
	$scope.biningErrListStart = [];
	$scope.biningErrListEnd = [];
	$scope.biningErrListName = [];
	// Scatter
	$scope.xDimFldReqError = "";
	$scope.yDimFldReqError = "";
	$scope.bgpictureError = "";
	$scope.seriesFldReqError = "";
	$scope.seriesFldCountError = "";
	$scope.seriesMaxElementsReqError = "";
	$scope.tooltipReqError = "";
	$scope.duplicateTooltipFldError = "";

	//2019.06.05 ADD START HUY-DHK
	// VN:Filed zDimension check error for required input
	$scope.zDimFldReqError = "";
	//2019.06.05 ADD END

//	$scope.linesCoordinateError = "";
//	$scope.linesCoordinateDateFormatError = "";
	// Scatter
	
	/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
	$scope.facetMergeConfig_FunctionError = [];
	$scope.facetMergeConfig_FldError = [];
	$scope.facetMergeConfig_HtmlTagsError = [];
	$scope.facetMergeConfig_LineTypeError = [];
	$scope.facetMergeConfig_YAxisError = [];
	$scope.facetMergeConfig_AverageNumberDigitsError = [];
	
	$scope.yAsisSettingConfig_HtmlTagsError = [];
	$scope.yAsisSettingConfig_MinError = [];
	$scope.yAsisSettingConfig_MaxError = [];
	
	/* 2019.06.05 ADD END  */
	
	/* 2019.06.05 ADD START KIEN-DX TripleDataModelChart Widgetの追加  */
	$scope.dimension_dataModelSelectionError = [];
	$scope.facetMergeConfig_dataModelSelectionError = [];
	/* 2019.06.05 ADD END  */
	
	//samplelinechart
	$scope.measure_FunctionError = [];
	$scope.measure_FldError = [];
	$scope.htmlTags_InXFldNameError = [];
	$scope.measure_lineparamError = [];
	//samplelinechart
	$scope.htmlTagsInFldNameError = false;
	$scope.htmlTagsInWdgtNameError = false;
	$scope.htmlTagsInWdgtDescError = false;
	$scope.htmlTagsInMinValueError = false;
	$scope.htmlTagsInMaxValueError = false;
	$scope.htmlTagsInXFldNameError = false;
	$scope.htmlTagsInHierarchyFldNameError = false;
	$scope.htmlTagsInColDimFldNameError = false;
	$scope.htmlTagsInSecondYFldNameError = false;
	var param = { "pageId": $routeParams.pid };
	// Text Navigator Widgetの追加
	$scope.dimLstFldError = [];
	$scope.dimLstCountError = [];
	$scope.dimLstFldNameError = [];
	$scope.dimLstHtmlTagsInFldNameError = [];
	$scope.dimNoFrmMsgMap = {};
	// Text Navigator Widgetの追加

	// Field Selector追加対応
	$scope.dimFieldName = ["----", "----", "----"];
	$scope.msrFieldName = ["----", "----"];
	$scope.hrcyFieldName = ["----", "----"];
	$scope.dsrFieldName = ["----", "----", "----", "----", "----", "----", "----", "----", "----", "----"];
	$scope.tltpFieldName = ["----"];
	$scope.fctFieldName = ["----", "----"];
	// Field Selector追加対応

	$scope.fasetMeargeByMeasureSortError = "";
	$scope.colFasetMeargeByMeasureSortError = "";

	// WeibullChart
	$scope.constantValueReqError = false;
	$scope.constantValueNumError = false;
	// WeibullChart
	// GaussianChart
	$scope.constantValue2ReqError = false;
	$scope.constantValue2NumError = false;
	$scope.constantValue3UpperReqError = false;
	$scope.constantValue3LowerReqError = false;
	$scope.constantValue3NumError = false;
	$scope.constantValue3UpperNumError = false;
	$scope.constantValue3LowerNumError = false;
	// GaussianChart
	// TableForSS
	$scope.measureDispValError = "";
	$scope.htmlTagsInMesureNameError = "";
	// TableForSS
	// HeatMapWithImage
	$scope.yAxisMinReqError = false;
	$scope.yAxisMaxReqError = false;
	$scope.xAxisMinReqError = false;
	$scope.xAxisMaxReqError = false;
	$scope.yAxisMinNumError = false;
	$scope.yAxisMaxNumError = false;
	$scope.xAxisMinNumError = false;
	$scope.xAxisMaxNumError = false;
	// HeatMapWithImage

	// FRMフィールド存在確認
	$scope.dimNofrmWarning = false;
	$scope.secondDimNofrmWarning = false;
	$scope.dimNoFrmMsg ="";
	$scope.secondDimNoFrmMsg ="";

	//2019.06.05 ADD START HUY-DHK
	// VN:	Warning Z axis for BubbleChart
	$scope.thirdDimNofrmWarning = false;
	$scope.thirdDimNoFrmMsg = "";
	//2019.06.05 ADD END

	// FRMフィールド存在確認

	// パフォーマンス改善対応
	$scope.gridsterOptsForPreview = {
//			columns: 12,
			columns: 4,
			resizable: { enabled: false },
			draggable: { enabled: false },
			swapping: true,
			margins: [WIDGET_GAP, WIDGET_GAP],
			mobileBreakPoint: 767,
			mobileModeEnabled: false,
			minColumns: 0, // the minimum amount of columns the grid can scale down to
			minRows: 0, // the minimum amount of rows to show if the grid is empty
			minSizeY: 2,
			minSizeX: 2,
			defaultSizeX: 4, // the default width of a item
			defaultSizeY: 4 // the default height of a item
		};
	// パフォーマンス改善対応

	// データモデル選択リストの修正
    $scope.currentFolderId = '/';
    var DS_CONTEXT_PATH = "/" + CONTEXT_PATH.split("/")[1];

    PromiseAjax.getData(DS_CONTEXT_PATH + "/datastudio/loadAllDataModelList", "get").then(function(data) {
		$scope.dmViewList = data;
	});

    var compareValues = function(key, order) {
		  return function(a, b) {
		    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
		      // property doesn't exist on either object
		        return 0;
		    }

		    const varA = (typeof a[key] === 'string') ?
		      a[key].toUpperCase() : a[key];
		    const varB = (typeof b[key] === 'string') ?
		      b[key].toUpperCase() : b[key];

		    let comparison = 0;
		    if (varA > varB) {
		      comparison = 1;
		    } else if (varA < varB) {
		      comparison = -1;
		    }
		    return (
		      (order == 'desc') ? (comparison * -1) : comparison
		    );
		};
	};

    PromiseAjax.getData(DS_CONTEXT_PATH + "/datastudio/getAllDataModelFolderList", "post").then(function(data) {
		responseMap = data;

		$scope.dmFolderList = responseMap.folderList;
		$scope.dmFolderList.sort(compareValues('folderName', 'asc'));
	});
    // データモデル選択リストの修正

	$scope.editMode = false;
	if ($routeParams.wid) {
		param["widgetId"] = $routeParams.wid;
		$scope.editMode = true;
	}

	$scope.previousScreen = localSessionStorage.getPreviousScreen();

	PDService.getData("getWidgetCreationInfo", true , "get", param).then(function(data){
	// PromiseAjax.getData(CONTEXT_PATH + "PageDesigner/getWidgetCreationInfo", "get", param).then(function(data) {
		$scope.data		= data;
		$scope.minLimit	= Math.floor($scope.data.dataModelDetailList.length/2);

		if (_.keys(data).length == 0 || $scope.data.aggrFunctions == null) {
			$scope.data.aggrFunctions = {};
		}

		$scope.data.aggrFunctions["count"]	= "Count";
		$scope.primaryDataModelAggFunc		= angular.copy($scope.data.aggrFunctions);
		$scope.secondaryDataModelAggFunc	= angular.copy($scope.data.aggrFunctions);
		$scope.sortMap						= angular.copy(util.replaceSortValue($scope.data.SortMap));
		$scope.primarySortMap				= angular.copy($scope.sortMap);
		$scope.secondaryDataModelId			= data.widgetDataModelId;

		var index = _.findIndex(data.dataModelDetailList, {'dataModelId': data.widgetDataModelId});

		$scope.widgetDataModel = angular.copy(data.dataModelDetailList[index]);

		// Field Selector追加対応
		$scope.secondaryDataModelName = $scope.widgetDataModel.dataModelName;

		$scope.widgetDataModel.hasMugenStorage = data.hasMugenStorage;

		$scope.widgetDataModel.snapshotDataModelId = data.snapshotDataModelId;


		if ($scope.widgetDataModel.isSearchIndexDataModel) {
			$scope.isSearchIndexDataModelForWidget = true;
		}

		$scope.widgetCreationObj = {
			dmObjList : [$scope.widgetDataModel],
			chart : {
				dataModelId	: $scope.widgetDataModel.dataModelId,
				widgetDefId	: "",
				config		: {
					dimension		: [],
					measure			: [],
					dimensionSort	: [],
					navigatorFields : [],
					seriesSort		: [],
					// Binning
					frmBiningInfo	: [{
						divides	: []
					}]
					// Binning
				},
				dimensionHierarchy	: {"0" : []},
				widgetFilters		: {}
			}
		};

		/*PromiseAjax.getData(CONTEXT_PATH+"PageDesigner/getDataModelFields", "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data) {
			if (data.status == "OK") {
			} else {
				console.log("data");
			}*/

		// -- フィールド数が多い場合の考慮 --
//		PDService.getData("getDataModelFields", true , "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data){
//			$scope.selectDamaModelBasedFieldList = data;
//			$scope.primaryDataModelField		= angular.copy(data);
//			$scope.secondaryDataModelField		= angular.copy(data);
//		});
		if(data.dataModelFieldList){
			$scope.selectDamaModelBasedFieldList = data.dataModelFieldList;
			$scope.primaryDataModelField = angular.copy(data.dataModelFieldList);
			$scope.secondaryDataModelField = angular.copy(data.dataModelFieldList);
		}
		// -- フィールド数が多い場合の考慮 --

		if (!$scope.pageInfo) {
			/*PromiseAjax.getData(CONTEXT_PATH + "PageDesigner/getPageBasicInformartion", "get", { "pageID" : $routeParams.pid+"", 'foobar': new Date().getTime() }).then(function(data) {
				if (data.status == "OK") {
				}*/
			PDService.getData("getPageBasicInformartion", true , "get", { "pageID" : $routeParams.pid+"", 'foobar': new Date().getTime() }).then(function(data){
				$scope.pageInfo = data;
			});
		}
		if (!$scope.dataChainPageList) {
			/*PromiseAjax.getData(CONTEXT_PATH + "PageDesigner/getDataChainPageList", "get", {"pageId" :$routeParams.pid }).then(function(data) {
				if (data.status == "OK") {
				}*/
			PDService.getData("getDataChainPageList", true , "get", {"pageId" :$routeParams.pid }).then(function(data){
//				$scope.dataChainPageList = data;
				// ダッシュボードリストをソート
				$scope.dataChainPageList = util.sortDashboardList(data);
			});
		}

		if (typeof $routeParams.wid != "undefined") {
			var widgetDefId = $scope.data.widgetInfo.widgetDefId;
			var widgetDefName = $scope.data.widgetInfo.widgetDefName;
			$scope.editChartTemplate(widgetDefId, widgetDefName);
			var idx = _.findIndex($scope.data.widgetList, {'defId' : widgetDefId});
			var selecteWidgetObj = $scope.data.widgetList[idx];
			$scope.showAddDMBtn = (selecteWidgetObj.isMultiDataModelSupport == "false") ? false : true;

			for(var i in $scope.data.widgetList) {
				if ($scope.data.widgetList[i].dimensions == selecteWidgetObj.dimensions
						&& $scope.data.widgetList[i].measures == selecteWidgetObj.measures
						&& $scope.data.widgetList[i].isMultiDataModelSupport == selecteWidgetObj.isMultiDataModelSupport) {
					$scope.data.widgetList[i].recommendedId = 'recommend';
				}
			}
			$scope.data.widgetList;
			$scope.isEditCase = true;
			$scope.isNewWidget = false;
		}

		if($scope.data.widgetInfo != undefined && $scope.data.widgetInfo.widgetDefId != undefined && $scope.data.widgetInfo.widgetDefId == "TimeSeries"){
			$scope.getScaleFields($scope.data.widgetInfo.widgetConfig.dimension[0].dataModelFieldId, true);
		}
	});

	// add more data model at page level
	$scope.addDataModel = function(dm) {

		// データモデル選択リストの修正

		// フィールドリストの表示用にフィールド情報を取得して、タイプ毎にグルーピングする
		PDService.getData("getDataModelFields", true , "get", { dataModelId: dm.dataModelId }).then(function(data){
			var fList = data;
			$scope.selectedGrpFldsMap = _.groupBy(fList, 'fieldDataType');
		});

		$scope.selectedDMInPopover = angular.copy(dm);

		// フォルダ表示用にフォルダパスをリストに成型する
		var folderAry = [];
    	if($scope.selectedDMInPopover.folderId == '/'){

    		folderAry[0] = rootFolderName;
    	}else{

    		folderAry = $scope.selectedDMInPopover.folderPath.split('/');
    		folderAry[0] = rootFolderName;
    	}
    	$scope.selectedDMInPopover.folderPathAry = folderAry;
    	// データモデル選択リストの修正
	};

	$scope.confirmEdg = function(dmid) {
		var modalInstance = $modal.open({
			animation: false,
			templateUrl: 'alertModalContent.html',
			controller: 'ModalEDGConfirmationInstanceCtrl',
			size: 'sm',
			resolve: {
				pageInfo: function () {
					return swithctoedg;
				},
				dmid	: function() {
					return dmid;
				}
			}
		});
	};

	$scope.setSecondaryFacetMerge = function(val) {
		$scope.secondaryFacetMerge.aggFunction = val.aggFunction;
		$scope.secondaryFacetMerge.dataModelFieldId = val.dataModelFieldId;
		$scope.secondaryFacetMerge.dataModelFieldDispVal = val.dataModelFieldDispVal;
	};

	_.mixin({
		'findByValues': function(collection, property, values) {
			return _.filter(collection, function(item) {
			return _.contains(values, item[property]);
			});
		}
	});

	var getInitialFacetMergeMeasureConfig = function(){

		var facetMergeMeasureConfig = {};
		facetMergeMeasureConfig.fields = [];
		for (var i = 0; i < 2; i++) {
			if (i ==0) {
				facetMergeMeasureConfig.fields.push({
					"dataModelId"	: 	"",
					"fieldId"		: 	"",
					"aggFunction"	: 	"count",
					"operator"		: 	"none",
					"value"			: 	""
				});
			} else {
				facetMergeMeasureConfig.fields.push({
					"dataModelId"	: 	"",
					"fieldId"		: 	"",
					"aggFunction"	: 	"",
					"operator"		: 	"none",
					"value"			: 	""
				});
			}
		}
		facetMergeMeasureConfig.expression = "";
		facetMergeMeasureConfig.display = "Count";

		return facetMergeMeasureConfig;
	};

	var resetAllSettings = function() {
		//resetting dimensions and related fields
		var dimensionLength = $scope.widgetCreationObj.chart.config.dimension.length;
		for(var i = 0; i < dimensionLength; i++) {
			$scope.widgetCreationObj.chart.config.dimension[i].dataModelFieldId	= null;
			$scope.widgetCreationObj.chart.config.dimension[i].dataModelDispVal =  null;
			$scope.widgetCreationObj.chart.config.dimension[i].fieldDefaultAction = "drilldown";
			$scope.widgetCreationObj.chart.config.dimension[i].count = "";
			$scope.widgetCreationObj.chart.config.dimension[i].targetPage =	"";
			$scope.widgetCreationObj.chart.config.dimension[i].targetDMId = "";
			$scope.widgetCreationObj.chart.config.dimension[i].dataType =  null;

			//2019.06.05 UPD START HUY-DHK
			//if($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart" || $scope.widgetCreationObj.chart.widgetDefId == "WeibullChart" || $scope.widgetCreationObj.chart.widgetDefId == "GaussianChart") {
	  
			if($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart" || $scope.widgetCreationObj.chart.widgetDefId == "WeibullChart" || $scope.widgetCreationObj.chart.widgetDefId == "GaussianChart" || $scope.widgetCreationObj.chart.widgetDefId == "BubbleChart") {
			//2019.06.05 UPD END
			
				if(i<2) $scope.widgetCreationObj.chart.config.dimension[i].count = 5; // this is dummy. it is not used on Scatter (3番目-系列は使用しているので設定しない)
			}
			// HeatMapWithImage
			if($scope.widgetCreationObj.chart.widgetDefId == "HeatMapWithImage") {
				// HeatMapWithImageの場合は、dimension.count、および、dimensionSortは定数
				$scope.widgetCreationObj.chart.config.dimension[i].count = "-1";

				$scope.widgetCreationObj.chart.config.dimensionSort[i].sortFieldId = null;
				$scope.widgetCreationObj.chart.config.dimensionSort[i].sortBy = "alphabetical";
				$scope.widgetCreationObj.chart.config.dimensionSort[i].sortOrder = "asc";
			}
			// HeatMapWithImage

			$scope.dimensionSort[i] = "";
			// Field Selector追加対応
			$scope.dimFieldName[i] = "----";
		}

		// EAGLE-2123 散布図にはディメンジョンのソートがない
		if(typeof $scope.widgetCreationObj.chart.config.dimensionSort != "undefined") {
			var dimensionSortLength = $scope.widgetCreationObj.chart.config.dimensionSort.length;
			for(var i = 0; i < dimensionSortLength; i++) {
				$scope.widgetCreationObj.chart.config.dimensionSort[i].sortFieldId = null;
				$scope.widgetCreationObj.chart.config.dimensionSort[i].sortBy = null;
				$scope.widgetCreationObj.chart.config.dimensionSort[i].sortOrder = null;
			}
		}


		if(typeof $scope.widgetCreationObj.chart.config.tooltip != "undefined") {
			var tooltipLength = $scope.widgetCreationObj.chart.config.tooltip.length;
			for(var i = 0; i < tooltipLength; i++) {
				$scope.widgetCreationObj.chart.config.tooltip[i].dataModelFieldId = null;
			}
		}
		var measureLenth = $scope.widgetCreationObj.chart.config.measure.length;

		for(var i = 0; i < measureLenth; i++) {
			$scope.widgetCreationObj.chart.config.measure[i].dataModelFieldId = "-1";
			$scope.widgetCreationObj.chart.config.measure[i].dataModelFieldDispVal ="Count";
			$scope.widgetCreationObj.chart.config.measure[i].aggFunction = "count";
			// Field Selector追加対応
			$scope.msrFieldName[i] = "----";
		}

		$scope.widgetCreationObj.chart.dimensionHierarchy = {"0" : []};

		for(var i = 0; i < 2; i++) {
			$scope.widgetCreationObj.chart.dimensionHierarchy['0'].push({
				"dataModelFieldId": null,
				"dataModelDispVal": null,
				"fieldDefaultAction": "drilldown",
				'targetDMId'		: "",
				"count": null,
				"targetPage": "",
				"dataType": null
			});
			// Field Selector追加対応
			$scope.hrcyFieldName[i] = "----";
		}

		$scope.toggleHierarchy(false);
		$scope.selectDataChainPage("");
		$scope.toggleDataChain(false);

		//暫定対応
		if($scope.widgetCreationObj.chart.widgetDefId == 'CrossJoinedDonutChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'CrossJoinedHorizontalGroupedBarChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'CrossJoinedHorizontalStackedBarChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'CrossJoinedVerticalGroupedBarChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'CrossJoinedVerticalStackedBarChart')
		{
			$scope.widgetCreationObj.chart.showOthers = false;
		}
		// Field Selector追加対応
		if($scope.widgetCreationObj.chart.widgetDefId == 'DocumentSearchResult')
			$scope.dsrFieldName = ["----", "----", "----", "----", "----", "----", "----", "----", "----", "----"];

		if($scope.widgetCreationObj.chart.widgetDefId == 'VerticalGroupedMultiMeasureChart'){

			$scope.widgetCreationObj.chart.facetMergeConfig = [];

			for(var i=0; i< 2; i++) {

				var facetMergeMeasureConfig = getInitialFacetMergeMeasureConfig();
				$scope.widgetCreationObj.chart.facetMergeConfig.push(facetMergeMeasureConfig);
				// Field Selector追加対応
				$scope.msrFieldName[i] = "----";
				$scope.fctFieldName[i] = "----";
				// Field Selector追加対応
			}
		}
		// Text Navigator Widgetの追加
		if($scope.widgetCreationObj.chart.widgetDefId == 'TextNavigator' || $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalTextNavigator' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'MultiListNavigator' || $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalMultiListNavigator'){
			$scope.widgetCreationObj.chart.config.dimension.splice(0, dimensionLength - 1);
			delete $scope.widgetCreationObj.chart.config.dimension[0].showOther;
			delete $scope.widgetCreationObj.chart.config.dimension[0].notShowMeasure;
			$scope.dimFieldName.splice(0, dimensionLength - 1);

			$scope.widgetCreationObj.chart.config.dimensionSort.splice(0, dimensionSortLength - 1);
			$scope.dimensionSort.splice(0, dimensionSortLength - 1);

			$scope.widgetCreationObj.chart.config.measure.splice(0, measureLenth - 1);
			$scope.msrFieldName.splice(0, measureLenth - 1);
		}
		// Text Navigator Widgetの追加
		
		/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
		if ($scope.widgetCreationObj.chart.widgetDefId == 'ResultAndRateChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'MovingAverageChart') {
			var facetMergeConf = $scope.widgetCreationObj.chart.facetMergeConfig;

			for (var i = 0; i < facetMergeConf.length; i++) {
				// Field Selector追加対応
				facetMergeConf[i].fields[0].fieldId = "";
				$scope.msrFieldName[i] = "----";
				// Field Selector追加対応
			}
		}
		/* 2019.06.05 ADD END  */
		
		/* 2019.06.05 ADD START KIEN-DX TripleDataModelChart Widgetの追加  */
		if ($scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart') {
			var facetMergeConf = $scope.widgetCreationObj.chart.facetMergeConfig;

			for (var i = 0; i < facetMergeConf.length; i++) {
				// Field Selector追加対応
				facetMergeConf[i].fields[0].fieldId = "";
				$scope.msrFieldName[i] = "----";
				// Field Selector追加対応
			}
		}
		/* 2019.06.05 ADD END  */
	};

	$scope.primaryDataModelChange = function(dm, isEditCase) {
		$scope.widgetDataModel.dataModelId = dm.dataModelId;
		$scope.widgetDataModel.dataModelName = dm.dataModelName;
		$scope.widgetCreationObj.chart.dataModelId = dm.dataModelId;

		if ($scope.showRealTime && $scope.widgetCreationObj.chart.widgetDefId == 'TimeSeries') {
			$scope.widgetCreationObj.chart.config.dimension.splice(1, 1);
			$scope.widgetCreationObj.chart.config.dimensionSort.splice(1, 1);
			delete $scope.widgetCreationObj.chart.series;
		}

/*		PromiseAjax.getData(CONTEXT_PATH+"PageDesigner/getDataModelFields", "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data) {
			if (data.status == "OK") {
			} else {
				console.log(data);
			}*/
		PDService.getData("getDataModelFields", true , "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data){
			$scope.primaryDataModelField = data;
			if ($scope.widgetCreationObj.dmObjList.length == 1) {
				$scope.selectDamaModelBasedFieldList = data;
				$scope.secondaryDataModelField = data;
			} else {
				var send_Data = {
					sourceDMId: $scope.widgetCreationObj.dmObjList[0].dataModelId,
					targetDMId: $scope.widgetCreationObj.dmObjList[1].dataModelId
				};
				PDService.getData("getFRMFields", true, "get", send_Data).then(function(data) {
					var frmFieldList = data;
					$scope.selectDamaModelBasedFieldList = _.findByValues($scope.primaryDataModelField, "dataModelFieldId", frmFieldList);
				});
				$scope.allDataModelFields = $scope.primaryDataModelField.map(function(obj) {
					obj.selectId = $scope.widgetCreationObj.dmObjList[0].dataModelId + ":" + obj.dataModelFieldId;
					obj.dataModelName = $scope.widgetCreationObj.dmObjList[0].dataModelName;
					return obj;
				});
				$scope.allDataModelFields = $scope.allDataModelFields.concat($scope.secondaryDataModelField.map(function(obj) {
					obj.selectId = $scope.widgetCreationObj.dmObjList[1].dataModelId + ":" + obj.dataModelFieldId;
					obj.dataModelName = $scope.widgetCreationObj.dmObjList[1].dataModelName;
					return obj;
				}));

//				console.log($scope.allDataModelFields);
			}

			// PromiseAjax.getData(CONTEXT_PATH+"PageDesigner/getSortFunction", "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data) {
			PDService.getData("getSortFunction", true , "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data){
				$scope.primarySortMap = angular.copy(util.replaceSortValue(data));
				if (isEditCase) {
					$scope.secondaryDataModelChange($scope.widgetCreationObj.dmObjList[1]);
				} else {
					if ($scope.widgetCreationObj.dmObjList.length == 1) {
						$scope.sortMap = angular.copy($scope.primarySortMap);
					} else {
						var inter = [];
						for(var i in $scope.primarySortMap){
							if (_.findIndex($scope.secondartSortMap, $scope.primarySortMap[i]) > -1) {
								inter.push($scope.primarySortMap[i]);
							}
						}
						$scope.sortMap = inter;
					}
				}
			});
		});

		PDService.getData("getAggFunction", true , "get", { dataModelId: $scope.widgetDataModel.dataModelId }).then(function(data){
			$scope.data.aggrFunctions = data;
			if (_.keys(data).length == 0){
				$scope.data.aggrFunctions = {};
			}
			$scope.data.aggrFunctions["count"] = "Count";
			$scope.primaryDataModelAggFunc = angular.copy($scope.data.aggrFunctions);
			if ($scope.widgetCreationObj.chart.widgetDefId == 'VerticalGroupedMultiMeasureChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'MultiMeasureLineChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalGroupedMultiMeasureChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'StackedGroupBarChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 	'MultiFieldLineChart') {
				if ($scope.widgetCreationObj.dmObjList.length == 1) {
					$scope.removeConstantAggFun();
				} else {
					$scope.addConstantAggFunc();
				}
			}
			if ($scope.widgetCreationObj.dmObjList.length == 1) {
				$scope.secondaryDataModelId = dm.dataModelId;
				$scope.secondaryDataModelAggFunc = angular.copy($scope.data.aggrFunctions);
				// Field Selector追加対応
				$scope.secondaryDataModelName = dm.dataModelName;

			} else {
				$scope.mergedAggFunc = {};
				_.merge($scope.mergedAggFunc, $scope.primaryDataModelAggFunc, $scope.secondaryDataModelAggFunc);
				delete $scope.mergedAggFunc["count"];
				$scope.mergedAggFunc["count:"+$scope.widgetCreationObj.dmObjList[0].dataModelId] = "Count(" + $scope.widgetCreationObj.dmObjList[0].dataModelName + ")";
				$scope.mergedAggFunc["count:"+$scope.widgetCreationObj.dmObjList[1].dataModelId] = "Count(" + $scope.widgetCreationObj.dmObjList[1].dataModelName + ")";

				if (!(_.has($scope.mergedAggFunc, $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction))) {
					$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction = "";
				}

				if (!(_.has($scope.mergedAggFunc, $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction))) {
					$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction = "";
				}
			}
		});
	};

	$scope.secondaryDataModelChange = function(dm) {
		$scope.secondaryDataModelId = dm.dataModelId;
		// Field Selector追加対応
		$scope.secondaryDataModelName = dm.dataModelName;

		var send_Data =	{
			sourceDMId: $scope.widgetCreationObj.dmObjList[0].dataModelId,
			targetDMId: $scope.widgetCreationObj.dmObjList[1].dataModelId
		};

		PDService.getData('getFRMFields', true, 'get', send_Data).then(function(data){
//			console.log("getFRMFields: ", data);
			var frmFieldList = data;
			$scope.selectDamaModelBasedFieldList = _.findByValues($scope.primaryDataModelField, "dataModelFieldId", frmFieldList);
		});

		// PromiseAjax.getData(CONTEXT_PATH+"PageDesigner/getDataModelFacetInfo", "get", { dataModelId:  $scope.widgetCreationObj.dmObjList[1].dataModelId }).then(function(data) {
			/*if (data.status == "OK") {
			} else {
				console.log(data);
			}*/
		PDService.getData('getDataModelFacetInfo', true, 'get', { dataModelId:  $scope.widgetCreationObj.dmObjList[1].dataModelId }).then(function(data){
//			console.log("getDataModelFacetInfo: ", data);
			var secondaryAggrFunctions = data.aggrFunctions;
			var secondarFields = data.dataModelFields
			if (_.keys(data.aggrFunctions).length == 0){
				secondaryAggrFunctions = {};
			}
			secondaryAggrFunctions["count"] = "Count";
			secondaryAggrFunctions["constant"] = "Constant";
			$scope.addConstantAggFunc();
			$scope.secondaryDataModelAggFunc = secondaryAggrFunctions;

			$scope.secondaryDataModelField = secondarFields;
			$scope.allDataModelFields = $scope.primaryDataModelField.map(function(obj) {
				obj.selectId = $scope.widgetCreationObj.dmObjList[0].dataModelId + ":" + obj.dataModelFieldId;
				obj.dataModelName = $scope.widgetCreationObj.dmObjList[0].dataModelName;
				return obj;
			});
			$scope.allDataModelFields = $scope.allDataModelFields.concat($scope.secondaryDataModelField.map(function(obj) {
				obj.selectId = $scope.widgetCreationObj.dmObjList[1].dataModelId + ":" + obj.dataModelFieldId;
				obj.dataModelName = $scope.widgetCreationObj.dmObjList[1].dataModelName;
				return obj;
			}));
			// Field Selector追加対応
			if($scope.widgetCreationObj.chart.facetMergeConfig != undefined){
				if($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId)
					$scope.msrFieldName[1] = PDService.getFieldDisplayName($scope.secondaryDataModelField, $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId);

				if($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1] && $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].fieldId){

					if($scope.widgetCreationObj.dmObjList[1].dataModelId != $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].dataModelId &&
							$scope.widgetCreationObj.dmObjList[0].dataModelId != $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].dataModelId){

						$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].operator = 'none';
						$scope.resetOnOperator('none', 0, 1);
					}
					$scope.fctFieldName[0] = PDService.getFieldDisplayName_All($scope.allDataModelFields, $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].dataModelId, $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].fieldId);
				}

				if($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1] && $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].fieldId){

					if($scope.widgetCreationObj.dmObjList[1].dataModelId != $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].dataModelId &&
							$scope.widgetCreationObj.dmObjList[0].dataModelId != $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].dataModelId){

						$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].operator = 'none';
						$scope.resetOnOperator('none', 1, 1);
					}
					$scope.fctFieldName[1] = PDService.getFieldDisplayName_All($scope.allDataModelFields, $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].dataModelId, $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].fieldId);
				}
			}
			// Field Selector追加対応

			$scope.mergedAggFunc = {};
			_.merge($scope.mergedAggFunc, $scope.primaryDataModelAggFunc, $scope.secondaryDataModelAggFunc);
			delete $scope.mergedAggFunc["count"];
			$scope.mergedAggFunc["count:"+$scope.widgetCreationObj.dmObjList[0].dataModelId] = "Count(" + $scope.widgetCreationObj.dmObjList[0].dataModelName + ")";
			$scope.mergedAggFunc["count:"+$scope.widgetCreationObj.dmObjList[1].dataModelId] = "Count(" + $scope.widgetCreationObj.dmObjList[1].dataModelName + ")";
			if ($scope.widgetCreationObj.chart.facetMergeConfig != undefined) {
				$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[0].dataModelId = $scope.widgetCreationObj.dmObjList[0].dataModelId;
				$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].dataModelId = $scope.widgetCreationObj.dmObjList[1].dataModelId;

				if (!$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1]) {
					$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1] = {};
					$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].operator = 'none';
				}

				if (!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1]) {
					$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1] = {};
					$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].operator = 'none';
				}

				if (!(_.has($scope.mergedAggFunc, $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction))) {
					$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction = "";
				}

				if (!(_.has($scope.mergedAggFunc, $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction))) {
					$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction = "";
				}
			}
		});

		// PromiseAjax.getData(CONTEXT_PATH+"PageDesigner/getSortFunction", "get", { dataModelId: $scope.widgetCreationObj.dmObjList[1].dataModelId }).then(function(data) {
		PDService.getData('getSortFunction', true, 'get', { dataModelId: $scope.widgetCreationObj.dmObjList[1].dataModelId }).then(function(data){
			$scope.secondartSortMap = angular.copy(util.replaceSortValue(data));
			var inter = [];
			for(var i in $scope.secondartSortMap){
				if (_.findIndex($scope.primarySortMap, $scope.secondartSortMap[i]) > -1) {
					inter.push($scope.secondartSortMap[i]);
				}
			}
			$scope.sortMap = inter;
		});

	};

	// add more data model at page level
	$scope.finalAddDataModel = function(dmId) {

		// データモデル選択リストの修正
		//$scope.data.dataModelDetailListからデータモデル情報を再取得する。（表示用と要素の内容が異なるため）
		var dm = _.find($scope.data.dataModelDetailList, function(obj){
			 return obj.dataModelId == dmId;
		});

		if(!dm){
			// $scope.data.dataModelDetailListから取得できなかった場合はエラーメッセージを出力
			angular.element('.wrapper-shadow').hide();
			util.showNotification('Error', "DataModelを変更できませんでした。", "error", "", false, true);
			return;
		}
		$scope.currentFolderId = '/';
		// データモデル選択リストの修正

		$scope.compositeDataModelError = false;
		$scope.compositeDataModelMultiMeasureError = false;

		// FRMフィールド存在確認
		$scope.dimNofrmWarning = false;
		$scope.secondDimNofrmWarning = false;
		$scope.dimNoFrmMsg ='';
		$scope.secondDimNoFrmMsg = '';
	   
		//2019.06.05 ADD START HUY-DHK 
		// VN: Warning Z axis  for BubbleChart 
		$scope.thirdDimNofrmWarning = false;
		$scope.thirdDimNoFrmMsg = '';
		//2019.06.05 ADD END


		// Text Navigator Widgetの追加
		$scope.dimNoFrmMsgMap = {};
		// Text Navigator Widgetの追加
		// FRMフィールド存在確認

		if ($scope.selectedChartTypeIdx != null && (!dm.dataModelRepositoryId && !dm.snapshotDMId)
				&& ($scope.widgetCreationObj.chart.widgetDefId == 'VerticalGroupedMultiMeasureChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'MultiMeasureLineChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalGroupedMultiMeasureChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'StackedGroupBarChart')) {
			$scope.compositeDataModelMultiMeasureError = true;
			angular.element('.wrapper-shadow').hide();
			return;
		}

		var idx = 1;

		if ($scope.widgetCreationObj.dmObjList.length == 1) {

			if($scope.changingDMIdx != 0) {
				if (((!$scope.widgetCreationObj.dmObjList[0].hasMugenStorage) && (!$scope.widgetCreationObj.dmObjList[0].dataRepositoryUrl)) || (!dm.dataRepositoryUrl&& (!dm.snapshotDMId))) {
					$scope.compositeDataModelError = true;
					angular.element('.wrapper-shadow').hide();
					return;
				}
			}
		} else if ($scope.widgetCreationObj.dmObjList.length == 2) {
			if ((!dm.dataRepositoryUrl) && (!dm.snapshotDMId)) {
				$scope.compositeDataModelError = true;
				angular.element('.wrapper-shadow').hide();
				return;
			}
		}
		if ($scope.changingDMIdx == 0) {
			idx = 0;
		}
		$scope.widgetCreationObj.dmObjList[idx] = angular.copy(dm);


		if ($scope.widgetCreationObj.dmObjList.length == 2 || !$scope.widgetCreationObj.dmObjList[0].dataModelRepositoryId) {
			$scope.widgetCreationObj.chart.showOthers = false;
		}

		var isSearchIndexDataModelList = false;
		for(var i in $scope.widgetCreationObj.dmObjList) {
			if ($scope.widgetCreationObj.dmObjList[i].isSearchIndexDataModel) {
				isSearchIndexDataModelList = true;
			}
		}

		$scope.isSearchIndexDataModelForWidget = isSearchIndexDataModelList;

		if (idx == 0) {
//			$scope.primaryDataModelChange(angular.copy(dm));
//			resetAllSettings();
			if(dm.dataModelId != $scope.widgetDataModel.dataModelId){
				// CrossTabの各種キャッシュ情報の削除
				if($scope.widgetCreationObj.chart.widgetDefId=='CrossTab'){

					if( $routeParams.pid != undefined && $scope.widgetCreationObj.chart.widgetId != undefined){
						var publishPId = $routeParams.pid.replace('g3_per_', 'g3_pub_');
						var publishWId = $scope.widgetCreationObj.chart.widgetId.replace('w_per_', 'w_pub_');

						if( localSessionStorage.getFromSessionStorageForCrossTab(publishPId, publishWId, $rootScope.loggedInUserId) )
							localSessionStorage.removeSessionStorageForCrossTab(publishPId, publishWId, $rootScope.loggedInUserId);

						var data = {
							'pubPageId': publishPId,
							'pubWidgetId': publishWId
						};
						WidgetService.getData('deleteCrosstabCache', true, "POST", data, $scope.displayName).then(function(response) {
//							console.log('call deleteCrosstabCache: ' + response);
						});
					}
				}
				$scope.primaryDataModelChange(angular.copy(dm));
				resetAllSettings();
			}
		} else {

//			$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction = "count";
//			$scope.widgetCreationObj.chart.facetMergeConfig[1].display = "Count";
//			$scope.changeFacetMergeAggFunction("count", 1);
			// Field Selector追加対応
			$scope.msrFieldName[1] = "----";

			$scope.secondaryDataModelChange(dm);
		}
		angular.element('.wrapper-shadow').hide();
	};

	// remove second data model at page level
	$scope.removeDataModel = function() {
		$scope.compositeDataModelError = false;
		$scope.sortMap = angular.copy($scope.primarySortMap);
		$scope.widgetCreationObj.dmObjList.splice(1, 1);
		$scope.selectDamaModelBasedFieldList = angular.copy($scope.primaryDataModelField);
		$scope.secondaryDataModelField = angular.copy($scope.primaryDataModelField);
		$scope.secondaryDataModelId = $scope.widgetCreationObj.dmObjList[0].dataModelId;
		$scope.removeConstantAggFun();
		// Field Selector追加対応
		$scope.secondaryDataModelName = $scope.widgetCreationObj.dmObjList[0].dataModelName;
		if($scope.widgetCreationObj.chart.facetMergeConfig && $scope.widgetCreationObj.chart.facetMergeConfig[1])
			$scope.widgetCreationObj.chart.facetMergeConfig[1] = getInitialFacetMergeMeasureConfig();
		$scope.msrFieldName[1] = "----";
		$scope.fctFieldName[1] = "----";
		// Field Selector追加対応
	};
	// toggle data model of top level
	$scope.toggleDMAccordianIndex = null;
	$scope.toggleDMAccordian = function(idx) {
		if ($scope.toggleDMAccordianIndex == idx) {
			$scope.toggleDMAccordianIndex = null;
			return;
		}
		$scope.toggleDMAccordianIndex = idx;
	};

		$scope.setChartCount = function(count) {
		};

	// click handler
	$scope.chart_category = 'all';
		$scope.setChartCategory = function(cat) {
			$scope.chart_category = cat;
		};

		$scope.handleVariousCloseFunctionality = function() {
			angular.element('.header-nav ul').removeClass('opened');
		};

	$scope.openAddDataModelWindow = function(event, dm, idx, previewChart) {

		if (previewChart) {
			// パフォーマンス改善対応
			$scope.isPreviewChart = true;
			if( !$scope.saveWidgetCreation(event) ){
				$scope.isPreviewChart = false;
				return;
			}

			var dt = UtilService.formatDatetimeString(new Date());
			search.setSearchDatetime(dt);

			// EnterKeyを一時的に無効 (EAGLE-2448)
			$('#widgetPreview').keydown(function(e) {
				if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
	                return false;
	            } else {
	                return true;
	            }
			});

			var PV_MARGIN = 15;
			var pvWidth,pvHeiht;
			if($scope.widgetCreationObj.chart.widgetDefId == 'DocumentSearchResult' || $scope.widgetCreationObj.chart.widgetDefId == 'TableForSS' || $scope.widgetCreationObj.chart.widgetDefId == 'VerticalTableForSS'){

				pvWidth = ( $(window).width() / 12 ) * 8; // documentSearchResultの場合は、8x4のサイズで表示
				pvWidth = Math.floor(pvWidth) + (PV_MARGIN*2);
				pvHeiht = (pvWidth/2) + (PV_MARGIN*5); // 横幅を基準に微調整

			}else{

				pvWidth = ( $(window).width() / 12 ) * 5; // User Portal等、Widgetの標準サイズは、全体幅12分割し4x4のサイズとしている。プレビューは5X5に調整
				pvWidth = Math.floor(pvWidth) + (PV_MARGIN*2);
				pvHeiht = pvWidth + (PV_MARGIN*3); // 横幅を基準に微調整
			}
			// パフォーマンス改善対応

			angular.element('.wrapper-shadow').fadeIn();
			angular.element('.selectdatamodel').hide();

			// パフォーマンス改善対応
			angular.element('.previewchart').css( 'width', pvWidth+'px' );
			angular.element('.previewchart').css( 'height', pvHeiht+'px' );
			angular.element('.previewchart').show();
		} else {
			// パフォーマンス改善対応
			$scope.isPreviewChart = false;

			angular.element('.wrapper-shadow').fadeIn();
			angular.element('.previewchart').hide();
			angular.element('.selectdatamodel').show();
			$scope.changingDMIdx = idx;

			// データモデル選択リストの修正
//			$scope.baseDMInPopover = angular.copy(dm);
			if(dm){
				var tmpDmObj = _.find($scope.dmViewList, function(elm){
		    		return elm.dataModelId == dm.dataModelId;
		    	});
				if(tmpDmObj){

					$scope.baseDMInPopover = angular.copy(tmpDmObj);

					// フィールドリストの表示用にフィールド情報を取得して、タイプ毎にグルーピングする
					PDService.getData("getDataModelFields", true , "get", { dataModelId: dm.dataModelId }).then(function(data){
						var fList = data;
						$scope.baseGrpFldsMap = _.groupBy(fList, 'fieldDataType');
					});

					// フォルダ表示用にフォルダパスをリストに成型する
					var folderAry = [];
		        	if($scope.baseDMInPopover.folderId == '/'){

		        		folderAry[0] = rootFolderName;
		        	}else{

		        		folderAry = $scope.baseDMInPopover.folderPath.split('/');
		        		folderAry[0] = rootFolderName;
		        	}
		        	$scope.baseDMInPopover.folderPathAry = folderAry;

				}else{
					angular.element('.wrapper-shadow').hide();
					util.showNotification('Error', "DataModelを選択できませんでした。", "error", "", false, true);
					return;
				}
			}else{
				$scope.baseDMInPopover = null;
			}
	    	// データモデル選択リストの修正

			$scope.selectedDMInPopover = {};
		}
	};

	$scope.closeWrapperShadow = function(event) {
		event.preventDefault();
		var clickedElement = angular.element(event.target);
		// *** 2018/07/04 [データモデル追加変更時の「選択」「決定」ボタン切替わりの改善] UPD start ***
//		if (angular.element(clickedElement).hasClass('wrapper-shadow') || angular.element(clickedElement).hasClass('fa-close')) {
		if (angular.element(clickedElement).hasClass('wrapper-shadow') ||
			angular.element(clickedElement).hasClass('fa-close') ||
			angular.element(clickedElement).hasClass('btn-cancel')) {
		// *** 2018/07/04 [データモデル追加変更時の「選択」「決定」ボタン切替わりの改善] UPD end ***

			// パフォーマンス改善対応
			if($scope.isPreviewChart){

				// EnterKeyを無効にしていたのを解除 (EAGLE-2448)
				$('#widgetPreview').unbind("keydown");

				// プレビュー要素の削除
				$('#chartPreviewZone').empty();

				//一時的に作成したWidgetインスタンスの削除
				PDService.getData('deleteWidgetForWidgetSetting', true, 'post', {'widgetId':$scope.tmpWidgetId}).then(function(data){
//					console.log('deleteWidgetForWidgetSetting: ', data);

					// 新規作成Widgetの場合
					if(!$scope.widgetCreationObj.chart.widgetId){
						// 新規追加Widgetの場合は、作成されていたNew Widgetが削除されてしまているので、再作成する
						PDService.getData('addWidget', true, 'post', {'pageJSON': undefined}).then(function(response){
//							console.log('addWidget: ', response);
						});
					}
				});
			}
			$scope.isPreviewChart = false;
			angular.element('.datamodellist').show();
			// パフォーマンス改善対応

			angular.element('.wrapper-shadow').hide();
			// reset the vars in case of edit mode
			$scope.changingDMIdx = null;
			$scope.selectedDMInPopover = {};

			// データモデル選択リストの修正
			$scope.currentFolderId = '/';
		}
		return false;
	};

	$scope.selectedChartTypeIdx = null;

	$scope.selectChartList = function(chartObj, e) {
		if (angular.element(e.target).closest("li").hasClass("selected")) return;

		$scope.selectedChartTypeIdx = chartObj.defId;
		$scope.showAddDMBtn = (chartObj.isMultiDataModelSupport == "true");
		$scope.widgetCreationObj.chart.widgetDefId = chartObj.defId;
		$scope.widgetCreationObj.chart.widgetTitle = chartObj.defName;
		$scope.chart_defName = chartObj.defName;

		resetErrorMessage();

		$scope.chartTemplateUrl = CONTEXT_PATH + "ng/included/charts/"+chartObj.defId;
		$scope.editMode = true;
	};

	$scope.editChartTemplate = function(widgetDefId, widgetDefName) {
		$scope.widgetCreationObj.chart.widgetDefId = widgetDefId;
		$scope.selectedChartTypeIdx = widgetDefId;
		$scope.chart_defName = widgetDefName;

		resetErrorMessage();

		$scope.chartTemplateUrl = CONTEXT_PATH + "ng/included/charts/"+widgetDefId;
	};
	// select box's on change functions

	$scope.addConstantAggFunc = function() {
		$scope.primaryDataModelAggFunc["constant"] = "Constant";
		$scope.secondaryDataModelAggFunc["constant"] = "Constant";
	};

	$scope.removeConstantAggFun = function() {
		delete $scope.primaryDataModelAggFunc["constant"];
		delete $scope.secondaryDataModelAggFunc["constant"];

		if($scope.widgetCreationObj.chart.config.measure[0]){
			if (!(_.findKey($scope.primaryDataModelAggFunc, function(obj){
								return $scope.widgetCreationObj.chart.config.measure[0].aggFunction &&
										$scope.widgetCreationObj.chart.config.measure[0].aggFunction.toLowerCase() == obj.toLowerCase();
								})))
			{
				$scope.widgetCreationObj.chart.config.measure[0].aggFunction = "count";
				$scope.changeFacetMergeAggFunction("count", 0);
			}
		}

		if($scope.widgetCreationObj.chart.facetMergeConfig && $scope.widgetCreationObj.chart.facetMergeConfig[1]){
			if (!(_.findKey($scope.secondaryDataModelAggFunc, function(obj){
							return $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction &&
									$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction.toLowerCase() == obj.toLowerCase();
							})))
			{
				$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction = "count";
				$scope.widgetCreationObj.chart.facetMergeConfig[1].display = "Count";
				$scope.changeFacetMergeAggFunction("count", 1);

			}
		}
	}

	$scope.toggleDataChain = function(val) {
		$scope.showDataChain = val;
		$scope.dataChainError = "";

		/*
		* This was done for the issue 1402. But now as per the latest comments by Nakagawa San, we need to show data chain and real time both on the real time series configuration
		if (val) {
			$scope.toggleShowRealTime(false);

		}*/
	};

	$scope.toggleDescription = function(val) {
		$scope.showDescription = val;
	};

    $scope.toggleHighlightConfig = function(val) {
        $scope.showHighlightConfig = val;
    };

    $scope.toggleHierarchy = function(val) {
        $scope.showHierarchy = val;
        $scope.dimensionHierarchyIdError = "";
        $scope.dimensionHierarchyNameError = "";
        $scope.dimensionHierarchyDupError = "";
    }

    // Binning
    $scope.toggleBining = function(val) {
        $scope.showBiningSetting = val;
    }
    // Binning

    $scope.toggleShowRealTime = function(val) {
		$scope.showRealTime = val;
		/*
		* This was done for the issue 1402. But now as per the latest comments by Nakagawa San, we need to show data chain and real time both on the real time series configuration
		if (val) {
			$scope.toggleDataChain(false);
		}*/
	}

	$scope.setRefresInterval = function(val) {
		$scope.refreshInterval = val;
	}

	$scope.selectDataChainPage = function(selectedPageId) {
		$scope.selectedDataChainPageId = selectedPageId;
		$scope.selectedDataChainModel = selectedPageId;
	};

	$scope.setSortOption = function(sort, idx) {
		if (sort) {
			$scope.widgetCreationObj.chart.config.dimensionSort[idx] = {
				sortFieldId : $scope.widgetCreationObj.chart.config.dimension[idx].dataModelFieldId,
				sortBy		: PDService.getSortMap()[sort][0],
				sortOrder	: PDService.getSortMap()[sort][1]
			};
			$scope.dimensionSort[idx] = sort;
		} else {
			$scope.widgetCreationObj.chart.config.dimensionSort[idx] = {
					sortFieldId : $scope.widgetCreationObj.chart.config.dimension[idx].dataModelFieldId,
					sortBy		: null,
					sortOrder	: null
			};
			$scope.dimensionSort[idx] = "";
		}
	};

	$scope.setSortOptionSeries = function(sort) {
/*
		with($scope.widgetCreationObj.chart.config.series[0]) {
			sortFieldId = dataModelFieldId;
			sortBy		= PDService.getSortMap()[sort][0];
			sortOrder	= PDService.getSortMap()[sort][1];
		}
*/
		$scope.widgetCreationObj.chart.config.series[0].sortFieldId = $scope.widgetCreationObj.chart.config.series[0].dataModelFieldId;
		$scope.widgetCreationObj.chart.config.series[0].sortBy = PDService.getSortMap()[sort][0];
		$scope.widgetCreationObj.chart.config.series[0].sortOrder = PDService.getSortMap()[sort][1];
	};

	$scope.changeDimensionHierarchy = function(dimensionHierarchyFld, index) {
		var searchIndex = _.findIndex($scope.selectDamaModelBasedFieldList, {dataModelFieldId: dimensionHierarchyFld});
		var obj = $scope.selectDamaModelBasedFieldList[searchIndex];
		$scope.widgetCreationObj.chart.dimensionHierarchy['0'][index].dataType = angular.copy(obj.fieldDataType);
		$scope.widgetCreationObj.chart.dimensionHierarchy['0'][index].dataModelDispVal = obj.dataModelFieldValue;
	};

	$scope.setMeasureFieldName = function(modelVal, index) {

		if (index == 0) {
			$scope.widgetCreationObj.chart.config.measure[index].dataModelFieldDispVal = $scope.primaryDataModelAggFunc[modelVal];
			$scope.measureFunctionError = "";
			$scope.measureFldError = "";

			$scope.measureDecimalPlacesError = "";
			$scope.measureRoundProcError = "";
		} else {
			$scope.widgetCreationObj.chart.config.measure[index].dataModelFieldDispVal = $scope.secondaryDataModelAggFunc[modelVal];
			$scope.secondMeasureFunctionError = "";
			$scope.secondMeasureFldError = "";

			$scope.secondMeasureDecimalPlacesError = "";
			$scope.secondMeasureRoundProcError = "";
		}

		if (modelVal == "count") {
			$scope.widgetCreationObj.chart.config.measure[index].dataModelFieldId = "-1";
			// Field Selector追加対応
			$scope.msrFieldName[index] = "----";
		}

		if (modelVal != "count" && modelVal != "Sum") {
			$scope.widgetCreationObj.chart.showOthers = false;
		}

		// Field Selector追加対応
		if (!modelVal) {
			$scope.widgetCreationObj.chart.config.measure[index].dataModelFieldId = "-1";
			$scope.msrFieldName[index] = "----";
		}
		// Field Selector追加対応
	};

	$scope.addDimensionHierarchy = function() {
		$scope.widgetCreationObj.chart.dimensionHierarchy['0'].push({
			"dataModelFieldId": null,
			"dataModelDispVal": null,
			"fieldDefaultAction": "drilldown",
			"count": null,
			"targetPage": null,
			"dataType": null
		});
	};


	$scope.setEditModeOff = function() {
		$scope.isEditCase = false;
	};

	$scope.setDimensionField = function(dimensionFld, idx, isTimeSeries) {
		var searchIndex = _.findIndex($scope.selectDamaModelBasedFieldList, {dataModelFieldId: dimensionFld});
		var obj = $scope.selectDamaModelBasedFieldList[searchIndex];

		$scope.widgetCreationObj.chart.config.dimension[idx].dataType = angular.copy(obj.fieldDataType);
		$scope.widgetCreationObj.chart.config.dimension[idx].dataModelDispVal = angular.copy(obj.dataModelFieldValue);

		//2019.06.05 UPD START HUY-DHK
		//if($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart" || $scope.widgetCreationObj.chart.widgetDefId == "WeibullChart" || $scope.widgetCreationObj.chart.widgetDefId == "GaussianChart") {
	
		if($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart" || $scope.widgetCreationObj.chart.widgetDefId == "WeibullChart" || $scope.widgetCreationObj.chart.widgetDefId == "GaussianChart" || $scope.widgetCreationObj.chart.widgetDefId == "BubbleChart" ) {
		//2019.06.05 UPD END	
			$scope.widgetCreationObj.chart.config.dimension[idx].axisLabel = angular.copy(obj.dataModelFieldValue);
		}

		if (idx == 0) {
			if($scope.widgetCreationObj.chart.dimensionHierarchy['0'].length > 0){
				$scope.widgetCreationObj.chart.dimensionHierarchy['0'][0].dataType = angular.copy(obj.fieldDataType);
			}
		}

		var tempNav = $scope.widgetCreationObj.chart.config.navigatorFields;
		var navDimensionField;

		if (obj.fieldType == "field" && obj.hasPair == true) {
			navDimensionField = dimensionFld + "nav";
		} else if(obj.fieldType == "navigator") {
			navDimensionField = dimensionFld
		}

		if (tempNav.length == 0) {
			var tempArray = [];
			tempArray[idx] = navDimensionField;
			tempNav.push({
				"fieldId" :	tempArray.join(",")
			});
		} else {
			var fieldString = tempNav[0].fieldId;
			tempArray = fieldString.split(",");
			tempArray[idx] = navDimensionField;
			tempNav[0].fieldId = tempArray.join(",");
		}

		if (isTimeSeries) {
			$scope.getScaleFields(dimensionFld);
		}

		// Binning
		if($scope.widgetCreationObj.chart.widgetDefId.indexOf("Histogram") != -1) {
			if($scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides.length > 0) {
				var start0 = $scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides[0].start;
				var end0 = $scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides[0].end;
				var displayName0 = $scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides[0].displayName;
				if((start0.length > 0) || (end0.length > 0) || (displayName0.length > 0))
					return; //既に何か設定されていたら変更はしない
			}
			var fieldInfo = $scope.selectDamaModelBasedFieldList[searchIndex];
			if(fieldInfo.isBining == true) {
				var jsonBining = JSON.parse(fieldInfo.biningInfo);
				if(typeof jsonBining.divides != "undefined") {
					//既存の新規入力用は削除しておく(index:0)
					$scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides.splice(0, 1);
					jsonBining.divides.forEach(function(obj) {
						$scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides.push({start:obj.start, end:obj.end, displayName:obj.displayName } );
					});
				}
			}
		}
		// Binning

		if($scope.widgetCreationObj.chart.config.lines){

			//number, decimal, datetime
			var dataType = $scope.widgetCreationObj.chart.config.dimension[idx].dataType;

			var dim_clss = undefined;
			if(dataType == "datetime"){
				dim_clss = "Date";
			}else if(dataType == "number" || dataType == "decimal"){
				dim_clss = "Number";
			}

			for(var i=0; i < $scope.widgetCreationObj.chart.config.lines.length; i++){

				if($scope.widgetCreationObj.chart.config.lines[i].direction != 'none'){

					if(idx == 0 && $scope.widgetCreationObj.chart.config.lines[i].direction == 'vertical' && $scope.widgetCreationObj.chart.config.lines[i].firstX){

						// Verticalの管理値のタイプ: Number, Date
						var clss = Object.prototype.toString.call($scope.widgetCreationObj.chart.config.lines[i].firstX).slice(8, -1);
						if(dim_clss != clss) $scope.widgetCreationObj.chart.config.lines[i].firstX = undefined;

					}else if(idx == 1 && $scope.widgetCreationObj.chart.config.lines[i].direction == 'horizontal' && $scope.widgetCreationObj.chart.config.lines[i].firstY){

						// Horizontalの管理値のタイプ: Number, Date
						var clss = Object.prototype.toString.call($scope.widgetCreationObj.chart.config.lines[i].firstY).slice(8, -1);
						if(dim_clss != clss) $scope.widgetCreationObj.chart.config.lines[i].firstY = undefined;
					}
				}
			}
		}
	};

	$scope.toggleShowOthers = function(condition){
		if(condition){
			$scope.widgetCreationObj.chart.showOthers = false;
		}
	}
	$scope.getScaleFields = function(fieldId, editModeFlag) {
		// PromiseAjax.getData(CONTEXT_PATH+"PageDesigner/getScaleFields", "get", { 'dataModelId':  $scope.widgetCreationObj.dmObjList[0].dataModelId, 'parentFieldId' :  fieldId}).then(function(data) {
			/*if (data.status == "OK") {
			}*/
		PDService.getData("getScaleFields", true, "get", { 'dataModelId':  $scope.widgetCreationObj.dmObjList[0].dataModelId, 'parentFieldId' :  fieldId}).then(function(data){
			var responseMap = {};
			if(data){
				responseMap = data;
				$scope.scaleFieldsList = responseMap["scaleFields"];
				if(editModeFlag){
					$scope.changeScaleField($scope.data.widgetInfo.widgetConfig.scaleField[0].dataModelFieldId, editModeFlag);
				}
			}
		});
	};

	$scope.changeScaleField = function(scaleFieldId, editModeFlag) {
		var idx = _.findIndex($scope.scaleFieldsList, {'dataModelFieldId':scaleFieldId})
		var scaleFieldObj;
		var type;
		if(idx>-1){
			scaleFieldObj = $scope.scaleFieldsList[idx];
			type = scaleFieldObj.scaleTypeId;
		}
		/*//Change the scope.countmap.
		if('YEAR' == type){
			$scope.timeSeriesCountMap = angular.copy(CountMap);
		}else if('MONTH' == type){
			$scope.timeSeriesCountMap = angular.copy(CountMap_MONTH);
		}else if('DAY' == type){
			$scope.timeSeriesCountMap = angular.copy(CountMap_DAY);
		}else if('HOUR' == type){
			$scope.timeSeriesCountMap = angular.copy(CountMap_HOUR);
		}else if('MINUTE' == type){
			$scope.timeSeriesCountMap = angular.copy(CountMap_MINUTE);
		}else if('SECOND' == type){
			$scope.timeSeriesCountMap = angular.copy(CountMap_MINUTE);
		}*/

		if(!editModeFlag){
			$scope.widgetCreationObj.chart.config.dimension[0].count = "";
		}
		//get the type and set the currentScaleType
		$scope.currentScaleType = type;

		PDService.getData('getScaleTypeInformation', true, 'get', {}).then(function(data){

			if(data != undefined){
				$scope.currentScaleThreshold = data[$scope.currentScaleType].scale_type_alertThreshold;
			}
		});


	}

	$scope.gotoDashboard = function() {

		var previousScreen = localSessionStorage.getPreviousScreen();
		if(previousScreen != undefined && previousScreen == SID_DASHBOARD){

			PDService.getData('isPersonalPagePublished', true, 'get', {"pageID": $routeParams.pid}).then(function(data){

				if(data != undefined && data.publishedPageId != undefined){
					window.location.href = CONTEXT_PATH + "ng/up_index#/userPortal/" + data.publishedPageId;
				}else{
					window.location.href = CONTEXT_PATH + "ng/up_index#/userPortal";
				}
			});
		}else{

			PDService.getData("cancelWidgetUpdates", true, "post", {}).then(function(data){
				window.location.href = CONTEXT_PATH + "ng/pd_index#/newDashboard/" + $routeParams.pid;
			});
		}
		return false;
	};

	$scope.changeGeomapId = function(value){
		$scope.widgetCreationObj.chart.geoMapId = value;
		$scope.geoMapIdValue = value;
	};

	$scope.dataChainSettingChanges = function() {
		if ($scope.showDataChain) {
			var selectedPageId = $scope.selectedDataChainPageId;
			var index = _.findIndex($scope.dataChainPageList, {'pageId' : selectedPageId});
			if (index > -1) {
				var pageObj = $scope.dataChainPageList[index];

				for (var i in $scope.widgetCreationObj.chart.config.dimension) {
					$scope.widgetCreationObj.chart.config.dimension[i].fieldDefaultAction = "datachain";
					$scope.widgetCreationObj.chart.config.dimension[i].targetPage = selectedPageId;
					$scope.widgetCreationObj.chart.config.dimension[i].targetDMId = pageObj.targetDataModelId;
				}
			}
		} else {
			for (var i in $scope.widgetCreationObj.chart.config.dimension) {
				$scope.widgetCreationObj.chart.config.dimension[i].fieldDefaultAction = "drilldown";
				$scope.widgetCreationObj.chart.config.dimension[i].targetPage = "";
				$scope.widgetCreationObj.chart.config.dimension[i].targetDMId = "";
			}
		}
	};

	var facetMergeSettingChanges = function() {

		var idx = _.findIndex($scope.data.widgetList, {'defId' : $scope.widgetCreationObj.chart.widgetDefId});
		var currentWidgetObj = $scope.data.widgetList[idx];

		// sampleLineChartから他のマルチメジャーチャートに変更された際の処理 ikeuchi add 2017.08.22
		if ( Number(currentWidgetObj.measures) > 1 &&
				$scope.widgetCreationObj.chart.facetMergeConfig.length > 1 &&
				Number(currentWidgetObj.measures) != $scope.widgetCreationObj.chart.facetMergeConfig.length )
		{
			$scope.widgetCreationObj.chart.facetMergeConfig.splice( Number(currentWidgetObj.measures), $scope.widgetCreationObj.chart.facetMergeConfig.length );
		}
		// ikeuchi add end 2017.08.22

		// facetMergeConfigが残っていると、マルチメジャーとして処理されてしまうため、メジャー数が2未満の場合はfacetMergeConfigを削除
		if(currentWidgetObj.measures < 2 && $scope.widgetCreationObj.chart.facetMergeConfig != undefined){
			delete $scope.widgetCreationObj.chart['facetMergeConfig'];
		}

		for (var i in $scope.widgetCreationObj.chart.facetMergeConfig) {
			var dmId;

			if (i == 1 && $scope.widgetCreationObj.dmObjList.length == 1) {
				dmId = $scope.widgetCreationObj.dmObjList[0].dataModelId;
			} else {
				dmId = $scope.widgetCreationObj.dmObjList[i].dataModelId
			}

			for (var j in $scope.widgetCreationObj.chart.facetMergeConfig[i].fields) {
				if (j ==0) {
					$scope.widgetCreationObj.chart.facetMergeConfig[i].expression = j+"";
					$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].dataModelId = dmId;
					if (i==0) {
						$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].fieldId = angular.copy($scope.widgetCreationObj.chart.config.measure[j].dataModelFieldId);

						// Chart変更をして、メジャーの値を変更しなかった場合の考慮 (EAGLE-2316)
						$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction = angular.copy($scope.widgetCreationObj.chart.config.measure[i].aggFunction);
						$scope.widgetCreationObj.chart.facetMergeConfig[i].display =  angular.copy($scope.widgetCreationObj.chart.config.measure[i].dataModelFieldDispVal);
					}
				} else if($scope.widgetCreationObj.dmObjList.length == 1) {
					$scope.widgetCreationObj.chart.facetMergeConfig[i].fields.splice(1, 1);
				} else {

					if ($scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction
							&& $scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction.indexOf("count") > -1) {
						var tempAggFuncDataModelIdArr = $scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction.split(":");
						$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction = tempAggFuncDataModelIdArr[0];
						$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].dataModelId = tempAggFuncDataModelIdArr[1];
					}
					if ($scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].operator != "none") {
						$scope.widgetCreationObj.chart.facetMergeConfig[i].expression += $scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].operator + j;
					}

					/*if ($scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction == "count"
						|| $scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].aggFunction == "") {
						$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[j].dataModelId = dmId;
					}*/
				}
			}
		}
	};

	// for samplelinechart create by m.ikeuchi 2017.07.24
	// 設定画面で値が変わった時の動作
	var multiFacetSettingChanges = function() {

		for (var i in $scope.widgetCreationObj.chart.facetMergeConfig) {
			dmId = $scope.widgetCreationObj.dmObjList[0].dataModelId

			$scope.widgetCreationObj.chart.facetMergeConfig[i].expression = 0+"";
			$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[0].dataModelId = dmId;
			if (i==0) {
				$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[0].fieldId = angular.copy($scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId);
			}
		}
	};
	// add end for samplelinechart

	var timeSeriesSettingChanges = function() {

		if ($scope.widgetCreationObj.chart.config.scaleField != undefined) {
			$scope.widgetCreationObj.chart.config.scaleField[0].fieldDefaultAction =  angular.copy($scope.widgetCreationObj.chart.config.dimension[0].fieldDefaultAction);
			$scope.widgetCreationObj.chart.config.scaleField[0].targetPage =  angular.copy($scope.widgetCreationObj.chart.config.dimension[0].targetPage);
			$scope.widgetCreationObj.chart.config.scaleField[0].targetDMId =  angular.copy($scope.widgetCreationObj.chart.config.dimension[0].targetDMId);
			$scope.widgetCreationObj.chart.config.scaleField[0].dataModelDispVal = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].dataModelDispVal);
			$scope.widgetCreationObj.chart.config.scaleField[0].count = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].count);
			$scope.widgetCreationObj.chart.config.scaleField[0].dataType = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].dataType);
			$scope.widgetCreationObj.chart.config.scaleField[0].scaleType = angular.copy($scope.currentScaleType);
			$scope.widgetCreationObj.chart.config.scaleField[0].alertThreshold = angular.copy($scope.currentScaleThreshold);

		}

		if ($scope.showRealTime && ( $scope.widgetCreationObj.chart.widgetDefId == 'TimeSeries' || $scope.widgetCreationObj.chart.widgetDefId == 'ScatterWithPicture')) {
			$scope.widgetCreationObj.chart.config.refreshInterval = [];
			$scope.widgetCreationObj.chart.config.refreshInterval.push({
				"refreshInterval" : $scope.refreshInterval
			});
		} else if ($scope.widgetCreationObj.chart.widgetDefId == 'TimeSeries') {
			delete $scope.widgetCreationObj.chart.config.refreshInterval;
		}

		if ($scope.widgetCreationObj.chart.widgetDefId != 'TimeSeries') {
			delete $scope.widgetCreationObj.chart.config.scaleField;
		}
	}

	var realTimeSettingChanges = function() {
		if ($scope.showRealTime && $scope.widgetCreationObj.chart.widgetDefId == 'RealTimeCount') {
			$scope.widgetCreationObj.chart.config.refreshInterval = [];
			$scope.widgetCreationObj.chart.config.refreshInterval.push({
				"refreshInterval" : $scope.refreshInterval
			});
		} else if ($scope.widgetCreationObj.chart.widgetDefId == 'RealTimeCount') {
			delete $scope.widgetCreationObj.chart.config.refreshInterval;
		}
	}


	function resetErrorMessage() {
		//2019.07.05 ADD START HAU-TV		  
		$scope.RankAMinMaxError = "";
		$scope.RankBMinMaxError = "";
		//2019.07.05 ADD END
		$scope.titleError = "";
		$scope.descriptionError = "";
		$scope.textAreaError = "";
		$scope.refreshIntervalError = "";
		$scope.dimFldError = "";
		$scope.scaleFldError = "";
		$scope.dimCountError = "";
		$scope.drawLineDirectionError = [];
		$scope.drawLineWidthError = []
		$scope.drawLineFirstXError = [];
		$scope.drawLineFirstYError = [];
		$scope.drawLineTypeError = [];
		$scope.colDimFldError = "";
		$scope.colDimCountError = "";
		$scope.geoMapIdError = "";
		$scope.dimensionHierarchyNameError = "";
		$scope.dimensionHierarchyIdError = "";
		$scope.dimensionHierarchyDupError = "";
		$scope.dataChainError = "";
		$scope.measureFldError = "";
		$scope.measureFunctionError = "";
		$scope.secondMeasureFldError = "";
		$scope.secondMeasureFunctionError = "";
		$scope.firstMeasureConstantError = "";
		$scope.secondMeasureConstantError = "";
		$scope.firstMeasureSecondaryFieldError = "";
		$scope.firstMeasureSecondaryConstantError = "";
		$scope.secondMeasureSecondaryFieldError = "";
		$scope.secondMeasureSecondaryConstantError = "";
		$scope.firstMeasurePrimaryConstantError = "";
		$scope.secondMeasurePrimaryConstantError = "";
		$scope.primaryMeasureMinError = "";
		$scope.primaryMeasureMaxError = "";
		$scope.secondMeasureMinError = "";
		$scope.secondMeasureMaxError = "";
		$scope.duplicateDimFldNameError = "";
		$scope.firstMeasureSecondFunctionError = "";
		$scope.secondMeasureSecondFunctionError = "";
		$scope.compositeDataModelMultiMeasureError = "";
		$scope.dsrError = {};
		$scope.showDSRError = false;
		$scope.biningerrnospace = "";
		$scope.biningerrnomunber = "";
		$scope.biningerrmaxmin = "";
		$scope.biningerrsamevalue = "";
		$scope.biningerrtoolonglabel = "";
		$scope.biningerrduplicatelabel = "";
		$scope.biningErrListStart = [];
		$scope.biningErrListEnd = [];
		$scope.biningErrListName = [];

		$scope.measureDecimalPlacesError = "";
		$scope.measureRoundProcError = "";
		$scope.secondMeasureDecimalPlacesError = "";
		$scope.secondMeasureRoundProcError = "";

		// Scatter
		$scope.xDimFldReqError = "";
		$scope.yDimFldReqError = "";
		$scope.bgpictureError = "";
		$scope.seriesFldReqError = "";
		$scope.seriesFldCountError = "";
		$scope.seriesMaxElementsReqError = "";
		$scope.tooltipReqError = "";
		$scope.duplicateTooltipFldError = "";
//		$scope.linesCoordinateError = "";
//		$scope.linesCoordinateDateFormatError = "";
		// Scatter
		
		//2019.06.05 ADD START HUY-DHK		  
		//VN: z Filed  check required error
		$scope.zDimFldReqError = "";	   
		//2019.06.05 ADD END


		//samplelinechart
		$scope.measure_FunctionError = [];
		$scope.measure_FldError = [];
		$scope.htmlTags_InXFldNameError = [];
		$scope.measure_lineparamError = [];
		//samplelinechart
		$scope.compositeDataModelError = ""	;
		$scope.htmlTagsInFldNameError = false;
		$scope.htmlTagsInWdgtNameError = false;
		$scope.htmlTagsInWdgtDescError = false;
		$scope.htmlTagsInMinValueError = false;
		$scope.htmlTagsInMaxValueError = false;
		$scope.htmlTagsInXFldNameError = false;
		$scope.htmlTagsInHierarchyFldNameError = false;
		$scope.htmlTagsInColDimFldNameError = false;
		$scope.htmlTagsInSecondYFldNameError = false;

		$scope.fasetMeargeByMeasureSortError = "";
		$scope.colFasetMeargeByMeasureSortError = "";

		// WeibullChart
		$scope.constantValueReqError = false;
		$scope.constantValueNumError = false;
		// WeibullChart
		// GaussianChart
		$scope.constantValue2ReqError = false;
		$scope.constantValue2NumError = false;
		$scope.constantValue3UpperReqError = false;
		$scope.constantValue3LowerReqError = false;
		$scope.constantValue3NumError = false;
		$scope.constantValue3UpperNumError = false;
		$scope.constantValue3LowerNumError = false;
		// GaussianChart
		// TableForSS
		$scope.measureDispValError = "";
		$scope.htmlTagsInMesureNameError = "";
		// TableForSS
		// Text Navigator Widgetの追加
		$scope.dimLstFldError = [];
		$scope.dimLstCountError = [];
		$scope.dimLstFldNameError = [];
		$scope.dimLstHtmlTagsInFldNameError = [];
		$scope.dimNoFrmMsgMap = {};
		// Text Navigator Widgetの追加
		// HeatMapWithImage
		$scope.yAxisMinReqError = false;
		$scope.yAxisMaxReqError = false;
		$scope.xAxisMinReqError = false;
		$scope.xAxisMaxReqError = false;
		$scope.yAxisMinNumError = false;
		$scope.yAxisMaxNumError = false;
		$scope.xAxisMinNumError = false;
		$scope.xAxisMaxNumError = false;
		// HeatMapWithImage
		
		/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
		$scope.facetMergeConfig_FunctionError = [];
		$scope.facetMergeConfig_FldError = [];
		$scope.facetMergeConfig_HtmlTagsError = [];
		$scope.facetMergeConfig_LineTypeError = [];
		$scope.facetMergeConfig_YAxisError = [];
		$scope.facetMergeConfig_AverageNumberDigitsError = [];
		
		$scope.yAsisSettingConfig_HtmlTagsError = [];
		$scope.yAsisSettingConfig_MinError = [];
		$scope.yAsisSettingConfig_MaxError = [];
		/* 2019.06.05 ADD END  */
		
		/* 2019.06.05 ADD START KIEN-DX TripleDataModelChart Widgetの追加  */
		$scope.dimension_dataModelSelectionError = [];
		$scope.facetMergeConfig_dataModelSelectionError = [];
		/* 2019.06.05 ADD END  */
	}

	function widgetCreationFormValidated() {
		var isFormValidated = true;

		//function to reset the error message on the widget screen
		resetErrorMessage();

		if($scope.widgetCreationObj.chart.widgetDefId == 'Spacer'){
			return isFormValidated;
		}
		
		if($scope.widgetCreationObj.chart.widgetDefId == 'ScatterEllipseChart'){
			if($scope.widgetCreationObj.chart.config.probEllipsePct) {
				var value = $scope.widgetCreationObj.chart.config.probEllipsePct;
				if((value.length > 0) && (IsNumber(value) != true)) {
					$scope.numberFormatError = true;
					isFormValidated = false;
				}else if((Number(value) < 0 ) || (Number(value) > 100)){
					$scope.numberFormatError = true;
					isFormValidated = false;
				}
			}
			if($scope.widgetCreationObj.chart.config.step) {
				var value = $scope.widgetCreationObj.chart.config.step;
				if((value.length > 0) && !Number.isInteger( Number(value) )) {
					$scope.errorStepParameter = true;
					isFormValidated = false;
				}else if((Number(constantValue) < 10 ) || (Number(constantValue) > 10000)){
					$scope.numberFormatError = true;
					isFormValidated = false;
				}
			}
			if($scope.widgetCreationObj.chart.config.calculableLimit) {
				var value = $scope.widgetCreationObj.chart.config.calculableLimit;
				if((value.length > 0) && (IsNumber(value) != true)) {
					$scope.numberFormatError = true;
					isFormValidated = false;
				}else if((Number(value) < 0 ) || (Number(value) > 1.0)){
					$scope.numberFormatError = true;
					isFormValidated = false;
				}

			}
			return isFormValidated;
		}

		if ($scope.widgetCreationObj.chart.widgetTitle == "") {
			$scope.titleError = "has-error";
			isFormValidated = false;
		} else if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.widgetTitle))) {
			$scope.htmlTagsInWdgtNameError = true;
			isFormValidated = false;
		}
		if( $scope.widgetCreationObj && $scope.widgetCreationObj.chart && $scope.widgetCreationObj.chart.config && $scope.widgetCreationObj.chart.config.dimension[0] && $scope.widgetCreationObj.chart.config.dimension[0].dataModelDispVal ){
			if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.config.dimension[0].dataModelDispVal))) {
				$scope.htmlTagsInFldNameError = true;
				isFormValidated = false;
			}
		}
		
		
		//2019.07.05 ADD START HAU-TV
		if($scope.widgetCreationObj.chart.widgetDefId == 'AbcChart'){
			var rankA = $scope.widgetCreationObj.chart.config.rank[0].rankA;
			var rankB = $scope.widgetCreationObj.chart.config.rank[0].rankB;
			var rankC = $scope.widgetCreationObj.chart.config.rank[0].rankC;
	
			if( rankA != null && rankB != null ){
				if( eval(rankA) > eval(rankB)) {
					$scope.RankAMinMaxError = "has-error";
					isFormValidated = false;
				}
	
			}
			if(rankC != null){
				if( eval(rankB) > eval(rankC)) {
					$scope.RankBMinMaxError = "has-error";
					isFormValidated = false;
				}
			}
		}
		//2019.07.05 ADD END
		
		if( $scope.widgetCreationObj && $scope.widgetCreationObj.chart && $scope.widgetCreationObj.chart.config && $scope.widgetCreationObj.chart.config.dimension[0] && $scope.widgetCreationObj.chart.config.dimension[0].dataModelDispVal ){
			if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.config.dimension[0].dataModelDispVal))) {
				$scope.htmlTagsInFldNameError = true;
				isFormValidated = false;
			}
		}

		if ($scope.showDescription) {
			if (typeof $scope.widgetCreationObj.chart.widgetDescription == "undefined" || $scope.widgetCreationObj.chart.widgetDescription == "") {
				$scope.descriptionError = "has-error";
				isFormValidated = false;
			} else if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.widgetDescription))) {
				$scope.htmlTagsInWdgtDescError = true;
				isFormValidated = false;
			}
		}

		if ($scope.widgetCreationObj.chart.config.measure != undefined && $scope.widgetCreationObj.chart.config.measure[0] != undefined) {
			if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal))) {
				$scope.htmlTagsInXFldNameError = true;
				isFormValidated = false;
			}
		}

		if ($scope.widgetCreationObj.chart.dimensionHierarchy != undefined && $scope.widgetCreationObj.chart.dimensionHierarchy[0] != undefined && $scope.widgetCreationObj.chart.dimensionHierarchy[0][0] != undefined) {
			if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.dimensionHierarchy[0][0].dataModelDispVal))) {
				$scope.htmlTagsInHierarchyFldNameError = true;
				isFormValidated = false;
			}
		}

		if ($scope.widgetCreationObj.chart.config.dimension != undefined && $scope.widgetCreationObj.chart.config.dimension[1] != undefined) {
			if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.config.dimension[1].dataModelDispVal))) {
				$scope.htmlTagsInColDimFldNameError = true;
				isFormValidated = false;
			}
		}

		if ($scope.widgetCreationObj.chart.facetMergeConfig != undefined && $scope.widgetCreationObj.chart.facetMergeConfig[1] != undefined) {
			if(HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.facetMergeConfig[1].display))) {
				$scope.htmlTagsInSecondYFldNameError = true;
				isFormValidated = false;
			}
		}

		if($scope.widgetCreationObj.chart.widgetDefId == 'StaticText'){
			if ($scope.widgetCreationObj.chart.staticText == "" || $scope.widgetCreationObj.chart.staticText == null) {
				$scope.textAreaError = "has-error";
				isFormValidated = false;
			}
		}
		else if ($scope.widgetCreationObj.chart.widgetDefId == 'RealTimeCount'){
			if ($scope.showRealTime && !$scope.refreshInterval) {
				$scope.refreshIntervalError = "has-error";
				isFormValidated = false;
			}
		}
		else if($scope.widgetCreationObj.chart.widgetDefId == 'DocumentSearchResult'){
			var nullvalue = [];
			for( var key in $scope.widgetCreationObj.chart.config.documentSearch){
				if(!$scope.widgetCreationObj.chart.config.documentSearch[key]){
					if((key =='highlightField' ||key =='uniqueField' ) && !$scope.showHighlightConfig){
						continue;
					}
					nullvalue.push(key);
				}
			}
			$scope.dsrError = {};
			if(nullvalue.length > 0){
				for(var i in nullvalue){
					$scope.dsrError[nullvalue[i]] = true;
				}
				isFormValidated = false;
			}
			$scope.showDSRError = _.keys($scope.dsrError).length > 0;
		}
		else if($scope.widgetCreationObj.chart.widgetDefId == 'SlideShow'){
			var nullvalue = [];
			for( var key in $scope.widgetCreationObj.chart.config.documentSearch){
				if(!$scope.widgetCreationObj.chart.config.documentSearch[key]){
					if((key =='highlightField' ||key =='uniqueField' ) && !$scope.showHighlightConfig){
						continue;
					}
					nullvalue.push(key);
				}
			}
			$scope.dsrError = {};
			if(nullvalue.length > 0){
				for(var i in nullvalue){
					$scope.dsrError[nullvalue[i]] = true;
				}
				isFormValidated = false;
			}
			$scope.showDSRError = _.keys($scope.dsrError).length > 0;
		}
		else if($scope.widgetCreationObj.chart.widgetDefId == 'RaderChart'){
			if($scope.widgetCreationObj.chart.config.dimension.length < 3){
				$scope.dimFldCountError = "has-error";
				isFormValidated = false;
			}
			if($scope.widgetCreationObj.chart.config.showAll) {
				if((!$scope.widgetCreationObj.chart.config.allLineInfo)
					|| (!$scope.widgetCreationObj.chart.config.allLineInfo.linestyle)
					|| (!$scope.widgetCreationObj.chart.config.allLineInfo.width)
					|| (!$scope.widgetCreationObj.chart.config.allLineInfo.message)) {
					$scope.controlLineError = "has-error";
					isFormValidated = false;
				}
			}


		}
		// Text Navigator Widgetの追加
		else if($scope.widgetCreationObj.chart.widgetDefId == 'TextNavigator' || $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalTextNavigator' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'MultiListNavigator' || $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalMultiListNavigator'){
			for(var i=0; i<$scope.widgetCreationObj.chart.config.dimension.length; i++){

				if ( $scope.widgetCreationObj.chart.config.dimension[i] == null
							|| $scope.widgetCreationObj.chart.config.dimension[i].dataModelFieldId == "" || $scope.widgetCreationObj.chart.config.dimension[i].dataModelFieldId == null　)
				{
					$scope.dimLstFldError[i] = "has-error";
					isFormValidated = false;
				}

				if($scope.widgetCreationObj.chart.config.dimension[i]){
					if ( $scope.widgetCreationObj.chart.config.dimension[i].count == "" || $scope.widgetCreationObj.chart.config.dimension[i].count == null ){
						$scope.dimLstCountError[i] = "has-error";
						isFormValidated = false;
					}

					if ( $scope.widgetCreationObj.chart.config.dimension[i].dataModelDispVal == "" || $scope.widgetCreationObj.chart.config.dimension[i].dataModelDispVal == null )	{
						$scope.dimLstFldNameError[i] = "has-error";
						isFormValidated = false;

					}else{
						if (HTMLVALIDATEREGEX.test(angular.lowercase($scope.widgetCreationObj.chart.config.dimension[i].dataModelDispVal))) {
							$scope.dimLstHtmlTagsInFldNameError[i] = "has-error";
							isFormValidated = false;
						}
					}
				}
			}
		}
		// Text Navigator Widgetの追加
		else{
			if($scope.widgetCreationObj.chart.config.dimension[0]){
				if ($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == "" || $scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == null) {
					$scope.dimFldError = "has-error";
					isFormValidated = false;
				}

				if ($scope.widgetCreationObj.chart.config.dimension[0].count == "" || $scope.widgetCreationObj.chart.config.dimension[0].count == null) {
					$scope.dimCountError = "has-error";
					isFormValidated = false;
				}
			}

			if ((!$scope.widgetCreationObj.chart.config.dimension[1] || !$scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId)
					&& $scope.widgetCreationObj.chart.widgetDefId == 'TimeSeries') {
				$scope.widgetCreationObj.chart.config.dimension.splice(1,1);
				$scope.widgetCreationObj.chart.config.dimensionSort.splice(1,1);
			}

			if($scope.widgetCreationObj.chart.config.dimension && $scope.widgetCreationObj.chart.config.dimension.length > 1){

				if ($scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId == "" || $scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId == null) {
					$scope.colDimFldError = "has-error";
					isFormValidated = false;
				} else if ($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == $scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId) {
					$scope.duplicateDimFldNameError = "has-error";
					isFormValidated = false;
				}

				if ($scope.widgetCreationObj.chart.config.dimension[1].count == "" || $scope.widgetCreationObj.chart.config.dimension[1].count == null) {
					$scope.colDimCountError = "has-error";
					isFormValidated = false;
				}

				if ($scope.widgetCreationObj.chart.dimensionHierarchy['0'][1].dataModelFieldId && $scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId
						&& $scope.widgetCreationObj.chart.dimensionHierarchy['0'][1].dataModelFieldId == $scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId
						&& !($scope.widgetCreationObj.chart.widgetDefId == 'MultiAreaChart' || $scope.widgetCreationObj.chart.widgetDefId == 'MultiLineChart')) {
					$scope.dimensionHierarchyDupError = "has-error";
					isFormValidated = false;
				}

			}

			if($scope.widgetCreationObj.chart.widgetDefId == 'MultiAreaChart'){

				if ($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == "" || $scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == null) {
					$scope.colDimFldError = "has-error";
					isFormValidated = false;
				}

				if ($scope.widgetCreationObj.chart.config.dimension[0].count == "" || $scope.widgetCreationObj.chart.config.dimension[0].count == null) {
					$scope.colDimCountError = "has-error";
					isFormValidated = false;
				}
			}

			if($scope.widgetCreationObj.chart.widgetDefId == 'GeoMapChart'){
				if ($scope.geoMapIdValue == "" || $scope.geoMapIdValue == null) {
					$scope.geoMapIdError = "has-error";
					isFormValidated = false;
				}
			}


			//to validate the min max value of measure

			//2019.06.05 UPD START HUY-DHK	add BubbleChart
			if (!($scope.widgetCreationObj.chart.widgetDefId == 'GeoMapChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'PieChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'DonutChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'ListNavChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'CrossJoinedDonutChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'ScatterPlot'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'ScatterPlotWithPlot'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'ScatterEllipseChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'TableForSS'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'VerticalTableForSS'					
					|| $scope.widgetCreationObj.chart.widgetDefId == 'BubbleChart')) {
			//2019.06.05 UPD END		  

				var min = $scope.widgetCreationObj.chart.config.measure[0].minCount;
				var max = $scope.widgetCreationObj.chart.config.measure[0].maxCount;


				if( !(isNaN(min)) && !(isNaN(max)) ){
					if( eval(min) > eval(max)) {
						$scope.primaryMeasureMinError = "has-error";
						$scope.primaryMeasureMaxError = "has-error";
						isFormValidated = false;
					}
				}else{
					if (min != undefined && isNaN(min)) {
						$scope.primaryMeasureMinError = "has-error";
						isFormValidated = false;
					}

					if (max != undefined && isNaN(max)) {
						$scope.primaryMeasureMaxError = "has-error";
						isFormValidated = false;
					}
				}

				// 入力された最小値/最大値を数値に変換
				if( min === "" || min == null ){
					$scope.widgetCreationObj.chart.config.measure[0].minCount = undefined;
				}else if( !isNaN(min) ){
					$scope.widgetCreationObj.chart.config.measure[0].minCount = undefined;
					$scope.widgetCreationObj.chart.config.measure[0].minCount = parseFloat(min);
				}

				if( max === "" || max == null ){
					$scope.widgetCreationObj.chart.config.measure[0].maxCount = undefined;
				}else if( !isNaN(max) ){
					$scope.widgetCreationObj.chart.config.measure[0].maxCount = undefined;
					$scope.widgetCreationObj.chart.config.measure[0].maxCount = parseFloat(max);
				}
			}

			if ($scope.widgetCreationObj.chart.widgetDefId == 'VerticalGroupedMultiMeasureChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'MultiMeasureLineChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalGroupedMultiMeasureChart'
					|| $scope.widgetCreationObj.chart.widgetDefId == 'StackedGroupBarChart') {

				var secondMeasureMin = $scope.widgetCreationObj.chart.config.measure[0].minCountSecond;
				var secondMeasureMax = $scope.widgetCreationObj.chart.config.measure[0].maxCountSecond;


				if( !(isNaN(secondMeasureMin)) && !(isNaN(secondMeasureMax)) ){
					if( eval(secondMeasureMin) > eval(secondMeasureMax) ) {
						$scope.secondMeasureMinError = "has-error";
						$scope.secondMeasureMaxError = "has-error";
						isFormValidated = false;
					}
				}else{
					if (secondMeasureMin != undefined && isNaN(secondMeasureMin)) {
						$scope.secondMeasureMinError = "has-error";
						isFormValidated = false;
					}

					if (secondMeasureMax != undefined && isNaN(secondMeasureMax)) {
						$scope.secondMeasureMaxError = "has-error";
						isFormValidated = false;
					}
				}

				// 入力された最小値/最大値を数値に変換
				if( secondMeasureMin == "" )
					$scope.widgetCreationObj.chart.config.measure[0].minCountSecond = undefined;
				else if( !isNaN(secondMeasureMin) )
					$scope.widgetCreationObj.chart.config.measure[0].minCountSecond = parseFloat(secondMeasureMin);

				if( secondMeasureMax == "" )
					$scope.widgetCreationObj.chart.config.measure[0].maxCountSecond = undefined;
				else if( !isNaN(secondMeasureMax) )
					$scope.widgetCreationObj.chart.config.measure[0].maxCountSecond = parseFloat(secondMeasureMax);
			}
		}

		if(!($scope.widgetCreationObj.chart.widgetDefId == 'StaticText' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'RealTimeCount' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'DocumentSearchResult' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'SlideShow' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'RaderChart' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'TableForSS' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'VerticalTableForSS' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'TextNavigator' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'HorizontalTextNavigator' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'MultiListNavigator' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'HorizontalMultiListNavigator')){
			if ($scope.widgetCreationObj.chart.config.dimension[0].count == "" || $scope.widgetCreationObj.chart.config.dimension[0].count == null) {
				$scope.dimCountError = "has-error";
				isFormValidated = false;
			}
		}

		if(!($scope.widgetCreationObj.chart.widgetDefId == 'StaticText' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'RealTimeCount' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'TimeSeries' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'DocumentSearchResult' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'SlideShow' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'TableForSS' ||
				$scope.widgetCreationObj.chart.widgetDefId == 'VerticalTableForSS')){

			if ($scope.showDataChain && !$scope.selectedDataChainPageId) {
				$scope.dataChainError = "has-error";
				isFormValidated = false;
			}

			if (!($scope.widgetCreationObj.chart.widgetDefId == 'GeoMapChart')
					&& $scope.showHierarchy) {

				if (!$scope.widgetCreationObj.chart.dimensionHierarchy['0'][1].dataModelFieldId) {
					$scope.dimensionHierarchyIdError = "has-error";
					isFormValidated = false;
				}

				if (!$scope.widgetCreationObj.chart.dimensionHierarchy['0'][1].dataModelDispVal) {
					$scope.dimensionHierarchyNameError = "has-error";
					isFormValidated = false;
				}
			}
		}

		// for sampleLinechart 対応　by M.Ikeuchi 2016.06.21
		// sampleLinechartの場合は別途処理を切り出した。
//		if ($scope.widgetCreationObj.chart.widgetDefId != 'StaticText'
//				&& $scope.widgetCreationObj.chart.config.measure
//				&& $scope.widgetCreationObj.chart.config.measure[0]) {

		if ($scope.widgetCreationObj.chart.widgetDefId != 'StaticText'
			&& $scope.widgetCreationObj.chart.widgetDefId != 'SampleLineChart'
			&& $scope.widgetCreationObj.chart.widgetDefId != 'TableForSS'
			&& $scope.widgetCreationObj.chart.widgetDefId != 'VerticalTableForSS'
			&& $scope.widgetCreationObj.chart.config.measure
			&& $scope.widgetCreationObj.chart.config.measure[0]) {
		// for sampleLinechart 対応　by M.Ikeuchi 2016.06.21

			if (!$scope.widgetCreationObj.chart.config.measure[0].aggFunction) {
				$scope.measureFunctionError = "has-error";
				isFormValidated = false;
			} else if($scope.widgetCreationObj.chart.config.measure[0].aggFunction != 'count'
				&& $scope.widgetCreationObj.chart.config.measure[0].aggFunction != 'constant'
				&& (!$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId
						|| $scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId == "-1")) {
				$scope.measureFldError = "has-error";
				isFormValidated = false;
			// Binning
			} else if($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == $scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId) {
					$scope.measureFldError = "has-error";
					isFormValidated = false;
			// Binning
			}
		}

		if ($scope.widgetCreationObj.chart.widgetDefId == 'VerticalGroupedMultiMeasureChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'MultiMeasureLineChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'HorizontalGroupedMultiMeasureChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'StackedGroupBarChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'MultiFieldLineChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'ParetoChart'
		) {

			if($scope.widgetCreationObj.chart.widgetDefId != 'MultiFieldLineChart'){
				if (!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction) {
					$scope.secondMeasureFunctionError = "has-error";
					isFormValidated = false;
				} else if($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction.indexOf('count') == -1
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction != 'constant'
					&& (!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId
							|| $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId == "-1")) {
					$scope.secondMeasureFldError = "has-error";
					isFormValidated = false;
				}
			}else{
				if($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction != undefined
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction.indexOf('count') == -1
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction != 'constant'
					&& (!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId
							|| $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].fieldId == "-1")) {
					$scope.secondMeasureFldError = "has-error";
					isFormValidated = false;
				}
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[0].aggFunction == 'constant'
				&& $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].operator == 'none') {
				$scope.firstMeasureConstantError = "has-error";
				isFormValidated = false;
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[0].aggFunction == "constant" &&
					!$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[0].value) {
				$scope.firstMeasurePrimaryConstantError = "has-error";
				isFormValidated = false;
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction == 'constant'
				&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].operator == 'none') {
				$scope.secondMeasureConstantError = "has-error";
				isFormValidated = false;
			}
			if ($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1]
						&& $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction == 'constant'
						&& $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[0].aggFunction == 'constant') {
				$scope.firstMeasureConstantError = "has-error";
				isFormValidated = false;
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1]
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction == 'constant'
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction == 'constant') {
				$scope.secondMeasureConstantError = "has-error";
				isFormValidated = false;
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].aggFunction == "constant" &&
					!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].value) {
				$scope.secondMeasurePrimaryConstantError = "has-error";
				isFormValidated = false;
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1]
						&& $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].operator != 'none') {
				if(!$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction) {
					$scope.firstMeasureSecondFunctionError = "has-error";
					isFormValidated = false;
				} else if($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction.indexOf('count') == -1
					&& $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction != 'constant'
					&& (!$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].fieldId
							|| $scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].fieldId == "-1")) {
					$scope.firstMeasureSecondaryFieldError = "has-error";
					isFormValidated = false;
				} else if ($scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].aggFunction == 'constant'
					&& !$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[1].value) {
					$scope.firstMeasureSecondaryConstantError = "has-error";
					isFormValidated = false;
				}
			}

			if ($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1]
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].operator != 'none') {
				if(!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction) {
					$scope.secondMeasureSecondFunctionError = "has-error";
					isFormValidated = false;
				} else if($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction.indexOf('count') == -1
					&& $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction != 'constant'
					&& (!$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].fieldId
							|| $scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].fieldId == "-1")) {
					$scope.secondMeasureSecondaryFieldError = "has-error";
					isFormValidated = false;
				} else if ($scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].aggFunction == 'constant'
					&& !$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[1].value) {
					$scope.secondMeasureSecondaryConstantError = "has-error";
					isFormValidated = false;
				}
			}

			if($scope.widgetDataModel.dataModelId != $scope.secondaryDataModelId
					&& $scope.widgetCreationObj.chart.config.dimension[0].count != '-1'
					&& ($scope.dimensionSort[0] == '0-9' || $scope.dimensionSort[0] == '9-0')) {
				$scope.fasetMeargeByMeasureSortError = "has-error";
				isFormValidated = false;
			}

			if($scope.widgetCreationObj.chart.widgetDefId == 'StackedGroupBarChart'){

				if($scope.widgetDataModel.dataModelId != $scope.secondaryDataModelId
						&& ($scope.dimensionSort[1] == '0-9' || $scope.dimensionSort[1] == '9-0')) {
					$scope.colFasetMeargeByMeasureSortError = "has-error";
					isFormValidated = false;
				}
			}
		}

		if ($scope.widgetCreationObj.chart.widgetDefId == 'TimeSeries') {
			if ($scope.showRealTime
					&& !$scope.refreshInterval) {
				$scope.refreshIntervalError = "has-error";
				isFormValidated = false;
			}

			if (!$scope.widgetCreationObj.chart.config.scaleField[0].dataModelFieldId) {
				$scope.scaleFldError = "has-error";
				isFormValidated = false;
			}
		}

		// Scatter
		if ($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot"
				|| $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot"
				|| $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart"
				|| $scope.widgetCreationObj.chart.widgetDefId == "ScatterWithPicture") {
			var dimensions = $scope.widgetCreationObj.chart.config.dimension;
			var tooltip = $scope.widgetCreationObj.chart.config.tooltip;
			var lines = $scope.widgetCreationObj.chart.config.lines;

			// X-axis required check
			if (dimensions[0].dataModelFieldId == undefined || dimensions[0].dataModelFieldId == "") {
				$scope.xDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// Y-axis required check
			if (dimensions[1].dataModelFieldId == undefined || dimensions[1].dataModelFieldId == "") {
				$scope.yDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// series field required check
			if (dimensions[2].dataModelFieldId == undefined || dimensions[2].dataModelFieldId == "") {
				$scope.seriesFldReqError = "has-error";
				isFormValidated = false;
			}

			// series count required check
			if (dimensions[2].count == "" || dimensions[2].count == null) {
				$scope.seriesFldCountError = "has-error";
				isFormValidated = false;
			}

			// series Max elements per series required check
			if ($scope.widgetCreationObj.chart.config.dimension[2].maxPerItem == undefined
					|| $scope.widgetCreationObj.chart.config.dimension[2].maxPerItem == "") {
				$scope.seriesMaxElementsReqError = "has-error";
				isFormValidated = false;
			}

			// tooltip required check
			if (tooltip[0].dataModelFieldId == undefined || tooltip[0].dataModelFieldId == "") {
				$scope.tooltipReqError = "has-error";
				isFormValidated = false;
			}

			// tooltip duplicated check
			if( (tooltip[0].dataModelFieldId == dimensions[0].dataModelFieldId) || (tooltip[0].dataModelFieldId == dimensions[1].dataModelFieldId) ){
				$scope.duplicateTooltipFldError = "has-error";
				isFormValidated = false;
			}

//			// Vartical lines coordinate check
//			if ($scope.widgetCreationObj.chart.config.dimension[0].dataType == "number") {
//				for (var index = 0; index < lines.length; index++) {
//					if(lines[index].direction == "vertical"){
//						if (lines[index].firstX != undefined || lines[index].firstX!= "") {
//							var str = lines[index].firstX;
//							if(isNaN(str)){
//								$scope.linesCoordinateError = "has-error";
//								isFormValidated = false;
//							}
//						}
//					}
//				}
//			}else{
//				// date check
//				for (var index = 0; index < lines.length; index++) {
//					if(lines[index].direction == "vertical"){
//						if (lines[index].firstX == undefined) {
//							$scope.linesCoordinateDateFormatError = "has-error";
//							isFormValidated = false;
//						}
//					}
//				}
//			}
//
//			// Horizontal lines coordinate check
//			if ($scope.widgetCreationObj.chart.config.dimension[1].dataType == "number") {
//				// number check
//				for (var index = 0; index < lines.length; index++) {
//					if(lines[index].direction == "horizontal"){
//						if (lines[index].firstY != undefined || lines[index].firstY != "") {
//							var str = lines[index].firstY;
//							if(isNaN(str) || str==null){
//								$scope.linesCoordinateError = "has-error";
//								isFormValidated = false;
//							}
//						}
//					}
//				}
//			}else{
//				// date check
//				for (var index = 0; index < lines.length; index++) {
//					if(lines[index].direction == "horizontal"){
//						if (lines[index].firstY == undefined) {
//							$scope.linesCoordinateDateFormatError = "has-error";
//							isFormValidated = false;
//						}
//					}
//				}
//			}

			if ($scope.widgetCreationObj.chart.config.bgpicture != null
					&& ($scope.widgetCreationObj.chart.config.bgpicture[0].dataModelFieldId == null
					|| $scope.widgetCreationObj.chart.config.bgpicture[0].dataModelFieldId == "")) {
				$scope.dimFldError = "has-error";
				isFormValidated = false;
			}
		}

		if ($scope.widgetCreationObj.chart.widgetDefId == "ScatterWithPicture") {
			if ($scope.widgetCreationObj.chart.config.bgpicture[0].dataModelFieldId == null
					|| $scope.widgetCreationObj.chart.config.bgpicture[0].dataModelFieldId == "" ) {
				$scope.bgpictureError = "has-error";
				isFormValidated = false;
			}
		}
		// Scatter

		//2019.06.05 ADD START HUY-DHK
		// VN:	BubbleChart
		if($scope.widgetCreationObj.chart.widgetDefId == "BubbleChart"){
			var dimensions = $scope.widgetCreationObj.chart.config.dimension;
			var tooltip = $scope.widgetCreationObj.chart.config.tooltip;
			var lines = $scope.widgetCreationObj.chart.config.lines;
			
			// X-axis required check
			if (dimensions[0].dataModelFieldId == undefined || dimensions[0].dataModelFieldId == "") {
				$scope.xDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// Y-axis required check
			if (dimensions[1].dataModelFieldId == undefined || dimensions[1].dataModelFieldId == "") {
				$scope.yDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// Z-axis required check
			if (dimensions[2].dataModelFieldId == undefined || dimensions[2].dataModelFieldId == "") {
				$scope.zDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// series field required check
			if (dimensions[3].dataModelFieldId == undefined || dimensions[3].dataModelFieldId == "") {
				$scope.seriesFldReqError = "has-error";
				isFormValidated = false;
			}

			// series count required check
			if (dimensions[3].count == "" || dimensions[3].count == null) {
				$scope.seriesFldCountError = "has-error";
				isFormValidated = false;
			}

			// series Max elements per series required check
			if ($scope.widgetCreationObj.chart.config.dimension[3].maxPerItem == undefined
					|| $scope.widgetCreationObj.chart.config.dimension[3].maxPerItem == "") {
				$scope.seriesMaxElementsReqError = "has-error";
				isFormValidated = false;
			}

			// tooltip required check
			if (tooltip[0].dataModelFieldId == undefined || tooltip[0].dataModelFieldId == "") {
				$scope.tooltipReqError = "has-error";
				isFormValidated = false;
			}

			// tooltip duplicated check
			if( (tooltip[0].dataModelFieldId == dimensions[0].dataModelFieldId) || (tooltip[0].dataModelFieldId == dimensions[1].dataModelFieldId) ){
				$scope.duplicateTooltipFldError = "has-error";
				isFormValidated = false;
			}

			if ($scope.widgetCreationObj.chart.config.bgpicture != null
				&& ($scope.widgetCreationObj.chart.config.bgpicture[0].dataModelFieldId == null
					|| $scope.widgetCreationObj.chart.config.bgpicture[0].dataModelFieldId == "")) {
				$scope.dimFldError = "has-error";
				isFormValidated = false;
			}
		}
		//2019.06.05 ADD START END

		// Binning
		if ($scope.widgetCreationObj.chart.widgetDefId.indexOf("Histogram") != -1) {
			if ($scope.showBiningSetting) {
				var divices = $scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides;
				$scope.biningErrListStart = [];
				$scope.biningErrListEnd = [];
				$scope.biningErrListName = [];

				if(divices.length > 0) {
					for(var i = 0; i < divices.length; i++) {
						var start = divices[i].start;
						var end =  divices[i].end;

						$scope.biningErrListStart.push("");
						$scope.biningErrListEnd.push("");
						$scope.biningErrListName.push("");

						if((start.length == 0) && (end.length == 0)) {
							$scope.biningerrnospace = "has-error";
							$scope.biningErrListStart[i] = "has-error";
							$scope.biningErrListEnd[i] = "has-error";
							isFormValidated = false;
							break;
						}

						if((start.length > 0) && (IsNumber(start) != true)) {
							$scope.biningerrnomunber = "has-error";
							$scope.biningErrListStart[i] = "has-error";
							isFormValidated = false;
							break;
						}
						if((end.length > 0) && (IsNumber(end) != true)) {
							$scope.biningerrnomunber = "has-error";
							$scope.biningErrListEnd[i] = "has-error";
							isFormValidated = false;
							break;
						}
						if((start.length > 0) && (end.length > 0) && (parseFloat(start) > parseFloat(end))) {
							$scope.biningerrmaxmin = "has-error";
							$scope.biningErrListStart[i] = "has-error";
							$scope.biningErrListEnd[i] = "has-error";
							isFormValidated = false;
							break;
						}
						if((start.length > 0) && (end.length > 0) && (parseFloat(start) == parseFloat(end))) {
							$scope.biningerrsamevalue = "has-error";
							$scope.biningErrListStart[i] = "has-error";
							$scope.biningErrListEnd[i] = "has-error";
							isFormValidated = false;
							break;
						}

						if(divices[i].displayName.length == 0) {
							divices[i].displayName = createNewBiningDisplayName(divices[i]);
						}
						else if(divices[i].displayName.length > 19) {
							$scope.biningerrtoolonglabel = "has-error";
							$scope.biningErrListName[i] = "has-error";
							isFormValidated = false;
							break;
						}

						//表示ラベルの一意チェック
						for(var j=0;j < divices.length;j++) {
							if(i == j)
								continue;
							if(divices[i].displayName == divices[j].displayName) {
								$scope.biningerrduplicatelabel = "has-error";
								$scope.biningErrListName[i] = "has-error";
								isFormValidated = false;
								break;
							}
						}
					}
				}
			}
		}
		// Binning

		// add for sampleLineChart by M.Ikeuchi 2017.07.24
		// 07.09以前(計算パラメータ＋フィールドIDだけ)
//		if ($scope.widgetCreationObj.chart.widgetDefId == 'SampleLineChart') {
//			var facetMergeConf = $scope.widgetCreationObj.chart.facetMergeConfig;
//
//			for (var i = 0; i < facetMergeConf.length; i++) {
//
//				if ((!facetMergeConf[i].fields[0].aggFunction )
//					&& (!facetMergeConf[i].fields[0].fieldId
//						|| facetMergeConf[i].fields[0].fieldId == "-1")){
//					$scope.measure_FunctionError[i] = "";
//					$scope.widgetCreationObj.chart.config.lineParam[i] = "";
//				}else{
//					if (!facetMergeConf[i].fields[0].aggFunction ) {
//						$scope.measure_FunctionError[i] = "has-error";
//						isFormValidated = false;
//					} else if(facetMergeConf[i].fields[0].aggFunction != 'count'
//						&& (!facetMergeConf[i].fields[0].fieldId
//							|| facetMergeConf[i].fields[0].fieldId == "-1")) {
//						$scope.measure_FldError[i] = "has-error";
//						isFormValidated = false;
//					}
//				}
//				// Binning
//				if($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == facetMergeConf[i].fields[0].fieldId) {
//					$scope.measure_FldError[i] = "has-error";
//					isFormValidated = false;
//				// Binning
//				}
//			}
//		}
		// 07.09改良(計算パラメータ＋フィールドID＋LineParamの組み合わせ確認)

		if ($scope.widgetCreationObj.chart.widgetDefId == 'SampleLineChart') {
			var facetMergeConf = $scope.widgetCreationObj.chart.facetMergeConfig;

			for (var i = 0; i < facetMergeConf.length; i++) {

				if
				// 計算パラメータ＋フィールドID＋LineParamがすべてNULLの時はエラーではない
					(( facetMergeConf[i].fields[0].aggFunction == undefined || facetMergeConf[i].fields[0].aggFunction == ""|| facetMergeConf[i].fields[0].aggFunction == null) &&
					 ( facetMergeConf[i].fields[0].fieldId == undefined || facetMergeConf[i].fields[0].fieldId == ""|| facetMergeConf[i].fields[0].fieldId == null) &&
					 ( $scope.widgetCreationObj.chart.config.lineParam[i] == undefined || $scope.widgetCreationObj.chart.config.lineParam[i].lineType == ""|| $scope.widgetCreationObj.chart.config.lineParam[i].lineType == null)){
						$scope.measure_FunctionError[i] = "";
						$scope.measure_FldError[i] = "";
						$scope.htmlTags_InXFldNameError[i] = "";
						$scope.measure_lineparamError[i] = "";

				}else if
				//計算パラメータ＋フィールドID＋LineParamがすべてNULLでないのが正常
					(( facetMergeConf[i].fields[0].aggFunction != undefined && facetMergeConf[i].fields[0].aggFunction != "")  &&
				     ( facetMergeConf[i].fields[0].fieldId != undefined && facetMergeConf[i].fields[0].fieldId != "" && facetMergeConf[i].fields[0].fieldId != "-1" ) &&
					 ( $scope.widgetCreationObj.chart.config.lineParam[i] != undefined && $scope.widgetCreationObj.chart.config.lineParam[i].lineType != undefined && $scope.widgetCreationObj.chart.config.lineParam[i].lineType != "")){
						$scope.measure_FunctionError[i] = "";
						$scope.measure_FldError[i] = "";
						$scope.htmlTags_InXFldNameError[i] = "";
						$scope.measure_lineparamError[i] = "";

				}else if
				// 計算パラメータ=Count ＋フィールドID="-1" の時はエラーではない
					( facetMergeConf[i].fields[0].aggFunction == 'count' &&
					  facetMergeConf[i].fields[0].fieldId == "-1" ){
						$scope.measure_FunctionError[i] = "";
						$scope.measure_FldError[i] = "";
						$scope.htmlTags_InXFldNameError[i] = "";
						$scope.measure_lineparamError[i] = "";
						$scope.widgetCreationObj.chart.config.lineParam[i].lineType = "";
				// 上記のいずれでもないものはエラー
				}else{
					// 計算パラメータが未定義
					if ( facetMergeConf[i].fields[0].aggFunction == undefined || facetMergeConf[i].fields[0].aggFunction == ""|| facetMergeConf[i].fields[0].aggFunction == null) {
							$scope.measure_FunctionError[i] = "has-error";
							isFormValidated = false;
					} else if
					// フィールドIDが未定義
						(!facetMergeConf[i].fields[0].fieldId == undefined || facetMergeConf[i].fields[0].fieldId == "" || facetMergeConf[i].fields[0].fieldId == null ||
							(facetMergeConf[i].fields[0].aggFunction != 'count' && facetMergeConf[i].fields[0].fieldId == "-1") ) {

							$scope.measure_FldError[i] = "has-error";
							isFormValidated = false;
					} else if
					// データ線種別が未定義
						($scope.widgetCreationObj.chart.config.lineParam[i] == undefined || $scope.widgetCreationObj.chart.config.lineParam[i].lineType == ""　|| $scope.widgetCreationObj.chart.config.lineParam[i].lineType == null){
							$scope.measure_lineparamError[i] = "has-error";
							isFormValidated = false;
					} else if
					// 表示名称のHTMLチェックエラー
						(HTMLVALIDATEREGEX.test(angular.lowercase( facetMergeConf[i].display))) {
						$scope.htmlTags_InXFldNameError[i] = "has-error";
						isFormValidated = false;
					}
				}

				// Binning
				if($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == facetMergeConf[i].fields[0].fieldId) {
					$scope.measure_FldError[i] = "has-error";
					isFormValidated = false;
				// Binning
				}
			}
		}
		// add end for sampleLineChart

		// 管理線のチェック
		if( _.contains(hasControlLineWidgets, $scope.widgetCreationObj.chart.widgetDefId) ){
			if($scope.widgetCreationObj.chart.config.lines != undefined
					&& $scope.widgetCreationObj.chart.config.lines[0] != undefined
					&& !($scope.widgetCreationObj.chart.config.lines.length == 1 && $scope.widgetCreationObj.chart.config.lines[0].direction == "none") )
			{
				var lines = $scope.widgetCreationObj.chart.config.lines;

				for (var i = 0; i < lines.length; i++) {

					if(lines[i].direction == "none"){

						$scope.drawLineDirectionError[i] = "has-error";
						isFormValidated = false;

					}else{

						if(lines[i].width == undefined || lines[i].width == ""){
							$scope.drawLineWidthError[i] = "has-error";
							isFormValidated = false;
						}

						if(lines[i].direction == "vertical"){
							if( $scope.widgetCreationObj.chart.config.dimension[0].dataType == "text" ){

								$scope.drawLineTypeError[i] = "has-error";
								isFormValidated = false;
							}else{

								if(lines[i].firstX == undefined || lines[i].firstX == ""){
									$scope.drawLineFirstXError[i] = "has-error";
									isFormValidated = false;
								}
							}
						}else if(lines[i].direction == "horizontal"){

							if(lines[i].firstY == undefined || lines[i].firstY == ""){
								$scope.drawLineFirstYError[i] = "has-error";
								isFormValidated = false;
							}
						}
					}
				}
			}
		}

		// WeibullChart
		if($scope.widgetCreationObj.chart.widgetDefId == "WeibullChart"){

			// X-axis required check
			if ( !$scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId ) {
				$scope.xDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// Y-axis required check
			if ( !$scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId ) {
				$scope.yDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// duplicate check
			if (isFormValidated && $scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == $scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId) {
				$scope.duplicateDimFldNameError = "has-error";
				isFormValidated = false;
			}

			// Constant Value required check
			if( !$scope.widgetCreationObj.chart.config.exParam[0].constantValue ) {
				$scope.constantValueReqError = "has-error";
				isFormValidated = false;
			}else{
				var constantValue = $scope.widgetCreationObj.chart.config.exParam[0].constantValue ;
				if((constantValue.length > 0) && (IsNumber(constantValue) != true)) {
					$scope.constantValueNumError = "has-error";
					isFormValidated = false;
				}else if( !Number.isInteger( Number(constantValue) ) || Number(constantValue) < 1 ){
					$scope.constantValueNumError = "has-error";
					isFormValidated = false;
				}
			}
		}
		// WeibullChart

		// GaussianChart
		if($scope.widgetCreationObj.chart.widgetDefId == "GaussianChart"){

			// X-axis required check
			if ( !$scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId ) {
				$scope.xDimFldReqError = "has-error";
				isFormValidated = false;
			}

			// 表示最小値チェック
			var min = $scope.widgetCreationObj.chart.config.exParam[2].xAxisViewMin;
			if(min){
				if((min.length > 0) && (IsNumber(min) != true)) {
					$scope.primaryMeasureMinError = "has-error";
					isFormValidated = false;
				}else if( !Number.isInteger( Number(min) ) || Number(min) < 1 ){
					$scope.primaryMeasureMinError = "has-error";
					isFormValidated = false;
				}
			}

			// 表示最大値チェック
			var max = $scope.widgetCreationObj.chart.config.exParam[2].xAxisViewMax;
			if(max){
				if((max.length > 0) && (IsNumber(max) != true)) {
					$scope.primaryMeasureMaxError = "has-error";
					isFormValidated = false;
				}else if( !Number.isInteger( Number(max) ) || Number(max) < 1 ){
					$scope.primaryMeasureMaxError = "has-error";
					isFormValidated = false;
				}
			}

			// Sigma Level required check
			if( !$scope.widgetCreationObj.chart.config.exParam[0].sigmaLevel ) {
				$scope.constantValueReqError = "has-error";
				isFormValidated = false;
			}else{
				var constantValue = $scope.widgetCreationObj.chart.config.exParam[0].sigmaLevel;
				if((constantValue.length > 0) && (IsNumber(constantValue) != true)) {
					$scope.constantValueNumError = "has-error";
					isFormValidated = false;
//				}else if( !Number.isInteger( Number(constantValue) ) || Number(constantValue) < 1 ){
				}else if( Number(constantValue) < 1 ){
					$scope.constantValueNumError = "has-error";
					isFormValidated = false;
				}
			}

			// Binning Count required check
			if( !$scope.widgetCreationObj.chart.config.exParam[1].binningCount ) {
//				$scope.constantValue2ReqError = "has-error";
//				isFormValidated = false;
				// 任意設定項目に変更
			}else{
				var constantValue = $scope.widgetCreationObj.chart.config.exParam[1].binningCount;
				if((constantValue.length > 0) && (IsNumber(constantValue) != true)) {
					$scope.constantValue2NumError = "has-error";
					isFormValidated = false;
				}else if( !Number.isInteger( Number(constantValue) ) || Number(constantValue) < 1 ){
					$scope.constantValue2NumError = "has-error";
					isFormValidated = false;
				}
			}

			// Upper Specification Limit required check
			var uslValue = $scope.widgetCreationObj.chart.config.exParam[3].usl;
			if(uslValue){
				if( uslValue.length < 1 ) {
					$scope.constantValue3UpperReqError = "has-error";
					isFormValidated = false;
				}else if( (IsNumber(uslValue) != true) || Number(uslValue) < 1 ){
					$scope.constantValue3UpperNumError = "has-error";
					isFormValidated = false;
				}
			}else{
				$scope.constantValue3UpperReqError = "has-error";
				isFormValidated = false;
			}

			// Lower Specification Limit required check
			var lslValue = $scope.widgetCreationObj.chart.config.exParam[3].lsl;
			if(lslValue){
				if( lslValue.length < 1 ) {
					$scope.constantValue3LowerReqError = "has-error";
					isFormValidated = false;
				}else if( (IsNumber(lslValue) != true) || Number(lslValue) < 1 ){
					$scope.constantValue3LowerNumError = "has-error";
					isFormValidated = false;
				}
			}else{
				$scope.constantValue3LowerReqError = "has-error";
				isFormValidated = false;
			}

			if($scope.constantValue3UpperReqError != "has-error" && $scope.constantValue3LowerReqError != "has-error"
					&& $scope.constantValue3UpperNumError != "has-error" && $scope.constantValue3LowerNumError != "has-error"
					&& Number(lslValue) >= Number(uslValue) )
			{
				$scope.constantValue3NumError = "has-error";
				isFormValidated = false;
			}
		}
		// GaussianChart

		// TableForSS
		if($scope.widgetCreationObj.chart.widgetDefId == "TableForSS" || $scope.widgetCreationObj.chart.widgetDefId == "VerticalTableForSS"){

			//// 必須チェック
			// 個人特定用フィールドチェック
			if ( !$scope.widgetCreationObj.chart.config.idField[0].dataModelFieldId ) {
				$scope.dsrError.id = "has-error";
				isFormValidated = false;
			}

			// 個人特定用-最大表示行数
			if ( $scope.widgetCreationObj.chart.config.idField[0].maxCount && $scope.widgetCreationObj.chart.config.idField[0].maxCount != ''　) {

				var maxCount = $scope.widgetCreationObj.chart.config.idField[0].maxCount;

				if((maxCount.length > 0) && (IsNumber(maxCount) != true)) {
					$scope.dsrError.id_maxCount = "has-error";
					isFormValidated = false;
				}else if( !Number.isInteger( Number(maxCount) ) || Number(maxCount) < 1 ){
					$scope.dsrError.id_maxCount = "has-error";
					isFormValidated = false;
				}
			}

			// 項目用フィールドチェック
			if ( !$scope.widgetCreationObj.chart.config.columnField[0].dataModelFieldId ) {
				$scope.dsrError.column = "has-error";
				isFormValidated = false;
			}

			// 個人用設定（1件以上)
			if ( !$scope.widgetCreationObj.chart.config.rowFields || $scope.widgetCreationObj.chart.config.rowFields.length < 1 ) {
				$scope.dsrError.row = "has-error";
				isFormValidated = false;
			}

			// 個人用設定-表示名チェック
			if ( $scope.widgetCreationObj.chart.config.rowFields && $scope.widgetCreationObj.chart.config.rowFields.length > 0 ) {

				_.each($scope.widgetCreationObj.chart.config.rowFields,function(obj,i){
					if(!obj.dispLabel || obj.dispLabel == ''){
						if(!$scope.dsrError.row_display) $scope.dsrError.row_display = [];
						$scope.dsrError.row_display[i] = "has-error";
						isFormValidated = false;
					}
				});
			}

			// 集計用設定-計算式チェック
			if (!$scope.widgetCreationObj.chart.config.measure[0].aggFunction) {
				$scope.measureFunctionError = "has-error";
				isFormValidated = false;

			// 集計用設定-フィールドチェック
			}else if($scope.widgetCreationObj.chart.config.measure[0].aggFunction != 'count'
				&& (!$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId || $scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId == "-1")) {
				$scope.measureFldError = "has-error";
				isFormValidated = false;
			}

			// 集計用設定-表示名チェック
			if (!$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal || $scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal=='' ) {
				$scope.measureDispValError = "has-error";
				isFormValidated = false;
			}

			// 集計用設定-小数部桁数チェック
			if ( $scope.widgetCreationObj.chart.config.measure[0].decimalPlaces && $scope.widgetCreationObj.chart.config.measure[0].decimalPlaces != ''　) {

				var decimalPlaces = $scope.widgetCreationObj.chart.config.measure[0].decimalPlaces;

				if((decimalPlaces.length > 0) && (IsNumber(decimalPlaces) != true)) {
					$scope.measureDecimalPlacesError = "has-error";
					isFormValidated = false;
				}else if( !Number.isInteger( Number(decimalPlaces) ) || Number(decimalPlaces) < 0 ){
					$scope.measureDecimalPlacesError = "has-error";
					isFormValidated = false;
				}

				// 集計用設定-端数処理チェック
				if( !$scope.widgetCreationObj.chart.config.measure[0].roundProc || $scope.widgetCreationObj.chart.config.measure[0].roundProc == ''){
					$scope.measureRoundProcError = "has-error";
					isFormValidated = false;
				}

			}else{
				// 小数部桁数が設定されていない場合は、端数処理に空を設定
				$scope.widgetCreationObj.chart.config.measure[0].roundProc = '';
			}

			if($scope.htmlTagsInXFldNameError){
				$scope.htmlTagsInMesureNameError = "has-error";
			}
		}
		// TableForSS

		// HeatMapWithImage
		if($scope.widgetCreationObj.chart.widgetDefId == "HeatMapWithImage"){

			// Y軸開始位置の値チェックk
			var val = $scope.widgetCreationObj.chart.config.exParam[0].yAxisMin;
			// 必須チェック
			if ( !val && val != 0 ) {
				$scope.yAxisMinReqError = "has-error";
				isFormValidated = false;
			}else{
				// 数値妥当性チェック
				if( !Number.isInteger( val ) || val < 0){
					$scope.yAxisMinNumError = "has-error";
					isFormValidated = false;
				}
			}

			// Y軸終了位置の値チェック
			val = $scope.widgetCreationObj.chart.config.exParam[0].yAxisMax;
			// 必須チェック
			if ( !val && val != 0 ) {
				$scope.yAxisMaxReqError = "has-error";
				isFormValidated = false;
			}else{
				// 数値妥当性チェック

				if( !Number.isInteger( val ) || val < 0){
					$scope.yAxisMaxNumError = "has-error";
					isFormValidated = false;
				}
			}

			// X軸開始位置の値チェック
			val = $scope.widgetCreationObj.chart.config.exParam[0].xAxisMin;
			if ( !val && val != 0 ) {
				$scope.xAxisMinReqError = "has-error";
				isFormValidated = false;
			}else{
				// 数値妥当性チェック
				if( !Number.isInteger( val ) || val < 0){
					$scope.xAxisMinNumError = "has-error";
					isFormValidated = false;
				}
			}

			// X軸終了位置の値チェック
			val = $scope.widgetCreationObj.chart.config.exParam[0].xAxisMax;
			if ( !val && val != 0 ) {
				$scope.xAxisMaxReqError = "has-error";
				isFormValidated = false;
			}else{
				// 数値妥当性チェック
				if( !Number.isInteger( val ) || val < 0){
					$scope.xAxisMaxNumError = "has-error";
					isFormValidated = false;
				}
			}
		}
		
		/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
		if($scope.widgetCreationObj.chart.widgetDefId == 'ResultAndRateChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'MovingAverageChart'
			|| $scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart'){
			// Check input and push error into...
			/*
				$scope.facetMergeConfig_FunctionError = [];
				$scope.facetMergeConfig_FldError = [];
				$scope.facetMergeConfig_HtmlTagsError = [];
				$scope.facetMergeConfig_LineTypeError = [];
				$scope.facetMergeConfig_YAxisError = [];
				$scope.facetMergeConfig_AverageNumberDigitsError = [];
				
				$scope.yAsisSettingConfig_HtmlTagsError = [];
				$scope.yAsisSettingConfig_MinError = [];
				$scope.yAsisSettingConfig_MaxError = [];
				
				$scope.dimension_dataModelSelectionError = [];
				$scope.facetMergeConfig_dataModelSelectionError = [];
			 */
			
			if($scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart') {
				// extraConfigDimensions
				var extraConfigDimensions = $scope.widgetCreationObj.chart.config.extraConfigDimensions;

				for (var i = 0; i < extraConfigDimensions.length; i++) {
					if ( extraConfigDimensions[i].dataModelId == undefined || extraConfigDimensions[i].dataModelId == ""|| extraConfigDimensions[i].dataModelId == null) {
						$scope.dimension_dataModelSelectionError[i] = "has-error";
						isFormValidated = false;
					} else {
						$scope.dimension_dataModelSelectionError[i] = "";
					}
				}
			}
			
			var facetMergeConf = $scope.widgetCreationObj.chart.facetMergeConfig;

			for (var i = 0; i < facetMergeConf.length; i++) {
				// 計算パラメータが未定義
				if ( facetMergeConf[i].fields[0].aggFunction == undefined || facetMergeConf[i].fields[0].aggFunction == ""|| facetMergeConf[i].fields[0].aggFunction == null) {
						$scope.facetMergeConfig_FunctionError[i] = "has-error";
						isFormValidated = false;
				} else if
				// フィールドIDが未定義
					(!facetMergeConf[i].fields[0].fieldId == undefined || facetMergeConf[i].fields[0].fieldId == "" || facetMergeConf[i].fields[0].fieldId == null ||
						(facetMergeConf[i].fields[0].aggFunction != 'count' && facetMergeConf[i].fields[0].fieldId == "-1") ) {

						$scope.facetMergeConfig_FldError[i] = "has-error";
						isFormValidated = false;
				} else if
				// 表示名称のHTMLチェックエラー
					(HTMLVALIDATEREGEX.test(angular.lowercase( facetMergeConf[i].display))) {
					$scope.facetMergeConfig_HtmlTagsError[i] = "has-error";
					isFormValidated = false;
				} else {
					$scope.facetMergeConfig_FunctionError[i] = "";
					$scope.facetMergeConfig_FldError[i] = "";
					$scope.facetMergeConfig_HtmlTagsError[i] = "";
				}

				// Binning
				if($scope.widgetCreationObj.chart.config.dimension[0].dataModelFieldId == facetMergeConf[i].fields[0].fieldId) {
					$scope.measure_FldError[i] = "has-error";
					isFormValidated = false;
				// Binning
				}
			}
			
			// extraConfigFields
			var extraConfigFields = $scope.widgetCreationObj.chart.config.extraConfigFields;

			for (var i = 0; i < extraConfigFields.length; i++) {
				
				if($scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart') {
					if ( extraConfigFields[i].dataModelId == undefined || extraConfigFields[i].dataModelId == ""|| extraConfigFields[i].dataModelId == null) {
						$scope.facetMergeConfig_dataModelSelectionError[i] = "has-error";
						isFormValidated = false;
					} else {
						$scope.facetMergeConfig_dataModelSelectionError[i] = "";
					}
				}
				
				if ( extraConfigFields[i].lineType == undefined || extraConfigFields[i].lineType == ""|| extraConfigFields[i].lineType == null) {
					$scope.facetMergeConfig_LineTypeError[i] = "has-error";
					isFormValidated = false;
				} else {
					$scope.facetMergeConfig_LineTypeError[i] = "";
				}
				if ( extraConfigFields[i].yAxis === undefined || extraConfigFields[i].yAxis === ""|| extraConfigFields[i].yAxis === null) {
					$scope.facetMergeConfig_YAxisError[i] = "has-error";
					isFormValidated = false;
				} else {
					$scope.facetMergeConfig_YAxisError[i] = "";
				}
				
				if($scope.widgetCreationObj.chart.widgetDefId == 'MovingAverageChart') {
					if ( extraConfigFields[i].averageNumberDigits === undefined 
							|| extraConfigFields[i].averageNumberDigits === ""
							|| extraConfigFields[i].averageNumberDigits === null 
							|| Number(extraConfigFields[i].averageNumberDigits) <= 0) {
						$scope.facetMergeConfig_AverageNumberDigitsError[i] = "has-error";
						isFormValidated = false;
					} else {
						$scope.facetMergeConfig_AverageNumberDigitsError[i] = "";
					}
				}
			}
			
			// extraConfigYAxis
			var extraConfigYAxis = $scope.widgetCreationObj.chart.config.extraConfigYAxis;
			
			for (var i = 0; i < extraConfigYAxis.length; i++) {
				if ( extraConfigYAxis[i].dataModelDispVal == undefined || extraConfigYAxis[i].dataModelDispVal == ""|| extraConfigYAxis[i].dataModelDispVal == null) {
					// Nothing
				}
				else if (HTMLVALIDATEREGEX.test(angular.lowercase( extraConfigYAxis[i].dataModelDispVal))) {
					$scope.yAsisSettingConfig_HtmlTagsError[i] = "has-error";
					isFormValidated = false;
				}
				else {
					$scope.yAsisSettingConfig_HtmlTagsError[i] = "";
				}
				
				var min = extraConfigYAxis[i].minCount;
				var max = extraConfigYAxis[i].maxCount;


				if( !(isNaN(min)) && !(isNaN(max)) ){
					if( eval(min) > eval(max)) {
						$scope.yAsisSettingConfig_MinError[i] = "has-error";
						$scope.yAsisSettingConfig_MaxError[i] = "has-error";
						isFormValidated = false;
					}
				}else{
					if (min != undefined && isNaN(min)) {
						$scope.yAsisSettingConfig_MinError[i] = "has-error";
						isFormValidated = false;
					}

					if (max != undefined && isNaN(max)) {
						$scope.yAsisSettingConfig_MaxError[i] = "has-error";
						isFormValidated = false;
					}
				}
				
			}

		}
		/* 2019.06.05 ADD END  */

		return isFormValidated;
	}

	// Binning
	var createNewBiningDisplayName = function(divice) {
		var start = divice.start;
		var end = divice.end;
		var displayName = divice.displayName;
		if(displayName.length > 0)
			return;
		var displayName = start + " - " + end;
		return displayName;
	}

	var IsNumber = function(numStr)
	{
		var pattern = /^[+,-]?([1-9]\d*|0)(\.\d+)?$/;
		return pattern.test(numStr);
	}
	// Binning

	$scope.saveWidgetCreation = function(event) {
		event.preventDefault();

		if (!widgetCreationFormValidated())
			return false;

		if (!$scope.showDescription)
			$scope.widgetCreationObj.chart.widgetDescription = "";

		$scope.dataChainSettingChanges();


		if ($scope.widgetCreationObj.chart.widgetDefId.indexOf('Histogram') >= 0){
			if(!$scope.showBiningSetting) //範囲データ設定が表示されていなければクリアする On/OFFの切替とする EAGLE-2661
				$scope.widgetCreationObj.chart.config.frmBiningInfo[0].divides = [{start:'', end:'', displayName:'' }];
		}
		
		// samplelinechartの時は使用しないで、別の処理に変更　2017.07.24 by M.Ikeuchi
//		facetMergeSettingChanges();
		if ($scope.widgetCreationObj.chart.widgetDefId == 'SampleLineChart'){
			multiFacetSettingChanges();
		}
		/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
		else if ($scope.widgetCreationObj.chart.widgetDefId == 'ResultAndRateChart'
				|| $scope.widgetCreationObj.chart.widgetDefId == 'MovingAverageChart'){
			multiFacetSettingChanges();
		}
		/* 2019.06.05 ADD END */
		/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
		else if ($scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart'){
			multiFacetSettingChangesForCustomDataModel();
		}
		/* 2019.06.05 ADD END */
		else{
			facetMergeSettingChanges();
		}
		// samplelinechartの時は使用しないで、別の処理に変更　2017.07.24 by M.Ikeuchi

		timeSeriesSettingChanges();

		realTimeSettingChanges();

		if (!$scope.showHierarchy) {
			if( !$scope.isPreviewChart ){
				delete $scope.widgetCreationObj.chart.dimensionHierarchy;
			}
		} else {
			$scope.widgetCreationObj.chart.dimensionHierarchy['0'][0]  = angular.copy($scope.widgetCreationObj.chart.config.dimension[0]);

			for (var i in $scope.widgetCreationObj.chart.dimensionHierarchy['0']) {
				if (i > 0) {
					$scope.widgetCreationObj.chart.dimensionHierarchy['0'][i].count = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].count);
					$scope.widgetCreationObj.chart.dimensionHierarchy['0'][i].fieldDefaultAction = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].fieldDefaultAction);
					$scope.widgetCreationObj.chart.dimensionHierarchy['0'][i].targetPage = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].targetPage);
					$scope.widgetCreationObj.chart.dimensionHierarchy['0'][i].targetDMId = angular.copy($scope.widgetCreationObj.chart.config.dimension[0].targetDMId);
				}
			}
		}

		// EAGLE-2502, EAGLE-2503
		if($scope.widgetCreationObj.chart.widgetDefId == 'DocumentSearchResult' && !$scope.showHighlightConfig){
			delete $scope.widgetCreationObj.chart.config.documentSearch.highlightField;
			delete $scope.widgetCreationObj.chart.config.documentSearch.uniqueField;
		}
		// EAGLE-2502, EAGLE-2503

		// Measureが未設定だった場合の考慮
		// sampleLineChartの処理を加える　2017.07.24 by M.ikeuchi

//		if($scope.widgetCreationObj.chart.facetMergeConfig != undefined){
//			var tmpFacetMergeConfig = [];
//			for (var ii in $scope.widgetCreationObj.chart.facetMergeConfig) {
//				if($scope.widgetCreationObj.chart.facetMergeConfig[ii].fields[0].aggFunction != undefined){
//					tmpFacetMergeConfig.push($scope.widgetCreationObj.chart.facetMergeConfig[ii]);
//				}
//			}
//			$scope.widgetCreationObj.chart.facetMergeConfig = tmpFacetMergeConfig;
//		}

		if($scope.widgetCreationObj.chart.facetMergeConfig != undefined){
			if ($scope.widgetCreationObj.chart.widgetDefId == 'SampleLineChart'){
				var tmpFacetMergeConfig = [];
				var tmpLineParam = [];
				for (var ii in $scope.widgetCreationObj.chart.facetMergeConfig) {
					if(ii == 0)
						$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal = $scope.widgetCreationObj.chart.facetMergeConfig[ii].display;

					if(($scope.widgetCreationObj.chart.facetMergeConfig[ii].fields[0].aggFunction != undefined) &&
						($scope.widgetCreationObj.chart.facetMergeConfig[ii].fields[0].aggFunction !== "")) {
						tmpFacetMergeConfig.push($scope.widgetCreationObj.chart.facetMergeConfig[ii]);
						if ( $scope.widgetCreationObj.chart.config.lineParam[ii] !== "" ){
							tmpLineParam.push($scope.widgetCreationObj.chart.config.lineParam[ii]);
						}else{
							tmpLineParam.push({'lineType' : ""});
						}
					}
				}
				$scope.widgetCreationObj.chart.facetMergeConfig = tmpFacetMergeConfig;
				$scope.widgetCreationObj.chart.config.lineParam = tmpLineParam;
			}else{
				var tmpFacetMergeConfig = [];
				for (var ii in $scope.widgetCreationObj.chart.facetMergeConfig) {
					if($scope.widgetCreationObj.chart.facetMergeConfig[ii].fields[0].aggFunction != undefined){
						tmpFacetMergeConfig.push($scope.widgetCreationObj.chart.facetMergeConfig[ii]);
					}
				}
				$scope.widgetCreationObj.chart.facetMergeConfig = tmpFacetMergeConfig;
			}
		}
		// sampleLineChartの処理を加える　2017.07.24 by M.ikeuchi

		// 散布図等でソートが設定されないことの考慮 (他のチャートに変更した場合にエラーが発生する可能性があるため)
		//2019.06.05 UPD START HUY-DHK add BubbleChart
		//if(
		//	($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart" || $scope.widgetCreationObj.chart.widgetDefId == "GaussianChart")
		//	&&$scope.widgetCreationObj.chart.config.dimensionSort.length ==0
		//){
	
		if(
			($scope.widgetCreationObj.chart.widgetDefId == "ScatterPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterPlotWithPlot" || $scope.widgetCreationObj.chart.widgetDefId == "ScatterEllipseChart" || $scope.widgetCreationObj.chart.widgetDefId == "GaussianChart" || $scope.widgetCreationObj.chart.widgetDefId == "BubbleChart" )
			&&$scope.widgetCreationObj.chart.config.dimensionSort.length ==0
		){
		//2019.06.05 UPD END

			for(var i = 0; i < 2; i++) {

				if($scope.widgetCreationObj.chart.widgetDefId == "GaussianChart" && i > 0) break;

				$scope.widgetCreationObj.chart.config.dimensionSort[i] = {
					'sortFieldId'	: null,
					'sortBy'		: null,
					'sortOrder'		: null
				};
			}
		}

		// 管理線を設定できないWidgetの管理線設定値を削除する
		if( false == _.contains(hasControlLineWidgets, $scope.widgetCreationObj.chart.widgetDefId) ){
			if( $scope.widgetCreationObj.chart.config.lines != undefined ) delete $scope.widgetCreationObj.chart.config.lines;
		}

		// 管理線設定値をStringに変換する（Javaサービスで取得する為の考慮）
		if($scope.widgetCreationObj.chart.widgetDefId == "GaussianChart"){
			_.each($scope.widgetCreationObj.chart.config.lines,function(obj,i){
				if(obj.firstX) obj.firstXstr = obj.firstX.toString(10);
			});
		}

		// パフォーマンス改善対応
		if($scope.isPreviewChart){

			var paramMap = angular.copy($scope.widgetCreationObj.chart);
			paramMap.isForPreview = true;
			
			/* 2019.06.05 ADD START KIEN-DX TripleDataModelChart Widgetの追加  */
			if ($scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart'){
				// set primary DatamodelId via dimension[0].dataModelId (x-axis)
				paramMap.dataModelId = $scope.widgetCreationObj.chart.config.dimension[0].dataModelId;
			}
			if($scope.widgetCreationObj.chart.widgetDefId != 'ResultAndRateChart'
				&& $scope.widgetCreationObj.chart.widgetDefId != 'MovingAverageChart'
				&& $scope.widgetCreationObj.chart.widgetDefId != 'TripleDataModelChart'){
				
				// remove unnecessary parameters
				delete $scope.widgetCreationObj.chart.config.extraConfigDimensions;
				delete $scope.widgetCreationObj.chart.config.extraConfigFields;
				delete $scope.widgetCreationObj.chart.config.extraConfigYAxis;
			}
			/* 2019.06.05 ADD END */

			// Previw Chart表示用にNew Widgetを作成する。（表示後に削除する）
			PDService.getData('addWidget', true, 'post', {'pageJSON': undefined, 'isForPreview':true}).then(function(response){

				paramMap.widgetId = undefined;
				if (!$scope.showHierarchy) {
					delete paramMap.dimensionHierarchy;
				}			
				
				PDService.getData('createNewWidget', true, 'post', paramMap).then(function(data){
					$scope.tmpPageId = data.pageId;
					$scope.tmpWidgetId = data.widgetId;

					PAGE_ID = $scope.tmpPageId;
					$rootScope.loadingTargetMap = {};
					WidgetService.resetIsLoadedStatus($scope.tmpWidgetId);

					PDService.getData('getWidgetUiXml', true, 'get', {'widgetId':$scope.tmpWidgetId}).then(function(data){

						//Widget配置の初期位置を設定
						if(data.indexOf('type="documentSearchResult"') > -1 || data.indexOf('type="tableForSS"') > -1){
//							data = data.replace( 'sizex="4"' , 'wcol="2" wrow="0" sizex="8"' ) ;
							data = data.replace( 'sizex="4"' , 'wcol="0" wrow="0" sizex="4"' ) ;
							data = data.replace( 'sizey="4"' , 'sizey="2"' ) ;

						}else{
//							data = data.replace( 'sizex="4"' , 'wcol="4" wrow="0" sizex="4"' ) ;
							data = data.replace( 'sizex="4"' , 'wcol="0" wrow="0" sizex="4"' ) ;

						}

						var element = $compile(data)($scope);
						$('#chartPreviewZone').append(element);
					});
				});
			});
			return true;
		}else{
			/* 2019.06.05 ADD START KIEN-DX TripleDataModelChart Widgetの追加  */
			var paramMap = angular.copy($scope.widgetCreationObj.chart);
			if ($scope.widgetCreationObj.chart.widgetDefId == 'TripleDataModelChart'){
				// set primary DatamodelId via dimension[0].dataModelId (x-axis)
				paramMap.dataModelId = $scope.widgetCreationObj.chart.config.dimension[0].dataModelId;
			}
			
			if($scope.widgetCreationObj.chart.widgetDefId != 'ResultAndRateChart'
				&& $scope.widgetCreationObj.chart.widgetDefId != 'MovingAverageChart'
				&& $scope.widgetCreationObj.chart.widgetDefId != 'TripleDataModelChart'){
				
				// remove unnecessary parameters
				delete $scope.widgetCreationObj.chart.config.extraConfigDimensions;
				delete $scope.widgetCreationObj.chart.config.extraConfigFields;
				delete $scope.widgetCreationObj.chart.config.extraConfigYAxis;
			}
			/* 2019.06.05 ADD END */
			var previousScreen = localSessionStorage.getPreviousScreen();
			if(previousScreen != undefined && previousScreen == SID_DASHBOARD){

				/* 2019.06.05 UPD START KIEN-DX TripleDataModelChart Widgetの追加  */
				// PDService.getData('saveWidget', true, 'post', $scope.widgetCreationObj.chart).then(function(data){
				PDService.getData('saveWidget', true, 'post', paramMap).then(function(data){
				/* 2019.06.05 UPD END */
					if(data != undefined){
						window.location.href = CONTEXT_PATH + "ng/up_index#/userPortal/" + data;
					}else{
						window.location.href = CONTEXT_PATH + "ng/up_index#/userPortal";
					}
				});
			}else{
				/* 2019.06.05 UPD START KIEN-DX TripleDataModelChart Widgetの追加  */
				// PDService.getData('createNewWidget', true, 'post', $scope.widgetCreationObj.chart).then(function(data){
				PDService.getData('createNewWidget', true, 'post', paramMap).then(function(data){
				/* 2019.06.05 UPD END */
					window.location.href = CONTEXT_PATH + "ng/pd_index#/newDashboard/"+$routeParams.pid;
				});
			}
		}

		return false;
	};

	$scope.openFilterWindow = function (size, dataModelId) {
		var dataModelFields;
		if ($scope.widgetCreationObj.dmObjList.length > 1) {

			var index = _.findIndex($scope.widgetCreationObj.dmObjList, {'dataModelId' : dataModelId});
			if (index == 0) {
				dataModelFields = $scope.primaryDataModelField;
			} else {
				dataModelFields = $scope.secondaryDataModelField;
			}
		} else {
			dataModelFields = $scope.primaryDataModelField;
		}
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'widgetfilter.html',
			controller: 'widgetfilterCtrl',
			size: size,
			resolve: {
				fields : function(){
					return dataModelFields;
				},
				finalFilters : function(){
					return $scope.finalFilters;
				},
				filters: function(){
					if ($scope.widgetCreationObj.chart.widgetFilters) {
						if (_.keys($scope.widgetCreationObj.chart.widgetFilters[dataModelId]).length > 0){
							return angular.fromJson($scope.widgetCreationObj.chart.widgetFilters[dataModelId]);
						} else {
							return {};
						}
					} else {
						return {};
					}
				},
				wid: function(){
					return $scope.wid;
				},
				pageDataModelId : function() {
					return dataModelId;
				},
				pageid : function(){
					return $routeParams.pid;
				}
			}
		});

		modalInstance.result.then(function (filters) {
			if ($scope.widgetCreationObj.chart.widgetFilters == undefined) {
				$scope.widgetCreationObj.chart.widgetFilters = {};
			}

			if (_.keys(filters).length == 0) {
				delete $scope.widgetCreationObj.chart.widgetFilters[dataModelId];
			} else {
				$scope.widgetCreationObj.chart.widgetFilters[dataModelId] =  filters;
			}
//			console.log('found filters', filters);
		}, function () {
//			console.log('Modal dismissed at: ' + new Date());
		});
	};

	$scope.openDMFieldsPreview = function ($index, event) {
		event.preventDefault();

		var modalInstance = $modal.open({
			templateUrl	: 'template/modal/previewModelWindow.html',
			controller	: 'DMPreviewFieldsModalCtrl',
			size		: "md",
			resolve		: {
				primaryDataModelField: function () {
					return $scope.primaryDataModelField;
				},
				secondaryDataModelField: function() {
					return $scope.secondaryDataModelField;
				},
				dmName : function() {
					return $scope.widgetCreationObj.dmObjList;
				},
				index: function() {
					return $index;
				}
			}
		});
	};

	$scope.resetOnOperator = function(operatorValue, measureIndex,fieldIndex) {
		if (operatorValue == 'none') {
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].aggFunction = '';
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].value = '';
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].fieldId = '';
			// Field Selector追加対応
			$scope.fctFieldName[measureIndex] = "----";
		}
	};

	$scope.resetOnAggFunction = function(aggFunctionVal, measureIndex, fieldIndex) {
		if (!aggFunctionVal) {
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].aggFunction = "";
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].value = '';
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].fieldId = '';
			// Field Selector追加対応
			$scope.fctFieldName[measureIndex] = "----";
		} else if (aggFunctionVal.indexOf('count:') > -1) {
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].value = '';
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].fieldId = '';
			// Field Selector追加対応
			$scope.fctFieldName[measureIndex] = "----";
		} else if(aggFunctionVal == 'constant') {
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].fieldId = "";
			// Field Selector追加対応
			$scope.fctFieldName[measureIndex] = "----";
		} else {
			$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].value = "";
		}
	};

	$scope.changeFieldSelectionFacet = function(facetFieldId, measureIndex, fieldIndex) {
		var facetFieldObj = facetFieldId.split(":");
		$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].dataModelId = facetFieldObj[0];
		$scope.widgetCreationObj.chart.facetMergeConfig[measureIndex].fields[fieldIndex].fieldId = facetFieldObj[1];
	};

	$scope.changeFacetMergeAggFunction = function(modelVal, index) {
		$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].aggFunction = angular.copy(modelVal);
		if (index == 0) {
			$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal = $scope.primaryDataModelAggFunc[modelVal];
			$scope.widgetCreationObj.chart.facetMergeConfig[index].display = $scope.primaryDataModelAggFunc[modelVal];
			$scope.measureFunctionError = "";
			$scope.measureFldError = "";
			$scope.firstMeasureConstantError = "";
			$scope.measureDecimalPlacesError = "";
			$scope.measureRoundProcError = "";
		} else {
			$scope.widgetCreationObj.chart.facetMergeConfig[index].display = $scope.secondaryDataModelAggFunc[modelVal];
			$scope.secondMeasureFunctionError = "";
			$scope.secondMeasureFldError = "";
			$scope.secondMeasureConstantError = "";
			$scope.secondMeasureDecimalPlacesError = "";
			$scope.secondMeasureRoundProcError = "";
		}

		if (modelVal == "count" || modelVal == "constant") {
			if (index == 0)
				$scope.widgetCreationObj.chart.config.measure[index].dataModelFieldId = "-1";
			else
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = "-1";
			// Field Selector追加対応
			$scope.msrFieldName[index] = "----";
		}

		if (modelVal != "constant") {
			if (index == 0) {
				$scope.widgetCreationObj.chart.facetMergeConfig[0].fields[0].value = "";
			}else{
				$scope.widgetCreationObj.chart.facetMergeConfig[1].fields[0].value = "";
			}
		}

		// Field Selector追加対応
		if (!modelVal) {
			if (index == 0)
				$scope.widgetCreationObj.chart.config.measure[index].dataModelFieldId = "-1";
			else
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = "-1";
			$scope.msrFieldName[index] = "----";
		}
		// Field Selector追加対応
	};

	
	/* 2019.06.05 ADD START KIEN-DX ResultAndRateChart Widgetの追加  */
	// 計算パラメータが変わった時の処理
	$scope.changeMuitiFieldFacetMergeAggFunc2 = function(modelVal, index) {
		
		if (index == 0) {
			$scope.widgetCreationObj.chart.config.measure[0].aggFunction = angular.copy(modelVal);
			$scope.widgetCreationObj.chart.facetMergeConfig[0].display = $scope.primaryDataModelAggFunc[modelVal];
		}else{
			if(modelVal!=null && modelVal!=''){
				//$scope.widgetCreationObj.chart.facetMergeConfig[index].fields = [{"aggFunction": angular.copy(modelVal)}];
				$scope.widgetCreationObj.chart.facetMergeConfig[index].display = $scope.primaryDataModelAggFunc[modelVal];
			}else{
				$scope.widgetCreationObj.chart.facetMergeConfig[index].expression = "";
				$scope.widgetCreationObj.chart.facetMergeConfig[index].display = "";
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields = [{
						"dataModelId"	: 	"",
						"fieldId"		: 	"",
						"aggFunction"	: 	"",
						"operator"		: 	"none",
						"value"			: 	""
				}];
			}
		}
		
		$scope.facetMergeConfig_FunctionError.splice(index,"");
		$scope.facetMergeConfig_FldError.splice(index,"");
		$scope.facetMergeConfig_HtmlTagsError.splice(index,"");

		if (!modelVal || modelVal == "count") {
			if (index == 0) {
				$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId = "-1";
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = "-1";
			}else{
				if(modelVal!=null && modelVal!='')
					$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = "-1";
			}
			// Field Selector追加対応
			$scope.msrFieldName[index] = "----";
		}
	};
	/* 2019.06.05 ADD END  */
	
	//  for sampleLineChart created by m.Ikeuchi 2017.06.21
	// 計算パラメータが変わった時の処理
	$scope.changeMuitiFieldFacetMergeAggFunc = function(modelVal, index) {
		if (index == 0) {
			$scope.widgetCreationObj.chart.config.measure[0].aggFunction = angular.copy(modelVal);
//			$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal = $scope.primaryDataModelAggFunc[modelVal];
			$scope.widgetCreationObj.chart.facetMergeConfig[0].display = $scope.primaryDataModelAggFunc[modelVal];
		}else{
			if(modelVal!=null && modelVal!=''){
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields = [{"aggFunction": angular.copy(modelVal)}];
				$scope.widgetCreationObj.chart.facetMergeConfig[index].display = $scope.primaryDataModelAggFunc[modelVal];
			}else{
				$scope.widgetCreationObj.chart.facetMergeConfig[index].expression = "";
				$scope.widgetCreationObj.chart.facetMergeConfig[index].display = "";
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields = [{
						"dataModelId"	: 	"",
						"fieldId"		: 	"",
						"aggFunction"	: 	"",
						"operator"		: 	"none",
						"value"			: 	""
				}];

				if($scope.widgetCreationObj.chart.config.lineParam[index])
					$scope.widgetCreationObj.chart.config.lineParam[index].lineType = "";
			}
		}
		$scope.measure_FunctionError.splice(index,"");
		$scope.measure_FldError.splice(index,"");
		$scope.htmlTags_InXFldNameError.splice(index,"");

		if (!modelVal || modelVal == "count") {
			if (index == 0) {
				$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId = "-1";
				$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = "-1";
			}else{
				if(modelVal!=null && modelVal!='')
					$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = "-1";
			}
			// Field Selector追加対応
			$scope.msrFieldName[index] = "----";
		}
	};

	// フィールドIDが変わった時の処理
	$scope.changeMuitiFieldFacetMergeFieldId = function(fieldId, index) {
		if (index == 0) {
			$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId = angular.copy(fieldId);
//			$scope.widgetCreationObj.chart.config.measure[0].dataModelFieldDispVal = angular.copy(fieldId);
			$scope.widgetCreationObj.chart.facetMergeConfig[0].display = angular.copy(fieldId);
		}else{
			$scope.widgetCreationObj.chart.facetMergeConfig[index].fields[0].fieldId = angular.copy(fieldId);
			$scope.widgetCreationObj.chart.facetMergeConfig[index].display = angular.copy(fieldId);
		}
		$scope.measure_FunctionError.splice(index,"");
		$scope.measure_FldError.splice(index,"");
		$scope.htmlTags_InXFldNameError.splice(index,"");

	};

	// データ線種別が変わった時の処理
	$scope.changeMuitiFieldFacetMergeLineParam = function(lineType, index) {

		$scope.widgetCreationObj.chart.config.lineParam[index].lineType = angular.copy(lineType);
		$scope.measure_lineparamError.splice(index,"");
	};
	//  for sampleLineChart created by m.Ikeuchi 2017.06.21

	$scope.deleteSeries = function() {
		$scope.widgetCreationObj.chart.config.dimension.splice(1, 1);
		$scope.widgetCreationObj.chart.config.dimensionSort.splice(1, 1);
		delete $scope.widgetCreationObj.chart.series;

		// FRMフィールド存在確認
		$scope.secondDimNofrmWarning = false;
		$scope.secondDimNoFrmMsg = '';

		//2019.06.05 ADD START HUY-DHK
		// VN : Warning Z axis 
		$scope.thirdDimNofrmWarning = false;
		$scope.thirdDimNoFrmMsg = '';
		//VN : Warning Z axis
		//2019.06.05 ADD END
	};

	$scope.setSeriesSort = function(sortValue) {
		$scope.seriesDispSort = sortValue;
	};

	$scope.openTimeSeriesModal = function(size) {
		// console.log('open modal for time series');
		if('validations'|| true){
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'timeSeriesModalWindow.html',
				controller: 'timeSeriesModalCtrl',
				size: size,
				resolve: {
					existingTimeSeries : function() {
						existingTimeSeries = {};
						if($scope.widgetCreationObj.chart.series){
							return {};
						}else{

							if (!$scope.widgetCreationObj.chart.config.dimension[1]) {

								$scope.widgetCreationObj.chart.config.dimension.push({
									'dataModelFieldId'	: null,
									'dataModelDispVal'	: null,
									'fieldDefaultAction': "drilldown",
									'count'				: null,
									'targetPage'		: "",
									'targetDMId'		: "",
									'dataType'			: null
								});
								$scope.widgetCreationObj.chart.config.dimensionSort.push({
									'sortFieldId'	: null,
									'sortBy'		: null,
									'sortOrder'		: null
								});
							}

							if ($scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId) {
								existingTimeSeries.field = $scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId;
								existingTimeSeries.count = $scope.widgetCreationObj.chart.config.dimension[1].count;
								existingTimeSeries.sort = _.findKey(util.replaceSortValue(PDService.getSortMap()),  [$scope.widgetCreationObj.chart.config.dimensionSort[1].sortBy, $scope.widgetCreationObj.chart.config.dimensionSort[1].sortOrder]);
							}
						}

						return existingTimeSeries || {};
					},
					tsFields : function() {
						return $scope.selectDamaModelBasedFieldList;
					},
					widgetDataModelId :  function(){
						return $scope.widgetDataModel.dataModelId;
					},pageid : function(){
						return $routeParams.pid;
					},
					existingTimeSeriesFilters : function () {
						if($scope.widgetCreationObj.chart.series){
							return angular.copy($scope.widgetCreationObj.chart.series);
						} else {
							return {};
						}
					}
				}
			});
			modalInstance.result.then(function (timeSeries) {
//				console.log(timeSeries);
				if(timeSeries.single) {
					$scope.widgetCreationObj.chart.config.dimension[1] = {};
					$scope.widgetCreationObj.chart.config.dimension[1].fieldDefaultAction =  "drilldown";
					$scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId = timeSeries.fieldInfo.field.dataModelFieldId;
					$scope.widgetCreationObj.chart.config.dimension[1].dataType = timeSeries.fieldInfo.field.fieldDataType;
					$scope.widgetCreationObj.chart.config.dimension[1].dataModelDispVal = timeSeries.fieldInfo.field.dataModelFieldValue;
					$scope.widgetCreationObj.chart.config.dimension[1].count = timeSeries.fieldInfo.count;
					$scope.setSortOption(timeSeries.fieldInfo.sort, 1);
					if (timeSeries.fieldInfo.sort == "0-9") {
						$scope.seriesDispSort = "Lo-Hi";
					} else if (timeSeries.fieldInfo.sort == "9-0") {
						$scope.seriesDispSort = "Hi-Lo";
					} else {
						$scope.seriesDispSort = timeSeries.fieldInfo.sort;
					}
					delete $scope.widgetCreationObj.chart.series;

					// FRMフィールド存在確認
					if($scope.data.pageDataModelId != $scope.widgetDataModel.dataModelId){
						$scope.isFrmField( $scope.data.pageDataModelId,
											$scope.widgetDataModel.dataModelId,
											$scope.widgetCreationObj.chart.config.dimension[1].dataModelFieldId,
											$scope.widgetCreationObj.chart.config.dimension[1].dataModelDispVal,
											2 );
					}
				}else{
					$scope.widgetCreationObj.chart.series = timeSeries.fieldInfo; // in case of series
					$scope.widgetCreationObj.chart.config.dimension.splice(1, 1);
				}
			}, function () {
//				console.log('cancelled');
			});
		}
	};

	$scope.getTitleClass = function(hasStorage){

		var retClass = undefined;

		if(hasStorage){
			retClass = {'storage':true};
		}else{
			retClass = {'datamodel':true};
		}
		return retClass
	};

	$scope.getTitleClassByDmId = function(dmId){

		var hasStorage = false;

		var tmpDmObj = _.find($scope.dmViewList, function(elm){
    		return elm.dataModelId == dmId;
    	});
		if(tmpDmObj) hasStorage = tmpDmObj.hasStorage;

		return $scope.getTitleClass(hasStorage);
	};

	$scope.navigateToPDInternalPage = function(pagename, event) {
		event.preventDefault();
		var pageJSON = PageJson.get();
		PDService.getData('persistWidgetPositions', true, 'post', {'pageJSON': pageJSON }).then(function(data){
			localSessionStorage.insertPreviousScreen(SID_WIDGET_CREATION);
//			$location.path("/" + pagename + "/" + $routeParams.pid);
			window.location.href = CONTEXT_PATH + "ng/pd_index#/" + pagename + "/" + $routeParams.pid;
		}).catch(function(e) {
			util.showNotification(errorMsg, oopssomethingwentwrongMsg, "error", "", false, true);
		});
		return false;
	};
	$scope.defaultSearch = function(event) {
		localSessionStorage.insertPreviousScreen(SID_WIDGET_CREATION);
		$scope.navigateToPDInternalPage("initPage", event);
	};
	$scope.tableSettings = function(event) {
		localSessionStorage.insertPreviousScreen(SID_WIDGET_CREATION);
		$scope.navigateToPDInternalPage("tableSettings", event);
	};
	$scope.advanceSearch = function(event) {
		localSessionStorage.insertPreviousScreen(SID_WIDGET_CREATION);
		$scope.navigateToPDInternalPage("searchOptions", event);
	};

	// FRMフィールド存在確認
	$scope.isFrmField = function(pageDMId, widgetDMId, srcFieldId, srcFieldName, dimNumber) {

		var isTargetField = false;

		var fieldNValueArr = [];
		fieldNValueArr.push({"fieldId": srcFieldId, "fieldValue": ''});
		$.ajax({
			method : 'get',
			async : false,
			url : CONTEXT_PATH + '/PageHandler/getFRMFieldHeuristicValues',
			data : {
				"pageDMId" : pageDMId,
				"widgetDMId" : widgetDMId,
				"fieldValueMap" : angular.toJson(fieldNValueArr),
				"timeSeries" : false
			}
		}).success(function(response) {
			var dataResponse = angular.fromJson(response);
			if (dataResponse && dataResponse.status == "OK") {

				var fieldMappingObj = dataResponse.response;

				for ( var i in fieldMappingObj) {
					if (fieldMappingObj[i].targetFieldId) {
						isTargetField = true;
					}
				}

			} else if (dataResponse && (dataResponse.status == 'NOT_OK' || dataResponse.status == 'failure') ) {
				console.log("Execute Error: getFRMFieldHeuristicValues");
				isTargetField = null;
			}
		}).error(function(e) {
			console.log("Execute Error: getFRMFieldHeuristicValues");
			isTargetField = null;
		});


		if(dimNumber == 2){
			if(isTargetField === false){
				$scope.secondDimNofrmWarning = true;
				$scope.secondDimNoFrmMsg = nofrmWarninMsg_tmp.replace( '%0', srcFieldName );
			}else{
				$scope.secondDimNofrmWarning = false;
				$scope.secondDimNoFrmMsg = '';
			}
		//2019.06.05 ADD START HUY-DHK
		// Vn:option check for BubbleChart 
		}else if(dimNumber == 3) {
			if (isTargetField === false) {
				$scope.thirdDimNofrmWarning = true;
				$scope.thirdDimNoFrmMsg = nofrmWarninMsg_tmp.replace('%0', srcFieldName);
			} else {
				$scope.thirdDimNofrmWarning = false;
				$scope.thirdDimNoFrmMsg = '';
			}
		//2019.06.05 ADD END
		}else{
			if(isTargetField === false){
				$scope.dimNofrmWarning = true;
				$scope.dimNoFrmMsg = nofrmWarninMsg_tmp.replace( '%0', srcFieldName );
			}else{
				$scope.dimNofrmWarning = false;
				$scope.dimNoFrmMsg = '';
			}
		}
	};
	// FRMフィールド存在確認

	// データモデル選択リストの修正
    $scope.changeFolder = function(folderId, event){

    	$scope.currentFolderId = folderId;
    };

    $scope.changeFolderToParent = function(currentFolderId, event){

    	var currentFolder = _.find($scope.dmFolderList, function(elm){
    		return elm.folderId == currentFolderId;
    	});

    	$scope.currentFolderId = currentFolder.folderParentId;
    };
    // データモデル選択リストの修正
    
	/* 2019.06.05 ADD START KIEN-DX TripleDataModelChart Widgetの追加  */
	$scope.changeSelectDamaModelBasedFieldList = function(data) {
		$scope.selectDamaModelBasedFieldList = data;
	}
	
	var multiFacetSettingChangesForCustomDataModel = function() {

		for (var i in $scope.widgetCreationObj.chart.facetMergeConfig) {
			$scope.widgetCreationObj.chart.facetMergeConfig[i].expression = 0+"";
			if (i==0) {
				$scope.widgetCreationObj.chart.facetMergeConfig[i].fields[0].fieldId = angular.copy($scope.widgetCreationObj.chart.config.measure[0].dataModelFieldId);
			}
		}
	};
	
	/* 2019.06.05 ADD END  */

}]).controller("DMPreviewFieldsModalCtrl", function($scope, $modalInstance, primaryDataModelField, secondaryDataModelField, dmName, index) {
	if (index == 0) {
		$scope.dmObject = _.groupBy(primaryDataModelField, 'fieldDataType');
	} else {
		$scope.dmObject = _.groupBy(secondaryDataModelField, 'fieldDataType');
	}
	$scope.DataModelName = dmName[index].dataModelName;

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}).controller('ModalEDGConfirmationInstanceCtrl', function($scope, $modalInstance, $location, pageInfo, dmid) {
	if (typeof pageInfo == undefined) return;

	$scope.pageInfo = pageInfo;
	$scope.confirmationModal = true;
	$scope.dmid = dmid;
	$scope.ok = function() {
		window.location.href = CONTEXT_PATH + "ng/ds_index#/enterpriseDataGraph/" + $scope.dmid;
	};
	$scope.cancel = function() { $modalInstance.dismiss('cancel'); };
});