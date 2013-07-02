/* Implementation
 - Mixin like Backbone.Validation
 X Validate with Validator
 - fire error events on successful 
 - only validate on save, not on every set
 X expose errors object on model instance
 X allows creating rules/messages with function
 - Mimick Ardent
    N forceSave method
    Y allow rules and customMsgs on save options and on validate()
    N beforeSave and afterSave hooks?
    - allow custom validators
 X Allow validation of specific attr(s)

*/

Backbone.Validator = Validator;

Backbone.Ardent = Backbone.Model.extend({
    /**
     * {Object|Function} The Validator rules to enforce on the 
     * model.
     */
    rules : {},

    /**
     * {Object|Function} The Validator error message templates
     * to display on validation failure.
     */
    customMessages : {},

    /**
     * Allows you to inject different rules into the new instance
     * @param {Object} attributes
     * @param {Object} options 
     */
    constructor : function(attributes, options) {
        options || (options = {});
        _.extend(this, _.pick(options, 'rules', 'customMessages'));
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
    getCustomMessages : function() {
        return _.isFunction(this.customMessages) ? this.customMessages.apply(this) : this.customMessages;
    },

    validate : function(attributes, options) {
        var attrs = attributes ? attributes : this.attributes,
            rules = this.getRules();

        options || (options = {});

        if (!_.isUndefined(options.rules) &&
            (_.isObject(options.rules) || _.isFunction(options.rules))
        ) {
            // Override rules for this invocation
            rules = _.isObject(options.rules) ? options.rules : options.rules.apply(this);
        }

        var validator = new Validator(attrs, rules);

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