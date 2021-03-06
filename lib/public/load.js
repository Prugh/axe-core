/*global Audit, runRules, runTool, cleanupTools, commons: true */
function runCommand(data, callback) {
	'use strict';

	var context = (data && data.context) || {};
	if (context.include && !context.include.length) {
		context.include = [document];
	}
	var options = (data && data.options) || {};

	switch(data.command) {
		case 'rules':
			return runRules(context, options, callback);
		case 'run-tool':
			return runTool(data.parameter, data.selectorArray, options, callback);
		case 'cleanup-tool':
			return cleanupTools(callback);
	}
}

function setDefaultConfiguration(audit) {
	'use strict';

	var config = audit || {};
	config.rules = config.rules || [];
	config.tools = config.tools || [];
	config.data = config.data || {
		checks: {},
		rules: {}
	};

	return config;
}

var styleSheet;
function injectStyle(style) {
	'use strict';

	if (styleSheet && styleSheet.parentNode) {
		styleSheet.parentNode.removeChild(styleSheet);
		styleSheet = null;
	}
	if (!style) {
		return;
	}

	var head = document.head || document.getElementsByTagName('head')[0];
	styleSheet = document.createElement('style');
	styleSheet.type = 'text/css';

	if (styleSheet.styleSheet === undefined) { // Not old IE
		styleSheet.appendChild(document.createTextNode(style));
	} else {
		styleSheet.styleSheet.cssText = style;
	}

	head.appendChild(styleSheet);

	return styleSheet;
}


/**
 * Sets up Rules, Messages and default options for Checks, must be invoked before attempting analysis
 * @param  {Object} audit The "audit specifcation" object
 * @private
 */
axe._load = function (audit) {
	'use strict';

	audit = setDefaultConfiguration(audit);

	axe._audit = new Audit(audit.reporter);
	commons = audit.commons;

	axe._audit.version = audit.version;
	var i, l;
	for (i = 0, l = audit.rules.length; i < l; i++) {
		axe._audit.addRule(audit.rules[i]);
	}
	for (i = 0, l = audit.tools.length; i < l; i++) {
		axe._audit.addTool(audit.tools[i]);
	}
	axe._audit.data = audit.data || {
		checks: {},
		rules: {}
	};

	injectStyle(audit.style);

	utils.respondable.subscribe('axe.ping', function (data, respond) {
		respond({axe: true});
	});

	utils.respondable.subscribe('axe.start', runCommand);
};
