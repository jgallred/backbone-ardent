describe('Backbone.Ardent.mixin', function () {

    it('provides a convienent mixInto method', function () {
        expect(Backbone.Ardent.mixInto).toBeTruthy();
    });

    describe('when applied to a class', function () {

        var instance,
            AnotherClass,
            initSpy;

        beforeEach(function (){
            initSpy = jasmine.createSpy('initialize');

            AnotherClass = Backbone.Model.extend({
                'initialize' : initSpy,
                'instanceProp': 13,
                'instanceMethod': function () {
                    return 14;
                }
            }, {
                'staticProp' : 15,
                'staticMethod' : function () {
                    return 16;
                }
            });

            Backbone.Ardent.mixInto(AnotherClass);

            instance = new AnotherClass();
        });

        afterEach(function () {
            instance = null;
        });

        it('maintains instance methods and properties', function () {
            expect(instance.instanceProp).toBeDefined();
            expect(instance.instanceMethod).toBeDefined();
            expect(instance.instanceProp).toBe(13);
            expect(instance.instanceMethod()).toBe(14);
        });

        it('maintains static methods and properties', function () {
            expect(AnotherClass.staticProp).toBeDefined();
            expect(AnotherClass.staticMethod).toBeDefined();
            expect(AnotherClass.staticProp).toBe(15);
            expect(AnotherClass.staticMethod()).toBe(16);
        });

        it('Still calls the original initialize', function () {
            expect(initSpy).toHaveBeenCalled();
        });
    });
});