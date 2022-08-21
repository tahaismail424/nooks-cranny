var express = require('express');
var router = express.Router();

var category_controller = require('../controllers/categoryController.js');
var item_controller = require('../controllers/itemController.js');
var subcategory_controller = require('../controllers/subcategoryController.js');


router.get('/', category_controller.category_index);

router.get('/:catId', category_controller.category_detail);

router.get('/:catId/update', category_controller.category_update_get);

router.post('/:catId/update', category_controller.category_update_post);

router.get('/:catId/delete', category_controller.category_delete_get);

router.post('/:catId/delete', category_controller.category_delete_post);

router.get('/create', category_controller.category_create_get);

router.post('/create', category_controller.category_create_post);

router.get('/:catId/:itemId', item_controller.item_detail);

router.get('/:catId/:itemId/update', item_controller.item_update_get);

router.post('/:catId/:itemId/update', item_controller.upload.single('image'), item_controller.item_update_post);

router.get('/:catId/:itemId/delete', item_controller.item_delete_get);

router.post('/:catId/:itemId/delete', item_controller.item_delete_post);

router.get('/:catId/create', item_controller.item_create_get);

router.post('/:catId/create', item_controller.upload.single('image'), item_controller.item_create_post);

router.get('/:catId/subcategory/create', subcategory_controller.subcategory_create_get);

router.post('/:catId/subcategory/create', subcategory_controller.subcategory_create_post);

router.get('/:catId/subcategory/:subcatId/update', subcategory_controller.subcategory_update_get);

router.post('/:catId/subcategory/:subcatId/update', subcategory_controller.subcategory_update_post);

router.get('/:catId/subcategory/:subcatId/delete', subcategory_controller.subcategory_delete_get);

router.post('/:catId/subcategory/:subcatId/delete', subcategory_controller.subcategory_delete_post);

module.exports = router;

