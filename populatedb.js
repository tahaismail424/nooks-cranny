#! /usr/bin/env node

console.log('This script populates some categories, subcategories, and items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://tahasmool:2481632ti@nooks-cranny.rhjfd.mongodb.net/?retryWrites=true&w=majority');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');

var Category = require('./models/category');
var Subcategory = require('./models/subcategory');
var Item = require('./models/item');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//configuring the AWS environment
var aws = require('aws-sdk');
require('dotenv').config();



var s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

var categories = [];
var subcategories = [];
var items = [];

function categoryCreate(name, description, cb) {
    categorydetail = { name, description };
    
    var category = new Category(categorydetail);
    category.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Category: ' + category);
        categories.push(category);
        cb(null, category);
    })
};

function subcategoryCreate(name, category, cb) {
    var subcategory = new Subcategory({ name, category});
    
    subcategory.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Subcategory: ' + subcategory);
        subcategories.push(subcategory);
        cb(null, subcategory);
    });
};


function itemCreate(name, description, price, stock, category, subcategory, imageFile, cb) {

    let itemdetail = {
        name,
        description,
        price,
        stock,
        category, 
        subcategory
    }

    uploadImage(imageFile).then((data) => {
        itemdetail.imageURL = data.Location;
        var item = new Item(itemdetail);
        item.save(function (err) {
            if (err) {
                cb(err, null);
                return;
            }
            console.log('New Item: ' + item);
            items.push(item);
            cb(null, item);
        });
    });
};

const fs = require('fs');

function uploadImage(imageFile) {
    const fileContent = fs.readFileSync(imageFile);

    let fileNameBuilder = '';
    pos = imageFile.length - 1
    while (imageFile.charAt(pos) != '/') {
        fileNameBuilder += imageFile.charAt(pos);
        pos--;
    }

    const fileName = fileNameBuilder.split('').reverse().join('');

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: Date.now().toString() + fileName,
        Body: fileContent
    };

   
    return s3.upload(params, function(err, data) {
        if (err) throw err;
        console.log('Image uploaded successfully');
    }).promise();
}

function createCategories(cb) {
    async.series([
        function(callback) {
            categoryCreate('Gardening', 'Items for all your gardening needs', callback);
        },
        function(callback) {
            categoryCreate('K.K Records', 'Records of songs by K.K Slider himself for all your musical needs', callback);
        },
        function(callback) {
            categoryCreate('Tools', 'Tools to help you take care of manual work around your town', callback);
        },
        function(callback) {
            categoryCreate('Home Improvement', 'Items to help beautify your home', callback);
        },
        function(callback) {
            categoryCreate('Clothing', 'Items to dress yourself the way you feel best', callback);
        }
    ], cb);
}

function createSubcategories(cb) {
    async.series([
        function(callback) {
            subcategoryCreate('Bush Starts', categories[0], callback);
        },
        function(callback) {
            subcategoryCreate('Flower Bags', categories[0], callback);
        },
        function(callback) {
            subcategoryCreate('Saplings', categories[0], callback);
        },
        function(callback) {
            subcategoryCreate('Miscellaneous', categories[0], callback);
        },
        function(callback) {
            subcategoryCreate('K.K Records', categories[1], callback);
        },
        function(callback) {
            subcategoryCreate('Tools', categories[2], callback);
        },
        function(callback) {
            subcategoryCreate('Wallpaper', categories[3], callback);
        },
        function(callback) {
            subcategoryCreate('Floors', categories[3], callback);
        },
        function(callback) {
            subcategoryCreate('Furniture', categories[3], callback);
        },
        function(callback) {
            subcategoryCreate('Tops', categories[4], callback);
        },
        function(callback) {
            subcategoryCreate('Bottoms', categories[4], callback);
        },
        function(callback) {
            subcategoryCreate('Hats', categories[4], callback);
        },
        function(callback) {
            subcategoryCreate('Facial Wear', categories[4], callback);
        },
        function(callback) {
            subcategoryCreate('Footwear', categories[4], callback);
        }
    ], cb);
}

function createItems(cb) {
    async.series([
        function(callback) {
            itemCreate('Blue Hydrangea Start', 'Grows into a blue hydrangea bush', 280, 10, categories[0], subcategories[0], 'assets/blue_hydrangea_start.png', callback);
        },
        function(callback) {
            itemCreate('Holly Start', 'Grows into a holly bush', 280, 10, categories[0], subcategories[0], 'assets/holly_start.png', callback);
        },
        function(callback) {
            itemCreate('Pink Azalea Start', 'Grows into a pink azalea bush', 280, 10, categories[0], subcategories[0], 'assets/pink_azalea_start.png', callback);
        },
        function(callback) {
            itemCreate('Pink Hydrangea Start', 'Grows into a pink hydrangea bush', 280, 10, categories[0], subcategories[0], 'assets/pink_hydrangea_start.png', callback);
        },
        function(callback) {
            itemCreate('Red Hibiscus Start', 'Grows into a red hibuscus bush', 280, 10, categories[0], subcategories[0], 'assets/red_hibiscus_start.png', callback);
        },
        function(callback) {
            itemCreate('White Azalea Start', 'Grows into a white azalea bush', 280, 10, categories[0], subcategories[0], 'assets/white_azalea_start.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Hibiscus Start', 'Grows into a yellow hibiscus start', 280, 10, categories[0], subcategories[0], 'assets/yellow_hibiscus_start.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Tea Olive Start', 'Grows into a yellow tea olive bush', 280, 10, categories[0], subcategories[0], 'assets/yellow_tea_olive_start.png', callback);
        },
        function(callback) {
            itemCreate('Red Cosmos Bag', 'Plants a bunch of red cosmos', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('White Cosmos Bag', 'Plants a bunch of white cosmos', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Cosmos Bag', 'Plants a bunch of yellow cosmos', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Red Hyacinth Bag', 'Plants a bunch of red hyacinths', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('White Hyacinth Bag', 'Plants a bunch of white hyacinths', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Hyacinth Bag', 'Plants a bunch of yellow hyacinths', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Red Lily Bag', 'Plants a bunch of red lilies', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('White Lily Bag', 'Plants a bunch of white lilies', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Lily Bag', 'Plants a bunch of yellow lillies', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Red Pansy Bag', 'Plants a bunch of red pansies', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('White Pansy Bag', 'Plants a bunch of white pansies', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Pansy Bag', 'Plants a bunch of yellow pansies', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Red Rose Bag', 'Plants a bunch of red roses', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('White Rose Bag', 'Plants a bunch of white roses', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Rose Bag', 'Plants a bunch of yellow roses', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Red Tulip Bag', 'Plants a bunch of red tulips', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('White Tulip Bag', 'Plants a bunch of white tulips', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Yellow Tulip Bag', 'Plants a bunch of yellow tulips', 280, 10, categories[0], subcategories[1], 'assets/flower_bag.png', callback);
        },
        function(callback) {
            itemCreate('Hardwood Sapling', 'Grows into a hardwood tree when planted', 280, 3, categories[0], subcategories[2], 'assets/hardwood_sapling.png', callback);
        },
        function(callback) {
            itemCreate('Cedar Sapling', 'Grows into a cedar tree when planted', 280, 3, categories[0], subcategories[2], 'assets/cedar_sapling.png', callback);
        },
        function(callback) {
            itemCreate('Fertilizer', 'Increases the chance of getting perfect fruit or hybrid flowers', 1600, 5, categories[0], subcategories[3], 'assets/fertilizer.png', callback);
        },
        function(callback) {
            itemCreate('Bamboo Shoot', 'Grows into bamboo grass', 250, 3, categories[0], subcategories[3], 'assets/bamboo_shoot.png', callback);
        },
        function(callback) {
            itemCreate('K.K. Ballad', 'Put in a music player to listen to K.K. Ballad', 3200, 2, categories[1], subcategories[4], 'assets/kkballad.png', callback);
        },
        function(callback) {
            itemCreate('Bubblegum K.K.', 'Put in a music player to listen to Bubblegum K.K.', 3200, 2, categories[1], subcategories[4], 'assets/bubblegumkk.png', callback);
        },
        function(callback) {
            itemCreate('Hypno K.K.', 'Put in a music player to listen to Hypno K.K.', 3200, 2, categories[1], subcategories[4], 'assets/hypnokk.png', callback);
        },
        function(callback) {
            itemCreate('Shovel', 'Use to dig and plant things', 500, 1, categories[2], subcategories[5], 'assets/shovel.png', callback);
        },
        function(callback) {
            itemCreate('Fishing Rod', 'Use to catch fish', 500, 1, categories[2], subcategories[5], 'assets/fishing_rod.png', callback);
        },
        function(callback) {
            itemCreate('Net', 'Use to catch bugs', 500, 1, categories[2], subcategories[5], 'assets/net.png', callback);
        },
        function(callback) {
            itemCreate('Bamboo Wall', 'Give your wall a bamboo-like look', 2400, 1, categories[3], subcategories[6], 'assets/bamboo_wall.png', callback);
        },
        function(callback) {
            itemCreate('Honeycomb Wall', 'Give your wall a beehive-like look', 3600, 1, categories[3], subcategories[6], 'assets/honeycomb_wall.png', callback);
        },
        function(callback) {
            itemCreate('Jingle Wall', 'Give your wall a festive look', 2500, 1, categories[3], subcategories[6], 'assets/jingle_wall.png', callback);
        },
        function(callback) {
            itemCreate('Bamboo Flooring', 'Give your floor a bamboo-like look', 2400, 1, categories[3], subcategories[7], 'assets/bamboo_flooring.png', callback);
        },
        function(callback) {
            itemCreate('Honeycomb Flooring', 'Give your floor a beehive-like look', 3000, 1, categories[3], subcategories[7], 'assets/honeycomb_flooring.png', callback);
        },
        function(callback) {
            itemCreate('Wildflower Meadow', 'Give your floor an earthy look', 3000, 1, categories[3], subcategories[7], 'assets/wildflower_meadow.png', callback);
        },
        function (callback) {
            itemCreate('Cool Sofa', 'Perfect for lounging or sitting stylishly', 10000, 1, categories[3], subcategories[8], 'assets/cool_sofa.png', callback);
        },
        function(callback) {
            itemCreate('Glass Holder with Candle', 'Light up a small desk or table', 350, 1, categories[3], subcategories[8], 'assets/candle.png', callback);
        },
        function(callback) {
            itemCreate('Fireplace', 'Warm up your living room with this fireplace', 5900, 1, categories[3], subcategories[8], 'assets/fireplace.png', callback);
        },
        function(callback) {
            itemCreate('Sailor\'s Tee', 'Wear this to look like a sailor', 1050, 1, categories[4], subcategories[9], 'assets/sailors_tee.png', callback);
        },
        function(callback) {
            itemCreate('Kurta', 'Wear this to have a traditional north Indian look', 1200, 1, categories[4], subcategories[9], 'assets/kurta.png', callback);
        },
        function(callback) {
            itemCreate('Bowling Shirt', 'Wear this to look like you\'re ready to go bowling', 1260, 1, categories[4], subcategories[9], 'assets/bowling_shirt.png', callback);
        },
        function(callback) {
            itemCreate('Sailor Skirt', 'Wear this to look like a sailor', 980, 1, categories[4], subcategories[10], 'assets/sailor_skirt.png', callback);
        },
        function(callback) {
            itemCreate('Pleather Pants', 'Wear this to look cool', 1300, 1, categories[4], subcategories[10], 'assets/pleather_pants.png', callback);
        },
        function(callback) {
            itemCreate('Chain Pants', 'Wear this to look even cooler than if you wore pleather pants', 1300, 1, categories[4], subcategories[10], 'assets/chain_pants.png', callback);
        },
        function(callback) {
            itemCreate('Mage\'s Hat', 'Wear this to look like a wizard', 3440, 1, categories[4], subcategories[11], 'assets/mages_hat.png', callback);
        },
        function(callback) {
            itemCreate('Halo', 'Wear this to look like an angel', 2200, 1, categories[4], subcategories[11], 'assets/halo.png', callback);
        },
        function(callback) {
            itemCreate('Elegant Hat', 'Wear this to look a little bourgeoisie', 2100, 1, categories[4], subcategories[11], 'assets/elegant_hat.png', callback);
        },
        function(callback) {
            itemCreate('Double Bridge Glasses', 'Wear to see clearly if you have bad eyesight', 1100, 1, categories[4], subcategories[12], 'assets/double_bridge_glasses.png', callback);
        },
        function(callback) {
            itemCreate('Goatee', 'Wear this for a more mature look', 980, 1, categories[4], subcategories[12], 'assets/goatee.png', callback);
        },
        function(callback) {
            itemCreate('Monocle', 'Wear this for a more scholarly look', 1100, 1, categories[4], subcategories[12], 'assets/monocle.png', callback);
        },
        function(callback) {
            itemCreate('Mage\'s Booties', 'Wear this to look like a wizard', 1550, 1, categories[4], subcategories[13], 'assets/mages_booties.png', callback);
        },
        function(callback) {
            itemCreate('Kimono Sandals', 'Wear this for a traditional Japanese look', 1600, 1, categories[4], subcategories[13], 'assets/kimono_sandals.png', callback);
        },
        function(callback) {
            itemCreate('Zap Boots', 'Wear this for a rock star look', 2640, 1, categories[4], subcategories[13], 'assets/zap_boots.png', callback);
        }
    ], cb);
}

async.series([
    createCategories,
    createSubcategories,
    createItems
],
function(err, results) {
    if (err) console.log('FINAL ERR: '+err);
    mongoose.connection.close();
});

