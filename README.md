# Angular Google A/B Testing
An implementation of Google A/B testing in AngularJS

## How to use

This is largely a wrapper around Google's own [Content Experiments Without Redirects](https://developers.google.com/analytics/solutions/experiments-client-side).

Make sure to add [Google Tag Manager](http://www.google.com/tagmanager/) to the page. Which
variation you're in gets sent with subsequent page views, so you'll need it for logging.
[Angularytics](http://luisfarzati.github.io/angulartics/) is a pretty good implementation to help
with Google Analytics.

Grab your experiment id from Google and configure it like so:

```
// Make sure googleAbTesting module is a dependency of your app.
angular.module('myApp', ['googleAbTesting'])

// Configure the Google experiment id
.config(['googleAbTestingProvider', function(googleAbTestingProvider) {
	googleAbTestingProvider.setExperimentId('xxxxx');
}]);
```

You can now show/hide content based on which variation a user is in:

```
<h1 variation="0">Welcome to my personal homepage</h1>
<h1 variation="1">I created a homepage and you're not going to believe what happened next!!</h1>
<h1 variation="2">Free iPod!</h1>
```

That's all there is to it!
