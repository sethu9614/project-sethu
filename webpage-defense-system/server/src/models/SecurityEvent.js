import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  message: { type: String, required: true },
  path: { type: String, default: '/' },
  method: { type: String, default: 'GET' },
  action: { type: String, enum: ['allowed', 'blocked', 'logged'], default: 'logged' },
  sourceIp: { type: String, default: 'unknown' },
  demo: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('SecurityEvent', securityEventSchema);
