// ==================== DATE FORMATTERS ====================

export const formatDate = (dateString: string, locale = 'vi-VN'): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString: string, locale = 'vi-VN'): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vá»«a xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phÃºt trÆ°á»›c`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giá» trÆ°á»›c`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngÃ y trÆ°á»›c`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuáº§n trÆ°á»›c`;

  return formatDate(dateString);
};

// ==================== NUMBER FORMATTERS ====================

export const formatNumber = (value: number, locale = 'vi-VN'): string => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString(locale);
};

export const formatCurrency = (value: number, currency = 'VND', locale = 'vi-VN'): string => {
  if (value === null || value === undefined) return '0 â‚«';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyShort = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tá»·`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} triá»‡u`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} nghÃ¬n`;
  }
  return formatNumber(value);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// ==================== UNIT FORMATTERS ====================

export const formatCO2 = (kgValue: number): string => {
  if (kgValue >= 1000) {
    return `${(kgValue / 1000).toFixed(2)} táº¥n COâ‚‚`;
  }
  return `${formatNumber(kgValue)} kg COâ‚‚`;
};

export const formatArea = (m2Value: number): string => {
  if (m2Value >= 10000) {
    return `${(m2Value / 10000).toFixed(2)} ha`;
  }
  return `${formatNumber(m2Value)} mÂ²`;
};

export const formatCredits = (credits: number): string => {
  return `${formatNumber(credits)} tÃ­n chá»‰`;
};

// ==================== TEXT FORMATTERS ====================

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// ==================== STATUS FORMATTERS ====================

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Contract Status
    DRAFT: 'gray',
    PENDING: 'yellow',
    ACTIVE: 'green',
    EXPIRED: 'red',
    TERMINATED: 'red',
    RENEWED: 'blue',

    // Credit Status
    VERIFIED: 'green',
    ISSUED: 'blue',
    SOLD: 'purple',
    RETIRED: 'orange',
    CANCELLED: 'red',

    // Health Status
    HEALTHY: 'green',
    STRESSED: 'yellow',
    DISEASED: 'red',
    DEAD: 'gray',

    // General
    APPROVED: 'green',
    REJECTED: 'red',
    COMPLETED: 'green',
    CANCELLED_GENERAL: 'gray',
  };

  return statusColors[status] || 'gray';
};

export const getStatusBadgeClass = (status: string): string => {
  const color = getStatusColor(status);
  return `bg-${color}-100 text-${color}-800 border-${color}-200`;
};

// ==================== PHONE & EMAIL FORMATTERS ====================

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // Format: 0901234567 -> 090 123 4567
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

export const maskEmail = (email: string): string => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length <= 3) {
    return `${name[0]}***@${domain}`;
  }
  return `${name.slice(0, 3)}***@${domain}`;
};
