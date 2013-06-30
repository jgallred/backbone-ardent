/* Implementation
 - Mixin like Backbone.Validation
 - Validate with Validator
 - fire error events on successful 
 - only validate on save, not on every set
 - expose errors object on model instance
 - Mimick Ardent
    - use static rule set
    - forceSave method
    - allow rules and customMsgs on save options and on validate()
    - beforeSave and afterSave hooks?
    - allow static customMsgs hash
    - allow custom validators
 - 

*/

Backbone.Validator = Validator;

Backbone.Ardent = Backbone.Model.extend({
	/* Instance properties and methods */
}, {
	/* Static properties and methods */
});