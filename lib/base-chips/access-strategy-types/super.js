var Sealious = require("sealious");
var Promise = require("bluebird");

var Super = new Sealious.ChipTypes.AccessStrategyType({
	name: "super",
	checker_function: function(context, params, item){
		if (context.is_super) {
			return Promise.resolve();
		} else {
			return Promise.reject("This action cannot be performed by a regular user, but only by the server itself.");
		}
	},
	item_sensitive: true
});

module.exports = Super;