(function() {
	'use strict';
	angular.module('googleAbTesting', [])
	.constant('GOOGLE_EXPERIMENTS', {
		baseUrl: '//www.google-analytics.com/cx/api.js?experiment=',
		timeout: 300,
		maxTries: 8
	})
	.provider('googleAbTesting', ['GOOGLE_EXPERIMENTS',
		  	function GoogleAbTestingProvider(GOOGLE_EXPERIMENTS) {
		var _experimentId = null,
			tries = 0,
			_setExperimentId,
			_getExperimentId,
			scriptAdded = false;

		this.setExperimentId = _setExperimentId = function(experimentId) {
			_experimentId = experimentId;
		};
		this.getExperimentId = _getExperimentId = function() {
			return _experimentId;
		};

		var _appendScript = function(experimentId) {
			if (scriptAdded) {
				return;
			}
			scriptAdded = true;
			var s = document.createElement('script');
			s.src = GOOGLE_EXPERIMENTS.baseUrl + experimentId;
			document.body.appendChild(s);
		};

		var deferred;
		var _getVariation = function($q, $interval) {
			if (!deferred) {
				deferred = $q.defer();
			}

			if (!this.getExperimentId()) {
				deferred.reject('Google Experiment ID not set');
				return deferred.promise;
			}
			_appendScript(this.getExperimentId());

			var to = $interval(function loadGoogleApi() {
				if (typeof cxApi !== 'undefined') {
					deferred.resolve(cxApi.chooseVariation());
					$interval.cancel(to);
					return;
				}
				if (++tries > GOOGLE_EXPERIMENTS.maxTries) {
					deferred.reject('cxApi not loaded within ' +
						GOOGLE_EXPERIMENTS.maxTries + ' tries');
					$interval.cancel(to);
					return;
				}
			});
			return deferred.promise;
		};

		this.$get = ['$q', '$interval', function($q, $interval) {
			return {
				setExperimentId: _setExperimentId,
				getExperimentId: _getExperimentId,
				getVariation: function() {
					return _getVariation.call(this, $q, $interval);
				}
			};
		}];
	}])
	.directive('variation', ['$log', 'googleAbTesting', function($log, googleAbTesting) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				element.addClass('ng-cloak');
				function toggleElement(visible) {
						if (visible) {
							element.removeClass('ng-cloak');
							element.removeClass('ng-hide');
						} else {
							element.addClass('ng-hide');
						}
				}

				scope.$watch(attrs.variation, function(value) {
					googleAbTesting.getVariation().then(function(variation) {
						toggleElement(variation == parseInt(value));
						return variation;
					}).catch(function(err) {
						// Default to variation 0 if no experiment found
						toggleElement(parseInt(value) === 0);
					});
				});
			}
		};
	}]);
})();
