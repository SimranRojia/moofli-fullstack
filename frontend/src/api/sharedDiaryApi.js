import axios from "axios";
import { API_BASE_URL } from "../config";
const api = axios.create({
    baseURL: `${API_BASE_URL}/api/shared-diaries`,
});

api.interceptors.request.use(
  (config) => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const createSharedDiary = async ({ title, partnerEmail }) => {
    const { data } = await api.post("/", { title, partnerEmail });
    return data;
};

export const getMySharedDiaries = async () => {
    const { data } = await api.get("/");
    return data;
};

export const getSharedDiary = async (id) => {
    const { data } = await api.get(`/${id}`);
    return data;
};

export const addEntry = async (id, { content, mood, images }) => {
    const form = new FormData();
    if (content) form.append("content", content);
    if (mood) form.append("mood", mood);
    (images || []).forEach((f) => form.append("images", f));
    const { data } = await api.post(`/${id}/entries`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const updateEntry = async (id, entryId, { content, mood, existingImages = [], newImages = [] }) => {
    const form = new FormData();
    if (content !== undefined) form.append("content", content);
    if (mood !== undefined) form.append("mood", mood);
    form.append("existingImages", JSON.stringify(existingImages));
    (newImages || []).forEach((f) => form.append("images", f));
    const { data } = await api.put(`/${id}/entries/${entryId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const deleteEntry = async (id, entryId) => {
    const { data } = await api.delete(`/${id}/entries/${entryId}`);
    return data;
};
