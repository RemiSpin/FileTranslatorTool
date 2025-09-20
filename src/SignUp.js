import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import TranslateStraight from "./TranslateStraight.js";
import styles from "./styles/index.module.css";

function SignUp() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    credential: "",
    credentialPt2: "",
  });
  const navigate = useNavigate();
  const [passEr, setPasError] = useState("");
  const [confEr, setConfError] = useState("");
  const [emailEr, setEmailError] = useState("");

  const aiSpecialChar = (str) => {
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharRegex.test(str);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const emailPresent = async () => {
    // Validate email against the database
    const response = await axios.post("http://localhost:5000/emailcheck", {
      email: formData.email,
    });
    return response.data.exists;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (formData.credential !== formData.credentialPt2) {
      setConfError("Passwords do not match.");
      return;
    }
    if (formData.credential.length < 8) {
      setPasError("Password must be at least 8 characters long");
      return;
    }
    if (!aiSpecialChar(formData.credential)) {
      setPasError("Password must contain a special character");
      return;
    }

    // Validate email
    if (!isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Remove confirmPassword from formData
    const { credentialPt2, ...trimmedFormData } = formData;

    // Trim form data
    const trimmedData = {};
    for (const key in trimmedFormData) {
      trimmedData[key] = trimmedFormData[key].trim();
    }

    try {
      const emailExists = await emailPresent();
      if (emailExists) {
        setEmailError("This email address is already registered");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/signup",
        formData
      );
      alert("User registered successfully.");
      navigate("/Translate", { state: { user: response.data } });
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="row" id={styles.indexy}>
      <div className={`${"thirty"} ${styles.thirty}`} id={styles.signUp}>
        <h1>SIGN UP</h1>
        <form onSubmit={handleSubmit}>
          <p>First Name</p>
          <input
            type="text"
            name="first_name"
            placeholder="Jane"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <p>last Name</p>
          <input
            type="text"
            name="last_name"
            placeholder="Doe"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <p>Email</p>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
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
          <input
            type="password"
            name="credential"
            placeholder="8 Characters or More"
            value={formData.credential}
            onChange={handleChange}
            required
          />
          {passEr && (
            <p id="passEr" className={styles.error}>
              {passEr}
            </p>
          )}
          <p>Password Again!</p>
          <input
            type="password"
            name="credentialPt2"
            placeholder="Repeat Password Again"
            value={formData.credentialPt2}
            onChange={handleChange}
            required
          />
          {confEr && (
            <p id="confEr" className={styles.error}>
              {confEr}
            </p>
          )}
          <br />
          <br />
          <button type="submit" name="signUpSub" id="signUpBtn">
            SIGN UP
          </button>
        </form>
        <br />
        <div className={styles.other}>
          <hr />
          <span>OR</span>
          <hr />
        </div>
        <br />
        <Link to="/">
          <button className="greenBttn">SIGN IN</button>
        </Link>
      </div>
      {TranslateStraight()} {/* Invoke TranslateStraight */}
    </div>
  );
}

export default SignUp;
