import axios from "axios";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
} from "../../config/serverApiConfig";
const api = axios.create({
  baseURL: API_API_URL + "/api/zone", // Assurez-vous que cela correspond à l'URL de votre API
});

export default api;
