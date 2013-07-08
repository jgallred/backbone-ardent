/*! backbone-ardent - v0.5.0 - 2013-07-08
* Copyright (c) 2013 Jason Allred; Licensed MIT */
Backbone.Ardent = (function(_, Backbone){
    'use strict';

    var hook = {};

    (function(window){
        /* jshint unused: false */
        (function() {
        
        	var messages = {
        		accepted: 'The :attribute must be accepted.',
        		alpha: 'The :attribute field must contain only alphabetic characters.',
        		alpha_dash: 'The :attribute field may only contain alpha-numeric characters, as well as dashes and underscores.',
        		alpha_num: 'The :attribute field must be alphanumeric.',
        		confirmed: 'The :attribute confirmation does not match.',
        		email: 'The :attribute format is invalid.',
        		def: 'The :attribute attribute has errors.',
        		different: 'The :attribute and :different must be different.',
        		'in': 'The selected :attribute is invalid.',
        		integer: 'The :attribute must be an integer.',
        		min: {
        			numeric: 'The :attribute must be at least :min.',
        			string: 'The :attribute must be at least :min characters.'
        		},
        		max: {
        			numeric: 'The :attribute must be less than :max.',
        			string: 'The :attribute must be less than :max characters.'
        		},
        		not_in: 'The selected :attribute is invalid.',
        		numeric: 'The :attribute must be a number.',
        		required: 'The :attribute field is required.',
        		same: 'The :attribute and :same fields must match.',
        		size: {
        			numeric: 'The :attribute must be :size.',
        			string: 'The :attribute must be :size characters.'
        		},
        		url: 'The :attribute format is invalid.'
        	};
        
        	// Based on jquery's extend function
        	function extend() {
        		var src, copy, name, options, clone,
        			target = arguments[0] || {},
        			i = 1,
        			length = arguments.length;
        
        		for ( ; i < length; i++ ) {
        			// Only deal with non-null/undefined values
        			if ( (options = arguments[ i ]) != null ) {
        				// Extend the base object
        				for ( name in options ) {
        					src = target[ name ];
        					copy = options[ name ];
        
        					// Prevent never-ending loop
        					if ( target === copy ) {
        						continue;
        					}
        
        					// Recurse if we're merging plain objects or arrays
        					if ( copy && typeof copy === "object" ) {
        						clone = src && typeof src === "object" ? src : {};
        
        						// Never move original objects, clone them
        						target[ name ] = extend( clone, copy );
        
        					// Don't bring in undefined values
        					} else if ( copy !== undefined ) {
        						target[ name ] = copy;
        					}
        				}
        			}
        		}
        
        		// Return the modified object
        		return target;
        	}
        
        	function mergeMessages(basic, custom) {
        		return extend({}, basic, custom);
        	}
        
        	var ValidatorErrors = function() {};
        
        	ValidatorErrors.prototype = {
        		constructor: ValidatorErrors,
        
        		get: function(attribute) {
        			if (this[attribute]) {
        				return this[attribute];	
        			}
        
        			return [];
        		},
        
        		first: function(attribute) {
        			if (this[attribute]) {
        				return this[attribute][0];	
        			}
        			
        			return false;
        		}
        	};
        
        	var Validator = function(input, rules, customMessages) {
        		this.input = input;
        		this.rules = rules;
        		this.messages = mergeMessages(messages, customMessages || {});
        
        		this.errors = new ValidatorErrors();
        
        		this.errorCount = 0;
        		this.check();
        	};
        
        	Validator.prototype = {
        		constructor: Validator,
        
        		// replaces placeholders in tmpl with actual data
        		_createMessage: function(tmpl, data) {
        			var message, key;
        
        			if (typeof tmpl === 'string' && typeof data === 'object') {
        				message = tmpl;
        
        				for (key in data) {
        					if (data.hasOwnProperty(key)) {
        						message = message.replace(':' + key, data[key]);
        					}
        				}
        			}
        
        			return message;
        		},
        
        		check: function() {
        			var key, val, curRules, curRulesLen, i, rule, ruleVal, passes, msg, msgTmpl, dataForMessageTemplate;
        
        			for (key in this.input) {
        				if (this.input.hasOwnProperty(key)) { // make sure property is not inherited
        					val = this.input[key];
        
        					if (this.rules.hasOwnProperty(key)) { //check if a rule exists in rules object
        						curRules = this.rules[key].split('|');
        						curRulesLen = curRules.length;
        
        						for (i = 0; i < curRulesLen; i++) { //iterate over rules
        							rule = curRules[i];
        
        							if (rule.indexOf(':') >= 0) {
        								rule = rule.split(':');
        
        								ruleVal = rule[1];
        								rule = rule[0];
        							} else {
        								ruleVal = null;
        							}
        
        							passes = this.validate[rule].call(this, val, ruleVal, key);
        
        							if (!passes) {
        								if ( !this.errors.hasOwnProperty(key) ) {
        									this.errors[key] = [];
        								}
        
        								dataForMessageTemplate = this._createErrorMessageTemplateData(key, rule, ruleVal);
        								msgTmpl = this._selectMessageTemplate(rule, val, key);
        								msg = this._createMessage(msgTmpl, dataForMessageTemplate);
        
        								this._addErrorMessage(key, msg);
        							}
        						}
        					}
        				}
        			}
        		},
        
        		_addErrorMessage: function(key, msg) {
        			this.errors[key].push(msg);
        			this.errorCount++;
        		},
        
        		_createErrorMessageTemplateData: function(key, rule, ruleVal) {
        			var dataForMessageTemplate = { attribute: key };
        			dataForMessageTemplate[rule] = ruleVal; // if no rule value, then this will equal to null
        			
        			return dataForMessageTemplate;
        		},
        
        		// selects the correct message template from the messages variable based on the rule and the value
        		_selectMessageTemplate: function(rule, val, key) {
        			var msgTmpl, messages = this.messages;
        
        			// if the custom error message template exists in messages variable
        			if (messages.hasOwnProperty(rule+'.'+key)) {
        				msgTmpl = messages[rule+'.'+key];
        			} else if (messages.hasOwnProperty(rule)) {
        				msgTmpl = messages[rule];
        
        				if (typeof msgTmpl === 'object') {
        					switch (typeof val) {
        						case 'number':
        							msgTmpl = msgTmpl['numeric'];
        							break;
        						case 'string':
        							msgTmpl = msgTmpl['string'];
        							break;
        					}
        				}
        			} else { // default error message
        				msgTmpl = messages.def;
        			}
        
        			return msgTmpl;
        		},
        
        		passes: function() {
        			return this.errorCount === 0 ? true : false;
        		},
        
        		fails: function() {
        			return this.errorCount > 0 ? true : false;
        		},
        
        		first: function(key) {
        			return this.errors.hasOwnProperty(key) ? this.errors[key][0] : null;
        		},
        
        		// validate functions should return T/F
        		validate: {
        			required: function(val) {
        				var str;
        
        				if (val === undefined || val === null) {
        					return false;
        				}
        
        				str = String(val).replace(/\s/g, "");
        				return str.length > 0 ? true : false;
        			},
        
        			// compares the size of strings
        			// with numbers, compares the value
        			size: function(val, req) {
        				req = parseFloat(req);
        
        				if (typeof val === 'number') {
        					return val === req ? true : false;
        				}
        				
        				return val.length === req ? true : false;
        			},
        
        			// compares the size of strings
        			// with numbers, compares the value
        			min: function(val, req) {
        				if (typeof val === 'number') {
        					return val >= req ? true : false;
        				} else {
        					return val.length >= req ? true : false;
        				}
        			},
        
        			// compares the size of strings
        			// with numbers, compares the value
        			max: function(val, req) {
        				if (typeof val === 'number') {
        					return val <= req ? true : false;
        				} else {
        					return val.length <= req ? true : false;
        				}
        			},
        
        			email: function(val) {
        				return (/\w+@\w{2,}\.\w{2,}/).test(val);
        			},
        
        			numeric: function(val) {
        				var num = Number(val); // tries to convert value to a number. useful if value is coming from form element
        			
        				if (typeof num === 'number' && !isNaN(num) && typeof val !== 'boolean') {
        					return true;
        				} else {
        					return false;
        				}
        			},
        
        			url: function(val) {
        				return (/^https?:\/\/\S+/).test(val);
        			},
        
        			alpha: function(val) {
        				return (/^[a-zA-Z]+$/).test(val);
        			},
        
        			alpha_dash: function(val) {
        				return (/^[a-zA-Z0-9_\-]+$/).test(val);
        			},
        
        			alpha_num: function(val) {
        				return (/^[a-zA-Z0-9]+$/).test(val);
        			},
        
        			same: function(val, req) {
        				var val1 = this.input[req];
        				var val2 = val;
        
        				if (val1 === val2) {
        					return true;
        				}
        				
        				return false;
        			},
        
        			different: function(val, req) {
        				var val1 = this.input[req];
        				var val2 = val;
        
        				if (val1 !== val2) {
        					return true;
        				}
        
        				return false;
        			},
        
        			"in": function(val, req) {
        				var list = req.split(',');
        				var len = list.length;
        				var returnVal = false;
        
        				val = String(val); // convert val to a string if it is a number
        
        				for (var i = 0; i < len; i++) {
        					if (val === list[i]) {
        						returnVal = true;
        						break;
        					}
        				}
        
        				return returnVal;
        			},
        
        			not_in: function(val, req) {
        				var list = req.split(',');
        				var len = list.length;
        				var returnVal = true;
        
        				val = String(val); // convert val to a string if it is a number
        
        				for (var i = 0; i < len; i++) {
        					if (val === list[i]) {
        						returnVal = false;
        						break;
        					}
        				}
        
        				return returnVal;
        			},
        
        			accepted: function(val) {
        				if (val === 'on' || val === 'yes' || val === 1 || val === '1') {
        					return true;
        				}
        
        				return false;
        			},
        
        			confirmed: function(val, req, key) {
        				console.log('confirmed', val, req, key);
        				var confirmedKey = key + '_confirmation';
        				if (this.input[confirmedKey] === val) {
        					return true;
        				}
        
        				return false;
        			},
        
        			integer: function(val) {
        				return (/^\d+$/).test(val);
        			}
        		}
        	};
        
        	// static methods
        	Validator.register = function(rule, fn, errMsg) {
        		this.prototype.validate[rule] = fn;
        
        		if (typeof errMsg === 'string') {
        			messages[rule] = errMsg;
        		}
        	};
        
        	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
        		module.exports = Validator;
        	} else {
        		window.Validator = Validator;
        	}
        	
        }());
    }(hook));

    var BBValidator = Backbone.Validator = window.Validator || hook.Validator;

    // Based on jquery's extend function
    function extend() {
        var src, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length;

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( copy && typeof copy === 'object' ) {
                        clone = src && typeof src === 'object' ? src : {};

                        // Never move original objects, clone them
                        target[ name ] = extend( clone, copy );

                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

    return Backbone.Model.extend({
        /**
         * {Object|Function} The Validator rules to enforce on the 
         * model.
         */
        rules : {},

        /**
         * {Object|Function} The Validator error message templates
         * to display on validation failure.
         */
        messages : {},

        /**
         * Allows you to inject different rules into the new instance
         * @param {Object} attributes
         * @param {Object} options 
         */
        constructor : function(attributes, options) {
            options || (options = {});
            _.extend(this, _.pick(options, 'rules', 'messages'));
            Backbone.Model.apply(this, arguments);
        },

        /**
         * @return {Object} The validatorjs rules for this instance
         */
        getRules : function() {
            return _.isFunction(this.rules) ? this.rules.apply(this) : this.rules;
        },

        /**
         * @return {Object} The validatorjs custom messages for this instance
         */
        getMessages : function() {
            return _.isFunction(this.messages) ? this.messages.apply(this) : this.messages;
        },

        validate : function(attributes, options) {
            var attrs = attributes ? attributes : this.attributes,
                rules = this.getRules(),
                messages = this.getMessages();

            options || (options = {});

            if (!_.isUndefined(options.rules) &&
                (_.isObject(options.rules) || _.isFunction(options.rules))
            ) {
                // Override rules for this invocation
                rules = extend({}, rules, _.isObject(options.rules) ? options.rules : options.rules.apply(this));
            }

            if (!_.isUndefined(options.messages) &&
                (_.isObject(options.messages) || _.isFunction(options.messages))
            ) {
                // Override messages for this invocation
                messages = extend({}, messages, _.isObject(options.messages) ? options.messages : options.messages.apply(this));
            }

            var validator = new BBValidator(attrs, rules, messages);

            // Make the errors result available on the model
            this.errors = validator.errors;
            if (validator.fails()) {
                return this.errors;
            }
        },

        _validateAttrs: function(attrs, options) {
            if (!options.validate || !this.validate) {
                return true;
            }
            var error = this.validationError = this.validate(attrs, options) || null;
            if (!error) {
                return true;
            }
            this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
            return false;
        },

        isValid : function(attribute, options) {
            var attrs = _.extend({}, this.attributes), opts = null;
            if (arguments.length === 1) {
                if (_.isString(attribute) || _.isArray(attribute)) {
                    attrs = _.pick(attrs, attribute);
                } else if (_.isObject(attribute)) {
                    opts = attribute;
                }
            } else if (arguments.length > 1) {
                if (_.isString(attribute) || _.isArray(attribute)) {
                    attrs = _.pick(attrs, attribute);
                }
                if (_.isObject(options)) {
                    opts = options;
                }
            }
            return this._validateAttrs(attrs, _.extend(opts || {}, { validate: true }));
        }
    });

}(_, Backbone));