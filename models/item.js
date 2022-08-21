var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        description: {type: String, required: true},
        price: {type: Number, required: true},
        stock: {type: Number, required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
        subcategory: {type: Schema.Types.ObjectId, ref: 'Subcategory'},
        imageURL: {type: String}

    }
)

// Virtual for item's URL
ItemSchema
.virtual('url')
.get(function () {
    return '/catalog/' + this.category._id + '/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema)