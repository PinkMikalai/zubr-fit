const BASE_URL = import.meta.env.VITE_API_URL;

const api = async (endpoint, method, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export default api;