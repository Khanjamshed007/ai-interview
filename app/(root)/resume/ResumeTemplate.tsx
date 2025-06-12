'use client';
import React, { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa';

const ResumeTemplate = ({ user }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState(null); // For success/error messages
    const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage(null); // Clear previous messages
            simulateUpload();
        }
    };

    const simulateUpload = () => {
        setUploadProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            setUploadProgress(progress);
        }, 200);
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);
            formData.append('userId', user?.id);

            const response = await fetch('http://localhost:3000/api/vapi/genrate', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Resume processed successfully! Interview questions generated.',
                });
                // Optionally reset the form
                setSelectedFile(null);
                setUploadProgress(0);
                fileInputRef.current.value = null;
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to process resume. Please try again.',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'An error occurred while submitting the resume.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="max-w-xl w-full border border-gray-300 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-primary-100">Upload your resume</h2>
                <p className="text-gray-600 mt-1">
                    Help us get to know you better by sharing your resume.
                </p>

                <div
                    onClick={handleClick}
                    className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition"
                >
                    <div className="text-4xl mb-2"><FaUpload /></div>
                    <p className="font-medium text-gray-700">Drag your resume here or click to upload</p>
                    <p className="text-sm text-gray-500 mt-1">Acceptable file types: PDF (5MB max)</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {selectedFile && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-800 font-medium">Selected file:</p>
                        <p className="text-sm text-gray-600 truncate">{selectedFile.name}</p>

                        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>

                        {uploadProgress === 100 && (
                            <p className="text-green-600 text-sm mt-1">Upload complete!</p>
                        )}
                    </div>
                )}

                {message && (
                    <div className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex items-center justify-center">
                    <button
                        className={`btn-primary mt-6 text-center pl-10 pr-10 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedFile || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeTemplate;