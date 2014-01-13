#Backbone Ardent

[![Build Status](https://travis-ci.org/jgallred/backbone-ardent.png?branch=master)](https://travis-ci.org/jgallred/backbone-ardent)

A backbone model validation plugin that mimics Max Ehsan's excellent [Ardent](https://github.com/laravelbook/ardent)
package for the php framework [Laravel](http://laravel.com/). It also borrows some design from Thomas Pedersen's
[backbone.validation](https://github.com/thedersen/backbone.validation) plugin. It allows you to use several of
Laravel's elegant [validation rules](http://laravel.com/docs/validation) on your Backbone models thanks to
David's [validatorjs](https://github.com/skaterdav85/validatorjs) package.

## Distribution

* Development: [backbone-ardent.js](https://raw.github.com/jgallred/backbone-ardent/master/dist/backbone-ardent.js)
* Production:  [backbone-ardent.min.js](https://raw.github.com/jgallred/backbone-ardent/master/dist/backbone-ardent.min.js)

### Built On
* [Validatorjs](https://github.com/skaterdav85/validatorjs) v1.0.1

### Tested With
* [Underscore](http://underscorejs.org/) 1.5.2
* [Backbone](http://backbonejs.org/) v1.1.0

##Installation

Just load backbone-ardent.js or backbone-ardent.min.js after Backbone and its dependencies.

```html
    <script type="text/javascript" src="path/to/js/libs/underscore.js"></script>
    <script type="text/javascript" src="path/to/js/libs/backbone.js"></script>
    <script type="text/javascript" src="path/to/js/libs/backbone-ardent.js"></script>
```

##Usage

Extend the Backbone.Model subclass, Backbone.Ardent, and define a rules hash on your model.

```js
    var Post = Backbone.Ardent.extend({
        rules : {
            title : 'required|max:10',
            body : 'required|max:500',
            email : 'required|email'
        },
        default : {
            title : 'this title is too long',
            body : '', // The 'required' validator only checks defined attributes
            email : 'hello'
        }
    });

    var first_post = new Post();
    var errors = first_post.validate(); // Without an argument, validates all attributes on the model
    if (errors) { // validate returns a Validator messages object on failure
        errors.first('title'); // returns 'The title must be less than 10 characters.'
        errors.first('body'); // returns 'The body field is required.'
        errors.first('email'); // returns 'The email format is invalid.'
    }
```

You can additionally pass rule overrides in the options argument when you validate
or when validation is performed as part of another method. The rules you passed
will be merged with those of the class.

```js
    var second_post = new Post();
    errors = second_post.validate(null, {rules:{title:'min:15'}});
    // The API for validate expects an attributes hash as the first argument,
    // so we pass our options as the second argument and null as the first
    // to trigger an evaluation of all attributes.
    if (errors) {
        errors.first('title'); // returns false
        errors.first('body'); // returns 'The body field is required.'
        errors.first('email'); // returns 'The email format is invalid.'
    }

    second_post.set({title:''}, {rules:{title:'min:15'}, validate:true});
    if (second_post.validationError) {
        // Backbone.Model's validationError property will be populated with the
        // Validator messages object on failure
        second_post.validationError.first('title'); // returns 'The title must be at least 15 characters.'
        second_post.validationError.first('body'); // returns false because only the passed attributes are checked
    }

    errors = second_post.save({title:''}, {rules:{title:'min:15'}});
    errors.first('title'); // returns 'The title must be at least 15 characters.'

    if (!second_post.isValid({rules:{title:'min:15'}})) {
        // The isValid method is overriden with some extra functionality.
        // See the rest of the documentation for details.
        // ...
    }
```

### Custom Error Messages

Validatorjs allow you to pass override messages that can be returned instead of
the default ones. Anywhere that you can pass or set the rules hash, you can pass
custom error messages.

```js
    var Post = Backbone.Ardent.extend({
        rules : {...},
        messages : {
            required : 'Missing :attribute'
        },
        default : {...}
    });

    var first_post = new Post();
    var error = first_post.save(null, {messages:{email:'Bad email format given'}});
    error.first('body'); // returns 'Missing body'
    error.first('email'); // returns 'Bad email format given'
    error.first('title'); // returns 'The title must be less than 10 characters.'
```

### isValid() method

Like [backbone.validation](https://github.com/thedersen/backbone.validation), the
isValid method provides additional functionality.


```js
    post.isValid(); // validates all attributes
    post.isValid('title'); // string arg validates only that attribute
    post.isValid(['title', 'email']);  // array arg validates multiple attributes
    post.isValid({rules:{title:'min:15'}, messages:{required:'Missing :attribute'}});
    // object allows you to pass rule and error message overrides
```
Additionally, an options object is allowed as a second argument when validating one or multiple attributes.

## Available Validators

See the [docs](https://github.com/skaterdav85/validatorjs#validation-rules).

## Use Validator without a model

The backbone-ardent plugin also exposes the [Validator](https://github.com/skaterdav85/validatorjs)
function as Backbone.Validator for your use elsewhere.