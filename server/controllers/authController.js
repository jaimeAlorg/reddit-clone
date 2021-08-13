const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
    try {
        const { email, password, passwordCheck, username } = req.body;

        //Validations
        if (![email, password, passwordCheck, username].every(Boolean)) {
            return res
                .status(400)
                .json({ msg: "Not all fields have been entered" });
        }

        const inputEmail = await pool.query(
            "SELECT EMAIL FROM USERS WHERE EMAIL = $1",
            [email]
        );

        const inputUsername = await pool.query(
            "SELECT USERNAME FROM USERS WHERE USERNAME = $1",
            [username]
        );

        if (inputEmail.rows.length > 0) {
            res.status(401).json(`The email ${email} is already in use`);
        } else if (inputUsername.rows.length > 0) {
            res.status(401).json(`The username ${username} already in use`);
        }

        if (password.length < 8) {
            return res
                .status(401)
                .json("Password length needs to be at least 8 characters long");
        }

        if (password !== passwordCheck) {
            return res
                .status(401)
                .json("Password is not equal to password check");
        }

        //Password hash
        const salt = await bcrypt.genSalt();
        const passwordHashed = await bcrypt.hash(password, salt);

        //Save user
        const newUser = await pool.query(
            "INSERT INTO USERS(EMAIL, PASSWORD, USERNAME) VALUES ($1, $2, $3)",
            [email, passwordHashed, username]
        );

        console.log(newUser.rows[0]._id);

        //JWT
        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                email: newUser.rows[0].email,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Validations
        if (![email, password].every(Boolean)) {
            return res
                .status(400)
                .json({ msg: "Not all fields have been entered" });
        }

        const user = await pool.query("SELECT * FROM USERS WHERE EMAIL = $1", [
            email,
        ]);

        if (user.rows.length === 0) {
            res.status(401).json(`Incorrect email`);
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        console.log(user.rows[0]);

        if (!passwordMatch) {
            res.status(401).json(`Incorrect password`);
        }

        //JWT
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, logIn };
