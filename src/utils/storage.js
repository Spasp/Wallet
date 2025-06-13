import { MMKV } from 'react-native-mmkv';


export const storage = new MMKV({
  id: 'secure_storage',            
  encryptionKey: 'NatechKey' 
});
