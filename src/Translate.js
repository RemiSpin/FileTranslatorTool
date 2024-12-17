import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Link } from "react-router-dom";
import "./styles/teamP.css";
import styles from "./styles/translate.module.css";

function Translate() {
    const [file, setFile] = useState(null);
    const [translatedText, setTranslatedText] = useState("");
    const [uploadOptionText, setUploadOptionText] = useState("Upload Document");
    const [srcLang, setSrcLang] = useState("auto");
    const [destLang, setDestLang] = useState("English");
    const fileInput = useRef(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isTranslated, setIsTranslated] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [usersName, setUsersName] = useState("");
	const [userId, setUserId] = useState("");
	const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

	//Stored session variable in token
	useEffect(() => {
		console.log(isLoggedIn);
        const token = localStorage.getItem('token');
		if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.user_id);
        }
    }, []);
	useEffect(() => {
		console.log(userId);
		if (userId !== undefined && userId !== null) {
			setIsLoggedIn(true);
			fetchUsersName(userId);
		}
	}, [userId]);

	//Gets the name of the user
	const fetchUsersName = async (userId) => {
        try {
            const response = await axios.post('http://localhost:5000/getname', { userId });
            const userData = response.data;
            setUsersName(userData.name);
			console.log(userData.name)
			setLoading(false)
        } catch (error) {
            console.error(error);
			setError(error.message);
              setLoading(false);
        }
    };

	//Basically made converting the html back to a file part general so it could be used in the upload code
	//Moved the Mime thing here
	const getMimeTypeAndExtension = (fileType) => {
        let mimeType, extension;
		switch (fileType) {
			case 'text/plain':
				mimeType = 'text/plain';
				extension = '.txt';
				break;
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
				extension = '.docx';
				break;
			case 'application/vnd.ms-excel':
			case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
				extension = '.xlsx';
				break;
			case 'application/pdf':
				mimeType = 'application/pdf';
				extension = '.pdf';
				break;
			default:
				throw new Error(`Unknown file type: ${fileType}`);
		}
        return { mimeType, extension };
    };

	//Also made the creation of a Blob generalized
    const createBlob = (data, mimeType) => {
        return new Blob([data], { type: mimeType });
    };

    const convertToDoc = async (type, mimeType) => {
        switch (type) {
            case "doc":
                const blob = createBlob(translatedText, mimeType);
                const formData = new FormData();
                formData.append('htmlFile', blob);
                const response = await fetch("http://localhost:3001/convert-html-to-docx", {
                    method: "POST",
                    body: formData
                });
                if (!response.ok) {
                    throw new Error("Failed to convert HTML to DOCX.");
                }
                return await response.blob();
            case "excel":
                const workbook = XLSX.read(translatedText, { type: 'string' });
                const excelBlob = createBlob(XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }), mimeType);
                return excelBlob;
            case "pdf":
                const pdfDoc = await PDFDocument.create();
                const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                const page = pdfDoc.addPage();
                const { height } = page.getSize();
                const fontSize = 12;
                page.drawText(translatedText, {
                    x: 50,
                    y: height - 4 * fontSize,
                    size: fontSize,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
                const pdfBytes = await pdfDoc.save();
                const pdfBlob = createBlob(pdfBytes, mimeType);
                return pdfBlob;
            case "text":
                const textBlob = createBlob(translatedText, mimeType);
                return textBlob;
            default:
                throw new Error("Invalid conversion type.");
        }
    };

	const handleUpload = async() =>{
		const { mimeType, extension } = getMimeTypeAndExtension(file.type);
        try {
            let type;
            let blobResponse;
            if (extension === '.docx') {
                type = "doc";
            } else if (extension === '.xlsx') {
                type = "excel";
            } else if (extension === '.pdf') {
                type = "pdf";
            } else if (extension === '.txt') {
                type = "text";
            }
            blobResponse = await convertToDoc(type, mimeType);
			const formData = new FormData();
			formData.append("ogfile", file);
			formData.append("srcLang", srcLang);
			formData.append("destLang", destLang);
			formData.append("transFile",blobResponse)
			formData.append("userId", userId);
			const response = await axios.post('http://localhost:5000/upload', formData);
			alert(response.data.message);
		}catch (error) {
            console.error(error);
            alert("File could not be uploaded");
        }
	}

    const handleDone = async () => {
        const { mimeType, extension } = getMimeTypeAndExtension(file.type);
        try {
            let type;
            let blobResponse;
            if (extension === '.docx') {
                type = "doc";
            } else if (extension === '.xlsx') {
                type = "excel";
            } else if (extension === '.pdf') {
                type = "pdf";
            } else if (extension === '.txt') {
                type = "text";
            }
            blobResponse = await convertToDoc(type, mimeType);
            saveAs(blobResponse, `Translated_${file.name.replace('.html', extension)}`); // Not sure if needed
        } catch (error) {
            console.error(error);
            alert("Error occurred during conversion.");
        }
    };
  
    const handleFileSelect = (e) => {
      if (e.target.files.length > 0) {
        setFile(e.target.files[0]);
        setUploadOptionText(`Upload Document - ${e.target.files[0].name}`);
        setIsTranslated(false);
      }
    };

	const handleTranslate = async () => {
		if (!file) {
			alert("Please select a file first.");
			return;
		}
		const formData = new FormData();
		formData.append("file", file);
		formData.append("srcLang", srcLang);
		formData.append("destLang", destLang);

		setIsTranslating(true);

		try {
			const response = await fetch("http://localhost:5000/translate", {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				alert("Failed to translate file.");
				setIsTranslating(false);
				return;
			}

			const data = await response.json();
			console.log(data);
			setTranslatedText(data.translated_text);
			setIsTranslated(true);
		} catch (error) {
			console.error(error);
		} finally {
			setIsTranslating(false);
		}
	};

	const handleDocUploadChange = (event) => {
		if (event.target.value.startsWith("Upload Document")) {
			fileInput.current && fileInput.current.click();
		}
	};

	const swapLanguages = () => {
		const temp = srcLang;
		setSrcLang(destLang);
		setDestLang(temp);
	};

	if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

	return (
		<div>
		<header>
			<svg className={`${"drip"} ${styles.drip}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
				<path
					fill="#36845c"
					fillOpacity="1"
					d="M0,96L48,128C96,160,192,224,288,224C384,224,480,160,576,138.7C672,117,768,139,864,165.3C960,192,1056,224,1152,234.7C1248,245,1344,235,1392,229.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
				></path>
			</svg>
			<div className="row header">
				<div className={`${"fifty"} ${styles.fifty}`}>
					<h1 className="active">TRANSLATE</h1>
				</div>
				<div className={`${"fifty"} ${styles.fifty}`}>
					<Link to="/Statistics">
					<h1 className="unactive">STATISTICS</h1>
					</Link>
				</div>
			</div>
			<div id="logo">
				<Link to="/">
					<img src="/assets/logoc.png" alt="Logo" />
				</Link>
			</div>
		</header>
		
		<div className="content">
		{isLoggedIn && usersName ? (<p className="identifier">Welcome {usersName}!</p>) : (<p className="identifier"></p>)}
			<div className="row">
				<div className="thirty">
					<select className={styles.lan} value={srcLang} onChange={(e) => setSrcLang(e.target.value)}>
						<option value="auto">Detect Language</option>
						<option value="English">English</option>
						<option value="Romanian">Romanian</option>
						<option value="German">German</option>
						<option value="Spanish">Spanish</option>
						<option value="French">French</option>
						<option value="Italian">Italian</option>
						<option value="Dutch">Dutch</option>
						<option value="Portugese">Portuguese</option>
						<option value="Russian">Russian</option>
						<option value="Japanese">Japanese</option>
					</select>
				</div>
				<div className="thirty">
					<img id={styles.switch} src="/assets/switch.png" alt="Switch" onClick={swapLanguages}/>
				</div>
				<div className="thirty">
					<select className={styles.lan} value={destLang} onChange={(e) => setDestLang(e.target.value)}>
						<option value="English">English</option>
						<option value="Romanian">Romanian</option>
						<option value="German">German</option>
						<option value="Spanish">Spanish</option>
						<option value="French">French</option>
						<option value="Italian">Italian</option>
						<option value="Dutch">Dutch</option>
						<option value="Portugese">Portuguese</option>
						<option value="Russian">Russian</option>
						<option value="Japanese">Japanese</option>
					</select>
				</div>
			</div>
			<div>
<button onClick={() => fileInput.current.click()} style={{ display: 'inline-block', padding: '6px 12px', marginBottom: '0', fontSize: '14px', fontWeight: '400', lineHeight: '1.42857143', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle', cursor: 'pointer', backgroundImage: 'none', border: '1px solid transparent', borderRadius: '4px', color: '#333', backgroundColor: '#fff', borderColor: '#ccc', width: 'auto', marginTop: '10px' }}>
    {uploadOptionText}
    <span style={{ display: 'inline-block', width: '0', height: '0', marginLeft: '5px', verticalAlign: 'middle', borderTop: '4px dashed', borderTopColor: '#000', borderRight: '4px solid transparent', borderLeft: '4px solid transparent' }}></span>
</button>
<input type="file" ref={fileInput} style={{ display: "none" }} accept=".doc,.docx,.pdf,.txt,.xls,.xlsx" onChange={handleFileSelect}/>
		</div>
		<button id={styles.translateBttn} onClick={handleTranslate}> TRANSLATE! </button>
			<br />
			{isTranslated && isLoggedIn && <img  id={styles.uploadBttn} src="/assets/upload.png" alt="Upload" onClick={handleUpload}/>}
			<textarea id="docTrans" className={styles.docTrans} value={translatedText} readOnly/>
			{file ? (isTranslating ? (<p style={{ marginTop: "30px" }}>Translating file...</p>) : (isTranslated && (<button style={{ marginTop: "20px" }} onClick={handleDone}> DOWNLOAD!</button>))) : null}
		</div>
		</div>
	);
}

export default Translate;