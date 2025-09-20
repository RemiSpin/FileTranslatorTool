import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/index.module.css";
import TranslateStraight from "./TranslateStraight.js";

function SignIn() {
  const navigate = useNavigate();
  const [passEr, setPasError] = useState("");
  const [emailEr, setEmailError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    credential: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Trim form data
    const trimmedData = {};
    for (const key in formData) {
      formData[key] = formData[key].trim();
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/signin",
        formData
      );
      if (response == 1) {
        setPasError("Incorrect password.");
      } else if (response == 2) {
        setEmailError("There are no accounts tied to this address");
      } else {
        localStorage.setItem("token", response.data.token);
        console.log(response.data.token);
        navigate("/Translate");
      }
    } catch (error) {
      console.error("Error logging in user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="row" id={styles.indexy}>
      <div className={`${"thirty"} ${styles.thirty}`} id={styles.signIn}>
        <h1>SIGN IN</h1>
        <form onSubmit={handleSubmit}>
          <p>Email</p>
          <input
            type="text"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailEr && (
            <p id="emailEr" className={styles.error}>
              {emailEr}
            </p>
          )}
          <p>Password</p>
          <span className={styles.password}>
            <input
              className="passwordinput"
              type="password"
              name="credential"
              placeholder="8 Characters or More"
              value={formData.credential}
              onChange={handleChange}
              required
            />
            {/* <img id="loginPassI" src="openeye.png" onclick="seePass('loginPassI', 'loginPass')"/> */}
          </span>
          {passEr && (
            <p id="passEr" className={styles.error}>
              {passEr}
            </p>
          )}
          <br />
          <br />
          <button type="submit" name="loginSub" id="signInBttn">
            SIGN IN
          </button>
        </form>
        <br />
        <div className="row">
          <hr />
          <span id={styles.or}> OR </span>
          <hr />
        </div>
        <br />
        <Link to="/SignUp">
          <button className="greenBttn">SIGN UP </button>
        </Link>
      </div>
      <TranslateStraight /> {/* Invoke TranslateStraight */}
    </div>
  );
}

export default SignIn;
