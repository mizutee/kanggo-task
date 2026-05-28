function validatePayload(fields, payload = {}) {
  const requestPayload = payload || {};
  const missingFields = {};
  const requiredFields = fields.filter((field) => field.required !== false);

  requiredFields.forEach((field) => {
    const rawValue = requestPayload[field.key];
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (value === undefined || value === null || value === '') {
      missingFields[field.key] = `${field.key} is required!`;
    }
  });

  const data = fields.reduce((payloadData, field) => {
    const rawValue = requestPayload[field.key];

    if (rawValue === undefined) {
      return payloadData;
    }

    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (field.required !== false && (value === null || value === '')) {
      return payloadData;
    }

    payloadData[field.key] = value;

    return payloadData;
  }, {});

  if (Object.keys(missingFields).length > 0) {
    return {
      isValid: false,
      data,
      error: missingFields,
    };
  }

  return {
    isValid: true,
    data,
  };
}

module.exports = {
  validatePayload,
};
