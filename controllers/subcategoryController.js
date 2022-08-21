var Category = require('../models/category');
var Subcategory = require('../models/subcategory');
var Item = require('../models/item');

var async = require('async');
const { body, validationResult } = require('express-validator');


exports.subcategory_create_get = function(req, res, next) {
    async.parallel({
        currentCategory: function(callback) {
            Category.findById(req.params.catId).exec(callback);
        },
        categories: function(callback) {
            Category.find().exec(callback);
        }}, function(err, results) {
            if (err) return next(err);
            results.categories.sort(function(a, b) {
                value = (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
                return value;
            });
            res.render('subcategory_form', { title: 'Create subcategory', currentCategory: results.currentCategory, categories: results.categories });
        });
}

exports.subcategory_create_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Subcategory name cannot be left blank.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category must be specified.'),

    function(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            Category.find()
            .exec(function(err, categories) {
                if (err) return next(err);
                res.render('subcategory_form', { title: 'Create subcategory', subcategory: req.body, categories: categories });
                return;
            });
        }
        else {
            let subcategory = new Subcategory(
                {
                    name: req.body.name,
                    category: req.body.category
                }
            );

            Category.findById(req.body.category).exec(function(err, category) {
                if (err) return next(err);
                subcategory.save(function (error) {
                    if (error) return next(error);
                    res.redirect(category.url); 
                });
            });
        }
    }
]

exports.subcategory_delete_get = function(req, res, next) {

    async.parallel({
        subcategory: function(callback) {
            Subcategory.findById(req.params.subcatId).exec(callback);
        },
        items: function(callback) {
            Item.find({ 'subcategory': req.params.subcatId }).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.subcategory==null) {
            res.ridirect('/catalog');
        }
        res.render('subcategory_delete', { title: 'Delete ' + results.subcategory.name, subcategory: results.subcategory, items: results.items });
    })
}

exports.subcategory_delete_post = function(req, res, next) {
    async.parallel({
        subcategory: function(callback) {
            Subcategory.findById(req.params.subcatId)
            .populate('category')
            .exec(callback);
        },
        items: function(callback) {
            Item.find({ 'subcategory': req.params.subcatId }).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.items.length > 0) {
            res.render('subcategory_delete', { title: 'Delete ' + results.subcategory.name, subcategory: results.subcategory, items: results.items });
        }
        else {
            Subcategory.findByIdAndRemove(req.params.subcatId, function deleteSubcategory(err) {
                if (err) return next(err);
                res.redirect(results.subcategory.category.url);
            });
        }
    });
}

exports.subcategory_update_get = function(req, res, next) {
    async.parallel({
        subcategory: function(callback) {
            Subcategory.findById(req.params.subcatId)
            .exec(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.subcategory==null) {
            var err = new Error('Subcategory not found');
            err.status = 404;
            return next(err);
        }
        res.render('subcategory_form', { title: 'Update subcategory', subcategory: results.subcategory, categories: results.categories });
    });
}

exports.subcategory_update_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Subcategory name cannot be left blank.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category must be specified.'),

    function(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            Category.find()
            .exec(function(err, categories) {
                if (err) return next(err);
                res.render('subcategory_form', { title: 'Create subcategory', subcategory: req.body, categories: categories });
                return
            });
        }
        else {
            let subcategory = new Subcategory(
                {
                    _id: req.params.subcatId,
                    name: req.body.name,
                    category: req.body.category
                }
            );

            Category.findById(req.body.category).exec(function(err, category) {
                if (err) return next(err);
           
                Subcategory.findByIdAndUpdate(req.params.subcatId, subcategory, {}, function(err, thesubcat) {
                    if (err) { return next(err); }
                    res.redirect(category.url);
                });
            });
        }
    }
]