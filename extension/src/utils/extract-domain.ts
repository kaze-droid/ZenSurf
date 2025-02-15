export const validateAndExtractDomain = (input: string): { isValid: boolean; domain: string | null; error?: string } => {
    // Trim whitespace
    input = input.trim();

    // If empty, return early
    if (!input) {
        return { isValid: false, domain: null, error: 'Input cannot be empty' };
    }

    // If input doesn't have a protocol, add https:// to make it parseable
    if (!input.match(/^[a-zA-Z]+:\/\//)) {
        input = 'https://' + input;
    }

    try {
        const urlObj = new URL(input);

        // Check for invalid protocols
        if (['chrome:', 'about:', 'edge:', 'javascript:', 'newtab'].includes(urlObj.protocol)) {
            return { isValid: false, domain: null, error: 'Invalid protocol' };
        }

        // Handle extension protocols
        if (urlObj.protocol.endsWith('-extension:')) {
            return { isValid: true, domain: urlObj.protocol.slice(0, -1) };
        }

        // Get the hostname
        let domain = urlObj.hostname;

        // Basic domain validation
        if (!domain.includes('.') || domain.endsWith('.') || domain.startsWith('.')) {
            return { isValid: false, domain: null, error: 'Invalid domain format' };
        }

        // Remove www.
        domain = domain.replace(/^www\./, '');

        // Extract the main domain from subdomain
        const parts = domain.split('.');
        if (parts.length > 2) {
            // Handle special cases for country-specific domains
            const knownTlds = [
                // United Kingdom
                'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'nhs.uk',
                // Australia
                'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au',
                // Singapore
                'com.sg', 'edu.sg', 'gov.sg', 'net.sg', 'org.sg', 'per.sg',
                // Japan
                'co.jp', 'ne.jp', 'ac.jp', 'go.jp', 'or.jp',
                // New Zealand
                'co.nz', 'net.nz', 'org.nz', 'govt.nz',
                // Brazil
                'com.br', 'net.br', 'org.br', 'gov.br',
                // India
                'co.in', 'net.in', 'org.in', 'gov.in',
                // South Africa
                'co.za', 'web.za', 'org.za', 'gov.za'
            ];

            const lastTwoParts = parts.slice(-2).join('.');
            if (knownTlds.includes(lastTwoParts)) {
                // For domains like example.co.uk, take the last 3 parts
                domain = parts.slice(-3).join('.');
            } else {
                // For regular subdomains like chat.example.com, take the last 2 parts
                domain = parts.slice(-2).join('.');
            }
        }

        // Check for reasonable length
        if (domain.length < 3 || domain.length > 253) {
            return { isValid: false, domain: null, error: 'Domain length invalid' };
        }

        // Check if domain follows basic rules (alphanumeric, hyphens, dots)
        if (!domain.match(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/)) {
            return { isValid: false, domain: null, error: 'Invalid domain characters or format' };
        }

        return { isValid: true, domain };
    } catch (error) {
        return { isValid: false, domain: null, error: 'Invalid URL format' };
    }
}
