describe('Backbone.Ardent validate', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent({'name':''}, {rules: {'name' : 'required'}});
    });

    afterEach(function(){
        ardent = null;
    });

    it('returns something if validation fails', function() {
        expect(ardent.validate(ardent.attributes)).toBeDefined();
    });

    it('returns nothing if validation succeeded', function() {
        ardent.set({'name':'foo'});

        expect(ardent.validate(ardent.attributes)).toBeUndefined();
    });

    it('returns the error result on validation failure', function() {
        var errors = ardent.validate(ardent.attributes);
        expect(errors).toBeDefined();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name')).toEqual('The name field is required.');
    });

    it('does not validate if there are no rules', function() {
        ardent.rules = {};

        expect(ardent.validate(ardent.attributes)).toBeUndefined();
    });

    it('validates all attributes if an attributes hash is not passed', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        var errors = ardent.validate();
        expect(errors).toBeDefined();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('The name must be at least 4 characters.');
        expect(errors.get('email').length).toBe(1);
        expect(errors.first('email')).toEqual('The email format is invalid.');
    });

    it('validates given attributes if an attributes hash is passed', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        var errors = ardent.validate(_.pick(ardent.attributes, 'name'));
        expect(errors).toBeDefined();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('The name must be at least 4 characters.');
        expect(errors.get('email').length).toBe(0);
    });

    it('overrides class rules if a rules hash is passed in the second parameter', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        var errors = ardent.validate(null, {rules:{'name':'max:2'}});
        expect(errors).toBeDefined();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('The name must be less than 2 characters.');
        expect(errors.get('email').length).toBe(0);
        expect(errors.get('phone').length).toBe(0);
    });

    xit('fires an invalid:attribute event for each invalid attribute', function() {
        var nameHandler = jasmine.createSpy('nameHandler'),
            emailHandler = jasmine.createSpy('emailHandler');

        ardent.on('invalid:name', nameHandler);
        ardent.on('invalid:email', emailHandler);

        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        expect(ardent.validate()).toBeDefined();
        expect(nameHandler).toHaveBeenCalled();
        expect(nameHandler.calls.length).toEqual(1);
        expect(emailHandler).toHaveBeenCalled();
        expect(emailHandler.calls.length).toEqual(1);
    });
    
});