var $http = (function() {
	var http = {};

	http.get = function (address, callback) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				callback(xhr.status, xhr.response);
			}
		};

		xhr.open("GET", address);
		xhr.send();
	};

	http.getJson = function (address, callback) {
		http.get(address, function(status, response) {
			callback(status, JSON.parse(response));
		});
	};

	return http;
})();