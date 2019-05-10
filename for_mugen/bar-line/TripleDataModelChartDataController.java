package jp.smartinsight.web.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;

import jp.smartinsight.core.Constants;
import jp.smartinsight.core.measure.MeasureConfig;
import jp.smartinsight.dto.DataModelDTO;
import jp.smartinsight.dto.PageDto;
import jp.smartinsight.dto.WidgetInstanceDto;
import jp.smartinsight.query.Document;
import jp.smartinsight.query.QueryConstant;
import jp.smartinsight.query.QueryOrganizer;
import jp.smartinsight.query.SearchOpsBean;
import jp.smartinsight.query.SearchResult;
import jp.smartinsight.query.executor.BeanProvider;
import jp.smartinsight.service.DataModelService;
import jp.smartinsight.service.FRMService;
import jp.smartinsight.service.MugenSearchService;
import jp.smartinsight.service.PageService;
import jp.smartinsight.service.UserSecurityService;
import jp.smartinsight.service.WidgetInstanceService;
import jp.smartinsight.web.controller.helper.MultiDimensionalDataHelper;
import jp.smartinsight.web.controller.helper.SingleDimensionalDataHelper;
import jp.smartinsight.web.core.bean.PersonalPageBean.InitQueryExecution;
import jp.smartinsight.web.data.formatter.DataFormatter;
import jp.smartinsight.web.data.formatter.ResultFormatterForCharts;
import jp.smartinsight.web.utility.ChartConstants;
import jp.smartinsight.web.utility.FilterBarUtility;
import jp.smartinsight.web.utility.Utility;
import jp.smartinsight.web.utility.WidgetHandlerUtility;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.math3.stat.StatUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;


/**
 * <div lang="en"> Helper class for Multi field line chart.</div>,
 * <span lang="en"></span>
 * <div lang="ja"> Helper class for Multi field line chart.</div>
 * @author kien-dx
 * @Date 2019/04/24
 *
 */

@Controller
@RequestMapping("/WidgetDataHandler")
public class TripleDataModelChartDataController {

	@Autowired
	WidgetHandlerUtility widgetHandler;

	@Autowired
	DataModelService dataModelService;

	@Autowired
	QueryOrganizer queryOrganizer;

	@Autowired
	BeanProvider queryExecutorProvider;

	@Autowired
	SingleDimensionalDataHelper singleDimensionalDataHelper;

	@Autowired
	@Qualifier("widgetInstanceService")
	private WidgetInstanceService widgetInstanceService;

	//
	private final String EXTRACONFIG_FIELDS = "extraConfigFields";
	private final String EXTRACONFIG_YAXIS = "extraConfigYAxis";
	//

	
	@RequestMapping(value = "/loadTripleDataModelChartData", method = RequestMethod.POST)
	public @ResponseBody
	Object loadTripleDataModelChartData(ModelMap model, HttpServletRequest httpRequest) {


		String jsonString = httpRequest.getParameter(QueryConstant.DATA);
		String pageId = httpRequest.getParameter(QueryConstant.PAGE);
		String widgetId = httpRequest.getParameter(QueryConstant.WIDGET);
		String sessionId = httpRequest.getSession().getId();
		String chartingProvider = httpRequest.getParameter(QueryConstant.CHARTINGPROVIDER);
		String configStr = httpRequest.getParameter(Constants.WIDGET_CONFIG);
		String filterStr = httpRequest.getParameter(QueryConstant.FILTER);
		String facetMergeConfigStr = httpRequest.getParameter(Constants.FACET_MERGE_CONFIG);
		String widgetDataModelIdStr = httpRequest.getParameter(QueryConstant.WIDGETDMID);
		String dimensionIdx = httpRequest.getParameter(QueryConstant.DIMENSIONINDEX);

		Integer dimindex = widgetHandler.getNumericDimensionIndex(dimensionIdx);

		// get page/widget information
		PageDto pageDto = widgetHandler.getPageDto(pageId, sessionId);
		WidgetInstanceDto widget = (WidgetInstanceDto) pageDto.getWidgetMap().get(widgetId);
	
		Map<String, List<Map<String, String>>> configMap = null;
		configMap = widget.getConfig();
		
		
		WidgetInstanceDto tempWidget = widgetHandler.getTemporaryWidgetIns(configStr, filterStr, facetMergeConfigStr, widgetDataModelIdStr, widgetId);
		
		Object resultObject = singleDimensionalDataHelper.getMultiLineResult(widgetId, pageId, sessionId,
				jsonString, ChartConstants.MULTIFIELDLINECHART, chartingProvider, dimindex, tempWidget);


		return convertToReturnMapforMultiMeasure(Constants.ResponseStatus.SUCCESS.getStatus(), resultObject, configMap);
	}

	private Map<String, Object> convertToReturnMapforMultiMeasure(String status, Object data, Map<String, List<Map<String, String>>> configMap){
		Map<String, Object> jsonMap = new HashMap<String, Object>();
		jsonMap.put(Constants.RESPONSE_STATUS, status);
		jsonMap.put(Constants.RESPONSE, data);

		if(data != null && data instanceof String == false){

			List<Map<String, String>> extraConfigFields = configMap.get(EXTRACONFIG_FIELDS);
			List<Map<String, String>> extraConfigYaxis = configMap.get(EXTRACONFIG_YAXIS);
			
			@SuppressWarnings("unchecked")
			List<Object> list1 = (List<Object>)data;

			@SuppressWarnings("unchecked")
			Map<String, Object>  map = (Map<String, Object>)list1.get(0);

			@SuppressWarnings("unchecked")
    		List<Object> seriesData = (List<Object>)map.get("data");
			
			Map<String, String> extraConfigY1 = extraConfigYaxis.get(0);
			Map<String, String> extraConfigY2 = extraConfigYaxis.get(1);
			
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap0 = (Map<String, Object>)seriesData.get(0);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList0 = (List<Object>)seriesMap0.get("data");
			Map<String, String> extraParamY1_DataModel1 = extraConfigFields.get(0);
			
			seriesMap0.put("data", calculateY1(seriesDataList0, extraParamY1_DataModel1, extraConfigY1));
			
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap1 = (Map<String, Object>)seriesData.get(1);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList1 = (List<Object>)seriesMap1.get("data");
			Map<String, String> extraParamY1_DataModel2 = extraConfigFields.get(1);
			
			seriesMap1.put("data", calculateY1(seriesDataList1, extraParamY1_DataModel2, extraConfigY1));
			
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap2 = (Map<String, Object>)seriesData.get(2);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList2 = (List<Object>)seriesMap2.get("data");
			Map<String, String> extraParamY1_DataModel3 = extraConfigFields.get(2);
			
			seriesMap2.put("data", calculateY1(seriesDataList2, extraParamY1_DataModel3, extraConfigY1));
			
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap3 = (Map<String, Object>)seriesData.get(3);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList3 = (List<Object>)seriesMap3.get("data");
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap4 = (Map<String, Object>)seriesData.get(4);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList4 = (List<Object>)seriesMap4.get("data");	
			Map<String, String> extraParamY2_Rate = extraConfigFields.get(3);

			seriesMap3.put("data", calculateY2(seriesDataList3, seriesDataList4, extraParamY2_Rate, extraConfigY2));
			
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap5 = (Map<String, Object>)seriesData.get(5);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList5 = (List<Object>)seriesMap5.get("data");
			@SuppressWarnings("unchecked")
			Map<String, Object>  seriesMap6 = (Map<String, Object>)seriesData.get(6);
			@SuppressWarnings("unchecked")
    		List<Object> seriesDataList6 = (List<Object>)seriesMap6.get("data");	
			Map<String, String> extraParamY2_Ratio = extraConfigFields.get(5);

			seriesMap5.put("data", calculateY2(seriesDataList5, seriesDataList6, extraParamY2_Ratio, extraConfigY2));
			
			// Remove seriesMap4, seriesMap6
			seriesData.remove(seriesMap4);
			seriesData.remove(seriesMap6);
		}
		return jsonMap;
	}

	private BigDecimal[] calculateY2(List<Object> listNumerator, List<Object> listDenominator, Map<String, String> extraParam, Map<String, String> extraConfig) {
		String roundType = extraParam.get("roundType");
		int decimalPlaces = 0;
		if(extraParam.get("decimalPlaces") != null 
				&& StringUtils.isNotEmpty(String.valueOf(extraParam.get("decimalPlaces")))) {
			
			decimalPlaces = Integer.parseInt(String.valueOf(extraParam.get("decimalPlaces")));
		}
		boolean percentDisplay = Boolean.parseBoolean(String.valueOf(extraConfig.get("percentDisplay")));
		
		int n = listNumerator.size();
		BigDecimal[] newList = new BigDecimal[n];
				
		for (int i=0; i<n; i++) {
			Double numerator = 0d;
			Double denominator = 0d;
			
			Object numeratorObj = listNumerator.get(i);
			Object denominatorObj = listDenominator.get(i);
			
			// check NULL
			if(numeratorObj != null && StringUtils.isNotEmpty(String.valueOf(numeratorObj))) {
				numerator =  Double.parseDouble(String.valueOf(numeratorObj));
			}
			
			if(denominatorObj != null && StringUtils.isNotEmpty(String.valueOf(denominatorObj))) {
				denominator =  Double.parseDouble(String.valueOf(denominatorObj));
			}
			
			Double value = 0d;
			if(denominator != 0d) {
				value = numerator / denominator;
				if(percentDisplay) {
					value = value * 100;
				}
			}
			// TODO: kien-dx change roundValue to NEW Function
			BigDecimal bigValue = (BigDecimal) widgetHandler.roundValue(new BigDecimal(value), roundType, decimalPlaces);
			newList[i] = bigValue;
		}
		
		return newList;
	}
	
	
	private BigDecimal[] calculateY1(List<Object> list, Map<String, String> extraParam, Map<String, String> extraConfig) {
		String roundType = extraParam.get("roundType");
		int decimalPlaces = 0;
		if(extraParam.get("decimalPlaces") != null 
				&& StringUtils.isNotEmpty(String.valueOf(extraParam.get("decimalPlaces")))) {
			
			decimalPlaces = Integer.parseInt(String.valueOf(extraParam.get("decimalPlaces")));
		}		
		boolean percentDisplay = Boolean.parseBoolean(String.valueOf(extraConfig.get("percentDisplay")));

		int n = list.size();
		BigDecimal[] newList = new BigDecimal[n];
				
		for (int i=0; i<n; i++) {
			Double value = 0d;
			Object valueObj = list.get(i);
			
			// check NULL
			if(valueObj != null && StringUtils.isNotEmpty(String.valueOf(valueObj))) {
				value = Double.parseDouble(String.valueOf(valueObj));
			}
			
			
			if(percentDisplay) {
				value = value * 100;
			}
			// TODO: kien-dx change roundValue to NEW Function
			BigDecimal bigValue = (BigDecimal) widgetHandler.roundValue(new BigDecimal(value), roundType, decimalPlaces);
			newList[i] = bigValue;
		}
		
		return newList;
	}

}