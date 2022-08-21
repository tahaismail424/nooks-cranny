var Category = require('../models/category');
var Subcategory = require('../models/subcategory');
var Item = require('../models/item');
var async = require('async');
const { body, validationResult } = require('express-validator');
const category = require('../models/category');

exports.category_index = function(req, res, next) {
    async.waterfall([
        function(callback) {
            Category.find({}, 'name').sort([['name', 'ascending']]).exec(
                function (err, categories) {
                    callback(err, categories);
                });
        },
        function(categories, callback) {
            getCountArray = []
            for (let category of categories) {
                getCountArray.push(function(callback) {
                    Item.countDocuments({ 'category': category.id }).exec(callback);
                });
            }
            async.series(getCountArray, function(err, categoryCounts) {
                callback(err, categories, categoryCounts);
            })
        }
    ], function(err, categories, categoryCounts) {
        res.render('index', { title: "Nook's Cranny", subtitle: 'Inventory Management', error: err, categories: categories, categoryCounts: categoryCounts });
    });
}

exports.category_detail = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.catId)
                .exec(callback)
        },
        items: function(callback) {
            Item.find({ 'category': req.params.catId })
                .sort([['name', 'ascending']])
                .populate('subcategory')
                .exec(callback);
        },
        subcategories: function(callback) {
            Subcategory.find({ 'category': req.params.catId })
                .sort([['name', 'ascending']])
                .exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.category==null) {
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, format data and render
        let subbedItems = {}
        for (let subcat of results.subcategories) {
            subbedItems[subcat.name] = [];
        }

        for (let item of results.items) {
            subbedItems[item.subcategory.name].push(item);
        }
    
        res.render('category_detail', { category: results.category, items: subbedItems, subcategories: results.subcategories });
    });
}

exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category'});
}

exports.category_create_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Category name cannot be left blank.'),
    body('description').trim().isLength({ min: 1}).escape().withMessage('Description cannot be left blank'),

    function(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('category_form', { title: 'Create Category', category: req.body, errors: errors.array() });
            return;
        }
        else {
            let category = new Category(
                {
                    name: req.body.name,
                    description: req.body.description
                }
            );

            category.save(function (err) {
                if (err) return next(err);
                res.redirect(category.url);
            })
        }
    }
]

exports.category_delete_get = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.catId).exec(callback);
        },
        subcategories: function(callback) {
            Subcategory.find({ 'category': req.params.catId }).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.category==null) {
            res.redirect('/catalog');
        }
        res.render('category_delete', { title: 'Delete ' + results.category.name, category: results.category, subcategories: results.subcategories });
    })
}

exports.category_delete_post = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.catId).exec(callback);
        },
        subcategories: function(callback) {
            Subcategory.find({ 'category': req.params.catId }).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.subcategories.length > 0) {
            res.render('category_delete', { title: 'Delete ' + results.category.name, category: results.category, subcategories: results.subcategories });
        }
        else {
            Category.findByIdAndRemove(req.params.catId, function deleteCategory(err) {
                if (err) return next(err);
                res.redirect('/catalog');
            });
        }
    });
}

exports.category_update_get = function(req, res, next) {
    Category.findById(req.params.catId)
    .exec(function (err, category) {
        if (err) return next(err);
        if (category==null) {
            let err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        res.render('category_form', { title: 'Edit ' + category.name, category: category });

    })
}

exports.category_update_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Category name cannot be left blank.'),
    body('description').trim().isLength({ min: 1}).escape().withMessage('Description cannot be left blank'),

    function(req, res, next) {
        const errors = validationResult(req);

        var category = new Category({
            _id: req.params.catId,
            name: req.body.name,
            description: req.body.description,
        });
    
        
        if (!errors.isEmpty()) {
            res.render('category_form', { title: 'Edit ' + category.name, category: category, errors: errors.array() });
            return;
        }

        else {
            Category.findByIdAndUpdate(req.params.catId, category, {}, function(err, thecat) {
                if (err) { return next(err); }
                res.redirect(thecat.url);
            })
        }
    }
]