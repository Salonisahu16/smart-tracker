import { useState } from "react"
import axios from "axios"

function Login(){
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [msg, setMsg] = useState("")

    const login = async ()=>{
    try{
        const res = await axios.post("http://localhost:5000/api/auth/login",{
            email,password
        })

        localStorage.setItem("token", res.data.token)

        setMsg("Login Successful ✅")   

        setTimeout(()=>{
            window.location.href="/dashboard"
        },1000)   

    }catch(err){
        setMsg(err.response?.data?.msg || "Login Failed")
    }
}
    return(
      <div style={{
            height:"100vh",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            background:"linear-gradient(135deg, #74ebd5, #ACB6E5)"
       }}>

      <div style={{
            width:"350px",
            padding:"30px",
            borderRadius:"12px",
            background:"#fff",
            boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
            textAlign:"center"
        }}>

        <h2 style={{marginBottom:"20px"}}>Login 🔐</h2>

        <input 
        type="email"
        placeholder="Enter Email"
        style={{
            width:"100%",
            padding:"10px",
            margin:"10px 0",
            borderRadius:"8px",
            border:"1px solid #ccc"
        }}
        onChange={e=>setEmail(e.target.value)}
        />

        <input 
        type="password"
        placeholder="Enter Password"
        style={{
            width:"100%",
            padding:"10px",
            margin:"10px 0",
            borderRadius:"8px",
            border:"1px solid #ccc"
        }}
        onChange={e=>setPassword(e.target.value)}
        />

        <button 
        style={{
            width:"100%",
            padding:"10px",
            marginTop:"10px",
            borderRadius:"8px",
            border:"none",
            background:"#3498db",
            color:"#fff",
            fontWeight:"bold",
            cursor:"pointer"
        }}
        onClick={login}>
            Login
        </button>
        <p style={{marginTop:"10px"}}>
            Don't have an account? 
            <span 
            style={{color:"blue", cursor:"pointer"}}
            onClick={()=>window.location.href="/register"}>
                Register
            </span>
        </p>
        {msg && (
        <p style={{
            marginTop:"10px",
            color: msg.includes("Successful") ? "green" : "red",
            fontWeight:"bold"
        }}>
            {msg}
        </p>
    )}

    </div>
</div>
    )
}

export default Login