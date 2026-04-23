import { useState } from "react"
import axios from "axios"

function Register() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [msg, setMsg] = useState("")

    const validate = () => {
        if (!email || !password) {
            return "All fields are required"
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return "Invalid email format ❌"
        }

        // Password validation
        if (password.length < 6) {
            return "Password must be at least 6 characters ❌"
        }

        return null
    }

    const register = async () => {

        const error = validate()

        if (error) {
            setMsg(error)
            return
        }

        try {
            await axios.post("https://smart-tracker-backend-9ke9.onrender.com/api/auth/register", {
                email, password
            })

            setMsg("Registration Successful ✅")

            setTimeout(() => {
                window.location.href = "/"
            }, 1000)

        } catch (err) {
            setMsg(err.response?.data?.msg || "Registration Failed")
        }
    }

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #89f7fe, #66a6ff)"
        }}>

            <div style={{
                width: "350px",
                padding: "30px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                textAlign: "center"
            }}>

                <h2 style={{ marginBottom: "20px" }}>Register 📝</h2>

                <input
                    type="email"
                    placeholder="Enter Email"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "10px 0",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                    }}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Enter Password"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "10px 0",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                    }}
                    onChange={e => setPassword(e.target.value)}
                />

                <button
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#2ecc71",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                    onClick={register}>
                    Register
                </button>

                {/* MESSAGE */}
                {msg && (
                    <p style={{
                        marginTop: "10px",
                        fontWeight: "bold",
                        color: msg.includes("Successful") ? "green" : "red"
                    }}>
                        {msg}
                    </p>
                )}

            </div>
        </div>
    )
}

export default Register