'use client';
import React, { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa';

const ResumeTemplate = ({ user }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
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

    const handleSubmit = () => {
        // Handle form submission here
        console.log('Selected file:', selectedFile);
        const formData = new FormData();
        formData.append('resume', selectedFile);
        formData.append('userId', user.id);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

        fetch(`${apiBaseUrl}/api/vapi/resume`, {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

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
                    <p className="text-sm text-gray-500 mt-1">Acceptable file types: PDF, DOCX (5MB max)</p>
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
                <div className='flex items-center justify-center'>
                    <button
                        className="btn-primary mt-6 text-center pl-10 pr-10"
                        disabled={!selectedFile}
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeTemplate;
