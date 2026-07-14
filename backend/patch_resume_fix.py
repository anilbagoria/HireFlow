from pathlib import Path
path = Path('controllers/user.controller.js')
text = path.read_text()
old = '''        const { fullname, email, phoneNumber, bio, skills } = req.body;
        
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: "Resume file is required.",
                success: false
            });
        }
        if (!isCloudinaryConfigured) {
            return res.status(500).json({
                message: "Cloudinary is not configured. Set CLOUD_NAME, API_KEY, and API_SECRET or their CLOUDINARY_* equivalents.",
                success: false
            });
        }
        // cloudinary ayega idhar
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



        let skillsArray;'''
new = '''        const { fullname, email, phoneNumber, bio, skills } = req.body;
        
        const file = req.file;
        if (!isCloudinaryConfigured) {
            return res.status(500).json({
                message: "Cloudinary is not configured. Set CLOUD_NAME, API_KEY, and API_SECRET or their CLOUDINARY_* equivalents.",
                success: false
            });
        }

        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file);
            const uploadOptions = {};
            if (file.mimetype === "application/pdf" || file.originalname?.toLowerCase().endsWith('.pdf')) {
                uploadOptions.resource_type = "raw";
            }
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, uploadOptions);
        }



        let skillsArray;'''
old2 = '''        if(cloudResponse){
            user.profile.resume = cloudResponse.secure_url // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname // Save the original file name
        }
'''
new2 = '''        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname; // Save the original file name
        }
'''
if old not in text:
    raise SystemExit('Old text not found')
text = text.replace(old, new, 1)
if old2 not in text:
    raise SystemExit('Old2 text not found')
text = text.replace(old2, new2, 1)
path.write_text(text)
print('patched')
