$unibuddy = (function() {
	var unibuddy = {};
	
	unibuddy.loadBuildingMeta = function(code, callback) {
		$http.getJson("http://api.unibuddy.com.au/api/v2/uni/flinders/buildings/" + code + ".json",
			function(status, response) {
				callback(response.data);
			});
	};

	unibuddy.loadRooms = function(code, callback) {
		$http.getJson("http://api.unibuddy.com.au/api/v2/uni/flinders/buildings/" + code + "/rooms.json",
			function(status, response) {
				callback(response.data);
			});
	};

	return unibuddy;
})();
