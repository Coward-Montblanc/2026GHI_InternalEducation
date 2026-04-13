import { PHONE_FORMATS } from "./phoneConfig";

export const formatPhoneNumber = (value, countryCode) => {
  const codeKey = String(countryCode);
  const config = PHONE_FORMATS[codeKey] || PHONE_FORMATS["default"];
  const maxLength = config.reduce((a, b) => a + b, 0);
  
  const rawNumbers = value.replace(/[^0-9]/g, "").slice(0, maxLength);
  
  let parts = [];
  let currentPos = 0;

  for (let length of config) {
    if (rawNumbers.length > currentPos) {
      parts.push(rawNumbers.slice(currentPos, currentPos + length));
      currentPos += length;
    } else {
      break;
    }
  }

  return parts.join("-");
};
