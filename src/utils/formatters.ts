export const formatCurrency = (
  amount: number,
  currency = 'PHP',
  accountingFormat = false
): string => {
  const isNegative = amount < -0.00001;
  const absValue = Math.abs(amount);

  let formatted = '';
  if (currency === 'PHP') {
    formatted = `₱${new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absValue)}`;
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absValue);
  }

  if (accountingFormat && isNegative) {
    return `(${formatted})`;
  }
  return isNegative ? `-${formatted}` : formatted;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    }
    return dateString;
  } catch {
    return dateString;
  }
};

export const formatPercent = (percent: number): string => {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

export const formatTin = (rawTin?: string): string => {
  if (!rawTin) return '000-000-000-00000';
  const digits = rawTin.replace(/\D/g, '');
  if (digits.length >= 12) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 14)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-00000`;
  }
  return rawTin;
};
