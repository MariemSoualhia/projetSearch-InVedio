import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api/zone', // Assurez-vous que cela correspond à l'URL de votre API
});

export default api;
