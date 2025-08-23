import axios from "axios";
import { fetchIncome, addIncome } from "../api";

const API_URL = "http://localhost:8000/api/income";

export const getIncomes = () => axios.get(API_URL);
export const addIncome = (data) => axios.post(API_URL, data);
export const updateIncome = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteIncome = (id) => axios.delete(`${API_URL}/${id}`);
