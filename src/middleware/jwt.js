const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || 'SJNKJNSKAN';

module.exports = (req, res, next) => {
    let token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Access Denied" });
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trimLeft();
    }
    try {
        const verified = jwt.verify(token, secret);
        req.user = verified; 
    
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access Denied. Admins only." });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};
