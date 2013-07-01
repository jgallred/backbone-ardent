describe('Backbone.Ardent validation', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent({'name':''}, {rules: {'name' : 'required'}});
    });

    afterEach(function(){
        ardent = null;
    });

    it('returns false if validation fails', function() {
        expect(ardent.validate()).toBe(false);
    });

    it('returns true if validation succeeded', function() {
        ardent.set({'name':'foo'});

        expect(ardent.validate()).toBe(true);
    });

    it('exposes the error result on the model', function() {
        expect(ardent.validate()).toBe(false);
        expect(ardent.errors).toBeDefined();
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.first('name')).toEqual('The name field is required.');
    });

    it('refreshes the error result, even on passing', function() {
        expect(ardent.validate()).toBe(false);

        ardent.set({'name':'foo'});

        expect(ardent.validate()).toBe(true);
        expect(ardent.errors).toBeDefined();
        expect(ardent.errors.get('name').length).toBe(0);
        expect(ardent.errors.first('name')).toBe(false);
    });

    it('does not validate if there are no rules', function() {
        ardent.rules = {};

        expect(ardent.validate()).toBe(true);
    });

    it('populates errors even if there are no rules', function() {
        ardent.rules = {};

        expect(ardent.validate()).toBe(true);
        expect(ardent.errors).toBeDefined();
        expect(ardent.errors.get('name').length).toBe(0);
        expect(ardent.errors.first('name')).toBe(false);
    });

    it('validates all rules by default', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.validate()).toBe(false);
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.first('name'))
            .toEqual('The name must be at least 4 characters.');
        expect(ardent.errors.get('email').length).toBe(1);
        expect(ardent.errors.first('email'))
            .toEqual('The email format is invalid.');
    });

    it('validates only one attribute if a property name is passed', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.validate('email')).toBe(false);
        expect(ardent.errors.get('name').length).toBe(0);
        expect(ardent.errors.get('email').length).toBe(1);
        expect(ardent.errors.first('email'))
            .toEqual('The email format is invalid.');
    });

    it('validates all rules if an invalid value is passed for the property name', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        // Boolean
        expect(ardent.validate(true)).toBe(false);
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.get('email').length).toBe(1);

        // Number
        expect(ardent.validate(4)).toBe(false);
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.get('email').length).toBe(1);

        // object
        expect(ardent.validate({})).toBe(false);
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.get('email').length).toBe(1);
    });

    it('validates only the attributes in a passed array of property names', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email',
            'phone' : 'size:13'
        };

        ardent.set({'name':'foo', 'email':'hello', 'phone':'(000)000-000'});

        expect(ardent.validate(['email','phone'])).toBe(false);
        expect(ardent.errors.get('name').length).toBe(0);
        expect(ardent.errors.get('email').length).toBe(1);
        expect(ardent.errors.get('phone').length).toBe(1);
        expect(ardent.errors.first('phone'))
            .toEqual('The phone must be 13 characters.');
    });

    it('validates nothing if an empty array is passed', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email',
            'phone' : 'size:13'
        };

        ardent.set({'name':'foo', 'email':'hello', 'phone':'(000)000-000'});

        expect(ardent.validate([])).toBe(true);
    });

    it('validates only defined attributes in a passed array of property names', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email',
            'phone' : 'size:13',
            'gump' : 'required|min:4'
        };

        ardent.set({'name':'foo', 'email':'hello', 'phone':'(000)000-000'});

        expect(ardent.validate(['email','phone','gump'])).toBe(false);
        expect(ardent.errors.get('name').length).toBe(0);
        expect(ardent.errors.get('email').length).toBe(1);
        expect(ardent.errors.get('phone').length).toBe(1);
        expect(ardent.errors.get('gump').length).toBe(0);
    });


    it('overrides class rules if a rules hash is passed in the second parameter', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.validate(null, {rules:{'name':'max:2'}})).toBe(false);
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.first('name'))
            .toEqual('The name must be less than 2 characters.');
        expect(ardent.errors.get('email').length).toBe(0);
        expect(ardent.errors.get('phone').length).toBe(0);
    });

    it('overrides class rules if a rules hash is passed in the only parameter', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.validate({rules:{'name':'max:2'}})).toBe(false);
        expect(ardent.errors.get('name').length).toBe(1);
        expect(ardent.errors.first('name'))
            .toEqual('The name must be less than 2 characters.');
        expect(ardent.errors.get('email').length).toBe(0);
        expect(ardent.errors.get('phone').length).toBe(0);
    });

    it('fires an invalid event on failure', function() {
        var handler = jasmine.createSpy('handler');
        ardent.on('invalid', handler);
        expect(ardent.validate()).toBe(false);
        expect(handler).toHaveBeenCalled();
        expect(handler.calls.length).toEqual(1);
    });

    it('fires an invalid:attribute event for each invalid attribute', function() {
        var nameHandler = jasmine.createSpy('nameHandler'),
            emailHandler = jasmine.createSpy('emailHandler');

        ardent.on('invalid:name', nameHandler);
        ardent.on('invalid:email', emailHandler);

        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.validate()).toBe(false);
        expect(nameHandler).toHaveBeenCalled();
        expect(nameHandler.calls.length).toEqual(1);
        expect(emailHandler).toHaveBeenCalled();
        expect(emailHandler.calls.length).toEqual(1);
    });
    
});