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
        expect(ardent.validate()).toBe(false);
    });

    it('flags strings that are just whitespace', function() {
        ardent.set({name:'      '});
        expect(ardent.validate()).toBe(false);
    });

    xit('flags attributes not defined', function() {
        //TODO
        ardent = new Backbone.Ardent(null, {rules: {'name' : 'required'}});
        expect(ardent.validate()).toBe(false);
    });

    xit('flags null attributes', function() {
        //TODO
        ardent.set({'name':null});
        expect(ardent.validate()).toBe(false);
    });
    
});