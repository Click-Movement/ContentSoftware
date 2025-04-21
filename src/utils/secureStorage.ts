import CryptoJS from 'crypto-js';

// We use a device-specific fingerprint to make the encryption harder to crack
// and to tie the encryption to the user's device
const getDeviceFingerprint = (): string => {
  const browserInfo = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width, 
    screen.height
  ].join('|');
  
  // Use the hash of this information as our encryption key
  return CryptoJS.SHA256(browserInfo).toString();
};

// Generate an encryption key based on the device fingerprint
const getEncryptionKey = (): string => {
  // The key is derived from device characteristics to make it device-specific
  return getDeviceFingerprint();
};

// Encrypt data before storing
export const encryptData = <T>(data: T): string => {
    try {
        const jsonString = JSON.stringify(data);
        const encryptionKey = getEncryptionKey();
        return CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

// Decrypt stored data
export const decryptData = <T>(encryptedData: string): T | null => {
    try {
        const encryptionKey = getEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString) as T;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

// Save encrypted data to localStorage
export const secureSet = <T>(key: string, data: T): void => {
    try {
        const encryptedData = encryptData<T>(data);
        localStorage.setItem(`secure_${key}`, encryptedData);
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
    }
};

// Get and decrypt data from localStorage
export const secureGet = <T>(key: string): T | null => {
    try {
        const encryptedData = localStorage.getItem(`secure_${key}`);
        if (!encryptedData) return null;
        return decryptData<T>(encryptedData);
    } catch (error) {
        console.error(`Error retrieving ${key}:`, error);
        return null;
    }
};

// Remove data from localStorage
export const secureRemove = (key: string): void => {
  localStorage.removeItem(`secure_${key}`);
};