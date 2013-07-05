describe('Backbone.Model', function() {

    var ardent;

    beforeEach(function(){
        ardent = new Backbone.Ardent({'name':''}, {rules: {'name' : 'required'}});
        spyOn(ardent, 'validate').andCallThrough();
    });

    afterEach(function(){
        ardent = null;
    });

    it('does not call validate during set() by default', function() {
        expect(ardent.set('name','')).not.toBe(false);
        expect(ardent.validate).not.toHaveBeenCalled();
        expect(ardent.get('name')).toEqual('');
    });

    it('can call validate on set()', function() {
        ardent.set({'name':'Ford Prefect'});
        expect(ardent.validationError).not.toBeTruthy();
        expect(ardent.set({'name':''}, {validate:true})).toBe(false);
        expect(ardent.validate).toHaveBeenCalled();
        expect(ardent.get('name')).toEqual('Ford Prefect');
    });

    it('allows override rules to be passed in the options to set()', function() {
        ardent.set({'name':'Ford Prefect'});
        expect(ardent.set({'name':''}, {
            validate:true,
            rules:{name:'min:5'}
        })).toBe(false);
        expect(ardent.validate).toHaveBeenCalled();
        expect(ardent.get('name')).toEqual('Ford Prefect');
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name'))
            .toEqual('The name must be at least 5 characters.');
    });

    it('allows custom error messages to be passed in the options to set()', function() {
        expect(ardent.set({'name':''}, {
            validate:true,
            messages:{required:'Missing :attribute'}
        })).toBe(false);
        expect(ardent.validate).toHaveBeenCalled();
        expect(ardent.validationError.get('name').length).toBe(1);
        expect(ardent.validationError.first('name')).toEqual('Missing name');
    });
    
});