describe('The "required" validator', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent(null, {rules: {'name' : 'required'}});
    });

    afterEach(function(){
        ardent = null;
    });

    it('flags empty strings', function() {
        ardent.set({name:''});
        expect(ardent.validate()).toBeDefined();
    });

    it('flags strings that are just whitespace', function() {
        ardent.set({name:'      '});
        expect(ardent.validate()).toBeDefined();
    });
    
});