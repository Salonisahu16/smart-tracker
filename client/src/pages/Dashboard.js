import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
} from "chart.js"
import { FaPlay, FaPause, FaRedo, FaFire, FaMoon, FaSignOutAlt } from "react-icons/fa"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement)

function Dashboard() {
    const [time, setTime] = useState("")
    const [sessions, setSessions] = useState([])

    const [seconds, setSeconds] = useState(1500)
    const [isRunning, setIsRunning] = useState(false)
    const [isBreak, setIsBreak] = useState(false)
    const [loading, setLoading] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [mode, setMode] = useState("pomodoro")
    const [showCongrats, setShowCongrats] = useState(false)
    const [view, setView] = useState("daily")
    const [goal, setGoal] = useState(5)
    const token = localStorage.getItem("token")
    const [editId, setEditId] = useState(null)
    const [editValue, setEditValue] = useState("")

    const fetchSessions = useCallback(async () => {
        setLoading(true)

        const res = await axios.get(
            "http://localhost:5000/api/session",
            { headers: { Authorization: token } }
        )

        setSessions(res.data)
        setLoading(false)
    }, [token])

    const saveSession = useCallback(async () => {
        await axios.post(
            "http://localhost:5000/api/session/add",
            { duration: time },
            { headers: { Authorization: token } }
        )

        fetchSessions()
    }, [time, token, fetchSessions])


    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    useEffect(() => {
        let timer

        if (isRunning) {
            timer = setInterval(() => {
                setSeconds(prev => prev > 0 ? prev - 1 : 0)
            }, 1000)
        }

        return () => clearInterval(timer)
    }, [isRunning])

    useEffect(() => {
        if (seconds === 0) {
            if (mode === "custom") {
                saveSession()
                setShowCongrats(true)

                setTimeout(() => {
                    setShowCongrats(false)
                }, 3000)
                return
            }

            // pomodoro logic
            if (!isBreak) {
                setSeconds(300)
                setIsBreak(true)
                alert("Break Time ☕")
            } else {
                setSeconds(1500)
                setIsBreak(false)
                saveSession()
                alert("Back to work 💪")
            }
        }
    }, [seconds, isBreak, saveSession, mode])

    const startTimer = () => {
        if (mode === "pomodoro") {
            setSeconds(1500) // 25 min
        } else {
            if (!time) return alert("Enter hours")

            const totalSeconds = Number(time) * 60 * 60
            setSeconds(totalSeconds)
        }

        setIsRunning(true)
    }

    const resetTimer = () => {
        if (mode === "pomodoro") {
            setSeconds(1500)
        } else {
            if (!time) return alert("Enter hours first")

            const totalSeconds = Number(time) * 60 * 60
            setSeconds(totalSeconds)
        }

        setIsRunning(false)
    }

    const getSuggestion = () => {
        if (sessions.length < 3) return "Start building consistency"

        const last3 = sessions.slice(-3)
        const avg = last3.reduce((a, b) => a + Number(b.duration), 0) / 3

        if (avg < 2) return "Low focus. Try Pomodoro strictly"
        if (avg <= 5) return "Good progress 👍"
        return "High productivity 🔥"
    }

    const getStreak = () => {
        if (sessions.length === 0) return 0

        let streak = 1

        for (let i = sessions.length - 1; i > 0; i--) {
            const diff = new Date(sessions[i].date) - new Date(sessions[i - 1].date)

            if (diff <= 86400000) streak++
            else break
        }

        return streak
    }

    const getTodayTotal = () => {
        const today = new Date().toDateString()

        return sessions
            .filter(s => new Date(s.date).toDateString() === today)
            .reduce((a, b) => a + Number(b.duration), 0)
    }


    const logout = () => {
        localStorage.removeItem("token")
        window.location.href = "/"
    }
    const deleteSession = async (id) => {
        await axios.delete(
            `http://localhost:5000/api/session/${id}`,
            { headers: { Authorization: token } }
        )

        fetchSessions()
    }
    const getMaxDay = () => {
        if (sessions.length === 0) return "No data"

        let maxSession = sessions[0]

        sessions.forEach(s => {
            if (Number(s.duration) > Number(maxSession.duration)) {
                maxSession = s
            }
        })

        return `${new Date(maxSession.date).toLocaleDateString()} (${maxSession.duration} hrs)`
    }
    const getWeeklyData = () => {
        const weekMap = {}

        sessions.forEach(s => {
            const date = new Date(s.date)

            // week number calculate
            const firstDay = new Date(date.getFullYear(), 0, 1)
            const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000))
            const week = Math.ceil((days + firstDay.getDay() + 1) / 7)

            const key = `Week ${week}`

            if (!weekMap[key]) {
                weekMap[key] = 0
            }

            weekMap[key] += Number(s.duration)
        })

        return {
            labels: Object.keys(weekMap),
            data: Object.values(weekMap)
        }
    }
    const weekly = getWeeklyData()

    const chartData = {
        labels: view === "daily"
            ? sessions.map(s => new Date(s.date).toLocaleDateString())
            : weekly.labels,

        datasets: [
            {
                label: view === "daily" ? "Daily Study Time" : "Weekly Study Time",
                data: view === "daily"
                    ? sessions.map(s => s.duration)
                    : weekly.data
            }
        ]
    }
    const getAchievement = () => {
        const streak = getStreak()
        const max = sessions.length > 0
            ? Math.max(...sessions.map(s => Number(s.duration)))
            : 0

        if (streak >= 5) return "🔥 Consistency King"
        if (max >= 8) return "💪 Beast Mode"
        if (streak >= 3) return "👍 Good Habit"
        return "🚀 Getting Started"
    }
    const updateSession = async (id) => {
        await axios.put(
            `http://localhost:5000/api/session/${id}`,
            { duration: editValue },
            { headers: { Authorization: token } }
        )

        setEditId(null)
        fetchSessions()
    }

    return (
        <div>
            {showCongrats && (
                <div style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    background: "#2ecc71",
                    color: "#fff",
                    padding: "15px 20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    fontWeight: "bold",
                    animation: "fadeIn 0.5s ease"
                }}>
                    🎉 Session Completed!
                </div>
            )}

            <div style={{
                maxWidth: "600px",
                margin: "40px auto",
                padding: "25px",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                textAlign: "center",
                backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            }}>

                <h1 style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    color: darkMode ? "#00ffcc" : "#333"
                }}>
                    Smart Study Tracker 🚀
                </h1>
                <h3>
                    {mode === "pomodoro" ? "Pomodoro Mode 🍅" : "Custom Mode ⏱️"}
                </h3>

                <div style={{ marginBottom: "10px" }}>

                    <button
                        onClick={() => setMode("pomodoro")}
                        style={{
                            padding: "8px 12px",
                            margin: "5px",
                            borderRadius: "8px",
                            border: "none",
                            background: mode === "pomodoro" ? "#3498db" : "#ccc",
                            color: "#fff"
                        }}>
                        Pomodoro
                    </button>


                    <button
                        onClick={() => setMode("custom")}
                        style={{
                            padding: "8px 12px",
                            margin: "5px",
                            borderRadius: "8px",
                            border: "none",
                            background: mode === "custom" ? "#9b59b6" : "#ccc",
                            color: "#fff"
                        }}>
                        Custom Timer
                    </button>

                </div>

                {/* TIMER CARD */}
                <div style={{
                    padding: "15px",
                    margin: "15px 0",
                    borderRadius: "10px",
                    background: darkMode ? "#180808" : "#f5f5f5"
                }}>
                    <h2 style={{
                        fontSize: "40px",
                        transition: "all 0.3s ease"
                    }}>
                        {Math.floor(seconds / 60)}:
                        {seconds % 60 < 10 ? "0" : ""}
                        {seconds % 60}
                    </h2>

                    <button
                        style={{
                            background: "#2ecc71",
                            color: "#fff",
                            border: "none",
                            padding: "10px 15px",
                            margin: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                        onClick={startTimer}>
                        <FaPlay /> Start
                    </button>

                    <button
                        style={{
                            background: "#f39c12",
                            color: "#fff",
                            border: "none",
                            padding: "10px 15px",
                            margin: "8px",
                            borderRadius: "8px"
                        }}
                        onClick={() => setIsRunning(false)}>
                        <FaPause /> Pause
                    </button>

                    <button
                        style={{
                            background: "#3498db",
                            color: "#fff",
                            border: "none",
                            padding: "10px 15px",
                            margin: "8px",
                            borderRadius: "8px"
                        }}
                        onClick={resetTimer}>
                        <FaRedo /> Reset
                    </button>
                </div>

                <div style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px"
                }}>

                    {/* Suggestion */}
                    <h3 style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        background:
                            getSuggestion().includes("Low") ? "#e74c3c" :
                                getSuggestion().includes("Good") ? "#f39c12" :
                                    "#2ecc71",
                        color: "#fff"
                    }}>
                        {getSuggestion()}
                    </h3>

                    {/* Streak */}
                    <div style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        background: "linear-gradient(45deg, #ff9a9e, #fad0c4)",
                        fontWeight: "bold"
                    }}>
                        <FaFire /> Streak: {getStreak()} days 🔥
                    </div>

                    {/*Analytics*/}
                    <div style={{
                        padding: "15px",
                        margin: "15px 0",
                        borderRadius: "10px",
                        background: darkMode ? "#2c2c2c" : "#f5f5f5"
                    }}>
                        <h3>📊 Analytics</h3>

                        <p style={{
                            background: "#27ae60",
                            color: "#fff",
                            padding: "8px",
                            borderRadius: "6px",
                            display: "inline-block"
                        }}>
                            🔥 Highest Study Day: {getMaxDay()}
                        </p>
                    </div>
                </div>

                <div style={{
                    marginTop: "10px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#8e44ad",
                    color: "#fff"
                }}>
                    🏆 {getAchievement()}
                </div>

                <h3>🎯 Daily Goal</h3>

                <input
                    type="number"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    style={{
                        padding: "8px",
                        borderRadius: "6px",
                        margin: "5px"
                    }}
                />

                <div style={{
                    marginTop: "10px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#ddd"
                }}>
                    <div style={{
                        width: `${(getTodayTotal() / goal) * 100}%`,
                        background: "#2ecc71",
                        color: "#fff",
                        padding: "5px",
                        borderRadius: "6px"
                    }}>
                        {getTodayTotal()} / {goal} hrs
                    </div>
                </div>

                {/* INPUT */}
                <div style={{
                    padding: "15px",
                    margin: "15px 0",
                    borderRadius: "10px",
                    background: darkMode ? "#2c2c2c" : "#f5f5f5"
                }}>
                    <input
                        type="number"
                        placeholder="Enter study hours"
                        style={{
                            padding: "10px",
                            width: "80%",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px"
                        }}
                        onChange={e => setTime(e.target.value)}
                    />
                    <br />
                    <button
                        style={{
                            background: "#9b59b6",
                            color: "#fff",
                            border: "none",
                            padding: "10px 15px",
                            margin: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                        onClick={saveSession}>
                        💾 Save Session
                    </button>
                </div>

                <div style={{ marginBottom: "10px" }}>

                    <button
                        onClick={() => setView("daily")}
                        style={{
                            background: view === "daily" ? "#3498db" : "#ccc",
                            color: "#fff",
                            border: "none",
                            padding: "8px 12px",
                            margin: "5px",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        📅 Daily
                    </button>

                    <button
                        onClick={() => setView("weekly")}
                        style={{
                            background: view === "weekly" ? "#9b59b6" : "#ccc",
                            color: "#fff",
                            border: "none",
                            padding: "8px 12px",
                            margin: "5px",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        📊 Weekly
                    </button>

                </div>

                {/* GRAPH */}
                <div style={{
                    padding: "15px",
                    margin: "15px 0",
                    borderRadius: "10px",
                    background: darkMode ? "#2c2c2c" : "#f5f5f5",
                    transition: "0.3s",
                }}>
                    {loading ? <h3>Loading...</h3> : <Line data={chartData} />}
                </div>

                {/*Study History*/}
                <h2 style={{ marginTop: "20px" }}>📅 Study History</h2>

                <div style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    textAlign: "left",
                    padding: "10px"
                }}>
                    {sessions.map((s, i) => (
                        <div key={i} style={{
                            padding: "10px",
                            margin: "6px 0",
                            borderRadius: "8px",
                            background: darkMode ? "#333" : "#eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            {editId === s._id ? (
                                <>
                                    <input
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        style={{ width: "60px" }}
                                    />
                                    <button onClick={() => updateSession(s._id)}>Save</button>
                                </>
                            ) : (
                                <span>
                                    {new Date(s.date).toLocaleDateString()} → {s.duration} hrs
                                </span>
                            )}

                            <button
                                onClick={() => deleteSession(s._id)}
                                style={{
                                    background: "#c0392b",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                }}>
                                ❌ Delete
                            </button>
                            <button
                                onClick={() => {
                                    setEditId(s._id)
                                    setEditValue(s.duration)
                                }}
                                style={{
                                    background: "#2980b9",
                                    color: "#fff",
                                    border: "none",
                                    padding: "5px 10px",
                                    marginRight: "5px",
                                    borderRadius: "6px"
                                }}>
                                ✏️ Edit
                            </button>
                        </div>
                    ))}
                </div>

                {/* BUTTONS */}
                <button
                    style={{
                        background: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        padding: "10px 15px",
                        margin: "8px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                    onClick={logout}>
                    <FaSignOutAlt /> Logout
                </button>
                <button
                    style={{
                        background: darkMode ? "#f1c40f" : "#2c3e50",
                        color: "#fff",
                        border: "none",
                        padding: "10px 15px",
                        margin: "8px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                    onClick={() => setDarkMode(!darkMode)}>
                    <FaMoon /> {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
            </div>
        </div>
    )
}
export default Dashboard