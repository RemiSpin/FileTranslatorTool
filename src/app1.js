import React, { useState } from 'react';
import axios from 'axios';

function App1() {
    const [textToTranslate, setTextToTranslate] = useState('');
    const [translatedText, setTranslatedText] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await axios.post('http://localhost:5000/translate', { text_to_translate: textToTranslate });
        setTranslatedText(response.data.translated_text);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="text_to_translate" 
                    placeholder="Enter text to translate" 
                    value={textToTranslate} 
                    onChange={e => setTextToTranslate(e.target.value)}
                />
                <input type="submit" value="Translate" />
            </form>
            {translatedText && <p>Translated text: {translatedText}</p>}
        </div>
    );
}

export default App1;