/*! backbone-ardent - v1.0.0 - 2014-01-12
* Copyright (c) 2014 Jason Allred; Licensed MIT */
Backbone.Ardent = (function (_, Backbone) {
    'use strict';

    var hook = {};

    (function (window) {
        /* jshint unused: false */
        (function() {
        	// Shim taken from MDN site
        	if (!Array.prototype.forEach) {
            Array.prototype.forEach = function (fn, scope) {
                'use strict';
                var i, len;
                for (i = 0, len = this.length; i < len; ++i) {
                    if (i in this) {
                        fn.call(scope, this[i], i, this);
                    }
                }
            };
        	}
        
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
        		var src, copy, name, options, clone;
        		var target = arguments[0] || {};
        		var i = 1;
        		var length = arguments.length;
        
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
        			var self = this;
        
        			this._each(this.rules, function(attributeToValidate) {
        				var rulesArray = this.rules[attributeToValidate].split('|');
        				var inputValue = this.input[attributeToValidate]; // if it doesnt exist in input, it will be undefined
        
        				rulesArray.forEach(function(ruleString) {
        					var ruleExtraction = self._extractRuleAndRuleValue(ruleString);
        					var rule = ruleExtraction.rule;
        					var ruleValue = ruleExtraction.ruleValue;
        					var passes, dataForMessageTemplate, msgTmpl, msg;
        
        					passes = self.validate[rule].call(self, inputValue, ruleValue, attributeToValidate);
        
        					if (!passes) {
        						if ( !self.errors.hasOwnProperty(attributeToValidate) ) {
        							self.errors[attributeToValidate] = [];
        						}
        
        						dataForMessageTemplate = self._createErrorMessageTemplateData(attributeToValidate, rule, ruleValue);
        						msgTmpl = self._selectMessageTemplate(rule, inputValue, attributeToValidate);
        						msg = self._createMessage(msgTmpl, dataForMessageTemplate);
        						self._addErrorMessage(attributeToValidate, msg);
        					}
        				});
        			}, this); // end of _each()
        		},
        
        		_each: function(obj, cb, context) {
        			for (var key in obj) {
        				cb.call(context, key);
        			}
        		},
        
        		/**
        		 * Extract a rule and a rule value from a ruleString (i.e. min:3), rule = min, ruleValue = 3
        		 * @param  {string} ruleString min:3
        		 * @return {object} object containing the rule and ruleValue
        		 */
        		_extractRuleAndRuleValue: function(ruleString) {
        			var obj = {};
        			var ruleArray;
        
        			obj.rule = ruleString;
        
        			if (ruleString.indexOf(':') >= 0) {
        				ruleArray = ruleString.split(':');
        				obj.rule = ruleArray[0];
        				obj.ruleValue = ruleArray[1];
        			}
        
        			return obj;
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
        			if (messages.hasOwnProperty(rule + '.' + key)) {
        				msgTmpl = messages[rule + '.' + key];
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
        				if (val) {
        					req = parseFloat(req);
        
        					if (typeof val === 'number') {
        						return val === req ? true : false;
        					}
        					
        					return val.length === req ? true : false;
        				}
        				
        				return true;
        			},
        
        			/**
        			 * Compares the size of strings or the value of numbers if there is a truthy value
        			 */
        			min: function(val, req) {
        				if (val === undefined || val === '') { return true; }
        
        				if (typeof val === 'number') {
        					return val >= req ? true : false;
        				} else {
        					return val.length >= req ? true : false;
        				}
        			},
        
        			/**
        			 * Compares the size of strings or the value of numbers if there is a truthy value
        			 */
        			max: function(val, req) {
        				if (val === undefined || val === '') { return true; }
        
        				if (typeof val === 'number') {
        					return val <= req ? true : false;
        				} else {
        					return val.length <= req ? true : false;
        				}
        			},
        
        			email: function(val) {
        				if (val === undefined || val === '') { return true; }
        				return (/\w+@\w{2,}\.\w{2,}/).test(val);
        			},
        
        			numeric: function(val) {
        				var num;
        
        				if (val === undefined || val === '') { return true; }
        
        				num = Number(val); // tries to convert value to a number. useful if value is coming from form element
        					
        				if (typeof num === 'number' && !isNaN(num) && typeof val !== 'boolean') {
        					return true;
        				} else {
        					return false;
        				}
        			},
        
        			url: function(url) {
        				if (url === undefined || url === '') { return true; }
        
        				return (/^https?:\/\/\S+/).test(url); 
        			},
        
        			alpha: function(val) {
        				if (val === undefined || val === '') { return true; }
        			
        				return (/^[a-zA-Z]+$/).test(val);
        			},
        
        			alpha_dash: function(val) {
        				if (val === undefined || val === '') { return true; }
        				return (/^[a-zA-Z0-9_\-]+$/).test(val);
        			},
        
        			alpha_num: function(val) {
        				if (val === undefined || val === '') { return true; }
        
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
        				var list, len, returnVal;
        
        				if (val) {
        					list = req.split(',');
        					len = list.length;
        					returnVal = false;
        
        					val = String(val); // convert val to a string if it is a number
        
        					for (var i = 0; i < len; i++) {
        						if (val === list[i]) {
        							returnVal = true;
        							break;
        						}
        					}
        
        					return returnVal;
        				}
        				
        				return true;
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
        				// console.log('confirmed', val, req, key);
        				var confirmedKey = key + '_confirmation';
        
        				if (this.input[confirmedKey] === val) {
        					return true;
        				}
        
        				return false;
        			},
        
        			integer: function(val) {
        				if (val === undefined || val === '') { return true; }
        
        				val = String(val);
        
        				if ( (/^\d+$/).test(val) ) {
        					return true;
        				} else {
        					return false;
        				}
        			}
        		}
        	};
        
        	// static methods
        	Validator.register = function(rule, fn, errMsg) {
        		this.prototype.validate[rule] = fn;
        		messages[rule] = (typeof errMsg === 'string') ? errMsg : messages['def'];
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

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            options = arguments[i];
            if (options !== null) {
                // Extend the base object
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (copy && typeof copy === 'object') {
                            clone = src && typeof src === 'object' ? src : {};

                            // Never move original objects, clone them
                            target[name] = extend(clone, copy);

                        // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

    var mixin = {
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
         * @return {Object} The validatorjs rules for this instance
         */
        getRules : function () {
            return _.isFunction(this.rules) ? this.rules.apply(this) : this.rules;
        },

        /**
         * @return {Object} The validatorjs custom messages for this instance
         */
        getMessages : function () {
            return _.isFunction(this.messages) ? this.messages.apply(this) : this.messages;
        },

        validate : function (attributes, options) {
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

            if (options.partial) {
                // Only use a subset of the rules. This avoids triggering
                // require errors for properties that we're not trying to test
                rules = _.pick.apply(_, [rules].concat(_.keys(attrs)));
            }

            var validator = new BBValidator(attrs, rules, messages);

            // Make the errors result available on the model
            this.errors = validator.errors;
            if (validator.fails()) {
                return this.errors;
            }
        },

        _validateAttrs: function (attrs, options) {
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

        isValid : function (attribute, options) {
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
            return this._validateAttrs(attrs, _.extend(opts || {}, { validate: true, partial: true }));
        }
    };

    var Ardent = Backbone.Model.extend({

        /**
         * Allows you to inject different rules into the new instance
         * @param {Object} attributes
         * @param {Object} options
         */
        /*constructor : function(attributes, options) {
            options || (options = {});
            _.extend(this, _.pick(options, 'rules', 'messages'));
            return Backbone.Model.apply(this, arguments);
        }*/
        /*initialize : function(attributes, options) {
            /* jshint camelcase: false /
            options || (options = {});
            _.extend(this, _.pick(options, 'rules', 'messages'));
            //Backbone.Model.prototype.initialize.apply(this, arguments);
            Ardent.__super__.initialize.apply(this, arguments);
        }*/
    }, {
        mixInto : function (ClassRef) {
            if (ClassRef.prototype) {
                // If there is already an initialize method
                if (!_.isUndefined(ClassRef.prototype.initialize) &&
                    _.isFunction(ClassRef.prototype.initialize)
                ) {
                    var oldInit = ClassRef.prototype.initialize;
                    _.extend(
                        ClassRef.prototype,
                        mixin,
                        {
                            /**
                             * Allows you to inject different rules into the new instance
                             * @param {Object} attributes
                             * @param {Object} options
                             */
                            initialize : function (attributes, options) {
                                options || (options = {});
                                _.extend(this, _.pick(options, 'rules', 'messages'));
                                oldInit.apply(this, arguments);
                            }
                        }
                    );
                }  else {
                    _.extend(ClassRef.prototype, mixin, {
                        /**
                         * Allows you to inject different rules into the new instance
                         * @param {Object} attributes
                         * @param {Object} options
                         */
                        initialize : function (attributes, options) {
                            options || (options = {});
                            _.extend(this, _.pick(options, 'rules', 'messages'));
                        }
                    });
                }
            }

            return ClassRef;
        }
    });

    //_.extend(Ardent.prototype, mixin);

    Ardent.mixInto(Ardent);

    return Ardent;

}(_, Backbone));