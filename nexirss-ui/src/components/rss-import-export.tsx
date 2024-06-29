import React, { useState } from 'react';
import {
    Button,
    Box,
    Typography,
    Snackbar
} from '@mui/material';
import apiClient from "../api-client/api";

const RSSFeedImporterExporter: React.FC = () => {
    const [importFile, setImportFile] = useState<File | null>(null);
    const [exportSnackbarOpen, setExportSnackbarOpen] = useState(false);
    const [importSnackbarOpen, setImportSnackbarOpen] = useState(false);
    const [importErrorMessage, setImportErrorMessage] = useState('');

    const handleExport = async () => {
        try {
            const response = await apiClient.get('export', {
                responseType: 'blob' // Ensure response is treated as a blob (file)
            });

            const blob = new Blob([response.data], { type: 'text/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exported-rss.xml';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Show success snackbar
            setExportSnackbarOpen(true);
        } catch (error) {
            console.error('Error exporting RSS feed:', error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setImportFile(event.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!importFile) return;

        try {
            // Read the file content
            const fileReader = new FileReader();
            fileReader.onload = async (event) => {
                if (event.target) {
                    // Convert ArrayBuffer to UTF-8 string
                    const fileContents = new TextDecoder().decode(event.target.result as ArrayBuffer);

                    // Prepare form data with the file content
                    const formData = new FormData();
                    formData.append('opml', fileContents);

                    // Send POST request to import endpoint
                    await apiClient.post('import', {xml: fileContents}, {
                    });

                    // Clear file state and show success snackbar
                    setImportFile(null);
                    setImportSnackbarOpen(true);
                }
            };

            // Read file as ArrayBuffer
            fileReader.readAsArrayBuffer(importFile);
        } catch (error) {
            // Handle import error
            if (error.response?.data?.message) {
                setImportErrorMessage(error.response.data.message);
            } else {
                setImportErrorMessage('An error occurred during import.');
            }
            setImportSnackbarOpen(true);
        }
    };

    const handleExportSnackbarClose = () => {
        setExportSnackbarOpen(false);
    };

    const handleImportSnackbarClose = () => {
        setImportSnackbarOpen(false);
    };

    return (
        <Box sx={{ mt: 2 }}>
            {/*<Typography variant="h5" gutterBottom>*/}
            {/*    RSS Feed Importer / Exporter*/}
            {/*</Typography>*/}
            <Box sx={{ display: 'flex', gap: '10px' }}>
                <Button variant="contained" color="primary" onClick={handleExport}>
                    Export
                </Button>
                <Button variant="contained" color="primary" component="label">
                    Import
                    <input
                        type="file"
                        accept=".opml"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleImport}
                    disabled={!importFile}
                >
                    Upload
                </Button>
            </Box>
            <Snackbar
                open={exportSnackbarOpen}
                autoHideDuration={6000}
                onClose={handleExportSnackbarClose}
                message="RSS feed exported successfully!"
            />
            <Snackbar
                open={importSnackbarOpen}
                autoHideDuration={6000}
                onClose={handleImportSnackbarClose}
                message={importErrorMessage || "RSS feed imported successfully!"}
            />
        </Box>
    );
};

export default RSSFeedImporterExporter;
