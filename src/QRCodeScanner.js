import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import './QRCodeScanner.css';

const QRCodeScanner = () => {
    const videoRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() =>{
        const scanQRCode = () => {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            if (!video) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');

            const checkQRCode = () => {
                if (!isScanning) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        if (code.data === 'https://example.com/servo=1') {
                            setIsScanning(true);  
                            console.log('Calling service endpoint...');
                            callServiceEndpoint('https://example.com/servo=1');
                            alert('Activate motor');
                            
                            setTimeout(() => {
                                callServiceEndpoint('https://example.com/servo=0');
                                alert('Deactivate motor');
                            }, 5000);
                        }
                    } else {
                        setIsScanning(false);  
                    }
                    requestAnimationFrame(checkQRCode);
                }
            };

            checkQRCode();
        }
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    video.onloadedmetadata = () => {
                        video.play()
                          .then(() => {
                            console.log('Scanning started');
                            scanQRCode(); 
                          })
                          .catch(e => console.error('Error during video play:', e));
                    };
                }
            } catch (error) {
                console.error('Error accessing the camera:', error);
            }
        };

        startVideo();
    }, [isScanning]);

    const callServiceEndpoint = (url) => {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                console.log('Response from server:', data);
            })
            .catch(error => console.error('Error on initial call:', error));
    };

    return (
        <div className="scanner-container">
            <h1 className="scanner-title">Scan QR Code</h1>
            <div className="video-wrapper">
                <video ref={videoRef} playsInline className="scanner-video"></video>
            </div>
        </div>
    );
};

export default QRCodeScanner;
