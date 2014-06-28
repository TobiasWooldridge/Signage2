$unibuddy = (function() {
	var baseUrl = "http://api.unibuddy.com.au/api/v2/";

	var unibuddy = {};
	
	unibuddy.loadBuildingMeta = function(code, callback) {
		$http.getJson(baseUrl + "uni/flinders/buildings/" + code + ".json",
			function(status, response) {
				callback(response.data);
			});
	};

	unibuddy.loadRooms = function(code, callback) {
		$http.getJson(baseUrl + "uni/flinders/buildings/" + code + "/rooms.json",
			function(status, response) {
				callback(response.data);
			});
	};

	unibuddy.getNews = function(callback) {
		$http.getJson(baseUrl + "uni/flinders/news.json",
			function(status, response) {
				callback(response.data);
			});
	};

	unibuddy.getTermWeeks = function(callback) {
		$http.getJson(baseUrl + "uni/flinders/week.json",
			function(status, response) {
				callback(response.data);
			});
	};

	unibuddy.getWeek = function(callback) {
		$http.getJson(baseUrl + "uni/flinders/weeks/current.json",
			function(status, response) {
				callback(response.data);
			});
	};

	return unibuddy;
})();
