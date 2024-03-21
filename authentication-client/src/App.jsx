import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
function App() {
  axios.defaults.withCredentials = true;
  const [loginStatus, setLoginStatus] = useState(false);
  const [user, setUser] = useState(null);

  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/login").then((response) => {
      console.log(response);
      if (response.data.loggedIn == true) {
        setLoginStatus(true);
        setUser(response.data.user[0]);
      }
    });
  }, [refetch]);
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
        if (!response.data.auth) {
          setLoginStatus(false);
          alert("login failed");
        } else {
          console.log(response.data);
          localStorage.setItem("token", response.data.token);
          setLoginStatus(true);
          setRefetch(!refetch);
          alert("login successfull");
        }
      });
  };

  const handleLogout = () => {
    axios.get("http://localhost:8000/logout").then((response) => {
      if (response.status === 200) {
        setLoginStatus(false);
        setUser(null);
        alert("Successfully logged out");
      } else {
        alert("Logout failed");
      }
    });
  };
  const userAuthenticeted = () => {
    axios
      .get("http://localhost:8000/isUserAuth", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        console.log(response);
      });
  };
  userAuthenticeted();
  return (
    <div className="container">
      <h1>
        Name: {user?.username} Role: {user?.role}
      </h1>
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
