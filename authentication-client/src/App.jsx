import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
function App() {
  axios.defaults.withCredentials = true;
  const [role, setRole] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  const [user, setUser] = useState(null);

  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/login").then((response) => {
      console.log(response);
      if (response.data.loggedIn == true) {
        setLoginStatus(true);
        setRole(response.data.user[0].role);
        setUser(response.data.user[0]);
      }
    });
  }, [refetch]);
  console.log("Role", role);
  console.log("User", user);
  const handleRegister = async (event) => {
    event.preventDefault();
    const username = event.target.regusername.value;
    const password = event.target.regpassword.value;
    axios
      .post("http://localhost:8000/register", { username, password })
      .then((response) => {
        if (response.status === 200) {
          alert("Successfull");
        } else {
          alert("Failed");
        }
      });
  };
  const handleLogin = async (event) => {
    event.preventDefault();
    const username = event.target.logusername.value;
    const password = event.target.logpassword.value;
    axios
      .post("http://localhost:8000/login", { username, password })
      .then((response) => {
        if (response.status === 200) {
          alert("Successfull");
          setRefetch(!refetch);
        } else {
          alert("Failed");
        }
      });
  };

  const handleLogout = () => {
    axios.get("http://localhost:8000/logout").then((response) => {
      if (response.status === 200) {
        setLoginStatus(false);
        setRole("");
        setUser(null);
        alert("Successfully logged out");
      } else {
        alert("Logout failed");
      }
    });
  };

  return (
    <div className="container">
      <h1>{user?.username}</h1>
      {loginStatus && <button onClick={handleLogout}>Log Out</button>}
      <div className="auth-container">
        <h1>Register</h1>
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            id="regusername"
            placeholder="Username"
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            id="regpassword"
            className="input-field"
          />
          <input type="submit" value="Register" className="submit-btn" />
        </form>
      </div>
      <div className="auth-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="text"
            id="logusername"
            placeholder="Username"
            className="input-field"
          />
          <input
            type="password"
            id="logpassword"
            placeholder="Password"
            className="input-field"
          />
          <input type="submit" value="Login" className="submit-btn" />
        </form>
      </div>
    </div>
  );
}

export default App;
