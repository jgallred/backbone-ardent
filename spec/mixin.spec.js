describe('Backbone.Ardent.mixin', function() {

    it('exists', function() {
        expect(Backbone.Ardent.mixin).toBeTruthy();
    });

    it('contains all the methods and properties to work', function() {
        expect(Backbone.Ardent.mixin.rules).toBeTruthy();
        expect(Backbone.Ardent.mixin.messages).toBeTruthy();
        expect(Backbone.Ardent.mixin.getRules).toBeTruthy();
        expect(Backbone.Ardent.mixin.getMessages).toBeTruthy();
        expect(Backbone.Ardent.mixin.validate).toBeTruthy();
        expect(Backbone.Ardent.mixin._validateAttrs).toBeTruthy();
        expect(Backbone.Ardent.mixin.isValid).toBeTruthy();
    });

    it('provides a convienent applyTo method', function() {
        expect(Backbone.Ardent.applyTo).toBeTruthy();
    });

    describe('when applied to a class', function(){

        var instance;
        var AnotherClass = Backbone.Model.extend();
        AnotherClass = Backbone.Ardent.applyTo(AnotherClass);

        beforeEach(function(){
            instance = new AnotherClass({'name':''}, {rules: {'name' : 'required'}});
        });

        afterEach(function(){
            instance = null;
        });

        it('returns something if validation fails', function() {
            expect(instance.validate(instance.attributes)).toBeDefined();
        });

        it('returns nothing if validation succeeded', function() {
            instance.set({'name':'foo'});

            expect(instance.validate(instance.attributes)).toBeUndefined();
        });

        it('returns the error result on validation failure', function() {
            var errors = instance.validate(instance.attributes);
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name')).toEqual('The name field is required.');
        });

        it('nulls the validationError property of the model after success', function() {
            var errors = instance.validate(instance.attributes);
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);

            instance.set({'name':'hello'});

            errors = instance.validate(instance.attributes);
            expect(errors).not.toBeTruthy();
        });

        it('does not validate if there are no rules', function() {
            instance.rules = {};

            expect(instance.validate(instance.attributes)).toBeUndefined();
        });

        it('validates all attributes if an attributes hash is not passed', function() {
            instance.rules = {
                'name' : 'required|min:4',
                'email' : 'email'
            };

            instance.set({'name':'foo', 'email':'hello'});

            var errors = instance.validate();
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name'))
                .toEqual('The name must be at least 4 characters.');
            expect(errors.get('email').length).toBe(1);
            expect(errors.first('email')).toEqual('The email format is invalid.');
        });

        it('validates given attributes if an attributes hash is passed', function() {
            instance.rules = {
                'name' : 'required|min:4',
                'email' : 'email'
            };

            instance.set({'name':'foo', 'email':'hello'});

            var errors = instance.validate(_.pick(instance.attributes, 'name'));
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name'))
                .toEqual('The name must be at least 4 characters.');
            expect(errors.get('email').length).toBe(0);
        });

        it('merges passed rules with class rules', function() {
            instance.rules = {
                'name' : 'required|min:4',
                'email' : 'email'
            };

            instance.set({'name':'foo', 'email':'hello'});

            var errors = instance.validate(null, {rules:{'name':'max:2'}});
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name'))
                .toEqual('The name must be less than 2 characters.');
            expect(errors.get('email').length).toBe(1);
        });

        xit('fires an invalid:attribute event for each invalid attribute', function() {
            var nameHandler = jasmine.createSpy('nameHandler'),
                emailHandler = jasmine.createSpy('emailHandler');

            instance.on('invalid:name', nameHandler);
            instance.on('invalid:email', emailHandler);

            instance.rules = {
                'name' : 'required|min:4',
                'email' : 'email'
            };

            instance.set({'name':'foo', 'email':'hello'});

            expect(instance.validate()).toBeDefined();
            expect(nameHandler).toHaveBeenCalled();
            expect(nameHandler.calls.length).toEqual(1);
            expect(emailHandler).toHaveBeenCalled();
            expect(emailHandler.calls.length).toEqual(1);
        });

        it('returns custom error messages from the class', function() {
            instance.rules = {
                'name' : 'required|min:4'
            };

            instance.messages = {
                'min' : {'string' : ':attribute is not long enough'}
            };

            instance.set({'name':'foo'});

            var errors = instance.validate();
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name'))
                .toEqual('name is not long enough');
        });

        it('allows custom error messages to be passed in the options', function() {
            var errors = instance.validate(null, {messages:{'required':'You\'re missing :attribute'}});
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name'))
                .toEqual('You\'re missing name');
        });

        it('merges passed custom error messages with those of the class', function() {
            instance.rules = {
                'name' : 'min:4',
                'age' : 'min:21'
            };

            instance.messages = {
                'min' : {'string' : ':attribute is not long enough'}
            };

            instance.set({'name':'foo', 'age':19});

            var errors = instance.validate(null, {messages:{'min':{'numeric':'Too young'}}});
            expect(errors).toBeTruthy();
            expect(errors.get('name').length).toBe(1);
            expect(errors.first('name')).toEqual('name is not long enough');
            expect(errors.get('age').length).toBe(1);
            expect(errors.first('age')).toEqual('Too young');
        });
    });
    
});