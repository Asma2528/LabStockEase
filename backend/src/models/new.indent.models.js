const mongoose = require('mongoose');

const newIndentSchema = new mongoose.Schema({
  newindent_code: {
    type: String,
    trim: true,
    unique: true,
    required: true,
},
      categoryType: {
         type: String,
         enum: ['General', 'Project', 'Practical', 'Other'],
         required: true
       },
       category: { type: mongoose.Schema.Types.ObjectId, required: true },
  date_of_requirement: { 
    type: Date, 
    required: true 
  },
  items: [
    {
      class: { type: String, required: true },
      item: { type: String, required: true },
      unit_of_measure: { type: String, required: true, trim: true },
      quantity_required: { type: Number, required: true },
       description: { type: String},
       technical_details: { type: String},
            remark: { type: String }
          }
        ],
        requested_by: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'user', 
          required: true 
        },
        approved_by: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'user' 
        },
         ordered_by: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user' 
          },
          approved_at: { type: Date },
          ordered_at: { type: Date },
          status: { 
              type: String, 
              enum: ['Pending', 'Approved', 'Rejected', 'Ordered','Issued'], 
              default: 'Pending' 
            },
            remark: { type: String }
          }, { 
            timestamps: true 
          });
          
          module.exports = mongoose.model("NewIndent", newIndentSchema);
          