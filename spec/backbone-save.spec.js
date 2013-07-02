describe('Backbone.Model', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent({'name':''}, {rules: {'name' : 'required'}});
        spyOn(ardent, 'sync').andReturn('jqXHR');
        spyOn(ardent, 'validate').andCallThrough();
    });

    afterEach(function(){
        ardent = null;
    });

    it('calls validate on save and does not persist on failure', function() {
        expect(ardent.save()).toBe(false);
        expect(ardent.validate).toHaveBeenCalled();
        expect(ardent.sync).not.toHaveBeenCalled();
    });

    it('calls validate on save and persists on pass', function() {
        expect(ardent.save({name:'Author Dent'})).toEqual('jqXHR');
        expect(ardent.validate).toHaveBeenCalled();
    });

    it('allows you to skip validation on save by passing validate:false', function() {
        expect(ardent.save({name:'Author Dent'}, {validate:false})).toEqual('jqXHR');
        expect(ardent.validate).not.toHaveBeenCalled();
    });

    it('allows override rules to be passed in the options to save()', function() {
        expect(ardent.save({'name':''}, {
            validate:true,
            rules:{name:'min:5'}
        })).toBe(false);
        expect(ardent.validate).toHaveBeenCalled();
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name'))
            .toEqual('The name must be at least 5 characters.');
    });
    
});