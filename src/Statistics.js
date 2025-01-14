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
    const [showTeamDialog, setShowTeamDialog] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamId, setTeamId] = useState(null);
    const [joinTeamId, setJoinTeamId] = useState('');

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

    useEffect(() => {
        const checkTeamMembership = async () => {
            if (userId) {
                try {
                    const response = await axios.post('http://localhost:5000/check-team', {
                        userId
                    });
                    if (response.data.teamId) {
                        setTeamId(response.data.teamId);
                    }
                } catch (error) {
                    console.error('Error checking team membership:', error);
                }
            }
        };

        checkTeamMembership();
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

    const handleCreateTeam = async () => {
        try {
            const response = await axios.post('http://localhost:5000/create-team', {
                teamName,
                userId
            });
            setTeamId(response.data.teamId);
            setShowTeamDialog(false);
            alert('Team created successfully!');
        } catch (error) {
            console.error('Error creating team:', error);
            alert('Error creating team');
        }
    };

    const handleJoinTeam = async () => {
        try {
            await axios.post('http://localhost:5000/join-team', {
                teamId: joinTeamId,
                userId
            });
            setTeamId(joinTeamId);
            setShowTeamDialog(false);
            alert('Joined team successfully!');
        } catch (error) {
            console.error('Error joining team:', error);
            alert(error.response?.data?.message || 'Error joining team');
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
                            {!teamId ? (
                                <button onClick={() => setShowTeamDialog(true)} className={styles.teamButton}>
                                    Create/Join Team
                                </button>
                            ) : (
                                <div className={styles.teamStatus}>
                                    <p>Team Member - ID: {teamId}</p>
                                    <button 
                                        onClick={async () => {
                                            // Add confirmation dialog
                                            if (window.confirm('Are you sure you want to leave this team?')) {
                                                try {
                                                    await axios.post('http://localhost:5000/leave-team', {
                                                        userId
                                                    });
                                                    setTeamId(null);
                                                    alert('Left team successfully!');
                                                } catch (error) {
                                                    console.error('Error leaving team:', error);
                                                    alert(error.response?.data?.message || 'Error leaving team');
                                                }
                                            }
                                        }}
                                        className={styles.leaveTeamButton}
                                    >
                                        Leave Team
                                    </button>
                                </div>
                            )}

                            {showTeamDialog && (
                                <div className={styles.teamDialog}>
                                    <button 
                                        className={styles.closeButton}
                                        onClick={() => setShowTeamDialog(false)}
                                    >
                                        ×
                                    </button>
                                    <h3>Team Options</h3>
                                    
                                    <div className={styles.teamDialogSection}>
                                        <h4>Create New Team</h4>
                                        <input
                                            type="text"
                                            placeholder="Enter team name"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className={styles.teamDialogInput}
                                        />
                                        <button 
                                            onClick={handleCreateTeam}
                                            className={styles.teamDialogButton}
                                        >
                                            Create Team
                                        </button>
                                    </div>

                                    <div className={styles.teamDialogSection}>
                                        <h4>Join Existing Team</h4>
                                        <input
                                            type="text"
                                            placeholder="Enter team ID to join"
                                            className={styles.teamDialogInput}
                                            value={joinTeamId}
                                            onChange={(e) => setJoinTeamId(e.target.value)}
                                        />
                                        <button 
                                            className={styles.teamDialogButton}
                                            onClick={handleJoinTeam}
                                        >
                                            Join Team
                                        </button>
                                    </div>
                                </div>
                            )}
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
