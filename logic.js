// Image compression function
function compressImage() {
    const fileInput = document.getElementById('uploadFile');
    const compressSize = document.getElementById('compressSize').value;
    const downloadLink = document.getElementById('downloadLink');

    if (fileInput.files.length === 0 || compressSize === "") {
        alert("Please upload a file and choose a compression size.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    // Load the image file
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions same as the image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Calculate compression ratio based on the desired file size
            const maxSizeInBytes = compressSize * 1024;  // Convert KB to bytes
            let quality = 1.0;

            // Perform binary search to find the best quality for the given size
            function compressAndCheckSize() {
                return new Promise((resolve, reject) => {
                    // Compress the image using the canvas toBlob function
                    canvas.toBlob(
                        (blob) => {
                            if (blob.size <= maxSizeInBytes) {
                                resolve(blob);  // Image size is acceptable
                            } else if (quality > 0.1) {
                                quality -= 0.05;  // Reduce quality for smaller file size
                                resolve(null);
                            } else {
                                reject("Unable to compress to the desired size.");
                            }
                        },
                        'image/jpeg',  // You can also use 'image/png'
                        quality
                    );
                });
            }

            async function processCompression() {
                try {
                    let blob;
                    do {
                        blob = await compressAndCheckSize();
                    } while (!blob);

                    // Create a downloadable link for the compressed image
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.style.display = 'inline';
                } catch (error) {
                    alert(error);
                }
            }

            processCompression();
        };
    };

    reader.readAsDataURL(file);
}
