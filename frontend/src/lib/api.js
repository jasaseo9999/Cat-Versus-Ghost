import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const fetchScores = (limit = 20) => axios.get(`${API}/scores`, { params: { limit } }).then((r) => r.data);
export const submitScore = (payload) => axios.post(`${API}/scores`, payload).then((r) => r.data);
