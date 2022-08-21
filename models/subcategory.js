var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubcategorySchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    }
)


//Export model
module.exports = mongoose.model('Subcategory', SubcategorySchema)