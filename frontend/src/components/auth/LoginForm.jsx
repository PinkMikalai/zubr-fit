import { useState, useEffect } from "react";
import authService from "../../services/authService";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    //function async to login
    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:8000/api/auth/login", { email, password });
        } catch (error) {
            setError(error.response.data.message);
        }
    }
}

export default LoginForm;