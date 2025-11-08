
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

export const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) {
    return name;
  }

  // To avoid cutting words in half, we look for the last space within the limit.
  const substringUptoMaxLength = name.substring(0, maxLength + 1);
  const lastSpaceIndex = substringUptoMaxLength.lastIndexOf(' ');

  // If a space is found, truncate at the space to avoid cutting words.
  if (lastSpaceIndex > 0) {
    return `${name.substring(0, lastSpaceIndex).trim()}...`;
  }
  
  // Otherwise (e.g., a very long single word), do a hard cut at the original maxLength.
  return `${name.substring(0, maxLength).trim()}...`;
};
