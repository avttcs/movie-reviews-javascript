const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const token = req.headers.authorization.split(" ")[1];

	jwt.verify(token, process.env.SECRET, (err, decoded) => {
		if (err) {
			console.log("Credential error: ", err);
			return res.status(403).json({ error: "No credentials sent!" });
		}

		req.token = decoded;
		next();
	});
};