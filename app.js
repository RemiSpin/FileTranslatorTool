import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/convert-html-to-docx', upload.single('htmlFile'), (req, res) => {
    try {
        const htmlFilePath = req.file.path;
        const docxFilePath = `${htmlFilePath}.docx`;
        const command = `pandoc -s ${htmlFilePath} -o ${docxFilePath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error converting HTML to DOCX:', error);
                res.status(500).send('Error converting HTML to DOCX');
                return;
            }

            if (!fs.existsSync(docxFilePath)) {
                res.status(404).send('DOCX file not found');
                return;
            }

            res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            const fileStream = fs.createReadStream(docxFilePath);
            fileStream.pipe(res);

            fileStream.on('close', () => {
                fs.unlinkSync(htmlFilePath);
                fs.unlinkSync(docxFilePath);
            });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(3001, () => console.log('Server started on port 3001'));
