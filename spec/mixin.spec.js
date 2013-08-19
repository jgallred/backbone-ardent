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

    it('provides a convienent mixInto method', function() {
        expect(Backbone.Ardent.mixInto).toBeTruthy();
    });



    describe('when applied to a class', function(){

        var instance;
        var AnotherClass = Backbone.Model.extend({
            'instanceProp':13,
            'instanceMethod':function(){
                return 14;
            }
        }, {
            'staticProp':15,
            'staticMethod':function(){
                return 16;
            }
        });

        Backbone.Ardent.mixInto(AnotherClass);

        beforeEach(function(){
            instance = new AnotherClass();
        });

        afterEach(function(){
            instance = null;
        });

        it('maintains instance methods and properties', function() {
            expect(instance.instanceProp).toBeDefined();
            expect(instance.instanceMethod).toBeDefined();
            expect(instance.instanceProp).toBe(13);
            expect(instance.instanceMethod()).toBe(14);
        });

        it('maintains static methods and properties', function() {
            expect(AnotherClass.staticProp).toBeDefined();
            expect(AnotherClass.staticMethod).toBeDefined();
            expect(AnotherClass.staticProp).toBe(15);
            expect(AnotherClass.staticMethod()).toBe(16);
        });

        it('Still calls the original initialize', function() {
            //TODO
        });
    });
});