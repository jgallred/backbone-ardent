describe('Backbone.Ardent', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent();
    });

    afterEach(function(){
        ardent = null;
    });

    it('should exist', function() {
        expect(Backbone.Ardent).toBeDefined();
    });

    it('should use validator', function() {
        expect(Backbone.Validator).toBeDefined();
    });

    it('is a subclass of Backbone.Model', function() {
        expect(ardent instanceof Backbone.Model).toBe(true);
    });

    it('uses a rules property to store validators', function() {
        expect(ardent.rules).toBeDefined();
    });

    it('allows rules to be passed in the constructor', function() {
        ardent = new Backbone.Ardent(null, {
            rules : {
                'name' : 'required'
            }
        });

        expect(ardent.getRules()).toEqual({'name':'required'});
    });

    it('allows rules to be passed as part of subclasses', function() {
        var Subclass =  Backbone.Ardent.extend({
            rules : {
                'name' : 'required'
            }
        });

        ardent = new Subclass();

        expect(ardent.getRules()).toEqual({'name':'required'});
    });

    it('allows the rules property to be an object', function() {
        ardent = new Backbone.Ardent(null, {
            rules : {
                'name' : 'required'
            }
        });

        expect(typeof ardent.rules).toEqual('object');
        expect(ardent.getRules()).toEqual({'name':'required'});
    });

    it('allows the rules property to be a function', function() {
        ardent = new Backbone.Ardent(null, {
            rules : function() {
                return {
                    'name' : 'required'
                };
            }
        });

        expect(typeof ardent.rules).toEqual('function');
        expect(ardent.getRules()).toEqual({'name':'required'});
    });

    it('uses a messages property to store custom error messages', function() {
        expect(ardent.messages).toBeDefined();
    });

    it('allows messages to be passed in the constructor', function() {
        ardent = new Backbone.Ardent(null, {
            messages : {
                'required' : 'The :attribute field is required.'
            }
        });

        expect(ardent.getMessages())
            .toEqual({'required' : 'The :attribute field is required.'});
    });

    it('allows messages to be passed as part of subclasses', function() {
        var Subclass =  Backbone.Ardent.extend({
            messages : {
                'required' : 'The :attribute field is required.'
            }
        });

        ardent = new Subclass();

        expect(ardent.getMessages())
            .toEqual({'required' : 'The :attribute field is required.'});
    });

    it('allows the messages property to be an object', function() {
        ardent = new Backbone.Ardent(null, {
            messages : {
                'required' : 'The :attribute field is required.'
            }
        });

        expect(typeof ardent.messages).toEqual('object');
        expect(ardent.getMessages())
            .toEqual({'required' : 'The :attribute field is required.'});
    });

    it('allows the messages property to be a function', function() {
        ardent = new Backbone.Ardent(null, {
            messages : function() {
                return {
                    'required' : 'The :attribute field is required.'
                };
            }
        });

        expect(typeof ardent.messages).toEqual('function');
        expect(ardent.getMessages())
            .toEqual({'required' : 'The :attribute field is required.'});
    });
    
});