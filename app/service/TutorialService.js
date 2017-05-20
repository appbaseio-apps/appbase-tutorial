angular
	.module('Appbase')
	.service('TutorialService', ['$http', TutorialService])
	.factory('Loader', ['$rootScope', '$timeout', Loader]);

var tutorial_adrs = 'https://accapi.appbase.io/';
function TutorialService($http) {
	this.auth = function() {
		return $http.get(tutorial_adrs + 'user');
	};

	this.createApp = function(app_name) {
		return $http.put(tutorial_adrs + 'app/' + app_name);
	};

	this.getPermission = function(appId) {
		return $http.get(tutorial_adrs + 'app/' + appId + '/permissions');
	}

	this.step1 = function(obj) {
		//stopStream();
		var create_link = 'https://scalr.api.appbase.io/' + obj.name + '/' + obj.type + '/' + obj.id;
		var json_obj = JSON.stringify(obj.purejson);
		var credentials = obj.user + ':' + obj.pass;
		return $http({
			url: create_link,
			method: 'PUT',
			headers: {
				'Authorization': 'Basic ' + btoa(credentials)
			},
			data: json_obj
		});
	};

	this.step2 = {
		get: function(obj) {
			createStream(obj)
			var get_type = appbaseRef.get({
				"type": obj.type,
				"id": obj.id
			});
			return get_type;
		},
		stream: function(obj) {
			//stopStream();
			createStream(obj);
			responseStream = appbaseRef.getStream({
				"type": obj.type,
				"id": obj.id
			});
			return responseStream;
		}
	}

	this.step3 = {
		get: function(obj) {
			createStream(obj)
			var get = appbaseRef.search({
				type: obj.type,
				body: {
					query: {
						match_all: {}
					}
				}
			});
			return get;
		},
		stream: function(obj) {
			//stopStream();
			createStream(obj);
			responseStream = appbaseRef.searchStream({
				type: obj.type,
				body: {
					query: {
						match_all: {}
					}
				}
			});
			return responseStream;
		}
	}

	this.insertData = function(obj) {
		createStream(obj.credentials);
		var responseInput = appbaseRef.index(obj.userInput);
		return responseInput;
	}

	function stopStream() {
		if (typeof responseStream !== 'undefined')
			responseStream.stop();
	}

	function createStream(obj) {
		if (appbaseRef == null) {
			appbaseRef = new Appbase({
				"url": "https://" + obj.user + ":" + obj.pass + "@scalr.api.appbase.io",
				"appname": obj.name
			});
		}
	}
}

function Loader($rootScope, $timeout) {
	return function(progress, animated, animateFlag) {
		$rootScope.animated = animated;
		$rootScope.animateFlag = animateFlag;
		$timeout(function() {
			$rootScope.loadLine = progress;
		});
	}
}
