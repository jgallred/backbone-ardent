Backbone.Ardent = (function(_, Backbone){
    'use strict';

    var hook = {};

    (function(window){
        /* jshint unused: false */
        //= ../node_modules/validatorjs/src/validator.js
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
        mixin : mixin,

        mixInto : function(ClassRef) {
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
                            initialize : function(attributes, options){
                                options || (options = {});
                                _.extend(this, _.pick(options, 'rules', 'messages'));
                                oldInit.apply(this, arguments);
                            }
                        }
                    );
                }  else {
                    _.extend(ClassRef.prototype, mixin,{
                        /**
                         * Allows you to inject different rules into the new instance
                         * @param {Object} attributes
                         * @param {Object} options 
                         */
                        initialize : function(attributes, options){
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