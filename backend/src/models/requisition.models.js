


const mongoose = require('mongoose');

const requisitionSchema = new mongoose.Schema({
  requisition_code: {
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
      item: { type: mongoose.Schema.Types.ObjectId, required: true },
      unit_of_measure: { type: String, required: true, trim: true },
      quantity_required: { type: Number, required: true },
        quantity_issued: { type: Number }, 
        // For return requests, you can record how much quantity is returned
  quantity_returned: { 
    type: Number 
  },
          quantity_lost_damaged: { type: Number }, 

      description: { type: String, required: true },
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
  issued_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user' 
  },
  approved_at: { type: Date },
  date_issued: { type: Date },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Issued', 'Return'], 
    default: 'Pending' 
  },
  remark: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Requisition", requisitionSchema);
