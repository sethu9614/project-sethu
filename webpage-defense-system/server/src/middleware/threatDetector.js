import SecurityEvent from '../models/SecurityEvent.js';

// Basic illustrative rules only; this is not a full web application firewall.
const rules = [
  { name: 'Path traversal pattern', regex: /\.\.(?:\/|\\)/i, severity: 'high' },
  { name: 'Script injection pattern', regex: /<\s*script\b/i, severity: 'high' },
  { name: 'SQL injection-like pattern', regex: /(?:\bunion\s+select\b|\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i, severity: 'medium' },
  { name: 'Sensitive file probing', regex: /(?:\/\.env\b|\/wp-config\.php\b|\/etc\/passwd\b)/i, severity: 'high' }
];

export async function threatDetector(req, res, next) {
  try {
    const target = `${req.originalUrl || ''} ${JSON.stringify(req.body || {})}`;
    const match = rules.find(rule => rule.regex.test(target));
    if (!match) return next();

    await SecurityEvent.create({
      type: match.name,
      severity: match.severity,
      message: `Suspicious request pattern detected: ${match.name}`,
      path: req.originalUrl || '/',
      method: req.method,
      action: 'blocked',
      sourceIp: req.ip || 'unknown'
    });

    return res.status(403).json({ message: 'Request blocked by the demo security filter' });
  } catch (error) {
    // Fail closed if the detector cannot log a matched event, but avoid breaking normal traffic on DB errors.
    console.error('Threat detector error:', error.message);
    return next();
  }
}
