var Item = require('../models/item');
var async = require('async');
var Category = require('../models/category');
var Subcategory = require('../models/subcategory');
var { body, validationResult } = require('express-validator');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
require('dotenv').config();


exports.item_detail = function(req, res, next) {
    Item.findById(req.params.itemId)
    .populate('category')
    .exec(function(err, item) {
        if (err) return next(err);
        if (item==null) {
            let err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        res.render('item_detail', {item: item});
    })
}

exports.item_create_get = function(req, res, next) {
    async.parallel({
        currentCategory: function(callback) {
            Category.findById(req.params.catId).exec(callback);
        },
        categories: function(callback) {
            Category.find().sort([['name', 'ascending']]).exec(callback);
        },
        subcategories: function(callback) {
            Subcategory.find().populate('category').sort([['name', 'ascending']]).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        res.render('item_form', { title: 'Create Item', categories: results.categories, subcategories: results.subcategories, currentCategory: results.currentCategory });
    });
};

//configuring the AWS environment
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function(req, file, callback) {
            callback(null, {fieldName: file.fieldname});
        },
        key: function(req, file, callback) {
            callback(null, Date.now().toString() + file.fieldname);
        }
    }),
    fileFilter: function(req, file, callback) {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
            callback(null, true);
        }
        else {
            callback(null, false);
            return callback(new Error('Only jpg, jpeg, and png files can be uploaded.'));
        }
    }
});


exports.item_create_post = [
    body('name').trim().isLength({ min: 1}).escape().withMessage('Item name cannot be left blank.'),
    body('description').trim().isLength({ min: 1}).escape().withMessage('Description cannot be left blank.'),
    body('price').trim().isInt({ min: 1 }).escape().withMessage('Price must be at least 1 bell'),
    body('stock').trim().isInt({ min: 1 }).escape().withMessage('Stock must be at least 1.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category must be specified'),
    body('subcategory').custom((value, { req }) => {
        Subcategory.find({ 'name': value.split(' ')[0] }).populate('category').exec(function(err, subcat) {
            let match = false;
            for (let sub of subcat) {
                if (sub.category.name == req.body.category.split(' ')[0]) {
                    match = true
                }
            }
            
            if (!match) {
                throw new Error('Subcategory must be associated with the selected category');
            }

            else return true
        });
    }),
    body('image').optional().escape(),

    function (req, res, next) {

        const errors = validationResult(req);

        let itemdetail = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category.split(' ')[1],
            subcategory: req.body.subcategory.split(' ')[1],
        }

        if (req.file) itemdetail.imageURL = req.file.path

        

        if (!errors.isEmpty()) {
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
                itemCategory: function(callback) {
                    Category.findById(itemdetail.category).exec(callback);
                },
                subcategories: function(callback) {
                    Subcategory.find().populate('category').exec(callback);
                }
            }, function(err, results) {
                itemdetail.category = results.itemCategory;
                let item = new Item(itemdetail);
                if (err) return next(err);
                res.render('item_form', { title: 'Create Item', categories: results.categories, subcategories: results.subcategories, item: item, file: req.file, errors: errors.array() });
            });
        }
        else {
            let item = new Item(itemdetail);
            item.save(function (err) {
                if (err) return next(err);
                res.redirect(item.url)
            });
        }
    }
]

exports.item_delete_get = function(req, res, next) {
    Item.findById(req.params.itemId)
    .exec(function(err, item) {
        if (err) return next(err);
        if (item==null) {
            res.redirect('/catalog/')
        }
        res.render('item_delete', { title: 'Delete item', item: item });
    });
}

exports.item_delete_post = function(req, res, next) {
    Item.findById(req.params.itemId)
    .populate('category')
    .exec(function(err, item) {
        if (err) return next(err);
        if (item==null) {
            res.redirect('/catalog/')
        }
        Item.findByIdAndRemove(req.params.itemId, function deleteItem(err) {
            if (err) return next(err);
            res.redirect(item.category.url);
        })
    });
};

exports.item_update_get = function(req, res, next) {
    console.log(req.params.catId);
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.itemId)
            .populate('category')
            .populate('subcategory')
            .exec(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
        subcategories: function(callback) {
            Subcategory.find().populate('category').exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.item==null) {
            var err = new Error('Item not found');
            err.status = 404
            return next(err);
        }
        res.render('item_form', { title: 'Update ' + results.item.name, categories: results.categories, subcategories: results.subcategories, item: results.item });
    })

}

exports.item_update_post = [
    body('name').trim().isLength({ min: 1}).escape().withMessage('Item name cannot be left blank.'),
    body('description').trim().isLength({ min: 1}).escape().withMessage('Description cannot be left blank.'),
    body('price').trim().isInt({ min: 1 }).escape().withMessage('Price must be at least 1 bell'),
    body('stock').trim().isInt({ min: 1 }).escape().withMessage('Stock must be at least 1.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category must be specified'),
    body('subcategory').custom((value, { req }) => {
        return Subcategory.find({ 'name': value.split(' ')[0] }).populate('category').exec(function(err, subcat) {
            let match = false;
            for (let sub of subcat) {
                if (sub.category.name == req.body.category.split(' ')[0]) {
                    match = true
                }
            }
            
            if (!match) {
                return Promise.reject('Subcategory must be associated with the selected category');
            }

        });
    }),
    body('image').optional().escape(),

    function (req, res, next) {

        const errors = validationResult(req);

        let itemdetail = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category.split(' ')[1],
            subcategory: req.body.subcategory.split(' ')[1],
            imageURL: req.body.imageURL,
            _id: req.params.itemId
        }

        if (req.file) itemdetail.imageURL = req.file.path;

        if (!errors.isEmpty()) {
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
                itemCategory: function(callback) {
                    Category.findById(itemdetail.category).exec(callback);
                },
                subcategories: function(callback) {
                    Subcategory.find().populate('category').exec(callback);
                }
            }, function(err, results) {
                if (err) return next(err);
                itemdetail.category = results.itemCategory;
                let item = new Item(itemdetail);
                res.render('item_form', { title: 'Update ' + item.name, categories: results.categories, subcategories: results.subcategories, item: item, file: req.file, errors: errors.array() });
            });
        }
        else {
            let item = new Item(itemdetail);
            Item.findByIdAndUpdate(req.params.itemId, item, {}, function(err, theitem) {
                if (err) return next(err);
                res.redirect(theitem.url);
            });
        }
          
    }
];