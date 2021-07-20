const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const fetch = require("node-fetch");
const jwtDecode = require("jwt-decode");
const { isValidObjectId } = require("mongoose");
require("dotenv/config");


const secret = process.env.SECRET;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function loginCheck(req, res) {
	const code = req.body.code;

	fetch("https://accounts.google.com/.well-known/openid-configuration") //opc.
		.then((res) => res.json())
		.then((data) => {
			const fetchOptions = {
				method: "POST",
				headers: {
					"Content-type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					code: code,
					client_id: clientId,
					client_secret: clientSecret,
					redirect_uri: "http://localhost:3000/login",
					grant_type: "authorization_code",
				})
			};

			fetch(data.token_endpoint, fetchOptions)
				.then((res) => res.json())
				.then((data) => {
					userCheck(data, res);
				})
				.catch((err) =>
					res.status(403).json({ msg: "Authentication failed." })
				);
		});
};

async function userCheck(data, res) {
	const { sub, name, email } = jwtDecode(data.id_token);

	const foundUser = await authService.getUser(email);
	if (!foundUser) {
		const newUser = {
			name: name,
			email: email,
			sub: sub
		};
		console.log(newUser);
		await authService.addUser(newUser);
	}

	jwt.sign(
		{
			sub: sub,
			name: name,
			email: email
		},
		secret,
		// { expiresIn: "1h" },
		function (err, token) {
			res.json({ token: token });
		}
	);
}

module.exports = { loginCheck, secret };