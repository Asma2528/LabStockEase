const mongoose = require("mongoose");


const booksLogSchema = new mongoose.Schema({
    item: { 
           type: mongoose.Schema.Types.ObjectId, 
           ref: 'ChemistryBooks', // Reference to the book model
           required: true 
       },
     request_model: {
          type: String,
          required: true,
          trim: true,
        },
        request: {
          type: mongoose.Schema.Types.ObjectId,
        },
        issued_quantity: {
            type: Number,
            required: true,
            min: 0,
          },
          date_issued: {
              type: Date,
              default: Date.now,
              required: true,
            },
          user_email: {
            type: String,
            required: true,
            trim: true,
          },
              date_return: { type: Date,default:null }
}, { timestamps: true });

const BooksLogModel = mongoose.model("ChemistryBooksLog", booksLogSchema);
module.exports = BooksLogModel;
