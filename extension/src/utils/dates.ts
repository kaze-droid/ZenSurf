export const monthMap: { [key: string]: number } = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
};

export const dateRegex = /^\d{2}-[a-zA-Z]{3}-\d{4}$/;

export const curDate = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .replaceAll(' ', '-')
    .toLowerCase();
