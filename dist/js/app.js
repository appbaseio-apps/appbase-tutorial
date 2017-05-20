(function() {
	angular.module('Appbase', [])
	.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.defaults.withCredentials = true;
		}
	]);
})();
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

angular
	.module('Appbase')
	.controller('TutorialController', TutorialController);

TutorialController.$inject = ['$scope', '$http', '$location', '$timeout', 'Loader', 'TutorialService'];

function TutorialController($scope, $http, $location, $timeout, Loader, TutorialService) {
	appbaseRef = null;

	//Progressbar
	$scope.$watch('activeState', function(oldVal, newVal) {
		var stepProgress = (100 * $scope.activeState) / $scope.totalStep;
		if (stepProgress > $scope.stepProgress) {
			$scope.stepProgress = stepProgress;
			$scope.stepCompletion = stepProgress == 100;
			Loader($scope.stepProgress, true, $scope.stepCompletion);
		}
	});

	//Initial steps
	$scope.initialize_var = function() {
		//Variables
		$scope.activeState = 1;
		$scope.current_step = 1;
		$scope.stepProgress = 0;
		$scope.totalStep = 6;
		$scope.languages = ['Javascript', 'cURL'];
		$scope.variables = {
			app_name: '',
			// app_name: 'testApp2',
			created_app: {
				name: '$app',
				user: '$user',
				pass: '$pass',
				type: 'product',
				id: '1',
				jsonobject: $('<div>').addClass('highlight-light').html("<pre><code>{<br>name: 'A green door',<br>price: 12.50,<br>tags: ['home', 'green'],<br>stores: ['Walmart', 'Target']<br>}</code></pre>"),
				purejson: {
					name: 'A green door',
					price: 12.50,
					tags: ['home', 'green'],
					stores: ['Walmart', 'Target']
				}
			}
		};

		//Signal status
		$scope.spinner = {
			activeIcon: {
				container: 'btn-success',
				active: 'active',
				status: {
					title: 'Stream',
					text: 'Stream is waiting for data updates.'
				}
			},
			deadIcon: {
				container: 'btn-warning',
				active: 'active',
				status: {
					title: 'Stream',
					text: 'Stream is waiting for data updates.'
				}
			}
		};

		//Default vars to set the text
		$scope.vars = {
			getStream: {
				consoleBtn: false,
				btnText: {
					title: 'Update Data',
					text: 'Update the JSON object.'
				},
				modal: {
					title: 'Update Data',
					text: 'Update the current JSON object.'
				},
				spinner: $scope.spinner.deadIcon
			},
			searchStream: {
				consoleBtn: false,
				btnText: {
					title: 'Add Data',
					text: 'Insert new data in the type.'
				},
				modal: {
					title: 'Add Data',
					text: 'Insert new data in the query type and see realtime matches via stream.'
				},
				spinner: $scope.spinner.deadIcon
			}
		};


		hljs.initHighlighting();
		var window_height = $(window).height() - 114 - 60;
		$('.tutorial-main-container').css({
			"min-height": window_height
		});

		$('[data-toggle="popover"]').mouseover(function() {
			$(this).popover('show');
		});
		$('[data-toggle="popover"]').mouseleave(function() {
			$(this).popover('hide');
		});

		$scope.updateStep = false;
		$scope.step_change(1);
	}

	$scope.init = function() {
		console.log("Tutorial is waiting for element");
		if($('.tutorial-container').length) {
			$scope.initialize_var();
		} else {
			$timeout($scope.init, 500);
		}
	}
	$scope.init();

	//Check auth
	function check_auth() {
		TutorialService.auth().success(function(data) {}).error(function(data) {
			// window.location.href = 'index.html';
		});
	}

	//On Enter
	$scope.app_submit = function(event) {
		var enter_flag = (event.keyCode == 13) || (event.which == 13);
		if (enter_flag) {
			$('.tutorial-app-name-container .loading-container').show();
			// var data = {
			// 	body: {
			// 		id: 684,
			// 		password: "dd655199-eb1c-40c5-9dfa-4c1dd0305272",
			// 		username: "91bI6pXn7"
			// 	}
			// };
			// $scope.variables.created_app.user = data.body.username;
			// $scope.variables.created_app.pass = data.body.password;
			// $scope.variables.created_app.name = $scope.variables.app_name;

			// setTimeout(function() {
			// 	hljs.initHighlighting.called = false;
			// 	hljs.initHighlighting();
			// 	$('.tutorial-app-name-container').addClass('disabled');
			// 	$('.tutorial-part-input').attr('readonly', 'true');
			// 	$scope.step_change(2);
			// 	$('.tutorial-app-name-container .loading-container').hide();
			// 	$scope.popover();
			// }, 500);

			//Create App
			TutorialService.createApp($scope.variables.app_name).success(function(data) {
				if (data.message == 'App Created') {
					TutorialService.getPermission(data.body.id).success(function(data) {
						data.body.forEach(function(permission) {
							if(permission.read && permission.write) {
								$scope.setupPermission(permission.username, permission.password);
							}
						});
					});
				} else {
					alert('Please try again');
					$('.tutorial-app-name-container .loading-container').hide();
				}
			}).error(function(data) {
				alert('An app with the same name exists');
				$('.tutorial-app-name-container .loading-container').hide();
			});

		}
	}

	$scope.setupPermission = function(username, password) {
		$scope.variables.created_app.user = username;
		$scope.variables.created_app.pass = password;
		$scope.variables.created_app.name = $scope.variables.app_name;
		setTimeout(function() {
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
			$('.tutorial-app-name-container').addClass('disabled');
			$('.tutorial-part-input').attr('readonly', 'true');
			$scope.step_change(2);
			$('.tutorial-app-name-container .loading-container').hide();
			$scope.popover();
		}, 500);
	}

	//Code next
	var $tabs = $('.code-block .nav li');
	$scope.code_next = function(method, stepIndex) {
		$scope.step_change(stepIndex);

		switch (stepIndex) {
			case 4:
				TutorialService.step1($scope.variables.created_app).success(function(data) {
					$scope.show_response(4, data);
				})
				break;
			case 5:
				TutorialService.step2.get($scope.variables.created_app).on('data', function(data) {
					$timeout(function() {
						$scope.vars.getStream.consoleBtn = true;
						$scope.readDocument = data;
					}, 0);
					onscuccessStep(data, 5);
					TutorialService.step2.stream($scope.variables.created_app).on('data', function(data) {
						$timeout(function() {
							$scope.vars.getStream.spinner = $scope.spinner.activeIcon;
							$scope.readDocument = data;
						}, 0);
						onscuccessStep(data, 5);
					}).on('error', function(err) {
						onerrorStep(err, 5);
					});
				}).on('error', function(err) {
					onerrorStep(err, 5);
				});
				break;
			case 6:
				TutorialService.step3.get($scope.variables.created_app).on('data', function(data) {
					$timeout(function() {
						$scope.vars.searchStream.consoleBtn = true;
					}, 0);
					onscuccessStep(data, 6);
					TutorialService.step3.stream($scope.variables.created_app).on('data', function(data) {
						$timeout(function() {
							$scope.vars.searchStream.spinner = $scope.spinner.activeIcon;
						}, 0);
						onscuccessStep(data, 6);
					}).on('error', function(err) {
						onerrorStep(err, 6);
					});
				}).on('error', function(err) {
					onerrorStep(err, 6);
				});
				break;
		}
	}

	function onscuccessStep(data, index) {
		$scope.show_response(index, data, false, true);
	}

	function onerrorStep(err, index) {
		console.log("streaming error: ", err);
		$scope.show_response(index, 'You need to insert data first, from index data card.', true);
	}

	$scope.change_tab = function() {
		$scope.current_step = 1;
		$scope.show_response('', true);
	}

	$scope.setCurrentState = function(index) {
		$timeout(function() {
			$scope.current_step = index;
			if ($scope.current_step == 2) {
				$scope.current_caption = 'Update';
			} else {
				$scope.current_caption = 'Insert';
			}
		}, 0);
	}
	$scope.show_response = function(index, data, hlStop, append) {
		var stepIndex = index - 2;
		var $current_div = $('.tutorial-container .tutorial-part:eq(' + stepIndex + ')');
		var $response_div = $current_div.find('.show_response');

		if (hlStop) {
			$response_div.html('<h3 class="text-center">' + data + '</h3>');
		} else {
			$scope.show_response_data = data;
			var response_div = $('<div>').addClass('highlight-response').html('&nbsp\n' + JSON.stringify($scope.show_response_data, null, 4));

			if (append) {
				$response_div.find('.highlight-response').removeClass('highlight-response');
				$response_div.append(response_div);
			} else
				$response_div.html(response_div);

			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
			$scope.popover();
		}
		$('.console-block .loading-container').hide();
		if (!$scope.updateStep) {
			try {
				var top = $current_div.find('.console-block').offset().top;
				$("html, body").animate({
					scrollTop: top
				}, "fast");
			} catch (err) {
				console.log(e);
			};
		} else {
			$timeout(function() {
				$scope.updateStep = false;
			}, 2000);
		}
		setTimeout(function() {
			var highlightDiv = $current_div.find('.console-block').find('.highlight-response');
			if (highlightDiv.length) {
				var top = highlightDiv.offset().top;
				$current_div.find('.console-block').find("pre").animate({
					scrollTop: top
				}, "fast");
			}
		}, 300);
	}

	$scope.language_change = function() {
		$scope.step_change(3);
	}

	$scope.popover = function() {
		for (var key in $scope.variables.created_app) {
			$(".created_app_" + key).popover({
				content: $scope.variables.created_app[key],
				trigger: 'hover',
				html: true,
				placement: 'top'
			});
		};
	}

	$scope.step_change = function(index) {
		$timeout(function() {
			$scope.activeState = index;
		}, 0);
		$('.tutorial-container').attr('data-current-step', index);
		for (var i = 0; i < index; i++) {
			$('.tutorial-container .tutorial-part:eq(' + i + ')').css({
				'max-height': '2000px',
				'padding': '10px',
				'overflow': 'inherit',
				'opacity': 1
			})
		}
		if (index != 4 && index != 5) {
			var lastIndex = index - 1;
			var newStepOffset = $('.tutorial-container .tutorial-part:eq(' + lastIndex + ')').offset().top - 80;
			$("html, body").animate({
				scrollTop: newStepOffset
			}, "fast");
		}
	}

	$scope.insert_data = {
		show: function(caption) {
			$scope.current_caption = caption;
			$scope.current_modal = $scope.current_caption == 'Update' ? $scope.vars.getStream.modal : $scope.vars.searchStream.modal;
			var a = new BootstrapDialog({
				title: '<i class="fa fa-rotate-right"></i> ' + $scope.current_modal.title,
				message: '<p class="explain-text">' + $scope.current_modal.text + '</p><textarea class="insert_text" id="insert-text"></textarea>',
				closable: true,
				cssClass: 'confirm-del insert_data_modal modal-appbase modal-blue',
				buttons: [{
					label: 'Submit',
					cssClass: 'btn-yes modal-btn',
					action: function(dialog) {
						$scope.insert_data.user_input = $scope.editor.getValue();
						try {
							if (JSON.parse($scope.insert_data.user_input)) {
								$scope.insert_data.user_input = JSON.parse($scope.insert_data.user_input);

								if ($scope.current_caption == 'Update') {
									var obj = {
										credentials: $scope.variables.created_app,
										userInput: {
											type: $scope.variables.created_app.type,
											id: $scope.variables.created_app.id,
											body: $scope.insert_data.user_input
										}
									};
								} else {
									var obj = {
										credentials: $scope.variables.created_app,
										userInput: {
											type: $scope.variables.created_app.type,
											body: $scope.insert_data.user_input
										}
									};
								}
								$scope.updateStep = true;
								TutorialService.insertData(obj).on('data', function(data) {
									dialog.close();
								});
							} else {
								alert('Invalid JSON Object.');
							}
						} catch (err) {
							console.log(err);
							alert('Invalid JSON Object.');
						}
					}
				}],
				onshown: function(dialogRef) {
					if ($scope.current_caption == 'Update') {
						var user_object = JSON.stringify($scope.readDocument._source, null, 4);
					} else {
						var user_object = JSON.stringify($scope.variables.created_app.purejson, null, 4);
					}
					user_object2 = user_object.replace(/<br.*?>/g, "\n");
					var defaultOptions = {
						lineNumbers: true,
						mode: "javascript",
						autoCloseBrackets: true,
						matchBrackets: true,
						showCursorWhenSelecting: true,
						tabSize: 2,
						extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
						foldGutter: true,
						gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
					};
					$scope.editor = CodeMirror.fromTextArea(document.getElementById("insert-text"), defaultOptions);
					$scope.editor.setValue(user_object2);
				}
			}).open();
		}
	}

	//Copy Replace
	$scope.copy = function() {
		var copied_text = window.getSelection().toString() + "";
		var tempObject = {
			'$app': '"' + $scope.variables.created_app.name + '"',
			'$user': $scope.variables.created_app.user,
			'$pass': $scope.variables.created_app.pass,
			'$type': '"' + $scope.variables.created_app.type + '"',
			'$id': $scope.variables.created_app.id,
			'$jsonobject': JSON.stringify($scope.variables.created_app.purejson, null, 4)
		};
		var res = copied_text.replace(/\$app|\$user|\$pass|\$type|\$id|\$jsonobject/gi, function myFunction(x) {
			return tempObject[x];
		});
		$('#onlyCopy').val(res).select();
		document.execCommand("copy");
	}
}
