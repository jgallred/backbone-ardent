/* Implementation
 - Mixin like Backbone.Validation
 - Validate with Validator
 X fire error events on successful 
 - only validate on save, not on every set
 - expose errors object on model instance
 X allows creating rules/messages with function
 - Mimick Ardent
    - forceSave method
    - allow rules and customMsgs on save options and on validate()
    - beforeSave and afterSave hooks?
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

    validate : function(attribute, options) {
        var opts = {}, attr = null;
        if (arguments.length === 1) {
            if (_.isString(attribute) || _.isArray(attribute)) {
                attr = attribute;
            } else if (_.isObject(attribute)) {
                opts = attribute;
            }
        } else if (arguments.length > 1) {
            if (_.isString(attribute) || _.isArray(attribute)) {
                attr = attribute;
            }
            if (_.isObject(options)) {
                opts = options;
            }
        }

        var attributes = this.attributes;
        var rules = this.getRules();

        if (!_.isUndefined(opts.rules) &&
            (_.isObject(opts.rules) || _.isFunction(opts.rules))
        ) {
            // Override rules for this invocation
            rules = _.isObject(opts.rules) ? opts.rules : opts.rules.apply(this);
        }

        if (!_.isNull(attr)) {
            // Validate only specific attributes if desired
            attributes = _.pick(attributes, attr);
        }

        // Let Laravel style validation take over
        var validator = new Validator(attributes, rules);
        // Make the errors result available on the model
        this.errors = validator.errors;
        if (validator.fails()) {
            for (var prop in this.errors) {
                if (_.has(this.errors, prop)) {
                    this.trigger('invalid:'+prop, this, this.errors.get(prop));
                }
            }

            this.trigger('invalid', this, this.errors);
        }
        return validator.passes();
    }
});