describe('Backbone.Ardent', function() {
    it('is a subclass of Backbone.Model', function() {
        var ardent = new Backbone.Ardent();

        expect(ardent instanceof Backbone.Model).toBeTruthy();
    });

	it('should exist', function() {
		expect(Backbone.Ardent).toBeTruthy();
	});

	it('should use validator', function() {
		expect(Backbone.Validator).toBeTruthy();
	});
});