const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: "gs://loan-galaxy.appspot.com"
});

exports.uploadFile = async (file, filepath, fileName) => {
	try {
		const bucket = admin.storage().bucket();
		const fileUpload = bucket.file(`${filepath}/${fileName}`);
		const stream = fileUpload.createWriteStream({
			metadata: {
				contentType: file.mimetype,
			},
		});
		stream.on("error", (err) => {
			throw err;
		});
		stream.on("finish", () => {
			console.log("file uploaded");
		});
		stream.end(file.buffer);
		return `${filepath}/${fileName}`;
	} catch (error) {
		console.log(error);
	}
};
exports.fetchFile = async (filepath) => {
	try {
		const bucket = admin.storage().bucket();
		const file = bucket.file(`${filepath}`);
		const url = await file.getSignedUrl({
			action: "read",
			expires: "03-09-2491",
		});
		return url[0];
	} catch (error) {
		console.log(error);
		return "";
	}
};
exports.deleteFile = async (filepath) => {
	try {
		const bucket = admin.storage().bucket();
		const file = bucket.file(`${filepath}`);
		await file.delete();
		return true;
	} catch (error) {
		return false;
	}
}