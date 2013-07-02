xdescribe('Backbone.Ardent', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent({'phone':''});
    });

    afterEach(function(){
        ardent = null;
    });

    it('allows custom validators to be defined', function() {
        Backbone.Validator.register('telephone', function(value) {
            return value.match(/^\d{3}-\d{3}-\d{4}$/);
        }, 'The :attribute phone number is not in the format XXX-XXX-XXXX.');

        expect(ardent.isValid('phone', {rules:{phone:'telephone'}})).toBe(false);
        expect(ardent.validationError).toBeTruthy();
        expect(ardent.validationError.get('phone').length).toBe(1);
        expect(ardent.validationError.first('phone'))
            .toEqual('The phone phone number is not in the format XXX-XXX-XXXX.');
    });

    it('allows custom validators to be defined with arguments', function() {
        Backbone.Validator.register('int', function(value, requirement) {
            return value === parseInt(requirement,10);
        }, 'The :attribute is not the number :int.');

        ardent.set({num:3});
        expect(ardent.isValid('num', {rules:{num:'int:5'}})).toBe(false);
        expect(ardent.validationError).toBeTruthy();
        expect(ardent.validationError.get('num').length).toBe(1);
        expect(ardent.validationError.first('num'))
            .toEqual('The num is not the number 5.');
    });
    
});