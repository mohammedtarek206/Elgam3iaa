const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Complaint', 'Suggestion'],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Resolved'],
  },
}, { timestamps: true });

TicketSchema.index({ ticketId: 1 });
TicketSchema.index({ status: 1 });

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
