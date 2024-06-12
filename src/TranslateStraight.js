import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import styles from './styles/index.module.css'; 

function TranslateStraight(){
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;
        console.log(userId);
        localStorage.removeItem('token');
    } else {
        console.log('No token found in local storage');
    }
}, []);
    return(
      <div className={styles.seventy}>
        <div id={styles.skip}>
			    <Link to="/Translate"><h1 id="translate">Translate Now</h1></Link>
        </div>
      </div>
    );
  }

  export default TranslateStraight;