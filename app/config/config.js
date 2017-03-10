(function() {
	angular.module('Appbase', [])
	.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.defaults.withCredentials = true;
		}
	]);
})();