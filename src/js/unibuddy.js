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

	unibuddy.getTermDates = function(callback) {
		$http.getJson(baseUrl + "uni/flinders/dates.json",
			function(status, response) {
				callback(response.data);
			});
	};

	return unibuddy;
})();
