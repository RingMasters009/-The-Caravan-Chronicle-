const professionMapping = {
  // Electrical
  'Electric Shortage': ['Electrician'],
  'Lighting': ['Electrician'],
  'Power Outage': ['Electrician'],
  'Faulty Wiring': ['Electrician'],
  'Street Light Failure': ['Electrician'],

  // Plumbing / Water
  'Water Leakage': ['Plumber'],
  'Clogged Drain': ['Plumber'],
  'Broken Pipe': ['Plumber'],
  'Water Supply Issue': ['Plumber'],
  'Sewage Issue': ['Plumber'],

  // Vehicle / Traffic
  'Abandoned Vehicle': ['Mechanic'],
  'Traffic Signal Issue': ['Mechanic', 'Electrician'],
  'Illegal Parking': [], // No specific profession
  'Road Blockage': ['Cleaner'],

  // Sanitation / General
  'Garbage': ['Cleaner'],
  'Street Cleaning': ['Cleaner'],
  'Public Restroom Issue': ['Cleaner', 'Plumber'],
  'Waste Management': ['Cleaner'],
  'Recycling Issue': ['Cleaner'],

  // Default/Other
  'Other': [],
};

module.exports = professionMapping;
