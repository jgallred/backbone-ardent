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
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name')).toEqual('The name field is required.');
    });

    it('nulls the validationError property of the model after success', function() {
        var errors = ardent.validate(ardent.attributes);
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);

        ardent.set({'name':'hello'});

        errors = ardent.validate(ardent.attributes);
        expect(errors).not.toBeTruthy();
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
        expect(errors).toBeTruthy();
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
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('The name must be at least 4 characters.');
        expect(errors.get('email').length).toBe(0);
    });

    it('merges passed rules with class rules', function() {
        ardent.rules = {
            'name' : 'required|min:4',
            'email' : 'email'
        };

        ardent.set({'name':'foo', 'email':'hello'});

        var errors = ardent.validate(null, {rules:{'name':'max:2'}});
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('The name must be less than 2 characters.');
        expect(errors.get('email').length).toBe(1);
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

    it('returns custom error messages from the class', function() {
        ardent.rules = {
            'name' : 'required|min:4'
        };

        ardent.messages = {
            'min' : {'string' : ':attribute is not long enough'}
        };

        ardent.set({'name':'foo'});

        var errors = ardent.validate();
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('name is not long enough');
    });

    it('allows custom error messages to be passed in the options', function() {
        var errors = ardent.validate(null, {messages:{'required':'You\'re missing :attribute'}});
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name'))
            .toEqual('You\'re missing name');
    });

    it('merges passed custom error messages with those of the class', function() {
        ardent.rules = {
            'name' : 'min:4',
            'age' : 'min:21'
        };

        ardent.messages = {
            'min' : {'string' : ':attribute is not long enough'}
        };

        ardent.set({'name':'foo', 'age':19});

        var errors = ardent.validate(null, {messages:{'min':{'numeric':'Too young'}}});
        expect(errors).toBeTruthy();
        expect(errors.get('name').length).toBe(1);
        expect(errors.first('name')).toEqual('name is not long enough');
        expect(errors.get('age').length).toBe(1);
        expect(errors.first('age')).toEqual('Too young');
    });
    
});