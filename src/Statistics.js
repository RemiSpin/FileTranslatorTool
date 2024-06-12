import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "./styles/teamP.css";
import styles from "./styles/statistics.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function Statistics() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [aiData, setaiData] = useState(false);
    const [userId, setUserId] = useState("");
    const [tableData, setTableData] = useState([]);
    const [languageStats, setLanguageStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.user_id);
                setIsLoggedIn(true);
            } catch (e) {
                console.error("Invalid token:", e);
            }
        } else {
            setLoading(false); // No token, stop loading
        }
    }, []);

    useEffect(() => {
        const fetchData = async (userId) => {
            try {
                const response = await axios.post('http://localhost:5000/populate', { userId }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (Array.isArray(response.data) && response.data.length > 0) {
                    setaiData(true);
                    setTableData(response.data);
                    calculateLanguageStats(response.data);
                } else {
                    setaiData(false);
                    setTableData([]);
                }
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        if (userId) {
            fetchData(userId);
        } else {
            setLoading(false); // No user ID, stop loading
        }
    }, [userId]);

    const calculateLanguageStats = (data) => {
        const languageCount = {};
        data.forEach(row => {
            row.Item.split(',').forEach(lang => {
                if (languageCount[lang]) {
                    languageCount[lang]++;
                } else {
                    languageCount[lang] = 1;
                }
            });
        });
        setLanguageStats(languageCount);
    };

    const handleDownload = async (key, item) => {
        try {
            const response = await axios.post('http://localhost:5000/download', { key, item, userId }, {
                responseType: 'blob', // Ensure the response type is set to blob
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const fileExtension = key.split('.').pop();
            const baseName = key.replace(`.${fileExtension}`, '');
            const languagePart = item === 'none' ? '' : `_${item}`;
            const filename = `${baseName}${languagePart}.${fileExtension}`;

            saveAs(blob, filename);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const pieData = {
        labels: Object.keys(languageStats),
        datasets: [
            {
                label: 'Language Distribution',
                data: Object.values(languageStats),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FFCD56',
                ],
            },
        ],
    };

    return (
        <div>
            <header>
                <svg className="drip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path
                        fill="#36845c"
                        fillOpacity="1"
                        d="M0,96L48,128C96,160,192,224,288,224C384,224,480,160,576,138.7C672,117,768,139,864,165.3C960,192,1056,224,1152,234.7C1248,245,1344,235,1392,229.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    ></path>
                </svg>
                <div className='row header'>
                    <div className={`${'fifty'} ${styles.fifty}`}>  
                        <Link to="/Translate"><h1 className={`${'unactive'} ${styles.unactive}`}>TRANSLATE</h1></Link>   
                    </div>
                    <div className={`${'fifty'} ${styles.fifty}`}>
                        <Link to="/Statistics"><h1 className={`${'active'} ${styles.active}`}>STATISTICS</h1></Link>
                    </div>
                </div>
                <div id='logo'>
                    <Link to="/"><img src="/assets/logoc.png" alt="Logo" /></Link>
                </div>
            </header>

            <div className={`${'content'} ${styles.content}`}>
                {isLoggedIn ? (
                    aiData ? (
                        <div className={styles.statisticsContainer}>
                            <div className={styles.translateHistory}>
                                <h2>Translate History</h2>
                                <p>Click on the file name or available languages to download your files!</p>
                                <br />
                                <br />
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th className={styles.fcolumn}>Available Files</th>
                                            <th className={styles.lcolumn}>Translated Languages</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(tableData) && tableData.map((row, index) => (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td onClick={() => handleDownload(row.Key, 'none')} className={styles.transFile}>{row.Key}</td>
                                                    <td className={styles.transDownload}>
                                                        {row.Item.split(',').map((item, itemIndex) => (
                                                            <div className={styles.transLanguages} key={itemIndex} onClick={() => handleDownload(row.Key, item)}>{item}</div>
                                                        ))}
                                                    </td>
                                                </tr>
                                                {index !== tableData.length - 1 && (
                                                    <tr key={`${index}-separator`}>
                                                        <td colSpan="2" className={styles.filler}></td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={styles.pieChartContainer}>
                                <h3>Language Distribution</h3>
                                <Pie data={pieData} />
                            </div>
                        </div>
                    ) : (
                        <p>It looks like you have no data yet. Start translating to save your data!</p>
                    )
                ) : (
                    <p>Please sign in to view saved files</p>
                )}
            </div>
        </div>
    );
}

export default Statistics;
