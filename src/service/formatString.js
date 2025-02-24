export const formatString = (string) => {

    if (string === 'USDT amount') {
        return string;
    }

    // Add spaces before uppercase letters
    const stringWithSpaces = string.replace(/([A-Z])/g, ' $1').trim();
  
    // Capitalize the first letter of the string
    const formattedString = stringWithSpaces.charAt(0).toUpperCase() + stringWithSpaces.slice(1).toLowerCase();
  
    return formattedString;
}