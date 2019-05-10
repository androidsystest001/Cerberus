1. Chưa có setting Database scripts
2. TripleDataModelChartDataController.java thì đang để TODO chỗ hàm làm tròn, nhờ thay thế hàm làm tròn mới (hỗ trợ làm tròn đơn vị 1000)

3. Xử lý check NULL cho ResultAndRateChartDataController.java, MovingAverageChartDataController.java

Ví dụ những chỗ đang coding:
Integer.parseInt(String.valueOf(xxx)
Double.parseDouble(String.valueOf(yyy)
thì văng exception khi NULL nên cần sửa như sau:

	Double value = 0d;
	Object valueObj = list.get(i);
	
	// check NULL
	if(valueObj != null && StringUtils.isNotEmpty(String.valueOf(valueObj))) {
		value = Double.parseDouble(String.valueOf(valueObj));
	}



THAM KHẢO file TripleDataModelChartDataController.java để sửa cho ResultAndRateChartDataController.java, MovingAverageChartDataController.java

Lưu ý khi test: 3 datamodel thì phải tồn tại key (mà đã chọn ở trục X) để JOIN.
(Xem QA)

Files:

/insight-web/src/main/webapp/js/json/urlStore.json

/insight-web/src/main/java/jp/smartinsight/web/controller/TripleDataModelChartDataController.java

/insight-web/src/main/webapp/WEB-INF/html/included/charts/TripleDataModelChart.html

/insight-web/src/main/webapp/WEB-INF/html/widgetCreation.html

/insight-web/src/main/webapp/js/controllers/hcharts/TripleDataModelChartCtrl.js

/insight-web/src/main/webapp/js/controllers/TripleDataModelChartConfigCtrl.js

/insight-web/src/main/webapp/js/controllers/widgetCreationCtrl.js