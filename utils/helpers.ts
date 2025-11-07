
// This utility file is intended to use `uuid` which is a widely-used library for generating UUIDs.
// To use it, you'll need to add it to your project, for example: `npm install uuid @types/uuid`
// However, to keep this self-contained, we are not adding an external library dependency.
// Instead, we use `crypto.randomUUID()` which is available in modern browsers.
// If you are in an environment without `crypto.randomUUID` you will need to install uuid.
// We are aliasing uuidv4 to a function that uses it for demonstration purposes.
import { v4 as uuidv4 } from 'uuid'; // You would normally use this.

export const generateId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for older environments, though it's less ideal.
  // In a real project with dependencies, you'd use the imported uuidv4().
  console.warn("`crypto.randomUUID` not available. Using a less robust fallback.");
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const formatCurrencyBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  // Assuming dateString is in 'YYYY-MM-DD' format
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Ensure 32bit integer
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};
