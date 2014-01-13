describe('Backbone.Ardent isValid', function () {

    var ardent;

    beforeEach(function (){
        ardent = new Backbone.Ardent({'name':''}, {rules: {'name' : 'required'}});
    });

    afterEach(function (){
        ardent = null;
    });

    it('delegates to validate', function () {
        spyOn(ardent, 'validate').andCallThrough();
        expect(ardent.isValid()).toBe(false);
        expect(ardent.validate).toHaveBeenCalled();
        expect(ardent.validate.calls.length).toBe(1);
    });

    it('populates the validationError property of the model', function () {
        expect(ardent.isValid()).toBe(false);
        expect(ardent.validationError).toBeTruthy();
        expect(ardent.validationError.get('name').length).toBe(1);
    });

    it('nulls the validationError property of the model after success', function () {
        expect(ardent.isValid()).toBe(false);
        expect(ardent.validationError).toBeDefined();
        expect(ardent.validationError.get('name').length).toBe(1);

        ardent.set({'name':'hello'});
        expect(ardent.isValid()).toBe(true);
        expect(ardent.validationError).not.toBeTruthy();
    });

    it('validates all rules by default', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.isValid()).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.get('email').length).toBe(1);
    });

    it('validates only one attribute if a property name is passed', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.isValid('email')).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(0);
        expect(ardent.validationError.get('email').length).toBe(1);
        expect(ardent.validationError.first('email'))
            .toEqual('The email format is invalid.');
    });

    it('validates all rules if an invalid value is passed for the property name', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        // Boolean
        expect(ardent.isValid(true)).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.get('email').length).toBe(1);

        // Number
        expect(ardent.isValid(4)).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.get('email').length).toBe(1);

        // object
        expect(ardent.isValid({})).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.get('email').length).toBe(1);
    });

    it('validates only the attributes in a passed array of property names', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email',
            'phone' : 'size:13'
        };

        ardent.set({'name':'foo', 'email':'hello', 'phone':'(000)000-000'});

        expect(ardent.isValid(['email','phone'])).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(0);
        expect(ardent.validationError.get('email').length).toBe(1);
        expect(ardent.validationError.get('phone').length).toBe(1);
        expect(ardent.validationError.first('phone'))
            .toEqual('The phone must be 13 characters.');
    });

    it('validates nothing if an empty array is passed', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email',
            'phone' : 'size:13'
        };

        ardent.set({'name':'foo', 'email':'hello', 'phone':'(000)000-000'});

        expect(ardent.isValid([])).toBe(true);
    });

    it('validates only defined attributes in a passed array of property names', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email',
            'phone' : 'size:13',
            'gump' : 'required|min:4'
        };

        ardent.set({'name':'foo', 'email':'hello', 'phone':'(000)000-000'});

        expect(ardent.isValid(['email','phone','gump'])).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(0);
        expect(ardent.validationError.get('email').length).toBe(1);
        expect(ardent.validationError.get('phone').length).toBe(1);
        expect(ardent.validationError.get('gump').length).toBe(0);
    });

    it('merges passed rules with class rules', function () {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.isValid(null, {rules:{'name':'max:2'}})).toBe(false);
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name'))
            .toEqual('The name must be less than 2 characters.');
        expect(ardent.validationError.get('email').length).toBe(1);
    });

    it('returns custom error messages from the class', function () {
        ardent.rules = {
            'name' : 'required|min:4'
        };

        ardent.messages = {
            'min' : {'string' : ':attribute is not long enough'}
        };

        ardent.set({'name':'foo'});

        expect(ardent.isValid()).toBe(false);
        expect(ardent.validationError).toBeTruthy();
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name')).toEqual('name is not long enough');
    });

    it('allows custom error messages to be passed in the options', function () {
        expect(ardent.isValid(null, {messages:{'required':'You\'re missing :attribute'}})).toBe(false);
        expect(ardent.validationError).toBeTruthy();
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name')).toEqual('You\'re missing name');
    });

    it('merges passed custom error messages with those of the class', function () {
        ardent.rules = {
            'name' : 'min:4',
            'age' : 'min:21'
        };

        ardent.messages = {
            'min' : {'string' : ':attribute is not long enough'}
        };

        ardent.set({'name':'foo', 'age':19});

        expect(ardent.isValid(null, {messages:{'min':{'numeric':'Too young'}}})).toBe(false);
        expect(ardent.validationError).toBeTruthy();
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name')).toEqual('name is not long enough');
        expect(ardent.validationError.get('age').length).toBe(1);
        expect(ardent.validationError.first('age')).toEqual('Too young');
    });

});