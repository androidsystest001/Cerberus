/* 管理線つきLINEチャート（複数フィールド対応版）
*   LineChart.jsをベースに作成
*	Created by M.Ikeuchi
*	Create date 2016.09.05
*/

angular.module('sic.controllers')
	.controller('TripleDataModelChartCtrl', ['$scope', "$element", 'pubsubService', 'logService', 'sicTimeout', '$http', '$attrs', '$rootScope', "DataChainHelper", "highchartsNGUtils", "federatedDataChainFactory", "UtilService", "WidgetService", "$translate",
	                                        function($scope, $element, pubsubService, logService, sicTimeout, $http, $attrs, $rootScope, DataChainHelper, highchartsNGUtils, federatedDataChainFactory, UtilService, WidgetService, $translate) {
		'use strict';


		var jsonArray = JSON.parse($scope.opts);
		var extraConfigYAxis = jsonArray.extraConfigYAxis;						
		var extraConfigFields = jsonArray.extraConfigFields;

		var InaccessibleDMError = "";
		$translate("InaccessibleDMError").then(function(data) {
			InaccessibleDMError = data;
		});

		// MultiAxesChart.jsをベースに変更
		// chartconfig の中のchart:typeで指定しているtypeをマルチチャートタイプに変更するため、seriesにチャートタイプを指定する。（ここのtypeは残しておいても影響なし）
		// mode にmultifield-lineを指定することで、anguler-highchart.jsの中で、チャートタイプをコントロールする。


		$scope.chartConfig = {
			chart: {
				type: '',
				mode: 'multifield-line',
				zoomType: 'xy'
			},
			title: {text: $scope.displayName},
			subtitle: {text: $scope.description},
			xAxis: {
				tickmarkPlacement: 'on',
				crosshair: true,
				categories: [],
				title : {
					text : jsonArray.dimension[0].dataModelDispVal || "",
				},
				labels: {
					formatter: function() {
					return UtilService.changeAxisLabel(this.value);
					},
				// rotation: 0,
					enabled: true
				},
			},
			tooltip: {
				formatter: function() {
					return UtilService.changeTooltipOneDimension(this.series.name, this.y);
				},
				followPointer : false
				//shared: true
			},

			// modify M.ikeuchi
			yAxis: [
					{ // Primary yAxis
	
						min : extraConfigYAxis[0].min_value != undefined && extraConfigYAxis[0].min_value != null ? extraConfigYAxis[0].min_value : undefined,
						startOnTick : extraConfigYAxis[0].min_value != undefined && extraConfigYAxis[0].min_value ? false : true,
						max : extraConfigYAxis[0].max_value != undefined && extraConfigYAxis[0].max_value ? extraConfigYAxis[0].max_value : undefined,
						endOnTick : extraConfigYAxis[0].max_value != undefined && extraConfigYAxis[0].max_value ? false : true,
						title : {
							text : extraConfigYAxis[0].dataModelDispVal,
							style: {
								color: Highcharts.getOptions().colors[0]
							}
						},
						labels: {
							format: (extraConfigYAxis[0].percentDisplay === true ? '' : '¥') + '{value}' + (extraConfigYAxis[0].percentDisplay === true ? '%' : ''),
							style: {
								color: Highcharts.getOptions().colors[0]
							}
						},
					},{ // Second yAxis
						min : extraConfigYAxis[1].min_value != undefined && extraConfigYAxis[1].min_value != null ? extraConfigYAxis[1].min_value : undefined,
						startOnTick : extraConfigYAxis[1].min_value != undefined && extraConfigYAxis[1].min_value != null ? false : true,
						max : extraConfigYAxis[1].max_value != undefined && extraConfigYAxis[1].max_value != null ? extraConfigYAxis[1].max_value : undefined,
						endOnTick : extraConfigYAxis[1].max_value != undefined && extraConfigYAxis[1].max_value != null ? false : true,
						title : {
							text : extraConfigYAxis[1].dataModelDispVal,
							style: {
								color: Highcharts.getOptions().colors[1]
							}
						},
						labels: {
							format: (extraConfigYAxis[1].percentDisplay === true ? '' : '¥') + '{value}' + (extraConfigYAxis[1].percentDisplay === true ? '%' : ''),
							style: {
								color: Highcharts.getOptions().colors[1]
							}
						},
						opposite: true
					}
				],
				series:[],
			plotOptions: {
				series: {
					showInLegend: true,
					connectNulls: false
				}
			},
			loading: {
				showLoading: false
			}
		};
		$scope.dimIndex = null;
		$scope.drillDownIndex = [];
		var isDHClick = false;
		var selectedCount = 0;

		var CHARTING_PROVIDER = APPS_CHARTING_PROVIDER;

		// パフォーマンス改善対応
		if($scope.pageClass == 'user-portal' || $scope.isPreviewChart){
			$scope.isChartDisplay = true;
		}else{
			$scope.isChartDisplay = false;
		}

		$scope.series = [];
		$scope.nodata = WidgetService.getWidgetLabel('initial');
		// パフォーマンス改善対応

		var xLabePosition = function(typeX, firstX, xLabelList) {
			var position = -1;
			var valueX;
			if(typeX == 'datetime'){
				var tmpDate = new Date(firstX);

				//YYYY-MM-DDThh:mm:ssZに変換
				valueX = '';
				valueX = tmpDate.getFullYear();
				valueX = valueX + '-' + ('0' + (tmpDate.getMonth() + 1)).slice(-2);
				valueX = valueX + '-' + ('0' + tmpDate.getDate()).slice(-2);
				valueX = valueX + 'T' + ('0' + tmpDate.getHours()).slice(-2);
				valueX = valueX + ':' + ('0' + tmpDate.getMinutes()).slice(-2);
				valueX = valueX + ':' + ('0' + tmpDate.getSeconds()).slice(-2);
				valueX = valueX + 'Z';

			}else{
				valueX = firstX;
			}

			for(var i=0; i< xLabelList.length; i++){
				if(valueX == xLabelList[i]){
					return i;
				}
			}

			return 'unmatch';
		};

		// make translucent colors (for Controll Line by m.ikeuchi)
		var translucent = function(value, opacity) {
			var r, g, b;
			if (value == null) {
				r = g = b = 0;
			} else if (value.match(/^#[a-fA-F0-9]{3}$/)) {
				r = parseInt(value.slice(1,2) + value.slice(1,2), 16);
				g = parseInt(value.slice(2,3) + value.slice(2,3), 16);
				b = parseInt(value.slice(3) + value.slice(3), 16);
			} else if (value.match(/^#[a-fA-F0-9]{6}$/)) {
				r = parseInt(value.slice(1,3), 16);
				g = parseInt(value.slice(3,5), 16);
				b = parseInt(value.slice(5), 16);
			} else {
				r = g = b = 0;
			}
			if (opacity == null || isNaN(opacity)) {
				opacity = 0.5;
			}
			return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
		};


		$scope.refresh = function(edata) {

			// ダッシュボード手動更新切替
        	if( WidgetService.isNotWidgetRefresh() ) return;

			$scope.chartConfig.loading.showLoading = false;
			if (edata != "" && edata == $scope.wId){
				return;
			}
			if (typeof edata != "undefined") {
				if (edata.search == "") {
					$scope.data = {};
					return false;
				}
			}

			// パフォーマンス改善対応
			if( $rootScope.loadingWidgetReset && _.indexOf($rootScope.drilldownedList, $scope.wId)==-1 ){

				$scope.series = [];
				$scope.nodata = WidgetService.getWidgetLabel('initial');
			}

			// まれにWidget座標が正しく取得できない場合があるので、再判定をする
			if($rootScope.isRecheck){
	        	// Widgetの位置情報の設定
	        	_.each($rootScope.loadingWidgetList,function(obj,i){
	        		WidgetService.setWidgetCoordinate(obj.wId);
				});
	        	// Load対象の設定
	        	$rootScope.loadingTargetMap = WidgetService.getWidgetsToLoad();
			}

			// Load対象かどうかの判定
			if( $rootScope.loadingTargetMap[$scope.wId] ){
//				$rootScope.loadingTargetMap[$scope.wId].isLoaded = true;
				WidgetService.setAsLoaded($scope.wId);
			}else{
				return;
			}
			// パフォーマンス改善対応

			federatedDataChainFactory.removeWidgetValue($scope.wId);
			if (typeof util.drillDownObj["multiAxesChart"] != "undefined")
				util.drillDownObj['multiAxesChart'][$scope.wId] = []; // make the segment clickable second time onwards
			if (search == null)
				search = new Search();
			var jsonString = JSON.stringify(search.toJsonQuery());

//			$scope.nodata = "";
			$scope.series = [];
			selectedCount = 0;

			$scope.drillDownFired = false;
			if(!isDHClick)$scope.showDimensionHierarchy = false;

			if (!$scope.chartConfig.loading.showLoading)
				$scope.chartConfig.loading.showLoading = true;

			var data = {
				'data': jsonString,
				'page': PAGE_ID,
				'widgetId': $scope.wId,
				'chartingProvider': CHARTING_PROVIDER,
				'dimIndex': $scope.dimIndex
			};

			WidgetService.getData('loadTripleDataModelChartData', true, "POST", data, $scope.displayName).then(function(response){

				// 検索処理前後の検索条件を比較し、異なっている場合は処理を中断する。（新しい検索がリクエストされている為）
				if( WidgetService.isDiffFilterPreAndPost(jsonString) ) return;

				if (response != undefined && response != "" && response[0] != null && Object.keys(response[0]).length > 0) {

					if(response == "InaccessibleDMError"){

						$scope.series = [];
						$scope.nodata = InaccessibleDMError;
					}else{
						$scope.chartConfig.series = [];
						
						var columnColor = ["green", "orange", "blue"];
						var lineMarker = ["circle", "triangle"];
						const columnSeriesCount = 3;

						var extraConfigFieldsYAxis1 = extraConfigFields.slice(0,columnSeriesCount);
						var extraConfigFieldsYAxis2 = extraConfigFields.slice(columnSeriesCount, extraConfigFields.length);
						
						_.each(extraConfigFieldsYAxis1, function(elm, i) {
							$scope.chartConfig.series.push({
					        	type: elm.lineType,
					        	yAxis:elm.yAxis,
					        	marker: {
					                enabled: elm.lineType == 'column' ? false : true,
			                		symbol: elm.lineType == 'line' ? lineMarker.shift() : undefined
					            },
					            color: elm.lineType == 'column' ? columnColor.shift() : undefined
							});
						});
						
						_.each(extraConfigFieldsYAxis2, function(elm, i) {
							// here we have a pair config
							// Numerator/Denominator
							// only push a series in case of Numerator 
							if (i % 2 == 0) {
								$scope.chartConfig.series.push({
						        	type: elm.lineType,
						        	yAxis:elm.yAxis,
						        	marker: {
						                enabled: elm.lineType == 'column' ? false : true,
				                		symbol: elm.lineType == 'line' ? lineMarker.shift() : undefined
						            },
						            color: elm.lineType == 'column' ? columnColor.shift() : undefined
								});
							}
						});

						$scope.series = {"hasAxisInfo": true,"showYLine": true,"multiAxes": true,"hideLegend": true,"datum": response[0]};

						// ダッシュボード手動更新切替
						if($rootScope.isManualRefresh){
							var valueList = getFilterValueList();
							if(valueList.length > 0){
								_.each(valueList,function(elm,i){
									var firstIdx = _.findIndex( $scope.series.datum.xLine, function(val){
										return val == elm;
									});

									if(firstIdx >= 0){
										var yVal1, yVal2;

										if($scope.series.datum.data[0].data[firstIdx].y){
											yVal1 = $scope.series.datum.data[0].data[firstIdx].y;
										}else{
											yVal1 = $scope.series.datum.data[0].data[firstIdx];
										}

										if($scope.series.datum.data[1].data[firstIdx].y){
											yVal2 = $scope.series.datum.data[1].data[firstIdx].y;
										}else{
											yVal2 = $scope.series.datum.data[1].data[firstIdx];
										}

										$scope.series.datum.data[0].data[firstIdx] = {'y': yVal1, 'selected': true};
										$scope.series.datum.data[1].data[firstIdx] = {'y': yVal2, 'selected': true};
									}

									drilldownFired(true);
									if(!$scope.showDataChainButton && $scope.dhCount > 0) $scope.series.isWidgetOption = true;
								});
							}
						}
						// ダッシュボード手動更新切替

						if($scope.showDataChainButton || $scope.showDimensionHierarchy){
							$scope.series.isWidgetOption = true;
						}
						
					}

				} else {
					$scope.series = [];
					$scope.nodata = "No data to display.";
				}
				$scope.chartConfig.loading.showLoading = false;
			}).catch(function(errorMessage) {
				$scope.nodata = errorMessage;
				$scope.chartConfig.loading.showLoading = false;
			});
		};

//		$scope.refresh("");
		if( WidgetService.isNotWidgetRefresh() || $scope.pageClass!='user-portal') $scope.refresh("");
		pubsubService.subscribe($scope, SEARCH_EVENT_END, $scope.refresh, null);

		// パフォーマンス改善対応
		$scope.$on(WIDGET_REFRESH, function(event, wId) {
			if(wId == $scope.wId){
				WidgetService.resetIsLoadedStatus(wId);

				// ダッシュボード手動更新切替
				if($rootScope.isManualRefresh){
					var tmpFlg = WidgetService.isNotWidgetRefresh();
					if(tmpFlg) WidgetService.resetNotWidgetRefresh();
					$scope.refresh("");
					if(tmpFlg) WidgetService.setIsNotWidgetRefresh(true);
				}else{
					$scope.refresh("");
				}
				// ダッシュボード手動更新切替
			}
		});

		$scope.$on(SWITCH_DISPLAY, function(event, wId) {
			if(wId == $scope.wId){
				$scope.isChartDisplay = !$scope.isChartDisplay;
				if($scope.isChartDisplay){
					WidgetService.resetIsLoadedStatus(wId);
					$scope.refresh("");
				}
			}
		});
		// パフォーマンス改善対応

		// ダッシュボード手動更新切替
		var getDimensions = function(){

			var dimensions = [];
			if($rootScope.pageDataModelId != $scope.widgetDMId){

				var srcFields = [];
				if(dhArray)
					srcFields.push( dhArray[$scope.appliedIndex].dataModelFieldId );
				else
					srcFields.push( jsonArray.dimension[0].dataModelFieldId );
				// FRMフィールドの取得
				var frmField = WidgetService.getFrmField(srcFields, $scope.widgetDMId, $rootScope.pageDataModelId, false);
				if(frmField)
					dimensions.push(frmField[0]);

			}else{
				if(dhArray)
					dimensions.push(dhArray[$scope.appliedIndex].dataModelFieldId);
				else
					dimensions.push(jsonArray.dimension[0].dataModelFieldId);
			}

			return dimensions;
		};

		var syncSelect = function(paramMap, code) {

			if($scope.series.length==0 || !$scope.series.datum ) return;

			if(!paramMap.dimensions.second){
				var dimensions = getDimensions();

				// 選択されたチャートの値とWidget定義の判定
				if(paramMap.dimensions.first.fieldId == dimensions[0]){

					if(code=='CLEAR'){

						var tmpSeries = angular.copy($scope.series);

						var isReset = false;
						_.each(tmpSeries.datum.data[0].data,function(obj,i){
							if(obj.selected){
								obj.selected = false;
								isReset = true;
							}
						});

						_.each(tmpSeries.datum.data[1].data,function(obj,i){
							if(obj.selected){
								obj.selected = false;
								isReset = true;
							}
						});

						if(isReset) $scope.series = tmpSeries;

					}else{
						// code=='SELECT' or code=='UNSELECT'

						// 1st Dimensionのインデックス取得
						var firstIdx = _.findIndex( $scope.series.datum.xLine, function(val){
							return val == paramMap.dimensions.first.value;
						});
						if(firstIdx < 0) return;

						var tmpSeries = angular.copy($scope.series);
						var yVal1, yVal2;

						if(tmpSeries.datum.data[0].data[firstIdx].y){
							yVal1 = tmpSeries.datum.data[0].data[firstIdx].y;
						}else{
							yVal1 = tmpSeries.datum.data[0].data[firstIdx];
						}

						if(tmpSeries.datum.data[1].data[firstIdx].y){
							yVal2 = tmpSeries.datum.data[1].data[firstIdx].y;
						}else{
							yVal2 = tmpSeries.datum.data[1].data[firstIdx];
						}

						if(code=='SELECT'){

							tmpSeries.datum.data[0].data[firstIdx] = {'y': yVal1, 'selected': true};
							tmpSeries.datum.data[1].data[firstIdx] = {'y': yVal2, 'selected': true};

							drilldownFired(true);
							if(!$scope.showDataChainButton && $scope.dhCount > 0) tmpSeries.isWidgetOption = true;
						}else{

							tmpSeries.datum.data[0].data[firstIdx] = yVal1;
							tmpSeries.datum.data[1].data[firstIdx] = yVal2;

							drilldownRemoved(true);
							if(!$scope.showDataChainButton && selectedCount == 0)
								tmpSeries.isWidgetOption = false;
							else if(!$scope.showDataChainButton && selectedCount > 0 && $scope.dhCount > 0)
								tmpSeries.isWidgetOption = true;
						}

						$scope.series = tmpSeries;
					}
				}
			}
		};

		var drilldownFired = function(isSyncSelect){

			if(!$scope.showDataChainButton && !isDHClick && selectedCount == 0 && $scope.dhCount > 0 && !isSyncSelect){
				highchartsNGUtils.resizeForWidgetOption($scope.wId, $scope.chartConfig.chart.mode, true);
			}

			selectedCount++;
			if(selectedCount > 0) $scope.drillDownFired = true;
			if(selectedCount > 0) $scope.showDimensionHierarchy = true; // on drill down show the drilldown hierarchy image
			if ($scope.dimIndex == null)
				$scope.dimIndex = 0;

			if( $scope.drillDownIndex.indexOf($scope.dimIndex) ==-1){
				$scope.drillDownIndex.push($scope.dimIndex);
			}
		};

		var drilldownRemoved = function(isSyncSelect){

			selectedCount--;
			if(selectedCount < 1) $scope.drillDownFired = false;
			if(selectedCount < 1) $scope.showDimensionHierarchy = false; // on drill down show the drilldown hierarchy image

			if(!$scope.showDataChainButton && !isDHClick && selectedCount == 0 && $scope.dhCount > 0 && !isSyncSelect){
				highchartsNGUtils.resizeForWidgetOption($scope.wId, $scope.chartConfig.chart.mode, false);
			}
		};

		var getFilterValueList = function(){

			if(!search) return;

			var dimensions = getDimensions();

			var dmId;
			if($rootScope.pageDataModelId != $scope.widgetDMId)
				dmId = $rootScope.pageDataModelId;
			else
				dmId = $scope.widgetDMId;

			var filterId = dmId + ':' + dimensions[0];

			var jsonQuery = search.toJsonQuery();
			var filter;
			var valueList = [];

			_.each(jsonQuery.userActionFilter,function(filters,i){

				filter = filters[filterId];
				if(filter && filter.filter[dimensions[0]].operations['=']){
					valueList = _.union(valueList, filter.filter[dimensions[0]].operations['='].values);
				}
			});

			return valueList;
		};

		$rootScope.$on(SYNC_SELECT_ELEMENT, function(event, paramMap) {
			if(paramMap.wId != $scope.wId){
				syncSelect(paramMap, 'SELECT');
			}
		});

		$rootScope.$on(SYNC_UNSELECT_ELEMENT, function(event, paramMap) {
			if(paramMap.wId != $scope.wId){
				syncSelect(paramMap, 'UNSELECT');
			}
		});

		$rootScope.$on(SYNC_CLEAR_ELEMENT, function(event, paramMap) {
			if(paramMap.wId != $scope.wId){
				syncSelect(paramMap, 'CLEAR');
			}
		});
		// ダッシュボード手動更新切替

		$rootScope.$on(DRILLDOWN_FIRED, function(event, msg) {
			if (msg == $scope.wId) {
				drilldownFired(false);
				return;
			}

			// ダッシュボード手動更新切替
			if( WidgetService.isNotWidgetRefresh() ) return;

			$scope.series = [];
			$scope.chartConfig.loading.showLoading = true;
		});

		$rootScope.$on(DRILLDOWN_REMOVED, function(event, msg) {
			if (msg == $scope.wId) {
				drilldownRemoved(false);
			}
		});

		$rootScope.$on(INITQUERY_FIRED, function() {
			$scope.dimIndex = null;
			$scope.drillDownIndex = [];
			$scope.showDimensionHierarchy = false;
			resetDimHeirarchy($scope.dimensionhierarchy);
			selectedCount = 0;
            isDHClick = false;

		});

		var dhArray = '';
		var resetDimHeirarchy = function(dimHeirarchy){
			if (dimHeirarchy == "") return;
			dhArray = angular.fromJson(dimHeirarchy);
			$scope.appliedIndex = 0;
			$scope.nextDimension = dhArray[$scope.appliedIndex + 1] || {};
			$scope.previousDimension = dhArray[$scope.appliedIndex - 1] || {};
		};

		$scope.datachain = function() {

			var widgetDMId = $scope.widgetDMId;
			var dimension1 = jsonArray.dimension[0];
			if ($scope.dimensionhierarchy != null && typeof $scope.dimensionhierarchy != "undefined" && $scope.dimensionhierarchy != '') {
				if ($scope.dimIndex != null && typeof $scope.dimIndex != "undefined") {
					var dimHeirarchyArray = JSON.parse($scope.dimensionhierarchy);
					dimension1 = dimHeirarchyArray[$scope.dimIndex];
				}
			}
			if (jsonArray.dimension.length == 1) {
				if ($rootScope.pageDataModelId != widgetDMId) {
					DataChainHelper.doSingleDimensionDataChain(dimension1, widgetDMId, true);
				} else {
					DataChainHelper.doSingleDimensionDataChain(dimension1, widgetDMId);
				}
			} else if (jsonArray.dimension.length > 1) {
				var dimension2 = jsonArray.dimension[1];
				if ($rootScope.pageDataModelId != widgetDMId) {
					DataChainHelper.doMultiDimensionDataChain(dimension1, dimension2, widgetDMId, true);
				} else {
					DataChainHelper.doMultiDimensionDataChain(dimension1, dimension2, widgetDMId);
				}
			}
		};

		if ($scope.dimensionhierarchy != '') {
			resetDimHeirarchy($scope.dimensionhierarchy);
			$scope.dhDown = function(wid) {
				if (wid != $scope.wId)
					return;

				$scope.dimIndex++;
				$scope.appliedIndex++;
				$scope.isDown = true;

				$scope.nextDimension = dhArray[$scope.appliedIndex + 1] || {};
				$scope.previousDimension = dhArray[$scope.appliedIndex - 1] || {};
				isDHClick = true;
				// パフォーマンス改善対応
				WidgetService.resetIsLoadedStatus(wid);

				// ダッシュボード手動更新切替
				if($rootScope.isManualRefresh){
					var tmpFlg = WidgetService.isNotWidgetRefresh();
					if(tmpFlg) WidgetService.resetNotWidgetRefresh();
					$scope.refresh(undefined);
					if(tmpFlg) WidgetService.setIsNotWidgetRefresh(true);
				}else{
					$scope.refresh(undefined);
				}
				// ダッシュボード手動更新切替
			};
			$scope.dHUp = function(wid) {
				if (wid != $scope.wId)
					return;

				$scope.dimIndex--;
				$scope.appliedIndex--;
				$scope.isDown = false;

				$scope.nextDimension = dhArray[$scope.appliedIndex + 1] || {};
				$scope.previousDimension = dhArray[$scope.appliedIndex - 1] || {};
				// パフォーマンス改善対応
				WidgetService.resetIsLoadedStatus(wid);

				// ダッシュボード手動更新切替
				if($rootScope.isManualRefresh){
					var tmpFlg = WidgetService.isNotWidgetRefresh();
					if(tmpFlg) WidgetService.resetNotWidgetRefresh();
					$scope.refresh(undefined);
					if(tmpFlg) WidgetService.setIsNotWidgetRefresh(true);
				}else{
					$scope.refresh(undefined);
				}
				// ダッシュボード手動更新切替
			};
		}

		// パフォーマンス改善対応
    	$scope.$on('$destroy',function(){
    		if( $('#'+$scope.wId).find('highchart').highcharts() )
    			$('#'+$scope.wId).find('highchart').highcharts().destroy();
    		$scope.series = null;
    		$scope.refresh = null;

    		jsonArray = null;
    		InaccessibleDMError = null;
    		isDHClick = null;
    		CHARTING_PROVIDER = null;
    		selectedCount = null;
    		dhArray = null;

    		xLabePosition = null;
    		translucent = null;
    		getDimensions = null;
    		syncSelect = null;
    		drilldownFired = null;
    		drilldownRemoved = null;
    		getFilterValueList = null;
    		resetDimHeirarchy = null;
		});

    	$scope.$on('$includeContentLoaded', function(event) {

    		if($rootScope.loadingWidgetList){
	    		WidgetService.setWidgetCoordinate($scope.wId);
	    		WidgetService.setloadingTargetMap($scope.wId);
    		}

	    	if( !WidgetService.isNotWidgetRefresh() ) $scope.refresh("");
    	});
    	// パフォーマンス改善対応
	}]);